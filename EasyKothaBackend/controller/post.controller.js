import { prisma } from "../lib/prisma.js";
import { sendEmail } from "../utils/email.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import {
  postPendingTemplate,
  postApprovedTemplate,
  postRejectedTemplate,
} from "../utils/emailtemplates/postTemplates.js";
import { getSimilarPostIds } from "../utils/recommendation.js";

const emitNotification = (userId, payload) => {
  const receiverSocketId = getReceiverSocketId(userId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("notification", payload);
  }
};

/**
 * Creates a new property listing.
 * The listing is saved immediately and returned to the user.
 * Email alerts are sent after response so slow email servers do not freeze submit buttons.
 */
export const createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      purpose,
      furnishing,
      tenantType,
      genderPreference,
      price,
      district,
      city,
      address,
      images,
    } = req.body;

    const normalizedCity = String(city || "").trim();
    const normalizedDistrict = String(district || normalizedCity || "N/A").trim();

    /** Required fields for a valid listing submission. */
    if (!title || !price || !normalizedCity) {
      return res.status(400).json({
        success: false,
        message: "Title, price and city are required",
      });
    }

    const savedPost = await prisma.post.create({
      data: {
        title,
        content,
        type,
        purpose,
        furnishing,
        tenantType,
        genderPreference,
        price: Number(price),
        district: normalizedDistrict,
        city: normalizedCity,
        address,
        images,
        authorId: Number(req.user.id),
        status: "pending",
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    const pendingPayload = {
      id: `post-pending-${savedPost.id}-${Date.now()}`,
      title: "New post pending approval",
      message: `${savedPost.title} was submitted and needs review`,
      type: "post-pending",
      link: "/admin/approvals",
      createdAt: new Date().toISOString(),
    };

    admins.forEach((admin) => emitNotification(admin.id, pendingPayload));

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: savedPost,
    });

    /** Send email notifications in the background. */
    Promise.resolve()
      .then(async () => {
        try {
          const user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });

          if (process.env.ADMIN_EMAIL) {
            await sendEmail({
              to: process.env.ADMIN_EMAIL,
              subject: "Post Created - Pending Approval",
              text: `The new post "${title}" has been created and is pending your approval.`,
            });
          }

          if (user && user.email) {
            await sendEmail({
              to: user.email,
              subject: "Post Created - Pending Approval",
              html: postPendingTemplate(savedPost),
            });
          }
        } catch (emailError) {
          console.error(
            "Email notification error in createPost:",
            emailError.message,
          );
        }
      })
      .catch(() => {
        /** The detailed email error is already logged in the block above. */
      });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
};

/**
 * Returns listing results with optional filters and pagination.
 */
export const getAllPosts = async (req, res) => {
  try {
    const { 
      search, 
      district, 
      city, 
      status, 
      type, 
      minPrice, 
      maxPrice, 
      sort,
      page = 1, 
      limit = 10 
    } = req.query;

    const where = {};

    if (district) {
      where.district = { contains: district, mode: "insensitive" };
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    let orderBy = { createdAt: "desc" };
    if (sort === "priceHighToLow") {
      orderBy = { price: "desc" };
    } else if (sort === "priceLowToHigh") {
      orderBy = { price: "asc" };
    } else if (sort === "latest") {
      orderBy = { createdAt: "desc" };
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      skip,
      take: Number(limit),
      orderBy,
    });

    const totalPosts = await prisma.post.count({ where });

    res.status(200).json({
      success: true,
      total: totalPosts,
      page: Number(page),
      pages: Math.ceil(totalPosts / Number(limit)),
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
};

/**
 * Returns details for one listing by id.
 */
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch post",
      error: error.message,
    });
  }
};

/**
 * Updates listing details.
 * Allowed for the listing owner and admins.
 */
export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = Number(req.user.id);
    const userRole = req.user.role;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.authorId !== userId && userRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const allowedUpdates = [
      "title",
      "content",
      "type",
      "purpose",
      "furnishing",
      "tenantType",
      "genderPreference",
      "price",
      "district",
      "city",
      "address",
      "images",
    ];

    const data = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "price") {
          data[field] = Number(req.body[field]);
        } else {
          data[field] = req.body[field];
        }
      }
    });

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data,
    });

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update post",
      error: error.message,
    });
  }
};

/**
 * Toggles a listing in the user's saved list.
 */
export const savePost = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const { postId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { savedPosts: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSaved = user.savedPosts.some(post => post.id === postId);

    let updatedUser;
    if (isSaved) {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          savedPosts: {
            disconnect: { id: postId }
          }
        },
        include: { savedPosts: true }
      });
    } else {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          savedPosts: {
            connect: { id: postId }
          }
        },
        include: { savedPosts: true }
      });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Returns all listings saved by the current user.
 */
export const getSavedPosts = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        savedPosts: {
          include: {
            author: {
              select: {
                name: true,
                profileImage: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user.savedPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved posts",
      error: error.message,
    });
  }
};

/**
 * Deletes a listing and related booking records.
 * Allowed for listing owner and admins.
 */
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = Number(req.user.id);
    const userRole = req.user.role;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    /** Access control: only the owner or admin can delete. */
    if (post.authorId !== userId && userRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    /** Remove related bookings first to keep data consistent. */
    await prisma.booking.deleteMany({ where: { postId } });

    /** Delete the listing record. */
    await prisma.post.delete({ where: { id: postId } });

    res.status(200).json({
      success: true,
      message: "Post and all associated data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete post",
      error: error.message,
    });
  }
};

export const updatePostStatus = async (req, res) => {
  try {
    const postId = req.params.id;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: { status },
      include: { author: { select: { id: true, email: true, name: true } } }
    });

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    const statusPayload = {
      id: `post-status-${post.id}-${Date.now()}`,
      title: "Post status updated",
      message: `${post.title} is ${status}`,
      type: "post-status",
      link: status === "approved" ? "/admin/properties" : "/admin/approvals",
      createdAt: new Date().toISOString(),
    };

    const recipients = new Set([post.author?.id, ...admins.map((admin) => admin.id)]);
    recipients.forEach((id) => {
      if (id !== undefined && id !== null) {
        emitNotification(id, statusPayload);
      }
    });

    /** Email is optional; listing status update should still succeed if email fails. */
    if (post.author && post.author.email) {
      try {
        await sendEmail({
          to: post.author.email,
          subject: `Your post "${post.title}" has been ${status}`,
          html:
            status === "approved"
              ? postApprovedTemplate(post)
              : postRejectedTemplate(post),
        });
      } catch (emailError) {
        console.error(
          `Email notification failed for post ${postId}:`,
          emailError.message,
        );
        /** Keep API successful even when email delivery fails. */
      }
    }

    res.status(200).json({
      success: true,
      message: `Post ${status} successfully`,
      post,
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update post status",
      error: error.message,
    });
  }
};

/**
 * Returns total number of listings.
 */
export const countPosts = async (req, res) => {
  try {
    const totalPosts = await prisma.post.count();
    res.status(200).json({
      success: true,
      totalPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to count posts",
      error: error.message,
    });
  }
};

/**
 * Returns number of listings waiting for admin review.
 */
export const countPendingPosts = async (req, res) => {
  try {
    const pendingPosts = await prisma.post.count({ where: { status: "pending" } });
    res.status(200).json({
      success: true,
      pendingPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to count pending posts",
      error: error.message,
    });
  }
};

/**
 * Returns number of approved listings.
 */
export const countApprovedPosts = async (req, res) => {
  try {
    const approvedPosts = await prisma.post.count({ where: { status: "approved" } });
    res.status(200).json({
      success: true,
      approvedPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to count approved posts",
      error: error.message,
    });
  }
};

/**
 * Returns the list of listing categories supported by the platform.
 */
export const getRoomTypes = async (req, res) => {
  try {
    const roomTypes = ["room", "flat", "house", "hostel", "pg", "shared_room", "office", "others"];
    res.status(200).json({
      success: true,
      data: roomTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch room types",
      error: error.message,
    });
  }
};

/**
 * Returns all listings created by the signed-in landlord.
 */
export const getLandlordPosts = async (req, res) => {
  try {
    const landlordId = Number(req.user.id);
    const posts = await prisma.post.findMany({ 
      where: { authorId: landlordId },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch landlord posts",
      error: error.message,
    });
  }
};

/**
 * Returns quick listing suggestions for search input.
 * Also stores the searched keyword for personalization.
 */
export const getPostSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    /** Saves the typed keyword for future suggestion history. */
    await prisma.searchLog.create({
      data: {
        keyword: query,
        userId: req.user ? Number(req.user.id) : null
      }
    });

    /** Suggests only approved listings that match the typed value. */
    const suggestions = await prisma.post.findMany({
      where: {
        status: "approved",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { district: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        title: true,
        district: true,
        city: true,
        price: true,
        images: true
      },
      take: 5
    });

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch suggestions",
      error: error.message
    });
  }
};

/**
 * Returns recent unique search keywords for the logged-in user.
 */
export const getRecentSearches = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const logs = await prisma.searchLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { keyword: true }
    });
    
    /** Keeps only unique keywords while ignoring letter case. */
    const uniqueKeywords = [];
    const seen = new Set();
    
    logs.forEach(log => {
      const lower = log.keyword.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueKeywords.push(log.keyword);
      }
    });

    res.status(200).json({
      success: true,
      data: uniqueKeywords.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent searches",
      error: error.message
    });
  }
};

/**
 * Returns similar approved listings for a selected listing id.
 */
export const getSimilarPosts = async (req, res) => {
  try {
    const { id } = req.params;

    const similarIds = getSimilarPostIds(id);

    if (!similarIds.length) {
      return res.json({ success: true, data: [] });
    }

    const posts = await prisma.post.findMany({
      where: {
        id: { in: similarIds },
        status: "approved"
      },
      include: {
        author: {
          select: { name: true, profileImage: true }
        }
      }
    });

    res.json({ success: true, data: posts });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Builds personalized recommendations from the user's saved listings.
 */
export const getUserRecommendations = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    /** Uses saved listings as the starting point for recommendations. */
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { savedPosts: true }
    });

    if (!user || user.savedPosts.length === 0) {
      return res.json({ success: true, data: [] });
    }

    let recommendedIds = new Set();

    user.savedPosts.forEach(post => {
      const similar = getSimilarPostIds(post.id);
      similar.forEach(id => recommendedIds.add(id));
    });

    const posts = await prisma.post.findMany({
      where: {
        id: { in: Array.from(recommendedIds) },
        status: "approved"
      },
      take: 10
    });

    res.json({ success: true, data: posts });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
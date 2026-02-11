import { prisma } from "../lib/prisma.js";
import { sendEmail } from "../utils/email.js";
import {
  postPendingTemplate,
  postApprovedTemplate,
  postRejectedTemplate,
} from "../utils/emailTemplates/postTemplates.js";

//create post
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

    // Basic validation
    if (!title || !price || !city || !district) {
      return res.status(400).json({
        success: false,
        message: "Title, price, city and district are required",
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
        district,
        city,
        address,
        images,
        authorId: Number(req.user.id),
        status: "pending",
      },
    });

    // Attempt to send email notifications without blocking the response
    try {
      const user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });

      // Notify Admin
      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: "Post Created - Pending Approval",
          text: `The new post "${title}" has been created and is pending your approval.`,
        });
      }

      // Notify User
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
      // We continue since the post is already saved successfully
    }

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: savedPost,
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

//get all posts with filters and pagination
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
            name: true,
            email: true,
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

//get post by id
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
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

//update post
export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = Number(req.user.id);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.authorId !== userId) {
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

//save the posts
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

// get saved posts
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

//delete post
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

    // Allow deletion if the user is the author OR an ADMIN
    if (post.authorId !== userId && userRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Prisma handles cascading or we do it manually if needed.
    // In schema.prisma, there are no explicit onDelete: Cascade, 
    // but Booking model refers to Post.
    
    // 1. Delete associated bookings
    await prisma.booking.deleteMany({ where: { postId } });

    // 2. Remove from users' savedPosts (Prisma handles this via disconnect if we delete the post, or we can just delete the post)
    // Actually, when a post is deleted, it will be removed from the join table in a many-to-many relationship automatically.

    // 3. Delete the post
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
      include: { author: { select: { email: true, name: true } } }
    });

    // Send email to post author if they exist
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
        // We don't fail the entire request if just the email fails
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

//to count the post
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

//to count the pending approval posts
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

//to count appoved posts
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

export const getRoomTypes = async (req, res) => {
  try {
    // In Prisma, we don't have easy access to enum values like Mongoose schema
    // We can hardcode them or use a query if they were in a separate table.
    // For now, I'll return the expected ones based on schema.prisma
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

// get landlord posts
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

export const getPostSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Log the keyword
    await prisma.searchLog.create({
      data: {
        keyword: query,
        userId: req.user ? Number(req.user.id) : null
      }
    });

    // Find related posts (approved and matching search)
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

export const getRecentSearches = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const logs = await prisma.searchLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { keyword: true }
    });
    
    // Get unique keywords (case insensitive handle)
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


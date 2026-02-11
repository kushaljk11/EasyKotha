import { prisma } from "../lib/prisma.js";
import { sendEmail } from "../utils/email.js";
import { 
  bookingApprovedTemplate, 
  bookingRejectedTemplate, 
  bookingRequestTemplate,
  bookingUserConfirmationTemplate,
  bookingCancelledTemplate
} from "../utils/emailtemplates/bookingTemplates.js";

//get all bookings (for admin)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        post: { select: { title: true, city: true, district: true, price: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Filter out bookings where the post has been deleted
    const validBookings = bookings.filter(booking => booking.post);

    res.status(200).json({
      success: true,
      data: validBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

//create booking
export const createBooking = async (req, res) => {
  try {
    const { postId, startDate, endDate } = req.body;
    const userId = Number(req.user.id);

    if (!postId || !startDate) {
      return res.status(400).json({
        success: false,
        message: "Post ID and Start Date are required",
      });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || !post.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Post is not available for booking",
      });
    }

    const start = new Date(startDate);
    // If endDate is missing or same as start, make it +2 hours for a "visit"
    let end = endDate ? new Date(endDate) : new Date(start);
    
    if (start.getTime() === end.getTime()) {
      end.setHours(end.getHours() + 2);
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking dates",
      });
    }

    const overlapping = await prisma.booking.findFirst({
      where: {
        postId,
        userId,
        status: "pending",
        startDate: start
      }
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this date",
      });
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    const totalPrice = days * post.price;

    const booking = await prisma.booking.create({
      data: {
        postId,
        userId,
        startDate: start,
        endDate: end,
        totalPrice,
      },
    });

    const userData = await prisma.user.findUnique({ where: { id: userId } });
    const postOwner = await prisma.user.findUnique({ where: { id: post.authorId } });

    if (postOwner && postOwner.email) {
      await sendEmail({
        to: postOwner.email,
        subject: `New booking request for your post: ${post.title}`,
        text: `You have a new booking request from ${userData.name} for your post "${post.title}" on ${start.toLocaleDateString()}.`,
        html: bookingRequestTemplate({ post, user: userData, booking }),
      });
    }

    if (userData && userData.email) {
      await sendEmail({
        to: userData.email,
        subject: `Booking request sent for ${post.title}`,
        text: `Your booking request for "${post.title}" has been sent. The landlord will approve or reject your booking soon.`,
        html: bookingUserConfirmationTemplate({ post, booking }),
      });
    }

    res.status(201).json({
      success: true,
      message: "Booking request sent",
      data: booking,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

//update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = Number(req.params.id);

    if (!["approved", "rejected", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { post: true, user: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Email notifications
    try {
      if (status === "approved" || status === "rejected") {
        if (booking.user && booking.user.email) {
          // Update post availability only on approval
          if (status === "approved" && booking.post) {
            await prisma.post.update({
              where: { id: booking.postId },
              data: { isAvailable: false }
            });
          }

          await sendEmail({
            to: booking.user.email,
            subject: `Your booking for "${booking.post?.title || "Property"}" is ${status}`,
            html: status === "approved" 
              ? bookingApprovedTemplate({ post: booking.post, booking })
              : bookingRejectedTemplate({ post: booking.post, booking }),
          });
        }
      } else if (status === "cancelled") {
        // Logged in user can be tenant or landlord, notify the other party
        if (booking.post) {
          await prisma.post.update({
            where: { id: booking.postId },
            data: { isAvailable: true }
          });
        }

        const postOwner = await prisma.user.findUnique({ where: { id: booking.post?.authorId } });
        
        // Notify both parties of cancellation
        if (booking.user?.email) {
          await sendEmail({
            to: booking.user.email,
            subject: "Booking Cancelled",
            html: bookingCancelledTemplate({ post: booking.post, booking }),
          });
        }
        
        if (postOwner?.email) {
          await sendEmail({
            to: postOwner.email,
            subject: "Booking Cancelled",
            html: bookingCancelledTemplate({ post: booking.post, booking }),
          });
        }
      }
    } catch (emailError) {
      console.error("Email notification Error in updateBookingStatus:", emailError.message);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status }
    });

    res.status(200).json({
      success: true,
      message: "Booking status updated",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking",
      error: error.message,
    });
  }
};

// Get bookings for a specific post (only owner or admin)
export const getPostBookings = async (req, res) => {
  try {
    const postId = req.params.postId;
    const requesterId = Number(req.user.id);
    const requesterRole = req.user.role;

    // Find the post
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Only post owner or admin can view
    if (post.authorId !== requesterId && requesterRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only post owner or admin can view bookings.",
      });
    }

    // Get all bookings for this post
    const bookings = await prisma.booking.findMany({
      where: { postId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error in getPostBookings:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch post bookings",
      error: error.message,
    });
  }
};

// Get all bookings of the logged-in user
export const getUserBookings = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    // Fetch all bookings made by this user
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            title: true,
            city: true,
            district: true,
            price: true,
            images: true,
            content: true,
            authorId: true,
          },
          include: {
            author: {
              select: {
                name: true,
                email: true,
                profileImage: true,
                phone: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Filter out bookings where the post has been deleted
    const validBookings = bookings.filter(booking => booking.post);

    res.status(200).json({
      success: true,
      data: validBookings,
    });
  } catch (error) {
    console.error("Error in getUserBookings:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your bookings",
      error: error.message,
    });
  }
};

// Get all bookings for posts owned by the landlord
export const getLandlordBookings = async (req, res) => {
  try {
    const landlordId = Number(req.user.id);

    // 1. Find all posts owned by this landlord
    const myPosts = await prisma.post.findMany({ where: { authorId: landlordId } });
    const postIds = myPosts.map((post) => post.id);

    // 2. Find all bookings for these posts
    const bookings = await prisma.booking.findMany({
      where: { postId: { in: postIds } },
      include: {
        user: { select: { name: true, email: true, profileImage: true, phone: true, city: true, district: true } },
        post: { select: { title: true, city: true, district: true, price: true, images: true, status: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Filter out bookings where the post has been deleted
    const validBookings = bookings.filter(booking => booking.post);

    res.status(200).json({
      success: true,
      data: validBookings,
    });
  } catch (error) {
    console.error("Error in getLandlordBookings:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch landlord bookings",
      error: error.message,
    });
  }
};

import { prisma } from "../lib/prisma.js";
import { sendEmail } from "../utils/email.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import { 
  bookingApprovedTemplate, 
  bookingRejectedTemplate, 
  bookingRequestTemplate,
  bookingUserConfirmationTemplate,
  bookingCancelledTemplate
} from "../utils/emailtemplates/bookingTemplates.js";

const emitNotification = (userId, payload) => {
  const receiverSocketId = getReceiverSocketId(userId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("notification", payload);
  }
};

/**
 * Admin view: returns every booking record that still has an attached property.
 * If a property was deleted later, that booking is skipped from the response.
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        post: {
          select: {
            title: true,
            city: true,
            district: true,
            price: true,
            images: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" }
    });

    /** Only send bookings linked to properties that still exist. */
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

/**
 * Creates a new booking request for a tenant.
 * The booking is saved first, then users are notified.
 * Email is sent in the background so the button does not stay stuck on "submitting".
 */
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
    /** If only one date is provided, treat it as a short visit window. */
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

    /** In-app notifications are sent immediately through socket. */
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    const notificationPayload = {
      id: `booking-${booking.id}-${Date.now()}`,
      title: "New booking request",
      message: `${userData?.name || "A tenant"} requested ${post.title}`,
      type: "booking",
      link: "/admin/bookings",
      createdAt: new Date().toISOString(),
    };

    const recipientIds = new Set([post.authorId, ...admins.map((admin) => admin.id)]);
    recipientIds.forEach((id) => emitNotification(id, notificationPayload));

    res.status(201).json({
      success: true,
      message: "Booking request sent",
      data: booking,
    });

    Promise.resolve()
      .then(async () => {
        try {
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
        } catch (emailError) {
          console.error("Email notification Error in createBooking:", emailError.message);
        }
      })
      .catch(() => {
        /** The detailed error is already logged in the block above. */
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

/**
 * Updates booking state (approved, rejected, cancelled).
 * Core database updates happen before response; email follows in the background.
 */
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

    if (status === "approved" && booking.post) {
      await prisma.post.update({
        where: { id: booking.postId },
        data: { isAvailable: false }
      });
    } else if (status === "cancelled" && booking.post) {
      await prisma.post.update({
        where: { id: booking.postId },
        data: { isAvailable: true }
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status }
    });

    const postOwner = booking.post?.authorId;
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    const statusNotification = {
      id: `booking-status-${updatedBooking.id}-${Date.now()}`,
      title: "Booking updated",
      message: `Booking for ${booking.post?.title || "property"} is now ${status}`,
      type: "booking-status",
      link: "/admin/bookings",
      createdAt: new Date().toISOString(),
    };

    const recipients = new Set([
      booking.userId,
      postOwner,
      ...admins.map((admin) => admin.id),
    ]);
    recipients.forEach((id) => {
      if (id !== undefined && id !== null) {
        emitNotification(id, statusNotification);
      }
    });

    res.status(200).json({
      success: true,
      message: "Booking status updated",
      data: updatedBooking,
    });

    Promise.resolve()
      .then(async () => {
        try {
          if (status === "approved" || status === "rejected") {
            if (booking.user?.email) {
              await sendEmail({
                to: booking.user.email,
                subject: `Your booking for "${booking.post?.title || "Property"}" is ${status}`,
                html: status === "approved"
                  ? bookingApprovedTemplate({ post: booking.post, booking })
                  : bookingRejectedTemplate({ post: booking.post, booking }),
              });
            }
            return;
          }

          if (status === "cancelled") {
            const postOwner = await prisma.user.findUnique({ where: { id: booking.post?.authorId } });

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
      })
      .catch(() => {
        /** The detailed error is already logged in the block above. */
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

/**
 * Returns bookings for one property.
 * Access is limited to the property owner and admin users.
 */
export const getPostBookings = async (req, res) => {
  try {
    const postId = req.params.postId;
    const requesterId = Number(req.user.id);
    const requesterRole = req.user.role;

    /** Check the requested property first. */
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    /** Prevent unrelated users from reading private booking data. */
    if (post.authorId !== requesterId && requesterRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only post owner or admin can view bookings.",
      });
    }

    /** Fetch all booking requests for this property. */
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

/**
 * Returns booking history for the signed-in user.
 */
export const getUserBookings = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    /** Load bookings made by this account. */
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
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                phone: true,
              },
            },
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    /** Remove entries whose property no longer exists. */
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

/**
 * Landlord view: returns bookings for properties owned by the signed-in landlord.
 */
export const getLandlordBookings = async (req, res) => {
  try {
    const landlordId = Number(req.user.id);

    /** Step 1: collect all properties owned by this landlord. */
    const myPosts = await prisma.post.findMany({ where: { authorId: landlordId } });
    const postIds = myPosts.map((post) => post.id);

    /** Step 2: load bookings related to those properties. */
    const bookings = await prisma.booking.findMany({
      where: { postId: { in: postIds } },
      include: {
        user: { select: { name: true, email: true, profileImage: true, phone: true, city: true, district: true } },
        post: { select: { title: true, city: true, district: true, price: true, images: true, status: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    /** Remove entries whose property record is missing. */
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

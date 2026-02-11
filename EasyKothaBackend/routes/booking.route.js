import express from "express";
import {
  createBooking,
  getUserBookings,
  getPostBookings,
  updateBookingStatus,
  getAllBookings,
  getLandlordBookings,
} from "../controller/booking.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const bookingrouter = express.Router();

// Create booking
bookingrouter.post("/", authMiddleware, createBooking);

// Get all bookings (for admin)
bookingrouter.get("/", authMiddleware, getAllBookings);


// User bookings
bookingrouter.get("/my-bookings", authMiddleware, getUserBookings);

// All bookings for landlord's posts
bookingrouter.get("/landlord", authMiddleware, getLandlordBookings);

// Bookings for specific post (owner)
bookingrouter.get("/post/:postId", authMiddleware, getPostBookings);

// Update booking status
bookingrouter.patch("/:id/status", authMiddleware, updateBookingStatus);
export default bookingrouter;

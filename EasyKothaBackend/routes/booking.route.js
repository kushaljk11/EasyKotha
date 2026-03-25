import express from "express";
import {
  createBooking,
  getUserBookings,
  getPostBookings,
  updateBookingStatus,
  getAllBookings,
  getLandlordBookings,
} from "../controller/booking.controller.js";

import { authMiddleware } from "../middleware/auth.Middleware.js";

const bookingrouter = express.Router();

/** Creates a booking request. */
bookingrouter.post("/", authMiddleware, createBooking);

/** Returns all bookings for admin views. */
bookingrouter.get("/", authMiddleware, getAllBookings);

/** Returns bookings created by the signed-in user. */
bookingrouter.get("/my-bookings", authMiddleware, getUserBookings);

/** Returns bookings for properties owned by the signed-in landlord. */
bookingrouter.get("/landlord", authMiddleware, getLandlordBookings);

/** Returns bookings for one specific listing. */
bookingrouter.get("/post/:postId", authMiddleware, getPostBookings);

/** Updates booking status. */
bookingrouter.patch("/:id/status", authMiddleware, updateBookingStatus);
export default bookingrouter;

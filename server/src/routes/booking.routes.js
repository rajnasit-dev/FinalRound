import { Router } from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingPaymentStatus,
  cancelBooking,
} from "../controllers/booking.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create a new booking
router.post("/", createBooking);

// Get all bookings for logged-in user
router.get("/my-bookings", getUserBookings);

// Get specific booking by ID
router.get("/:bookingId", getBookingById);

// Update booking payment status
router.patch("/:bookingId/payment-status", updateBookingPaymentStatus);

// Cancel booking
router.patch("/:bookingId/cancel", cancelBooking);

export default router;

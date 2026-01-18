import Booking from "../models/Booking.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { Team } from "../models/Team.model.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a new booking
export const createBooking = asyncHandler(async (req, res) => {
  const { tournamentId, teamId, playerId, registrationType } = req.body;
  const userId = req.user._id;

  // Validate tournament exists
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // Check for duplicate booking
  const existingBooking = await Booking.findOne({
    user: userId,
    tournament: tournamentId,
    status: { $ne: "Cancelled" },
  });

  if (existingBooking) {
    throw new ApiError(400, "You have already booked this tournament");
  }

  // Generate unique booking ID
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  const bookingId = `BK${timestamp}${randomStr}`.toUpperCase();

  // Create booking data
  const bookingData = {
    bookingId,
    user: userId,
    tournament: tournamentId,
    registrationType,
    amount: tournament.entryFee,
  };

  // Add team or player based on registration type
  if (registrationType === "Team" && teamId) {
    bookingData.team = teamId;
  } else if (registrationType === "Player") {
    bookingData.player = playerId || userId;
  }

  // Create booking
  const booking = await Booking.create(bookingData);

  res
    .status(201)
    .json(new ApiResponse(201, booking, "Booking created successfully"));
});

// Get user's bookings
export const getUserBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const bookings = await Booking.find({ user: userId })
    .populate({
      path: "tournament",
      populate: {
        path: "sport",
        select: "name",
      },
    })
    .populate("team", "name")
    .populate("player", "fullName email avatar")
    .populate("payment")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, bookings, "Bookings fetched successfully"));
});

// Get booking by ID
export const getBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId)
    .populate({
      path: "tournament",
      populate: {
        path: "sport",
        select: "name",
      },
    })
    .populate("team", "name")
    .populate("player", "fullName email avatar")
    .populate("payment")
    .populate("user", "fullName email");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user owns this booking
  if (booking.user._id.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to view this booking");
  }

  res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking fetched successfully"));
});

// Update booking payment status
export const updateBookingPaymentStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { paymentId, paymentStatus } = req.body;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user owns this booking
  if (booking.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this booking");
  }

  // Update booking
  booking.payment = paymentId;
  booking.paymentStatus = paymentStatus;
  
  if (paymentStatus === "Success") {
    booking.status = "Confirmed";
  }

  await booking.save();

  const updatedBooking = await Booking.findById(bookingId)
    .populate("tournament", "name startDate endDate")
    .populate("team", "name")
    .populate("player", "fullName email")
    .populate("payment");

  res
    .status(200)
    .json(new ApiResponse(200, updatedBooking, "Booking updated successfully"));
});

// Cancel booking
export const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user owns this booking
  if (booking.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to cancel this booking");
  }

  // Check if booking can be cancelled
  if (booking.status === "Cancelled") {
    throw new ApiError(400, "Booking is already cancelled");
  }

  booking.status = "Cancelled";
  await booking.save();

  res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
});

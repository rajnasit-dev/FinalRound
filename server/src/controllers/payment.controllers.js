import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../models/Payment.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { Team } from "../models/Team.model.js";
import { Player } from "../models/Player.model.js";

const REGISTRATION_TAX_RATE = 0.18;
const roundToTwo = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const fetchRazorpayPaymentMethod = async (providerPaymentId) => {
  if (!providerPaymentId) return null;

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    return null;
  }

  try {
    const authToken = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");
    const response = await fetch(`https://api.razorpay.com/v1/payments/${providerPaymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const razorpayPayment = await response.json();
    return razorpayPayment?.method ? String(razorpayPayment.method).toLowerCase() : null;
  } catch {
    return null;
  }
};

// Create a new payment
export const createPayment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    tournament,
    team,
    player,
    payerType,
    amount,
    currency,
    provider,
    providerPaymentId
  } = req.body;

  if (!tournament || !payerType) {
    throw new ApiError(400, "Tournament and payer type are required.");
  }

  // Verify tournament exists
  const tournamentDoc = await Tournament.findById(tournament);
  if (!tournamentDoc) {
    throw new ApiError(404, "Tournament not found.");
  }

  // Validate payer type and references
  let payerName = "Unknown";

  if (payerType === "Team") {
    if (!team) {
      throw new ApiError(400, "Team ID is required for team payment.");
    }
    const teamDoc = await Team.findById(team);
    if (!teamDoc) {
      throw new ApiError(404, "Team not found.");
    }
    // Verify user is team manager
    if (teamDoc.manager.toString() !== userId.toString()) {
      throw new ApiError(403, "Only the team manager can make team payments.");
    }
    payerName = teamDoc.name;
  } else if (payerType === "Player") {
    if (!player) {
      throw new ApiError(400, "Player ID is required for player payment.");
    }
    const playerDoc = await Player.findById(player);
    if (!playerDoc) {
      throw new ApiError(404, "Player not found.");
    }
    // Verify user is the player - compare playerDoc._id with userId
    if (playerDoc._id.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only make payment for yourself.");
    }
    payerName = playerDoc.fullName;
  } else if (payerType === "Organizer") {
    payerName = req.user.orgName || req.user.fullName || "Organizer";
  } else {
    throw new ApiError(400, "Invalid payer type.");
  }

  let entryFeeAmount = 0;
  let taxRate = 0;
  let taxAmount = 0;
  let payableAmount = 0;

  if (payerType === "Team" || payerType === "Player") {
    entryFeeAmount = roundToTwo(Number(tournamentDoc.entryFee) || 0);
    taxRate = REGISTRATION_TAX_RATE;
    taxAmount = roundToTwo(entryFeeAmount * taxRate);
    payableAmount = roundToTwo(entryFeeAmount + taxAmount);
  } else {
    if (amount === undefined || amount === null) {
      throw new ApiError(400, "Amount is required for organizer payments.");
    }

    payableAmount = roundToTwo(Number(amount));
    entryFeeAmount = payableAmount;
  }

  const payment = await Payment.create({
    tournament,
    team: payerType === "Team" ? team : undefined,
    player: payerType === "Player" ? player : undefined,
    payerType,
    payerName,
    organizer: tournamentDoc.organizer,
    amount: payableAmount,
    entryFeeAmount,
    taxRate,
    taxAmount,
    currency: currency || "INR",
    status: "Pending",
    provider,
    providerPaymentId
  });

  const populatedPayment = await Payment.findById(payment._id)
    .populate("tournament", "name sport organizer entryFee")
    .populate("team", "name logoUrl manager")
    .populate("player", "fullName email avatar")
    .populate("organizer", "fullName email avatar orgName");

  res
    .status(201)
    .json(new ApiResponse(201, populatedPayment, "Payment created successfully."));
});

// Get all payments
export const getAllPayments = asyncHandler(async (req, res) => {
  const { tournament, status, payerType } = req.query;

  let filter = {};

  if (tournament) filter.tournament = tournament;
  if (status) filter.status = status;
  if (payerType) filter.payerType = payerType;

  const payments = await Payment.find(filter)
    .populate("tournament", "name sport organizer")
    .populate("team", "name logoUrl")
    .populate("player", "fullName email avatar")
    .populate("organizer", "fullName email avatar orgName")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, payments, "Payments retrieved successfully."));
});

// Get payment by ID
export const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let payment = await Payment.findById(id)
    .populate({
      path: "tournament",
      populate: {
        path: "sport organizer",
        select: "name teamBased iconUrl fullName email avatar orgName"
      }
    })
    .populate({
      path: "team",
      populate: {
        path: "manager",
        select: "fullName email avatar"
      }
    })
    .populate("player", "fullName email avatar phone city")
    .populate("organizer", "fullName email avatar orgName phone city");

  if (!payment) {
    throw new ApiError(404, "Payment not found.");
  }

  // Backfill payment method for legacy records when possible.
  if (
    payment.providerPaymentId &&
    (!payment.paymentMethod || payment.paymentMethod === "unknown")
  ) {
    const fetchedMethod = await fetchRazorpayPaymentMethod(payment.providerPaymentId);

    if (fetchedMethod) {
      payment.paymentMethod = fetchedMethod;
      await payment.save();

      payment = await Payment.findById(id)
        .populate({
          path: "tournament",
          populate: {
            path: "sport organizer",
            select: "name teamBased iconUrl fullName email avatar orgName"
          }
        })
        .populate({
          path: "team",
          populate: {
            path: "manager",
            select: "fullName email avatar"
          }
        })
        .populate("player", "fullName email avatar phone city")
        .populate("organizer", "fullName email avatar orgName phone city");
    }
  }

  res
    .status(200)
    .json(new ApiResponse(200, payment, "Payment retrieved successfully."));
});

// Update payment status
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, providerPaymentId, paymentMethod } = req.body;

  if (!status || !["Pending", "Success", "Failed", "Refunded"].includes(status)) {
    throw new ApiError(400, "Invalid status value.");
  }

  const payment = await Payment.findById(id);

  if (!payment) {
    throw new ApiError(404, "Payment not found.");
  }

  payment.status = status;
  if (providerPaymentId) payment.providerPaymentId = providerPaymentId;

  const normalizedMethod = paymentMethod ? String(paymentMethod).toLowerCase() : null;
  if (normalizedMethod && normalizedMethod !== "unknown") {
    payment.paymentMethod = normalizedMethod;
  } else if (status === "Success" && payment.providerPaymentId) {
    const fetchedMethod = await fetchRazorpayPaymentMethod(payment.providerPaymentId);
    if (fetchedMethod) {
      payment.paymentMethod = fetchedMethod;
    }
  }

  await payment.save();

  const updatedPayment = await Payment.findById(id)
    .populate("tournament", "name sport organizer")
    .populate("team", "name logoUrl")
    .populate("player", "fullName email avatar")
    .populate("organizer", "fullName email avatar orgName");

  res
    .status(200)
    .json(new ApiResponse(200, updatedPayment, "Payment status updated successfully."));
});

// Get payments by tournament
export const getPaymentsByTournament = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  const organizerId = req.user._id;

  // Verify user is the tournament organizer
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  if (tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can view payments.");
  }

  const payments = await Payment.find({ tournament: tournamentId })
    .populate("team", "name logoUrl manager")
    .populate("player", "fullName email avatar")
    .sort({ createdAt: -1 });

  // Calculate payment statistics
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const successfulPayments = payments.filter(p => p.status === "Success").length;
  const pendingPayments = payments.filter(p => p.status === "Pending").length;
  const failedPayments = payments.filter(p => p.status === "Failed").length;

  res
    .status(200)
    .json(new ApiResponse(200, { 
      payments,
      statistics: {
        totalAmount,
        totalPayments: payments.length,
        successfulPayments,
        pendingPayments,
        failedPayments
      }
    }, "Payments retrieved successfully."));
});

// Get user's payments
export const getUserPayments = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  let filter = {};

  if (userRole === "Player") {
    filter.player = userId;
  } else if (userRole === "TeamManager") {
    // Get all teams managed by this user (only active teams)
    const teams = await Team.find({ manager: userId, isActive: true }).select('_id');
    const teamIds = teams.map(t => t._id);
    
    // Show both team payments AND any individual player payments they made
    filter = {
      $or: [
        { team: { $in: teamIds } },
        { player: userId }
      ]
    };
  } else if (userRole === "TournamentOrganizer") {
    // Show both:
    // 1. Payments received for tournaments they organized (as organizer)
    // 2. Any payments they made as a player for other tournaments
    filter = {
      $or: [
        { organizer: userId },
        { player: userId }
      ]
    };
  }

  const payments = await Payment.find(filter)
    .populate("tournament", "name sport status")
    .populate("team", "name logoUrl")
    .populate("player", "fullName email avatar")
    .populate("organizer", "fullName email avatar orgName")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, payments, "Payments retrieved successfully."));
});

// Get payments by team
export const getPaymentsByTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const userId = req.user._id;

  // Verify user is the team manager
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  if (team.manager.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the team manager can view team payments.");
  }

  const payments = await Payment.find({ team: teamId })
    .populate("tournament", "name sport organizer")
    .populate("organizer", "fullName email avatar orgName")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, payments, "Payments retrieved successfully."));
});

// Delete payment (admin or organizer only)
export const deletePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const payment = await Payment.findById(id).populate("tournament");

  if (!payment) {
    throw new ApiError(404, "Payment not found.");
  }

  // Verify user is the tournament organizer
  if (payment.tournament.organizer.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can delete payments.");
  }

  // Can only delete if status is Pending or Failed
  if (payment.status !== "Pending" && payment.status !== "Failed") {
    throw new ApiError(400, "Cannot delete successful or refunded payments.");
  }

  await Payment.findByIdAndDelete(id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Payment deleted successfully."));
});

// Get payment statistics for organizer
export const getOrganizerPaymentStats = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  const payments = await Payment.find({ organizer: organizerId });

  const getRevenueAmount = (payment) => (
    payment.payerType === "Organizer"
      ? (payment.amount || 0)
      : ((Number(payment.entryFeeAmount) > 0 ? payment.entryFeeAmount : payment.amount) ?? 0)
  );

  const totalAmount = payments.reduce((sum, p) => sum + getRevenueAmount(p), 0);
  const successfulAmount = payments
    .filter(p => p.status === "Success")
    .reduce((sum, p) => sum + getRevenueAmount(p), 0);

  const stats = {
    totalPayments: payments.length,
    successfulPayments: payments.filter(p => p.status === "Success").length,
    pendingPayments: payments.filter(p => p.status === "Pending").length,
    failedPayments: payments.filter(p => p.status === "Failed").length,
    refundedPayments: payments.filter(p => p.status === "Refunded").length,
    totalAmount,
    successfulAmount,
    currency: "INR"
  };

  res
    .status(200)
    .json(new ApiResponse(200, stats, "Payment statistics retrieved successfully."));
});

import { User } from "../models/User.model.js";
import { TournamentOrganizer } from "../models/TournamentOrganizer.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { Team } from "../models/Team.model.js";
import { Player } from "../models/Player.model.js";
import { TeamManager } from "../models/TeamManager.model.js";
import { Payment } from "../models/Payment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

const TOURNAMENT_LISTING_FEE = 100; // 100 rupees per tournament

// Get all pending organizer authorization requests
export const getPendingOrganizerRequests = asyncHandler(async (req, res) => {
  const pendingOrganizers = await TournamentOrganizer.find({
    isAuthorized: false,
    verificationDocumentUrl: { $exists: true, $ne: null },
  })
    .select("-password -refreshToken")
    .sort({ authorizationRequestDate: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        pendingOrganizers,
        "Pending organizer requests fetched successfully"
      )
    );
});

// Get all organizers with optional filters
export const getAllOrganizers = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = {};
  if (status === "authorized") {
    filter.isAuthorized = true;
  } else if (status === "pending") {
    filter.isAuthorized = false;
  }

  const organizers = await TournamentOrganizer.find(filter)
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, organizers, "Organizers fetched successfully")
    );
});

// Authorize an organizer
export const authorizeOrganizer = asyncHandler(async (req, res) => {
  const { organizerId } = req.params;

  const organizer = await TournamentOrganizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  organizer.isAuthorized = true;
  organizer.authorizedBy = req.user._id;
  organizer.authorizedAt = new Date();
  organizer.rejectionReason = undefined;

  await organizer.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(
      new ApiResponse(200, organizer, "Organizer authorized successfully")
    );
});

// Reject an organizer authorization
export const rejectOrganizer = asyncHandler(async (req, res) => {
  const { organizerId } = req.params;
  const { reason } = req.body;

  const organizer = await TournamentOrganizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  organizer.isAuthorized = false;
  organizer.rejectionReason = reason || "Authorization denied by admin";
  organizer.authorizedBy = undefined;
  organizer.authorizedAt = undefined;

  await organizer.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, organizer, "Organizer rejected successfully"));
});

// Get all users with filters
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;

  const filter = {};
  if (role && role !== "all") {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, users, "Users fetched successfully")
  );
});

// Get all tournaments with filters
export const getAllTournaments = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const tournaments = await Tournament.find(filter)
    .populate("sport", "name")
    .populate("organizer", "fullName email orgName")
    .populate("approvedTeams", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, tournaments, "Tournaments fetched successfully")
  );
});

// Get all teams with filters
export const getAllTeams = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
    ];
  }

  const teams = await Team.find(filter)
    .populate("sport", "name")
    .populate("manager", "fullName email")
    .populate("players", "fullName email")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, teams, "Teams fetched successfully")
  );
});

// Get revenue/profit statistics
export const getRevenue = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Calculate total tournaments (each tournament = 100 rupees)
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const totalTournaments = await Tournament.countDocuments(filter);
  const tournamentRevenue = totalTournaments * TOURNAMENT_LISTING_FEE;

  // Get payment statistics
  const paymentStats = await Payment.aggregate([
    ...(Object.keys(filter).length > 0 ? [{ $match: filter }] : []),
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ["$status", "Success"] }, 1, 0] },
        },
        successfulAmount: {
          $sum: {
            $cond: [{ $eq: ["$status", "Success"] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  const paymentData = paymentStats[0] || {
    totalPayments: 0,
    totalAmount: 0,
    successfulPayments: 0,
    successfulAmount: 0,
  };

  // Get all payments with populated data
  const allPayments = await Payment.find(filter)
    .populate("tournament", "name")
    .populate("team", "name")
    .sort({ createdAt: -1 })
    .limit(100);

  // Monthly revenue breakdown
  const monthlyRevenue = await Tournament.aggregate([
    ...(Object.keys(filter).length > 0 ? [{ $match: filter }] : []),
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        revenue: { $sum: TOURNAMENT_LISTING_FEE },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },
  ]);

  // Calculate monthly revenue from current year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const monthlyTournamentRevenue = await Tournament.countDocuments({
    createdAt: {
      $gte: new Date(currentYear, currentMonth - 1, 1),
      $lt: new Date(currentYear, currentMonth, 1),
    },
  });

  const statistics = {
    tournamentListingFee: TOURNAMENT_LISTING_FEE,
    totalTournaments,
    tournamentRevenue,
    totalPayments: paymentData.totalPayments,
    totalRevenue: tournamentRevenue,
    monthlyRevenue: monthlyTournamentRevenue * TOURNAMENT_LISTING_FEE,
    monthlyBreakdown: monthlyRevenue,
    payments: allPayments,
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, statistics, "Revenue statistics fetched successfully")
    );
});

// Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalPlayers,
    totalManagers,
    totalOrganizers,
    totalTournaments,
    totalTeams,
    activeTournaments,
    pendingOrganizerRequests,
    recentPayments,
  ] = await Promise.all([
    User.countDocuments(),
    Player.countDocuments(),
    TeamManager.countDocuments(),
    TournamentOrganizer.countDocuments(),
    Tournament.countDocuments(),
    Team.countDocuments(),
    Tournament.countDocuments({ status: { $in: ["Upcoming", "Live"] } }),
    TournamentOrganizer.countDocuments({
      isAuthorized: false,
      verificationDocumentUrl: { $exists: true, $ne: null },
    }),
    Payment.find({ status: "Success" })
      .limit(10)
      .sort({ createdAt: -1 })
      .populate("tournament", "name")
      .populate("team", "name"),
  ]);

  const totalRevenue = totalTournaments * TOURNAMENT_LISTING_FEE;

  const stats = {
    users: {
      total: totalUsers,
      players: totalPlayers,
      managers: totalManagers,
      organizers: totalOrganizers,
    },
    tournaments: {
      total: totalTournaments,
      active: activeTournaments,
    },
    teams: {
      total: totalTeams,
    },
    revenue: {
      total: totalRevenue,
      perTournament: TOURNAMENT_LISTING_FEE,
    },
    pendingRequests: pendingOrganizerRequests,
    recentPayments,
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Dashboard statistics fetched successfully")
    );
});

// Delete user (soft delete or hard delete)
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete avatar from cloudinary if exists
  if (user.avatarUrl) {
    try {
      await deleteFromCloudinary(user.avatarUrl);
    } catch (error) {
      console.error("Error deleting avatar from cloudinary:", error);
    }
  }

  // Delete banner from cloudinary if exists
  if (user.bannerUrl) {
    try {
      await deleteFromCloudinary(user.bannerUrl);
    } catch (error) {
      console.error("Error deleting banner from cloudinary:", error);
    }
  }

  // Delete the user
  await User.findByIdAndDelete(userId);

  res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

// Update user status or details
export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  // Prevent updating sensitive fields
  delete updates.password;
  delete updates.refreshToken;
  delete updates.role;

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

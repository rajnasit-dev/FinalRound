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
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

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
  const { startDate, endDate, type } = req.query; // type: "all", "admin", "organizer"

  // Calculate total tournaments (each tournament = 100 rupees platform fee - ADMIN REVENUE)
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // ADMIN REVENUE: Platform fees from organizers
  // Count both tournament-based and payment-based platform fees
  const totalTournaments = await Tournament.countDocuments(filter);
  const successfulPlatformFeePayments = await Payment.countDocuments({
    payerType: "Organizer",
    status: "Success",
    ...(startDate || endDate ? {
      createdAt: {
        ...(startDate && { $gte: new Date(startDate) }),
        ...(endDate && { $lte: new Date(endDate) })
      }
    } : {})
  });
  
  const adminRevenue = (totalTournaments * TOURNAMENT_LISTING_FEE) + 
                       (await Payment.aggregate([
                         {
                           $match: {
                             payerType: "Organizer",
                             status: "Success",
                             ...(startDate || endDate ? {
                               createdAt: {
                                 ...(startDate && { $gte: new Date(startDate) }),
                                 ...(endDate && { $lte: new Date(endDate) })
                               }
                             } : {})
                           }
                         },
                         {
                           $group: {
                             _id: null,
                             totalAmount: { $sum: "$amount" }
                           }
                         }
                       ])).then(result => result[0]?.totalAmount || 0);

  // ORGANIZER REVENUE: Registration fees from players/managers (exclude organizer platform fees)
  const organizerRevenueStats = await Payment.aggregate([
    {
      $match: {
        status: "Success",
        payerType: { $ne: "Organizer" }, // Only count player and team registrations
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate && { $gte: new Date(startDate) }),
            ...(endDate && { $lte: new Date(endDate) })
          }
        } : {})
      }
    },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: "$amount" }
      }
    }
  ]);

  const organizerRevenue = organizerRevenueStats[0]?.totalAmount || 0;
  const organizerPaymentCount = organizerRevenueStats[0]?.totalPayments || 0;

  // Get all successful payments (organizer revenue transactions)
  const paymentTransactions = await Payment.find({
    status: "Success",
    payerType: { $ne: "Organizer" }, // Exclude organizer platform fee payments
    ...(startDate || endDate ? {
      createdAt: {
        ...(startDate && { $gte: new Date(startDate) }),
        ...(endDate && { $lte: new Date(endDate) })
      }
    } : {})
  })
    .populate("tournament", "name")
    .populate("team", "name")
    .populate("player", "fullName")
    .populate("organizer", "fullName orgName")
    .sort({ createdAt: -1 })
    .limit(100);

  // Get platform fee transactions from Payment collection (new method)
  const platformFeePayments = await Payment.find({
    status: "Success",
    payerType: "Organizer",
    ...(startDate || endDate ? {
      createdAt: {
        ...(startDate && { $gte: new Date(startDate) }),
        ...(endDate && { $lte: new Date(endDate) })
      }
    } : {})
  })
    .populate("tournament", "name")
    .populate("organizer", "fullName orgName")
    .sort({ createdAt: -1 })
    .limit(100);

  // Get platform fee transactions (admin revenue) - tournament creations (legacy)
  const platformFeeTransactions = await Tournament.find({
    platformFeePayment: "Success",
    ...(startDate || endDate ? {
      createdAt: {
        ...(startDate && { $gte: new Date(startDate) }),
        ...(endDate && { $lte: new Date(endDate) })
      }
    } : {})
  })
    .populate("sport", "name")
    .populate("organizer", "fullName orgName")
    .sort({ createdAt: -1 })
    .limit(100);

  // Format platform fee transactions from Payment collection
  const formattedPlatformFeePayments = platformFeePayments.map(payment => ({
    _id: payment._id,
    type: "Platform Fee",
    tournament: payment.tournament,
    organizer: payment.organizer,
    amount: payment.amount,
    status: payment.status,
    paymentType: "Admin Revenue",
    createdAt: payment.createdAt
  }));

  // Format platform fee transactions like payments (legacy)
  const formattedPlatformFees = platformFeeTransactions.map(tournament => ({
    _id: tournament._id,
    type: "Platform Fee",
    tournament: {
      _id: tournament._id,
      name: tournament.name
    },
    organizer: tournament.organizer,
    amount: TOURNAMENT_LISTING_FEE,
    status: "Success",
    paymentType: "Admin Revenue",
    createdAt: tournament.createdAt
  }));

  // Format payment transactions
  const formattedPayments = paymentTransactions.map(payment => ({
    _id: payment._id,
    type: payment.payerType === "Team" ? "Team Registration" : "Player Registration",
    tournament: payment.tournament,
    team: payment.team,
    player: payment.player,
    organizer: payment.organizer,
    amount: payment.amount,
    status: payment.status,
    paymentType: "Organizer Revenue",
    createdAt: payment.createdAt
  }));

  // Combine all transactions (new platform fee payments + legacy + organizer revenue)
  let allTransactions = [...formattedPlatformFeePayments, ...formattedPlatformFees, ...formattedPayments];
  
  // Apply filter based on type
  if (type === "admin") {
    allTransactions = [...formattedPlatformFeePayments, ...formattedPlatformFees];
  } else if (type === "organizer") {
    allTransactions = formattedPayments;
  }
  
  // Sort by date
  allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const statistics = {
    adminRevenue, // Platform fees from organizers
    organizerRevenue, // Registration fees from players/managers
    totalRevenue: adminRevenue + organizerRevenue, // Combined revenue
    totalTransactions: totalTournaments + organizerPaymentCount,
    platformFeeCount: totalTournaments,
    registrationPaymentCount: organizerPaymentCount,
    platformFeePerTournament: TOURNAMENT_LISTING_FEE,
    transactions: allTransactions.slice(0, 100)
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

// Get all payments with filtering and pagination
export const getAllPayments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    payerType,
    status,
    startDate,
    endDate,
    searchTerm,
  } = req.query;

  const pageNum = parseInt(page, 10);
  const pageLimit = parseInt(limit, 10);
  const skip = (pageNum - 1) * pageLimit;

  // Build filter object
  const filter = {};

  if (payerType && payerType !== "all") {
    filter.payerType = payerType;
  }

  if (status && status !== "all") {
    filter.status = status;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  // Calculate aggregate stats across ALL payments (ignoring pagination/search but respecting type/status/date filters)
  const [statsResult] = await Payment.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalTransactions: { $sum: 1 },
        adminRevenue: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$payerType", "Organizer"] }, { $eq: ["$status", "Success"] }] },
              "$amount",
              0,
            ],
          },
        },
        platformFeesCollected: {
          $sum: {
            $cond: [{ $eq: ["$payerType", "Organizer"] }, "$amount", 0],
          },
        },
        successCount: {
          $sum: { $cond: [{ $eq: ["$status", "Success"] }, 1, 0] },
        },
        pendingCount: {
          $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
        },
      },
    },
  ]);

  const stats = statsResult || {
    totalAmount: 0,
    totalTransactions: 0,
    adminRevenue: 0,
    platformFeesCollected: 0,
    successCount: 0,
    pendingCount: 0,
  };

  // Search in payment IDs, tournament names, organizer names
  let payments;
  if (searchTerm) {
    payments = await Payment.find(filter)
      .populate({
        path: "tournament",
        select: "name",
      })
      .populate({
        path: "organizer",
        select: "fullName orgName email",
      })
      .populate({
        path: "player",
        select: "fullName email",
      })
      .populate({
        path: "team",
        select: "teamName",
      })
      .sort({ createdAt: -1 })
      .exec();

    // Filter payments by search term
    payments = payments.filter(
      (payment) =>
        payment._id.toString().includes(searchTerm) ||
        (payment.tournament?.name &&
          payment.tournament.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (payment.organizer?.fullName &&
          payment.organizer.fullName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (payment.organizer?.orgName &&
          payment.organizer.orgName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (payment.player?.fullName &&
          payment.player.fullName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (payment.team?.teamName &&
          payment.team.teamName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );

    const paginatedPayments = payments.slice(skip, skip + pageLimit);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          payments: paginatedPayments,
          total: payments.length,
          page: pageNum,
          totalPages: Math.ceil(payments.length / pageLimit),
          stats,
        },
        "Payments fetched successfully"
      )
    );
  }

  // Get total count for pagination
  const total = await Payment.countDocuments(filter);

  // Get paginated payments
  payments = await Payment.find(filter)
    .populate({
      path: "tournament",
      select: "name",
    })
    .populate({
      path: "organizer",
      select: "fullName orgName email",
    })
    .populate({
      path: "player",
      select: "fullName email",
    })
    .populate({
      path: "team",
      select: "teamName",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit)
    .exec();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        payments,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / pageLimit),
        stats,
      },
      "Payments fetched successfully"
    )
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

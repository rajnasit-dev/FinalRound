import { User } from "../models/User.model.js";
import { TournamentOrganizer } from "../models/TournamentOrganizer.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { Team } from "../models/Team.model.js";
import { Player } from "../models/Player.model.js";
import { TeamManager } from "../models/TeamManager.model.js";
import { Payment } from "../models/Payment.model.js";
import { Settings } from "../models/Settings.model.js";
import { Sport } from "../models/Sport.model.js";
import { Feedback } from "../models/Feedback.model.js";
import { Match } from "../models/Match.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary, getCloudinaryPublicId } from "../utils/cloudinary.js";
import { sendEmail } from "../middlewares/sendEmail.js";
import { organizerAuthorizedHtml } from "../utils/emailTemplates.js";

const TOURNAMENT_LISTING_FEE = 100; // 100 rupees per tournament

// Get all pending organizer authorization requests
export const getPendingOrganizerRequests = asyncHandler(async (req, res) => {
  const pendingOrganizers = await TournamentOrganizer.find({
    isActive: true,
    isAuthorized: false,
    isRejected: { $ne: true },
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

  const filter = { isActive: true };
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
  organizer.isRejected = false;
  organizer.authorizedBy = req.user._id;
  organizer.authorizedAt = new Date();

  await organizer.save({ validateBeforeSave: false });

  // Send authorization confirmation email to the organizer
  try {
    await sendEmail({
      email: organizer.email,
      subject: "Your SportsHub Organizer Account Has Been Authorized!",
      message: `Hello ${organizer.fullName}, your organizer account has been authorized. You can now create and manage tournaments on SportsHub.`,
      html: organizerAuthorizedHtml(organizer.fullName),
    });
  } catch (err) {
    console.log("Failed to send organizer authorization email:", err);
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, organizer, "Organizer authorized successfully")
    );
});

// Reject an organizer authorization
export const rejectOrganizer = asyncHandler(async (req, res) => {
  const { organizerId } = req.params;

  const organizer = await TournamentOrganizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  organizer.isAuthorized = false;
  organizer.isRejected = true;
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

  const filter = { isActive: true };
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
    .populate("organizer", "fullName email phone orgName")
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
  
  const platformFeeResult = await Payment.aggregate([
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
                       ]);
  const adminRevenue = (totalTournaments * TOURNAMENT_LISTING_FEE) + 
                       (platformFeeResult[0]?.totalAmount || 0);

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
        totalAmount: {
          $sum: {
            $cond: [
              { $gt: [{ $ifNull: ["$entryFeeAmount", 0] }, 0] },
              "$entryFeeAmount",
              "$amount",
            ],
          },
        }
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
    amount: (Number(payment.entryFeeAmount) > 0 ? payment.entryFeeAmount : payment.amount),
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
    User.countDocuments({ isActive: true }),
    Player.countDocuments({ isActive: true }),
    TeamManager.countDocuments({ isActive: true }),
    TournamentOrganizer.countDocuments({ isActive: true }),
    Tournament.countDocuments(),
    Team.countDocuments({ isActive: true }),
    Tournament.countDocuments({ status: { $in: ["Upcoming", "Live"] } }),
    TournamentOrganizer.countDocuments({
      isActive: true,
      isAuthorized: false,
      isRejected: { $ne: true },
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
        select: "name",
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
        (payment.team?.name &&
          payment.team.name
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
      select: "name",
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

// Block or unblock a user
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isBlocked = !user.isBlocked;

  // Clear refresh token when blocking so existing sessions are invalidated
  if (user.isBlocked) {
    user.refreshToken = undefined;
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(
      200,
      { _id: user._id, isBlocked: user.isBlocked },
      `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`
    )
  );
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

// Get OTP verification setting
export const getOtpSetting = asyncHandler(async (req, res) => {
  const otpRequired = await Settings.getSetting("otpVerificationRequired", true);
  res
    .status(200)
    .json(new ApiResponse(200, { otpVerificationRequired: otpRequired }, "OTP setting fetched successfully"));
});

// Toggle OTP verification setting
export const toggleOtpSetting = asyncHandler(async (req, res) => {
  const current = await Settings.getSetting("otpVerificationRequired", true);
  const updated = await Settings.setSetting("otpVerificationRequired", !current);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { otpVerificationRequired: updated.value },
        `OTP verification ${updated.value ? "enabled" : "disabled"} successfully`
      )
    );
});



// Get analytics data for charts and detailed statistics
export const getAnalyticsData = asyncHandler(async (req, res) => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [
    // Monthly user registrations (last 12 months)
    userGrowth,
    // Monthly revenue (last 12 months)
    revenueGrowth,
    // User role distribution
    roleDistribution,
    // Tournament format distribution
    tournamentsByFormat,
    // Sport-wise tournament count
    sportWiseTournaments,
    // Payment status breakdown
    paymentStatusBreakdown,
    // Current month vs last month counts for growth %
    currentMonthUsers,
    lastMonthUsers,
    currentMonthTournaments,
    lastMonthTournaments,
    currentMonthRevenue,
    lastMonthRevenue,
    // Feedback rating distribution
    feedbackDistribution,
    // Total counts
    totalMatches,
    totalFeedback,
    totalSports,
  ] = await Promise.all([
    // 1. User registrations by month (last 12 months)
    User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo }, isActive: true } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    // 2. Admin Revenue by month (last 12 months) - from platform fees only
    Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          status: "Success",
          payerType: "Organizer", // Only admin/platform revenue from organizers
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    // 3. User role distribution
    User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),

    // 4. Tournament format distribution
    Tournament.aggregate([
      { $group: { _id: "$format", count: { $sum: 1 } } },
    ]),

    // 5. Sport-wise tournament count
    Tournament.aggregate([
      {
        $lookup: {
          from: "sports",
          localField: "sport",
          foreignField: "_id",
          as: "sportInfo",
        },
      },
      { $unwind: "$sportInfo" },
      {
        $group: {
          _id: "$sportInfo.name",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    // 6. Admin revenue status distribution (organizer payments only)
    Payment.aggregate([
      { $match: { payerType: "Organizer" } },
      { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } },
    ]),

    // 7. Growth metrics - current month users
    User.countDocuments({ isActive: true, createdAt: { $gte: currentMonthStart } }),
    // 8. Last month users
    User.countDocuments({
      isActive: true,
      createdAt: { $gte: lastMonthStart, $lt: currentMonthStart },
    }),
    // 9. Current month tournaments
    Tournament.countDocuments({ createdAt: { $gte: currentMonthStart } }),
    // 10. Last month tournaments
    Tournament.countDocuments({
      createdAt: { $gte: lastMonthStart, $lt: currentMonthStart },
    }),
    // 11. Current month admin revenue (organizer payments only)
    Payment.aggregate([
      {
        $match: {
          status: "Success",
          createdAt: { $gte: currentMonthStart },
          payerType: "Organizer",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    // 12. Last month admin revenue (organizer payments only)
    Payment.aggregate([
      {
        $match: {
          status: "Success",
          createdAt: { $gte: lastMonthStart, $lt: currentMonthStart },
          payerType: "Organizer",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    // 13. Feedback rating distribution
    Feedback.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // 14. Total matches
    Match.countDocuments(),
    // 15. Total feedback
    Feedback.countDocuments(),
    // 16. Total sports
    Sport.countDocuments({ isActive: true }),
  ]);

  // Format monthly data with month names for last 12 months
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedUserGrowth = [];
  const formattedRevenueGrowth = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const label = `${monthNames[month - 1]} ${year.toString().slice(2)}`;

    const userEntry = userGrowth.find(
      (u) => u._id.year === year && u._id.month === month
    );
    formattedUserGrowth.push({ month: label, users: userEntry?.count || 0 });

    const revEntry = revenueGrowth.find(
      (r) => r._id.year === year && r._id.month === month
    );
    formattedRevenueGrowth.push({ month: label, revenue: revEntry?.amount || 0 });
  }

  // Calculate growth percentages
  const calcGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const currentRevenue = currentMonthRevenue[0]?.total || 0;
  const prevRevenue = lastMonthRevenue[0]?.total || 0;

  const growth = {
    users: calcGrowth(currentMonthUsers, lastMonthUsers),
    tournaments: calcGrowth(currentMonthTournaments, lastMonthTournaments),
    revenue: calcGrowth(currentRevenue, prevRevenue),
  };

  // Format role distribution
  const formattedRoleDistribution = roleDistribution.map((r) => ({
    name: r._id || "Unknown",
    value: r.count,
  }));

  // Format tournament format distribution
  const formattedTournamentFormats = tournamentsByFormat.map((t) => ({
    name: t._id || "Unknown",
    value: t.count,
  }));

  // Format sport-wise data
  const formattedSportWise = sportWiseTournaments.map((s) => ({
    name: s._id,
    tournaments: s.count,
  }));

  // Format payment status
  const formattedPaymentStatus = paymentStatusBreakdown.map((p) => ({
    name: p._id,
    count: p.count,
    amount: p.total,
  }));

  // Format feedback distribution
  const formattedFeedback = feedbackDistribution.map((f) => ({
    rating: `${f._id} Star`,
    count: f.count,
  }));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        userGrowth: formattedUserGrowth,
        revenueGrowth: formattedRevenueGrowth,
        roleDistribution: formattedRoleDistribution,
        tournamentFormats: formattedTournamentFormats,
        sportWiseTournaments: formattedSportWise,
        paymentStatus: formattedPaymentStatus,
        feedbackDistribution: formattedFeedback,
        growth,
        totals: {
          matches: totalMatches,
          feedback: totalFeedback,
          sports: totalSports,
        },
      },
      "Analytics data fetched successfully"
    )
  );
});

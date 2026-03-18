import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Payment } from "../models/Payment.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { Sport } from "../models/Sport.model.js";
import { User } from "../models/User.model.js";
import { Team } from "../models/Team.model.js";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const REPORT_TYPES = ["UserPlayer", "RevenuePayment", "Tournament"];
const LEGACY_TYPE_MAP = {
  User: "UserPlayer",
  Revenue: "RevenuePayment",
  Tournament: "Tournament",
};
const USER_ROLE_SCOPE_MAP = {
  users: ["TeamManager", "TournamentOrganizer", "Player"],
  manager: "TeamManager",
  organizer: "TournamentOrganizer",
  player: "Player",
  // Legacy scope support
  teamManager: "TeamManager",
};

const normalizeReportType = (type) => LEGACY_TYPE_MAP[type] || type;
const normalizeUserScope = (scope) => (scope === "teamManager" ? "manager" : scope);

const getDateRange = (from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    throw new ApiError(400, "Invalid report date range");
  }

  toDate.setHours(23, 59, 59, 999);

  if (fromDate > toDate) {
    throw new ApiError(400, "From date must be before to date");
  }

  return { fromDate, toDate };
};

const buildUserPlayerReport = async ({ fromDate, toDate, filters }) => {
  const dateFilter = { createdAt: { $gte: fromDate, $lte: toDate } };
  const userPlayerScope = normalizeUserScope(filters.userPlayerScope || "users");
  const selectedRole = USER_ROLE_SCOPE_MAP[userPlayerScope] || "Player";
  const roleLabel = userPlayerScope === "users"
    ? "All Users"
    : userPlayerScope === "manager"
    ? "Manager"
    : userPlayerScope === "organizer"
      ? "Organizer"
      : "Player";

  const userMatch = {
    ...dateFilter,
    role: Array.isArray(selectedRole) ? { $in: selectedRole } : selectedRole,
  };

  const totalRegisteredUsers = await User.countDocuments(userMatch);
  const activeUsers = await User.countDocuments({ ...userMatch, isActive: true, isBlocked: { $ne: true } });
  const inactiveUsers = await User.countDocuments({
    ...userMatch,
    $or: [{ isActive: false }, { isBlocked: true }],
  });

  const newUsersPerMonthAgg = await User.aggregate([
    { $match: userMatch },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const cityDistributionAgg = await User.aggregate([
    { $match: { ...userMatch, city: { $exists: true, $ne: "" } } },
    { $group: { _id: "$city", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const usersByRoleAgg = await User.aggregate([
    { $match: userMatch },
    { $group: { _id: "$role", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const playersMatch = { ...dateFilter, role: "Player" };
  if (selectedRole === "Player" && filters.sport && filters.sport !== "all") {
    const selectedSport = await Sport.findOne({ name: filters.sport }).select("_id");
    playersMatch["sports.sport"] = selectedSport?._id || null;
  }

  const playersBySportAgg = selectedRole === "Player"
    ? await User.aggregate([
        { $match: playersMatch },
        { $unwind: "$sports" },
        { $lookup: { from: "sports", localField: "sports.sport", foreignField: "_id", as: "sportInfo" } },
        { $unwind: "$sportInfo" },
        { $group: { _id: "$sportInfo.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
    : [];

  const playerGenderSummaryAgg = selectedRole === "Player"
    ? await User.aggregate([
        { $match: playersMatch },
        {
          $group: {
            _id: null,
            maleCount: { $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] } },
            femaleCount: { $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] } },
            totalCount: { $sum: 1 },
          },
        },
      ])
    : [];

  const genderMonthlyAgg = selectedRole === "Player"
    ? await User.aggregate([
        { $match: playersMatch },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            maleCount: { $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] } },
            femaleCount: { $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] } },
            totalCount: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])
    : [];

  const playerGenderSummary = playerGenderSummaryAgg[0] || {
    maleCount: 0,
    femaleCount: 0,
    totalCount: 0,
  };

  const malePercentage = playerGenderSummary.totalCount > 0
    ? Number(((playerGenderSummary.maleCount / playerGenderSummary.totalCount) * 100).toFixed(2))
    : 0;
  const femalePercentage = playerGenderSummary.totalCount > 0
    ? Number(((playerGenderSummary.femaleCount / playerGenderSummary.totalCount) * 100).toFixed(2))
    : 0;

  const userTableData = await User.find(userMatch)
    .select("fullName email city isActive isBlocked createdAt")
    .sort({ createdAt: -1 })
    .limit(100);

  const scopedUserIds = userTableData.map((user) => user._id);
  let totalTeams = 0;
  let teamsByManager = [];

  if (scopedUserIds.length > 0 && userPlayerScope === "manager") {
    const teamMatch = {
      manager: { $in: scopedUserIds },
      createdAt: { $gte: fromDate, $lte: toDate },
    };

    totalTeams = await Team.countDocuments(teamMatch);

    const teamsByManagerAgg = await Team.aggregate([
      { $match: teamMatch },
      { $lookup: { from: "users", localField: "manager", foreignField: "_id", as: "managerInfo" } },
      { $unwind: "$managerInfo" },
      { $group: { _id: "$managerInfo.fullName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    teamsByManager = teamsByManagerAgg.map((item) => ({
      manager: item._id,
      count: item.count,
    }));
  }

  if (scopedUserIds.length > 0 && userPlayerScope === "organizer") {
    const tournamentsMatch = {
      organizer: { $in: scopedUserIds },
      createdAt: { $gte: fromDate, $lte: toDate },
    };

    const tournamentsByOrganizerAgg = await Tournament.aggregate([
      { $match: tournamentsMatch },
      {
        $group: {
          _id: "$organizer",
          count: { $sum: 1 },
        },
      },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "managerInfo" } },
      { $unwind: { path: "$managerInfo", preserveNullAndEmptyArrays: true } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    totalTeams = tournamentsByOrganizerAgg.reduce((sum, item) => sum + item.count, 0);
    teamsByManager = tournamentsByOrganizerAgg.map((item) => ({
      manager: item.managerInfo?.orgName || "Unknown Organization",
      count: item.count,
    }));
  }

  const scopeLabel = `${roleLabel} Report`;
  const title = userPlayerScope === "users" ? "User Report" : `${roleLabel} Report`;

  return {
    title,
    summary: {
      scope: userPlayerScope,
      scopeLabel,
      totalRegisteredUsers,
      activeUsers,
      inactiveUsers,
      totalUsersInScope: totalRegisteredUsers,
      totalTeams,
      malePlayers: playerGenderSummary.maleCount,
      femalePlayers: playerGenderSummary.femaleCount,
    },
    data: {
      activeInactiveBreakdown: [
        { name: "Active", count: activeUsers },
        { name: "Inactive", count: inactiveUsers },
      ],
      newUsersPerMonth: (selectedRole === "Player" ? genderMonthlyAgg : newUsersPerMonthAgg).map((item) => ({
        month: `${MONTH_NAMES[item._id.month - 1]} ${item._id.year}`,
        count: item.count ?? item.totalCount ?? 0,
        maleCount: item.maleCount ?? 0,
        femaleCount: item.femaleCount ?? 0,
        totalCount: item.totalCount ?? item.count ?? 0,
      })),
      genderRatio: selectedRole === "Player"
        ? [
            {
              gender: "Male",
              count: playerGenderSummary.maleCount,
              percentage: malePercentage,
            },
            {
              gender: "Female",
              count: playerGenderSummary.femaleCount,
              percentage: femalePercentage,
            },
          ]
        : [],
      cityDistribution: cityDistributionAgg.map((item) => ({
        city: item._id,
        count: item.count,
      })),
      usersByRole: usersByRoleAgg.map((item) => ({
        role: item._id,
        count: item.count,
      })),
      playersBySport: playersBySportAgg.map((item) => ({
        sport: item._id,
        count: item.count,
      })),
      usersTable: userTableData.map((user) => ({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        city: user.city || "-",
        status: user.isActive && !user.isBlocked ? "Active" : "Inactive",
        joinedAt: user.createdAt,
      })),
      teamsByManager,
    },
  };
};

const buildRevenuePaymentReport = async ({ fromDate, toDate, filters, organizerId = null }) => {
  const LISTING_COST_PER_TOURNAMENT = 500;
  const paymentMatch = { createdAt: { $gte: fromDate, $lte: toDate } };
  const reportScope = organizerId || (filters.organizerId && filters.organizerId !== "all") ? "organizer" : "website";

  let organizerDetails = null;
  if (reportScope === "organizer") {
    const targetOrganizerId = organizerId || filters.organizerId;
    if (!mongoose.Types.ObjectId.isValid(targetOrganizerId)) {
      throw new ApiError(400, "Invalid organizer selected");
    }

    paymentMatch.organizer = new mongoose.Types.ObjectId(targetOrganizerId);
    organizerDetails = await User.findOne({ _id: targetOrganizerId, role: "TournamentOrganizer" })
      .select("fullName orgName email");

    if (!organizerDetails) {
      throw new ApiError(404, "Organizer not found");
    }
  }

  if (filters.sport && filters.sport !== "all") {
    const sport = await Sport.findOne({ name: filters.sport }).select("_id");
    if (!sport) {
      paymentMatch.tournament = { $in: [] };
    } else {
      const tournamentIds = await Tournament.find({ sport: sport._id }).distinct("_id");
      paymentMatch.tournament = { $in: tournamentIds };
    }
  }

  const registrationPayerTypes = ["Player", "Team"];
  const successMatch = { ...paymentMatch, status: "Success", payerType: { $in: registrationPayerTypes } };
  const pendingMatch = { ...paymentMatch, status: "Pending", payerType: { $in: registrationPayerTypes } };

  const revenuePerMonthAgg = await Payment.aggregate([
    { $match: successMatch },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const revenueBySportAgg = await Payment.aggregate([
    { $match: successMatch },
    { $lookup: { from: "tournaments", localField: "tournament", foreignField: "_id", as: "tournamentInfo" } },
    { $unwind: "$tournamentInfo" },
    { $lookup: { from: "sports", localField: "tournamentInfo.sport", foreignField: "_id", as: "sportInfo" } },
    { $unwind: "$sportInfo" },
    { $group: { _id: "$sportInfo.name", revenue: { $sum: "$amount" }, payments: { $sum: 1 } } },
    { $sort: { revenue: -1 } },
  ]);

  const pendingSummaryAgg = await Payment.aggregate([
    { $match: pendingMatch },
    {
      $group: {
        _id: null,
        pendingCount: { $sum: 1 },
        pendingAmount: { $sum: "$amount" },
      },
    },
  ]);

  const pendingPayments = await Payment.find(pendingMatch)
    .select("amount payerName payerType status createdAt")
    .populate("tournament", "name")
    .sort({ createdAt: -1 })
    .limit(50);

  const paymentRecords = await Payment.find({ ...paymentMatch, payerType: { $in: registrationPayerTypes } })
    .select("amount payerName payerType status createdAt")
    .populate("tournament", "name")
    .sort({ createdAt: -1 })
    .limit(100);

  const tournamentMatch = { createdAt: { $gte: fromDate, $lte: toDate } };
  if (reportScope === "organizer") {
    tournamentMatch.organizer = paymentMatch.organizer;
  }
  if (filters.sport && filters.sport !== "all") {
    const selectedSport = await Sport.findOne({ name: filters.sport }).select("_id");
    tournamentMatch.sport = selectedSport?._id || null;
  }
  const totalTournaments = await Tournament.countDocuments(tournamentMatch);

  const totalRevenue = revenuePerMonthAgg.reduce((sum, item) => sum + item.revenue, 0);
  const pendingCount = pendingSummaryAgg[0]?.pendingCount || 0;
  const pendingAmount = pendingSummaryAgg[0]?.pendingAmount || 0;
  const listingCost = totalTournaments * LISTING_COST_PER_TOURNAMENT;
  const profit = totalRevenue - listingCost;
  const organizerName = (organizerDetails?.orgName || "").trim() || "Unknown Organization";

  return {
    title: reportScope === "organizer"
      ? `Revenue and Payment Report - ${organizerName}`
      : "Revenue and Payment Report - Platform",
    summary: {
      scope: reportScope,
      organizer: organizerDetails
        ? {
            _id: organizerDetails._id,
            name: organizerName,
            email: organizerDetails.email,
          }
        : null,
      totalRevenue,
      registrationRevenue: totalRevenue,
      totalTournaments,
      listingCostPerTournament: LISTING_COST_PER_TOURNAMENT,
      listingCost,
      profit,
      pendingPaymentsCount: pendingCount,
      pendingPaymentsAmount: pendingAmount,
    },
    data: {
      revenuePerMonth: revenuePerMonthAgg.map((item) => ({
        month: `${MONTH_NAMES[item._id.month - 1]} ${item._id.year}`,
        revenue: item.revenue,
      })),
      revenueBySport: revenueBySportAgg.map((item) => ({
        sport: item._id,
        revenue: item.revenue,
        payments: item.payments,
      })),
      payments: paymentRecords.map((payment) => ({
        _id: payment._id,
        payerName: payment.payerName,
        payerType: payment.payerType,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
        tournamentName: payment.tournament?.name || "N/A",
      })),
      pendingPayments: pendingPayments.map((payment) => ({
        _id: payment._id,
        payerName: payment.payerName,
        payerType: payment.payerType,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
        tournamentName: payment.tournament?.name || "N/A",
      })),
    },
  };
};

const buildTournamentReport = async ({ fromDate, toDate, organizerId = null }) => {
  const tournamentMatch = { createdAt: { $gte: fromDate, $lte: toDate } };
  if (organizerId) {
    tournamentMatch.organizer = new mongoose.Types.ObjectId(organizerId);
  }

  const tournaments = await Tournament.find(tournamentMatch)
    .select("name registrationType registeredTeams registeredPlayers organizer createdAt startDate endDate isCancelled")
    .populate("organizer", "fullName orgName")
    .sort({ createdAt: -1 })
    .limit(200);

  const participationData = tournaments.map((tournament) => {
    const teamsRegistered = tournament.registrationType === "Team"
      ? (tournament.registeredTeams?.length || 0)
      : (tournament.registeredPlayers?.length || 0);

    const now = new Date();
    let status = "Upcoming";
    if (tournament.isCancelled) {
      status = "Cancelled";
    } else if (tournament.endDate && new Date(tournament.endDate) < now) {
      status = "Completed";
    } else if (tournament.startDate && new Date(tournament.startDate) <= now) {
      status = "Ongoing";
    }

    return {
      _id: tournament._id,
      tournamentName: tournament.name,
      organizerName: tournament.organizer?.orgName || "Unknown Organization",
      registrationType: tournament.registrationType,
      teamsRegistered,
      status,
      createdAt: tournament.createdAt,
    };
  });

  const totalTournamentsOrganized = tournaments.length;
  const totalTournamentParticipation = participationData.reduce((sum, item) => sum + item.teamsRegistered, 0);

  const statusBreakdown = participationData.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return {
    title: "Tournament Report",
    summary: {
      totalTournamentsOrganized,
      totalTournamentParticipation,
      ongoingTournaments: statusBreakdown.Ongoing || 0,
      completedTournaments: statusBreakdown.Completed || 0,
    },
    data: {
      tournamentParticipation: participationData.map((item) => ({
        tournamentName: item.tournamentName,
        teamsRegistered: item.teamsRegistered,
      })),
      statusBreakdown: Object.entries(statusBreakdown).map(([status, count]) => ({
        status,
        count,
      })),
      tournamentsTable: participationData.map((item) => ({
        _id: item._id,
        tournamentName: item.tournamentName,
        ...(organizerId ? {} : { organizerName: item.organizerName }),
        registrationType: item.registrationType,
        teamsRegistered: item.teamsRegistered,
        status: item.status,
      })),
    },
  };
};

// Generate a report (returns data directly without saving)
export const generateReport = asyncHandler(async (req, res) => {
  const { type, from, to, filters = {} } = req.body;

  if (!type || !from || !to) {
    throw new ApiError(400, "Report type, from date, and to date are required");
  }

  const normalizedType = normalizeReportType(type);
  if (!REPORT_TYPES.includes(normalizedType)) {
    throw new ApiError(400, "Invalid report type");
  }

  const isOrganizer = req.user?.role === "TournamentOrganizer";
  if (isOrganizer && !["Tournament", "RevenuePayment"].includes(normalizedType)) {
    throw new ApiError(403, "Organizers can only generate Tournament and Revenue/Payment reports");
  }

  const { fromDate, toDate } = getDateRange(from, to);

  let reportPayload;
  if (normalizedType === "UserPlayer") {
    reportPayload = await buildUserPlayerReport({ fromDate, toDate, filters });
  } else if (normalizedType === "Tournament") {
    reportPayload = await buildTournamentReport({
      fromDate,
      toDate,
      filters,
      organizerId: isOrganizer ? req.user._id : null,
    });
  } else {
    reportPayload = await buildRevenuePaymentReport({
      fromDate,
      toDate,
      filters,
      organizerId: isOrganizer ? req.user._id : null,
    });
  }

  const reportResponse = {
    ...reportPayload,
    type: normalizedType,
    dateRange: {
      from: fromDate,
      to: toDate,
    },
  };

  res
    .status(200)
    .json(new ApiResponse(200, reportResponse, `${normalizedType} report generated successfully`));
});

// Get all reports
export const getReports = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, [], "Reports functionality disabled"));
});

// Get single report
export const getReportById = asyncHandler(async (req, res) => {
  throw new ApiError(404, "Report history is not available");
});

// Delete report
export const deleteReport = asyncHandler(async (req, res) => {
  throw new ApiError(404, "Report deletion is not available");
});

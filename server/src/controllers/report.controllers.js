import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Report } from "../models/Report.model.js";
import { Payment } from "../models/Payment.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { Sport } from "../models/Sport.model.js";
import { User } from "../models/User.model.js";
import { Match } from "../models/Match.model.js";
import Booking from "../models/Booking.model.js";
import { Team } from "../models/Team.model.js";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Generate a report
export const generateReport = asyncHandler(async (req, res) => {
  const { type, from, to, filters = {} } = req.body;

  if (!type || !from || !to) {
    throw new ApiError(400, "Report type, from date, and to date are required");
  }

  const validTypes = ["Revenue", "Tournament", "User", "Match", "Booking"];
  if (!validTypes.includes(type)) {
    throw new ApiError(400, "Invalid report type");
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  if (fromDate > toDate) {
    throw new ApiError(400, "From date must be before to date");
  }

  let summary = {};
  let data = {};
  const dateFilter = { createdAt: { $gte: fromDate, $lte: toDate } };

  if (type === "Revenue") {
    // Build payment match filter
    const paymentMatch = { ...dateFilter };
    if (filters.sport && filters.sport !== "all") {
      const sport = await Sport.findOne({ name: filters.sport });
      if (sport) {
        const sportTournaments = await Tournament.find({ sport: sport._id }).select("_id");
        paymentMatch.tournament = { $in: sportTournaments.map((t) => t._id) };
      }
    }

    // Overall payment summary (all statuses)
    const paymentAgg = await Payment.aggregate([
      { $match: paymentMatch },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 },
          successAmount: { $sum: { $cond: [{ $eq: ["$status", "Success"] }, "$amount", 0] } },
          successCount: { $sum: { $cond: [{ $eq: ["$status", "Success"] }, 1, 0] } },
          pendingCount: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
          failedCount: { $sum: { $cond: [{ $eq: ["$status", "Failed"] }, 1, 0] } },
          refundedCount: { $sum: { $cond: [{ $eq: ["$status", "Refunded"] }, 1, 0] } },
        },
      },
    ]);

    const stats = paymentAgg[0] || { totalAmount: 0, totalCount: 0, successAmount: 0, successCount: 0, pendingCount: 0, failedCount: 0, refundedCount: 0 };

    // Revenue trend by day
    const revenueTrend = await Payment.aggregate([
      { $match: { ...paymentMatch, status: "Success" } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Payment status breakdown
    const statusBreakdown = await Payment.aggregate([
      { $match: paymentMatch },
      { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
    ]);

    // Revenue by sport
    const revenueBySport = await Payment.aggregate([
      { $match: { ...paymentMatch, status: "Success" } },
      { $lookup: { from: "tournaments", localField: "tournament", foreignField: "_id", as: "tournamentInfo" } },
      { $unwind: "$tournamentInfo" },
      { $lookup: { from: "sports", localField: "tournamentInfo.sport", foreignField: "_id", as: "sportInfo" } },
      { $unwind: "$sportInfo" },
      { $group: { _id: "$sportInfo.name", revenue: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
    ]);

    // Top tournaments by revenue
    const topTournaments = await Payment.aggregate([
      { $match: { ...paymentMatch, status: "Success" } },
      { $lookup: { from: "tournaments", localField: "tournament", foreignField: "_id", as: "tournamentInfo" } },
      { $unwind: "$tournamentInfo" },
      { $group: { _id: { id: "$tournament", name: "$tournamentInfo.name" }, revenue: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    summary = {
      totalRevenue: stats.successAmount,
      totalPayments: stats.totalCount,
      successCount: stats.successCount,
      pendingCount: stats.pendingCount,
      failedCount: stats.failedCount,
    };
    data = {
      revenueTrend: revenueTrend.map((item) => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`,
        revenue: item.revenue,
        count: item.count,
      })),
      statusBreakdown: statusBreakdown.map((s) => ({ name: s._id, count: s.count, amount: s.amount })),
      revenueBySport: revenueBySport.map((s) => ({
        name: s._id,
        revenue: s.revenue,
        percentage: stats.successAmount > 0 ? Math.round((s.revenue / stats.successAmount) * 100) : 0,
      })),
      topTournaments: topTournaments.map((t) => ({
        name: t._id.name,
        revenue: t.revenue,
        registrations: t.count,
        percentage: stats.successAmount > 0 ? Math.round((t.revenue / stats.successAmount) * 100) : 0,
      })),
    };
  } else if (type === "Tournament") {
    const tournamentMatch = { ...dateFilter };
    if (filters.format && filters.format !== "all") tournamentMatch.format = filters.format;
    if (filters.sport && filters.sport !== "all") {
      const sport = await Sport.findOne({ name: filters.sport });
      if (sport) tournamentMatch.sport = sport._id;
    }

    const tournaments = await Tournament.find(tournamentMatch)
      .populate("sport", "name")
      .populate("organizer", "fullName orgName")
      .sort({ createdAt: -1 });

    const totalTournaments = tournaments.length;
    const statusCounts = {};
    const formatCounts = {};
    const sportCounts = {};
    let totalEntryFee = 0;
    let totalPrizePool = 0;

    const now = new Date();
    tournaments.forEach((t) => {
      let status;
      if (t.isCancelled) {
        status = "Cancelled";
      } else if (now > new Date(t.endDate)) {
        status = "Completed";
      } else if (now >= new Date(t.startDate) && now <= new Date(t.endDate)) {
        status = "Live";
      } else {
        status = "Upcoming";
      }
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      formatCounts[t.format] = (formatCounts[t.format] || 0) + 1;
      const sportName = t.sport?.name || "Unknown";
      sportCounts[sportName] = (sportCounts[sportName] || 0) + 1;
      totalEntryFee += t.entryFee || 0;
      totalPrizePool += parseFloat(t.prizePool) || 0;
    });

    // Tournament trend by month
    const tournamentTrend = await Tournament.aggregate([
      { $match: tournamentMatch },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Revenue from these tournaments
    const tournamentIds = tournaments.map((t) => t._id);
    const tournamentRevenue = await Payment.aggregate([
      { $match: { tournament: { $in: tournamentIds }, status: "Success" } },
      { $group: { _id: "$tournament", revenue: { $sum: "$amount" } } },
    ]);
    const revenueMap = {};
    tournamentRevenue.forEach((r) => { revenueMap[r._id.toString()] = r.revenue; });
    const totalRevenue = tournamentRevenue.reduce((sum, r) => sum + r.revenue, 0);

    // Registration fill rates
    const registrationData = tournaments.map((t) => {
      const registered = t.registrationType === "Team" ? (t.registeredTeams?.length || 0) : (t.registeredPlayers?.length || 0);
      const limit = t.teamLimit || 0;
      return { name: t.name, registered, limit, fillRate: limit > 0 ? Math.round((registered / limit) * 100) : 0 };
    }).sort((a, b) => b.fillRate - a.fillRate).slice(0, 10);

    summary = {
      totalTournaments,
      totalRevenue,
      avgEntryFee: totalTournaments > 0 ? Math.round(totalEntryFee / totalTournaments) : 0,
      totalPrizePool,
      formatCounts,
    };
    data = {
      statusBreakdown: Object.entries(statusCounts).map(([name, count]) => ({ name, count })),
      formatBreakdown: Object.entries(formatCounts).map(([name, count]) => ({ name, count })),
      sportBreakdown: Object.entries(sportCounts).map(([name, count]) => ({ name, count })),
      tournamentTrend: tournamentTrend.map((item) => ({ month: `${MONTH_NAMES[item._id.month - 1]} ${item._id.year}`, count: item.count })),
      registrationFillRate: registrationData,
      tournaments: tournaments.slice(0, 50).map((t) => ({
        _id: t._id,
        name: t.name,
        sport: t.sport?.name || "Unknown",
        organizer: t.organizer?.orgName || t.organizer?.fullName || "Unknown",
        format: t.format,
        registrationType: t.registrationType,
        teamLimit: t.teamLimit,
        registered: t.registrationType === "Team" ? (t.registeredTeams?.length || 0) : (t.registeredPlayers?.length || 0),
        entryFee: t.entryFee,
        prizePool: t.prizePool,
        revenue: revenueMap[t._id.toString()] || 0,
        startDate: t.startDate,
        createdAt: t.createdAt,
      })),
    };
  } else if (type === "User") {
    const userMatch = { ...dateFilter };
    if (filters.role && filters.role !== "all") userMatch.role = filters.role;

    // User summary
    const totalUsers = await User.countDocuments(userMatch);
    const activeUsers = await User.countDocuments({ ...userMatch, isActive: true });
    const blockedUsers = await User.countDocuments({ ...userMatch, isBlocked: true });

    // Role breakdown
    const roleBreakdown = await User.aggregate([
      { $match: userMatch },
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Registration trend by month
    const registrationTrend = await User.aggregate([
      { $match: userMatch },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Gender distribution (from Player discriminator)
    const genderDistribution = await User.aggregate([
      { $match: { ...userMatch, role: "Player" } },
      { $group: { _id: "$gender", count: { $sum: 1 } } },
    ]);

    // City distribution (top 10)
    const cityDistribution = await User.aggregate([
      { $match: { ...userMatch, city: { $exists: true, $ne: "" } } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Top sports among players
    const topSports = await User.aggregate([
      { $match: { ...userMatch, role: "Player", sports: { $exists: true } } },
      { $unwind: "$sports" },
      { $lookup: { from: "sports", localField: "sports.sport", foreignField: "_id", as: "sportInfo" } },
      { $unwind: "$sportInfo" },
      { $group: { _id: "$sportInfo.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Teams count
    const totalTeams = await Team.countDocuments(dateFilter);

    summary = { totalUsers, activeUsers, blockedUsers, totalTeams };
    data = {
      roleBreakdown: roleBreakdown.map((r) => ({ name: r._id, count: r.count })),
      registrationTrend: registrationTrend.map((item) => ({ month: `${MONTH_NAMES[item._id.month - 1]} ${item._id.year}`, count: item.count })),
      genderDistribution: genderDistribution.map((g) => ({ name: g._id || "Not Specified", count: g.count })),
      cityDistribution: cityDistribution.map((c) => ({ name: c._id, count: c.count })),
      topSports: topSports.map((s) => ({ name: s._id, count: s.count })),
    };
  } else if (type === "Match") {
    const matchMatch = { ...dateFilter };
    if (filters.sport && filters.sport !== "all") {
      const sport = await Sport.findOne({ name: filters.sport });
      if (sport) matchMatch.sport = sport._id;
    }

    // Match summary
    const totalMatches = await Match.countDocuments(matchMatch);
    const cancelledMatches = await Match.countDocuments({ ...matchMatch, isCancelled: true });
    const scheduledMatches = totalMatches - cancelledMatches;
    const cancellationRate = totalMatches > 0 ? Math.round((cancelledMatches / totalMatches) * 100) : 0;

    // Matches by sport
    const matchesBySport = await Match.aggregate([
      { $match: matchMatch },
      { $lookup: { from: "sports", localField: "sport", foreignField: "_id", as: "sportInfo" } },
      { $unwind: "$sportInfo" },
      { $group: { _id: "$sportInfo.name", total: { $sum: 1 }, cancelled: { $sum: { $cond: ["$isCancelled", 1, 0] } } } },
      { $sort: { total: -1 } },
    ]);

    // Match scheduling trend by month
    const matchTrend = await Match.aggregate([
      { $match: matchMatch },
      { $group: { _id: { year: { $year: "$scheduledAt" }, month: { $month: "$scheduledAt" } }, total: { $sum: 1 }, cancelled: { $sum: { $cond: ["$isCancelled", 1, 0] } } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Ground/Venue usage (top 10)
    const groundUsage = await Match.aggregate([
      { $match: { ...matchMatch, "ground.name": { $exists: true, $ne: "" } } },
      { $group: { _id: { name: "$ground.name", city: "$ground.city" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Matches by tournament (top 10)
    const matchesByTournament = await Match.aggregate([
      { $match: matchMatch },
      { $lookup: { from: "tournaments", localField: "tournament", foreignField: "_id", as: "tournamentInfo" } },
      { $unwind: "$tournamentInfo" },
      { $group: { _id: "$tournamentInfo.name", total: { $sum: 1 }, cancelled: { $sum: { $cond: ["$isCancelled", 1, 0] } } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    summary = { totalMatches, scheduledMatches, cancelledMatches, cancellationRate };
    data = {
      matchesBySport: matchesBySport.map((s) => ({ name: s._id, total: s.total, cancelled: s.cancelled })),
      matchTrend: matchTrend.map((item) => ({ month: `${MONTH_NAMES[item._id.month - 1]} ${item._id.year}`, total: item.total, cancelled: item.cancelled })),
      groundUsage: groundUsage.map((g) => ({ name: g._id.name, city: g._id.city || "-", count: g.count })),
      matchesByTournament: matchesByTournament.map((t) => ({ name: t._id, total: t.total, cancelled: t.cancelled })),
    };
  } else if (type === "Booking") {
    const bookingMatch = { ...dateFilter };
    if (filters.status && filters.status !== "all") bookingMatch.status = filters.status;
    if (filters.registrationType && filters.registrationType !== "all") bookingMatch.registrationType = filters.registrationType;

    // Booking summary
    const bookingAgg = await Booking.aggregate([
      { $match: bookingMatch },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          confirmedCount: { $sum: { $cond: [{ $eq: ["$status", "Confirmed"] }, 1, 0] } },
          pendingCount: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } },
        },
      },
    ]);

    const bStats = bookingAgg[0] || { totalBookings: 0, totalAmount: 0, confirmedCount: 0, pendingCount: 0, cancelledCount: 0 };

    // Booking status breakdown
    const statusBreakdown = await Booking.aggregate([
      { $match: bookingMatch },
      { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
    ]);

    // Booking trend by month
    const bookingTrend = await Booking.aggregate([
      { $match: bookingMatch },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 }, amount: { $sum: "$amount" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Registration type split
    const regTypeSplit = await Booking.aggregate([
      { $match: bookingMatch },
      { $group: { _id: "$registrationType", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
    ]);

    // Payment status for bookings
    const paymentStatusSplit = await Booking.aggregate([
      { $match: bookingMatch },
      { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
    ]);

    // Popular tournaments (by booking count)
    const popularTournaments = await Booking.aggregate([
      { $match: bookingMatch },
      { $lookup: { from: "tournaments", localField: "tournament", foreignField: "_id", as: "tournamentInfo" } },
      { $unwind: "$tournamentInfo" },
      { $group: { _id: "$tournamentInfo.name", bookings: { $sum: 1 }, amount: { $sum: "$amount" } } },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
    ]);

    summary = {
      totalBookings: bStats.totalBookings,
      totalAmount: bStats.totalAmount,
      confirmedCount: bStats.confirmedCount,
      pendingCount: bStats.pendingCount,
      cancelledCount: bStats.cancelledCount,
    };
    data = {
      statusBreakdown: statusBreakdown.map((s) => ({ name: s._id, count: s.count, amount: s.amount })),
      bookingTrend: bookingTrend.map((item) => ({ month: `${MONTH_NAMES[item._id.month - 1]} ${item._id.year}`, count: item.count, amount: item.amount })),
      registrationTypeSplit: regTypeSplit.map((r) => ({ name: r._id, count: r.count, amount: r.amount })),
      paymentStatusSplit: paymentStatusSplit.map((p) => ({ name: p._id, count: p.count })),
      popularTournaments: popularTournaments.map((t) => ({ name: t._id, bookings: t.bookings, amount: t.amount })),
    };
  }

  // Build report title
  const title = `${type} Report`;

  const report = await Report.create({
    title,
    type,
    generatedBy: req.user._id,
    dateRange: { from: fromDate, to: toDate },
    filters,
    summary,
    data,
  });

  res
    .status(201)
    .json(new ApiResponse(201, report, `${type} report generated successfully`));
});

// Get all reports
export const getReports = asyncHandler(async (req, res) => {
  const { search, type, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (type && type !== "all") filter.type = type;
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Report.countDocuments(filter);
  const reports = await Report.find(filter)
    .select("title type dateRange filters summary createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json(
    new ApiResponse(200, { reports, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }, "Reports fetched successfully")
  );
});

// Get single report
export const getReportById = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const report = await Report.findById(reportId);
  if (!report) throw new ApiError(404, "Report not found");
  res.status(200).json(new ApiResponse(200, report, "Report fetched successfully"));
});

// Delete report
export const deleteReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const report = await Report.findByIdAndDelete(reportId);
  if (!report) throw new ApiError(404, "Report not found");
  res.status(200).json(new ApiResponse(200, null, "Report deleted successfully"));
});

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { TournamentOrganizer } from "../models/TournamentOrganizer.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { Payment } from "../models/Payment.model.js";
import { addTournamentStatuses } from "../utils/statusHelpers.js";
import { uploadOnCloudinary, deleteFromCloudinary, getCloudinaryPublicId, getCloudinaryRawPublicId, getPrivateDownloadUrl } from "../utils/cloudinary.js";
import fs from "fs";

// Get all tournament organizers
export const getAllTournamentOrganizers = asyncHandler(async (req, res) => {
  const organizers = await TournamentOrganizer.find({ isActive: true })
    .select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");

  res
    .status(200)
    .json(new ApiResponse(200, organizers, "Tournament organizers retrieved successfully."));
});

// Get tournament organizer by ID
export const getTournamentOrganizerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const organizer = await TournamentOrganizer.findOne({ _id: id, isActive: true })
    .select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");

  if (!organizer) {
    throw new ApiError(404, "Tournament organizer not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, organizer, "Tournament organizer retrieved successfully."));
});

// Get current tournament organizer profile
export const getTournamentOrganizerProfile = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  const organizer = await TournamentOrganizer.findById(organizerId)
    .select("-password -refreshToken");

  if (!organizer) {
    throw new ApiError(404, "Tournament organizer not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, organizer, "Tournament organizer profile retrieved successfully."));
});

// Update tournament organizer profile
export const updateTournamentOrganizerProfile = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { fullName, phone, city, orgName } = req.body;

  const organizer = await TournamentOrganizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Tournament organizer not found.");
  }

  // Update fields if provided
  if (fullName) organizer.fullName = fullName;
  if (phone) organizer.phone = phone;
  if (city) organizer.city = city;
  if (orgName) organizer.orgName = orgName;

  await organizer.save();

  const updatedOrganizer = await TournamentOrganizer.findById(organizerId)
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedOrganizer, "Tournament organizer profile updated successfully."));
});

// Upload verification documents
export const uploadDocuments = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const documentLocalPath = req.file?.path;

  if (!documentLocalPath) {
    throw new ApiError(400, "Document file is required.");
  }

  const organizer = await TournamentOrganizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Tournament organizer not found.");
  }

  const documentResponse = await uploadOnCloudinary(documentLocalPath, {
    folder: "documents",
    resource_type: "raw",
  });

  if (!documentResponse) {
    throw new ApiError(500, "Failed to upload document to Cloudinary.");
  }

  organizer.documents = documentResponse.secure_url || documentResponse.url;
  await organizer.save();

  const updatedOrganizer = await TournamentOrganizer.findById(organizerId)
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedOrganizer, "Documents uploaded successfully."));
});

// Update verification documents
export const updateDocuments = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const documentLocalPath = req.file?.path;

  if (!documentLocalPath) {
    throw new ApiError(400, "Document file is required.");
  }

  const organizer = await TournamentOrganizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Tournament organizer not found.");
  }

  const oldDocumentUrl = organizer?.documents;

  // Delete old document from Cloudinary if exists
  if (oldDocumentUrl) {
    const publicId = getCloudinaryPublicId(oldDocumentUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId, "raw");
    }
  }

  const documentResponse = await uploadOnCloudinary(documentLocalPath, {
    folder: "documents",
    resource_type: "raw",
  });

  if (!documentResponse) {
    throw new ApiError(500, "Failed to upload document to Cloudinary.");
  }

  organizer.documents = documentResponse.secure_url || documentResponse.url;
  await organizer.save();

  const updatedOrganizer = await TournamentOrganizer.findById(organizerId)
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedOrganizer, "Documents updated successfully."));
});

// Delete verification documents
export const deleteDocuments = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  const organizer = await TournamentOrganizer.findById(organizerId);

  if (!organizer) {
    throw new ApiError(404, "Tournament organizer not found.");
  }

  const documentUrl = organizer?.documents;
  if (!documentUrl) {
    throw new ApiError(404, "Documents not found.");
  }

  const publicId = getCloudinaryPublicId(documentUrl);
  if (publicId) {
    await deleteFromCloudinary(publicId, "raw");
  }

  organizer.documents = undefined;
  await organizer.save();

  const updatedOrganizer = await TournamentOrganizer.findById(organizerId)
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedOrganizer, "Documents deleted successfully."));
});

// Get organizer's tournaments
export const getOrganizerTournaments = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  const tournaments = await Tournament.find({ organizer: organizerId })
    .populate("sport", "name teamBased iconUrl")
    .populate({
      path: "registeredTeams",
      select: "name manager players coach medicalTeam",
      populate: { path: "manager", select: "fullName" },
    })
    .populate({
      path: "approvedTeams",
      select: "name manager players coach medicalTeam",
      populate: { path: "manager", select: "fullName" },
    })
    .populate("registeredPlayers", "fullName avatar email phone city")
    .populate("approvedPlayers", "fullName avatar email phone city")
    .sort({ createdAt: -1 })
    .limit(50);

  const tournamentsWithStatus = addTournamentStatuses(tournaments);

  res
    .status(200)
    .json(new ApiResponse(200, tournamentsWithStatus, "Tournaments retrieved successfully."));
});

// Get verified organizers
export const getVerifiedOrganizers = asyncHandler(async (req, res) => {
  const organizers = await TournamentOrganizer.find({ 
    isVerifiedOrganizer: true,
    isActive: true 
  })
    .select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");

  res
    .status(200)
    .json(new ApiResponse(200, organizers, "Verified organizers retrieved successfully."));
});

// Get organizers by city
export const getOrganizersByCity = asyncHandler(async (req, res) => {
  const { city } = req.params;

  const organizers = await TournamentOrganizer.find({ 
    city: { $regex: new RegExp(`^${city}$`, 'i') },
    isActive: true 
  })
    .select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");

  res
    .status(200)
    .json(new ApiResponse(200, organizers, "Tournament organizers retrieved successfully."));
});

// Request authorization
export const requestAuthorization = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const documentLocalPath = req.file?.path;

  if (!documentLocalPath) {
    throw new ApiError(400, "Verification document is required.");
  }

  // Validate PDF file type
  const mimetype = req.file?.mimetype;
  if (mimetype !== "application/pdf") {
    // Clean up the uploaded file
    if (fs.existsSync(documentLocalPath)) {
      fs.unlinkSync(documentLocalPath);
    }
    throw new ApiError(400, "Only PDF files are accepted.");
  }

  const organizer = await TournamentOrganizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Tournament organizer not found.");
  }

  // Check if already authorized
  if (organizer.isAuthorized) {
    throw new ApiError(400, "Organization is already authorized.");
  }

  // Upload document to cloudinary
  const documentResponse = await uploadOnCloudinary(documentLocalPath, {
    folder: "documents",
    resource_type: "raw",
  });

  if (!documentResponse) {
    throw new ApiError(500, "Failed to upload document to Cloudinary.");
  }

  // Update organizer with document and request date
  organizer.verificationDocumentUrl = documentResponse.secure_url || documentResponse.url;
  organizer.authorizationRequestDate = new Date();
  organizer.isRejected = false; // Clear any previous rejection
  
  await organizer.save();

  const updatedOrganizer = await TournamentOrganizer.findById(organizerId)
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedOrganizer, "Authorization request submitted successfully."));
});

// Get authorization status
export const getAuthorizationStatus = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  const organizer = await TournamentOrganizer.findById(organizerId)
    .select("isAuthorized isRejected verificationDocumentUrl authorizationRequestDate authorizedAt");

  if (!organizer) {
    throw new ApiError(404, "Tournament organizer not found.");
  }

  const status = {
    isAuthorized: organizer.isAuthorized,
    verificationDocumentUrl: organizer.verificationDocumentUrl,
    authorizationRequestDate: organizer.authorizationRequestDate,
    authorizedAt: organizer.authorizedAt,
    status: organizer.isAuthorized 
      ? "authorized" 
      : organizer.isRejected
        ? "rejected"
        : organizer.verificationDocumentUrl 
          ? "pending"
          : "not_requested"
  };

  res
    .status(200)
    .json(new ApiResponse(200, status, "Authorization status retrieved successfully."));
});

// Proxy endpoint to serve organizer verification documents
export const getOrganizerDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const organizer = await TournamentOrganizer.findById(id)
    .select("verificationDocumentUrl");

  if (!organizer || !organizer.verificationDocumentUrl) {
    throw new ApiError(404, "Document not found.");
  }

  const documentUrl = organizer.verificationDocumentUrl;

  // Extract public ID from the stored URL (for raw files, includes extension)
  const publicId = getCloudinaryRawPublicId(documentUrl);
  
  if (!publicId) {
    throw new ApiError(500, "Could not determine document ID.");
  }

  // Generate a private download URL that bypasses Cloudinary access restrictions
  const downloadUrl = getPrivateDownloadUrl(publicId, {
    resource_type: "raw",
  });

  // Redirect the user to the authenticated download URL
  res.redirect(downloadUrl);
});

// Get organizer analytics data for charts
export const getOrganizerAnalytics = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  // Get organizer's tournaments
  const tournaments = await Tournament.find({ organizer: organizerId })
    .populate("sport", "name")
    .lean();

  // Always derive status from cancellation flag + dates so cancelled tournaments
  // are represented correctly in the dashboard chart.
  const tournamentsWithStatus = addTournamentStatuses(tournaments);

  // Get organizer's payments
  const payments = await Payment.find({ 
    tournament: { $in: tournaments.map(t => t._id) },
    status: "Success"
  }).lean();

  // Build a stable local month key in YYYY-MM to avoid UTC timezone shifts
  const getMonthKey = (dateInput) => {
    const date = new Date(dateInput);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${date.getFullYear()}-${month}`;
  };

  // Calculate revenue trend (monthly) - Last 12 months
  // Only include incoming tournament payments (exclude organizer platform-fee payments)
  const getRegistrationRevenueAmount = (payment) =>
    (Number(payment.entryFeeAmount) > 0 ? payment.entryFeeAmount : payment.amount) ?? 0;

  const revenueByMonth = {};
  payments.forEach((payment) => {
    if (payment.payerType === "Organizer") {
      return;
    }

    const month = getMonthKey(payment.createdAt);
    if (!revenueByMonth[month]) {
      revenueByMonth[month] = 0;
    }
    revenueByMonth[month] += getRegistrationRevenueAmount(payment);
  });

  // Generate all 12 months (last 12 months including current month)
  const today = new Date();
  const last12Months = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = getMonthKey(date);
    last12Months.push({
      monthKey,
      monthFormatted: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    });
  }

  // Map the revenue data to all 12 months
  const revenueTrend = last12Months.map(({ monthKey, monthFormatted }) => ({
    month: monthFormatted,
    revenue: revenueByMonth[monthKey] || 0,
  }));

  // Tournament status breakdown
  const statusCounts = tournamentsWithStatus.reduce((acc, t) => {
    const status = t.status || "Upcoming";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const tournamentStatus = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  // Sport distribution
  const sportCounts = tournamentsWithStatus.reduce((acc, t) => {
    const sportName = t.sport?.name || "Unknown";
    acc[sportName] = (acc[sportName] || 0) + 1;
    return acc;
  }, {});

  const sportDistribution = Object.entries(sportCounts).map(([sport, count]) => ({
    name: sport,
    value: count,
  }));

  // Total stats
  const totalRegistrations = tournamentsWithStatus.reduce((sum, t) => {
    return sum + (t.registeredTeams?.length || 0) + (t.registeredPlayers?.length || 0);
  }, 0);

  const totalRevenue = payments
    .filter((p) => p.payerType !== "Organizer")
    .reduce((sum, p) => sum + getRegistrationRevenueAmount(p), 0);

  const analytics = {
    revenueTrend,
    tournamentStatus,
    sportDistribution,
    totalTournaments: tournamentsWithStatus.length,
    totalRegistrations,
    totalRevenue,
    totalPayments: payments.length,
  };

  res.status(200).json(new ApiResponse(200, analytics, "Organizer analytics fetched successfully"));
});

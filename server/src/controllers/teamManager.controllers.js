import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { TeamManager } from "../models/TeamManager.model.js";
import { Team } from "../models/Team.model.js";

// Get all team managers
export const getAllTeamManagers = asyncHandler(async (req, res) => {
  const managers = await TeamManager.find({ isActive: true })
    .populate("teams", "name sport city logoUrl")
    .select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");

  res
    .status(200)
    .json(new ApiResponse(200, managers, "Team managers retrieved successfully."));
});

// Get team manager by ID
export const getTeamManagerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const manager = await TeamManager.findOne({ _id: id, isActive: true })
    .populate({
      path: "teams",
      populate: {
        path: "sport",
        select: "name teamBased iconUrl"
      }
    })
    .select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");

  if (!manager) {
    throw new ApiError(404, "Team manager not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, manager, "Team manager retrieved successfully."));
});

// Get current team manager profile
export const getTeamManagerProfile = asyncHandler(async (req, res) => {
  const managerId = req.user._id;

  const manager = await TeamManager.findById(managerId)
    .populate({
      path: "teams",
      populate: {
        path: "sport players",
        select: "name teamBased iconUrl fullName email avatar"
      }
    })
    .select("-password -refreshToken");

  if (!manager) {
    throw new ApiError(404, "Team manager not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, manager, "Team manager profile retrieved successfully."));
});

// Update team manager profile
export const updateTeamManagerProfile = asyncHandler(async (req, res) => {
  const managerId = req.user._id;
  const { fullName, phone, city } = req.body;

  const manager = await TeamManager.findById(managerId);
  if (!manager) {
    throw new ApiError(404, "Team manager not found.");
  }

  // Update fields if provided
  if (fullName) manager.fullName = fullName;
  if (phone) manager.phone = phone;
  if (city) manager.city = city;

  await manager.save();

  const updatedManager = await TeamManager.findById(managerId)
    .populate("teams", "name sport city logoUrl")
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedManager, "Team manager profile updated successfully."));
});

// Get manager's teams
export const getManagerTeams = asyncHandler(async (req, res) => {
  const managerId = req.user._id;

  const teams = await Team.find({ manager: managerId, isActive: true })
    .populate("sport", "name teamBased iconUrl")
    .populate("players", "fullName email avatar");

  res
    .status(200)
    .json(new ApiResponse(200, teams, "Teams retrieved successfully."));
});

// Add achievement
export const addAchievement = asyncHandler(async (req, res) => {
  const managerId = req.user._id;
  const { title, year } = req.body;

  if (!title || !year) {
    throw new ApiError(400, "title and year are required.");
  }

  const manager = await TeamManager.findById(managerId);
  if (!manager) {
    throw new ApiError(404, "Team manager not found.");
  }

  manager.achievements = { title, year };
  await manager.save();

  const updatedManager = await TeamManager.findById(managerId)
    .populate("teams", "name sport city logoUrl")
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedManager, "Achievement added successfully."));
});

// Update achievement
export const updateAchievement = asyncHandler(async (req, res) => {
  const managerId = req.user._id;
  const { title, year } = req.body;

  const manager = await TeamManager.findById(managerId);
  if (!manager) {
    throw new ApiError(404, "Team manager not found.");
  }

  if (title) manager.achievements.title = title;
  if (year) manager.achievements.year = year;

  await manager.save();

  const updatedManager = await TeamManager.findById(managerId)
    .populate("teams", "name sport city logoUrl")
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedManager, "Achievement updated successfully."));
});

// Delete achievement
export const deleteAchievement = asyncHandler(async (req, res) => {
  const managerId = req.user._id;

  const manager = await TeamManager.findById(managerId);
  if (!manager) {
    throw new ApiError(404, "Team manager not found.");
  }

  manager.achievements = undefined;
  await manager.save();

  const updatedManager = await TeamManager.findById(managerId)
    .populate("teams", "name sport city logoUrl")
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedManager, "Achievement deleted successfully."));
});

// Get team managers by city
export const getTeamManagersByCity = asyncHandler(async (req, res) => {
  const { city } = req.params;

  const managers = await TeamManager.find({ 
    city: { $regex: new RegExp(`^${city}$`, 'i') },
    isActive: true 
  })
    .populate("teams", "name sport city logoUrl")
    .select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");

  res
    .status(200)
    .json(new ApiResponse(200, managers, "Team managers retrieved successfully."));
});

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Player } from "../models/Player.model.js";
import { Sport } from "../models/Sport.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

// Get all players
export const getAllPlayers = asyncHandler(async (req, res) => {
  const players = await Player.find({ isActive: true })
    .populate("sports.sport", "name teamBased")
    .select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");

  res
    .status(200)
    .json(new ApiResponse(200, players, "Players retrieved successfully."));
});

// Get player by ID
export const getPlayerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const player = await Player.findOne({ _id: id, isActive: true })
    .populate("sports.sport", "name teamBased iconUrl")
    .select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");

  if (!player) {
    throw new ApiError(404, "Player not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, player, "Player retrieved successfully."));
});

// Get current player profile
export const getPlayerProfile = asyncHandler(async (req, res) => {
  const playerId = req.user._id;

  const player = await Player.findById(playerId)
    .populate("sports.sport", "name teamBased iconUrl")
    .select("-password -refreshToken");

  if (!player) {
    throw new ApiError(404, "Player not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, player, "Player profile retrieved successfully."));
});

// Update player profile
export const updatePlayerProfile = asyncHandler(async (req, res) => {
  const playerId = req.user._id;
  const { fullName, phone, city, bio, age, height, weight, gender, sports, achievements } = req.body;

  const player = await Player.findById(playerId);
  if (!player) {
    throw new ApiError(404, "Player not found.");
  }

  // Update fields if provided
  if (fullName) player.fullName = fullName;
  if (phone) player.phone = phone;
  if (city) player.city = city;
  if (bio !== undefined) player.bio = bio;
  if (age !== undefined) player.age = age;
  if (height !== undefined) player.height = height;
  if (weight !== undefined) player.weight = weight;
  if (gender) player.gender = gender;

  // Update sports array if provided
  if (sports !== undefined) {
    // sports should be an array of { sport: sportId, role: string }
    player.sports = sports.map(s => ({
      sport: typeof s.sport === 'object' ? s.sport._id : s.sport,
      role: s.role || undefined
    })).filter(s => s.sport); // Filter out invalid entries
  }

  // Update achievements array if provided
  if (achievements !== undefined) {
    player.achievements = achievements;
  }

  await player.save();

  const updatedPlayer = await Player.findById(playerId)
    .populate("sports.sport", "name teamBased roles")
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedPlayer, "Player profile updated successfully."));
});

// Add sport to player
export const addSport = asyncHandler(async (req, res) => {
  const playerId = req.user._id;
  const { sportId, role } = req.body;

  if (!sportId || !role) {
    throw new ApiError(400, "sportId and role are required.");
  }

  const sport = await Sport.findById(sportId);
  if (!sport) {
    throw new ApiError(404, "Sport not found.");
  }

  const player = await Player.findById(playerId);
  if (!player) {
    throw new ApiError(404, "Player not found.");
  }

  // Check if sport already exists
  const sportExists = player.sports.some(s => s.sport.toString() === sportId);
  if (sportExists) {
    throw new ApiError(400, "Sport already added to player profile.");
  }

  player.sports.push({ sport: sportId, role });
  await player.save();

  const updatedPlayer = await Player.findById(playerId)
    .populate("sports.sport", "name teamBased iconUrl")
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedPlayer, "Sport added successfully."));
});

// Update sport role
export const updateSportRole = asyncHandler(async (req, res) => {
  const playerId = req.user._id;
  const { sportId, role } = req.body;

  if (!sportId || !role) {
    throw new ApiError(400, "sportId and role are required.");
  }

  const player = await Player.findById(playerId);
  if (!player) {
    throw new ApiError(404, "Player not found.");
  }

  const sportIndex = player.sports.findIndex(s => s.sport.toString() === sportId);
  if (sportIndex === -1) {
    throw new ApiError(404, "Sport not found in player profile.");
  }

  player.sports[sportIndex].role = role;
  await player.save();

  const updatedPlayer = await Player.findById(playerId)
    .populate("sports.sport", "name teamBased iconUrl")
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedPlayer, "Sport role updated successfully."));
});

// Remove sport from player
export const removeSport = asyncHandler(async (req, res) => {
  const playerId = req.user._id;
  const { sportId } = req.params;

  const player = await Player.findById(playerId);
  if (!player) {
    throw new ApiError(404, "Player not found.");
  }

  const sportIndex = player.sports.findIndex(s => s.sport.toString() === sportId);
  if (sportIndex === -1) {
    throw new ApiError(404, "Sport not found in player profile.");
  }

  player.sports.splice(sportIndex, 1);
  await player.save();

  const updatedPlayer = await Player.findById(playerId)
    .populate("sports.sport", "name teamBased iconUrl")
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedPlayer, "Sport removed successfully."));
});

// Add achievement
export const addAchievement = asyncHandler(async (req, res) => {
  const playerId = req.user._id;
  const { title, year } = req.body;

  if (!title || !year) {
    throw new ApiError(400, "title and year are required.");
  }

  const player = await Player.findById(playerId);
  if (!player) {
    throw new ApiError(404, "Player not found.");
  }

  player.achievements.push({ title, year });
  await player.save();

  const updatedPlayer = await Player.findById(playerId)
    .populate("sports.sport", "name teamBased iconUrl")
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedPlayer, "Achievement added successfully."));
});

// Update achievement
export const updateAchievement = asyncHandler(async (req, res) => {
  const playerId = req.user._id;
  const { achievementId } = req.params;
  const { title, year } = req.body;

  const player = await Player.findById(playerId);
  if (!player) {
    throw new ApiError(404, "Player not found.");
  }

  const achievement = player.achievements.id(achievementId);
  if (!achievement) {
    throw new ApiError(404, "Achievement not found.");
  }

  if (title) achievement.title = title;
  if (year) achievement.year = year;

  await player.save();

  const updatedPlayer = await Player.findById(playerId)
    .populate("sports.sport", "name teamBased iconUrl")
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedPlayer, "Achievement updated successfully."));
});

// Delete achievement
export const deleteAchievement = asyncHandler(async (req, res) => {
  const playerId = req.user._id;
  const { achievementId } = req.params;

  const player = await Player.findById(playerId);
  if (!player) {
    throw new ApiError(404, "Player not found.");
  }

  const achievement = player.achievements.id(achievementId);
  if (!achievement) {
    throw new ApiError(404, "Achievement not found.");
  }

  achievement.deleteOne();
  await player.save();

  const updatedPlayer = await Player.findById(playerId)
    .populate("sports.sport", "name teamBased iconUrl")
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedPlayer, "Achievement deleted successfully."));
});

// Get players by sport
export const getPlayersBySport = asyncHandler(async (req, res) => {
  const { sportId } = req.params;

  const players = await Player.find({ 
    "sports.sport": sportId,
    isActive: true 
  })
    .populate("sports.sport", "name teamBased iconUrl")
    .select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");

  res
    .status(200)
    .json(new ApiResponse(200, players, "Players retrieved successfully."));
});

// Get players by city
export const getPlayersByCity = asyncHandler(async (req, res) => {
  const { city } = req.params;

  const players = await Player.find({ 
    city: { $regex: new RegExp(`^${city}$`, 'i') },
    isActive: true 
  })
    .populate("sports.sport", "name teamBased iconUrl")
    .select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");

  res
    .status(200)
    .json(new ApiResponse(200, players, "Players retrieved successfully."));
});

// Update player avatar
export const updatePlayerAvatar = asyncHandler(async (req, res) => {
  const playerId = req.user._id;

  console.log("Avatar upload - File received:", req.file);

  if (!req.file) {
    throw new ApiError(400, "Avatar file is required.");
  }

  const avatarLocalPath = req.file.path;
  console.log("Avatar local path:", avatarLocalPath);

  // Upload to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log("Cloudinary response:", avatar);

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary.");
  }

  // Update player avatar
  const player = await Player.findByIdAndUpdate(
    playerId,
    { avatar: avatar.url },
    { new: true }
  )
    .populate("sports.sport", "name teamBased iconUrl")
    .select("-password -refreshToken");

  console.log("Player updated with new avatar:", player.avatar);

  res
    .status(200)
    .json(new ApiResponse(200, player, "Avatar updated successfully."));
});

// Delete player avatar
export const deletePlayerAvatar = asyncHandler(async (req, res) => {
  const playerId = req.user._id;

  // Update player avatar to null
  const player = await Player.findByIdAndUpdate(
    playerId,
    { avatar: null },
    { new: true }
  )
    .populate("sports.sport", "name teamBased iconUrl")
    .select("-password -refreshToken");

  console.log("Player avatar deleted");

  res
    .status(200)
    .json(new ApiResponse(200, player, "Avatar deleted successfully."));
});

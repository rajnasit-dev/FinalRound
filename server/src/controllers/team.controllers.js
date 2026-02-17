import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Team } from "../models/Team.model.js";
import { Player } from "../models/Player.model.js";
import { Sport } from "../models/Sport.model.js";
import { TeamManager } from "../models/TeamManager.model.js";
import { Request } from "../models/Request.model.js";
import { Match } from "../models/Match.model.js";
import Booking from "../models/Booking.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// Create a new team
export const createTeam = asyncHandler(async (req, res) => {
  const managerId = req.user._id;
  const { name, sport, city, description, gender, openToJoin, achievements, coach, medicalTeam } = req.body;
  const files = req.files || {};
  const logoLocalPath = files.logo?.[0]?.path;
  const bannerLocalPath = files.banner?.[0]?.path;

  if (!name || !sport || !gender) {
    throw new ApiError(400, "Team name, sport, and gender are required.");
  }

  // Verify gender is valid
  if (!["Male", "Female", "Mixed"].includes(gender)) {
    throw new ApiError(400, "Gender must be 'Male', 'Female', or 'Mixed'.");
  }

  // Verify sport exists and is active
  console.log("Creating team with sport ID:", sport);
  const sportDoc = await Sport.findOne({ _id: sport, isActive: true });
  if (!sportDoc) {
    console.log("Sport not found for ID:", sport);
    throw new ApiError(404, "Sport not found.");
  }

  // Verify user is a team manager
  const manager = await TeamManager.findById(managerId);
  if (!manager) {
    throw new ApiError(403, "Only team managers can create teams.");
  }

  let logoResponse = null;
  if (logoLocalPath) {
    try {
      logoResponse = await uploadOnCloudinary(logoLocalPath);
      if (!logoResponse) {
        console.log("Logo upload returned null, continuing without logo");
      }
    } catch (error) {
      console.log("Logo upload failed, continuing without logo:", error.message);
      // Continue without logo - it's optional
    }
  }

  let bannerResponse = null;
  if (bannerLocalPath) {
    try {
      bannerResponse = await uploadOnCloudinary(bannerLocalPath);
      if (!bannerResponse) {
        console.log("Banner upload returned null, continuing without banner");
      }
    } catch (error) {
      console.log("Banner upload failed, continuing without banner:", error.message);
      // Continue without banner - it's optional
    }
  }

  // Parse achievements if provided
  let parsedAchievements = [];
  if (achievements) {
    try {
      parsedAchievements = typeof achievements === 'string' ? JSON.parse(achievements) : achievements;
    } catch (error) {
      parsedAchievements = [];
    }
  }

  // Parse coach if provided
  let parsedCoach = null;
  if (coach) {
    try {
      parsedCoach = typeof coach === 'string' ? JSON.parse(coach) : coach;
    } catch (error) {
      parsedCoach = null;
    }
  }

  // Parse medicalTeam if provided
  let parsedMedicalTeam = [];
  if (medicalTeam) {
    try {
      parsedMedicalTeam = typeof medicalTeam === 'string' ? JSON.parse(medicalTeam) : medicalTeam;
    } catch (error) {
      parsedMedicalTeam = [];
    }
  }

  const team = await Team.create({
    name,
    sport,
    manager: managerId,
    city,
    description,
    gender,
    achievements: parsedAchievements,
    coach: parsedCoach || undefined,
    medicalTeam: parsedMedicalTeam,
    openToJoin: openToJoin !== undefined ? openToJoin : true,
    logoUrl: logoResponse?.url || null,
    bannerUrl: bannerResponse?.url || null,
    players: [],
  });

  // Add team to manager's teams array
  manager.teams.push(team._id);
  await manager.save();

  const populatedTeam = await Team.findById(team._id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar");

  res
    .status(201)
    .json(new ApiResponse(201, populatedTeam, "Team created successfully."));
});

// Get all teams
export const getAllTeams = asyncHandler(async (req, res) => {
  const { sport, city, openToJoin } = req.query;

  let filter = { isActive: true };

  if (sport) filter.sport = sport;
  if (city) filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
  if (openToJoin !== undefined) filter.openToJoin = openToJoin === 'true';

  const teams = await Team.find(filter)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, teams, "Teams retrieved successfully."));
});

// Get team by ID
export const getTeamById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const team = await Team.findOne({ _id: id, isActive: true })
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar phone city")
    .populate("players", "fullName email avatar phone city sports achievements gender dateOfBirth");

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, team, "Team retrieved successfully."));
});

// Update team
export const updateTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;
  const { name, city, description, gender, openToJoin, achievements, coach, medicalTeam } = req.body;

  const team = await Team.findById(id);

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Verify user is the team manager
  if (team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only the team manager can update this team.");
  }

  if (name) team.name = name;
  if (city) team.city = city;
  if (description !== undefined) team.description = description;
  if (gender) {
    if (!["Male", "Female", "Mixed"].includes(gender)) {
      throw new ApiError(400, "Gender must be 'Male', 'Female', or 'Mixed'.");
    }
    team.gender = gender;
  }
  if (openToJoin !== undefined) team.openToJoin = openToJoin;
  if (achievements !== undefined) {
    // Parse achievements if provided as string
    let parsedAchievements = achievements;
    if (typeof achievements === 'string') {
      try {
        parsedAchievements = JSON.parse(achievements);
      } catch (error) {
        parsedAchievements = [];
      }
    }
    team.achievements = parsedAchievements;
  }
  if (coach !== undefined) {
    let parsedCoach = coach;
    if (typeof coach === 'string') {
      try {
        parsedCoach = JSON.parse(coach);
      } catch (error) {
        parsedCoach = null;
      }
    }
    team.coach = parsedCoach;
  }
  if (medicalTeam !== undefined) {
    let parsedMedicalTeam = medicalTeam;
    if (typeof medicalTeam === 'string') {
      try {
        parsedMedicalTeam = JSON.parse(medicalTeam);
      } catch (error) {
        parsedMedicalTeam = [];
      }
    }
    team.medicalTeam = parsedMedicalTeam;
  }

  await team.save();

  const updatedTeam = await Team.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTeam, "Team updated successfully."));
});

// Update team logo
export const updateTeamLogo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;
  const logoLocalPath = req.file?.path;

  if (!logoLocalPath) {
    throw new ApiError(400, "Logo file is required.");
  }

  const team = await Team.findById(id);

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Verify user is the team manager
  if (team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only the team manager can update the team logo.");
  }

  // Delete old logo from Cloudinary if exists
  if (team.logoUrl) {
    try {
      const urlParts = team.logoUrl.split('/');
      const folder = urlParts.slice(-2, -1)[0];
      const publicIdWithExtension = urlParts.at(-1);
      const fileName = publicIdWithExtension.split('.')[0];
      const publicId = `${folder}/${fileName}`;
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.log("Failed to delete old logo from Cloudinary:", error.message);
    }
  }

  const logoResponse = await uploadOnCloudinary(logoLocalPath);

  if (!logoResponse) {
    throw new ApiError(500, "Failed to upload logo to Cloudinary. Please try again.");
  }

  team.logoUrl = logoResponse.url;
  await team.save();

  const updatedTeam = await Team.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTeam, "Team logo updated successfully."));
});

// Update team banner
export const updateTeamBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;
  const bannerLocalPath = req.file?.path;

  if (!bannerLocalPath) {
    throw new ApiError(400, "Banner file is required.");
  }

  const team = await Team.findById(id);

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Verify user is the team manager
  if (team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only the team manager can update the team banner.");
  }

  // Delete old banner from Cloudinary if exists
  if (team.bannerUrl) {
    try {
      const urlParts = team.bannerUrl.split('/');
      const folder = urlParts.slice(-2, -1)[0];
      const publicIdWithExtension = urlParts.at(-1);
      const fileName = publicIdWithExtension.split('.')[0];
      const publicId = `${folder}/${fileName}`;
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.log("Failed to delete old banner from Cloudinary:", error.message);
    }
  }

  const bannerResponse = await uploadOnCloudinary(bannerLocalPath);

  if (!bannerResponse) {
    throw new ApiError(500, "Failed to upload banner to Cloudinary. Please try again.");
  }

  team.bannerUrl = bannerResponse.url;
  await team.save();

  const updatedTeam = await Team.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTeam, "Team banner updated successfully."));
});

// Delete team logo
export const deleteTeamLogo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;

  const team = await Team.findById(id);

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Verify user is the team manager
  if (team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only the team manager can delete the team logo.");
  }

  // Delete logo from Cloudinary if exists
  if (team.logoUrl) {
    const urlParts = team.logoUrl.split('/');
    const publicIdWithExtension = urlParts.at(-1);
    const publicId = publicIdWithExtension.split('.')[0];
    await deleteFromCloudinary(publicId);
  }

  team.logoUrl = null;
  await team.save();

  const updatedTeam = await Team.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTeam, "Team logo deleted successfully."));
});

// Delete team banner
export const deleteTeamBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;

  const team = await Team.findById(id);

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Verify user is the team manager
  if (team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only the team manager can delete the team banner.");
  }

  // Delete banner from Cloudinary if exists
  if (team.bannerUrl) {
    const urlParts = team.bannerUrl.split('/');
    const publicIdWithExtension = urlParts.at(-1);
    const publicId = publicIdWithExtension.split('.')[0];
    await deleteFromCloudinary(publicId);
  }

  team.bannerUrl = null;
  await team.save();

  const updatedTeam = await Team.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTeam, "Team banner deleted successfully."));
});

// Delete team
export const deleteTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;

  const team = await Team.findById(id);

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Verify user is the team manager or an admin
  const isAdmin = req.user.role === "Admin";
  if (!isAdmin && team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only the team manager or an admin can delete this team.");
  }

  // Delete logo from Cloudinary if exists
  if (team.logoUrl) {
    try {
      const urlParts = team.logoUrl.split('/');
      const folder = urlParts.slice(-2, -1)[0]; // Get folder name
      const publicIdWithExtension = urlParts.at(-1);
      const fileName = publicIdWithExtension.split('.')[0];
      const publicId = `${folder}/${fileName}`;
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.log("Failed to delete logo from Cloudinary:", error.message);
    }
  }

  // Delete banner from Cloudinary if exists
  if (team.bannerUrl) {
    try {
      const urlParts = team.bannerUrl.split('/');
      const folder = urlParts.slice(-2, -1)[0];
      const publicIdWithExtension = urlParts.at(-1);
      const fileName = publicIdWithExtension.split('.')[0];
      const publicId = `${folder}/${fileName}`;
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.log("Failed to delete banner from Cloudinary:", error.message);
    }
  }

  // Delete all related requests (where this team is involved)
  await Request.deleteMany({
    $or: [
      { team: id },
      { bookingEntity: id }
    ]
  });

  // Cancel all matches involving this team
  await Match.updateMany(
    {
      $or: [
        { teamA: id },
        { teamB: id }
      ]
    },
    {
      $set: { isCancelled: true }
    }
  );

  // Cancel all bookings related to this team
  await Booking.updateMany(
    { team: id },
    {
      $set: { status: "Cancelled" }
    }
  );

  // Soft delete team
  team.isActive = false;
  await team.save();

  // Remove team from manager's teams array
  await TeamManager.findByIdAndUpdate(team.manager, {
    $pull: { teams: id }
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Team and all related data deleted successfully."));
});

// Add player to team
export const addPlayerToTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;
  const { playerId } = req.body;

  if (!playerId) {
    throw new ApiError(400, "Player ID is required.");
  }

  const team = await Team.findOne({ _id: id, isActive: true });

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Verify user is the team manager
  if (team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only the team manager can add players.");
  }

  // Verify player exists and is active
  const player = await Player.findOne({ _id: playerId, isActive: true });
  if (!player) {
    throw new ApiError(404, "Player not found.");
  }

  // Check if player already in team
  if (team.players.includes(playerId)) {
    throw new ApiError(400, "Player already in the team.");
  }

  team.players.push(playerId);
  await team.save();

  const updatedTeam = await Team.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTeam, "Player added to team successfully."));
});

// Remove player from team
export const removePlayerFromTeam = asyncHandler(async (req, res) => {
  const { id, playerId } = req.params;
  const managerId = req.user._id;

  const team = await Team.findById(id);

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Verify user is the team manager
  if (team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only the team manager can remove players.");
  }

  // Check if player is in team
  if (!team.players.includes(playerId)) {
    throw new ApiError(400, "Player not in the team.");
  }

  team.players = team.players.filter(p => p.toString() !== playerId);
  await team.save();

  const updatedTeam = await Team.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTeam, "Player removed from team successfully."));
});

// Leave team (player self-removal)
export const leaveTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const playerId = req.user._id;

  const team = await Team.findById(id);

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Check if player is in team
  if (!team.players.includes(playerId)) {
    throw new ApiError(400, "You are not a member of this team.");
  }

  // Remove player from team
  team.players = team.players.filter(p => p.toString() !== playerId.toString());
  await team.save();

  const updatedTeam = await Team.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTeam, "You have successfully left the team."));
});

// Get teams by sport
export const getTeamsBySport = asyncHandler(async (req, res) => {
  const { sportId } = req.params;

  const teams = await Team.find({ sport: sportId, isActive: true })
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, teams, "Teams retrieved successfully."));
});

// Get teams by city
export const getTeamsByCity = asyncHandler(async (req, res) => {
  const { city } = req.params;

  const teams = await Team.find({ 
    city: { $regex: new RegExp(`^${city}$`, 'i') },
    isActive: true 
  })
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, teams, "Teams retrieved successfully."));
});

// Search teams
export const searchTeams = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    throw new ApiError(400, "Search query is required.");
  }

  const teams = await Team.find({
    name: { $regex: query, $options: 'i' },
    isActive: true
  })
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar")
    .sort({ createdAt: -1 })
    .limit(20);

  res
    .status(200)
    .json(new ApiResponse(200, teams, "Teams retrieved successfully."));
});

// Get teams where user is a player
export const getPlayerTeams = asyncHandler(async (req, res) => {
  const { playerId } = req.params;

  if (!playerId || playerId === 'undefined') {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No player ID provided"));
  }

  const teams = await Team.find({ 
    players: playerId,
    isActive: true 
  })
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, teams, "Player teams retrieved successfully."));
});

// Get teams by manager
export const getManagerTeams = asyncHandler(async (req, res) => {
  const { managerId } = req.params;

  if (!managerId || managerId === 'undefined') {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No manager ID provided"));
  }

  const teams = await Team.find({ 
    manager: managerId,
    isActive: true 
  })
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("players", "fullName email avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, teams, "Manager teams retrieved successfully."));
});

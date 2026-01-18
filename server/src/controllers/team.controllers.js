import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Team } from "../models/Team.model.js";
import { Player } from "../models/Player.model.js";
import { Sport } from "../models/Sport.model.js";
import { TeamManager } from "../models/TeamManager.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// Create a new team
export const createTeam = asyncHandler(async (req, res) => {
  const managerId = req.user._id;
  const { name, sport, city, description, openToJoin, achievements } = req.body;
  const logoLocalPath = req.file?.path;

  if (!name || !sport) {
    throw new ApiError(400, "Team name and sport are required.");
  }

  // Verify sport exists
  const sportDoc = await Sport.findById(sport);
  if (!sportDoc) {
    throw new ApiError(404, "Sport not found.");
  }

  // Verify user is a team manager
  const manager = await TeamManager.findById(managerId);
  if (!manager) {
    throw new ApiError(403, "Only team managers can create teams.");
  }

  let logoResponse = null;
  if (logoLocalPath) {
    logoResponse = await uploadOnCloudinary(logoLocalPath);
    if (!logoResponse) {
      throw new ApiError(500, "Failed to upload logo to Cloudinary.");
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

  const team = await Team.create({
    name,
    sport,
    manager: managerId,
    city,
    description,
    achievements: parsedAchievements,
    openToJoin: openToJoin !== undefined ? openToJoin : true,
    logoUrl: logoResponse?.url || null,
    players: [],
  });

  // Add team to manager's teams array
  manager.teams.push(team._id);
  await manager.save();

  const populatedTeam = await Team.findById(team._id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("captain", "fullName email avatar")
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
    .populate("captain", "fullName email avatar")
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
    .populate("sport", "name teamBased iconUrl minPlayers maxPlayers")
    .populate("manager", "fullName email avatar phone city")
    .populate("captain", "fullName email avatar phone city sports achievements")
    .populate("players", "fullName email avatar phone city sports achievements");

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
  const { name, city, description, openToJoin, achievements } = req.body;

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

  await team.save();

  const updatedTeam = await Team.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("captain", "fullName email avatar")
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
    const urlParts = team.logoUrl.split('/');
    const publicIdWithExtension = urlParts.at(-1);
    const publicId = publicIdWithExtension.split('.')[0];
    await deleteFromCloudinary(publicId);
  }

  const logoResponse = await uploadOnCloudinary(logoLocalPath);

  if (!logoResponse) {
    throw new ApiError(500, "Failed to upload logo to Cloudinary.");
  }

  team.logoUrl = logoResponse.url;
  await team.save();

  const updatedTeam = await Team.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("captain", "fullName email avatar")
    .populate("players", "fullName email avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTeam, "Team logo updated successfully."));
});

// Delete team
export const deleteTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;

  const team = await Team.findById(id);

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Verify user is the team manager
  if (team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only the team manager can delete this team.");
  }

  // Soft delete
  team.isActive = false;
  await team.save();

  // Remove team from manager's teams array
  await TeamManager.findByIdAndUpdate(managerId, {
    $pull: { teams: id }
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Team deleted successfully."));
});

// Add player to team
export const addPlayerToTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;
  const { playerId } = req.body;

  if (!playerId) {
    throw new ApiError(400, "Player ID is required.");
  }

  const team = await Team.findById(id);

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Verify user is the team manager
  if (team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only the team manager can add players.");
  }

  // Verify player exists
  const player = await Player.findById(playerId);
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
    .populate("captain", "fullName email avatar")
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

  // If player is captain, remove captain designation
  if (team.captain && team.captain.toString() === playerId) {
    team.captain = null;
  }

  team.players = team.players.filter(p => p.toString() !== playerId);
  await team.save();

  const updatedTeam = await Team.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("captain", "fullName email avatar")
    .populate("players", "fullName email avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTeam, "Player removed from team successfully."));
});

// Set team captain
export const setTeamCaptain = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;
  const { playerId } = req.body;

  if (!playerId) {
    throw new ApiError(400, "Player ID is required.");
  }

  const team = await Team.findById(id);

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Verify user is the team manager
  if (team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only the team manager can set captain.");
  }

  // Verify player is in team
  if (!team.players.includes(playerId)) {
    throw new ApiError(400, "Player must be in the team to be captain.");
  }

  team.captain = playerId;
  await team.save();

  const updatedTeam = await Team.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("captain", "fullName email avatar")
    .populate("players", "fullName email avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTeam, "Team captain set successfully."));
});

// Get teams by sport
export const getTeamsBySport = asyncHandler(async (req, res) => {
  const { sportId } = req.params;

  const teams = await Team.find({ sport: sportId, isActive: true })
    .populate("sport", "name teamBased iconUrl")
    .populate("manager", "fullName email avatar")
    .populate("captain", "fullName email avatar")
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
    .populate("captain", "fullName email avatar")
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
    .populate("captain", "fullName email avatar")
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
    .populate("captain", "fullName email avatar")
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
    .populate("captain", "fullName email avatar")
    .populate("players", "fullName email avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, teams, "Manager teams retrieved successfully."));
});

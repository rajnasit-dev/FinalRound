import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Sport } from "../models/Sport.model.js";

// Create a new sport (Admin only)
export const createSport = asyncHandler(async (req, res) => {
  const { name, teamBased } = req.body;

  if (!name || teamBased === undefined) {
    throw new ApiError(400, "name, and teamBased are required fields.");
  }

  // Check if sport already exists
  const existingSport = await Sport.findOne({ name });
  if (existingSport) {
    throw new ApiError(409, "Sport with this name already exists.");
  }

  const sport = await Sport.create({
    name,
    teamBased,
  });

  if (!sport) {
    throw new ApiError(500, "Failed to create sport.");
  }

  res
    .status(201)
    .json(new ApiResponse(201, sport, "Sport created successfully."));
});

// Get all active sports
export const getAllSports = asyncHandler(async (req, res) => {
  const sports = await Sport.find({ isActive: true }).sort({ name: 1 });

  res
    .status(200)
    .json(new ApiResponse(200, sports, "Sports retrieved successfully."));
});

// Get sport by ID
export const getSportById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const sport = await Sport.findOne({ _id: id, isActive: true });

  if (!sport) {
    throw new ApiError(404, "Sport not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, sport, "Sport retrieved successfully."));
});

// Get sport by name
export const getSportByName = asyncHandler(async (req, res) => {
  const { name } = req.params;

  const sport = await Sport.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    isActive: true
  });

  if (!sport) {
    throw new ApiError(404, "Sport not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, sport, "Sport retrieved successfully."));
});

// Update sport (Admin only)
export const updateSport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, teamBased } = req.body;

  const sport = await Sport.findById(id);

  if (!sport) {
    throw new ApiError(404, "Sport not found.");
  }

  // Check if name is being changed and if new name already exists
  if (name && name !== sport.name) {
    const existingSport = await Sport.findOne({ name });
    if (existingSport) {
      throw new ApiError(409, "Sport with this name already exists.");
    }
  }

  // Update fields if provided
  if (name) sport.name = name;
  if (teamBased !== undefined) sport.teamBased = teamBased;

  await sport.save();

  res
    .status(200)
    .json(new ApiResponse(200, sport, "Sport updated successfully."));
});

// Delete sport (Admin only) - Soft delete by setting isActive to false
export const deleteSport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const sport = await Sport.findById(id);

  if (!sport) {
    throw new ApiError(404, "Sport not found.");
  }

  sport.isActive = false;
  await sport.save();

  res
    .status(200)
    .json(new ApiResponse(200, sport, "Sport deleted successfully."));
});

// Get team-based sports
export const getTeamBasedSports = asyncHandler(async (req, res) => {
  const sports = await Sport.find({ teamBased: true, isActive: true }).sort({ name: 1 });

  res
    .status(200)
    .json(new ApiResponse(200, sports, "Team-based sports retrieved successfully."));
});

// Get player sports (non-team-based)
export const getIndividualSports = asyncHandler(async (req, res) => {
  const sports = await Sport.find({ teamBased: false, isActive: true }).sort({ name: 1 });

  res
    .status(200)
    .json(new ApiResponse(200, sports, "Player sports retrieved successfully."));
});

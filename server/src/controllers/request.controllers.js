import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Request } from "../models/Request.model.js";
import { Team } from "../models/Team.model.js";
import { User } from "../models/User.model.js";

// Player sends a request to join a team
export const sendTeamRequest = asyncHandler(async (req, res) => {
  const { teamId, message } = req.body;
  const playerId = req.user._id;

  if (!teamId) {
    throw new ApiError(400, "Team ID is required");
  }

  // Check if team exists
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // Check if player is already in the team
  if (team.players.includes(playerId)) {
    throw new ApiError(400, "Player is already a member of this team");
  }

  // Check if request already exists
  const existingRequest = await Request.findOne({
    sender: playerId,
    receiver: team.manager,
    team: teamId,
    requestType: "PLAYER_TO_TEAM",
    status: "PENDING",
  });

  if (existingRequest) {
    throw new ApiError(400, "Request already sent to this team");
  }

  const request = await Request.create({
    requestType: "PLAYER_TO_TEAM",
    sender: playerId,
    receiver: team.manager,
    team: teamId,
    message: message || "",
  });

  const populatedRequest = await request.populate([
    { path: "sender", select: "fullName avatarUrl" },
    { path: "receiver", select: "fullName" },
    { path: "team", select: "name" },
  ]);

  res
    .status(201)
    .json(
      new ApiResponse(201, populatedRequest, "Request sent successfully")
    );
});

// Team sends a request to a player to join
export const sendPlayerRequest = asyncHandler(async (req, res) => {
  const { playerId, teamId, message } = req.body;
  const managerId = req.user._id;

  if (!playerId || !teamId) {
    throw new ApiError(400, "Player ID and Team ID are required");
  }

  // Check if team exists and manager is the owner
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  if (team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only team manager can send requests");
  }

  // Check if player exists
  const player = await User.findById(playerId);
  if (!player || player.role !== "Player") {
    throw new ApiError(404, "Player not found");
  }

  // Check if player is already in the team
  if (team.players.includes(playerId)) {
    throw new ApiError(400, "Player is already a member of this team");
  }

  // Check if request already exists
  const existingRequest = await Request.findOne({
    sender: managerId,
    receiver: playerId,
    team: teamId,
    requestType: "TEAM_TO_PLAYER",
    status: "PENDING",
  });

  if (existingRequest) {
    throw new ApiError(400, "Request already sent to this player");
  }

  const request = await Request.create({
    requestType: "TEAM_TO_PLAYER",
    sender: managerId,
    receiver: playerId,
    team: teamId,
    message: message || "",
  });

  const populatedRequest = await request.populate([
    { path: "sender", select: "fullName" },
    { path: "receiver", select: "fullName avatarUrl" },
    { path: "team", select: "name" },
  ]);

  res
    .status(201)
    .json(
      new ApiResponse(201, populatedRequest, "Request sent successfully")
    );
});

// Get received requests for player
export const getReceivedRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const requests = await Request.find({
    receiver: userId,
    status: "PENDING",
  })
    .populate("sender", "fullName avatarUrl role")
    .populate("team", "name logoUrl")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        requests,
        "Received requests fetched successfully"
      )
    );
});

// Get sent requests for player
export const getSentRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const requests = await Request.find({
    sender: userId,
    status: "PENDING",
  })
    .populate("receiver", "fullName")
    .populate("team", "name logoUrl")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, requests, "Sent requests fetched successfully")
    );
});

// Get requests for team manager (received by manager for their team)
export const getTeamRequests = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const managerId = req.user._id;

  // Check if user is the team manager
  const team = await Team.findById(teamId);
  if (!team || team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only team manager can view team requests");
  }

  const requests = await Request.find({
    team: teamId,
    requestType: "PLAYER_TO_TEAM",
    status: "PENDING",
  })
    .populate("sender", "fullName avatarUrl email phone city")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, requests, "Team requests fetched successfully")
    );
});

// Accept a request
export const acceptRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  const request = await Request.findById(requestId);
  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.receiver.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only accept requests sent to you");
  }

  if (request.status !== "PENDING") {
    throw new ApiError(400, `Request is already ${request.status.toLowerCase()}`);
  }

  // Check if player is already in team
  const team = await Team.findById(request.team);
  if (team.players.includes(request.sender)) {
    throw new ApiError(400, "Player is already a member of this team");
  }

  // Add player to team
  await Team.findByIdAndUpdate(
    request.team,
    { $addToSet: { players: request.sender } },
    { new: true }
  );

  // Update request status
  request.status = "ACCEPTED";
  await request.save();

  const populatedRequest = await request.populate([
    { path: "sender", select: "fullName" },
    { path: "receiver", select: "fullName" },
    { path: "team", select: "name" },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, populatedRequest, "Request accepted successfully")
    );
});

// Reject a request
export const rejectRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  const request = await Request.findById(requestId);
  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.receiver.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only reject requests sent to you");
  }

  if (request.status !== "PENDING") {
    throw new ApiError(400, `Request is already ${request.status.toLowerCase()}`);
  }

  request.status = "REJECTED";
  await request.save();

  const populatedRequest = await request.populate([
    { path: "sender", select: "fullName" },
    { path: "receiver", select: "fullName" },
    { path: "team", select: "name" },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, populatedRequest, "Request rejected successfully")
    );
});

// Cancel a sent request
export const cancelRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  const request = await Request.findById(requestId);
  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.sender.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only cancel requests you sent");
  }

  if (request.status !== "PENDING") {
    throw new ApiError(400, `Cannot cancel ${request.status.toLowerCase()} request`);
  }

  await Request.findByIdAndDelete(requestId);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Request cancelled successfully"));
});

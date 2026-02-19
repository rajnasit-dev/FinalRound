import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Request } from "../models/Request.model.js";
import { Team } from "../models/Team.model.js";
import { User } from "../models/User.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { sendEmail } from "../middlewares/sendEmail.js";
import {
  playerRequestToTeamHtml,
  teamRequestToPlayerHtml,
  requestAcceptedHtml,
  playerJoinedTeamNotifyHtml,
  requestRejectedHtml,
  requestCancelledHtml,
} from "../utils/emailTemplates.js";

// Player sends a request to join a team
export const sendTeamRequest = asyncHandler(async (req, res) => {
  const { teamId } = req.body;
  const playerId = req.user._id;

  if (!teamId) {
    throw new ApiError(400, "Team ID is required");
  }

  // Check if team exists and is active
  const team = await Team.findOne({ _id: teamId, isActive: true });
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // Check if player is already in the team
  if (team.players.includes(playerId)) {
    throw new ApiError(400, "Player is already a member of this team");
  }

  // Check if player plays the team's sport
  const player = await User.findById(playerId);
  const playsSport = player?.sports?.some(
    (s) => s.sport.toString() === team.sport.toString()
  );
  if (!playsSport) {
    throw new ApiError(400, "You can't join this team as you don't play this sport.");
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
  });

  const populatedRequest = await request.populate([
    { path: "sender", select: "fullName avatarUrl" },
    { path: "receiver", select: "fullName email" },
    { path: "team", select: "name" },
  ]);

  // Send email to team manager about the join request
  try {
    const manager = await User.findById(team.manager).select("fullName email");
    if (manager?.email) {
      await sendEmail({
        email: manager.email,
        subject: `New Join Request for ${team.name} – SportsHub`,
        message: `${player.fullName} has requested to join your team ${team.name}.`,
        html: playerRequestToTeamHtml(manager.fullName, player.fullName, team.name),
      });
    }
  } catch (err) {
    console.log("Failed to send request email to manager:", err.message);
  }

  res
    .status(201)
    .json(
      new ApiResponse(201, populatedRequest, "Request sent successfully")
    );
});

// Team sends a request to a player to join
export const sendPlayerRequest = asyncHandler(async (req, res) => {
  const { playerId, teamId } = req.body;
  const managerId = req.user._id;

  if (!playerId || !teamId) {
    throw new ApiError(400, "Player ID and Team ID are required");
  }

  // Check if team exists and is active
  const team = await Team.findById(teamId).populate("sport", "name _id");
  if (!team || !team.isActive) {
    throw new ApiError(404, "Team not found");
  }

  if (team.manager.toString() !== managerId.toString()) {
    throw new ApiError(403, "Only team manager can send requests");
  }

  // Check if player exists and is active
  const player = await User.findById(playerId).populate("sports.sport", "name _id");
  if (!player || player.role !== "Player" || !player.isActive) {
    throw new ApiError(404, "Player not found");
  }

  // Check if player plays the same sport as the team
  // The player can play multiple sports - we check if ANY of their sports matches the team's sport
  const playerPlaysSport = player.sports && player.sports.length > 0 && player.sports.some(
    s => {
      // Handle both populated and unpopulated sport references
      const sportId = s.sport?._id || s.sport;
      const teamSportId = team.sport?._id || team.sport;
      return sportId.toString() === teamSportId.toString();
    }
  );

  if (!playerPlaysSport) {
    // Get the team sport name for error message
    const teamSportName = team.sport?.name || "this sport";
    throw new ApiError(
      400, 
      `This player does not play ${teamSportName}. Please select a player who plays this sport.`
    );
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
  });

  const populatedRequest = await request.populate([
    { path: "sender", select: "fullName" },
    { path: "receiver", select: "fullName avatarUrl email" },
    { path: "team", select: "name" },
  ]);

  // Send email to player about the team invitation
  try {
    if (player?.email) {
      const manager = await User.findById(managerId).select("fullName");
      await sendEmail({
        email: player.email,
        subject: `Team Invitation from ${team.name} – SportsHub`,
        message: `You have been invited to join ${team.name} by ${manager?.fullName || "the team manager"}.`,
        html: teamRequestToPlayerHtml(player.fullName, team.name, manager?.fullName || "Team Manager"),
      });
    }
  } catch (err) {
    console.log("Failed to send invitation email to player:", err.message);
  }

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
    .populate({ path: "team", select: "name logoUrl sport", populate: { path: "sport", select: "name" } })
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
    .populate("receiver", "fullName email")
    .populate({ path: "team", select: "name logoUrl sport", populate: { path: "sport", select: "name" } })
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

  // Check if team exists and is active
  const team = await Team.findById(request.team);
  if (!team || !team.isActive) {
    throw new ApiError(404, "Team not found or is no longer active");
  }

  // Determine the player to add based on request type
  // PLAYER_TO_TEAM: sender is the player, receiver is the manager
  // TEAM_TO_PLAYER: sender is the manager, receiver is the player
  const playerId = request.requestType === "TEAM_TO_PLAYER" ? request.receiver : request.sender;

  if (team.players.some((p) => p.toString() === playerId.toString())) {
    throw new ApiError(400, "Player is already a member of this team");
  }

  // Add player to team
  await Team.findByIdAndUpdate(
    request.team,
    { $addToSet: { players: playerId } },
    { new: true }
  );

  // Update request status
  request.status = "ACCEPTED";
  await request.save();

  const populatedRequest = await request.populate([
    { path: "sender", select: "fullName email" },
    { path: "receiver", select: "fullName email" },
    { path: "team", select: "name" },
  ]);

  // Send emails to both parties
  try {
    const senderUser = await User.findById(request.sender).select("fullName email");
    const receiverUser = await User.findById(request.receiver).select("fullName email");
    const teamName = populatedRequest.team?.name || "the team";

    // Notify the sender that their request was accepted
    if (senderUser?.email) {
      await sendEmail({
        email: senderUser.email,
        subject: `Request Accepted – You're now part of ${teamName}! – SportsHub`,
        message: `Your request for ${teamName} has been accepted. You are now a team member!`,
        html: requestAcceptedHtml(senderUser.fullName, teamName),
      });
    }

    // Notify the receiver (acceptor) that a player joined
    if (request.requestType === "PLAYER_TO_TEAM" && receiverUser?.email) {
      await sendEmail({
        email: receiverUser.email,
        subject: `${senderUser?.fullName || "A player"} joined ${teamName} – SportsHub`,
        message: `${senderUser?.fullName || "A player"} has joined your team ${teamName}.`,
        html: playerJoinedTeamNotifyHtml(receiverUser.fullName, senderUser?.fullName || "A player", teamName),
      });
    }

    // If TEAM_TO_PLAYER, notify team manager that the player accepted
    if (request.requestType === "TEAM_TO_PLAYER" && senderUser?.email) {
      const manager = await User.findById(request.sender).select("fullName email");
      if (manager?.email) {
        await sendEmail({
          email: manager.email,
          subject: `${receiverUser?.fullName || "Player"} accepted your invitation – SportsHub`,
          message: `${receiverUser?.fullName || "Player"} has accepted the invitation to join ${teamName}.`,
          html: playerJoinedTeamNotifyHtml(manager.fullName, receiverUser?.fullName || "Player", teamName),
        });
      }
    }
  } catch (err) {
    console.log("Failed to send acceptance emails:", err.message);
  }

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
    { path: "sender", select: "fullName email" },
    { path: "receiver", select: "fullName email" },
    { path: "team", select: "name" },
  ]);

  // Notify the sender that their request was rejected
  try {
    const senderUser = await User.findById(request.sender).select("fullName email");
    const teamName = populatedRequest.team?.name || "the team";
    if (senderUser?.email) {
      await sendEmail({
        email: senderUser.email,
        subject: `Request Declined – ${teamName} – SportsHub`,
        message: `Your request for ${teamName} has been declined.`,
        html: requestRejectedHtml(senderUser.fullName, teamName),
      });
    }
  } catch (err) {
    console.log("Failed to send rejection email:", err.message);
  }

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

  // Notify the receiver that the request was cancelled
  try {
    const populatedReq = await request.populate([
      { path: "sender", select: "fullName" },
      { path: "receiver", select: "fullName email" },
      { path: "team", select: "name" },
    ]);
    const receiverUser = populatedReq.receiver;
    if (receiverUser?.email) {
      await sendEmail({
        email: receiverUser.email,
        subject: `Request Cancelled – SportsHub`,
        message: `A request from ${populatedReq.sender?.fullName || "a user"} has been cancelled.`,
        html: requestCancelledHtml(
          receiverUser.fullName,
          populatedReq.sender?.fullName || "A user",
          populatedReq.team?.name || "a team",
          request.requestType
        ),
      });
    }
  } catch (err) {
    console.log("Failed to send cancellation email:", err.message);
  }

  await Request.findByIdAndDelete(requestId);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Request cancelled successfully"));
});

// Organizer Authorization Request (Admin sends to organizer)
export const sendOrganizerAuthorizationRequest = asyncHandler(async (req, res) => {
  const { organizerId } = req.body;
  const adminId = req.user._id;

  if (req.user.role !== "Admin") {
    throw new ApiError(403, "Only admin can send authorization requests");
  }

  if (!organizerId) {
    throw new ApiError(400, "Organizer ID is required");
  }

  // Check if organizer exists and is active
  const organizer = await User.findById(organizerId);
  if (!organizer || organizer.role !== "TournamentOrganizer" || !organizer.isActive) {
    throw new ApiError(404, "Organizer not found");
  }

  // Check if request already exists
  const existingRequest = await Request.findOne({
    sender: adminId,
    receiver: organizerId,
    requestType: "ORGANIZER_AUTHORIZATION",
    status: "PENDING",
  });

  if (existingRequest) {
    throw new ApiError(400, "Authorization request already sent to this organizer");
  }

  const request = await Request.create({
    requestType: "ORGANIZER_AUTHORIZATION",
    sender: adminId,
    receiver: organizerId,
  });

  const populatedRequest = await request.populate([
    { path: "sender", select: "fullName email" },
    { path: "receiver", select: "fullName email" },
  ]);

  res
    .status(201)
    .json(
      new ApiResponse(201, populatedRequest, "Authorization request sent successfully")
    );
});

// Tournament Booking Request (Team/Player to Organizer)
export const sendTournamentBookingRequest = asyncHandler(async (req, res) => {
  const { tournamentId } = req.body;
  const senderId = req.user._id;

  if (!tournamentId) {
    throw new ApiError(400, "Tournament ID is required");
  }

  // Check if tournament exists
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // Check if tournament is for teams or players
  let bookingEntity = null;
  if (req.user.role === "Player") {
    if (tournament.registrationType !== "Player") {
      throw new ApiError(400, "This tournament is only for teams");
    }

    // Check if player plays the tournament's sport
    const player = await User.findById(senderId);
    const playsSport = player?.sports?.some(
      (s) => s.sport.toString() === tournament.sport.toString()
    );
    if (!playsSport) {
      throw new ApiError(400, "You are not eligible for this tournament as you don't play this sport.");
    }
  } else if (req.user.role === "TeamManager") {
    if (tournament.registrationType !== "Team") {
      throw new ApiError(400, "This tournament is only for players");
    }
    // Get the manager's active team
    const team = await Team.findOne({ manager: senderId, isActive: true });
    if (!team) {
      throw new ApiError(404, "Team not found for this manager");
    }
    bookingEntity = team._id;
  } else {
    throw new ApiError(403, "Only players and team managers can book tournaments");
  }

  // Check if request already exists
  const existingRequest = await Request.findOne({
    sender: senderId,
    receiver: tournament.organizer,
    tournament: tournamentId,
    requestType: "TOURNAMENT_BOOKING",
    status: "PENDING",
  });

  if (existingRequest) {
    throw new ApiError(400, "Booking request already sent for this tournament");
  }

  const request = await Request.create({
    requestType: "TOURNAMENT_BOOKING",
    sender: senderId,
    receiver: tournament.organizer,
    tournament: tournamentId,
    bookingEntity: bookingEntity,
  });

  const populatedRequest = await request.populate([
    { path: "sender", select: "fullName avatarUrl" },
    { path: "receiver", select: "fullName" },
    { path: "tournament", select: "name" },
    { path: "bookingEntity", select: "name" },
  ]);

  res
    .status(201)
    .json(
      new ApiResponse(201, populatedRequest, "Booking request sent successfully")
    );
});

// Get all requests for user (organized by type)
export const getAllUserRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const requests = await Request.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .populate("sender", "fullName avatarUrl role")
    .populate("receiver", "fullName avatarUrl role")
    .populate("team", "name logoUrl")
    .populate("tournament", "name")
    .sort({ createdAt: -1 });

  // Organize requests by type
  const organizedRequests = {
    playerToTeam: requests.filter((r) => r.requestType === "PLAYER_TO_TEAM"),
    teamToPlayer: requests.filter((r) => r.requestType === "TEAM_TO_PLAYER"),
    organizerAuth: requests.filter((r) => r.requestType === "ORGANIZER_AUTHORIZATION"),
    tournamentBooking: requests.filter((r) => r.requestType === "TOURNAMENT_BOOKING"),
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, organizedRequests, "All requests fetched successfully")
    );
});

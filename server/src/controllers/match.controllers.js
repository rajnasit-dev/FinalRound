import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Match } from "../models/Match.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { Team } from "../models/Team.model.js";
import { Sport } from "../models/Sport.model.js";
import { Player } from "../models/Player.model.js";
import { addMatchStatus, addMatchStatuses, getMatchStatus } from "../utils/statusHelpers.js";

// Create a new match
export const createMatch = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const {
    tournament,
    sport,
    ground,
    teamA,
    teamB,
    playerA,
    playerB,
    scheduledAt
  } = req.body;

  if (!tournament || !sport || !scheduledAt) {
    throw new ApiError(400, "Tournament, sport, and scheduledAt are required.");
  }

  // Verify tournament exists and user is the organizer
  const tournamentDoc = await Tournament.findById(tournament);
  if (!tournamentDoc) {
    throw new ApiError(404, "Tournament not found.");
  }

  if (tournamentDoc.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can create matches.");
  }

  // Validate based on tournament type
  if (tournamentDoc.registrationType === "Team") {
    if (!teamA || !teamB) {
      throw new ApiError(400, "Both teams are required for team-based matches.");
    }

    // Verify teams exist and are active
    const [teamADoc, teamBDoc] = await Promise.all([
      Team.findOne({ _id: teamA, isActive: true }),
      Team.findOne({ _id: teamB, isActive: true })
    ]);

    if (!teamADoc || !teamBDoc) {
      throw new ApiError(404, "One or both teams not found.");
    }

    // Verify teams are approved for tournament
    if (!tournamentDoc.approvedTeams.includes(teamA) || !tournamentDoc.approvedTeams.includes(teamB)) {
      throw new ApiError(400, "Both teams must be approved for the tournament.");
    }
  } else if (tournamentDoc.registrationType === "Player") {
    if (!playerA || !playerB) {
      throw new ApiError(400, "Both players are required for player-based matches.");
    }

    // Verify players exist and are active
    const [playerADoc, playerBDoc] = await Promise.all([
      Player.findOne({ _id: playerA, isActive: true }),
      Player.findOne({ _id: playerB, isActive: true })
    ]);

    if (!playerADoc || !playerBDoc) {
      throw new ApiError(404, "One or both players not found.");
    }

    // Verify players are approved for tournament
    if (!tournamentDoc.approvedPlayers.includes(playerA) || !tournamentDoc.approvedPlayers.includes(playerB)) {
      throw new ApiError(400, "Both players must be approved for the tournament.");
    }
  }

  // Parse ground if it's a JSON string
  let parsedGround = null;
  if (ground) {
    try {
      parsedGround = typeof ground === 'string' ? JSON.parse(ground) : ground;
    } catch (error) {
      throw new ApiError(400, "Invalid ground format.");
    }
  }

  const matchData = {
    tournament,
    sport,
    ground: parsedGround,
    scheduledAt: new Date(scheduledAt)
  };

  // Add team or player fields based on tournament type
  if (tournamentDoc.registrationType === "Team") {
    matchData.teamA = teamA;
    matchData.teamB = teamB;
  } else if (tournamentDoc.registrationType === "Player") {
    matchData.playerA = playerA;
    matchData.playerB = playerB;
  }

  const match = await Match.create(matchData);

  const populatedMatch = await Match.findById(match._id)
    .populate("tournament", "name format registrationType")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl manager players")
    .populate("teamB", "name logoUrl manager players")
    .populate("playerA", "fullName avatar email")
    .populate("playerB", "fullName avatar email");

  const matchWithStatus = addMatchStatus(populatedMatch);

  res
    .status(201)
    .json(new ApiResponse(201, matchWithStatus, "Match created successfully."));
});

// Get all matches
export const getAllMatches = asyncHandler(async (req, res) => {
  const { tournament, sport, status, team } = req.query;

  let filter = {};

  if (tournament) filter.tournament = tournament;
  if (sport) filter.sport = sport;
  if (team) {
    filter.$or = [{ teamA: team }, { teamB: team }];
  }

  const matches = await Match.find(filter)
    .populate("tournament", "name format")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .sort({ scheduledAt: -1 });

  // Add computed status
  let matchesWithStatus = addMatchStatuses(matches);

  // Filter by status if provided
  if (status) {
    matchesWithStatus = matchesWithStatus.filter(m => 
      m.status && m.status.toLowerCase() === status.toLowerCase()
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, matchesWithStatus, "Matches retrieved successfully."));
});

// Get match by ID
export const getMatchById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const match = await Match.findById(id)
    .populate("tournament", "name format organizer")
    .populate("sport", "name teamBased iconUrl")
    .populate({
      path: "teamA",
      populate: {
        path: "manager players sport",
        select: "fullName email avatar name teamBased iconUrl"
      }
    })
    .populate({
      path: "teamB",
      populate: {
        path: "manager players sport",
        select: "fullName email avatar name teamBased iconUrl"
      }
    });

  if (!match) {
    throw new ApiError(404, "Match not found.");
  }

  const matchWithStatus = addMatchStatus(match);

  res
    .status(200)
    .json(new ApiResponse(200, matchWithStatus, "Match retrieved successfully."));
});

// Update match
export const updateMatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user._id;
  const {
    ground,
    scheduledAt
  } = req.body;

  const match = await Match.findById(id).populate("tournament");

  if (!match) {
    throw new ApiError(404, "Match not found.");
  }

  // Verify user is the tournament organizer
  if (match.tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can update this match.");
  }

  if (ground) {
    try {
      const parsedGround = typeof ground === 'string' ? JSON.parse(ground) : ground;
      match.ground = parsedGround;
    } catch (error) {
      throw new ApiError(400, "Invalid ground format.");
    }
  }

  if (scheduledAt) match.scheduledAt = new Date(scheduledAt);

  await match.save();

  const updatedMatch = await Match.findById(id)
    .populate("tournament", "name format")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl");

  const matchWithStatus = addMatchStatus(updatedMatch);

  res
    .status(200)
    .json(new ApiResponse(200, matchWithStatus, "Match updated successfully."));
});

// Delete match
export const deleteMatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user._id;

  const match = await Match.findById(id).populate("tournament");

  if (!match) {
    throw new ApiError(404, "Match not found.");
  }

  // Verify user is the tournament organizer
  if (match.tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can delete this match.");
  }

  // Can't delete if match is Live or Completed (compute status dynamically)
  const currentStatus = getMatchStatus(match);
  if (currentStatus === "Live" || currentStatus === "Completed") {
    throw new ApiError(400, "Cannot delete a live or completed match.");
  }

  await Match.findByIdAndDelete(id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Match deleted successfully."));
});

// Update match result - DEPRECATED (Scores removed from system)
// This endpoint is kept for backward compatibility but does nothing
export const updateMatchScore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const match = await Match.findById(id)
    .populate("tournament", "name format")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl");

  if (!match) {
    throw new ApiError(404, "Match not found.");
  }

  const matchWithStatus = addMatchStatus(match);

  res
    .status(200)
    .json(new ApiResponse(200, matchWithStatus, "Score updates are no longer supported."));
});

// Update match result - DEPRECATED (Results removed from system)
// This endpoint is kept for backward compatibility but does nothing
export const updateMatchResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user._id;

  const match = await Match.findById(id).populate("tournament");

  if (!match) {
    throw new ApiError(404, "Match not found.");
  }

  // Verify user is the tournament organizer
  if (match.tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can update the match.");
  }

  const updatedMatch = await Match.findById(id)
    .populate("tournament", "name format")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl");

  const matchWithStatus = addMatchStatus(updatedMatch);

  res
    .status(200)
    .json(new ApiResponse(200, matchWithStatus, "Match status updated successfully."));
});

// Get matches by tournament
export const getMatchesByTournament = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;

  const matches = await Match.find({ tournament: tournamentId })
    .populate("tournament", "name format")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .sort({ scheduledAt: 1 });

  const matchesWithStatus = addMatchStatuses(matches);

  res
    .status(200)
    .json(new ApiResponse(200, matchesWithStatus, "Matches retrieved successfully."));
});

// Get matches by team
export const getMatchesByTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const matches = await Match.find({
    $or: [{ teamA: teamId }, { teamB: teamId }]
  })
    .populate("tournament", "name format")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .sort({ scheduledAt: -1 });

  const matchesWithStatus = addMatchStatuses(matches);

  res
    .status(200)
    .json(new ApiResponse(200, matchesWithStatus, "Matches retrieved successfully."));
});

// Get upcoming matches
export const getUpcomingMatches = asyncHandler(async (req, res) => {
  const now = new Date();
  const matches = await Match.find({
    scheduledAt: { $gte: now },
    isCancelled: false
  })
    .populate("tournament", "name format")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .sort({ scheduledAt: 1 })
    .limit(20);

  const matchesWithStatus = addMatchStatuses(matches);

  res
    .status(200)
    .json(new ApiResponse(200, matchesWithStatus, "Upcoming matches retrieved successfully."));
});

// Get live matches
export const getLiveMatches = asyncHandler(async (req, res) => {
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  
  const matches = await Match.find({ 
    scheduledAt: { $gte: threeHoursAgo, $lte: now },
    isCancelled: false
  })
    .populate("tournament", "name format")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .sort({ scheduledAt: -1 });

  const matchesWithStatus = addMatchStatuses(matches);

  res
    .status(200)
    .json(new ApiResponse(200, matchesWithStatus, "Live matches retrieved successfully."));
});

// Get completed matches
export const getCompletedMatches = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  const matches = await Match.find({ 
    scheduledAt: { $lt: threeHoursAgo },
    isCancelled: false
  })
    .populate("tournament", "name format")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .sort({ scheduledAt: -1 })
    .limit(parseInt(limit));

  const matchesWithStatus = addMatchStatuses(matches);

  res
    .status(200)
    .json(new ApiResponse(200, matchesWithStatus, "Completed matches retrieved successfully."));
});

// Cancel/uncancel match
export const updateMatchStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user._id;
  const { isCancelled } = req.body;

  if (typeof isCancelled !== 'boolean') {
    throw new ApiError(400, "isCancelled must be a boolean value.");
  }

  const match = await Match.findById(id).populate("tournament");

  if (!match) {
    throw new ApiError(404, "Match not found.");
  }

  // Verify user is the tournament organizer
  if (match.tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can update the status.");
  }

  match.isCancelled = isCancelled;
  await match.save();

  const updatedMatch = await Match.findById(id)
    .populate("tournament", "name format")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl");

  const matchWithStatus = addMatchStatus(updatedMatch);

  res
    .status(200)
    .json(new ApiResponse(200, matchWithStatus, "Match status updated successfully."));
});

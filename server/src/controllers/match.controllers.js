import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Match } from "../models/Match.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { Team } from "../models/Team.model.js";
import { Sport } from "../models/Sport.model.js";
import { Player } from "../models/Player.model.js";

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
    scheduledAt,
    status
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

    // Verify teams exist
    const [teamADoc, teamBDoc] = await Promise.all([
      Team.findById(teamA),
      Team.findById(teamB)
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

    // Verify players exist
    const [playerADoc, playerBDoc] = await Promise.all([
      Player.findById(playerA),
      Player.findById(playerB)
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
    scheduledAt: new Date(scheduledAt),
    status: status || "Scheduled"
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
    .populate("tournament", "name format status registrationType")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl manager captain players")
    .populate("teamB", "name logoUrl manager captain players")
    .populate("playerA", "fullName avatar email")
    .populate("playerB", "fullName avatar email")
    .populate("manOfTheMatch", "fullName avatar");

  res
    .status(201)
    .json(new ApiResponse(201, populatedMatch, "Match created successfully."));
});

// Get all matches
export const getAllMatches = asyncHandler(async (req, res) => {
  const { tournament, sport, status, team } = req.query;

  let filter = {};

  if (tournament) filter.tournament = tournament;
  if (sport) filter.sport = sport;
  if (status) filter.status = status;
  if (team) {
    filter.$or = [{ teamA: team }, { teamB: team }];
  }

  const matches = await Match.find(filter)
    .populate("tournament", "name format status")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .populate("manOfTheMatch", "fullName avatar")
    .sort({ scheduledAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, matches, "Matches retrieved successfully."));
});

// Get match by ID
export const getMatchById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const match = await Match.findById(id)
    .populate("tournament", "name format status organizer")
    .populate("sport", "name teamBased iconUrl")
    .populate({
      path: "teamA",
      populate: {
        path: "manager captain players sport",
        select: "fullName email avatar name teamBased iconUrl"
      }
    })
    .populate({
      path: "teamB",
      populate: {
        path: "manager captain players sport",
        select: "fullName email avatar name teamBased iconUrl"
      }
    })
    .populate("manOfTheMatch", "fullName avatar email sports");

  if (!match) {
    throw new ApiError(404, "Match not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, match, "Match retrieved successfully."));
});

// Update match
export const updateMatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user._id;
  const {
    ground,
    scheduledAt,
    status,
    scoreA,
    scoreB,
    resultText,
    manOfTheMatch
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
  if (status) match.status = status;
  if (scoreA !== undefined) match.scoreA = scoreA;
  if (scoreB !== undefined) match.scoreB = scoreB;
  if (resultText !== undefined) match.resultText = resultText;

  if (manOfTheMatch) {
    const player = await Player.findById(manOfTheMatch);
    if (!player) {
      throw new ApiError(404, "Player not found for Man of the Match.");
    }
    match.manOfTheMatch = manOfTheMatch;
  }

  await match.save();

  const updatedMatch = await Match.findById(id)
    .populate("tournament", "name format status")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .populate("manOfTheMatch", "fullName avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedMatch, "Match updated successfully."));
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

  // Can't delete if match is Live or Completed
  if (match.status === "Live" || match.status === "Completed") {
    throw new ApiError(400, "Cannot delete a live or completed match.");
  }

  await Match.findByIdAndDelete(id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Match deleted successfully."));
});

// Update match score
export const updateMatchScore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user._id;
  const { scoreA, scoreB } = req.body;

  const match = await Match.findById(id).populate("tournament");

  if (!match) {
    throw new ApiError(404, "Match not found.");
  }

  // Verify user is the tournament organizer
  if (match.tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can update the score.");
  }

  if (scoreA !== undefined) match.scoreA = scoreA;
  if (scoreB !== undefined) match.scoreB = scoreB;

  await match.save();

  const updatedMatch = await Match.findById(id)
    .populate("tournament", "name format status")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .populate("manOfTheMatch", "fullName avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedMatch, "Match score updated successfully."));
});

// Update match result
export const updateMatchResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user._id;
  const { resultText, manOfTheMatch, status } = req.body;

  const match = await Match.findById(id).populate("tournament");

  if (!match) {
    throw new ApiError(404, "Match not found.");
  }

  // Verify user is the tournament organizer
  if (match.tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can update the result.");
  }

  if (resultText !== undefined) match.resultText = resultText;
  if (status) match.status = status;

  if (manOfTheMatch) {
    const player = await Player.findById(manOfTheMatch);
    if (!player) {
      throw new ApiError(404, "Player not found for Man of the Match.");
    }
    match.manOfTheMatch = manOfTheMatch;
  }

  await match.save();

  const updatedMatch = await Match.findById(id)
    .populate("tournament", "name format status")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .populate("manOfTheMatch", "fullName avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedMatch, "Match result updated successfully."));
});

// Get matches by tournament
export const getMatchesByTournament = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;

  const matches = await Match.find({ tournament: tournamentId })
    .populate("tournament", "name format status")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .populate("manOfTheMatch", "fullName avatar")
    .sort({ scheduledAt: 1 });

  res
    .status(200)
    .json(new ApiResponse(200, matches, "Matches retrieved successfully."));
});

// Get matches by team
export const getMatchesByTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const matches = await Match.find({
    $or: [{ teamA: teamId }, { teamB: teamId }]
  })
    .populate("tournament", "name format status")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .populate("manOfTheMatch", "fullName avatar")
    .sort({ scheduledAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, matches, "Matches retrieved successfully."));
});

// Get upcoming matches
export const getUpcomingMatches = asyncHandler(async (req, res) => {
  const matches = await Match.find({
    status: "Scheduled",
    scheduledAt: { $gte: new Date() }
  })
    .populate("tournament", "name format status")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .sort({ scheduledAt: 1 })
    .limit(20);

  res
    .status(200)
    .json(new ApiResponse(200, matches, "Upcoming matches retrieved successfully."));
});

// Get live matches
export const getLiveMatches = asyncHandler(async (req, res) => {
  const matches = await Match.find({ status: "Live" })
    .populate("tournament", "name format status")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .populate("manOfTheMatch", "fullName avatar")
    .sort({ scheduledAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, matches, "Live matches retrieved successfully."));
});

// Get completed matches
export const getCompletedMatches = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const matches = await Match.find({ status: "Completed" })
    .populate("tournament", "name format status")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .populate("manOfTheMatch", "fullName avatar")
    .sort({ scheduledAt: -1 })
    .limit(parseInt(limit));

  res
    .status(200)
    .json(new ApiResponse(200, matches, "Completed matches retrieved successfully."));
});

// Update match status
export const updateMatchStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user._id;
  const { status } = req.body;

  if (!status || !["Scheduled", "Live", "Completed", "Cancelled"].includes(status)) {
    throw new ApiError(400, "Invalid status value.");
  }

  const match = await Match.findById(id).populate("tournament");

  if (!match) {
    throw new ApiError(404, "Match not found.");
  }

  // Verify user is the tournament organizer
  if (match.tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can update the status.");
  }

  match.status = status;
  await match.save();

  const updatedMatch = await Match.findById(id)
    .populate("tournament", "name format status")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .populate("manOfTheMatch", "fullName avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedMatch, "Match status updated successfully."));
});

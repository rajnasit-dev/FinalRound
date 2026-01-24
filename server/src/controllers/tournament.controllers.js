import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tournament } from "../models/Tournament.model.js";
import { Sport } from "../models/Sport.model.js";
import { Team } from "../models/Team.model.js";
import { TournamentOrganizer } from "../models/TournamentOrganizer.model.js";
import { Match } from "../models/Match.model.js";
import { User } from "../models/User.model.js";
import { Request } from "../models/Request.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// Create a new tournament
export const createTournament = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const {
    name,
    sport,
    format,
    description,
    teamLimit,
    playersPerTeam,
    registrationType,
    registrationStart,
    registrationEnd,
    startDate,
    endDate,
    entryFee,
    prizePool,
    rules,
    ground,
    status
  } = req.body;

  const bannerLocalPath = req.file?.path;

  if (!name || !sport || !teamLimit || !registrationStart || !registrationEnd || !startDate || !endDate) {
    throw new ApiError(400, "Required fields are missing.");
  }

  // Verify user is a tournament organizer
  const organizer = await TournamentOrganizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(403, "Only tournament organizers can create tournaments.");
  }

  // Verify sport exists
  const sportDoc = await Sport.findById(sport);
  if (!sportDoc) {
    throw new ApiError(404, "Sport not found.");
  }

  let bannerResponse = null;
  if (bannerLocalPath) {
    bannerResponse = await uploadOnCloudinary(bannerLocalPath);
    if (!bannerResponse) {
      throw new ApiError(500, "Failed to upload banner to Cloudinary.");
    }
  }

  // Parse rules if it's a JSON string
  let parsedRules = [];
  if (rules) {
    try {
      parsedRules = typeof rules === 'string' ? JSON.parse(rules) : rules;
    } catch (error) {
      throw new ApiError(400, "Invalid rules format.");
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

  const tournament = await Tournament.create({
    name,
    sport,
    organizer: organizerId,
    format: format || "League",
    description,
    teamLimit,
    playersPerTeam,
    registrationType: registrationType || "Team",
    registrationStart: new Date(registrationStart),
    registrationEnd: new Date(registrationEnd),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    entryFee: entryFee || 0,
    prizePool,
    rules: parsedRules,
    ground: parsedGround,
    bannerUrl: bannerResponse?.url || null,
    status: status || "Upcoming",
    registeredTeams: [],
    approvedTeams: [],
  });

  const populatedTournament = await Tournament.findById(tournament._id)
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName");

  res
    .status(201)
    .json(new ApiResponse(201, populatedTournament, "Tournament created successfully."));
});

// Get all tournaments
export const getAllTournaments = asyncHandler(async (req, res) => {
  const { sport, status, city, registrationType } = req.query;

  let filter = {};

  if (sport) filter.sport = sport;
  if (status) filter.status = status;
  if (registrationType) filter.registrationType = registrationType;

  const tournaments = await Tournament.find(filter)
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName")
    .populate("registeredTeams", "name logoUrl")
    .populate("approvedTeams", "name logoUrl")
    .sort({ startDate: -1 });

  // Filter by city if provided
  let filteredTournaments = tournaments;
  if (city) {
    filteredTournaments = tournaments.filter(t => 
      t.ground && t.ground.city && t.ground.city.toLowerCase() === city.toLowerCase()
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, filteredTournaments, "Tournaments retrieved successfully."));
});

// Get tournament by ID
export const getTournamentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tournament = await Tournament.findById(id)
    .populate("sport", "name teamBased iconUrl minPlayers maxPlayers")
    .populate("organizer", "fullName email avatar phone city orgName")
    .populate({
      path: "registeredTeams",
      populate: {
        path: "sport manager captain players",
        select: "name teamBased iconUrl fullName email avatar"
      }
    })
    .populate({
      path: "approvedTeams",
      populate: {
        path: "sport manager captain players",
        select: "name teamBased iconUrl fullName email avatar"
      }
    });

  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, tournament, "Tournament retrieved successfully."));
});

// Update tournament
export const updateTournament = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user._id;
  const {
    name,
    format,
    description,
    teamLimit,
    playersPerTeam,
    registrationStart,
    registrationEnd,
    startDate,
    endDate,
    entryFee,
    prizePool,
    rules,
    ground,
    status
  } = req.body;

  const tournament = await Tournament.findById(id);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  // Verify user is the tournament organizer
  if (tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can update this tournament.");
  }

  if (name) tournament.name = name;
  if (format) tournament.format = format;
  if (description !== undefined) tournament.description = description;
  if (teamLimit) tournament.teamLimit = teamLimit;
  if (playersPerTeam) tournament.playersPerTeam = playersPerTeam;
  if (registrationStart) tournament.registrationStart = new Date(registrationStart);
  if (registrationEnd) tournament.registrationEnd = new Date(registrationEnd);
  if (startDate) tournament.startDate = new Date(startDate);
  if (endDate) tournament.endDate = new Date(endDate);
  if (entryFee !== undefined) tournament.entryFee = entryFee;
  if (prizePool !== undefined) tournament.prizePool = prizePool;
  if (status) tournament.status = status;

  if (rules) {
    try {
      tournament.rules = typeof rules === 'string' ? JSON.parse(rules) : rules;
    } catch (error) {
      throw new ApiError(400, "Invalid rules format.");
    }
  }

  if (ground) {
    try {
      const parsedGround = typeof ground === 'string' ? JSON.parse(ground) : ground;
      tournament.ground = parsedGround;
    } catch (error) {
      throw new ApiError(400, "Invalid ground format.");
    }
  }

  await tournament.save();

  const updatedTournament = await Tournament.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName")
    .populate("registeredTeams", "name logoUrl")
    .populate("approvedTeams", "name logoUrl");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTournament, "Tournament updated successfully."));
});

// Generate fixtures (schedule) for a tournament - branched for player vs team
export const generateFixtures = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { id } = req.params; // tournament id

  const tournament = await Tournament.findById(id)
    .populate("sport", "_id name")
    .populate("organizer", "_id")
    .populate("approvedTeams", "_id name")
    .populate("approvedPlayers", "_id fullName");

  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  // Verify user is the tournament organizer
  if (tournament.organizer._id.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can generate fixtures.");
  }

  // If schedule already created, prevent duplicate generation
  if (tournament.isScheduleCreated) {
    throw new ApiError(400, "Fixtures have already been generated for this tournament.");
  }

  let scheduledMatches = [];
  const start = new Date(tournament.startDate);
  const end = new Date(tournament.endDate);
  
  if (isNaN(start) || isNaN(end) || start > end) {
    throw new ApiError(400, "Invalid tournament start/end dates.");
  }

  const totalDays = Math.max(1, Math.ceil((end - start) / (24 * 60 * 60 * 1000)) + 1);

  // Branch based on tournament registration type
  if (tournament.registrationType === "Team") {
    // Team-based fixtures
    const teams = tournament.approvedTeams?.map(t => t._id.toString()) || [];
    if (teams.length < 2) {
      throw new ApiError(400, "At least 2 approved teams are required to generate fixtures.");
    }

    const pairings = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        pairings.push([teams[i], teams[j]]);
      }
    }

    const matchesPerDay = Math.max(1, Math.ceil(pairings.length / totalDays));
    let pairingIndex = 0;

    for (let day = 0; day < totalDays && pairingIndex < pairings.length; day++) {
      for (let k = 0; k < matchesPerDay && pairingIndex < pairings.length; k++) {
        const scheduledAt = new Date(start.getTime() + day * 24 * 60 * 60 * 1000);
        const baseHour = 10 + (k * 3);
        scheduledAt.setHours(baseHour, 0, 0, 0);

        const [teamA, teamB] = pairings[pairingIndex];
        scheduledMatches.push({
          tournament: tournament._id,
          sport: tournament.sport._id || tournament.sport,
          ground: tournament.ground || null,
          teamA,
          teamB,
          scheduledAt,
          status: "Scheduled",
        });
        pairingIndex++;
      }
    }
  } else if (tournament.registrationType === "Player") {
    // Player-based fixtures
    const players = tournament.approvedPlayers?.map(p => p._id.toString()) || [];
    if (players.length < 2) {
      throw new ApiError(400, "At least 2 approved players are required to generate fixtures.");
    }

    const pairings = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        pairings.push([players[i], players[j]]);
      }
    }

    const matchesPerDay = Math.max(1, Math.ceil(pairings.length / totalDays));
    let pairingIndex = 0;

    for (let day = 0; day < totalDays && pairingIndex < pairings.length; day++) {
      for (let k = 0; k < matchesPerDay && pairingIndex < pairings.length; k++) {
        const scheduledAt = new Date(start.getTime() + day * 24 * 60 * 60 * 1000);
        const baseHour = 10 + (k * 3);
        scheduledAt.setHours(baseHour, 0, 0, 0);

        const [playerA, playerB] = pairings[pairingIndex];
        scheduledMatches.push({
          tournament: tournament._id,
          sport: tournament.sport._id || tournament.sport,
          ground: tournament.ground || null,
          playerA,
          playerB,
          scheduledAt,
          status: "Scheduled",
        });
        pairingIndex++;
      }
    }
  }

  if (scheduledMatches.length === 0) {
    throw new ApiError(400, "Could not generate any matches.");
  }

  // Persist matches
  await Match.insertMany(scheduledMatches);

  // Mark schedule created
  tournament.isScheduleCreated = true;
  await tournament.save();

  // Return populated matches
  const populated = await Match.find({ tournament: tournament._id })
    .populate("tournament", "name format status")
    .populate("sport", "name teamBased iconUrl")
    .populate("teamA", "name logoUrl")
    .populate("teamB", "name logoUrl")
    .populate("playerA", "fullName avatar")
    .populate("playerB", "fullName avatar");

  return res.status(201).json(new ApiResponse(201, populated, "Fixtures generated successfully."));
});

// Update tournament banner
export const updateTournamentBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user._id;
  const bannerLocalPath = req.file?.path;

  if (!bannerLocalPath) {
    throw new ApiError(400, "Banner file is required.");
  }

  const tournament = await Tournament.findById(id);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  // Verify user is the tournament organizer
  if (tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can update the banner.");
  }

  // Delete old banner from Cloudinary if exists
  if (tournament.bannerUrl) {
    const urlParts = tournament.bannerUrl.split('/');
    const publicIdWithExtension = urlParts.at(-1);
    const publicId = publicIdWithExtension.split('.')[0];
    await deleteFromCloudinary(publicId);
  }

  const bannerResponse = await uploadOnCloudinary(bannerLocalPath);

  if (!bannerResponse) {
    throw new ApiError(500, "Failed to upload banner to Cloudinary.");
  }

  tournament.bannerUrl = bannerResponse.url;
  await tournament.save();

  const updatedTournament = await Tournament.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTournament, "Tournament banner updated successfully."));
});

// Delete tournament
export const deleteTournament = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user._id;

  const tournament = await Tournament.findById(id);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  // Verify user is the tournament organizer
  if (tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can delete this tournament.");
  }

  // Can't delete if status is Live
  if (tournament.status === "Live") {
    throw new ApiError(400, "Cannot delete a live tournament.");
  }

  await Tournament.findByIdAndDelete(id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Tournament deleted successfully."));
});

// Register team for tournament
export const registerTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { teamId } = req.body;
  const userId = req.user._id;

  if (!teamId) {
    throw new ApiError(400, "Team ID is required.");
  }

  const tournament = await Tournament.findById(id);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  // Check if registration is open
  const now = new Date();
  if (now < tournament.registrationStart || now > tournament.registrationEnd) {
    throw new ApiError(400, "Registration is not open for this tournament.");
  }

  // Check if tournament is at capacity
  if (tournament.registeredTeams.length >= tournament.teamLimit) {
    throw new ApiError(400, "Tournament has reached its team limit.");
  }

  // Verify team exists
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Verify user is the team manager
  if (team.manager.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the team manager can register the team.");
  }

  // Verify team sport matches tournament sport
  if (team.sport.toString() !== tournament.sport.toString()) {
    throw new ApiError(400, "Team sport does not match tournament sport.");
  }

  // Check if team already registered
  if (tournament.registeredTeams.includes(teamId)) {
    throw new ApiError(400, "Team already registered for this tournament.");
  }

  tournament.registeredTeams.push(teamId);
  await tournament.save();

  const updatedTournament = await Tournament.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName")
    .populate("registeredTeams", "name logoUrl manager")
    .populate("approvedTeams", "name logoUrl");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTournament, "Team registered successfully."));
});

// Approve team registration
export const approveTeamRegistration = asyncHandler(async (req, res) => {
  const { id, teamId } = req.params;
  const organizerId = req.user._id;

  const tournament = await Tournament.findById(id);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  // Verify user is the tournament organizer
  if (tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can approve teams.");
  }

  // Check if team is registered
  if (!tournament.registeredTeams.includes(teamId)) {
    throw new ApiError(400, "Team is not registered for this tournament.");
  }

  // Check if team already approved
  if (tournament.approvedTeams.includes(teamId)) {
    throw new ApiError(400, "Team already approved.");
  }

  tournament.approvedTeams.push(teamId);
  await tournament.save();

  const updatedTournament = await Tournament.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName")
    .populate("registeredTeams", "name logoUrl")
    .populate("approvedTeams", "name logoUrl");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTournament, "Team approved successfully."));
});

// Reject team registration
export const rejectTeamRegistration = asyncHandler(async (req, res) => {
  const { id, teamId } = req.params;
  const organizerId = req.user._id;

  const tournament = await Tournament.findById(id);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  // Verify user is the tournament organizer
  if (tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can reject teams.");
  }

  // Remove from registered teams
  tournament.registeredTeams = tournament.registeredTeams.filter(
    t => t.toString() !== teamId
  );

  // Remove from approved teams if present
  tournament.approvedTeams = tournament.approvedTeams.filter(
    t => t.toString() !== teamId
  );

  await tournament.save();

  const updatedTournament = await Tournament.findById(id)
    .populate("sport", "name teamBased")
    .populate("organizer", "fullName email avatar orgName")
    .populate("registeredTeams", "name logoUrl")
    .populate("approvedTeams", "name logoUrl");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTournament, "Team registration rejected."));
});

// Register player for tournament (for single-player tournaments)
export const registerPlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const tournament = await Tournament.findById(id);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  if (tournament.registrationType !== "Player") {
    throw new ApiError(400, "This tournament accepts team registrations only.");
  }

  const now = new Date();
  if (now < tournament.registrationStart || now > tournament.registrationEnd) {
    throw new ApiError(400, "Registration is not open for this tournament.");
  }

  if (tournament.registeredPlayers.length >= tournament.teamLimit) {
    throw new ApiError(400, "Tournament has reached its participant limit.");
  }

  const player = await User.findById(userId);
  if (!player) {
    throw new ApiError(404, "Player not found.");
  }

  if (tournament.registeredPlayers.includes(userId)) {
    throw new ApiError(400, "Already registered for this tournament.");
  }

  tournament.registeredPlayers.push(userId);
  await tournament.save();

  const updated = await Tournament.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName")
    .populate("registeredPlayers", "fullName avatar email")
    .populate("approvedPlayers", "fullName avatar email");

  res.status(200).json(new ApiResponse(200, updated, "Player registered successfully."));
});

// Approve player registration
export const approvePlayerRegistration = asyncHandler(async (req, res) => {
  const { id, playerId } = req.params;
  const organizerId = req.user._id;

  const tournament = await Tournament.findById(id);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  if (tournament.registrationType !== "Player") {
    throw new ApiError(400, "This tournament accepts team registrations only.");
  }

  if (tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can approve players.");
  }

  if (!tournament.registeredPlayers.includes(playerId)) {
    throw new ApiError(400, "Player is not registered for this tournament.");
  }

  if (tournament.approvedPlayers.includes(playerId)) {
    throw new ApiError(400, "Player already approved.");
  }

  tournament.approvedPlayers.push(playerId);
  await tournament.save();

  const updated = await Tournament.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName")
    .populate("registeredPlayers", "fullName avatar email")
    .populate("approvedPlayers", "fullName avatar email");

  res.status(200).json(new ApiResponse(200, updated, "Player approved successfully."));
});

// Reject player registration
export const rejectPlayerRegistration = asyncHandler(async (req, res) => {
  const { id, playerId } = req.params;
  const organizerId = req.user._id;

  const tournament = await Tournament.findById(id);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  if (tournament.registrationType !== "Player") {
    throw new ApiError(400, "This tournament accepts team registrations only.");
  }

  if (tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can reject players.");
  }

  tournament.registeredPlayers = tournament.registeredPlayers.filter(
    (p) => p.toString() !== playerId
  );

  tournament.approvedPlayers = tournament.approvedPlayers.filter(
    (p) => p.toString() !== playerId
  );

  await tournament.save();

  const updated = await Tournament.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName")
    .populate("registeredPlayers", "fullName avatar email")
    .populate("approvedPlayers", "fullName avatar email");

  res.status(200).json(new ApiResponse(200, updated, "Player registration rejected."));
});

// Get participants (teams or players) for organizer dashboard
export const getTournamentParticipants = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tournament = await Tournament.findById(id)
    .populate("registeredTeams", "name logoUrl")
    .populate("approvedTeams", "name logoUrl")
    .populate("registeredPlayers", "fullName avatar email")
    .populate("approvedPlayers", "fullName avatar email")
    .populate("sport", "name registrationType teamBased");

  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  return res.status(200).json(new ApiResponse(200, tournament, "Participants retrieved."));
});
export const getTournamentsBySport = asyncHandler(async (req, res) => {
  const { sportId } = req.params;

  const tournaments = await Tournament.find({ sport: sportId })
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName")
    .sort({ startDate: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, tournaments, "Tournaments retrieved successfully."));
});

// Get upcoming tournaments
export const getUpcomingTournaments = asyncHandler(async (req, res) => {
  const tournaments = await Tournament.find({ 
    status: "Upcoming",
    startDate: { $gte: new Date() }
  })
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName")
    .sort({ startDate: 1 })
    .limit(20);

  res
    .status(200)
    .json(new ApiResponse(200, tournaments, "Upcoming tournaments retrieved successfully."));
});

// Get live tournaments
export const getLiveTournaments = asyncHandler(async (req, res) => {
  const tournaments = await Tournament.find({ status: "Live" })
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName")
    .populate("approvedTeams", "name logoUrl")
    .sort({ startDate: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, tournaments, "Live tournaments retrieved successfully."));
});

// Search tournaments
export const searchTournaments = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    throw new ApiError(400, "Search query is required.");
  }

  const tournaments = await Tournament.find({
    name: { $regex: query, $options: 'i' }
  })
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName")
    .sort({ startDate: -1 })
    .limit(20);

  res
    .status(200)
    .json(new ApiResponse(200, tournaments, "Tournaments retrieved successfully."));
});

// Update tournament status
export const updateTournamentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user._id;
  const { status } = req.body;

  if (!status || !["Upcoming", "Live", "Completed", "Cancelled"].includes(status)) {
    throw new ApiError(400, "Invalid status value.");
  }

  const tournament = await Tournament.findById(id);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  // Verify user is the tournament organizer
  if (tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can update the status.");
  }

  tournament.status = status;
  await tournament.save();

  const updatedTournament = await Tournament.findById(id)
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName");

  res
    .status(200)
    .json(new ApiResponse(200, updatedTournament, "Tournament status updated successfully."));
});

// Get trending tournaments (sorted by number of registered teams)
export const getTrendingTournaments = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const tournaments = await Tournament.find({
    status: { $in: ["Upcoming", "Live"] }
  })
    .populate("sport", "name teamBased iconUrl")
    .populate("organizer", "fullName email avatar orgName")
    .populate("registeredTeams", "name logoUrl")
    .populate("approvedTeams", "name logoUrl")
    .sort({ registeredTeams: -1, startDate: 1 })
    .limit(parseInt(limit));

  // Sort by number of registered teams in descending order
  const sortedTournaments = tournaments.sort((a, b) => 
    b.registeredTeams.length - a.registeredTeams.length
  );

  res
    .status(200)
    .json(new ApiResponse(200, sortedTournaments, "Trending tournaments retrieved successfully."));
});

// Get all pending requests for a tournament (team/player join requests)
export const getTournamentRequests = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user._id;

  // Verify tournament exists and user is organizer
  const tournament = await Tournament.findById(id);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  if (tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Only the tournament organizer can view tournament requests.");
  }

  // Get all requests related to this tournament
  const requests = await Request.find({
    tournament: id,
    status: "PENDING",
  })
    .populate("sender", "fullName avatar email")
    .populate("receiver", "fullName")
    .populate("team", "name logoUrl")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, requests, "Tournament requests retrieved successfully."));
});

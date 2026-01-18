import { Router } from "express";
import {
  createTournament,
  getAllTournaments,
  getTournamentById,
  updateTournament,
  updateTournamentBanner,
  deleteTournament,
  registerTeam,
  approveTeamRegistration,
  rejectTeamRegistration,
  getTournamentsBySport,
  getUpcomingTournaments,
  getLiveTournaments,
  searchTournaments,
  updateTournamentStatus,
  getTrendingTournaments
} from "../controllers/tournament.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const tournamentRouter = Router();

// Public routes
tournamentRouter.get("/", getAllTournaments);
tournamentRouter.get("/search", searchTournaments);
tournamentRouter.get("/trending", getTrendingTournaments);
tournamentRouter.get("/upcoming", getUpcomingTournaments);
tournamentRouter.get("/live", getLiveTournaments);
tournamentRouter.get("/sport/:sportId", getTournamentsBySport);
tournamentRouter.get("/:id", getTournamentById);

// Protected routes - Tournament Organizer
tournamentRouter.post("/", authMiddleware, upload.single("banner"), createTournament);
tournamentRouter.put("/:id", authMiddleware, updateTournament);
tournamentRouter.patch("/:id/banner", authMiddleware, upload.single("banner"), updateTournamentBanner);
tournamentRouter.patch("/:id/status", authMiddleware, updateTournamentStatus);
tournamentRouter.delete("/:id", authMiddleware, deleteTournament);

// Team registration management
tournamentRouter.post("/:id/register", authMiddleware, registerTeam);
tournamentRouter.patch("/:id/approve/:teamId", authMiddleware, approveTeamRegistration);
tournamentRouter.patch("/:id/reject/:teamId", authMiddleware, rejectTeamRegistration);

export default tournamentRouter;

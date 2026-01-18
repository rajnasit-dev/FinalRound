import { Router } from "express";
import {
  createMatch,
  getAllMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
  updateMatchScore,
  updateMatchResult,
  getMatchesByTournament,
  getMatchesByTeam,
  getUpcomingMatches,
  getLiveMatches,
  getCompletedMatches,
  updateMatchStatus
} from "../controllers/match.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const matchRouter = Router();

// Public routes
matchRouter.get("/", getAllMatches);
matchRouter.get("/upcoming", getUpcomingMatches);
matchRouter.get("/live", getLiveMatches);
matchRouter.get("/completed", getCompletedMatches);
matchRouter.get("/tournament/:tournamentId", getMatchesByTournament);
matchRouter.get("/team/:teamId", getMatchesByTeam);
matchRouter.get("/:id", getMatchById);

// Protected routes - Tournament Organizer
matchRouter.post("/", authMiddleware, createMatch);
matchRouter.put("/:id", authMiddleware, updateMatch);
matchRouter.delete("/:id", authMiddleware, deleteMatch);
matchRouter.patch("/:id/score", authMiddleware, updateMatchScore);
matchRouter.patch("/:id/result", authMiddleware, updateMatchResult);
matchRouter.patch("/:id/status", authMiddleware, updateMatchStatus);

export default matchRouter;

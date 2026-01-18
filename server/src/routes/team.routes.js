import { Router } from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  updateTeamLogo,
  deleteTeam,
  addPlayerToTeam,
  removePlayerFromTeam,
  setTeamCaptain,
  getTeamsBySport,
  getTeamsByCity,
  searchTeams,
  getPlayerTeams,
  getManagerTeams
} from "../controllers/team.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const teamRouter = Router();

// Public routes
teamRouter.get("/", getAllTeams);
teamRouter.get("/search", searchTeams);
teamRouter.get("/sport/:sportId", getTeamsBySport);
teamRouter.get("/city/:city", getTeamsByCity);
teamRouter.get("/player/:playerId", getPlayerTeams);
teamRouter.get("/manager/:managerId", getManagerTeams);
teamRouter.get("/:id", getTeamById);

// Protected routes - Team Manager only
teamRouter.post("/", authMiddleware, upload.single("logo"), createTeam);
teamRouter.put("/:id", authMiddleware, updateTeam);
teamRouter.patch("/:id/logo", authMiddleware, upload.single("logo"), updateTeamLogo);
teamRouter.delete("/:id", authMiddleware, deleteTeam);

// Team player management
teamRouter.post("/:id/players", authMiddleware, addPlayerToTeam);
teamRouter.delete("/:id/players/:playerId", authMiddleware, removePlayerFromTeam);
teamRouter.patch("/:id/captain", authMiddleware, setTeamCaptain);

export default teamRouter;

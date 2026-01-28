import { Router } from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  updateTeamLogo,
  updateTeamBanner,
  deleteTeam,
  deleteTeamLogo,
  deleteTeamBanner,
  addPlayerToTeam,
  removePlayerFromTeam,
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
teamRouter.post("/", authMiddleware, upload.fields([{ name: "logo", maxCount: 1 }, { name: "banner", maxCount: 1 }]), createTeam);
teamRouter.put("/:id", authMiddleware, updateTeam);
teamRouter.patch("/:id/logo", authMiddleware, upload.single("logo"), updateTeamLogo);
teamRouter.patch("/:id/banner", authMiddleware, upload.single("banner"), updateTeamBanner);
teamRouter.delete("/:id/logo", authMiddleware, deleteTeamLogo);
teamRouter.delete("/:id/banner", authMiddleware, deleteTeamBanner);
teamRouter.delete("/:id", authMiddleware, deleteTeam);

// Team player management
teamRouter.post("/:id/players", authMiddleware, addPlayerToTeam);
teamRouter.delete("/:id/players/:playerId", authMiddleware, removePlayerFromTeam);

export default teamRouter;

import { Router } from "express";
import {
  getAllTeamManagers,
  getTeamManagerById,
  getTeamManagerProfile,
  updateTeamManagerProfile,
  getManagerTeams,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  getTeamManagersByCity,
} from "../controllers/teamManager.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const teamManagerRouter = Router();

// Public routes
teamManagerRouter.get("/", getAllTeamManagers);
teamManagerRouter.get("/city/:city", getTeamManagersByCity);
teamManagerRouter.get("/:id", getTeamManagerById);

// Protected routes - Team Manager only
teamManagerRouter.get("/profile/me", authMiddleware, getTeamManagerProfile);
teamManagerRouter.put("/profile/me", authMiddleware, updateTeamManagerProfile);
teamManagerRouter.get("/teams/my-teams", authMiddleware, getManagerTeams);

// Achievements management
teamManagerRouter.post("/achievements", authMiddleware, addAchievement);
teamManagerRouter.put("/achievements", authMiddleware, updateAchievement);
teamManagerRouter.delete("/achievements", authMiddleware, deleteAchievement);

export default teamManagerRouter;

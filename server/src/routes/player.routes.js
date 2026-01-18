import { Router } from "express";
import {
  getAllPlayers,
  getPlayerById,
  getPlayerProfile,
  updatePlayerProfile,
  addSport,
  updateSportRole,
  removeSport,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  getPlayersBySport,
  getPlayersByCity,
  updatePlayerAvatar,
  deletePlayerAvatar,
} from "../controllers/player.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const playerRouter = Router();

// Protected routes - Player profile (must be before /:id to avoid matching)
playerRouter.get("/profile/me", authMiddleware, getPlayerProfile);
playerRouter.put("/profile/me", authMiddleware, updatePlayerProfile);
playerRouter.patch("/avatar", authMiddleware, upload.single("avatar"), updatePlayerAvatar);
playerRouter.delete("/avatar", authMiddleware, deletePlayerAvatar);

// Public routes
playerRouter.get("/", getAllPlayers);
playerRouter.get("/sport/:sportId", getPlayersBySport);
playerRouter.get("/city/:city", getPlayersByCity);
playerRouter.get("/:id", getPlayerById);

// Sports management
playerRouter.post("/sports", authMiddleware, addSport);
playerRouter.put("/sports", authMiddleware, updateSportRole);
playerRouter.delete("/sports/:sportId", authMiddleware, removeSport);

// Achievements management
playerRouter.post("/achievements", authMiddleware, addAchievement);
playerRouter.put("/achievements/:achievementId", authMiddleware, updateAchievement);
playerRouter.delete("/achievements/:achievementId", authMiddleware, deleteAchievement);

export default playerRouter;

import { Router } from "express";
import {
  createSport,
  getAllSports,
  getSportById,
  getSportByName,
  updateSport,
  deleteSport,
  getTeamBasedSports,
  getIndividualSports,
} from "../controllers/sport.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const sportRouter = Router();

// Public routes
sportRouter.get("/", getAllSports);
sportRouter.get("/team-based", getTeamBasedSports);
sportRouter.get("/individual", getIndividualSports);
sportRouter.get("/name/:name", getSportByName);
sportRouter.get("/:id", getSportById);

// Protected routes (Admin only - you may want to add admin middleware)
sportRouter.post("/", authMiddleware, createSport);
sportRouter.put("/:id", authMiddleware, updateSport);
sportRouter.delete("/:id", authMiddleware, deleteSport);

export default sportRouter;

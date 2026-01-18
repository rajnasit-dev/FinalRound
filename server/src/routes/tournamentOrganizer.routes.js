import { Router } from "express";
import {
  getAllTournamentOrganizers,
  getTournamentOrganizerById,
  getTournamentOrganizerProfile,
  updateTournamentOrganizerProfile,
  uploadDocuments,
  updateDocuments,
  deleteDocuments,
  getOrganizerTournaments,
  getVerifiedOrganizers,
  getOrganizersByCity,
} from "../controllers/tournamentOrganizer.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const tournamentOrganizerRouter = Router();

// Public routes
tournamentOrganizerRouter.get("/", getAllTournamentOrganizers);
tournamentOrganizerRouter.get("/verified", getVerifiedOrganizers);
tournamentOrganizerRouter.get("/city/:city", getOrganizersByCity);
tournamentOrganizerRouter.get("/:id", getTournamentOrganizerById);

// Protected routes - Tournament Organizer only
tournamentOrganizerRouter.get("/profile/me", authMiddleware, getTournamentOrganizerProfile);
tournamentOrganizerRouter.put("/profile/me", authMiddleware, updateTournamentOrganizerProfile);
tournamentOrganizerRouter.get("/tournaments/my-tournaments", authMiddleware, getOrganizerTournaments);

// Document management
tournamentOrganizerRouter.post("/documents", authMiddleware, upload.single("document"), uploadDocuments);
tournamentOrganizerRouter.put("/documents", authMiddleware, upload.single("document"), updateDocuments);
tournamentOrganizerRouter.delete("/documents", authMiddleware, deleteDocuments);

export default tournamentOrganizerRouter;

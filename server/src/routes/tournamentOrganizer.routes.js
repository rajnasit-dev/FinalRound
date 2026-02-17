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
  requestAuthorization,
  getAuthorizationStatus,
  getOrganizerDocument,
} from "../controllers/tournamentOrganizer.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const tournamentOrganizerRouter = Router();

// Public routes
tournamentOrganizerRouter.get("/", getAllTournamentOrganizers);
tournamentOrganizerRouter.get("/verified", getVerifiedOrganizers);
tournamentOrganizerRouter.get("/city/:city", getOrganizersByCity);

// Protected routes - Tournament Organizer only
tournamentOrganizerRouter.get("/profile/me", authMiddleware, getTournamentOrganizerProfile);
tournamentOrganizerRouter.put("/profile/me", authMiddleware, updateTournamentOrganizerProfile);
tournamentOrganizerRouter.get("/tournaments/my-tournaments", authMiddleware, getOrganizerTournaments);

// Authorization management
tournamentOrganizerRouter.post("/request-authorization", authMiddleware, upload.single("document"), requestAuthorization);
tournamentOrganizerRouter.get("/authorization-status", authMiddleware, getAuthorizationStatus);

// Document management
tournamentOrganizerRouter.post("/documents", authMiddleware, upload.single("document"), uploadDocuments);
tournamentOrganizerRouter.put("/documents", authMiddleware, upload.single("document"), updateDocuments);
tournamentOrganizerRouter.delete("/documents", authMiddleware, deleteDocuments);

// Proxy endpoint to serve organizer verification documents
tournamentOrganizerRouter.get("/document/:id", authMiddleware, getOrganizerDocument);

// Dynamic ID route - MUST be last to avoid catching other routes
tournamentOrganizerRouter.get("/:id", getTournamentOrganizerById);

export default tournamentOrganizerRouter;

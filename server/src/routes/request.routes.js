import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  sendTeamRequest,
  sendPlayerRequest,
  getReceivedRequests,
  getSentRequests,
  getTeamRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  sendOrganizerAuthorizationRequest,
  sendTournamentBookingRequest,
  getAllUserRequests,
} from "../controllers/request.controllers.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all requests for current user (organized by type)
router.get("/all", getAllUserRequests);

// Player requests to join a team
router.post("/send-team-request", sendTeamRequest);

// Team sends request to a player
router.post("/send-player-request", sendPlayerRequest);

// Organizer Authorization request (Admin only)
router.post("/send-authorization", sendOrganizerAuthorizationRequest);

// Tournament Booking request
router.post("/send-booking", sendTournamentBookingRequest);

// Get received requests for current user
router.get("/received", getReceivedRequests);

// Get sent requests for current user
router.get("/sent", getSentRequests);

// Get requests for a specific team (for team manager)
router.get("/team/:teamId", getTeamRequests);

// Accept a request
router.patch("/accept/:requestId", acceptRequest);

// Reject a request
router.patch("/reject/:requestId", rejectRequest);

// Cancel a sent request
router.delete("/cancel/:requestId", cancelRequest);

export default router;

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
} from "../controllers/request.controllers.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Player requests to join a team
router.post("/send-team-request", sendTeamRequest);

// Team sends request to a player
router.post("/send-player-request", sendPlayerRequest);

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

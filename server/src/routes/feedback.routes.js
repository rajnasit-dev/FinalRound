import { Router } from "express";
import {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  getUserFeedback,
  updateFeedback,
  deleteFeedback
} from "../controllers/feedback.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const feedbackRouter = Router();

// Public routes
feedbackRouter.get("/", getAllFeedback);
feedbackRouter.get("/:id", getFeedbackById);

// Protected routes
feedbackRouter.post("/", authMiddleware, createFeedback);
feedbackRouter.get("/user/me", authMiddleware, getUserFeedback);
feedbackRouter.put("/:id", authMiddleware, updateFeedback);
feedbackRouter.delete("/:id", authMiddleware, deleteFeedback);

export default feedbackRouter;

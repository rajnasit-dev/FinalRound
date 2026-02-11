import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getPendingOrganizerRequests,
  getAllOrganizers,
  authorizeOrganizer,
  rejectOrganizer,
  getAllUsers,
  getAllTournaments,
  getAllTeams,
  getRevenue,
  getDashboardStats,
  getAllPayments,
  deleteUser,
  updateUser,
  getOtpSetting,
  toggleOtpSetting,
} from "../controllers/admin.controllers.js";

const router = Router();

// Admin authentication middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }
  next();
};

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard statistics
router.get("/dashboard/stats", getDashboardStats);

// Organizer management
router.get("/organizers/pending", getPendingOrganizerRequests);
router.get("/organizers", getAllOrganizers);
router.patch("/organizers/:organizerId/authorize", authorizeOrganizer);
router.patch("/organizers/:organizerId/reject", rejectOrganizer);

// User management
router.get("/users", getAllUsers);
router.patch("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);

// Tournament management
router.get("/tournaments", getAllTournaments);

// Team management
router.get("/teams", getAllTeams);

// Revenue/Profit management
router.get("/revenue", getRevenue);

// Payments management
router.get("/payments", getAllPayments);

// Settings
router.get("/settings/otp", getOtpSetting);
router.patch("/settings/otp/toggle", toggleOtpSetting);

export default router;

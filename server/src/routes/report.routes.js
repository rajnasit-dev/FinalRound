import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  generateReport,
  getReports,
  getReportById,
  deleteReport,
} from "../controllers/report.controllers.js";

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

router.use(authMiddleware);
router.use(adminMiddleware);

router.post("/generate", generateReport);
router.get("/", getReports);
router.get("/:reportId", getReportById);
router.delete("/:reportId", deleteReport);

export default router;

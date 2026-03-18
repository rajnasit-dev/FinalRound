import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  generateReport,
  getReports,
  getReportById,
  deleteReport,
} from "../controllers/report.controllers.js";

const organizerReportRouter = Router();

const organizerMiddleware = (req, res, next) => {
  if (req.user.role !== "TournamentOrganizer") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Tournament organizers only.",
    });
  }
  next();
};

organizerReportRouter.use(authMiddleware);
organizerReportRouter.use(organizerMiddleware);

organizerReportRouter.post("/generate", generateReport);
organizerReportRouter.get("/", getReports);
organizerReportRouter.get("/:reportId", getReportById);
organizerReportRouter.delete("/:reportId", deleteReport);

export default organizerReportRouter;

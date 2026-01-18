import { Router } from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  getPaymentsByTournament,
  getUserPayments,
  getPaymentsByTeam,
  deletePayment,
  getOrganizerPaymentStats
} from "../controllers/payment.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const paymentRouter = Router();

// All routes are protected
paymentRouter.use(authMiddleware);

paymentRouter.post("/", createPayment);
paymentRouter.get("/", getAllPayments);
paymentRouter.get("/user/me", getUserPayments);
paymentRouter.get("/stats/organizer", getOrganizerPaymentStats);
paymentRouter.get("/tournament/:tournamentId", getPaymentsByTournament);
paymentRouter.get("/team/:teamId", getPaymentsByTeam);
paymentRouter.get("/:id", getPaymentById);
paymentRouter.patch("/:id/status", updatePaymentStatus);
paymentRouter.delete("/:id", deletePayment);

export default paymentRouter;

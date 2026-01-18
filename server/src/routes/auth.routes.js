import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
  verifyEmail,
  resendOtp,
  registerPlayer,
  registerTeamManager,
  registerTournamentOrganizer,
  refreshAccessToken,
} from "../controllers/auth.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";


const authRouter = Router();

authRouter.post("/player", upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverImage", maxCount: 1 }
]), registerPlayer);
authRouter.post("/manager", upload.fields([
  { name: "avatar", maxCount: 1 }
]), registerTeamManager);
authRouter.post("/organizer", upload.fields([
  { name: "avatar", maxCount: 1 }
]), registerTournamentOrganizer);

authRouter.post("/verify-email", verifyEmail);
authRouter.post("/resend-otp", resendOtp);

authRouter.post("/login", login);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);

authRouter.post("/refresh-token", refreshAccessToken);

//secure routes
authRouter.post("/logout",authMiddleware, logout);

export default authRouter;
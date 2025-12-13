import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
  verifyEmail,
  registerPlayer,
  registerTeamManager,
  registerTournamentOrganizer,
  refreshAccessToken,
} from "../controllers/auth.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";


const authRouter = Router();

authRouter.post("/player", upload.single("avatar"), registerPlayer);
authRouter.post("/manager", upload.single("avatar"), registerTeamManager);
authRouter.post("/organizer", upload.single("avatar"), registerTournamentOrganizer);

authRouter.post("/verify-email", verifyEmail);

authRouter.post("/login", login);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);

authRouter.post("/refresh-token", refreshAccessToken);

//secure routes
authRouter.post("/logout",authMiddleware, logout);

export default authRouter;
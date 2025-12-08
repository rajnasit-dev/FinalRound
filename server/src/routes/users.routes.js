import { Router } from "express";
import {
  emailVerify,
  getAllUsers,
  getUser,
  resetPassword,
} from "../controllers/user.controllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const userRouter = Router();

userRouter.get("/", getAllUsers);
userRouter.get("/profile", authMiddleware, getUser);
userRouter.post("/email-verify", emailVerify);
userRouter.post("/reset-password/:token", resetPassword);

export default userRouter;

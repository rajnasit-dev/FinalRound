import { Router } from "express";
import { forgotPassword, loginUser, logoutUser, registerUser, resetPassword } from "../controllers/user.controllers";


const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/logout", logoutUser);

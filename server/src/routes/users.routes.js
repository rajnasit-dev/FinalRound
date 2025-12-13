import { Router } from "express";
import {
  getAllUsers,
  getUser,
  uploadAvatar,
  deleteAvatar,
  updateAvatar,
  changePassword,
} from "../controllers/user.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = Router();

userRouter.get("/", getAllUsers);
userRouter.get("/profile", authMiddleware, getUser);
userRouter.post("/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);
userRouter.delete('/avatar', authMiddleware, deleteAvatar);
userRouter.put('/avatar', authMiddleware, upload.single("avatar"), updateAvatar);
userRouter.post('/change-password', authMiddleware, changePassword);

export default userRouter;

import { Router } from "express";
import {
  getAllUsers,
  getUser,
  getUserById,
  uploadAvatar,
  deleteAvatar,
  updateAvatar,
  uploadCoverImage,
  updateCoverImage,
  deleteCoverImage,
  changePassword,
  updateUserProfile,
  deleteUser,
} from "../controllers/user.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = Router();

// Protected routes (must come before /:id to avoid conflicts)
userRouter.get("/profile", authMiddleware, getUser);
userRouter.put("/profile", authMiddleware, updateUserProfile);
userRouter.delete("/profile", authMiddleware, deleteUser);

// Avatar management
userRouter.post("/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);
userRouter.put("/avatar", authMiddleware, upload.single("avatar"), updateAvatar);
userRouter.delete("/avatar", authMiddleware, deleteAvatar);

// Cover image management
userRouter.post("/cover-image", authMiddleware, upload.single("coverImage"), uploadCoverImage);
userRouter.put("/cover-image", authMiddleware, upload.single("coverImage"), updateCoverImage);
userRouter.delete("/cover-image", authMiddleware, deleteCoverImage);

// Password management
userRouter.post("/change-password", authMiddleware, changePassword);

// Public routes (these should come after specific routes)
userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);

export default userRouter;

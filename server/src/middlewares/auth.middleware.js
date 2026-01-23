import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    throw new ApiError(401, "Unauthorized: Token not found");
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // Handle admin user
    if (decoded.role === "Admin") {
      req.user = {
        _id: decoded._id,
        fullName: decoded.fullName || "Admin User",
        email: decoded.email || "admin@gmail.com",
        role: "Admin",
        isVerified: true,
        isActive: true,
      };
      return next();
    }

    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access Token.");
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, "Invalid Access Token.");
  }
});

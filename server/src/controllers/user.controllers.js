import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { Team } from "../models/Team.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { Match } from "../models/Match.model.js";
import { Payment } from "../models/Payment.model.js";
import Booking from "../models/Booking.model.js";
import { Request } from "../models/Request.model.js";
import { Feedback } from "../models/Feedback.model.js";
import { deleteFromCloudinary, uploadOnCloudinary, getCloudinaryPublicId } from "../utils/cloudinary.js";

export const getUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");
  if (!user) throw new ApiError(404, "User not found.");

  res
    .status(200)
    .json(new ApiResponse(200, user, "User retrieved successfully."));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true }).select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");

  if (!users) throw new ApiError(404, "Users not found");

  res
    .status(200)
    .json(new ApiResponse(200, users, "Users retrieved successfully."));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar image is required.");

  const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
  
  if (!avatarResponse) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary. Please check your internet connection and try again.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { avatar: avatarResponse.url },
    { new: true }
  ).select("-password -refreshToken");

  if(!updatedUser) throw new ApiError(404, "User not found.")

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Avatar uploaded successfully.")
    );
});

export const deleteAvatar = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user  = await User.findById(userId);

  if(!user) throw new ApiError(404, "User not found.");

  const avatarUrl = user?.avatar;
  if(!avatarUrl) throw new ApiError(404, "Avatar not found.");

  try {
    const urlParts = avatarUrl.split('/');
    const folder = urlParts.slice(-2, -1)[0];
    const publicIdWithExtension = urlParts.at(-1);
    const fileName = publicIdWithExtension.split('.')[0];
    const publicId = `${folder}/${fileName}`;
    await deleteFromCloudinary(publicId);
  } catch (error) {
    console.log("Failed to delete avatar from Cloudinary:", error.message);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $unset: { avatar: "" } },
    {new: true}
  ).select("-password -refreshToken");

  if(!updatedUser) throw new ApiError(404, "User not found.")

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Avatar deleted successfully.")
    );
})

export const updateAvatar = asyncHandler( async (req, res) => {
  const userId = req.user._id;
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar image is required.");

  const avatarResponse = await uploadOnCloudinary(avatarLocalPath);

  if (!avatarResponse) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary. Please check your internet connection and try again.");
  }

  const user = await User.findById(userId);
  if(!user) throw new ApiError(404, "User not found.");
  const oldAvatarUrl = user?.avatar;

  if(oldAvatarUrl){
    try {
      const urlParts = oldAvatarUrl.split('/');
      const folder = urlParts.slice(-2, -1)[0];
      const publicIdWithExtension = urlParts.at(-1);
      const fileName = publicIdWithExtension.split('.')[0];
      const publicId = `${folder}/${fileName}`;
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.log("Failed to delete old avatar from Cloudinary:", error.message);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { avatar: avatarResponse.url },
    { new: true }
  ).select("-password -refreshToken");

  if(!updatedUser) throw new ApiError(404, "User not found.")

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Avatar updated successfully.")
    );
})

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found.");

  const isMatch = await user.isPasswordCorrect(currentPassword);
  if (!isMatch) throw new ApiError(400, "Current password is incorrect.");

  user.password = newPassword;
  await user.save();

  const updatedUser = await User.findById(userId).select("-password -refreshToken");

  if(!updatedUser) throw new ApiError(404, "User not found.");

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Password changed successfully.")
    );
});

export const uploadCoverImage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) throw new ApiError(400, "Cover image is required.");

  const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);
  
  if (!coverImageResponse) throw new ApiError(500, "Failed to upload cover image to Cloudinary.");

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { coverImage: coverImageResponse.url },
    { new: true }
  ).select("-password -refreshToken");

  if(!updatedUser) throw new ApiError(404, "User not found.")

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover image uploaded successfully.")
    );
});

export const updateCoverImage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) throw new ApiError(400, "Cover image is required.");

  const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImageResponse) throw new ApiError(500, "Failed to upload cover image to Cloudinary.");

  const user = await User.findById(userId);
  if(!user) throw new ApiError(404, "User not found.");
  const oldCoverImageUrl = user?.coverImage;

  if(oldCoverImageUrl){
    const urlParts = oldCoverImageUrl.split('/');
    const publicIdWithExtension = urlParts.at(-1);
    const publicId = publicIdWithExtension.split('.')[0];

    await deleteFromCloudinary(publicId);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { coverImage: coverImageResponse.url },
    { new: true }
  ).select("-password -refreshToken");

  if(!updatedUser) throw new ApiError(404, "User not found.")

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover image updated successfully.")
    );
});

export const deleteCoverImage = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if(!user) throw new ApiError(404, "User not found.");

  const coverImageUrl = user?.coverImage;
  if(!coverImageUrl) throw new ApiError(404, "Cover image not found.");

  const urlParts = coverImageUrl.split('/');
  const publicIdWithExtension = urlParts.at(-1);
  const publicId = publicIdWithExtension.split('.')[0];

  await deleteFromCloudinary(publicId);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $unset: { coverImage: "" } },
    {new: true}
  ).select("-password -refreshToken");

  if(!updatedUser) throw new ApiError(404, "User not found.")

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover image deleted successfully.")
    );
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { fullName, phone, city, bio, dateOfBirth, height, weight, gender } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found.");

  // Update basic user fields
  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;
  if (city) user.city = city;

  // Update Player-specific fields if the user is a Player
  if (user.role === "Player") {
    if (bio !== undefined) user.bio = bio;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;
    if (gender) user.gender = gender;
  }

  await user.save();

  const updatedUser = await User.findById(userId).select("-password -refreshToken");

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Profile updated successfully.")
    );
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id, isActive: true }).select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry -resetPasswordToken -resetPasswordTokenExpiry");
  
  if (!user) throw new ApiError(404, "User not found.");

  res
    .status(200)
    .json(new ApiResponse(200, user, "User retrieved successfully."));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found.");

  // Delete avatar from Cloudinary if exists
  if (user.avatar) {
    try {
      const publicId = getCloudinaryPublicId(user.avatar);
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.log("Failed to delete avatar from Cloudinary:", error.message);
    }
  }

  // Delete cover image from Cloudinary if exists
  if (user.coverImage) {
    try {
      const publicId = getCloudinaryPublicId(user.coverImage);
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.log("Failed to delete cover image from Cloudinary:", error.message);
    }
  }

  // Role-specific cleanup
  if (user.role === "Player") {
    // Remove player from all teams
    await Team.updateMany(
      { players: userId },
      { $pull: { players: userId } }
    );
    // Remove player from tournament registrations
    await Tournament.updateMany(
      { registeredPlayers: userId },
      { $pull: { registeredPlayers: userId } }
    );
    await Tournament.updateMany(
      { approvedPlayers: userId },
      { $pull: { approvedPlayers: userId } }
    );
  }

  if (user.role === "TeamManager") {
    const teams = await Team.find({ manager: userId });
    for (const team of teams) {
      // Delete team images from Cloudinary
      if (team.logoUrl) {
        try {
          await deleteFromCloudinary(getCloudinaryPublicId(team.logoUrl));
        } catch (error) {
          console.log("Failed to delete team logo:", error.message);
        }
      }
      if (team.bannerUrl) {
        try {
          await deleteFromCloudinary(getCloudinaryPublicId(team.bannerUrl));
        } catch (error) {
          console.log("Failed to delete team banner:", error.message);
        }
      }
      // Remove team from tournament registrations
      await Tournament.updateMany(
        { registeredTeams: team._id },
        { $pull: { registeredTeams: team._id } }
      );
      await Tournament.updateMany(
        { approvedTeams: team._id },
        { $pull: { approvedTeams: team._id } }
      );
    }
    // Delete all teams managed by this user
    await Team.deleteMany({ manager: userId });
  }

  if (user.role === "TournamentOrganizer") {
    // Cancel all tournaments by this organizer
    await Tournament.updateMany(
      { organizer: userId },
      { isCancelled: true }
    );
    // Cancel matches of those tournaments
    const tournamentIds = await Tournament.find({ organizer: userId }).distinct("_id");
    await Match.updateMany(
      { tournament: { $in: tournamentIds } },
      { isCancelled: true }
    );
  }

  // Delete related data for all roles
  await Feedback.deleteMany({ user: userId });
  await Request.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
  await Booking.deleteMany({ user: userId });

  // Finally delete the user
  await User.findByIdAndDelete(userId);

  // Clear cookies
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "Account and all related data deleted successfully."));
});
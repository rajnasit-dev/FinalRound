import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

export const getUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
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
  
  if (!avatarResponse) throw new ApiError(500, "Failed to upload avatar to Cloudinary.");

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

  const urlParts = avatarUrl.split('/');
  const publicIdWithExtension = urlParts.at(-1);
  const publicId = publicIdWithExtension.split('.')[0];

  await deleteFromCloudinary(publicId);

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

  if (!avatarResponse) throw new ApiError(500, "Failed to upload avatar to Cloudinary.");

  const user = await User.findById(userId);
  if(!user) throw new ApiError(404, "User not found.");
  const oldAvatarUrl = user?.avatar;

  if(oldAvatarUrl){
    const urlParts = oldAvatarUrl.split('/');
    const publicIdWithExtension = urlParts.at(-1);
    const publicId = publicIdWithExtension.split('.')[0];

    await deleteFromCloudinary(publicId);
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
    const urlParts = user.avatar.split('/');
    const publicIdWithExtension = urlParts.at(-1);
    const publicId = publicIdWithExtension.split('.')[0];
    await deleteFromCloudinary(publicId);
  }

  // Delete cover image from Cloudinary if exists
  if (user.coverImage) {
    const urlParts = user.coverImage.split('/');
    const publicIdWithExtension = urlParts.at(-1);
    const publicId = publicIdWithExtension.split('.')[0];
    await deleteFromCloudinary(publicId);
  }

  // Soft delete - set isActive to false
  user.isActive = false;
  await user.save();

  const deletedUser = await User.findById(userId).select("-password -refreshToken");

  res
    .status(200)
    .json(
      new ApiResponse(200, deletedUser, "User account deleted successfully.")
    );
});
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
  const users = await User.find();

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

  console.log(avatarResponse);

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
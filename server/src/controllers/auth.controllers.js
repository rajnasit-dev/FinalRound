import { User } from "../models/User.model.js";
import { Player } from "../models/Player.model.js";
import { TeamManager } from "../models/TeamManager.model.js";
import { TournamentOrganizer } from "../models/TournamentOrganizer.model.js";
import { Admin } from "../models/Admin.model.js";
import { Sport } from "../models/Sport.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../middlewares/sendEmail.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Settings } from "../models/Settings.model.js";
import jwt from "jsonwebtoken";
import {
  verificationEmailWithLogoHtml,
  forgotPasswordWithLogoHtml,
} from "../utils/emailTemplates.js";

const OTP_EXPIRES_MINUTES = 5 * 60 * 1000; //5 min

const generateOtpAndExpiry = () => {
  // const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otp = crypto.randomInt(100000, 999999).toString();
  const verifyEmailOtpExpiry = Date.now() + OTP_EXPIRES_MINUTES;
  return { otp, verifyEmailOtpExpiry };
};

const verificationEmailHtml = (name, otp) => verificationEmailWithLogoHtml(name, otp);

const forgotPasswordEmailHtml = (name, url) => forgotPasswordWithLogoHtml(name, url);

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token."
    );
  }
};

export const registerPlayer = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, city, sports, dateOfBirth, gender, height, weight } =
    req.body;
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if ([fullName, email, password].some((field) => !field?.trim())) {
    throw new ApiError(
      400,
      "fullName, email and password are required fields."
    );
  }

  if (!gender || !["Male", "Female", "Other"].includes(gender)) {
    throw new ApiError(400, "Gender is required and must be Male, Female, or Other.");
  }

  const isUserExist = await User.findOne({ email });
  if (isUserExist) throw new ApiError(409, "User already exists.");

  const { otp, verifyEmailOtpExpiry } = generateOtpAndExpiry();

  let avatarResponse = null;
  if (avatarLocalPath) {
    avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarResponse)
      throw new ApiError(500, "Failed to upload avatar to Cloudinary.");
  }

  let coverImageResponse = null;
  if (coverImageLocalPath) {
    coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImageResponse)
      throw new ApiError(500, "Failed to upload cover image to Cloudinary.");
  }

  // Parse sports data from JSON string
  let parsedSports = [];
  if (sports) {
    try {
      const sportsData = JSON.parse(sports);
      
      // Process each sport to get the Sport ObjectId
      for (const sportItem of sportsData) {
        let sportDoc = null;
        const sportValue = sportItem.sport;

        if (typeof sportValue === 'object' && sportValue !== null) {
          // Frontend sends full sport object with _id
          if (sportValue._id) {
            sportDoc = await Sport.findOne({ _id: sportValue._id, isActive: true });
          } else if (sportValue.name) {
            sportDoc = await Sport.findOne({
              name: { $regex: new RegExp(`^${sportValue.name}$`, 'i') },
              isActive: true
            });
          }
        } else if (typeof sportValue === 'string') {
          // Sport sent as name string
          sportDoc = await Sport.findOne({ 
            name: { $regex: new RegExp(`^${sportValue}$`, 'i') },
            isActive: true
          });
        }
        
        if (sportDoc) {
          parsedSports.push({
            sport: sportDoc._id,
            role: sportItem.role || undefined,
          });
        }
      }
    } catch (error) {
      throw new ApiError(400, "Invalid sports data format.");
    }
  }

  const player = new Player({
    fullName,
    email,
    password,
    avatar: avatarResponse?.url || null,
    coverImage: coverImageResponse?.url || null,
    role: "Player",
    phone,
    city,
    sports: parsedSports,
    dateOfBirth,
    gender,
    height: height ? Number(height) : undefined,
    weight: weight ? Number(weight) : undefined,
    verifyEmailOtp: otp,
    verifyEmailOtpExpiry,
  });

  // Check if OTP verification is required
  const otpRequired = await Settings.getSetting("otpVerificationRequired", true);

  if (!otpRequired) {
    // Skip OTP — mark as verified immediately
    player.isVerified = true;
    player.verifyEmailOtp = undefined;
    player.verifyEmailOtpExpiry = undefined;
  }

  await player.save();

  const createdPlayer = await Player.findById(player._id).select(
    "-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry"
  );

  if (!createdPlayer)
    throw new ApiError(500, "Something went wrong while registering the user.");

  if (!otpRequired) {
    // Auto-login: generate tokens and send cookies
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(player._id);
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(201, { user: createdPlayer, otpRequired: false }, "User registered and logged in successfully."));
  }

  const emailData = {
    email: createdPlayer.email,
    subject: "Email Verification – SportsHub",
    message: ` Please use the following OTP to verify your email : ${otp}`,
    html: verificationEmailHtml(createdPlayer.fullName, otp),
  };

  await sendEmail(emailData);

  res
    .status(201)
    .json(new ApiResponse(201, { user: createdPlayer, otpRequired: true }, "User registered successfully."));
});

export const registerTeamManager = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, city } = req.body;
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!fullName || !email || !password)
    throw new ApiError(
      400,
      "fullName, email and password are required fields."
    );

  const isUserExist = await User.findOne({ email });
  if (isUserExist) throw new ApiError(409, "User already exists.");

  const { otp, verifyEmailOtpExpiry } = generateOtpAndExpiry();

  let avatarResponse = null;
  if (avatarLocalPath) {
    avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarResponse)
      throw new ApiError(500, "Failed to upload avatar to Cloudinary.");
  }

  const manager = new TeamManager({
    fullName,
    email,
    password,
    avatar: avatarResponse?.url || null,
    role: "TeamManager",
    phone,
    city,
    teams: [],
    verifyEmailOtp: otp,
    verifyEmailOtpExpiry,
  });

  // Check if OTP verification is required
  const otpRequired = await Settings.getSetting("otpVerificationRequired", true);

  if (!otpRequired) {
    manager.isVerified = true;
    manager.verifyEmailOtp = undefined;
    manager.verifyEmailOtpExpiry = undefined;
  }

  await manager.save();

  const createdManager = await TeamManager.findById(manager._id).select(
    "-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry"
  );

  if (!createdManager) {
    throw new ApiError(
      500,
      "Something went wrong while registering the team manager."
    );
  }

  if (!otpRequired) {
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(manager._id);
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          201,
          { user: createdManager, otpRequired: false },
          "Team Manager registered and logged in successfully."
        )
      );
  }

  const emailData = {
    email: createdManager.email,
    subject: "Email Verification – SportsHub",
    message: ` Please use the following OTP to verify your email : ${otp}`,
    html: verificationEmailHtml(createdManager.fullName, otp),
  };

  await sendEmail(emailData);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdManager, otpRequired: true },
        "Team Manager registered successfully."
      )
    );
});

export const registerTournamentOrganizer = asyncHandler(async (req, res) => {
  const { fullName, orgName, email, password, phone, city } = req.body;
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!fullName || !orgName || !email || !password) {
    throw new ApiError(
      400,
      "fullName, orgName, email and password are required fields."
    );
  }

  const isUserExist = await User.findOne({ email });
  if (isUserExist) throw new ApiError(409, "User already exists.");

  const { otp, verifyEmailOtpExpiry } = generateOtpAndExpiry();

  let avatarResponse = null;
  if (avatarLocalPath) {
    avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarResponse)
      throw new ApiError(500, "Failed to upload avatar to Cloudinary.");
  }

  const organizer = new TournamentOrganizer({
    fullName,
    orgName,
    email,
    avatar: avatarResponse?.url || null,
    role: "TournamentOrganizer",
    password,
    phone,
    city,
    isVerifiedOrganizer: false,
    verifyEmailOtp: otp,
    verifyEmailOtpExpiry,
  });

  // Check if OTP verification is required
  const otpRequired = await Settings.getSetting("otpVerificationRequired", true);

  if (!otpRequired) {
    organizer.isVerified = true;
    organizer.verifyEmailOtp = undefined;
    organizer.verifyEmailOtpExpiry = undefined;
  }

  await organizer.save();

  const createdOrganizer = await TournamentOrganizer.findById(
    organizer._id
  ).select("-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry");

  if (!createdOrganizer) {
    throw new ApiError(
      500,
      "Something went wrong while registering the organizer."
    );
  }

  if (!otpRequired) {
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(organizer._id);
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          201,
          { user: createdOrganizer, otpRequired: false },
          "Organizer registered and logged in successfully."
        )
      );
  }

  const emailData = {
    email: createdOrganizer.email,
    subject: "Email Verification – SportsHub",
    message: ` Please use the following OTP to verify your email : ${otp}`,
    html: verificationEmailHtml(createdOrganizer.fullName, otp),
  };

  await sendEmail(emailData);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdOrganizer, otpRequired: true },
        "Organizer registered successfully. Please verify your email."
      )
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;
  if (!otp || !email) throw new ApiError(400, "Please provide OTP and email.");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "User not found.");

  if (user.isVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email already verified"));
  }

  if (!user.verifyEmailOtp || !user.verifyEmailOtpExpiry) {
    throw new ApiError(400, "No OTP found. Please request a new one.");
  }

  if (user.verifyEmailOtpExpiry < Date.now()) {
    await User.findByIdAndDelete(user._id);
    throw new ApiError(410, "OTP is expired. Your registration has been removed. Please register again.");
  }

  if (user.verifyEmailOtp !== otp) throw new ApiError(400, "Invalid OTP.");

  user.verifyEmailOtp = undefined;
  user.verifyEmailOtpExpiry = undefined;
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry"
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, safeUser, "User successfully verified and loggedIn.")
    );
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email already verified"));
  }

  // If OTP has expired, delete the user and ask them to re-register
  if (user.verifyEmailOtpExpiry && user.verifyEmailOtpExpiry < Date.now()) {
    await User.findByIdAndDelete(user._id);
    throw new ApiError(410, "OTP expired. Your registration has been removed. Please register again.");
  }

  // Generate new OTP
  const { otp, verifyEmailOtpExpiry } = generateOtpAndExpiry();
  
  user.verifyEmailOtp = otp;
  user.verifyEmailOtpExpiry = verifyEmailOtpExpiry;
  await user.save({ validateBeforeSave: false });

  // Send email
  const emailData = {
    email: user.email,
    subject: "Email Verification – SportsHub",
    message: `Please use the following OTP to verify your email: ${otp}`,
    html: verificationEmailHtml(user.fullName, otp),
  };

  await sendEmail(emailData);

  res
    .status(200)
    .json(new ApiResponse(200, null, "OTP resent successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "email and password are required.");
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  // Check if account is active
  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Please contact support.");
  }

  // Check password
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(400, "Invalid credentials.");

  // Get role from database
  const userRole = user.role;

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User successfully loggedIn."));
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshToken: undefined },
  });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logout successful."));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "user not Found.");

  const token = crypto.randomBytes(32).toString("hex");
  if (!token)
    throw new ApiError(
      400,
      "An error occured during generating resetPasswordToken."
    );

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  user.resetPasswordTokenExpiry = Date.now() + OTP_EXPIRES_MINUTES;
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const emailData = {
    email: user.email,
    subject: "Password Reset - SportsHub",
    message: `Please use the following link to reset password : ${resetPasswordUrl}`,
    html: forgotPasswordEmailHtml(user.fullName, resetPasswordUrl),
  };

  await sendEmail(emailData);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Link for resetting the password is sent to your email."
      )
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  if (!password) {
    throw new ApiError(400, "Password is required.");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user)
    throw new ApiError(
      400,
      "Reset password token not found or has been expired."
    );

  user.password = password;
  user.resetPasswordTokenExpiry = undefined;
  user.resetPasswordToken = undefined;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully."));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;

  if (!oldRefreshToken)
    throw new ApiError(401, "Unauthorized: Token not found");

  const decodedToken = jwt.verify(
    oldRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id);

  if (!user) throw new ApiError(401, "Invalid refresh token.");

  if (oldRefreshToken !== user.refreshToken)
    throw new ApiError(401, "Invalid refresh token or expired.");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {}, "Access token refreshed successfully."));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required.");
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, "New password must be different from current password.");
  }

  // Find user and verify current password
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully."));
});

// Public: check if OTP verification is enabled
export const getOtpVerificationStatus = asyncHandler(async (req, res) => {
  const otpRequired = await Settings.getSetting("otpVerificationRequired", true);
  res
    .status(200)
    .json(new ApiResponse(200, { otpVerificationRequired: otpRequired }, "OTP setting fetched"));
});

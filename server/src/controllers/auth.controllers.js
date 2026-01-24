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
import jwt from "jsonwebtoken";

const OTP_EXPIRES_MINUTES = 5 * 60 * 1000; //5 min

const generateOtpAndExpiry = () => {
  // const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otp = crypto.randomInt(100000, 999999).toString();
  const verifyEmailOtpExpiry = Date.now() + OTP_EXPIRES_MINUTES;
  return { otp, verifyEmailOtpExpiry };
};

const verificationEmailHtml = (name, otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>OTP Verification</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    .header h1 { color: #333; margin: 0; }
    .content { padding: 20px 0; text-align: center; }
    .content p { color: #555; line-height: 1.6; margin-bottom: 15px; }
    .otp-code { font-size: 32px; font-weight: bold; color: #007bff; background-color: #e9f5ff; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>OTP Verification</h1>
    </div>
    <div class="content">
      <p>Hello, ${name}</p>
      <p>Your One-Time Password (OTP) for verification is:</p>
      <div class="otp-code">
        ${otp}
      </div>
      <p>This OTP is valid for the next 5 minutes. Please do not share this code with anyone.</p>
      <p>If you did not request this OTP, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 SportsHub. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const forgotPasswordEmailHtml = (name, url) => `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - SportsHub</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: none; 
            -ms-text-size-adjust: none;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eeeeee;
        }
        .header h1 {
            color: #333333;
            margin: 0;
        }
        .content {
            padding: 20px 0;
            text-align: center;
        }
        .content p {
            color: #555555;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        /* Style for the call-to-action button */
        .action-button {
            display: inline-block;
            background-color: #007bff; /* Brand color for CTA */
            color: #ffffff; /* General CSS rule */
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eeeeee;
            font-size: 12px;
            color: #888888;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Hello, ${name}</p>
            <p>We received a request to reset the password for your SportsHub account. Click the button below to complete the process:</p>
            
            <!-- ADDED INLINE STYLE HERE TO ENSURE WHITE TEXT ON ALL DEVICES -->
            <a href="${url}" class="action-button" style="color: #ffffff !important;">Reset My Password</a>
            
            <p>For security, this link expires in 5 minutes.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 SportsHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;

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
  const { fullName, email, password, phone, city, sports, dateOfBirth, gender } =
    req.body;
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if ([fullName || email || password].some((field) => field?.trim() === "")) {
    throw new ApiError(
      400,
      "fullName, email and password are required fields."
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
        // Find sport by name (case-insensitive)
        const sportDoc = await Sport.findOne({ 
          name: { $regex: new RegExp(`^${sportItem.sport}$`, 'i') } 
        });
        
        if (sportDoc) {
          parsedSports.push({
            sport: sportDoc._id,
            role: sportItem.role,
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
    verifyEmailOtp: otp,
    verifyEmailOtpExpiry,
  });

  await player.save();

  const createdPlayer = await Player.findById(player._id).select(
    "-password -refreshToken -verifyEmailOtp -verifyEmailOtpExpiry"
  );

  if (!createdPlayer)
    throw new ApiError(500, "Something went wrong while registering the user.");

  const emailData = {
    email: createdPlayer.email,
    subject: "Email Verification – SportsHub",
    message: ` Please use the following OTP to verify your email : ${otp}`,
    html: verificationEmailHtml(createdPlayer.fullName, otp),
  };

  await sendEmail(emailData);

  res
    .status(201)
    .json(new ApiResponse(201, createdPlayer, "User registered successfully."));
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
  if (isUserExist) throw new ApiError(400, "User already exists.");

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

  const emailData = {
    email: createdManager.email,
    subject: "Email Verification – SportsHub",
    message: ` Please use the following OTP to verify your email : ${otp}`,
    html: verificationEmailHtml(createdManager.fullName, otp),
  };

  sendEmail(emailData);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdManager,
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
  if (isUserExist) throw new ApiError(400, "User already exists.");

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
        createdOrganizer,
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

  if (user.verifyEmailOtp !== otp) throw new ApiError(400, "Invalid OTP.");
  if (user.verifyEmailOtpExpiry < Date.now())
    throw new ApiError(410, "OTP is expired.");

  user.verifyEmailOtp = undefined;
  user.verifyEmailOtpExpiry = undefined;
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const isProd = process.env.NODE_ENV === "production";
    const options = {
      httpOnly: true,
      secure: true, // required when SameSite=None; allowed on localhost in modern browsers
      sameSite: "None",
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
  const { email, password, role } = req.body;

  if ([email || password || role].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "email, password, and role are required.");
  }

  // ========== HARDCODED ADMIN CREDENTIALS ==========
  if (role === "Admin") {
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "Admin123!";

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new ApiError(400, "Invalid admin credentials.");
    }

    // Generate admin tokens (without database lookup)
    const adminId = new mongoose.Types.ObjectId();
    const adminAccessToken = jwt.sign(
      {
        _id: adminId.toString(),
        email: ADMIN_EMAIL,
        fullName: "Admin User",
        role: "Admin",
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );

    const adminRefreshToken = jwt.sign(
      {
        _id: adminId.toString(),
        role: "Admin",
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    const adminUser = {
      _id: adminId,
      fullName: "Admin User",
      email: ADMIN_EMAIL,
      role: "Admin",
      isVerified: true,
      isActive: true,
    };

    res
      .status(200)
      .cookie("accessToken", adminAccessToken, options)
      .cookie("refreshToken", adminRefreshToken, options)
      .json(new ApiResponse(200, adminUser, "Admin successfully loggedIn."));
    return;
  }

  // ========== REGULAR USER LOGIN ==========
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(400, "Invalid credentials.");

  if (user.role !== role) throw new ApiError(400, "Invalid credentials.");

  // Prevent non-admin users from accessing admin panel
  if (role === "Admin") {
    throw new ApiError(403, "Unauthorized access to admin panel.");
  }

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

    const isProd = process.env.NODE_ENV === "production";
    const options = {
      httpOnly: true,
      secure: true, // required when SameSite=None; allowed on localhost in modern browsers
      sameSite: "None",
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

  const token = crypto.randomBytes(20).toString();
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
    html: forgotPasswordEmailHtml(user.name, resetPasswordUrl),
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
    secure: true, // required when SameSite=None; allowed on localhost in modern browsers
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {}, "Access token refreshed successfully."));
});

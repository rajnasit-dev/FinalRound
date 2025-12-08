import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { sendEmail } from "../middlewares/sendEmail.js";
import crypto from "crypto";

const OTP_EXPIRES_MINUTES = 5 * 60 * 1000; //5 min

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

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password)
    throw new ApiError(
      422,
      "fullName, email and password are required fields."
    );

  const isUserExist = await User.findOne({ email });
  if (isUserExist) throw new ApiError(400, "User already exists.");

  const otp = crypto.randomInt(100000, 999999).toString();
  const verifyEmailOtpExpiry = Date.now() + OTP_EXPIRES_MINUTES;

  const user = new User({
    fullName,
    email,
    password,
    verifyEmailOtp: otp,
    verifyEmailOtpExpiry,
  });

  await user.save();

  const createdUser = await User.findById(user._id).select(
    "-verifyEmailOtpExpiry -password -refreshToken"
  );
  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering the user.");

  //Email verification Process
  // const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const htmlMessage = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
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
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #007bff; /* A prominent color for the OTP */
            background-color: #e9f5ff;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
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
            <h1>OTP Verification</h1>
        </div>
        <div class="content">
            <p>Hello, ${user.fullName}</p>
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

  const data = {
    email: user?.email,
    subject: "Email Verification Request",
    message: ` Please use the following OTP to verify your email : ${otp}`,
    html: htmlMessage,
  };

  await sendEmail(data);

  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully."));
});

export const emailVerify = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;
  if (!otp || !email) throw new ApiError(422, "Please provide OTP and email.");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "User not found. or Invalid OTP.");

  if (user.verifyEmailOtp !== otp) throw new ApiError(400, "Invalid OTP.");
  if (user.verifyEmailOtpExpiry < Date.now())
    throw new ApiError(400, "OTP is expired.");

  user.verifyEmailOtp = undefined;
  user.verifyEmailOtpExpiry = undefined;
  user.isVerified = true;
  await user.save();

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
    expiresIn: 7 * 24 * 60 * 60 * 1000,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, user, "User successfully verified and loggedIn.")
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new ApiError(422, "email and password is required.");

  const loggedInUser = await User.findOne({ email });
  if (!loggedInUser) throw new ApiError(404, "User not found");

  const isPasswordCorrect = await loggedInUser.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(400, "Invalid credentials.");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    loggedInUser._id
  );

  const options = {
    httpOnly: true,
    secure: true,
    expiresIn: 7 * 24 * 60 * 60 * 1000,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User successfully loggedIn."));
});

export const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logout successful."));
});

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

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/login?token=${token}`;

  const htmlMessage = `
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
            <p>Hello, ${user.fullName}</p>
            <p>We received a request to reset the password for your SportsHub account. Click the button below to complete the process:</p>
            
            <!-- ADDED INLINE STYLE HERE TO ENSURE WHITE TEXT ON ALL DEVICES -->
            <a href="${resetPasswordUrl}" class="action-button" style="color: #ffffff !important;">Reset My Password</a>
            
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

  const data = {
    email: user?.email,
    subject: "Password Reset Request",
    message: `Please use the following link to reset password : ${resetPasswordUrl}`,
    html: htmlMessage,
  };

  await sendEmail(data);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "If the email exists, a password link has been send."
      )
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body || req.body.email;
  const { token } = req.params;

  const user = await User.findOne({
    resetPasswordToken: token,
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
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully."));
});

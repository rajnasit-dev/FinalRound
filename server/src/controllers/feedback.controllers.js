import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Feedback } from "../models/Feedback.model.js";

// Create feedback (website review)
export const createFeedback = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    throw new ApiError(400, "Rating and comment are required.");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5.");
  }

  const feedback = await Feedback.create({
    user: userId,
    rating,
    comment
  });

  const populatedFeedback = await Feedback.findById(feedback._id)
    .populate("user", "fullName email avatar role");

  res
    .status(201)
    .json(new ApiResponse(201, populatedFeedback, "Review submitted successfully."));
});

// Get all feedback (website reviews)
export const getAllFeedback = asyncHandler(async (req, res) => {
  const { user, minRating, maxRating, limit } = req.query;

  let filter = {};

  if (user) filter.user = user;
  if (minRating) filter.rating = { ...filter.rating, $gte: parseInt(minRating) };
  if (maxRating) filter.rating = { ...filter.rating, $lte: parseInt(maxRating) };

  let query = Feedback.find(filter)
    .populate("user", "fullName email avatar role")
    .sort({ createdAt: -1 });

  if (limit) {
    query = query.limit(parseInt(limit));
  }

  const feedbacks = await query;

  // Calculate average rating
  const avgRating = feedbacks.length > 0
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
    : 0;

  res
    .status(200)
    .json(new ApiResponse(200, {
      feedbacks,
      avgRating: avgRating.toFixed(1),
      totalFeedbacks: feedbacks.length
    }, "Reviews retrieved successfully."));
});

// Get feedback by ID
export const getFeedbackById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const feedback = await Feedback.findById(id)
    .populate("user", "fullName email avatar phone city role");

  if (!feedback) {
    throw new ApiError(404, "Review not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, feedback, "Review retrieved successfully."));
});

// Get user's feedback
export const getUserFeedback = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const feedback = await Feedback.findOne({ user: userId });

  res
    .status(200)
    .json(new ApiResponse(200, feedback, "Your review retrieved successfully."));
});

// Update feedback
export const updateFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { rating, comment } = req.body;

  const feedback = await Feedback.findById(id);

  if (!feedback) {
    throw new ApiError(404, "Review not found.");
  }

  // Verify user is the feedback owner
  if (feedback.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only update your own review.");
  }

  if (rating) {
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5.");
    }
    feedback.rating = rating;
  }

  if (comment !== undefined) {
    if (!comment.trim()) {
      throw new ApiError(400, "Comment is required.");
    }
    feedback.comment = comment;
  }

  await feedback.save();

  const updatedFeedback = await Feedback.findById(id)
    .populate("user", "fullName email avatar");

  res
    .status(200)
    .json(new ApiResponse(200, updatedFeedback, "Review updated successfully."));
});

// Delete feedback
export const deleteFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const feedback = await Feedback.findById(id);

  if (!feedback) {
    throw new ApiError(404, "Review not found.");
  }

  // Allow feedback owner or admin to delete
  if (feedback.user.toString() !== userId.toString() && userRole !== "Admin") {
    throw new ApiError(403, "You can only delete your own review.");
  }

  await Feedback.findByIdAndDelete(id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Review deleted successfully."));
});

import { useState } from "react";
import { useSelector } from "react-redux";
import { Star } from "lucide-react";
import Button from "./Button";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const FeedbackForm = ({ onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError("Please login to submit a review");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a review");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(
        `${API_BASE_URL}/feedback`,
        { rating, comment },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      // Reset form
      setRating(0);
      setComment("");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
      <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
        Share Your Experience
      </h3>

      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          Rating *
        </label>
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setRating(index + 1)}
              onMouseEnter={() => setHoveredRating(index + 1)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  index < (hoveredRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-base dark:text-base-dark">
              {rating} / 5
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          Your Review *
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience with SportsHub..."
          rows={4}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-text-primary dark:text-text-primary-dark placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={loading || rating === 0 || !comment.trim()}>
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
};

export default FeedbackForm;

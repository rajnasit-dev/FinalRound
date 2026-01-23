import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFeedback, deleteFeedback } from "../../store/slices/feedbackSlice";
import {
  Star,
  Trash2,
  Eye,
  MessageCircle,
  User,
  Calendar,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import Container from "../../components/container/Container";
import Select from "../../components/ui/Select";

const AdminFeedback = () => {
  const dispatch = useDispatch();
  const { feedbacks, averageRating, totalFeedbacks, loading } = useSelector(
    (state) => state.feedback
  );
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    dispatch(fetchAllFeedback());
  }, [dispatch]);

  const handleDeleteFeedback = async (feedbackId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this feedback? This action cannot be undone."
      )
    ) {
      setDeleteLoading(feedbackId);
      try {
        await dispatch(deleteFeedback(feedbackId)).unwrap();
        // Refresh feedbacks after deletion
        dispatch(fetchAllFeedback());
      } catch (error) {
        console.error("Error deleting feedback:", error);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  // Filter feedbacks by rating
  let filteredFeedbacks = feedbacks || [];
  if (selectedRating) {
    filteredFeedbacks = filteredFeedbacks.filter(
      (f) => f.rating === selectedRating
    );
  }

  // Sort feedbacks
  filteredFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === "highestRated") {
      return b.rating - a.rating;
    } else if (sortBy === "lowestRated") {
      return a.rating - b.rating;
    }
    return 0;
  });

  // Calculate rating distribution
  const ratingDistribution = {
    5: feedbacks?.filter((f) => f.rating === 5).length || 0,
    4: feedbacks?.filter((f) => f.rating === 4).length || 0,
    3: feedbacks?.filter((f) => f.rating === 3).length || 0,
    2: feedbacks?.filter((f) => f.rating === 2).length || 0,
    1: feedbacks?.filter((f) => f.rating === 1).length || 0,
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-600 bg-green-50 dark:bg-green-900/20";
    if (rating === 3) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-red-600 bg-red-50 dark:bg-red-900/20";
  };

  const getRatingBadgeColor = (rating) => {
    if (rating >= 4) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    if (rating === 3) return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          User Feedback & Reviews
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          Manage and monitor all user feedback and ratings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Container>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-base dark:text-base-dark mb-1">
                Total Reviews
              </p>
              <p className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
                {totalFeedbacks}
              </p>
            </div>
            <MessageCircle className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
          </div>
        </Container>

        <Container>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-base dark:text-base-dark mb-1">
                Average Rating
              </p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
                  {averageRating ? parseFloat(averageRating).toFixed(1) : "0"}
                </p>
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              </div>
            </div>
          </div>
        </Container>

        <Container>
          <div>
            <p className="text-sm font-medium text-base dark:text-base-dark mb-3">
              5-Star Reviews
            </p>
            <p className="text-2xl font-bold text-green-600 mb-1">
              {ratingDistribution[5]}
            </p>
            <p className="text-xs text-base dark:text-base-dark">
              {totalFeedbacks > 0
                ? Math.round((ratingDistribution[5] / totalFeedbacks) * 100)
                : 0}
              % of total
            </p>
          </div>
        </Container>

        <Container>
          <div>
            <p className="text-sm font-medium text-base dark:text-base-dark mb-3">
              Low Ratings (1-2)
            </p>
            <p className="text-2xl font-bold text-red-600 mb-1">
              {ratingDistribution[1] + ratingDistribution[2]}
            </p>
            <p className="text-xs text-base dark:text-base-dark">
              {totalFeedbacks > 0
                ? Math.round(
                    ((ratingDistribution[1] + ratingDistribution[2]) /
                      totalFeedbacks) *
                      100
                  )
                : 0}
              % of total
            </p>
          </div>
        </Container>
      </div>

      {/* Rating Distribution */}
      <Container>
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
          Rating Distribution
        </h2>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-4">
              <div className="flex items-center gap-1 w-20">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
                {Array.from({ length: 5 - rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-gray-300 dark:text-gray-600"
                  />
                ))}
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all"
                  style={{
                    width: `${
                      totalFeedbacks > 0
                        ? (ratingDistribution[rating] / totalFeedbacks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark w-12 text-right">
                {ratingDistribution[rating]}
              </p>
            </div>
          ))}
        </div>
      </Container>

      {/* Filters and Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Container>
          <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Filter by Rating
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedRating(null)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                selectedRating === null
                  ? "bg-secondary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-text-primary-dark hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All Ratings
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between ${
                  selectedRating === rating
                    ? "bg-secondary text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-text-primary-dark hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 fill-amber-400 text-amber-400 ${
                        selectedRating === rating ? "" : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm">({ratingDistribution[rating]})</span>
              </button>
            ))}
          </div>
        </Container>

        <Container>
          <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Sort By
          </h3>
          <Select
            options={[
              { value: "newest", label: "Newest First" },
              { value: "oldest", label: "Oldest First" },
              { value: "highestRated", label: "Highest Rated" },
              { value: "lowestRated", label: "Lowest Rated" },
            ]}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
        </Container>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
          All Feedback ({filteredFeedbacks.length})
        </h2>

        {filteredFeedbacks.length === 0 ? (
          <Container>
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-base dark:text-base-dark">
                No feedback available
              </p>
            </div>
          </Container>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.map((feedback) => (
              <Container
                key={feedback._id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* User Avatar */}
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                        {feedback.user?.avatar ? (
                          <img
                            src={feedback.user.avatar}
                            alt={feedback.user?.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>

                      {/* User Info and Rating */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-bold text-text-primary dark:text-text-primary-dark">
                            {feedback.user?.fullName || "Anonymous"}
                          </p>
                          <div className={`px-3 py-1 rounded-full ${getRatingBadgeColor(feedback.rating)}`}>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: feedback.rating }).map(
                                (_, i) => (
                                  <Star
                                    key={i}
                                    className="w-3 h-3 fill-current"
                                  />
                                )
                              )}
                              <span className="text-xs font-semibold ml-1">
                                {feedback.rating}/5
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-base dark:text-base-dark mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(feedback.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setSelectedFeedback(
                          selectedFeedback?._id === feedback._id
                            ? null
                            : feedback
                        )}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5 text-secondary" />
                      </button>
                      <button
                        onClick={() => handleDeleteFeedback(feedback._id)}
                        disabled={deleteLoading === feedback._id}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Feedback"
                      >
                        {deleteLoading === feedback._id ? (
                          <Spinner size="sm" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-red-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-base dark:text-base-dark leading-relaxed">
                    {feedback.comment}
                  </p>

                  {/* User Email */}
                  {feedback.user?.email && (
                    <p className="text-xs text-base dark:text-base-dark">
                      Email: {feedback.user.email}
                    </p>
                  )}
                </div>
              </Container>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Full Feedback Details */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-background dark:bg-card-background-dark rounded-xl max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                Feedback Details
              </h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-base dark:text-base-dark hover:text-text-primary dark:hover:text-text-primary-dark"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* User Info */}
              <div className="border-b border-base-dark dark:border-base pb-4">
                <h4 className="font-bold text-text-primary dark:text-text-primary-dark mb-2">
                  User Information
                </h4>
                <p className="text-base dark:text-base-dark">
                  <span className="font-medium">Name:</span>{" "}
                  {selectedFeedback.user?.fullName || "N/A"}
                </p>
                <p className="text-base dark:text-base-dark">
                  <span className="font-medium">Email:</span>{" "}
                  {selectedFeedback.user?.email || "N/A"}
                </p>
                {selectedFeedback.user?.phone && (
                  <p className="text-base dark:text-base-dark">
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedFeedback.user.phone}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="border-b border-base-dark dark:border-base pb-4">
                <h4 className="font-bold text-text-primary dark:text-text-primary-dark mb-2">
                  Rating
                </h4>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < selectedFeedback.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                  <span className="font-bold text-text-primary dark:text-text-primary-dark ml-2">
                    {selectedFeedback.rating}/5
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <h4 className="font-bold text-text-primary dark:text-text-primary-dark mb-2">
                  Comment
                </h4>
                <p className="text-base dark:text-base-dark leading-relaxed whitespace-pre-wrap">
                  {selectedFeedback.comment}
                </p>
                <p className="text-xs text-base dark:text-base-dark mt-3">
                  Submitted on:{" "}
                  {new Date(selectedFeedback.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;

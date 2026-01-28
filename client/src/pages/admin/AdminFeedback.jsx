import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFeedback, deleteFeedback } from "../../store/slices/feedbackSlice";
import {
  Star,
  Trash2,
  MessageCircle,
  User,
} from "lucide-react";
import BackButton from "../../components/ui/BackButton";
import Spinner from "../../components/ui/Spinner";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import useDateFormat from "../../hooks/useDateFormat";
import defaultAvatar from "../../assets/defaultAvatar.png";

const AdminFeedback = () => {
  const dispatch = useDispatch();
  const { formatDate, formatTime } = useDateFormat();
  const { feedbacks, averageRating, totalFeedbacks, loading } = useSelector(
    (state) => state.feedback
  );
  const [selectedRating, setSelectedRating] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllFeedback());
  }, [dispatch]);

  const handleDeleteFeedback = async (e, feedbackId) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this feedback? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingId(feedbackId);
    try {
      await dispatch(deleteFeedback(feedbackId)).unwrap();
      // Refresh feedbacks after deletion
      dispatch(fetchAllFeedback());
    } catch (error) {
      console.error("Error deleting feedback:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter feedbacks by rating
  let filteredFeedbacks = feedbacks || [];
  if (selectedRating) {
    filteredFeedbacks = filteredFeedbacks.filter(
      (f) => f.rating === parseInt(selectedRating)
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

  const getRatingBadgeColor = (rating) => {
    if (rating >= 4) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    if (rating === 3) return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
  };

  const handleRowClick = (feedback) => {
    // Can show detail modal if needed
  };

  const columns = [
    {
      header: "User",
      width: "25%",
      render: (feedback) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <img
              src={feedback.user?.avatarUrl || defaultAvatar}
              alt={feedback.user?.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-text-primary dark:text-text-primary-dark truncate">
              {feedback.user?.fullName || "Anonymous"}
            </p>
            <p className="text-xs text-base dark:text-base-dark truncate">
              {feedback.user?.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Rating",
      width: "15%",
      render: (feedback) => (
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingBadgeColor(feedback.rating)}`}>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              <span>{feedback.rating}/5</span>
            </div>
          </span>
        </div>
      ),
    },
    {
      header: "Comment",
      width: "35%",
      render: (feedback) => (
        <p className="text-sm text-base dark:text-base-dark line-clamp-2">
          {feedback.comment}
        </p>
      ),
    },
    {
      header: "Date",
      width: "15%",
      render: (feedback) => (
        <div className="text-sm text-base dark:text-base-dark">
          <p>{formatDate(feedback.createdAt)}</p>
          <p className="text-xs">{formatTime(feedback.createdAt)}</p>
        </div>
      ),
    },
    {
      header: "Actions",
      width: "10%",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (feedback) => (
        <Button
          onClick={(e) => handleDeleteFeedback(e, feedback._id)}
          disabled={deletingId === feedback._id}
          className="!bg-red-600 hover:!bg-red-700 !text-white !px-3 !py-2 text-sm"
        >
          {deletingId === feedback._id ? (
            <Spinner size="sm" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <BackButton className="mb-6" />
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          User Feedback & Reviews
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          Manage and monitor all user feedback and ratings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
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
        </div>

        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
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
        </div>

        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <div>
            <p className="text-sm font-medium text-base dark:text-base-dark mb-3">
              Showing
            </p>
            <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
              {filteredFeedbacks.length} Feedbacks
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          options={[
            { value: "", label: "All Ratings" },
            { value: "5", label: "5 Stars" },
            { value: "4", label: "4 Stars" },
            { value: "3", label: "3 Stars" },
            { value: "2", label: "2 Stars" },
            { value: "1", label: "1 Star" },
          ]}
          value={selectedRating}
          onChange={(e) => setSelectedRating(e.target.value)}
        />

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
      </div>

      {/* Feedback Table */}
      {filteredFeedbacks.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Feedback Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No feedback matches your selected filters.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredFeedbacks}
          onRowClick={handleRowClick}
          itemsPerPage={10}
          emptyMessage="No feedback found"
        />
      )}
    </div>
  );
};

export default AdminFeedback;

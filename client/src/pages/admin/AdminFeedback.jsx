import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFeedback, deleteFeedback } from "../../store/slices/feedbackSlice";
import {
  Star,
  Trash2,
  MessageCircle,
  BarChart3,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import BackButton from "../../components/ui/BackButton";
import Spinner from "../../components/ui/Spinner";
import Select from "../../components/ui/Select";
import SearchBar from "../../components/ui/SearchBar";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import DashboardCardState from "../../components/ui/DashboardCardState";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    dispatch(fetchAllFeedback());
  }, [dispatch]);

  const handleDeleteFeedback = async (e, feedbackId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this feedback? This action cannot be undone.")) return;

    setDeletingId(feedbackId);
    try {
      await dispatch(deleteFeedback(feedbackId)).unwrap();
      toast.success("Feedback deleted successfully");
      // Refresh feedbacks after deletion
      dispatch(fetchAllFeedback());
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error(error?.message || "Failed to delete feedback");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter feedbacks by rating
  let filteredFeedbacks = feedbacks || [];
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredFeedbacks = filteredFeedbacks.filter(
      (f) =>
        f.user?.fullName?.toLowerCase().includes(term) ||
        f.user?.email?.toLowerCase().includes(term) ||
        f.comment?.toLowerCase().includes(term)
    );
  }
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
    setSelectedFeedback(feedback);
  };

  const closeModal = () => {
    setSelectedFeedback(null);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-500";
    if (rating === 3) return "text-yellow-500";
    return "text-red-500";
  };

  const getRatingBgColor = (rating) => {
    if (rating >= 4) return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
    if (rating === 3) return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
    return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
  };

  const getRatingLabel = (rating) => {
    const labels = { 5: "Excellent", 4: "Good", 3: "Average", 2: "Poor", 1: "Terrible" };
    return labels[rating] || "N/A";
  };

  const columns = [
    {
      header: "User",
      width: "25%",
      render: (feedback) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <img
              src={feedback.user?.avatar || defaultAvatar}
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
          loading={deletingId === feedback._id}
          variant="danger"
          size="sm"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
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
    <div className="space-y-6">
      <BackButton />
      
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCardState
          Icon={MessageCircle}
          label="Total Reviews"
          value={totalFeedbacks || 0}
          gradientFrom="from-blue-500/10"
          gradientVia="via-blue-500/5"
          borderColor="border-blue-500/20"
          iconGradientFrom="from-blue-500"
          iconGradientTo="to-blue-600"
        />
        <DashboardCardState
          Icon={Star}
          label="Average Rating"
          value={averageRating ? `${parseFloat(averageRating).toFixed(1)} / 5` : "0"}
          gradientFrom="from-amber-500/10"
          gradientVia="via-amber-500/5"
          borderColor="border-amber-500/20"
          iconGradientFrom="from-amber-500"
          iconGradientTo="to-amber-600"
        />
        <DashboardCardState
          Icon={BarChart3}
          label="Showing"
          value={`${filteredFeedbacks.length} Feedbacks`}
          gradientFrom="from-purple-500/10"
          gradientVia="via-purple-500/5"
          borderColor="border-purple-500/20"
          iconGradientFrom="from-purple-500"
          iconGradientTo="to-purple-600"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchBar
          placeholder="Search by name, email, or comment..."
          searchQuery={searchTerm}
          setSearchQuery={setSearchTerm}
        />
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

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          
          {/* Modal Content */}
          <div className="relative bg-card-background dark:bg-card-background-dark border border-border-light dark:border-border-dark rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark sticky top-0 bg-card-background dark:bg-card-background-dark rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                Feedback Detail
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-border-light dark:hover:bg-border-dark transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-base dark:text-base-dark" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border-light dark:border-border-dark shrink-0">
                  <img
                    src={selectedFeedback.user?.avatar || defaultAvatar}
                    alt={selectedFeedback.user?.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
                    {selectedFeedback.user?.fullName || "Anonymous"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    {selectedFeedback.user?.email && (
                      <span className="flex items-center gap-1 text-xs text-base dark:text-base-dark">
                        <Mail className="w-3 h-3" />
                        {selectedFeedback.user.email}
                      </span>
                    )}
                    {selectedFeedback.user?.phone && (
                      <span className="flex items-center gap-1 text-xs text-base dark:text-base-dark">
                        <Phone className="w-3 h-3" />
                        {selectedFeedback.user.phone}
                      </span>
                    )}
                    {selectedFeedback.user?.city && (
                      <span className="flex items-center gap-1 text-xs text-base dark:text-base-dark">
                        <MapPin className="w-3 h-3" />
                        {selectedFeedback.user.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className={`border rounded-xl p-4 ${getRatingBgColor(selectedFeedback.rating)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= selectedFeedback.rating
                              ? `${getRatingColor(selectedFeedback.rating)} fill-current`
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xl font-bold ${getRatingColor(selectedFeedback.rating)}`}>
                      {selectedFeedback.rating}/5
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${getRatingColor(selectedFeedback.rating)}`}>
                    {getRatingLabel(selectedFeedback.rating)}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-2">
                  Comment
                </h4>
                <p className="text-base dark:text-base-dark leading-relaxed whitespace-pre-wrap">
                  {selectedFeedback.comment}
                </p>
              </div>

              {/* Timestamps */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-border-light dark:border-border-dark">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-base dark:text-base-dark" />
                  <span className="text-sm text-base dark:text-base-dark">
                    {formatDate(selectedFeedback.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-base dark:text-base-dark" />
                  <span className="text-sm text-base dark:text-base-dark">
                    {formatTime(selectedFeedback.createdAt)}
                  </span>
                </div>
              </div>

              {/* Delete Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={(e) => {
                    handleDeleteFeedback(e, selectedFeedback._id);
                    closeModal();
                  }}
                  variant="danger"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Feedback
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;

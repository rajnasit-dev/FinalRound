import { Star, User } from "lucide-react";
import useDateFormat from "../../hooks/useDateFormat";
import defaultAvatar from "../../assets/defaultAvatar.png";

const FeedbackCard = ({ feedback }) => {
  const { formatDate } = useDateFormat();

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? "fill-amber-400 text-amber-400"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  return (
    <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
      {/* Header with user info and rating */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {feedback.user?.avatar ? (
              <img
                src={feedback.user.avatar}
                alt={feedback.user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-text-primary dark:text-text-primary-dark">
              {feedback.user?.fullName || "Anonymous"}
            </h4>
            <p className="text-xs text-base dark:text-base-dark">
              {formatDate(feedback.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {renderStars(feedback.rating)}
        </div>
      </div>

      {/* Feedback comment */}
      {feedback.comment && (
        <p className="text-base dark:text-base-dark leading-relaxed">
          {feedback.comment}
        </p>
      )}
    </div>
  );
};

export default FeedbackCard;

import { Trophy, X } from "lucide-react";

const AchievementCard = ({ title, year, onRemove, showRemove = false }) => {
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-900/50 transition-all duration-200">
      <Trophy className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-text-primary dark:text-text-primary-dark leading-tight">
          {title}
        </h4>
        {year && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {year}
          </p>
        )}
      </div>
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-500 dark:text-red-400 flex-shrink-0"
          title="Remove achievement"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default AchievementCard;

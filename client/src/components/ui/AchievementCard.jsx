import { Trophy } from "lucide-react";

const AchievementCard = ({ title, year, onRemove, showRemove = false }) => {
  return (
    <div className="flex items-start gap-4 p-4 bg-primary dark:bg-primary-dark rounded-lg border border-base-dark dark:border-base hover:border-secondary dark:hover:border-secondary-dark transition-colors">
      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
        <Trophy size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-text-primary dark:text-text-primary-dark">
          {title}
        </h3>
        <p className="text-sm text-base dark:text-base-dark mt-1">
          {year}
        </p>
      </div>
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500 dark:text-red-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

export default AchievementCard;

import { Trophy, Plus } from "lucide-react";
import Button from "./Button";
import AchievementCard from "./AchievementCard";

const AddAchievements = ({
  achievements,
  onAddAchievement,
  onRemoveAchievement,
  currentAchievement,
  onCurrentAchievementChange,
  achievementError,
  title = "Achievements",
}) => {
  const handleAddClick = () => {
    const trimmedTitle = currentAchievement.title.trim();
    const yearNumber = Number(currentAchievement.year);
    const currentYear = new Date().getFullYear();

    if (!trimmedTitle || !currentAchievement.year) {
      onCurrentAchievementChange({ type: "error", value: "Achievement title and year are required" });
      return;
    }

    if (!Number.isInteger(yearNumber) || yearNumber < 1900 || yearNumber > currentYear) {
      onCurrentAchievementChange({
        type: "error",
        value: `Achievement year must be between 1900 and ${currentYear}`,
      });
      return;
    }

    onAddAchievement({ title: trimmedTitle, year: String(yearNumber) });
  };

  return (
    <div className="bg-card-background dark:bg-card-background-dark rounded-2xl p-8 shadow-md">
      <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
        {title}
      </h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentAchievement.title}
            onChange={(e) =>
              onCurrentAchievementChange({
                type: "title",
                value: e.target.value,
              })
            }
            placeholder="Achievement title (e.g., Best Player Award)"
            className="flex-1 px-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark"
          />
          <input
            type="number"
            value={currentAchievement.year}
            onChange={(e) =>
              onCurrentAchievementChange({
                type: "year",
                value: e.target.value,
              })
            }
            placeholder="Year"
            className="w-32 px-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark"
            min="1900"
            max={new Date().getFullYear()}
          />
          <Button
            type="button"
            onClick={handleAddClick}
            disabled={!currentAchievement.title || !currentAchievement.year}
            variant="primary"
            className="w-auto!"
          >
            <Plus size={18} />
            Add
          </Button>
        </div>

        {achievementError && (
          <p className="text-red-500 text-xs">{achievementError}</p>
        )}

        {achievements.length > 0 ? (
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <AchievementCard
                key={index}
                title={achievement.title}
                year={achievement.year}
                showRemove={true}
                onRemove={() => onRemoveAchievement(index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-primary dark:bg-primary-dark rounded-lg border border-base-dark dark:border-base">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-base dark:text-base-dark" />
            <p className="text-sm text-base dark:text-base-dark">No achievements yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddAchievements;

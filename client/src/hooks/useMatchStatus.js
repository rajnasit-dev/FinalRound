import { useMemo } from "react";

/**
 * Compute match status based on scheduled time and cancellation flag
 * Assumes a match duration of 3 hours for live status
 * @param {Object} match - Match object with scheduledAt, isCancelled
 * @returns {String} - One of: "Cancelled", "Completed", "Live", "Scheduled"
 */
export const useMatchStatus = (match) => {
  return useMemo(() => {
    if (!match) return "Scheduled";
    
    // Check if cancelled first
    if (match.isCancelled) {
      return "Cancelled";
    }

    const now = new Date();
    const scheduledAt = new Date(match.scheduledAt);
    
    // Assume match duration is 3 hours (can be made configurable)
    const MATCH_DURATION_HOURS = 3;
    const matchEndTime = new Date(scheduledAt.getTime() + MATCH_DURATION_HOURS * 60 * 60 * 1000);

    // Completed: current time is after match end time
    if (now > matchEndTime) {
      return "Completed";
    }

    // Live: current time is between scheduled time and match end time
    if (now >= scheduledAt && now <= matchEndTime) {
      return "Live";
    }

    // Scheduled: current time is before scheduled time
    return "Scheduled";
  }, [match]);
};

export default useMatchStatus;

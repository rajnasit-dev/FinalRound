import { useMemo } from "react";

/**
 * Compute tournament status based on dates and cancellation flag
 * @param {Object} tournament - Tournament object with startDate, endDate, isCancelled
 * @returns {String} - One of: "Cancelled", "Completed", "Live", "Upcoming"
 */
export const useTournamentStatus = (tournament) => {
  return useMemo(() => {
    if (!tournament) return "Upcoming";
    
    // Check if cancelled first
    if (tournament.isCancelled) {
      return "Cancelled";
    }

    const now = new Date();
    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);

    // Completed: current date is after end date
    if (now > endDate) {
      return "Completed";
    }

    // Live: current date is between start and end date
    if (now >= startDate && now <= endDate) {
      return "Live";
    }

    // Upcoming: current date is before start date
    return "Upcoming";
  }, [tournament]);
};

export default useTournamentStatus;

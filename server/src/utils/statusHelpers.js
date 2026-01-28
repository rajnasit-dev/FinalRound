/**
 * Compute tournament status based on dates and cancellation flag
 * @param {Object} tournament - Tournament object with startDate, endDate, isCancelled
 * @returns {String} - One of: "Cancelled", "Completed", "Live", "Upcoming"
 */
export const getTournamentStatus = (tournament) => {
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
};

/**
 * Compute match status based on scheduled time and cancellation flag
 * Assumes a match duration of 3 hours for live status
 * @param {Object} match - Match object with scheduledAt, isCancelled
 * @returns {String} - One of: "Cancelled", "Completed", "Live", "Scheduled"
 */
export const getMatchStatus = (match) => {
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
};

/**
 * Add computed status to tournament object
 * @param {Object} tournament - Tournament object or plain object
 * @returns {Object} - Tournament with status field
 */
export const addTournamentStatus = (tournament) => {
  if (!tournament) return null;
  
  const tournamentObj = tournament.toObject ? tournament.toObject() : { ...tournament };
  tournamentObj.status = getTournamentStatus(tournamentObj);
  return tournamentObj;
};

/**
 * Add computed status to match object
 * @param {Object} match - Match object or plain object
 * @returns {Object} - Match with status field
 */
export const addMatchStatus = (match) => {
  if (!match) return null;
  
  const matchObj = match.toObject ? match.toObject() : { ...match };
  matchObj.status = getMatchStatus(matchObj);
  return matchObj;
};

/**
 * Add computed status to array of tournaments
 * @param {Array} tournaments - Array of tournament objects
 * @returns {Array} - Tournaments with status fields
 */
export const addTournamentStatuses = (tournaments) => {
  if (!Array.isArray(tournaments)) return [];
  return tournaments.map(addTournamentStatus);
};

/**
 * Add computed status to array of matches
 * @param {Array} matches - Array of match objects
 * @returns {Array} - Matches with status fields
 */
export const addMatchStatuses = (matches) => {
  if (!Array.isArray(matches)) return [];
  return matches.map(addMatchStatus);
};

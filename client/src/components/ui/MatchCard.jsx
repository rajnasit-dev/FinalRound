import { Link } from "react-router-dom";
import { Calendar, MapPin, Trophy, Clock } from "lucide-react";
import useStatusColor from "../../hooks/useStatusColor";
import useDateFormat from "../../hooks/useDateFormat";
import defaultTeamAvatar from "../../assets/defaultTeamAvatar.png";

const MatchCard = ({ match }) => {
  const { getStatusColor } = useStatusColor();
  const { formatDate, formatTime } = useDateFormat();

  const team1 = match.team1 || {};
  const team2 = match.team2 || {};
  const score1 = match.score1 || 0;
  const score2 = match.score2 || 0;

  return (
    <Link to={`/matches/${match._id}`} className="group">
      <div className="relative bg-card-background dark:bg-card-background-dark rounded-xl overflow-hidden border border-base-dark dark:border-base transition-all duration-300 hover:shadow-2xl hover:border-secondary dark:hover:border-secondary hover:-translate-y-1">
        {/* Header with status */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Trophy className="w-4 h-4" />
              <span className="font-medium">{match.tournament?.name || "Tournament"}</span>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                match.status
              )} text-white`}
            >
              {match.status === "Live" && (
                <span className="inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1"></span>
              )}
              {match.status}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(match.date)}</span>
            <Clock className="w-3 h-3 ml-2" />
            <span>{formatTime(match.time)}</span>
          </div>
        </div>

        {/* Teams and Score Section */}
        <div className="p-6">
          {/* Team 1 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                <img
                  src={team1.logoUrl || defaultTeamAvatar}
                  alt={team1.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {team1.name || "TBD"}
                </h3>
                {team1.city && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{team1.city}</span>
                  </div>
                )}
              </div>
            </div>
            
            {match.status !== "Scheduled" && (
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {score1}
              </div>
            )}
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center my-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="px-4 text-sm font-semibold text-gray-400 dark:text-gray-600">
              VS
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* Team 2 */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                <img
                  src={team2.logoUrl || defaultTeamAvatar}
                  alt={team2.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {team2.name || "TBD"}
                </h3>
                {team2.city && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{team2.city}</span>
                  </div>
                )}
              </div>
            </div>
            
            {match.status !== "Scheduled" && (
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {score2}
              </div>
            )}
          </div>

          {/* Winner Badge */}
          {match.status === "Completed" && match.winner && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Winner: {match.winner.name}
                </span>
              </div>
            </div>
          )}

          {/* Location */}
          {match.venue && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{match.venue}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MatchCard;

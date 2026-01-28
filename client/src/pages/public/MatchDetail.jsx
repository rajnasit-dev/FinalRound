import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, MapPin, Trophy, Clock, ArrowLeft, Users } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { fetchMatchById } from "../../store/slices/matchSlice";
import useStatusColor from "../../hooks/useStatusColor";
import useDateFormat from "../../hooks/useDateFormat";
import defaultTeamAvatar from "../../assets/defaultTeamAvatar.png";

const MatchDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedMatch: match, loading, error } = useSelector((state) => state.match);
  const { getStatusColor } = useStatusColor();
  const { formatDate, formatTime } = useDateFormat();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      dispatch(fetchMatchById(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <section className="container mx-auto px-6 py-16">
        <ErrorMessage message={error?.message || "Match not found"} type="error" />
        <Link to="/matches" className="inline-flex items-center gap-2 mt-4 text-secondary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Matches
        </Link>
      </section>
    );
  }

  const team1 = match.team1 || {};
  const team2 = match.team2 || {};
  const score1 = match.score1 || 0;
  const score2 = match.score2 || 0;

  return (
    <section className="container mx-auto px-6 py-16">
      {/* Back Button */}
      <Link
        to="/matches"
        className="inline-flex items-center gap-2 mb-6 text-base dark:text-base-dark hover:text-secondary dark:hover:text-secondary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Matches
      </Link>

      {/* Match Header */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-8 mb-6 border border-base-dark dark:border-base">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-secondary" />
            <div>
              <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
                {match.tournament?.name || "Tournament Match"}
              </h1>
              <p className="text-base dark:text-base-dark">
                {match.round && `${match.round} Round`}
              </p>
            </div>
          </div>
          <span
            className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(
              match.status
            )} text-white`}
          >
            {match.status === "Live" && (
              <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
            )}
            {match.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-base dark:text-base-dark">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(match.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatTime(match.time)}</span>
          </div>
          {match.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{match.venue}</span>
            </div>
          )}
        </div>
      </div>

      {/* Teams and Score */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-8 mb-6 border border-base-dark dark:border-base">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Team 1 */}
          <Link
            to={`/teams/${team1._id}`}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-32 h-32 rounded-xl bg-white dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden mb-4 group-hover:border-secondary transition-colors">
              <img
                src={team1.logoUrl || defaultTeamAvatar}
                alt={team1.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2 group-hover:text-secondary transition-colors">
              {team1.name || "TBD"}
            </h2>
            {team1.city && (
              <div className="flex items-center gap-1 text-base dark:text-base-dark">
                <MapPin className="w-4 h-4" />
                <span>{team1.city}</span>
              </div>
            )}
          </Link>

          {/* Score */}
          <div className="flex flex-col items-center">
            {match.status !== "Scheduled" ? (
              <>
                <div className="flex items-center gap-6 mb-4">
                  <span className="text-6xl font-bold text-text-primary dark:text-text-primary-dark">
                    {score1}
                  </span>
                  <span className="text-3xl font-semibold text-base dark:text-base-dark">
                    -
                  </span>
                  <span className="text-6xl font-bold text-text-primary dark:text-text-primary-dark">
                    {score2}
                  </span>
                </div>
                {match.status === "Completed" && match.winner && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="font-semibold text-amber-900 dark:text-amber-200">
                      Winner: {match.winner.name}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                <div className="text-4xl font-bold text-base dark:text-base-dark mb-2">
                  VS
                </div>
                <p className="text-sm text-base dark:text-base-dark">
                  Match not started
                </p>
              </div>
            )}
          </div>

          {/* Team 2 */}
          <Link
            to={`/teams/${team2._id}`}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-32 h-32 rounded-xl bg-white dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden mb-4 group-hover:border-secondary transition-colors">
              <img
                src={team2.logoUrl || defaultTeamAvatar}
                alt={team2.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2 group-hover:text-secondary transition-colors">
              {team2.name || "TBD"}
            </h2>
            {team2.city && (
              <div className="flex items-center gap-1 text-base dark:text-base-dark">
                <MapPin className="w-4 h-4" />
                <span>{team2.city}</span>
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Match Details */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Match Details
          </h3>
          <div className="space-y-3">
            {match.format && (
              <div className="flex justify-between">
                <span className="text-base dark:text-base-dark">Format:</span>
                <span className="font-semibold text-text-primary dark:text-text-primary-dark">
                  {match.format}
                </span>
              </div>
            )}
            {match.overs && (
              <div className="flex justify-between">
                <span className="text-base dark:text-base-dark">Overs:</span>
                <span className="font-semibold text-text-primary dark:text-text-primary-dark">
                  {match.overs}
                </span>
              </div>
            )}
            {match.umpire && (
              <div className="flex justify-between">
                <span className="text-base dark:text-base-dark">Umpire:</span>
                <span className="font-semibold text-text-primary dark:text-text-primary-dark">
                  {match.umpire}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tournament Info */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Tournament Information
          </h3>
          <Link
            to={`/tournaments/${match.tournament?._id}`}
            className="block group"
          >
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Trophy className="w-10 h-10 text-secondary" />
              <div className="flex-1">
                <h4 className="font-bold text-text-primary dark:text-text-primary-dark group-hover:text-secondary transition-colors">
                  {match.tournament?.name}
                </h4>
                <p className="text-sm text-base dark:text-base-dark">
                  {match.tournament?.sport?.name}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Description/Notes */}
      {match.description && (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 mt-6 border border-base-dark dark:border-base">
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">
            Match Notes
          </h3>
          <p className="text-base dark:text-base-dark leading-relaxed">
            {match.description}
          </p>
        </div>
      )}
    </section>
  );
};

export default MatchDetail;

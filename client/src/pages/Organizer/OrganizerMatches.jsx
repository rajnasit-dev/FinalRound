import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Trophy } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import FixturesTable from "../../components/ui/FixturesTable";
import { fetchAllMatches } from "../../store/slices/matchSlice";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";

const OrganizerMatches = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tournaments } = useSelector((state) => state.tournament);
  const { matches, loading } = useSelector((state) => state.match);

  useEffect(() => {
    dispatch(fetchAllTournaments({}));
    dispatch(fetchAllMatches());
  }, [dispatch]);

  // Filter matches for tournaments organized by this user
  const myTournaments = tournaments?.filter((t) => t.organizer?._id === user?._id) || [];
  const myMatches = matches?.filter((m) =>
    myTournaments.some((t) => t._id === m.tournament?._id)
  ) || [];

  const upcomingMatches = myMatches.filter((m) => m.status === "Scheduled");
  const liveMatches = myMatches.filter((m) => m.status === "Live");
  const completedMatches = myMatches.filter((m) => m.status === "Completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          My Matches
        </h1>
        <p className="text-base dark:text-base-dark">
          Manage all matches for your tournaments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card-background dark:bg-card-background-dark border border-base-dark dark:border-base rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-base dark:text-base-dark uppercase tracking-wide">
              Upcoming
            </p>
          </div>
          <p className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            {upcomingMatches.length}
          </p>
        </div>

        <div className="bg-card-background dark:bg-card-background-dark border border-base-dark dark:border-base rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm font-semibold text-base dark:text-base-dark uppercase tracking-wide">
              Live
            </p>
          </div>
          <p className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            {liveMatches.length}
          </p>
        </div>

        <div className="bg-card-background dark:bg-card-background-dark border border-base-dark dark:border-base rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-base dark:text-base-dark uppercase tracking-wide">
              Completed
            </p>
          </div>
          <p className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            {completedMatches.length}
          </p>
        </div>
      </div>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Live Matches
          </h2>
          <FixturesTable matches={liveMatches} />
        </div>
      )}

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Upcoming Matches
          </h2>
          <FixturesTable matches={upcomingMatches} />
        </div>
      )}

      {/* Completed Matches */}
      {completedMatches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Completed Matches
          </h2>
          <FixturesTable matches={completedMatches} />
        </div>
      )}

      {/* Empty State */}
      {myMatches.length === 0 && (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-base dark:text-base-dark" />
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            No matches yet
          </h3>
          <p className="text-base dark:text-base-dark mb-6">
            Create a tournament and schedule matches to get started
          </p>
          <Link
            to="/organizer/tournaments"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-semibold"
          >
            <Trophy className="w-5 h-5" />
            View Tournaments
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrganizerMatches;

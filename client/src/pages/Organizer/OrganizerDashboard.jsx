import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Trophy,
  Users,
  Calendar,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import DashboardCardState from "../../components/ui/DashboardCardState";
import TournamentCard from "../../components/ui/TournamentCard";
import MatchCard from "../../components/ui/MatchCard";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";
import { fetchAllMatches } from "../../store/slices/matchSlice";

const OrganizerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tournaments, loading: tournamentsLoading } = useSelector((state) => state.tournament);
  const { matches, loading: matchesLoading } = useSelector((state) => state.match);

  useEffect(() => {
    dispatch(fetchAllTournaments({}));
    dispatch(fetchAllMatches());
  }, [dispatch]);

  // Filter tournaments and matches organized by this user
  const myTournaments = tournaments?.filter((t) => t.organizer?._id === user?._id) || [];
  const myMatches = matches?.filter((m) =>
    myTournaments.some((t) => t._id === m.tournament?._id)
  ) || [];

  const totalTournaments = myTournaments.length;
  const activeTournaments = myTournaments.filter((t) => t.status === "Live").length;
  const totalMatches = myMatches.length;
  const totalTeams = myTournaments.reduce((acc, t) => acc + (t.registeredTeams?.length || 0), 0);

  if (tournamentsLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-base dark:text-base-dark">
          Manage your tournaments and organize matches
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCardState
          Icon={Trophy}
          iconColor="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-900/20"
          title="Total Tournaments"
          value={totalTournaments}
        />
        <DashboardCardState
          Icon={TrendingUp}
          iconColor="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/20"
          title="Active Tournaments"
          value={activeTournaments}
        />
        <DashboardCardState
          Icon={Calendar}
          iconColor="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
          title="Total Matches"
          value={totalMatches}
        />
        <DashboardCardState
          Icon={Users}
          iconColor="text-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
          title="Registered Teams"
          value={totalTeams}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/organizer/tournaments/create"
            className="flex items-center gap-3 p-4 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors group"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Create Tournament</span>
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/organizer/matches/create"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-secondary dark:hover:border-secondary rounded-lg transition-colors group"
          >
            <Calendar className="w-5 h-5 text-secondary" />
            <span className="font-semibold text-text-primary dark:text-text-primary-dark">
              Schedule Match
            </span>
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform text-secondary" />
          </Link>
          <Link
            to="/organizer/tournaments"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-secondary dark:hover:border-secondary rounded-lg transition-colors group"
          >
            <Trophy className="w-5 h-5 text-secondary" />
            <span className="font-semibold text-text-primary dark:text-text-primary-dark">
              Manage Tournaments
            </span>
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform text-secondary" />
          </Link>
        </div>
      </div>

      {/* My Tournaments */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            My Tournaments
          </h2>
          <Link
            to="/organizer/tournaments"
            className="text-secondary hover:underline font-semibold flex items-center gap-2"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {myTournaments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTournaments.slice(0, 3).map((tournament) => (
              <TournamentCard key={tournament._id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-base dark:text-base-dark" />
            <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
              No tournaments yet
            </h3>
            <p className="text-base dark:text-base-dark mb-6">
              Create your first tournament to get started
            </p>
            <Link
              to="/organizer/tournaments/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Tournament
            </Link>
          </div>
        )}
      </div>

      {/* Recent Matches */}
      {myMatches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
              Recent Matches
            </h2>
            <Link
              to="/organizer/matches"
              className="text-secondary hover:underline font-semibold flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myMatches.slice(0, 3).map((match) => (
              <MatchCard key={match._id} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;

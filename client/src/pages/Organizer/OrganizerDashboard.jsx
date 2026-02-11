import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { formatINR } from "../../utils/formatINR";
import {
  Trophy,
  Users,
  Calendar,
  DollarSign,
  Plus,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import DashboardCardState from "../../components/ui/DashboardCardState";
import GridContainer from "../../components/ui/GridContainer";
import TournamentCard from "../../components/ui/TournamentCard";
import FixturesTable from "../../components/ui/FixturesTable";
import { fetchAllTournaments, deleteTournament } from "../../store/slices/tournamentSlice";
import { fetchAllMatches } from "../../store/slices/matchSlice";

const OrganizerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const totalMatches = myMatches.length;
  const totalTeams = myTournaments.reduce((acc, t) => acc + (t.registeredTeams?.length || 0), 0);
  const paymentsReceived = myTournaments.reduce((acc, t) => acc + (t.totalRevenue || 0), 0);

  if (tournamentsLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Authorization Warning Banner */}
      {!user?.isAuthorized && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400 mb-2">
                Authorization Required
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
                Your organization needs to be authorized before you can create tournaments. 
                Submit your verification documents to get started.
              </p>
              <Button
                onClick={() => navigate("/organizer/authorization")}
                className="!w-auto px-6 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
              >
                Apply for Authorization
              </Button>
            </div>
          </div>
        </div>
      )}

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
      <GridContainer cols={2}>
        <DashboardCardState
          Icon={Trophy}
          label="Total Tournaments"
          value={totalTournaments}
          gradientFrom="from-amber-500/10"
          gradientVia="via-amber-500/5"
          borderColor="border-amber-500/30"
          iconGradientFrom="from-amber-500"
          iconGradientTo="to-amber-600"
          onClick={() => navigate("/organizer/tournaments")}
        />
        <DashboardCardState
          Icon={DollarSign}
          label="Payments Received"
          value={`₹${formatINR(paymentsReceived)}`}
          gradientFrom="from-green-500/10"
          gradientVia="via-green-500/5"
          borderColor="border-green-500/30"
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
          onClick={() => navigate("/organizer/payments")}
        />
        <DashboardCardState
          Icon={Calendar}
          label="Total Matches"
          value={totalMatches}
          gradientFrom="from-blue-500/10"
          gradientVia="via-blue-500/5"
          borderColor="border-blue-500/30"
          iconGradientFrom="from-blue-500"
          iconGradientTo="to-blue-600"
          onClick={() => navigate("/organizer/matches")}
        />
        <DashboardCardState
          Icon={Users}
          label="Registered Teams"
          value={totalTeams}
          gradientFrom="from-purple-500/10"
          gradientVia="via-purple-500/5"
          borderColor="border-purple-500/30"
          iconGradientFrom="from-purple-500"
          iconGradientTo="to-purple-600"
          onClick={() => navigate("/organizer/teams")}
        />
      </GridContainer>

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
          <div className="grid md:grid-cols-2 gap-6">
            {myTournaments.slice(0, 3).map((tournament) => (
              <TournamentCard 
                key={tournament._id} 
                tournament={tournament}
                showOrganizerButtons={true}
                onEdit={(id) => navigate(`/organizer/tournaments/${id}/edit`)}
                onManage={(id) => navigate(`/organizer/tournaments/${id}`)}
                onView={(id) => navigate(`/organizer/tournaments/${id}/fixtures`)}
                onDelete={async (id) => {
                  if (!window.confirm('Are you sure you want to delete this tournament?')) return;
                  try {
                    await dispatch(deleteTournament(id)).unwrap();
                    toast.success('Tournament deleted successfully!');
                  } catch (error) {
                    toast.error(error || 'Failed to delete tournament');
                  }
                }}
              />
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
            {user?.isAuthorized ? (
              <Link
                to="/organizer/tournaments/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create Tournament
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed opacity-60"
                title="Authorization required to create tournaments"
              >
                <Plus className="w-5 h-5" />
                Create Tournament
              </button>
            )}
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

          <FixturesTable matches={myMatches.slice(0, 3)} />
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;

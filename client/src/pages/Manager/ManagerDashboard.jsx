import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Trophy,
  Users,
  CalendarDays,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import DashboardCardState from "../../components/ui/DashboardCardState";
import GridContainer from "../../components/ui/GridContainer";
import TeamCard from "../../components/ui/TeamCard";
import FixturesTable from "../../components/ui/FixturesTable";
import { fetchManagerTeams } from "../../store/slices/teamSlice";
import { fetchMatchesByTeam } from "../../store/slices/matchSlice";

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { managerTeams, loading: teamsLoading } = useSelector((state) => state.team);
  const { teamMatches } = useSelector((state) => state.match);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchManagerTeams(user._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    // Fetch matches for all manager's teams
    if (managerTeams && managerTeams.length > 0) {
      managerTeams.forEach(team => {
        dispatch(fetchMatchesByTeam(team._id));
      });
    }
  }, [dispatch, managerTeams]);

  const totalTeams = managerTeams?.length || 0;
  const totalPlayers = managerTeams?.reduce((acc, team) => acc + (team.players?.length || 0), 0) || 0;
  const upcomingMatches = teamMatches?.filter(m => m.status === "Scheduled").length || 0;

  if (teamsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
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
          Manage your teams and track performance
        </p>
      </div>

      {/* Stats Cards */}
      <GridContainer cols={2}>
        <DashboardCardState
          Icon={Users}
          label="Total Teams"
          value={totalTeams}
          gradientFrom="from-blue-500/10"
          gradientVia="via-blue-500/5"
          borderColor="border-blue-500/20"
          iconGradientFrom="from-blue-500"
          iconGradientTo="to-blue-600"
        />
        <DashboardCardState
          Icon={Users}
          label="Total Players"
          value={totalPlayers}
          gradientFrom="from-green-500/10"
          gradientVia="via-green-500/5"
          borderColor="border-green-500/20"
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
        />
        <DashboardCardState
          Icon={CalendarDays}
          label="Upcoming Matches"
          value={upcomingMatches}
          gradientFrom="from-orange-500/10"
          gradientVia="via-orange-500/5"
          borderColor="border-orange-500/20"
          iconGradientFrom="from-orange-500"
          iconGradientTo="to-orange-600"
        />
        <DashboardCardState
          Icon={TrendingUp}
          label="Win Rate"
          value="0%"
          gradientFrom="from-purple-500/10"
          gradientVia="via-purple-500/5"
          borderColor="border-purple-500/20"
          iconGradientFrom="from-purple-500"
          iconGradientTo="to-purple-600"
        />
      </GridContainer>

      {/* Quick Actions */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/manager/teams/create"
            className="flex items-center gap-3 p-4 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors group"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Create New Team</span>
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/manager/teams"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-secondary dark:hover:border-secondary rounded-lg transition-colors group"
          >
            <Users className="w-5 h-5 text-secondary" />
            <span className="font-semibold text-text-primary dark:text-text-primary-dark">
              Manage Teams
            </span>
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform text-secondary" />
          </Link>
          <Link
            to="/manager/matches"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-secondary dark:hover:border-secondary rounded-lg transition-colors group"
          >
            <Trophy className="w-5 h-5 text-secondary" />
            <span className="font-semibold text-text-primary dark:text-text-primary-dark">
              View Matches
            </span>
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform text-secondary" />
          </Link>
        </div>
      </div>

      {/* My Teams */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            My Teams
          </h2>
          <Link
            to="/manager/teams"
            className="text-secondary hover:underline font-semibold flex items-center gap-2"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {managerTeams && managerTeams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managerTeams.slice(0, 3).map((team) => (
              <TeamCard key={team._id} team={team} />
            ))}
          </div>
        ) : (
          <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-base dark:text-base-dark" />
            <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
              No teams yet
            </h3>
            <p className="text-base dark:text-base-dark mb-6">
              Create your first team to get started
            </p>
            <Link
              to="/manager/teams/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Team
            </Link>
          </div>
        )}
      </div>

      {/* Upcoming Matches */}
      {teamMatches && teamMatches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
              Upcoming Matches
            </h2>
            <Link
              to="/manager/matches"
              className="text-secondary hover:underline font-semibold flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <FixturesTable
            matches={teamMatches.filter((m) => m.status === "Scheduled").slice(0, 3)}
          />
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;

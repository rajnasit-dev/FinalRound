import { Trophy, Users, Calendar, TrendingUp, Award, Activity } from "lucide-react";
import useDateFormat from "../../hooks/useDateFormat";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardCardState from "../../components/ui/DashboardCardState";
import IconCard from "../../components/ui/IconCard";
import Spinner from "../../components/ui/Spinner";
import GridContainer from "../../components/ui/GridContainer";
import { fetchPlayerProfile } from "../../store/slices/playerSlice";
import { fetchUpcomingMatches, fetchCompletedMatches } from "../../store/slices/matchSlice";
import { fetchPlayerTeams } from "../../store/slices/teamSlice";

const PlayerDashboard = () => {
  const dispatch = useDispatch();
  const { profile, loading: playerLoading } = useSelector((state) => state.player);
  const { upcomingMatches, completedMatches, loading: matchLoading } = useSelector((state) => state.match);
  const { playerTeams, loading: teamLoading } = useSelector((state) => state.team);
  const { formatDate, formatTime } = useDateFormat();
  const achievements = Array.isArray(profile?.achievements)
    ? profile.achievements.filter((item) => item?.title)
    : [];
  const sports = Array.isArray(profile?.sports) ? profile.sports : [];

  useEffect(() => {
    dispatch(fetchPlayerProfile());
    dispatch(fetchUpcomingMatches());
    dispatch(fetchCompletedMatches());
    dispatch(fetchPlayerTeams());
  }, [dispatch]);

  // Calculate stats from real data
  // Get unique tournaments from matches
  const uniqueTournaments = new Set(
    [...(upcomingMatches || []), ...(completedMatches || [])]
      .map(match => match.tournament?._id)
      .filter(Boolean)
  );

  const stats = {
    tournaments: uniqueTournaments.size || 0,
    teams: playerTeams?.length || 0,
    upcomingMatches: upcomingMatches?.length || 0,
    winRate: completedMatches?.length > 0
      ? Math.round((completedMatches.filter(m => m.result === "Won").length / completedMatches.length) * 100)
      : 0,
  };

  const loading = playerLoading || matchLoading || teamLoading;

  // Get recent activity from completedMatches
  const recentActivity = completedMatches?.slice(0, 3).map(match => ({
    id: match._id,
    type: "match",
    title: match.result === "Won" ? `Won against ${match.opponent}` : `${match.result} against ${match.opponent}`,
    tournament: match.tournament?.name || "Tournament",
    date: match.matchDate,
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
        Player Dashboard
      </h1>

      {/* Stats Grid */}
      <GridContainer cols={2}>
        <DashboardCardState
          Icon={Trophy}
          label="Active Tournaments"
          value={stats.tournaments}
          gradientFrom="from-amber-500/10"
          gradientVia="via-amber-500/5"
          borderColor="border-amber-500/20"
          iconGradientFrom="from-amber-500"
          iconGradientTo="to-amber-600"
        />
        <DashboardCardState
          Icon={Users}
          label="My Teams"
          value={stats.teams}
          gradientFrom="from-blue-500/10"
          gradientVia="via-blue-500/5"
          borderColor="border-blue-500/20"
          iconGradientFrom="from-blue-500"
          iconGradientTo="to-blue-600"
        />
        <DashboardCardState
          Icon={Calendar}
          label="Upcoming Matches"
          value={stats.upcomingMatches}
          gradientFrom="from-purple-500/10"
          gradientVia="via-purple-500/5"
          borderColor="border-purple-500/20"
          iconGradientFrom="from-purple-500"
          iconGradientTo="to-purple-600"
        />
        <DashboardCardState
          Icon={TrendingUp}
          label="Win Rate"
          value={`${stats.winRate}%`}
          gradientFrom="from-green-500/10"
          gradientVia="via-green-500/5"
          borderColor="border-green-500/20"
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
        />
      </GridContainer>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Matches */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
              Upcoming Matches
            </h2>
            <Calendar
              className="text-secondary dark:text-secondary-dark"
              size={24}
            />
          </div>

          <div className="space-y-4">
            {upcomingMatches && upcomingMatches.length > 0 ? (
              upcomingMatches.slice(0, 3).map((match) => (
                <IconCard
                  key={match._id}
                  Icon={Calendar}
                  iconBgColor="bg-purple-500/10"
                  iconColor="text-purple-500 dark:text-purple-400"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary dark:text-text-primary-dark">
                        {match.teamA?.name} vs {match.teamB?.name}
                      </h3>
                      <p className="text-sm text-base dark:text-base-dark mt-1">
                        {match.tournament?.name || "Tournament"}
                      </p>
                      <p className="text-xs text-base dark:text-base-dark mt-2">
                        📍 {match.venue || "Venue TBD"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-secondary dark:text-secondary-dark">
                        {formatDate(match.matchDate)}
                      </p>
                      <p className="text-xs text-base dark:text-base-dark mt-1">
                        {formatTime(match.matchTime) || "TBD"}
                      </p>
                    </div>
                  </div>
                </IconCard>
              ))
            ) : (
              <p className="text-center text-base dark:text-base-dark py-8">
                No upcoming matches
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
              Recent Activity
            </h2>
            <TrendingUp
              className="text-accent dark:text-accent-dark"
              size={24}
            />
          </div>

          <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const getActivityIcon = () => {
                  if (activity.type === "match") return Trophy;
                  if (activity.type === "tournament") return Calendar;
                  return Users;
                };

                const getActivityColors = () => {
                  if (activity.type === "match")
                    return {
                      bg: "bg-green-500/10",
                      text: "text-green-500 dark:text-green-400",
                    };
                  if (activity.type === "tournament")
                    return {
                      bg: "bg-amber-500/10",
                      text: "text-amber-500 dark:text-amber-400",
                    };
                  return {
                    bg: "bg-blue-500/10",
                    text: "text-blue-500 dark:text-blue-400",
                  };
                };

                const colors = getActivityColors();

                return (
                  <IconCard
                    key={activity.id}
                    Icon={getActivityIcon()}
                    iconBgColor={colors.bg}
                    iconColor={colors.text}
                  >
                    <h3 className="font-semibold text-text-primary dark:text-text-primary-dark">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-base dark:text-base-dark mt-1">
                      {activity.tournament}
                    </p>
                    <p className="text-xs text-base dark:text-base-dark mt-2">
                      {formatDate(activity.date)}
                    </p>
                  </IconCard>
                );
              })
            ) : (
              <p className="text-center text-base dark:text-base-dark py-8">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Achievements & Sports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Achievements
            </h2>
            <span className="text-sm text-base dark:text-base-dark">
              {achievements.length} total
            </span>
          </div>

          {achievements.length ? (
            <div className="space-y-3">
              {achievements.slice(0, 4).map((achievement, idx) => (
                <div
                  key={`${achievement.title}-${idx}`}
                  className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30"
                >
                  <Trophy className="w-4 h-4 text-amber-600 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary dark:text-text-primary-dark line-clamp-1">
                      {achievement.title}
                    </p>
                    {achievement.year && (
                      <p className="text-xs text-base dark:text-base-dark mt-1">
                        {achievement.year}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-base dark:text-base-dark py-6">
              No achievements added yet
            </p>
          )}
        </div>

        <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Sports & Roles
            </h2>
            <span className="text-sm text-base dark:text-base-dark">
              {sports.length} sports
            </span>
          </div>

          {sports.length ? (
            <div className="space-y-3">
              {sports.map((sportItem, idx) => {
                const sportName =
                  typeof sportItem === "string"
                    ? sportItem
                    : sportItem.sport?.name || sportItem.sport?.sportsName || sportItem.name || sportItem.sportsName || "Sport";
                const role = sportItem.role || sportItem.playingRole || profile?.playingRole;

                return (
                  <div
                    key={`${sportName}-${idx}`}
                    className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                        {sportName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary dark:text-text-primary-dark">
                          {sportName}
                        </p>
                        <p className="text-xs text-base dark:text-base-dark">Preferred role</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                      {role || "Player"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-base dark:text-base-dark py-6">
              No sports have been added yet
            </p>
          )}
        </div>
      </div>

    </div>
  );
};

export default PlayerDashboard;

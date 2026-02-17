import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, LogOut } from "lucide-react";
import TeamCard from "../../components/ui/TeamCard";
import Spinner from "../../components/ui/Spinner";
import GridContainer from "../../components/ui/GridContainer";
import ErrorMessage from "../../components/ui/ErrorMessage";
import BackButton from "../../components/ui/BackButton";
import { fetchPlayerTeams, leaveTeam } from "../../store/slices/teamSlice";
import toast from "react-hot-toast";

const PlayerTeams = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { playerTeams, loading, error } = useSelector((state) => state.team);
  const [leavingTeamId, setLeavingTeamId] = useState(null);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchPlayerTeams(user._id));
    }
  }, [dispatch, user?._id]);

  const handleLeaveTeam = async (team) => {
    if (!window.confirm(`Are you sure you want to leave "${team.name}"? You will need to be re-added by the team manager to rejoin.`)) {
      return;
    }

    setLeavingTeamId(team._id);
    try {
      await dispatch(leaveTeam(team._id)).unwrap();
      toast.success(`You have left ${team.name}`);
    } catch (error) {
      toast.error(error || "Failed to leave team");
    } finally {
      setLeavingTeamId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          My Teams
        </h1>
        <p className="text-base dark:text-base-dark">
          Teams you are a member of
          {playerTeams && playerTeams.length > 0 && ` (${playerTeams.length})`}
        </p>
      </div>

      {/* Error State */}
      {error && <ErrorMessage message={typeof error === "string" ? error : "Failed to load teams"} type="error" />}

      {/* Teams Grid */}
      {playerTeams && playerTeams.length > 0 ? (
        <GridContainer cols={2}>
            {playerTeams.map((team) => (
              <div key={team._id} className="relative">
                <TeamCard team={team} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLeaveTeam(team);
                  }}
                  disabled={leavingTeamId === team._id}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg transition-colors font-semibold text-sm shadow-lg disabled:opacity-50"
                  title="Leave Team"
                >
                  <LogOut className="w-4 h-4" />
                  {leavingTeamId === team._id ? "Leaving..." : "Leave Team"}
                </button>
              </div>
            ))}
          </GridContainer>
      ) : (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            No Teams Yet
          </h3>
          <p className="text-base dark:text-base-dark">
            You haven't joined any teams yet. Browse tournaments to find team-based events
            or wait for a team manager to add you.
          </p>
        </div>
      )}

    </div>
  );
};

export default PlayerTeams;

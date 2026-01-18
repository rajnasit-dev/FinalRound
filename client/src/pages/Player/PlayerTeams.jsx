import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users } from "lucide-react";
import TeamCard from "../../components/ui/TeamCard";
import Spinner from "../../components/ui/Spinner";
import GridContainer from "../../components/ui/GridContainer";
import { fetchPlayerTeams } from "../../store/slices/teamSlice";

const PlayerTeams = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { playerTeams, loading, error } = useSelector((state) => state.team);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchPlayerTeams(user._id));
    }
  }, [dispatch, user?._id]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            My Teams
          </h1>
          <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
            Teams you are a member of
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">
            {typeof error === "string" ? error : "Failed to load teams"}
          </p>
        </div>
      )}

      {/* Teams Grid */}
      {playerTeams && playerTeams.length > 0 ? (
        <>
          <p className="text-text-secondary dark:text-text-secondary-dark">
            You are a member of {playerTeams.length} team{playerTeams.length !== 1 ? "s" : ""}
          </p>
          <GridContainer cols={3}>
            {playerTeams.map((team) => (
              <TeamCard key={team._id} team={team} />
            ))}
          </GridContainer>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-card-background dark:bg-card-background-dark rounded-xl">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            No Teams Yet
          </h3>
          <p className="text-text-secondary dark:text-text-secondary-dark text-center max-w-md">
            You haven't joined any teams yet. Browse tournaments to find team-based events
            or wait for a team manager to add you.
          </p>
        </div>
      )}
    </div>
  );
};

export default PlayerTeams;

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, LogOut } from "lucide-react";
import TeamCard from "../../components/ui/TeamCard";
import Spinner from "../../components/ui/Spinner";
import GridContainer from "../../components/ui/GridContainer";
import ErrorMessage from "../../components/ui/ErrorMessage";
import BackButton from "../../components/ui/BackButton";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { fetchPlayerTeams, leaveTeam } from "../../store/slices/teamSlice";
import toast from "react-hot-toast";

const PlayerTeams = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { playerTeams, loading, error } = useSelector((state) => state.team);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchPlayerTeams(user._id));
    }
  }, [dispatch, user?._id]);

  const handleLeaveClick = (team) => {
    setSelectedTeam(team);
    setShowLeaveModal(true);
  };

  const handleLeaveTeam = async () => {
    if (!selectedTeam) return;

    setIsLeaving(true);
    try {
      await dispatch(leaveTeam(selectedTeam._id)).unwrap();
      toast.success(`You have left ${selectedTeam.name}`);
      setShowLeaveModal(false);
      setSelectedTeam(null);
    } catch (error) {
      toast.error(error || "Failed to leave team");
    } finally {
      setIsLeaving(false);
    }
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
    setSelectedTeam(null);
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
      <BackButton className="mb-4" />
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            My Teams
          </h1>
          <p className="mt-1">
            Teams you are a member of
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && <ErrorMessage message={typeof error === "string" ? error : "Failed to load teams"} type="error" />}

      {/* Teams Grid */}
      {playerTeams && playerTeams.length > 0 ? (
        <>
          <p>
            You are a member of {playerTeams.length} team{playerTeams.length !== 1 ? "s" : ""}
          </p>
          <GridContainer cols={2}>
            {playerTeams.map((team) => (
              <div key={team._id} className="relative">
                <TeamCard team={team} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLeaveClick(team);
                  }}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg transition-colors font-semibold text-sm shadow-lg"
                  title="Leave Team"
                >
                  <LogOut className="w-4 h-4" />
                  Leave Team
                </button>
              </div>
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

      {/* Leave Team Confirmation Modal */}
      {showLeaveModal && selectedTeam && (
        <Modal onClose={handleCancelLeave}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
              Leave Team
            </h2>
            <p className="text-text-secondary dark:text-text-secondary-dark mb-6">
              Are you sure you want to leave <span className="font-semibold text-text-primary dark:text-text-primary-dark">{selectedTeam.name}</span>? 
              You will need to be re-added by the team manager to rejoin.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={handleCancelLeave}
                disabled={isLeaving}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleLeaveTeam}
                disabled={isLeaving}
                className="flex items-center gap-2"
              >
                {isLeaving ? (
                  <>
                    <Spinner size="sm" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Leave Team
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PlayerTeams;

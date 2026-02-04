import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Spinner from "../../components/ui/Spinner";
import TeamCard from "../../components/ui/TeamCard";
import BackButton from "../../components/ui/BackButton";
import { fetchManagerTeams } from "../../store/slices/teamSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const ManagerTeams = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { managerTeams, loading } = useSelector((state) => state.team);
  const [deletingTeamId, setDeletingTeamId] = useState(null);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchManagerTeams(user._id));
    }
  }, [dispatch, user]);

  const handleEditTeam = (teamId) => {
    navigate(`/manager/teams/${teamId}/edit`);
  };

  const handleManagePlayers = (teamId) => {
    navigate(`/manager/teams/${teamId}/players`);
  };

  const handleAddPlayer = (teamId) => {
    navigate(`/manager/teams/${teamId}/add-player`);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team? This action cannot be undone and will remove all associated data.")) return;

    setDeletingTeamId(teamId);

    try {
      await axios.delete(`${API_BASE_URL}/teams/${teamId}`, {
        withCredentials: true,
      });

      toast.success("Team deleted successfully!");
      // Refresh the teams list
      dispatch(fetchManagerTeams(user._id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete team");
    } finally {
      setDeletingTeamId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <BackButton className="mb-4" />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            My Teams
          </h1>
          <p className="text-base dark:text-base-dark">
            Manage your teams and roster
          </p>
        </div>
        <Link
          to="/manager/teams/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create New Team
        </Link>
      </div>

      {/* Teams Grid */}
      {managerTeams && managerTeams.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {managerTeams.map((team) => (
            <TeamCard 
              key={team._id} 
              team={team} 
              showEditButton={true}
              onEdit={handleEditTeam}
              onManagePlayers={handleManagePlayers}
              onAddPlayer={handleAddPlayer}
              onDeleteTeam={handleDeleteTeam}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
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
  );
};

export default ManagerTeams;

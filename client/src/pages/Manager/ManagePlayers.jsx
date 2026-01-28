import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { UserMinus, Mail, Phone, MapPin, Loader } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import BackButton from "../../components/ui/BackButton";
import DataTable from "../../components/ui/DataTable";
import defaultAvatar from "../../assets/defaultAvatar.png";
import { fetchTeamById } from "../../store/slices/teamSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const ManagePlayers = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedTeam, loading: teamLoading } = useSelector((state) => state.team);
  const { user } = useSelector((state) => state.auth);

  const [teamPlayers, setTeamPlayers] = useState([]);
  const [removingPlayerId, setRemovingPlayerId] = useState(null);

  // Fetch team data when component mounts
  useEffect(() => {
    if (teamId) {
      dispatch(fetchTeamById(teamId));
    }
  }, [teamId, dispatch]);

  // Update team players when selectedTeam changes
  useEffect(() => {
    if (selectedTeam?.players) {
      setTeamPlayers(selectedTeam.players);
    }
  }, [selectedTeam]);

  const handleRemovePlayer = async (playerId) => {
    if (!confirm("Are you sure you want to remove this player from the team?")) {
      return;
    }

    setRemovingPlayerId(playerId);

    try {
      await axios.delete(
        `${API_BASE_URL}/teams/${teamId}/players/${playerId}`,
        {
          withCredentials: true,
        }
      );

      toast.success("Player removed from team successfully!");
      // Remove player from list
      setTeamPlayers(teamPlayers.filter((p) => p._id !== playerId));
      // Refresh team data
      dispatch(fetchTeamById(teamId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove player");
    } finally {
      setRemovingPlayerId(null);
    }
  };

  const handleRowClick = (player) => {
    navigate(`/players/${player._id}`);
  };

  const getRoleForTeamSport = (player) => {
    const teamSportId = selectedTeam.sport?._id || selectedTeam.sport;
    const matched = player.sports?.find((s) => (s.sport?._id || s.sport) === teamSportId);
    return matched?.role || "";
  };

  const columns = [
    {
      header: "Player",
      width: "30%",
      render: (player) => (
        <div className="flex items-center gap-3">
          <img
            src={player.avatar || defaultAvatar}
            alt={player.fullName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="font-medium text-text-primary dark:text-text-primary-dark truncate">
              {player.fullName}
            </p>
            <p className="text-sm text-base dark:text-base-dark truncate">
              {getRoleForTeamSport(player)}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      width: "25%",
      render: (player) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
            <Mail size={14} className="text-secondary shrink-0" />
            <span className="truncate">{player.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
            <Phone size={14} className="text-secondary shrink-0" />
            <span className="truncate">{player.phone || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      width: "15%",
      render: (player) => (
        <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
          <MapPin size={16} className="text-secondary shrink-0" />
          <span className="truncate">{player.city || "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Gender",
      width: "12%",
      render: (player) => (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            player.gender === "Female"
              ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
              : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
          }`}
        >
          {player.gender}
        </span>
      ),
    },
    {
      header: "Action",
      headerClassName: "text-right",
      cellClassName: "text-right",
      width: "18%",
      render: (player) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemovePlayer(player._id);
          }}
          disabled={removingPlayerId === player._id}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {removingPlayerId === player._id ? (
            <>
              <Loader size={16} className="animate-spin" />
              Removing...
            </>
          ) : (
            <>
              <UserMinus size={16} />
              Remove
            </>
          )}
        </button>
      ),
    },
  ];

  if (teamLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="min-h-screen bg-primary dark:bg-primary-dark py-8">
        <div className="max-w-6xl mx-auto px-4">
          <BackButton className="mb-6" />
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">Team not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary dark:bg-primary-dark py-8">
      <div className="max-w-6xl mx-auto px-4">
        <BackButton className="mb-6" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            Manage Players - {selectedTeam.name}
          </h1>
          <p className="text-base dark:text-base-dark mt-2">
            View and manage players in your team
          </p>
        </div>

        {/* Players Table */}
        {teamLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-secondary" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={teamPlayers}
            onRowClick={handleRowClick}
            itemsPerPage={10}
            emptyMessage="No players in this team yet"
          />
        )}
      </div>
    </div>
  );
};

export default ManagePlayers;

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { UserPlus, Mail, Phone, MapPin, Loader } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import BackButton from "../../components/ui/BackButton";
import DataTable from "../../components/ui/DataTable";
import defaultAvatar from "../../assets/defaultAvatar.png";
import { fetchTeamById } from "../../store/slices/teamSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const AddPlayer = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedTeam, loading: teamLoading } = useSelector((state) => state.team);

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingPlayerId, setRequestingPlayerId] = useState(null);

  // Fetch team data when component mounts
  useEffect(() => {
    if (teamId) {
      dispatch(fetchTeamById(teamId));
    }
  }, [teamId, dispatch]);

  useEffect(() => {
    fetchAvailablePlayers();
  }, [teamId, selectedTeam]);

  const fetchAvailablePlayers = useCallback(async () => {
    if (!selectedTeam) return;

    setLoading(true);

    try {
      const sportId = selectedTeam.sport?._id || selectedTeam.sport;
      const gender = selectedTeam.gender || "Mixed";

      // Fetch players and sent requests in parallel
      const [playersRes, requestsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/players/search/by-sport-gender`, {
          params: { sportId, gender },
          withCredentials: true,
        }),
        axios.get(`${API_BASE_URL}/requests/sent`, {
          withCredentials: true,
        }),
      ]);

      if (playersRes.data?.data) {
        const teamPlayerIds = (selectedTeam.players?.map((p) => String(p._id || p)) || []);

        // Get IDs of players who already have a pending request for this team
        const pendingRequestPlayerIds = (requestsRes.data?.data || [])
          .filter((r) => r.receiver?._id && (String(r.team?._id || r.team) === String(teamId)))
          .map((r) => String(r.receiver._id));

        const filteredPlayers = playersRes.data.data.filter(
          (p) => !teamPlayerIds.includes(String(p._id)) && !pendingRequestPlayerIds.includes(String(p._id))
        );
        setPlayers(filteredPlayers);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch players");
    } finally {
      setLoading(false);
    }
  }, [selectedTeam, teamId]);

  useEffect(() => {
    fetchAvailablePlayers();
  }, [fetchAvailablePlayers]);

  const handleSendRequest = async (playerId) => {
    setRequestingPlayerId(playerId);

    try {
      await axios.post(
        `${API_BASE_URL}/requests/send-player-request`,
        {
          playerId,
          teamId,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Request sent successfully!");
      // Remove player from list
      setPlayers((prev) => prev.filter((p) => p._id !== playerId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setRequestingPlayerId(null);
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
      width: "35%",
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
          <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
            <MapPin size={14} className="text-secondary shrink-0" />
            <span className="truncate">{player.city || "N/A"}</span>
          </div>
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
      width: "23%",
      render: (player) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSendRequest(player._id);
          }}
          disabled={requestingPlayerId === player._id}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 dark:bg-secondary-dark dark:hover:bg-secondary-dark/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
        >
          {requestingPlayerId === player._id ? (
            <>
              <Loader size={16} className="animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <UserPlus size={16} />
              Send Request
            </>
          )}
        </button>
      ),
    },
  ];

  if (teamLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="space-y-6">
          <BackButton className="mb-6" />
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">Team not found</p>
          </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <BackButton className="mb-6" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            Add Players - {selectedTeam.name}
          </h1>
          <p className="text-base dark:text-base-dark mt-2">
            Send requests to available players to join your team
          </p>
        </div>

        {/* Players Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-secondary" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={players}
            onRowClick={handleRowClick}
            itemsPerPage={10}
            emptyMessage="No available players for this sport and gender"
          />
        )}
    </div>
  );
};

export default AddPlayer;

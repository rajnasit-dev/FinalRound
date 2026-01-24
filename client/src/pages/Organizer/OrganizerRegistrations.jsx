import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Users, Trophy, Filter, CheckCircle, Clock } from "lucide-react";
import axios from "axios";
import { fetchAllTournaments, fetchTournamentParticipants } from "../../store/slices/tournamentSlice";
import Spinner from "../../components/ui/Spinner";
import Container from "../../components/container/Container";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const OrganizerRegistrations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { tournaments, participants, loading } = useSelector((state) => state.tournament);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Fetch tournaments on mount
  useEffect(() => {
    dispatch(fetchAllTournaments({}));
  }, [dispatch]);

  const organizerTournaments = useMemo(
    () => (tournaments || []).filter((t) => t.organizer?._id === user?._id),
    [tournaments, user]
  );

  // Set default selection when data available
  useEffect(() => {
    if (!selectedTournamentId && organizerTournaments.length > 0) {
      setSelectedTournamentId(organizerTournaments[0]._id);
    }
  }, [organizerTournaments, selectedTournamentId]);

  // Fetch participants when selection changes
  useEffect(() => {
    if (selectedTournamentId) {
      dispatch(fetchTournamentParticipants(selectedTournamentId));
      fetchPendingRequests(selectedTournamentId);
    }
  }, [dispatch, selectedTournamentId]);

  const fetchPendingRequests = async (tournamentId) => {
    try {
      setRequestsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/tournaments/${tournamentId}/requests`,
        { withCredentials: true }
      );
      setRequests(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const tournamentOptions = organizerTournaments.map((t) => ({
    value: t._id,
    label: `${t.name} (${t.sport?.name || "Sport"})`,
  }));

  const renderBadge = (text, tone = "slate") => {
    const styles = {
      green: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
      amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
      slate: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-200 dark:border-slate-700",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[tone] || styles.slate}`}>
        {text}
      </span>
    );
  };

  const navigateToTeamDetail = (teamId) => {
    navigate(`/teams/${teamId}`);
  };

  const navigateToPlayerDetail = (playerId) => {
    navigate(`/players/${playerId}`);
  };

  const teamRegistrations = {
    approved: participants?.approvedTeams || [],
    pending: (participants?.registeredTeams || []).filter(
      (team) => !(participants?.approvedTeams || []).some((t) => t._id === team._id)
    ),
  };

  const playerRegistrations = {
    approved: participants?.approvedPlayers || [],
    pending: (participants?.registeredPlayers || []).filter(
      (p) => !(participants?.approvedPlayers || []).some((ap) => ap._id === p._id)
    ),
  };

  const currentTournament = organizerTournaments.find((t) => t._id === selectedTournamentId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            Registrations
          </h1>
          <p className="text-base dark:text-base-dark">
            Review team/player registrations for your tournaments
          </p>
        </div>
      </div>

      {/* Filter */}
      <Container>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary dark:text-text-primary-dark">
            <Filter className="w-4 h-4" />
            Filter by tournament
          </div>
          <div className="flex-1 max-w-xl">
            <select
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              {tournamentOptions.length === 0 && <option value="">No tournaments found</option>}
              {tournamentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {currentTournament && (
            <div className="text-sm text-base dark:text-base-dark">
              <span className="font-semibold">Type:</span> {currentTournament.registrationType} • {currentTournament.sport?.name || "Sport"}
            </div>
          )}
        </div>
      </Container>

      {!loading && organizerTournaments.length === 0 && (
        <Container>
          <p className="text-base dark:text-base-dark">You have no tournaments yet. Create one to start collecting registrations.</p>
        </Container>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" text="Loading registrations..." />
        </div>
      )}

      {/* Content */}
      {!loading && selectedTournamentId && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Teams Section */}
          <Container>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Team Registrations</h2>
              </div>
              {renderBadge(`${teamRegistrations.approved.length} approved`, "green")}
            </div>

            {teamRegistrations.pending.length === 0 && teamRegistrations.approved.length === 0 ? (
              <p className="text-base dark:text-base-dark">No team registrations yet.</p>
            ) : (
              <div className="space-y-3">
                {teamRegistrations.pending.map((team) => (
              <div
                key={team._id}
                onClick={() => navigateToTeamDetail(team._id)}
                className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
              >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-amber-200 overflow-hidden">
                        {team.logoUrl ? (
                          <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-amber-700">
                            {team.name?.[0] || "T"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary dark:text-text-primary-dark">{team.name}</p>
                        {renderBadge("Pending", "amber")}
                      </div>
                    </div>
                  </div>
                ))}

                {teamRegistrations.approved.map((team) => (
              <div
                key={team._id}
                onClick={() => navigateToTeamDetail(team._id)}
                className="p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
              >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-green-200 overflow-hidden">
                        {team.logoUrl ? (
                          <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-green-700">
                            {team.name?.[0] || "T"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary dark:text-text-primary-dark">{team.name}</p>
                        {renderBadge("Approved", "green")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Container>

          {/* Players Section */}
          <Container>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold">Player Registrations</h2>
              </div>
              {renderBadge(`${playerRegistrations.approved.length} approved`, "green")}
            </div>

            {playerRegistrations.pending.length === 0 && playerRegistrations.approved.length === 0 ? (
              <p className="text-base dark:text-base-dark">No player registrations yet.</p>
            ) : (
              <div className="space-y-3">
                {playerRegistrations.pending.map((player) => (
                  <div
                    key={player._id}
                    onClick={() => navigateToPlayerDetail(player._id)}
                    className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-amber-200 overflow-hidden">
                        {player.avatar ? (
                          <img src={player.avatar} alt={player.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-amber-700">
                            {player.fullName?.[0] || "P"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary dark:text-text-primary-dark">{player.fullName}</p>
                        {renderBadge("Pending", "amber")}
                      </div>
                    </div>
                  </div>
                ))}

                {playerRegistrations.approved.map((player) => (
                  <div
                    key={player._id}
                    onClick={() => navigateToPlayerDetail(player._id)}
                    className="p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-green-200 overflow-hidden">
                        {player.avatar ? (
                          <img src={player.avatar} alt={player.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-green-700">
                            {player.fullName?.[0] || "P"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary dark:text-text-primary-dark">{player.fullName}</p>
                        {renderBadge("Approved", "green")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Container>
        </div>
      )}

      {/* Requests Section */}
      {!loading && selectedTournamentId && (
        <Container>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold">Pending Requests</h2>
            </div>
            {renderBadge(`${requests.length} requests`, "slate")}
          </div>

          {requestsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="sm" text="Loading requests..." />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-base dark:text-base-dark">No pending requests at this time.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request._id}
                  onClick={() => {
                    if (request.requestType === "PLAYER_TO_TEAM" && request.sender?._id) {
                      navigateToPlayerDetail(request.sender._id);
                    } else if (request.requestType === "TEAM_TO_PLAYER" && request.receiver?._id) {
                      navigateToPlayerDetail(request.receiver._id);
                    } else if (request.team?._id) {
                      navigateToTeamDetail(request.team._id);
                    }
                  }}
                  className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <p className="font-semibold text-text-primary dark:text-text-primary-dark">
                          {request.requestType === "PLAYER_TO_TEAM"
                            ? `${request.sender?.fullName} → ${request.team?.name}`
                            : `${request.team?.name} → ${request.receiver?.fullName}`}
                        </p>
                      </div>
                      {request.message && (
                        <p className="text-sm text-base dark:text-base-dark mb-2">{request.message}</p>
                      )}
                      <div className="flex items-center gap-2">
                        {renderBadge(request.requestType === "PLAYER_TO_TEAM" ? "Player Request" : "Team Invitation", "slate")}
                        {renderBadge("Pending", "amber")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      )}
    </div>
  );
};

export default OrganizerRegistrations;

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  Check,
  X,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  fetchTournamentById,
  fetchTournamentParticipants,
  approveTeamForTournament,
  rejectTeamForTournament,
  approvePlayerForTournament,
  rejectPlayerForTournament,
} from "../../store/slices/tournamentSlice";
import {
  fetchMatchesByTournament,
  deleteMatch,
  updateMatchScore,
  generateTournamentFixtures,
} from "../../store/slices/matchSlice";

const OrganizerTournamentDashboard = () => {
  const { tournamentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { selectedTournament: tournament, participants, loading } = useSelector(
    (state) => state.tournament
  );
  const { matches, loading: matchesLoading } = useSelector((state) => state.match);

  const [activeTab, setActiveTab] = useState("participants");
  const [editingScoreId, setEditingScoreId] = useState(null);
  const [scoreData, setScoreData] = useState({ scoreA: "", scoreB: "" });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentById(tournamentId));
      dispatch(fetchTournamentParticipants(tournamentId));
      dispatch(fetchMatchesByTournament(tournamentId));
    }
  }, [dispatch, tournamentId]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const isOrganizer = tournament?.organizer?._id === user?._id;

  const handleApproveTeam = async (teamId) => {
    await dispatch(approveTeamForTournament({ tournamentId, teamId }));
    dispatch(fetchTournamentParticipants(tournamentId));
    setSuccessMessage("Team approved successfully!");
  };

  const handleRejectTeam = async (teamId) => {
    await dispatch(rejectTeamForTournament({ tournamentId, teamId }));
    dispatch(fetchTournamentParticipants(tournamentId));
    setSuccessMessage("Team rejected successfully!");
  };

  const handleApprovePlayer = async (playerId) => {
    await dispatch(approvePlayerForTournament({ tournamentId, playerId }));
    dispatch(fetchTournamentParticipants(tournamentId));
    setSuccessMessage("Player approved successfully!");
  };

  const handleRejectPlayer = async (playerId) => {
    await dispatch(rejectPlayerForTournament({ tournamentId, playerId }));
    dispatch(fetchTournamentParticipants(tournamentId));
    setSuccessMessage("Player rejected successfully!");
  };

  const handleUpdateScore = async (matchId) => {
    if (scoreData.scoreA && scoreData.scoreB) {
      await dispatch(updateMatchScore({ matchId, scoreData }));
      dispatch(fetchMatchesByTournament(tournamentId));
      setEditingScoreId(null);
      setScoreData({ scoreA: "", scoreB: "" });
      setSuccessMessage("Score updated successfully!");
    }
  };

  const handleGenerateFixtures = async () => {
    await dispatch(generateTournamentFixtures(tournamentId));
    dispatch(fetchMatchesByTournament(tournamentId));
    setSuccessMessage("Fixtures generated successfully!");
  };

  const handleDeleteMatch = async (matchId) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      await dispatch(deleteMatch(matchId));
      dispatch(fetchMatchesByTournament(tournamentId));
      setSuccessMessage("Match deleted successfully!");
    }
  };

  if (loading || matchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Tournament not found</h2>
          <Link to="/organizer/tournaments" className="text-secondary hover:underline">
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <Link to="/organizer/tournaments" className="text-secondary hover:underline">
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const pendingTeams = tournament?.registeredTeams?.filter(
    (team) => !tournament.approvedTeams?.includes(team._id)
  ) || [];

  const approvedTeams = tournament?.approvedTeams || [];

  const pendingPlayers = tournament?.registeredPlayers?.filter(
    (player) => !tournament.approvedPlayers?.includes(player._id)
  ) || [];

  const approvedPlayers = tournament?.approvedPlayers || [];

  const liveMatches = matches?.filter((m) => m.status === "Live") || [];
  const scheduledMatches = matches?.filter((m) => m.status === "Scheduled") || [];
  const completedMatches = matches?.filter((m) => m.status === "Completed") || [];

  const getParticipantName = (participant) => {
    return participant.fullName || participant.name;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/organizer/tournaments"
          className="inline-flex items-center gap-2 mb-4 text-base dark:text-base-dark hover:text-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournaments
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
              {tournament.name} - Management Dashboard
            </h1>
            <p className="text-base dark:text-base-dark">
              Manage participants and fixtures
            </p>
          </div>
          {isOrganizer && (
            <Link
              to={`/organizer/tournaments/${tournamentId}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Tournament
            </Link>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Tournament Info Card */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{matches?.length || 0}</div>
            <div className="text-sm text-base dark:text-base-dark">Total Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{scheduledMatches.length}</div>
            <div className="text-sm text-base dark:text-base-dark">Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{liveMatches.length}</div>
            <div className="text-sm text-base dark:text-base-dark">Live</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{completedMatches.length}</div>
            <div className="text-sm text-base dark:text-base-dark">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {tournament.registrationType === "Team" ? approvedTeams.length : approvedPlayers.length}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Approved</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-base-dark dark:border-base flex gap-4">
        <button
          onClick={() => setActiveTab("participants")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "participants"
              ? "border-secondary text-secondary"
              : "border-transparent text-base dark:text-base-dark hover:text-text-primary dark:hover:text-text-primary-dark"
          }`}
        >
          Participants
        </button>
        <button
          onClick={() => setActiveTab("fixtures")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "fixtures"
              ? "border-secondary text-secondary"
              : "border-transparent text-base dark:text-base-dark hover:text-text-primary dark:hover:text-text-primary-dark"
          }`}
        >
          Fixtures & Scores
        </button>
      </div>

      {/* Participants Tab */}
      {activeTab === "participants" && (
        <div className="space-y-6">
          {/* Pending Participants */}
          {(pendingTeams.length > 0 || pendingPlayers.length > 0) && (
            <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                  Pending Approvals
                </h2>
              </div>

              {/* Pending Teams */}
              {pendingTeams.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3 text-text-primary dark:text-text-primary-dark">
                    Teams ({pendingTeams.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingTeams.map((team) => (
                      <div
                        key={team._id}
                        className="flex items-center justify-between p-4 bg-primary dark:bg-primary-dark rounded-lg border border-base-dark/30 dark:border-base/30"
                      >
                        <div>
                          <p className="font-medium text-text-primary dark:text-text-primary-dark">
                            {team.name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveTeam(team._id)}
                            className="bg-green-600 hover:bg-green-700 px-3 py-2 flex items-center gap-2 text-sm"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectTeam(team._id)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-2 flex items-center gap-2 text-sm"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Players */}
              {pendingPlayers.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-text-primary dark:text-text-primary-dark">
                    Players ({pendingPlayers.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingPlayers.map((player) => (
                      <div
                        key={player._id}
                        className="flex items-center justify-between p-4 bg-primary dark:bg-primary-dark rounded-lg border border-base-dark/30 dark:border-base/30"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={player.avatar || "https://via.placeholder.com/40"}
                            alt={player.fullName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-text-primary dark:text-text-primary-dark">
                              {player.fullName}
                            </p>
                            <p className="text-sm text-base dark:text-base-dark">{player.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprovePlayer(player._id)}
                            className="bg-green-600 hover:bg-green-700 px-3 py-2 flex items-center gap-2 text-sm"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectPlayer(player._id)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-2 flex items-center gap-2 text-sm"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Approved Participants */}
          <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                Approved Participants
              </h2>
            </div>

            {/* Approved Teams */}
            {approvedTeams.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3 text-text-primary dark:text-text-primary-dark">
                  Teams ({approvedTeams.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedTeams.map((team) => (
                    <div
                      key={team._id}
                      className="p-4 bg-primary dark:bg-primary-dark rounded-lg border border-green-500/30"
                    >
                      <p className="font-medium text-text-primary dark:text-text-primary-dark">
                        {team.name}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Approved
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Players */}
            {approvedPlayers.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 text-text-primary dark:text-text-primary-dark">
                  Players ({approvedPlayers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedPlayers.map((player) => (
                    <div
                      key={player._id}
                      className="p-4 bg-primary dark:bg-primary-dark rounded-lg border border-green-500/30 flex items-center gap-3"
                    >
                      <img
                        src={player.avatar || "https://via.placeholder.com/40"}
                        alt={player.fullName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-text-primary dark:text-text-primary-dark text-sm">
                          {player.fullName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fixtures Tab */}
      {activeTab === "fixtures" && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateFixtures}
              disabled={
                (tournament.registrationType === "Team" && approvedTeams.length < 2) ||
                (tournament.registrationType === "Player" && approvedPlayers.length < 2) ||
                tournament?.isScheduleCreated
              }
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Fixtures
            </Button>
            <Button
              onClick={() => navigate(`/organizer/tournaments/${tournamentId}/fixtures/create`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Manual Match
            </Button>
          </div>

          {/* Fixtures Table */}
          {matches.length > 0 && (
            <div className="bg-card-background dark:bg-card-background-dark rounded-xl overflow-hidden border border-base-dark dark:border-base">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary dark:bg-primary-dark border-b border-base-dark dark:border-base">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                        Match
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                        Date & Time
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match, index) => (
                      <tr
                        key={match._id}
                        className="border-b border-base-dark/30 dark:border-base/30 hover:bg-primary/50 dark:hover:bg-primary-dark/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="font-semibold text-text-primary dark:text-text-primary-dark">
                              {getParticipantName(match.teamA || match.playerA)} vs{" "}
                              {getParticipantName(match.teamB || match.playerB)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-base dark:text-base-dark">
                          {new Date(match.scheduledAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              match.status === "Scheduled"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                : match.status === "Live"
                                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                                : match.status === "Completed"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {match.status === "Scheduled" && <Clock className="w-3 h-3" />}
                            {match.status === "Live" && <Play className="w-3 h-3" />}
                            {match.status === "Completed" && <CheckCircle className="w-3 h-3" />}
                            {match.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-text-primary dark:text-text-primary-dark">
                          {editingScoreId === match._id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="A"
                                value={scoreData.scoreA}
                                onChange={(e) =>
                                  setScoreData({ ...scoreData, scoreA: e.target.value })
                                }
                                className="w-12 px-2 py-1 bg-primary dark:bg-primary-dark border border-base-dark rounded text-sm"
                              />
                              <span>vs</span>
                              <input
                                type="text"
                                placeholder="B"
                                value={scoreData.scoreB}
                                onChange={(e) =>
                                  setScoreData({ ...scoreData, scoreB: e.target.value })
                                }
                                className="w-12 px-2 py-1 bg-primary dark:bg-primary-dark border border-base-dark rounded text-sm"
                              />
                              <button
                                onClick={() => handleUpdateScore(match._id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setEditingScoreId(null)}
                                className="text-red-600 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div>
                              {match.scoreA && match.scoreB
                                ? `${match.scoreA} vs ${match.scoreB}`
                                : match.status === "Live" || match.status === "Completed"
                                ? "—"
                                : "—"}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {(match.status === "Live" || match.status === "Scheduled") && (
                              <button
                                onClick={() => setEditingScoreId(match._id)}
                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {match.status === "Scheduled" && (
                              <button
                                onClick={() => handleDeleteMatch(match._id)}
                                className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {matches.length === 0 && (
            <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
                No matches scheduled yet
              </h3>
              <p className="text-base dark:text-base-dark mb-6">
                {tournament.registrationType === "Team"
                  ? approvedTeams.length < 2
                    ? "Approve at least 2 teams to generate fixtures"
                    : "Click 'Generate Fixtures' to auto-schedule matches"
                  : approvedPlayers.length < 2
                  ? "Approve at least 2 players to generate fixtures"
                  : "Click 'Generate Fixtures' to auto-schedule matches"}
              </p>
              <Button
                onClick={handleGenerateFixtures}
                disabled={
                  (tournament.registrationType === "Team" && approvedTeams.length < 2) ||
                  (tournament.registrationType === "Player" && approvedPlayers.length < 2) ||
                  tournament?.isScheduleCreated
                }
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <Plus className="w-5 h-5 mr-2" />
                Generate Fixtures
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizerTournamentDashboard;

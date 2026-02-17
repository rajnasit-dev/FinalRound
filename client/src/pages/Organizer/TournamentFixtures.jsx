import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit, Trash2, Play, Calendar, Trophy, Users, Ban } from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../../components/ui/Spinner";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";
import MatchDetailModal from "../../components/ui/MatchDetailModal";
import useDateFormat from "../../hooks/useDateFormat";
import useStatusColor from "../../hooks/useStatusColor";
import { fetchTournamentById } from "../../store/slices/tournamentSlice";
import { fetchMatchesByTournament, deleteMatch, updateMatchStatus } from "../../store/slices/matchSlice";

const TournamentFixtures = () => {
  const { tournamentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatDate, formatTime } = useDateFormat();
  const { getStatusColor } = useStatusColor();
  const { user } = useSelector((state) => state.auth);
  const { selectedTournament: tournament, loading: tournamentLoading } = useSelector(
    (state) => state.tournament
  );
  const { tournamentMatches: matches, loading: matchesLoading } = useSelector((state) => state.match);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentById(tournamentId));
      dispatch(fetchMatchesByTournament(tournamentId));
    }
  }, [dispatch, tournamentId]);

  // Check if user is the organizer
  const isOrganizer = tournament?.organizer?._id === user?._id;

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm("Are you sure you want to delete this match?")) return;
    
    try {
      await dispatch(deleteMatch(matchId)).unwrap();
      toast.success("Match deleted successfully!");
      dispatch(fetchMatchesByTournament(tournamentId));
    } catch (error) {
      toast.error(error?.message || error || "Failed to delete match");
    }
  };

  const handleCancelMatch = async (matchId, isCancelled) => {
    const action = isCancelled ? "reinstate" : "cancel";
    if (!window.confirm(`Are you sure you want to ${action} this match?`)) return;
    
    try {
      await dispatch(updateMatchStatus({ matchId, isCancelled: !isCancelled })).unwrap();
      toast.success(`Match ${isCancelled ? "reinstated" : "cancelled"} successfully!`);
      dispatch(fetchMatchesByTournament(tournamentId));
    } catch (error) {
      toast.error(error?.message || error || `Failed to ${action} match`);
    }
  };

  if (tournamentLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
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
          <p className="text-base dark:text-base-dark mb-4">
            You don't have permission to manage fixtures for this tournament
          </p>
          <Link to="/organizer/tournaments" className="text-secondary hover:underline">
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const liveMatches = matches?.filter((m) => m.status === "Live") || [];
  const scheduledMatches = matches?.filter((m) => m.status === "Scheduled") || [];
  const completedMatches = matches?.filter((m) => m.status === "Completed") || [];
  const cancelledMatches = matches?.filter((m) => m.status === "Cancelled") || [];

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
              {tournament.name} - Fixtures
            </h1>
            <p className="text-base dark:text-base-dark">
              Manage matches and schedules for this tournament
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate(`/organizer/tournaments/${tournamentId}/fixtures/create`)}
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Schedule New Match
            </Button>
          </div>
        </div>
      </div>

      {/* Tournament Info Card */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
        <div className="grid md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-1">
              {matches?.length || 0}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Total Matches</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {scheduledMatches.length}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
              {liveMatches.length}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Live Now</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {completedMatches.length}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {cancelledMatches.length}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Matches Table */}
      <DataTable
        columns={[
          {
            header: "Date & Time",
            accessor: "scheduledAt",
            render: (match) => (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-base dark:text-base-dark" />
                <div>
                  <div className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                    {formatDate(match.scheduledAt)}
                  </div>
                  <div className="text-xs text-base dark:text-base-dark">
                    {formatTime(match.scheduledAt)}
                  </div>
                </div>
              </div>
            ),
          },
          {
            header: "Participants",
            accessor: "participants",
            render: (match) => {
              const participantA = match.teamA?.name || match.playerA?.fullName || "TBD";
              const participantB = match.teamB?.name || match.playerB?.fullName || "TBD";
              return (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-secondary dark:text-secondary" />
                  <div className="text-sm text-text-primary dark:text-text-primary-dark">
                    {participantA} <span className="text-base dark:text-base-dark">vs</span> {participantB}
                  </div>
                </div>
              );
            },
          },
          {
            header: "Status",
            accessor: "status",
            render: (match) => {
              const statusClass = getStatusColor(match.status);
              return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${statusClass}`}>
                  {match.status === "Live" && <span className="w-2 h-2 bg-current rounded-full animate-pulse mr-1.5" />}
                  {match.status}
                </span>
              );
            },
          },
          {
            header: "Actions",
            accessor: "actions",
            render: (match) => (
              <div className="flex items-center gap-2">
                {match.status !== "Cancelled" && (
                  <Button
                    variant="info"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/organizer/matches/${match._id}/edit`);
                    }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    {match.status === "Live" ? "Update" : "Edit"}
                  </Button>
                )}
                {(match.status === "Scheduled" || match.status === "Live") && (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelMatch(match._id, false);
                    }}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Cancel
                  </Button>
                )}
                {match.status === "Cancelled" && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelMatch(match._id, true);
                    }}
                  >
                    Reinstate
                  </Button>
                )}
                {match.status === "Scheduled" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMatch(match._id);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        data={matches || []}
        itemsPerPage={10}
        onRowClick={(match) => setSelectedMatch(match)}
        emptyMessage="No matches scheduled yet. Click 'Schedule New Match' to create your first match."
      />

      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
};

export default TournamentFixtures;

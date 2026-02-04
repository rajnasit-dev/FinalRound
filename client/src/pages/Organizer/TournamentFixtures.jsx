import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus, ArrowLeft, Edit, Trash2, Play, Calendar, Trophy, Users } from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../../components/ui/Spinner";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";
import useDateFormat from "../../hooks/useDateFormat";
import useStatusColor from "../../hooks/useStatusColor";
import { fetchTournamentById } from "../../store/slices/tournamentSlice";
import { fetchMatchesByTournament, deleteMatch } from "../../store/slices/matchSlice";

const TournamentFixtures = () => {
  const { tournamentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatDate, formatTime } = useDateFormat();
  const getStatusColor = useStatusColor();
  const { user } = useSelector((state) => state.auth);
  const { selectedTournament: tournament, loading: tournamentLoading } = useSelector(
    (state) => state.tournament
  );
  const { matches, loading: matchesLoading } = useSelector((state) => state.match);

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
    
    await dispatch(deleteMatch(matchId));
    dispatch(fetchMatchesByTournament(tournamentId));
  };

  if (tournamentLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  return (
    <div className="space-y-8">
      <BackButton className="mb-6" />
      {/* Header */}
      <div>
        <Link
          to="/organizer/tournaments"
          className="inline-flex items-center gap-2 mb-4 text-base dark:text-base-dark hover:text-secondary dark:hover:text-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournaments
        </Link>
        
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
        <div className="grid md:grid-cols-4 gap-6">
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
            header: "Score",
            accessor: "score",
            render: (match) => (
              <div className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                {match.status === "Completed" || match.status === "Live"
                  ? `${match.scoreA || 0} - ${match.scoreB || 0}`
                  : "-"}
              </div>
            ),
          },
          {
            header: "Status",
            accessor: "status",
            render: (match) => {
              const statusClass = getStatusColor(match.status);
              return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
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
                <Button
                  onClick={() => navigate(`/organizer/matches/${match._id}/edit`)}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  {match.status === "Live" ? "Update" : "Edit"}
                </Button>
                {match.status === "Scheduled" && (
                  <Button
                    onClick={() => handleDeleteMatch(match._id)}
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        data={matches || []}
        itemsPerPage={10}
        emptyMessage="No matches scheduled yet. Click 'Schedule New Match' to create your first match."
      />
    </div>
  );
};

export default TournamentFixtures;

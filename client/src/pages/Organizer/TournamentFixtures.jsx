import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus, ArrowLeft, Edit, Trash2, Play, CheckCircle } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import MatchCard from "../../components/ui/MatchCard";
import Button from "../../components/ui/Button";
import { fetchTournamentById } from "../../store/slices/tournamentSlice";
import { fetchMatchesByTournament, deleteMatch, generateTournamentFixtures } from "../../store/slices/matchSlice";

const TournamentFixtures = () => {
  const { tournamentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const canGenerate = isOrganizer && !tournament?.isScheduleCreated && (tournament?.approvedTeams?.length || 0) >= 2;

  const handleGenerateFixtures = async () => {
    await dispatch(generateTournamentFixtures(tournamentId));
    dispatch(fetchMatchesByTournament(tournamentId));
  };

  const handleDeleteMatch = async (matchId) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      await dispatch(deleteMatch(matchId));
      dispatch(fetchMatchesByTournament(tournamentId));
    }
  };

  if (tournamentLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" text="Loading fixtures..." />
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
            <Button
              onClick={handleGenerateFixtures}
              disabled={!canGenerate}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60"
            >
              <CheckCircle className="w-5 h-5" />
              Generate Fixtures
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

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-6 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            Live Matches
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {liveMatches.map((match) => (
              <div key={match._id} className="relative">
                <MatchCard match={match} />
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => navigate(`/organizer/matches/${match._id}/edit`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Update Score
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Matches */}
      {scheduledMatches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
            Scheduled Matches
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {scheduledMatches.map((match) => (
              <div key={match._id} className="relative">
                <MatchCard match={match} />
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => navigate(`/organizer/matches/${match._id}/edit`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteMatch(match._id)}
                    className="px-4 bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Matches */}
      {completedMatches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
            Completed Matches
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {completedMatches.map((match) => (
              <MatchCard key={match._id} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {matches?.length === 0 && (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            No matches scheduled yet
          </h3>
          <p className="text-base dark:text-base-dark mb-6">
            Start by scheduling the first match for this tournament
          </p>
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => navigate(`/organizer/tournaments/${tournamentId}/fixtures/create`)}
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Schedule Match
            </Button>
            <Button
              onClick={handleGenerateFixtures}
              disabled={!canGenerate}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60"
            >
              <CheckCircle className="w-5 h-5" />
              Generate Fixtures
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentFixtures;

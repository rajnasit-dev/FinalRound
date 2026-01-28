import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Edit,
  Check,
  X,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";
import DataTable from "../../components/ui/DataTable";
import {
  fetchTournamentById,
  fetchTournamentParticipants,
  approveTeamForTournament,
  rejectTeamForTournament,
  approvePlayerForTournament,
  rejectPlayerForTournament,
} from "../../store/slices/tournamentSlice";
import defaultTeamAvatar from "../../assets/defaultTeamAvatar.png";

const OrganizerTournamentDashboard = () => {
  const { tournamentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { selectedTournament: tournament, participants, loading } = useSelector(
    (state) => state.tournament
  );

  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentById(tournamentId));
      dispatch(fetchTournamentParticipants(tournamentId));
    }
  }, [dispatch, tournamentId]);

  const isOrganizer = tournament?.organizer?._id === user?._id;

  const handleApproveTeam = async (teamId) => {
    try {
      await dispatch(approveTeamForTournament({ tournamentId, teamId })).unwrap();
      dispatch(fetchTournamentById(tournamentId));
      dispatch(fetchTournamentParticipants(tournamentId));
      toast.success("Team approved successfully!");
    } catch (error) {
      toast.error(error || "Failed to approve team");
    }
  };

  const handleRejectTeam = async (teamId) => {
    try {
      await dispatch(rejectTeamForTournament({ tournamentId, teamId })).unwrap();
      dispatch(fetchTournamentById(tournamentId));
      dispatch(fetchTournamentParticipants(tournamentId));
      toast.success("Team rejected successfully!");
    } catch (error) {
      toast.error(error || "Failed to reject team");
    }
  };

  const handleApprovePlayer = async (playerId) => {
    try {
      await dispatch(approvePlayerForTournament({ tournamentId, playerId })).unwrap();
      dispatch(fetchTournamentById(tournamentId));
      dispatch(fetchTournamentParticipants(tournamentId));
      toast.success("Player approved successfully!");
    } catch (error) {
      toast.error(error || "Failed to approve player");
    }
  };

  const handleRejectPlayer = async (playerId) => {
    try {
      await dispatch(rejectPlayerForTournament({ tournamentId, playerId })).unwrap();
      dispatch(fetchTournamentById(tournamentId));
      dispatch(fetchTournamentParticipants(tournamentId));
      toast.success("Player rejected successfully!");
    } catch (error) {
      toast.error(error || "Failed to reject player");
    }
  };

  if (loading) {
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
          <Link to="/organizer/tournaments" className="text-secondary hover:underline">
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const pendingTeams = tournament?.registeredTeams?.filter(
    (team) => !tournament.approvedTeams?.some((approvedTeam) => approvedTeam._id === team._id)
  ) || [];

  const approvedTeams = tournament?.approvedTeams || [];

  const pendingPlayers = tournament?.registeredPlayers?.filter(
    (player) => !tournament.approvedPlayers?.some((approvedPlayer) => approvedPlayer._id === player._id)
  ) || [];

  const approvedPlayers = tournament?.approvedPlayers || [];

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
              {tournament.name} - Participants Management
            </h1>
            <p className="text-base dark:text-base-dark">
              Approve or reject participant requests
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

      {/* Tournament Info Card */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {tournament.registrationType === "Team" ? pendingTeams.length : pendingPlayers.length}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Pending Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tournament.registrationType === "Team" ? approvedTeams.length : approvedPlayers.length}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {tournament.teamLimit || "N/A"}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Team Limit</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tournament.registrationType === "Team" 
                ? tournament.registeredTeams?.length || 0 
                : tournament.registeredPlayers?.length || 0}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Total Requests</div>
          </div>
        </div>
      </div>

      {/* Participants Section */}
      <div className="space-y-6">
          {/* Pending Participants */}
          {(pendingTeams.length > 0 || pendingPlayers.length > 0) && (
            <div>
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
                  <DataTable
                    columns={[
                      {
                        header: "Team",
                        width: "35%",
                        render: (team) => (
                          <div className="flex items-center gap-3">
                            <img
                              src={team.logoUrl || defaultTeamAvatar}
                              alt={team.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-text-primary dark:text-text-primary-dark truncate">
                                {team.name}
                              </p>
                              <p className="text-xs text-base dark:text-base-dark truncate">
                                {team.sport?.name || "N/A"} • {team.gender || "N/A"}
                              </p>
                            </div>
                          </div>
                        ),
                      },
                      {
                        header: "Manager",
                        width: "25%",
                        render: (team) => (
                          <div className="min-w-0">
                            <p className="text-sm text-text-primary dark:text-text-primary-dark truncate">
                              {team.manager?.fullName || "N/A"}
                            </p>
                            <p className="text-xs text-base dark:text-base-dark truncate">
                              {team.manager?.email || "N/A"}
                            </p>
                          </div>
                        ),
                      },
                      {
                        header: "Players",
                        width: "10%",
                        render: (team) => (
                          <p className="text-sm text-text-primary dark:text-text-primary-dark">
                            {team.players?.length || 0}
                          </p>
                        ),
                      },
                      {
                        header: "Actions",
                        width: "30%",
                        render: (team) => (
                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveTeam(team._id);
                              }}
                              className="!bg-green-600 hover:!bg-green-700 !text-white px-3 py-2 flex items-center gap-2 text-sm w-auto"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectTeam(team._id);
                              }}
                              className="!bg-red-600 hover:!bg-red-700 !text-white px-3 py-2 flex items-center gap-2 text-sm w-auto"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={pendingTeams}
                    onRowClick={(team) => navigate(`/teams/${team._id}`)}
                    itemsPerPage={pendingTeams.length}
                  />
                </div>
              )}

              {/* Pending Players */}
              {pendingPlayers.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-text-primary dark:text-text-primary-dark">
                    Players ({pendingPlayers.length})
                  </h3>
                  <DataTable
                    columns={[
                      {
                        header: "Player",
                        width: "35%",
                        render: (player) => (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 shrink-0">
                              {player.avatar ? (
                                <img
                                  src={player.avatar}
                                  alt={player.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                  <User className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-text-primary dark:text-text-primary-dark truncate">
                                {player.fullName}
                              </p>
                              <p className="text-xs text-base dark:text-base-dark truncate">
                                {player.email}
                              </p>
                            </div>
                          </div>
                        ),
                      },
                      {
                        header: "Contact",
                        width: "25%",
                        render: (player) => (
                          <div className="min-w-0">
                            <p className="text-sm text-text-primary dark:text-text-primary-dark truncate">
                              {player.phone || "N/A"}
                            </p>
                            <p className="text-xs text-base dark:text-base-dark truncate">
                              {player.city || "N/A"}
                            </p>
                          </div>
                        ),
                      },
                      {
                        header: "Actions",
                        width: "40%",
                        render: (player) => (
                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprovePlayer(player._id);
                              }}
                              className="!bg-green-600 hover:!bg-green-700 !text-white px-3 py-2 flex items-center gap-2 text-sm w-auto"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectPlayer(player._id);
                              }}
                              className="!bg-red-600 hover:!bg-red-700 !text-white px-3 py-2 flex items-center gap-2 text-sm w-auto"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={pendingPlayers}
                    onRowClick={(player) => navigate(`/players/${player._id}`)}
                    itemsPerPage={pendingPlayers.length}
                  />
                </div>
              )}
            </div>
          )}

          {/* Approved Participants */}
          <div>
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
                <DataTable
                  columns={[
                    {
                      header: "Team",
                      width: "40%",
                      render: (team) => (
                        <div className="flex items-center gap-3">
                          <img
                            src={team.logoUrl || defaultTeamAvatar}
                            alt={team.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-text-primary dark:text-text-primary-dark truncate">
                              {team.name}
                            </p>
                            <p className="text-xs text-base dark:text-base-dark truncate">
                              {team.sport?.name || "N/A"} • {team.gender || "N/A"}
                            </p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      header: "Manager",
                      width: "25%",
                      render: (team) => (
                        <div className="min-w-0">
                          <p className="text-sm text-text-primary dark:text-text-primary-dark truncate">
                            {team.manager?.fullName || "N/A"}
                          </p>
                          <p className="text-xs text-base dark:text-base-dark truncate">
                            {team.manager?.email || "N/A"}
                          </p>
                        </div>
                      ),
                    },
                    {
                      header: "Players",
                      width: "10%",
                      render: (team) => (
                        <p className="text-sm text-text-primary dark:text-text-primary-dark">
                          {team.players?.length || 0}
                        </p>
                      ),
                    },
                    {
                      header: "Status",
                      width: "30%",
                      render: (team) => (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          Approved
                        </div>
                      ),
                    },
                  ]}
                  data={approvedTeams}
                  onRowClick={(team) => navigate(`/teams/${team._id}`)}
                  itemsPerPage={approvedTeams.length}
                />
              </div>
            )}

            {/* Approved Players */}
            {approvedPlayers.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 text-text-primary dark:text-text-primary-dark">
                  Players ({approvedPlayers.length})
                </h3>
                <DataTable
                  columns={[
                    {
                      header: "Player",
                      width: "40%",
                      render: (player) => (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 shrink-0">
                            {player.avatar ? (
                              <img
                                src={player.avatar}
                                alt={player.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-text-primary dark:text-text-primary-dark text-sm truncate">
                              {player.fullName}
                            </p>
                            <p className="text-xs text-base dark:text-base-dark truncate">
                              {player.email}
                            </p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      header: "Contact",
                      width: "35%",
                      render: (player) => (
                        <div className="min-w-0">
                          <p className="text-sm text-text-primary dark:text-text-primary-dark truncate">
                            {player.phone || "N/A"}
                          </p>
                          <p className="text-xs text-base dark:text-base-dark truncate">
                            {player.city || "N/A"}
                          </p>
                        </div>
                      ),
                    },
                    {
                      header: "Status",
                      width: "25%",
                      render: (player) => (
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </div>
                      ),
                    },
                  ]}
                  data={approvedPlayers}
                  onRowClick={(player) => navigate(`/players/${player._id}`)}
                  itemsPerPage={approvedPlayers.length}
                />
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default OrganizerTournamentDashboard;

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trophy, CheckCircle, Clock } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import GridContainer from "../../components/ui/GridContainer";
import TournamentCard from "../../components/ui/TournamentCard";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";
import { fetchManagerTeams } from "../../store/slices/teamSlice";

const ManagerTournaments = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tournaments, loading: tournamentsLoading } = useSelector((state) => state.tournament);
  const { managerTeams, loading: teamsLoading } = useSelector((state) => state.team);

  useEffect(() => {
    dispatch(fetchAllTournaments({}));
    if (user?._id) {
      dispatch(fetchManagerTeams(user._id));
    }
  }, [dispatch, user]);

  const managerTeamIds = new Set((managerTeams || []).map((t) => t._id));

  const getManagerTeamsInTournament = (tournament) => {
    const registered = (tournament.registeredTeams || []).filter((id) => managerTeamIds.has(id));
    const approved = (tournament.approvedTeams || []).filter((id) => managerTeamIds.has(id));
    return {
      registeredTeamIds: registered,
      approvedTeamIds: approved,
    };
  };

  const myTournaments = (tournaments || []).filter((t) => {
    const { registeredTeamIds, approvedTeamIds } = getManagerTeamsInTournament(t);
    return registeredTeamIds.length > 0 || approvedTeamIds.length > 0;
  });

  const getTeamNameById = (id) => (managerTeams || []).find((t) => t._id === id)?.name || "Team";

  const loading = tournamentsLoading || teamsLoading;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          My Tournaments
        </h1>
        <p className="text-base dark:text-base-dark">
          View tournaments where your teams are registered or approved
          {myTournaments.length > 0 && ` (${myTournaments.length})`}
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" text="Loading tournaments..." />
        </div>
      )}

      {!loading && myTournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-base dark:text-base-dark mb-4" />
          <p className="text-base dark:text-base-dark text-lg mb-2">
            No registered tournaments found.
          </p>
          <p className="text-base dark:text-base-dark/80 text-sm">
            Register your teams to tournaments to see them here.
          </p>
        </div>
      )}

      {!loading && myTournaments.length > 0 && (
        <GridContainer cols={3}>
          {myTournaments.map((tournament) => {
            const { registeredTeamIds, approvedTeamIds } = getManagerTeamsInTournament(tournament);
            const chips = [
              ...approvedTeamIds.map((id) => ({ id, status: "Approved" })),
              ...registeredTeamIds
                .filter((id) => !approvedTeamIds.includes(id))
                .map((id) => ({ id, status: "Pending" })),
            ];

            return (
              <div key={tournament._id} className="relative">
                {/* Status chips for teams */}
                <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <div
                      key={`${tournament._id}-${chip.id}`}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs shadow-sm ${
                        chip.status === "Approved"
                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                          : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      {chip.status === "Approved" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{getTeamNameById(chip.id)} • {chip.status}</span>
                    </div>
                  ))}
                </div>

                <TournamentCard tournament={tournament} />
              </div>
            );
          })}
        </GridContainer>
      )}
    </div>
  );
};

export default ManagerTournaments;

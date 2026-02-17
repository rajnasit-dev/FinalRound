import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trophy, CheckCircle } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import GridContainer from "../../components/ui/GridContainer";
import TournamentCard from "../../components/ui/TournamentCard";
import BackButton from "../../components/ui/BackButton";
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

  // Create a Set of manager team IDs as strings for comparison
  const managerTeamIds = new Set((managerTeams || []).map((t) => t._id?.toString() || t._id));

  const getManagerTeamsInTournament = (tournament) => {
    const getIdString = (item) => {
      if (!item) return null;
      if (typeof item === 'string') return item;
      if (item._id) return item._id.toString();
      return item.toString();
    };

    const registered = (tournament.registeredTeams || [])
      .map(getIdString)
      .filter((id) => id && managerTeamIds.has(id));
    return registered;
  };

  const myTournaments = (tournaments || []).filter((t) => {
    const registeredTeamIds = getManagerTeamsInTournament(t);
    return registeredTeamIds.length > 0;
  });

  const loading = tournamentsLoading || teamsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          My Tournaments
        </h1>
        <p className="text-base dark:text-base-dark">
          View tournaments where your teams are registered
          {myTournaments.length > 0 && ` (${myTournaments.length})`}
        </p>
      </div>

      {myTournaments.length === 0 && (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            No registered tournaments
          </h3>
          <p className="text-base dark:text-base-dark">
            Register your teams to tournaments to see them here.
          </p>
        </div>
      )}

      {myTournaments.length > 0 && (
        <GridContainer cols={2}>
          {myTournaments.map((tournament) => {
            const registeredBadge = (
              <div className="flex items-center justify-center gap-2 py-2 px-3 bg-green-500 dark:bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md">
                <CheckCircle className="w-4 h-4" />
                <span>Registered</span>
              </div>
            );

            return (
              <TournamentCard
                key={tournament._id}
                tournament={tournament}
                isManager={true}
                registrationStatusBadge={registeredBadge}
              />
            );
          })}
        </GridContainer>
      )}
    </div>
  );
};

export default ManagerTournaments;

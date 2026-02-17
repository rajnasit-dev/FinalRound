import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Users, Trophy, ArrowRight, Briefcase, Stethoscope } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";

const OrganizerTeams = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tournaments, loading } = useSelector((state) => state.tournament);

  useEffect(() => {
    dispatch(fetchAllTournaments({}));
  }, [dispatch]);

  // Get all teams from user's tournaments
  const myTournaments = tournaments?.filter((t) => t.organizer?._id === user?._id) || [];
  const allTeams = myTournaments.reduce((teams, tournament) => {
    const tournamentTeams = (tournament.registeredTeams || []).map((team) => ({
      ...team,
      tournamentName: tournament.name,
      tournamentId: tournament._id,
    }));
    return [...teams, ...tournamentTeams];
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          Registered Teams
        </h1>
        <p className="text-base dark:text-base-dark">
          All teams registered in your tournaments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card-background dark:bg-card-background-dark border border-base-dark dark:border-base rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-base dark:text-base-dark uppercase tracking-wide">
              Total Teams
            </p>
          </div>
          <p className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            {allTeams.length}
          </p>
        </div>

        <div className="bg-card-background dark:bg-card-background-dark border border-base-dark dark:border-base rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-base dark:text-base-dark uppercase tracking-wide">
              Tournaments
            </p>
          </div>
          <p className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            {myTournaments.length}
          </p>
        </div>

        <div className="bg-card-background dark:bg-card-background-dark border border-base-dark dark:border-base rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-base dark:text-base-dark uppercase tracking-wide">
              Avg. Teams/Tournament
            </p>
          </div>
          <p className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            {myTournaments.length > 0 ? Math.round(allTeams.length / myTournaments.length) : 0}
          </p>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base overflow-hidden">
        {allTeams.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-base dark:text-base-dark" />
            <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
              No teams yet
            </h3>
            <p className="text-base dark:text-base-dark mb-6">
              Teams registered in your tournaments will appear here
            </p>
            <Link
              to="/organizer/tournaments"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-semibold"
            >
              <Trophy className="w-5 h-5" />
              View Tournaments
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/10 dark:bg-secondary-dark/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                    Team Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                    Tournament
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                    Manager
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                    Players
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                    Coach
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                    Medical Staff
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-dark dark:divide-base">
                {allTeams.map((team) => (
                  <tr
                    key={`${team._id}-${team.tournamentId}`}
                    className="hover:bg-primary/50 dark:hover:bg-primary-dark/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                          {team.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-secondary" />
                        <span className="text-sm text-text-primary dark:text-text-primary-dark">
                          {team.tournamentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary dark:text-text-primary-dark">
                      {team.manager?.fullName || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary dark:text-text-primary-dark">
                      {team.players?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary dark:text-text-primary-dark">
                      {team.coach?.name ? (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-green-600 shrink-0" />
                          <span>{team.coach.name}</span>
                        </div>
                      ) : (
                        <span className="text-base dark:text-base-dark">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary dark:text-text-primary-dark">
                      {team.medicalTeam?.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-red-500 shrink-0" />
                          <span>{team.medicalTeam.length} staff</span>
                        </div>
                      ) : (
                        <span className="text-base dark:text-base-dark">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/teams/${team._id}`}
                        className="text-secondary hover:underline text-sm font-semibold inline-flex items-center gap-1"
                      >
                        View Details
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerTeams;

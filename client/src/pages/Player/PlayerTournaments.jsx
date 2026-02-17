import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";
import { fetchUserBookings } from "../../store/slices/bookingSlice";
import { fetchPlayerTeams } from "../../store/slices/teamSlice";
import Spinner from "../../components/ui/Spinner";
import TournamentCard from "../../components/ui/TournamentCard";
import GridContainer from "../../components/ui/GridContainer";
import BackButton from "../../components/ui/BackButton";
import { Trophy, CheckCircle, Clock } from "lucide-react";

const PlayerTournaments = () => {
  const dispatch = useDispatch();
  const { tournaments, loading } = useSelector((state) => state.tournament);
  const { bookings, loading: bookingsLoading } = useSelector((state) => state.booking);
  const { playerTeams, loading: teamsLoading } = useSelector((state) => state.team);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAllTournaments({}));
    dispatch(fetchUserBookings());
    if (user?._id) {
      dispatch(fetchPlayerTeams(user._id));
    }
  }, [dispatch, user?._id]);

  // Get registered tournament IDs from bookings (not cancelled)
  const registeredTournamentIds = new Set(
    bookings
      ?.filter((b) => b.status !== "Cancelled")
      .map((b) => b.tournament?._id)
      .filter(Boolean) || []
  );

  // Get player's team IDs
  const playerTeamIds = new Set(
    playerTeams?.map((t) => String(t._id)).filter(Boolean) || []
  );

  // Show tournaments where:
  // 1. Player has a direct booking, OR
  // 2. Player's team is in registeredTeams or approvedTeams
  const myTournaments = tournaments.filter((t) => {
    if (registeredTournamentIds.has(t._id)) return true;

    const teamRegistered = t.registeredTeams?.some((team) =>
      playerTeamIds.has(String(team._id || team))
    );
    const teamApproved = t.approvedTeams?.some((team) =>
      playerTeamIds.has(String(team._id || team))
    );

    return teamRegistered || teamApproved;
  });

  // Get booking for a tournament
  const getBooking = (tournamentId) => {
    return bookings?.find((b) => b.tournament?._id === tournamentId && b.status !== "Cancelled");
  };

  const getRegistrationStatusBadge = (booking) => {
    if (!booking) return null;

    if (booking.status === "Confirmed") {
      return (
        <div className="flex items-center justify-center gap-2 py-2 px-3 bg-green-500 dark:bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md">
          <CheckCircle className="w-4 h-4" />
          <span>Registration Confirmed</span>
        </div>
      );
    } else if (booking.status === "Pending") {
      return (
        <div className="flex items-center justify-center gap-2 py-2 px-3 bg-yellow-500 dark:bg-yellow-600 text-white text-sm font-semibold rounded-lg shadow-md">
          <Clock className="w-4 h-4" />
          <span>Registration Pending</span>
        </div>
      );
    }
    return null;
  };

  if (loading || bookingsLoading || teamsLoading) {
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
          View and manage your registered tournaments
          {myTournaments.length > 0 && ` (${myTournaments.length})`}
        </p>
      </div>

      {/* Empty State */}
      {myTournaments.length === 0 && (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            No registered tournaments
          </h3>
          <p className="text-base dark:text-base-dark">
            Browse available tournaments and register to participate.
          </p>
        </div>
      )}

      {/* Tournaments Grid */}
      {myTournaments.length > 0 && (
        <GridContainer cols={2}>
          {myTournaments.map((tournament) => {
            const booking = getBooking(tournament._id);
            return (
              <TournamentCard
                key={tournament._id}
                tournament={tournament}
                registrationStatusBadge={null}
              />
            );
          })}
        </GridContainer>
      )}
    </div>
  );
};

export default PlayerTournaments;

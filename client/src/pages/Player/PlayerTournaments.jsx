import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";
import { fetchUserBookings } from "../../store/slices/bookingSlice";
import Spinner from "../../components/ui/Spinner";
import TournamentCard from "../../components/ui/TournamentCard";
import GridContainer from "../../components/ui/GridContainer";
import BackButton from "../../components/ui/BackButton";
import { Trophy, CheckCircle, Clock } from "lucide-react";

const PlayerTournaments = () => {
  const dispatch = useDispatch();
  const { tournaments, loading } = useSelector((state) => state.tournament);
  const { bookings, loading: bookingsLoading } = useSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchAllTournaments({}));
    dispatch(fetchUserBookings());
  }, [dispatch]);

  // Get registered tournament IDs from bookings (not cancelled)
  const registeredTournamentIds = new Set(
    bookings
      ?.filter((b) => b.status !== "Cancelled")
      .map((b) => b.tournament?._id)
      .filter(Boolean) || []
  );

  // Only show registered tournaments
  const myTournaments = tournaments.filter((t) =>
    registeredTournamentIds.has(t._id)
  );

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
          <span>Registration Approved</span>
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BackButton className="mb-4" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          My Tournaments
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your registered tournaments
          {myTournaments.length > 0 && ` (${myTournaments.length})`}
        </p>
      </div>

      {/* Loading State */}
      {(loading || bookingsLoading) && (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !bookingsLoading && myTournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
            No registered tournaments found.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Browse available tournaments and register to participate.
          </p>
        </div>
      )}

      {/* Tournaments Grid */}
      {!loading && !bookingsLoading && myTournaments.length > 0 && (
        <GridContainer cols={2}>
          {myTournaments.map((tournament) => {
            const booking = getBooking(tournament._id);
            return (
              <TournamentCard
                key={tournament._id}
                tournament={tournament}
                registrationStatusBadge={getRegistrationStatusBadge(booking)}
              />
            );
          })}
        </GridContainer>
      )}
    </div>
  );
};

export default PlayerTournaments;

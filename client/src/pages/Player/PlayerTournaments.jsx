import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";
import { fetchUserBookings, cancelBooking } from "../../store/slices/bookingSlice";
import Spinner from "../../components/ui/Spinner";
import TournamentCard from "../../components/ui/TournamentCard";
import GridContainer from "../../components/ui/GridContainer";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";
import { Trophy, CheckCircle, Clock, XCircle, X, AlertTriangle } from "lucide-react";

const PlayerTournaments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tournaments, loading } = useSelector((state) => state.tournament);
  const { bookings, loading: bookingsLoading } = useSelector((state) => state.booking);
  
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null });
  const [cancelling, setCancelling] = useState(false);

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

  const handleCancelClick = (e, booking) => {
    e.preventDefault();
    e.stopPropagation();
    setCancelModal({ open: true, booking });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal.booking) return;
    
    setCancelling(true);
    try {
      await dispatch(cancelBooking(cancelModal.booking._id)).unwrap();
      setCancelModal({ open: false, booking: null });
    } catch (error) {
      toast.error(error || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const canCancelBooking = (booking) => {
    // Can cancel if booking is pending or confirmed but tournament hasn't started
    if (!booking || booking.status === "Cancelled") return false;
    
    const tournament = tournaments.find(t => t._id === booking.tournament?._id);
    if (!tournament) return true;
    
    const tournamentStartDate = new Date(tournament.startDate);
    const now = new Date();
    
    // Can only cancel before tournament starts
    return now < tournamentStartDate;
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
              <div key={tournament._id} className="relative space-y-3">
                {/* Tournament Card with Registration Status */}
                <TournamentCard 
                  tournament={tournament} 
                  registrationStatusBadge={getRegistrationStatusBadge(booking)}
                />
                
                {/* Cancel Button */}
                {booking && canCancelBooking(booking) && (
                  <button
                    onClick={(e) => handleCancelClick(e, booking)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
                  >
                    <X className="w-4 h-4" />
                    Cancel Registration
                  </button>
                )}
              </div>
            );
          })}
        </GridContainer>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Cancel Registration
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to cancel your registration for this tournament? 
              {cancelModal.booking?.paymentStatus === "Success" && (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-400 text-sm">
                  Note: Refund policy will apply as per tournament rules.
                </span>
              )}
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setCancelModal({ open: false, booking: null })}
                disabled={cancelling}
                variant="primary"
                className="w-auto flex-1"
              >
                Keep Registration
              </Button>
              <Button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                loading={cancelling}
                variant="primary"
                className="w-auto flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerTournaments;

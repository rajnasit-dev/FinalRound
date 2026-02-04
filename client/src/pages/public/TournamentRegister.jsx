import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchTournamentById } from "../../store/slices/tournamentSlice";
import { fetchPlayerTeams, fetchManagerTeams } from "../../store/slices/teamSlice";
import { createBooking, updateBookingPaymentStatus, fetchUserBookings } from "../../store/slices/bookingSlice";
import { createPayment, updatePaymentStatus } from "../../store/slices/paymentSlice";
import CardStat from "../../components/ui/CardStat";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";
import { CreditCard, CheckCircle, XCircle, Loader2, IndianRupee, Users, Trophy, Calendar, AlertCircle } from "lucide-react";
import Container from "../../components/container/Container";
import Spinner from "../../components/ui/Spinner";
import defaultAvatar from "../../assets/defaultAvatar.png";

const TournamentRegister = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentBooking, bookings, loading: bookingLoading, error: bookingError } = useSelector(
    (state) => state.booking
  );
  const { currentPayment, loading: paymentLoading, error: paymentError } = useSelector(
    (state) => state.payment
  );
  const { user } = useSelector((state) => state.auth);
  const { selectedTournament: tournament, loading: tournamentLoading } = useSelector(
    (state) => state.tournament
  );
  const { playerTeams, managerTeams, loading: teamsLoading } = useSelector((state) => state.team);

  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate("/login", { state: { from: `/tournaments/${id}/register` } });
      return;
    }

    // Fetch tournament, user teams/manager teams, and bookings
    dispatch(fetchTournamentById(id));
    dispatch(fetchUserBookings());
    if (user._id) {
      if (user.role === "TeamManager") {
        dispatch(fetchManagerTeams(user._id));
      } else {
        dispatch(fetchPlayerTeams(user._id));
      }
    }
  }, [user, navigate, id, dispatch]);

  // Check if user is already registered for this tournament
  const existingBooking = bookings?.find(
    (b) => b.tournament?._id === id && b.status !== "Cancelled"
  );
  const isAlreadyRegistered = !!existingBooking;

  // Check if this is a team-based tournament (player can't register directly)
  const isTeamBasedTournament = tournament?.registrationType === "Team";
  
  // Check if this is a single-player tournament and user is a manager
  const isSinglePlayerTournament = tournament?.registrationType === "Player";
  const isManager = user?.role === "TeamManager";
  const isManagerAndSinglePlayer = isManager && isSinglePlayerTournament;

  const availableTeams = user?.role === "TeamManager" ? (managerTeams || []) : (playerTeams || []);

  const getRequiredPlayers = () => {
    if (tournament?.playersPerTeam && Number.isFinite(tournament.playersPerTeam)) {
      return tournament.playersPerTeam;
    }
    // fall back to sport.minPlayers if available
    const sportMin = tournament?.sport?.minPlayers;
    return Number.isFinite(sportMin) ? sportMin : undefined;
  };

  const findSelectedTeam = () => availableTeams.find((t) => t._id === selectedTeam);

  const validateSelection = () => {
    if (tournament?.registrationType === "Team") {
      const team = findSelectedTeam();
      if (!team) return "Please select a team to register";
      const tournamentSportId = tournament?.sport?._id || tournament?.sport;
      const teamSportId = team?.sport?._id || team?.sport;
      if (!tournamentSportId || !teamSportId || String(tournamentSportId) !== String(teamSportId)) {
        return "Selected team sport does not match tournament sport";
      }
      const needed = getRequiredPlayers();
      if (needed && (team.players?.length || 0) < needed) {
        return `Team does not have the required ${needed} players`;
      }
    }
    return null;
  };

  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    setValidationError(validateSelection());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam, tournament, managerTeams, playerTeams]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const selectionError = validateSelection();
    if (selectionError) {
      toast.error(selectionError);
      setValidationError(selectionError);
      return;
    }

    setProcessingPayment(true);

    try {
      // Step 1: Create booking first
      const bookingData = {
        tournamentId: tournament._id,
        registrationType: tournament.registrationType,
      };

      // Add team or player based on registration type
      if (tournament.registrationType === "Team") {
        bookingData.teamId = selectedTeam;
      } else {
        bookingData.playerId = user._id;
      }

      const bookingResult = await dispatch(createBooking(bookingData));

      if (!createBooking.fulfilled.match(bookingResult)) {
        toast.error(bookingResult.payload || "Failed to create booking. Please try again.");
        setProcessingPayment(false);
        return;
      }

      const booking = bookingResult.payload;

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        setProcessingPayment(false);
        return;
      }

      // Step 3: Create payment record
      const paymentData = {
        tournament: tournament._id,
        payerType: tournament.registrationType,
        amount: tournament.entryFee,
        currency: "INR",
        provider: "Razorpay",
      };

      // Add team or player based on registration type
      if (tournament.registrationType === "Team") {
        paymentData.team = selectedTeam;
      } else {
        paymentData.player = user._id;
      }

      const paymentResult = await dispatch(createPayment(paymentData));

      if (createPayment.fulfilled.match(paymentResult)) {
        const payment = paymentResult.payload;

        // Step 4: Initialize Razorpay payment
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: tournament.entryFee * 100, // Convert to paise
          currency: "INR",
          name: "SportsHub",
          description: `Registration for ${tournament.name}`,
          image: "/logo.png",
          handler: async function (response) {
            // Payment successful - update payment and booking status
            console.log("Payment successful:", response);
            
            // Update payment status to Success
            await dispatch(updatePaymentStatus({
              paymentId: payment._id,
              status: "Success",
              providerPaymentId: response.razorpay_payment_id
            }));

            // Update booking payment status
            await dispatch(updateBookingPaymentStatus({
              bookingId: booking._id,
              paymentId: payment._id,
              paymentStatus: "Success"
            }));
            
            navigate(`/payments/${payment._id}/receipt`);
          },
          prefill: {
            name: user?.fullName || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: {
            color: "#d7ff42",
          },
          modal: {
            ondismiss: function () {
              console.log("Payment cancelled by user");
              setProcessingPayment(false);
            },
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        toast.error(paymentResult.payload || "Failed to create payment order. Please try again.");
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("An error occurred. Please try again.");
      setProcessingPayment(false);
    }
  };

  if (!user) {
    return null;
  }

  if (tournamentLoading || teamsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Tournament Not Found</h2>
          <Button
            onClick={() => navigate("/tournaments")}
            className="mt-4 max-w-xs mx-auto"
          >
            Back to Tournaments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <BackButton className="mb-6" />
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Tournament Registration</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Tournament Details */}
          <Container>
            <h2 className="text-2xl font-bold mb-5 text-gray-900 dark:text-white">Tournament Details</h2>
            <div className="grid gap-4">
              <CardStat
                Icon={Trophy}
                iconColor="text-blue-600"
                label="Tournament"
                value={tournament.name}
              />
              <CardStat
                Icon={Users}
                iconColor="text-purple-600"
                label="Sport"
                value={tournament.sport?.name || tournament.sport}
              />
              <CardStat
                Icon={IndianRupee}
                iconColor="text-green-600"
                label="Entry Fee"
                value={`₹${tournament.entryFee?.toLocaleString()}`}
              />
              <CardStat
                Icon={Trophy}
                iconColor="text-yellow-600"
                label="Prize Pool"
                value={`₹${tournament.prizePool?.toLocaleString()}`}
              />
              <CardStat
                Icon={Calendar}
                iconColor="text-red-600"
                label="Registration Type"
                value={tournament.registrationType}
              />
            </div>
          </Container>

          {/* Team Selection & Payment */}
          <Container>
            <h2 className="text-2xl font-bold mb-5 text-gray-900 dark:text-white">
              {tournament.registrationType === "Team" ? "Select Your Team" : "Player Registration"}
            </h2>

            {/* Already Registered Warning */}
            {isAlreadyRegistered && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-300">Already Registered</p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      You have already registered for this tournament.
                      {existingBooking?.paymentStatus === "Pending" && " Payment is pending."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Team-based Tournament Warning for Player Registration */}
            {isTeamBasedTournament && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-semibold text-yellow-800 dark:text-yellow-300">Team Registration Required</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      This tournament requires team registration. Players cannot register directly.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {tournament.registrationType === "Player" ? (
              <>
                <div className="bg-primary dark:bg-primary-dark border-2 border-base dark:border-base rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={user?.avatar || defaultAvatar}
                      alt={user?.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-lg text-base dark:text-base-dark">{user?.fullName}</p>
                      <p className="text-sm text-base dark:text-base-dark">{user?.email}</p>
                    </div>
                  </div>
                  <div className="bg-primary dark:bg-primary-dark rounded-lg p-4 border-2 border-base dark:border-base">
                    <p className="text-sm text-base dark:text-base-dark">
                      <span className="font-semibold">Registration Type:</span> Player
                    </p>
                    <p className="text-sm text-base dark:text-base-dark mt-2">
                      <span className="font-semibold">Sport:</span> {tournament.sport?.name || tournament.sport}
                    </p>
                  </div>
                </div>

                {(bookingError || paymentError) && (
                  <div className="mb-4">
                    <ErrorMessage message={bookingError || paymentError} type="error" />
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={processingPayment || paymentLoading || bookingLoading || isAlreadyRegistered || isManagerAndSinglePlayer}
                  loading={processingPayment || paymentLoading}
                  variant="primary"
                >
                  {isAlreadyRegistered ? (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Already Registered
                    </>
                  ) : isManagerAndSinglePlayer ? (
                    <>
                      <AlertCircle className="w-6 h-6" />
                      Managers cannot register for single-player tournaments
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      Pay <span className="font-num">₹{tournament.entryFee?.toLocaleString()}</span>
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-base dark:text-base-dark mt-4">\n                  Your payment is secure and encrypted. By proceeding, you agree to our terms and conditions.
                </p>
              </>
            ) : !availableTeams || availableTeams.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-base dark:text-base-dark mb-4">You don't have any teams yet.</p>
                <Button
                  onClick={() => navigate("/player/teams/create")}
                  className="max-w-xs mx-auto"
                >
                  Create Team
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {availableTeams.map((team) => (
                    <label
                      key={team._id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTeam === team._id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                      } ${isAlreadyRegistered ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        name="team"
                        value={team._id}
                        checked={selectedTeam === team._id}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        disabled={isAlreadyRegistered}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div>
                        <p className="font-semibold text-text-primary dark:text-text-primary-dark">{team.name}</p>
                        <p className="text-sm text-base dark:text-base-dark">{team.sport?.name || team.sport}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {(validationError || bookingError || paymentError) && (
                  <div className="mb-4">
                    <ErrorMessage message={validationError || bookingError || paymentError} type="error" />
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={!selectedTeam || !!validationError || processingPayment || paymentLoading || bookingLoading || isAlreadyRegistered}
                  loading={processingPayment || paymentLoading}
                  variant="primary"
                >
                  {isAlreadyRegistered ? (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Already Registered
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      Pay <span className="font-num">₹{tournament.entryFee?.toLocaleString()}</span>
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-4">\n                  Your payment is secure and encrypted. By proceeding, you agree to our terms and conditions.
                </p>
              </>
            )}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default TournamentRegister;

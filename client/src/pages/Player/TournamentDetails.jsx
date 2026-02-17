import useDateFormat from "../../hooks/useDateFormat";
import { formatINR } from "../../utils/formatINR";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchTournamentById,
  registerForTournament,
  clearRegistrationSuccess,
} from "../../store/slices/tournamentSlice";
import { fetchPlayerTeams, fetchManagerTeams } from "../../store/slices/teamSlice";
import { Trophy, Calendar, MapPin, Users, DollarSign, Clock, FileText, ArrowLeft, CheckCircle } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";
import BackButton from "../../components/ui/BackButton";

const TournamentDetails = () => {
  const { id } = useParams();
  const { formatDate } = useDateFormat();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedTournament, loading, error, registrationSuccess } = useSelector(
    (state) => state.tournament
  );
  const { teams } = useSelector((state) => state.team);
  const { user } = useSelector((state) => state.auth);

  const [selectedTeam, setSelectedTeam] = useState("");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const isTeamBasedRegistrationForPlayer =
    selectedTournament?.registrationType === "Team" && user?.__t === "Player";

  useEffect(() => {
    dispatch(fetchTournamentById(id));

    // Fetch user's teams based on role
    if (user?.__t === "Player") {
      dispatch(fetchPlayerTeams(user._id));
    } else if (user?.__t === "TeamManager") {
      dispatch(fetchManagerTeams(user._id));
    }
  }, [dispatch, id, user]);

  useEffect(() => {
    if (registrationSuccess) {
      setShowRegistrationModal(false);
      // Navigate to payment page
      navigate(`/player/tournaments/${id}/payment`, {
        state: { tournament: selectedTournament, teamId: selectedTeam },
      });
      dispatch(clearRegistrationSuccess());
    }
  }, [registrationSuccess, navigate, id, selectedTournament, selectedTeam, dispatch]);

  const handleRegister = () => {
    if (isTeamBasedRegistrationForPlayer) {
      setShowRegistrationModal(false);
      return;
    }

    if (!selectedTeam) {
      toast.error("Please select a team");
      return;
    }

    dispatch(registerForTournament({ tournamentId: id, teamId: selectedTeam }));
  };

  const isRegistrationOpen = () => {
    if (!selectedTournament) return false;
    const now = new Date();
    const regStart = new Date(selectedTournament.registrationStart);
    const regEnd = new Date(selectedTournament.registrationEnd);
    return now >= regStart && now <= regEnd;
  };

  const getRegistrationStatusMessage = () => {
    if (!selectedTournament) return null;
    const now = new Date();
    const regStart = new Date(selectedTournament.registrationStart);
    const regEnd = new Date(selectedTournament.registrationEnd);
    
    if (now < regStart) {
      return { message: 'Registration Not Started', type: 'not-started' };
    } else if (now > regEnd) {
      return { message: 'Registration Closed', type: 'closed' };
    } else {
      return { message: 'Registration Open', type: 'open' };
    }
  };

  const isAlreadyRegistered = () => {
    if (!selectedTournament || !selectedTeam) return false;
    return selectedTournament.registeredTeams?.some((team) => team._id === selectedTeam);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedTournament) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Tournament not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <BackButton className="mb-6" />

      {/* Error Message */}
      {error && <ErrorMessage message={error} type="error" />}

      {/* Tournament Banner */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        {selectedTournament.bannerUrl ? (
          <img
            src={selectedTournament.bannerUrl}
            alt={selectedTournament.name}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Trophy className="w-24 h-24 text-white" />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {selectedTournament.name}
              </h1>
              <p className="text-gray-600 text-lg">{selectedTournament.description}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                selectedTournament.status === "Upcoming"
                  ? "bg-blue-100 text-blue-800"
                  : selectedTournament.status === "Live"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {selectedTournament.status}
            </span>
          </div>

          {/* Tournament Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <Trophy className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Sport</p>
                <p className="font-semibold text-gray-800">
                  {selectedTournament.sport?.name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Tournament Dates</p>
                <p className="font-semibold text-gray-800 font-num">
                  {formatDate(selectedTournament.startDate)} - {formatDate(selectedTournament.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Registration Period</p>
                <p className="font-semibold text-gray-800 font-num">
                  {formatDate(selectedTournament.registrationStart)} - {formatDate(selectedTournament.registrationEnd)}
                </p>
              </div>
            </div>

            {selectedTournament.ground && (
              <>
                {selectedTournament.ground.name && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Venue</p>
                      <p className="font-semibold text-gray-800">
                        {selectedTournament.ground.name}
                      </p>
                      {selectedTournament.ground.city && (
                        <p className="text-sm text-gray-600">
                          {selectedTournament.ground.city}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Teams</p>
                <p className="font-semibold text-gray-800">
                  {selectedTournament.registeredTeams?.length || 0} /{" "}
                  {selectedTournament.teamLimit} registered
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Entry Fee</p>
                <p className="font-semibold text-gray-800 font-num">
                  ₹{formatINR(selectedTournament.entryFee)}
                </p>
              </div>
            </div>

            {selectedTournament.prizePool && (
              <div className="flex items-start gap-3">
                <Trophy className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Prize Pool</p>
                  <p className="font-semibold text-gray-800 font-num">
                    ₹{formatINR(selectedTournament.prizePool)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Format</p>
                <p className="font-semibold text-gray-800">{selectedTournament.format}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Registration Type</p>
                <p className="font-semibold text-gray-800">
                  {selectedTournament.registrationType}
                </p>
              </div>
            </div>
          </div>

          {/* Rules Section */}
          {selectedTournament.rules && selectedTournament.rules.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Rules & Regulations</h2>
              <ul className="list-disc list-inside space-y-2">
                {selectedTournament.rules.map((rule, index) => (
                  <li key={index} className="text-gray-700">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Organizer Info */}
          {selectedTournament.organizer && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Organized By</h2>
              <div className="flex items-center gap-4">
                {selectedTournament.organizer.avatar && (
                  <img
                    src={selectedTournament.organizer.avatar}
                    alt={selectedTournament.organizer.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-800">
                    {selectedTournament.organizer.orgName ||
                      selectedTournament.organizer.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedTournament.organizer.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Registration Button */}
          {isTeamBasedRegistrationForPlayer ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-center">
              Join a team; your team can complete the registration for this tournament.
            </div>
          ) : (
            isRegistrationOpen() &&
            selectedTournament.status === "Upcoming" && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowRegistrationModal(true)}
                  variant="primary"
                  className="w-auto px-8 py-3 text-lg"
                >
                  Register for Tournament
                </Button>
              </div>
            )
          )}

          {!isRegistrationOpen() && selectedTournament.status === "Upcoming" && (
            <div className={`px-4 py-3 rounded-lg text-center border ${
              getRegistrationStatusMessage()?.type === 'not-started' 
                ? 'bg-blue-50 border-blue-200 text-blue-800' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              {getRegistrationStatusMessage()?.message}
              {getRegistrationStatusMessage()?.type === 'not-started' && (
                <p className="text-sm mt-1">
                  Opens on {new Date(selectedTournament.registrationStart).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Register for Tournament</h2>

            {teams.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  You don't have any teams yet. Please create or join a team first.
                </p>
                <Button
                  onClick={() => {
                    setShowRegistrationModal(false);
                    navigate("/player/teams");
                  }}
                  variant="primary"
                  className="w-auto"
                >
                  Go to Teams
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Team
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a team...</option>
                    {teams
                      .filter((team) => team.sport?._id === selectedTournament.sport?._id)
                      .map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                  {selectedTeam &&
                    isAlreadyRegistered() && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        This team is already registered
                      </p>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4">
                  <p className="text-sm">
                    Entry Fee: <span>₹{formatINR(selectedTournament.entryFee)}</span>
                  </p>
                  <p className="text-xs mt-1">You will be redirected to payment after registration</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowRegistrationModal(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRegister}
                    disabled={!selectedTeam || isAlreadyRegistered() || loading}
                    loading={loading}
                    className="flex-1"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetails;

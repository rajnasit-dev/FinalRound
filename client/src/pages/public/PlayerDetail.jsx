import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  MapPin,
  Trophy,
  User,
  Mail,
  Phone,
  Ruler,
  Weight,
  Calendar,
  Target,
  Activity,
  Award,
  Users,
  Shield,
  UserPlus,
  Send,
} from "lucide-react";
import CardStat from "../../components/ui/CardStat";
import Container from "../../components/container/Container";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import { fetchPlayerById } from "../../store/slices/playerSlice";
import { fetchManagerTeams } from "../../store/slices/teamSlice";
import { sendPlayerRequest } from "../../store/slices/requestSlice";
import defaultAvatar from "../../assets/defaultAvatar.png";
import defaultCoverImage from "../../assets/defaultCoverImage.png";
import useDateFormat from "../../hooks/useDateFormat";

const PlayerDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentPlayer: player, loading } = useSelector((state) => state.player);
  const { user } = useSelector((state) => state.auth);
  const { managerTeams } = useSelector((state) => state.team);
  const { loading: requestLoading } = useSelector((state) => state.request);
  const { formatDate } = useDateFormat();
  const [selectedTeam, setSelectedTeam] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      dispatch(fetchPlayerById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (user?.role === "TeamManager" && user?._id) {
      dispatch(fetchManagerTeams(user._id));
    }
  }, [user, dispatch]);

  const handleSendRequest = async () => {
    if (!selectedTeam) {
      alert("Please select a team");
      return;
    }

    await dispatch(
      sendPlayerRequest({
        playerId: id,
        teamId: selectedTeam,
        message: requestMessage,
      })
    );

    setShowRequestModal(false);
    setSelectedTeam("");
    setRequestMessage("");
    alert("Request sent successfully!");
  };

  const isTeamManager = user?.role === "TeamManager";
  const isOwnProfile = user?._id === id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Player not found
          </h2>
          <Link to="/players" className="text-secondary hover:underline">
            Back to Players
          </Link>
        </div>
      </div>
    );
  }

  const memberSince = formatDate(player.createdAt);

  return (
    <div className="min-h-screen pb-16">
      {/* Banner */}
      <div className="relative h-screen sm:h-112.5 overflow-hidden">
        <img
          src={player.coverImageUrl || defaultCoverImage}
          alt={player.fullName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-black/30"></div>

        {/* Player Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-6 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Left Overlay */}
            <div className="flex-1">
              {/* Player Avatar & Info */}
              <div className="flex items-end gap-6 mb-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl bg-white overflow-hidden">
                      <img
                        src={player.avatarUrl || defaultAvatar}
                        alt={player.fullName}
                        className="w-full h-full object-cover"
                      />
                  </div>
                  {player.isAvailable && (
                    <div className="absolute -top-2 -right-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        Available
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {player.sports &&
                  player.sports.map((sportItem, index) => {
                    const sportName = typeof sportItem.sport === 'string' 
                      ? sportItem.sport 
                      : sportItem.sport?.name || sportItem.name;
                    
                    return (
                      <span
                        key={index}
                        className="bg-accent text-text-primary text-xs sm:text-sm px-4 py-1.5 rounded-full font-bold shadow-lg"
                      >
                        {sportName}
                        {sportItem.role && ` - ${sportItem.role}`}
                      </span>
                    );
                  })}
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm px-4 py-1.5 rounded-full font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {player.city}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {player.fullName}
              </h1>

            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 mt-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Tournament */}
            {player.bio && (
              <Container>
                <h2 className="text-2xl font-bold mb-3">About Player</h2>
                <p className="text-base dark:text-base-dark leading-relaxed">
                  {player.bio}
                </p>
              </Container>
            )}
            {/* Player Statistics */}
            <Container>
              <h2 className="text-2xl font-bold mb-5">Player Information</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                <CardStat
                  Icon={User}
                  iconColor="text-blue-600"
                  label="Age"
                  value={`${player.age} years`}
                />
                <CardStat
                  Icon={Ruler}
                  iconColor="text-green-600"
                  label="Height"
                  value={`${player.height} cm`}
                />
                <CardStat
                  Icon={Weight}
                  iconColor="text-amber-600"
                  label="Weight"
                  value={`${player.weight} kg`}
                />
                <CardStat
                  Icon={MapPin}
                  iconColor="text-red-600"
                  label="Location"
                  value={player.city}
                />
              </div>
            </Container>

            {/* Achievements */}
            {player.achievements && player.achievements.length > 0 && (
              <Container>
                <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-600" />
                  Achievements
                </h2>
                <div className="space-y-3">
                  {player.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30"
                    >
                      <Trophy className="w-5 h-5 text-amber-600 shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {achievement.year}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Container>
            )}

            {/* Teams */}
            {player.teams && player.teams.length > 0 && (
              <Container>
                <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Current Teams
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    ({player.teams.length})
                  </span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {player.teams.map((team) => (
                    <Link
                      key={team._id}
                      to={`/teams/${team._id}`}
                      className="group flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-all border border-gray-200 dark:border-gray-700 hover:border-secondary dark:hover:border-secondary hover:shadow-md"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 shrink-0">
                        {team.logoUrl ? (
                          <img
                            src={team.logoUrl}
                            alt={team.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            <Shield className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate group-hover:text-secondary transition-colors">
                          {team.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Trophy className="w-3 h-3" />
                          {team.sport.name}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-secondary">
                        {team.role}
                      </div>
                    </Link>
                  ))}
                </div>
              </Container>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <a
                  href={`mailto:${player.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                >
                  <Mail className="w-5 h-5 text-secondary" />
                  <span className="text-sm truncate">{player.email}</span>
                </a>
                <a
                  href={`tel:${player.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                >
                  <Phone className="w-5 h-5 text-secondary" />
                  <span className="text-sm">{player.phone}</span>
                </a>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <span className="text-sm">{player.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Manager Request Button */}
      {isTeamManager && !isOwnProfile && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 shadow-lg"
          >
            <UserPlus className="w-5 h-5" />
            Invite to Team
          </Button>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Invite Player to Team</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Team
                </label>
                <Select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full"
                >
                  <option value="">-- Select a Team --</option>
                  {managerTeams?.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Add a message for the player..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-secondary focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSendRequest}
                  disabled={requestLoading || !selectedTeam}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Request
                </Button>
                <Button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedTeam("");
                    setRequestMessage("");
                  }}
                  variant="primary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDetail;

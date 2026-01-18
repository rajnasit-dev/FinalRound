import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Trophy,
  Users,
  Mail,
  Phone,
  Shield,
  User,
  ArrowLeft,
  UserPlus,
  Target,
  Calendar,
  Award,
  Crown,
  ChevronRight,
  Send,
} from "lucide-react";
import CardStat from "../../components/ui/CardStat";
import Container from "../../components/container/Container";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import { fetchTeamById } from "../../store/slices/teamSlice";
import { sendTeamRequest } from "../../store/slices/requestSlice";
import defaultAvatar from "../../assets/defaultAvatar.png";
import defaultTeamCoverImage from "../../assets/defaultTeamCoverImage.png";
import defaultTeamAvatar from "../../assets/defaultTeamAvatar.png";
import useDateFormat from "../../hooks/useDateFormat";

const TeamDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedTeam: team, loading } = useSelector((state) => state.team);
  const { user } = useSelector((state) => state.auth);
  const { loading: requestLoading } = useSelector((state) => state.request);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const { formatDate } = useDateFormat();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      dispatch(fetchTeamById(id));
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Team not found
          </h2>
          <Link to="/teams" className="text-secondary hover:underline">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  const teamSince = formatDate(team.createdAt);

  const handleJoinRequest = async () => {
    await dispatch(
      sendTeamRequest({
        teamId: team._id,
        message: joinMessage,
      })
    );
    setShowJoinModal(false);
    setJoinMessage("");
    alert("Join request sent successfully!");
  };

  const isPlayer = user?.role === "Player";
  const isTeamMember = team.players?.some(
    (player) => player._id === user?._id
  );

  return (
    <div className="min-h-screen pb-16">
      {/* Banner */}
      <div className="relative h-screen sm:h-[450px] overflow-hidden">
        <img
          src={team.bannerUrl || defaultTeamCoverImage}
          alt={team.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-black/30"></div>

        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Link
            to="/teams"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Teams</span>
          </Link>
        </div>

        {/* Team Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-6 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Left Overlay */}
            <div className="flex-1">
              {/* Team Logo & Info */}
              <div className="flex items-end gap-6 mb-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-xl border-4 border-white shadow-2xl bg-white overflow-hidden">
                    <img
                      src={team.logoUrl || defaultTeamAvatar}
                      alt={team.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {team.openToJoin && (
                    <div className="absolute -top-2 -right-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        Open to Join
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="bg-accent text-text-primary text-xs sm:text-sm px-4 py-1.5 rounded-full font-bold shadow-lg">
                  {team.sport?.name || 'Sport'}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm px-4 py-1.5 rounded-full font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {team.city || 'N/A'}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm px-4 py-1.5 rounded-full font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Since {teamSince}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {team.name}
              </h1>
            </div>

            {/* Right Overlay - Join Button */}
            {team.openToJoin && isPlayer && !isTeamMember && (
              <Button
                onClick={() => setShowJoinModal(true)}
                variant="primary"
                className="w-auto px-8 py-4 text-lg shadow-2xl"
              >
                Send Join Request
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 mt-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Team */}
            <Container>
              <h2 className="text-2xl font-bold mb-5">About Team</h2>
              <p className="text-base dark:text-base-dark leading-relaxed">
                {team.description}
              </p>
            </Container>

            {/* Team Stats */}
            <Container>
              <h2 className="text-2xl font-bold mb-5">Team Statistics</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                <CardStat
                  Icon={Users}
                  iconColor="text-blue-600"
                  label="Total Players"
                  value={team.players.length}
                />
                <CardStat
                  Icon={Trophy}
                  iconColor="text-amber-600"
                  label="Sport"
                  value={team.sport.name}
                />
                <CardStat
                  Icon={MapPin}
                  iconColor="text-red-600"
                  label="Location"
                  value={team.city}
                />
                <CardStat
                  Icon={Calendar}
                  iconColor="text-green-600"
                  label="Established"
                  value={teamSince}
                />
                <CardStat
                  Icon={Shield}
                  iconColor="text-purple-600"
                  label="Status"
                  value={team.isActive ? "Active" : "Inactive"}
                />
                <CardStat
                  Icon={UserPlus}
                  iconColor="text-cyan-600"
                  label="Recruitment"
                  value={team.openToJoin ? "Open" : "Closed"}
                />
              </div>
            </Container>

            {/* Team Achievements */}
            {team.achievements && team.achievements.length > 0 && (
              <Container>
                <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-600" />
                  Achievements
                </h2>
                <ul className="space-y-3">
                  {team.achievements.map((achievement, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30"
                    >
                      <Trophy className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </Container>
            )}

            {/* Team Members */}
            <Container>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Team Members
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    ({team.players.length})
                  </span>
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {team.players.map((player) => (
                  <Link
                    key={player._id}
                    to={`/players/${player._id}`}
                    className="group flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-all border border-gray-200 dark:border-gray-700 hover:border-secondary dark:hover:border-secondary hover:shadow-md"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                        {player.avatar ? (
                          <img
                            src={player.avatar}
                            alt={player.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {player.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      {player._id === team.captain?._id && (
                        <Crown className="absolute -top-1 -right-1 w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-secondary transition-colors">
                        {player.fullName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Target className="w-3 h-3" />
                        {player.playingRole}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {player.age} yrs
                    </div>
                  </Link>
                ))}
              </div>
            </Container>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Team Captain Card */}
            {team.captain && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-600" />
                  Team Captain
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-amber-500 to-yellow-600 flex-shrink-0">
                      {team.captain.avatar ? (
                        <img
                          src={team.captain.avatar}
                          alt={team.captain.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                          {team.captain.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                    <Crown className="absolute -top-2 -right-2 w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">
                      {team.captain.fullName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {team.captain.playingRole}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/players/${team.captain._id}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
                >
                  View Profile
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Manager Card */}
            <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Team Manager
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                  {team.manager.avatar ? (
                    <img
                      src={team.manager.avatar}
                      alt={team.manager.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                      {team.manager.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate">
                    {team.manager.fullName}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Team Manager
                  </p>
                </div>
              </div>
              <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={`mailto:${team.manager.email}`}
                  className="flex items-center gap-2 text-sm text-secondary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{team.manager.email}</span>
                </a>
                <a
                  href={`tel:${team.manager.phone}`}
                  className="flex items-center gap-2 text-sm text-secondary hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {team.manager.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Request Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Send Join Request
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Tell the team manager why you'd like to join {team.name}
            </p>
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Introduce yourself and mention your experience, playing position, and why you want to join this team..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-4 min-h-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinMessage("");
                }}
                variant="primary"
                className="!w-auto flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinRequest}
                disabled={requestLoading || !joinMessage.trim()}
                loading={requestLoading}
                variant="primary"
                className="!w-auto flex-1"
              >
                <Send className="w-4 h-4" />
                Send Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetail;

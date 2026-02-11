import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Trophy,
  User,
  Mail,
  Phone,
  Ruler,
  Weight,
  Award,
  Users,
  Shield,
  UserPlus,
  X,
  Check,
} from "lucide-react";
import CardStat from "../../components/ui/CardStat";
import Container from "../../components/container/Container";
import Spinner from "../../components/ui/Spinner";
import AchievementCard from "../../components/ui/AchievementCard";
import BackButton from "../../components/ui/BackButton";
import toast from "react-hot-toast";
import { fetchPlayerById } from "../../store/slices/playerSlice";
import { fetchManagerTeams } from "../../store/slices/teamSlice";
import { sendPlayerRequest } from "../../store/slices/requestSlice";
import defaultAvatar from "../../assets/defaultAvatar.png";
import defaultCoverImage from "../../assets/defaultCoverImage.png";
import defaultTeamAvatar from "../../assets/defaultTeamAvatar.png";
import useDateFormat from "../../hooks/useDateFormat";
import useAge from "../../hooks/useAge";

const PlayerDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentPlayer: player, loading } = useSelector((state) => state.player);
  const { user } = useSelector((state) => state.auth);
  const { managerTeams } = useSelector((state) => state.team);
  const { formatDate } = useDateFormat();
  const age = useAge(player?.dateOfBirth);

  // Team invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      dispatch(fetchPlayerById(id));
    }
  }, [id, dispatch]);

  // Fetch manager's teams if user is a TeamManager
  useEffect(() => {
    if (user?.role === "TeamManager" && user?._id) {
      dispatch(fetchManagerTeams(user._id));
    }
  }, [user, dispatch]);

  // Check if user is a team manager and not viewing their own profile
  const isTeamManager = user?.role === "TeamManager";
  const isOwnProfile = user?._id === id;
  const canInvitePlayer = isTeamManager && !isOwnProfile && player;

  // Handle invite button click
  const handleOpenInviteModal = () => {
    setShowInviteModal(true);
    setSelectedTeam("");
    setInviteError("");
  };

  // Handle sending invite
  const handleSendInvite = async () => {
    if (!selectedTeam) {
      setInviteError("Please select a team");
      return;
    }

    setInviteLoading(true);
    setInviteError("");

    try {
      await dispatch(sendPlayerRequest({ playerId: id, teamId: selectedTeam })).unwrap();
      toast.success("Invite sent successfully!");
      setShowInviteModal(false);
    } catch (error) {
      setInviteError(error || "Failed to send invite");
    } finally {
      setInviteLoading(false);
    }
  };

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

        {/* Back Button and Invite Button */}
        <div className="absolute top-6 left-6 flex items-center gap-3">
          <BackButton className="bg-black/50 dark:bg-black/70 border-white/20 text-white hover:bg-black/70 dark:hover:bg-black/90" />
        </div>

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
            {/* Player Details */}
            <Container>
              <h2 className="text-2xl font-bold mb-5">Player Details</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                <CardStat
                  Icon={User}
                  iconColor="text-blue-600"
                  label="Age"
                  value={age ? `${age} years` : "N/A"}
                />
                <CardStat
                  Icon={User}
                  iconColor="text-purple-600"
                  label="Gender"
                  value={player.gender || "N/A"}
                />
                {player.height && (
                  <CardStat
                    Icon={Ruler}
                    iconColor="text-green-600"
                    label="Height"
                    value={`${player.height} ft`}
                  />
                )}
                {player.weight && (
                  <CardStat
                    Icon={Weight}
                    iconColor="text-amber-600"
                    label="Weight"
                    value={`${player.weight} kg`}
                  />
                )}
                <CardStat
                  Icon={MapPin}
                  iconColor="text-red-600"
                  label="City"
                  value={player.city}
                />
              </div>
            </Container>


            {/* Achievements */}
            <Container>
              <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-600" />
                Achievements
              </h2>
              {player.achievements && player.achievements.length > 0 ? (
                <div className="space-y-3">
                  {player.achievements.map((achievement, index) => (
                    <AchievementCard
                      key={`${achievement.title}-${achievement.year || index}`}
                      title={achievement.title}
                      year={achievement.year}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-base dark:text-base-dark">No achievements added yet.</p>
              )}
            </Container>

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
                      className="group flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 hover:border-secondary dark:hover:border-secondary hover:shadow-md"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-gray-700 shrink-0">
                        <img
                          src={team.logoUrl || defaultTeamAvatar}
                          alt={team.name}
                          className="w-full h-full object-cover"
                        />
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
            {/* Sports & Roles */}
            <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary dark:text-secondary-dark" />
                Sports & Roles
              </h3>

              {player.sports && player.sports.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {player.sports.map((sportItem, index) => {
                    const sportName =
                      typeof sportItem === "string"
                        ? sportItem
                        : sportItem.sport?.name || sportItem.sport?.sportsName || sportItem.name || sportItem.sportsName || "Sport";
                    const role = sportItem.role || player.playingRole;

                    return (
                      <span
                        key={`${sportName}-${role || "no-role"}-${index}`}
                        className="inline-flex items-center bg-secondary text-text-secondary text-xs sm:text-sm px-4 py-1.5 rounded-full font-bold shadow-lg"
                      >
                        {role ? `${sportName} • ${role}` : sportName}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-text-primary/70 dark:text-text-primary-dark/70">
                  No sports added yet.
                </p>
              )}
            </div>

            {/* Contact Details */}
            <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Contact Details
              </h3>
              <div className="space-y-3">
                <a
                  href={`mailto:${player.email}`}
                  className="flex items-center gap-2 text-sm text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors"
                >
                  <Mail className="w-4 h-4 text-secondary dark:text-secondary-dark shrink-0" />
                  <span className="truncate">{player.email}</span>
                </a>
                <a
                  href={`tel:${player.phone}`}
                  className="flex items-center gap-2 text-sm text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors"
                >
                  <Phone className="w-4 h-4 text-secondary dark:text-secondary-dark shrink-0" />
                  <span className="font-num">{player.phone}</span>
                </a>
                <div className="flex items-center gap-2 text-sm text-text-primary/70 dark:text-text-primary-dark/70">
                  <MapPin className="w-4 h-4 text-secondary dark:text-secondary-dark shrink-0" />
                  <span>{player.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card-background dark:bg-card-background-dark rounded-2xl shadow-2xl max-w-md w-full p-6 border border-base-dark dark:border-base animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                Invite to Team
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Player Info */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <img
                    src={player?.avatarUrl || defaultAvatar}
                    alt={player?.fullName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-secondary"
                  />
                  <div>
                    <p className="font-semibold text-text-primary dark:text-text-primary-dark">
                      {player?.fullName}
                    </p>
                    <p className="text-sm text-base dark:text-base-dark">
                      {player?.city}
                    </p>
                  </div>
                </div>

                {/* Team Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                    Select Team
                  </label>
                  {managerTeams && managerTeams.length > 0 ? (
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full p-3 rounded-xl border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                    >
                      <option value="">Choose a team...</option>
                      {managerTeams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name} ({team.sport?.name || 'Unknown Sport'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-base dark:text-base-dark p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      You don't have any teams yet. Create a team first to invite players.
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {inviteError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{inviteError}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-3 border border-base-dark dark:border-base rounded-xl text-text-primary dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvite}
                    disabled={inviteLoading || !selectedTeam || managerTeams?.length === 0}
                    className="flex-1 px-4 py-3 bg-secondary dark:bg-secondary-dark text-white rounded-xl hover:opacity-90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {inviteLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Send Invite
                      </>
                    )}
                  </button>
                </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDetail;

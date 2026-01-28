import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Trophy,
  Users,
  Mail,
  Phone,
  User,
  ArrowLeft,
  UserPlus,
  Award,
  Send,
  Users2,
} from "lucide-react";
import CardStat from "../../components/ui/CardStat";
import Container from "../../components/container/Container";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";
import DataTable from "../../components/ui/DataTable";
import { fetchTeamById } from "../../store/slices/teamSlice";
import { sendTeamRequest, getSentRequests } from "../../store/slices/requestSlice";
import defaultTeamCoverImage from "../../assets/defaultTeamCoverImage.png";
import defaultTeamAvatar from "../../assets/defaultTeamAvatar.png";
import defaultTeamManagerAvatar from "../../assets/defaultTeamManagerAvatar.png";
import AchievementCard from "../../components/ui/AchievementCard";
import { toast } from "react-hot-toast";
import useDateFormat from "../../hooks/useDateFormat";

// Helpers
const computeAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  try {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  } catch (err) {
    return null;
  }
};

const TeamDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedTeam: team, loading } = useSelector((state) => state.team);
  const { user } = useSelector((state) => state.auth);
  const { sentRequests, loading: requestLoading } = useSelector((state) => state.request);
  const [requestSent, setRequestSent] = useState(false);
  const { formatDate } = useDateFormat();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      dispatch(fetchTeamById(id));
    }
    if (user?.role === "Player") {
      dispatch(getSentRequests());
    }
  }, [id, dispatch, user?.role]);

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

  const handleJoinRequest = async () => {
    try {
      await dispatch(
        sendTeamRequest({
          teamId: team._id,
          message: "",
        }),
      ).unwrap();
      setRequestSent(true);
      toast.success("Join request sent successfully!");
    } catch (err) {
      toast.error(err?.message || "Failed to send request");
    }
  };

  const isPlayer = user?.role === "Player";
  const isTeamMember = team.players?.some((player) => player._id === user?._id);
  
  // Check if user has already sent a request to this team
  const hasExistingRequest = sentRequests.some(
    (request) => request.team?._id === team._id && request.status === "PENDING"
  );

  const getRoleForTeamSport = (player) => {
    const teamSportId = team.sport?._id || team.sport;
    const matched = player.sports?.find(
      (s) => (s.sport?._id || s.sport) === teamSportId,
    );
    return matched?.role || player.playingRole || "";
  };

  const playerColumns = [
    {
      header: "Player",
      width: "28%",
      render: (player) => (
        <div className="flex items-center gap-3">
          <img
            src={player.avatar || defaultTeamAvatar}
            alt={player.fullName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-text-primary dark:text-text-primary-dark truncate">
              {player.fullName}
            </p>
            <p className="text-sm text-base dark:text-base-dark truncate">
              {player.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      width: "16%",
      render: (player) => (
        <span className="text-sm text-text-primary dark:text-text-primary-dark">
          {getRoleForTeamSport(player)}
        </span>
      ),
    },
    {
      header: "Gender",
      width: "10%",
      render: (player) => (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
            player.gender === "Female"
              ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
              : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
          }`}
        >
          {player.gender}
        </span>
      ),
    },
    {
      header: "Age",
      width: "8%",
      render: (player) => {
        const age = computeAge(player.dateOfBirth);
        return (
          <span className="text-sm text-text-primary dark:text-text-primary-dark">
            {age ?? "-"}
          </span>
        );
      },
    },
    {
      header: "Location",
      width: "15%",
      render: (player) => (
        <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark truncate">
          <MapPin className="w-4 h-4 text-secondary shrink-0" />
          <span className="truncate">{player.city || "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Contact",
      width: "23%",
      render: (player) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
            <Mail className="w-4 h-4 text-secondary shrink-0" />
            <span className="truncate">{player.email}</span>
          </div>
          {player.phone && (
            <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
              <Phone className="w-4 h-4 text-secondary shrink-0" />
              <span className="truncate">{player.phone}</span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen pb-16">
      {/* Banner */}
      <div className="relative h-screen sm:h-112 overflow-hidden">
        <img
          src={team.bannerUrl || defaultTeamCoverImage}
          alt={team.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-black/30"></div>

        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <BackButton className="bg-black/50 dark:bg-black/70 border-white/20 text-white hover:bg-black/70 dark:hover:bg-black/90" />
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
                  {team.sport?.name || "Sport"}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm px-4 py-1.5 rounded-full font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {team.city || "N/A"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {team.name}
              </h1>
            </div>

            {/* Right Overlay - Join Button */}
            {isPlayer &&
              !isTeamMember &&
              (requestSent || hasExistingRequest ? (
                <button
                  className="bg-accent/50 text-black/50 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl whitespace-nowrap cursor-not-allowed"
                  disabled
                >
                  Request Already Sent
                </button>
              ) : !team.openToJoin ? (
                <button
                  className="bg-accent/50 text-black/50 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl whitespace-nowrap cursor-not-allowed"
                  disabled
                >
                  Team Registration Closed
                </button>
              ) : (
                <button
                  onClick={handleJoinRequest}
                  disabled={requestLoading}
                  className="bg-accent hover:bg-accent/90 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-accent/50 hover:scale-105 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requestLoading ? "Sending..." : "Send Join Request"}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 mt-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Team */}
            {team.description && (
              <Container>
                <h2 className="text-2xl font-bold mb-5">About Team</h2>
                <p className="text-base dark:text-base-dark leading-relaxed">
                  {team.description}
                </p>
              </Container>
            )}
            {/* Team Information */}
            <Container>
              <h2 className="text-2xl font-bold mb-5">Team Details</h2>
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
                  Icon={Users2}
                  iconColor="text-purple-600"
                  label="Gender"
                  value={team.gender || "Mixed"}
                />
                <CardStat
                  Icon={UserPlus}
                  iconColor="text-cyan-600"
                  label="Join Status"
                  value={team.openToJoin ? "Open" : "Closed"}
                />
              </div>
            </Container>

            {/* Team Achievements */}
            {team.achievements && team.achievements.length > 0 && (
              <Container>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-600" />
                    <h2 className="text-2xl font-bold">Achievements</h2>
                  </div>
                  <p className="text-sm text-base dark:text-base-dark">
                    {team.achievements.length} accomplishment
                    {team.achievements.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {team.achievements.map((achievement, index) => {
                    const title =
                      achievement?.title || achievement || "Achievement";
                    const year = achievement?.year;
                    return (
                      <AchievementCard key={index} title={title} year={year} />
                    );
                  })}
                </div>
              </Container>
            )}

            {/* Team Members */}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Manager Card */}
            <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Team Manager
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 shrink-0">
                  <img
                    src={team.manager.avatar || defaultTeamManagerAvatar}
                    alt={team.manager.fullName}
                    className="w-full h-full object-cover"
                  />
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
                  className="flex items-center gap-2 text-sm text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors"
                >
                  <Mail className="w-4 h-4 text-secondary dark:text-secondary-dark shrink-0" />
                  <span className="truncate">{team.manager.email}</span>
                </a>
                <a
                  href={`tel:${team.manager.phone}`}
                  className="flex items-center gap-2 text-sm text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors"
                >
                  <Phone className="w-4 h-4 text-secondary dark:text-secondary-dark shrink-0" />
                  <span className="font-num">{team.manager.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Team Members Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                <Users className="w-7 h-7 text-blue-600" />
                Team Members ({team.players.length})
              </h2>
            </div>
          </div>

          {team.players.length > 0 ? (
            <DataTable
              columns={playerColumns}
              data={team.players}
              onRowClick={(player) => navigate(`/players/${player._id}`)}
              itemsPerPage={team.players.length}
              emptyMessage="No team members yet"
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                No team members yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;

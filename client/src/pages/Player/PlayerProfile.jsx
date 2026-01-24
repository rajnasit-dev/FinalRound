import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trophy,
  Ruler,
  Weight,
  Camera,
  Trash2,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useDateFormat from "../../hooks/useDateFormat";
import useAge from "../../hooks/useAge";
import defaultAvatar from "../../assets/defaultAvatar.png";
import {
  fetchPlayerProfile,
  updatePlayerAvatar,
  deletePlayerAvatar,
} from "../../store/slices/playerSlice";
import { updateUserAvatar } from "../../store/slices/authSlice";
import Spinner from "../../components/ui/Spinner";
import AchievementCard from "../../components/ui/AchievementCard";
import Container from "../../components/container/Container";
import GridContainer from "../../components/ui/GridContainer";

const PlayerProfile = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { profile, loading: playerLoading } = useSelector(
    (state) => state.player,
  );

  useEffect(() => {
    dispatch(fetchPlayerProfile());
  }, [dispatch]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const result = await dispatch(updatePlayerAvatar(file)).unwrap();
      // Update auth state with new avatar URL so it shows in navbar
      if (result?.avatar) {
        dispatch(updateUserAvatar(result.avatar));
      }
    } catch (error) {
      alert(error || "Failed to update avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!user?.avatar) return;

    if (!confirm("Are you sure you want to delete your avatar?")) {
      return;
    }

    setDeletingAvatar(true);
    try {
      await dispatch(deletePlayerAvatar()).unwrap();
      // Clear avatar from auth state so it clears from navbar
      dispatch(updateUserAvatar(null));
    } catch (error) {
      alert(error || "Failed to delete avatar");
    } finally {
      setDeletingAvatar(false);
    }
  };

  const { formatDate } = useDateFormat();

  // Use profile data if available, otherwise fall back to user data
  const playerData = profile || user || {};

  // Calculate age from dateOfBirth
  const age = useAge(playerData?.dateOfBirth);
  const sportsList = Array.isArray(playerData?.sports) ? playerData.sports : [];

  if (playerLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          My Profile
        </h1>
        <Link
          to="/player/profile/edit"
          className="flex items-center gap-2 px-4 py-2 bg-secondary dark:bg-secondary-dark text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Edit size={18} />
          Edit Profile
        </Link>
      </div>

      {/* Profile Card */}
      <Container>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="flex-shrink-0 relative">
            <img
              src={playerData?.avatar || defaultAvatar}
              alt={playerData?.fullName || "Player"}
              className="w-28 h-28 rounded-full object-cover shadow-md"
            />
            <button
              onClick={handleAvatarClick}
              disabled={uploadingAvatar || deletingAvatar}
              className="absolute bottom-0 right-0 bg-secondary dark:bg-secondary-dark text-white p-2 rounded-full shadow-lg hover:bg-secondary/90 dark:hover:bg-secondary-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Update avatar"
            >
              {uploadingAvatar ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </button>

            {/* Delete avatar button - only show if avatar exists */}
            {user?.avatar && (
              <button
                onClick={handleAvatarDelete}
                disabled={uploadingAvatar || deletingAvatar}
                className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete avatar"
              >
                {deletingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                {playerData?.fullName || "Player Name"}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {age && (
                  <span className="text-sm text-base dark:text-base-dark">
                    {age} years
                  </span>
                )}
                {playerData?.gender && age && (
                  <span className="text-base dark:text-base-dark">•</span>
                )}
                {playerData?.gender && (
                  <span className="text-sm text-base dark:text-base-dark">
                    {playerData.gender}
                  </span>
                )}
              </div>
            </div>

            <p className="text-base dark:text-base-dark">
              {playerData?.bio || "No bio added yet."}
            </p>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
                <Mail
                  size={16}
                  className="text-secondary dark:text-secondary-dark"
                />
                <span>{playerData?.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
                <Phone
                  size={16}
                  className="text-secondary dark:text-secondary-dark"
                />
                <span>{playerData?.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
                <MapPin
                  size={16}
                  className="text-secondary dark:text-secondary-dark"
                />
                <span>{playerData?.city || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
                <Calendar
                  size={16}
                  className="text-secondary dark:text-secondary-dark"
                />
                <span>
                  Joined{" "}
                  {playerData?.createdAt
                    ? formatDate(playerData.createdAt)
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Physical Stats */}
            {(playerData?.height || playerData?.weight) && (
              <div className="flex flex-wrap gap-4 pt-2">
                {playerData.height && (
                  <div className="flex items-center gap-2 text-sm">
                    <Ruler
                      size={16}
                      className="text-secondary dark:text-secondary-dark"
                    />
                    <span className="text-base dark:text-base-dark">
                      {playerData.height} cm
                    </span>
                  </div>
                )}
                {playerData.weight && (
                  <div className="flex items-center gap-2 text-sm">
                    <Weight
                      size={16}
                      className="text-secondary dark:text-secondary-dark"
                    />
                    <span className="text-base dark:text-base-dark">
                      {playerData.weight} kg
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

         
        </div>
      </Container>
       <GridContainer cols={2} gap="gap-4">
            {/* Achievements */}
            {playerData?.achievements &&
              Array.isArray(playerData.achievements) &&
              playerData.achievements.length > 0 &&
              playerData.achievements.some((a) => a.title) && (
                <Container>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy size={18} className="text-amber-600" />
                    <span className="text-base font-semibold text-text-primary dark:text-text-primary-dark">
                      Achievements
                    </span>
                  </div>
                  <div className="space-y-3">
                    {playerData.achievements
                      .filter((a) => a.title)
                      .map((achievement, index) => (
                        <AchievementCard
                          key={index}
                          title={achievement.title}
                          year={achievement.year}
                        />
                      ))}
                  </div>
                </Container>
              )}
              {/* Sports & Roles */}
            {sportsList.length > 0 && (
              <Container>
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity
                    size={18}
                    className="text-secondary dark:text-secondary-dark"
                  />
                  <span className="text-base font-semibold text-text-primary dark:text-text-primary-dark">
                    Sports & Roles
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sportsList.map((sportItem, index) => {
                    // Normalize sport name; avoid showing raw ObjectId strings
                    const isObjectIdString =
                      typeof sportItem === "string" && /^[a-f\d]{24}$/i.test(sportItem);

                    let sportName = "Sport";

                    if (typeof sportItem === "string") {
                      sportName = isObjectIdString ? "Sport" : sportItem;
                    } else if (sportItem.sport) {
                      if (
                        typeof sportItem.sport === "object" &&
                        sportItem.sport.name
                      ) {
                        sportName = sportItem.sport.name;
                      } else if (
                        typeof sportItem.sport === "string" &&
                        !/^[a-f\d]{24}$/i.test(sportItem.sport)
                      ) {
                        sportName = sportItem.sport;
                      }
                    } else if (sportItem.name) {
                      sportName = sportItem.name;
                    } else if (sportItem.sportsName) {
                      sportName = sportItem.sportsName;
                    } else if (sportItem.sportName) {
                      sportName = sportItem.sportName;
                    }

                    const role =
                      sportItem.role || playerData.playingRole || "Player";

                    return (
                      <span
                        key={`${sportName}-${index}`}
                        className="px-4 py-2 bg-secondary dark:bg-secondary-dark text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-shadow"
                      >
                        {sportName} • {role}
                      </span>
                    );
                  })}
                </div>
              </div>
              </Container>
            )}
          </GridContainer>
    </div>
  );
};

export default PlayerProfile;

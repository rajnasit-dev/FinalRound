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
import toast from "react-hot-toast";
import useDateFormat from "../../hooks/useDateFormat";
import useAge from "../../hooks/useAge";
import defaultAvatar from "../../assets/defaultAvatar.png";
import defaultCoverImage from "../../assets/defaultCoverImage.png";
import BackButton from "../../components/ui/BackButton";
import AvatarUpload from "../../components/ui/AvatarUpload";
import BannerUpload from "../../components/ui/BannerUpload";
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [deletingBanner, setDeletingBanner] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { profile, loading: playerLoading } = useSelector(
    (state) => state.player,
  );

  useEffect(() => {
    dispatch(fetchPlayerProfile());
  }, [dispatch]);

  const handleAvatarChange = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const result = await dispatch(updatePlayerAvatar(file)).unwrap();
      // Update auth state with new avatar URL so it shows in navbar
      if (result?.avatar) {
        dispatch(updateUserAvatar(result.avatar));
      }
      toast.success("Avatar updated successfully");
    } catch (error) {
      toast.error(error || "Failed to update avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!user?.avatar) return;

    if (!window.confirm("Are you sure you want to delete your avatar?")) {
      return;
    }

    setDeletingAvatar(true);
    try {
      await dispatch(deletePlayerAvatar()).unwrap();
      // Clear avatar from auth state so it clears from navbar
      dispatch(updateUserAvatar(null));
      toast.success("Avatar deleted successfully");
    } catch (error) {
      toast.error(error || "Failed to delete avatar");
    } finally {
      setDeletingAvatar(false);
    }
  };

  const handleBannerUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingBanner(true);
    try {
      toast("Banner upload functionality will be added soon", { icon: 'ℹ️' });
      // TODO: Implement banner upload when API endpoint is available
    } catch (error) {
      toast.error(error || "Failed to upload banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleBannerDelete = async () => {
    setDeletingBanner(true);
    try {
      toast("Banner delete functionality will be added soon", { icon: 'ℹ️' });
      // TODO: Implement banner delete when API endpoint is available
    } catch (error) {
      toast.error(error || "Failed to delete banner");
    } finally {
      setDeletingBanner(false);
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
      <BackButton className="mb-4" />
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
        {/* Media Section - Avatar and Banner side by side */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Left - Avatar */}
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">Profile Picture</h3>
            <AvatarUpload
              avatarUrl={playerData?.avatar}
              defaultAvatar={defaultAvatar}
              onUpload={handleAvatarChange}
              onDelete={handleAvatarDelete}
              uploading={uploadingAvatar}
              deleting={deletingAvatar}
              showDelete={!!user?.avatar}
              size="lg"
              shape="circle"
              alt={playerData?.fullName || "Player"}
            />
          </div>

          {/* Right - Banner */}
          <div className="flex-1 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">Banner</h3>
            <BannerUpload
              bannerUrl={null}
              defaultBanner={defaultCoverImage}
              onUpload={handleBannerUpload}
              onDelete={handleBannerDelete}
              uploading={uploadingBanner}
              deleting={deletingBanner}
              showDelete={false}
              height="h-40"
              alt="Player Banner"
            />
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="space-y-6">

          {/* Name and Bio */}
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

            <p className="text-base dark:text-base-dark mt-3">
              {playerData?.bio || "No bio added yet."}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <div className="flex flex-wrap gap-4 pt-4">
                {playerData.height && (
                  <div className="flex items-center gap-2 text-sm">
                    <Ruler
                      size={16}
                      className="text-secondary dark:text-secondary-dark"
                    />
                    <span className="text-base dark:text-base-dark">
                      {playerData.height} ft
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
                    <span className="font-semibold text-text-primary dark:text-text-primary-dark">
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
                  <span className="font-semibold text-text-primary dark:text-text-primary-dark">
                    Sports & Roles
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sportsList.map((sportItem, index) => {
                    const sportName =
                      typeof sportItem === "string"
                        ? sportItem
                        : sportItem.sport?.name || sportItem.sport?.sportsName || sportItem.name || sportItem.sportsName || "Sport";
                    const role = sportItem.role || playerData.playingRole;

                    return (
                      <span
                        key={`${sportName}-${role || "no-role"}-${index}`}
                        className="px-4 py-2 bg-secondary dark:bg-secondary-dark text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-shadow"
                      >
                        {role ? `${sportName} • ${role}` : sportName}
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

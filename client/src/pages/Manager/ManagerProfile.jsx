import { User, Mail, Phone, MapPin, Calendar, Edit, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useDateFormat from "../../hooks/useDateFormat";
import defaultAvatar from "../../assets/defaultAvatar.png";
import { updateUserAvatar } from "../../store/slices/authSlice";
import Spinner from "../../components/ui/Spinner";
import Container from "../../components/container/Container";
import BackButton from "../../components/ui/BackButton";
import AvatarUpload from "../../components/ui/AvatarUpload";
import { fetchManagerTeams } from "../../store/slices/teamSlice";

const ManagerProfile = () => {
  const dispatch = useDispatch();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { managerTeams, loading: teamsLoading } = useSelector((state) => state.team);

  const { formatDate } = useDateFormat();

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchManagerTeams(user._id));
    }
  }, [dispatch, user?._id]);

  const handleAvatarChange = async (file) => {
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
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1"}/users/avatar`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }

      const data = await response.json();
      if (data.data?.avatar) {
        dispatch(updateUserAvatar(data.data.avatar));
      }
    } catch (error) {
      alert(error.message || "Failed to update avatar");
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1"}/users/avatar`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete avatar");
      }

      dispatch(updateUserAvatar(null));
    } catch (error) {
      alert(error.message || "Failed to delete avatar");
    } finally {
      setDeletingAvatar(false);
    }
  };

  if (!user || teamsLoading) {
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
          to="/manager/profile/edit"
          className="flex items-center gap-2 px-4 py-2 bg-secondary dark:bg-secondary-dark text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Edit size={18} />
          Edit Profile
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-2xl p-8 shadow-md">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <AvatarUpload
              avatarUrl={user?.avatar}
              defaultAvatar={defaultAvatar}
              onUpload={handleAvatarChange}
              onDelete={handleAvatarDelete}
              uploading={uploadingAvatar}
              deleting={deletingAvatar}
              showDelete={!!user?.avatar}
              size="lg"
              shape="circle"
              alt={user?.fullName || "Manager"}
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                {user?.fullName || "Manager Name"}
              </h2>
              <p className="text-base dark:text-base-dark mt-1">Team Manager</p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
                <Mail size={16} className="text-secondary dark:text-secondary-dark" />
                <span>{user?.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
                <Phone size={16} className="text-secondary dark:text-secondary-dark" />
                <span>{user?.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
                <MapPin size={16} className="text-secondary dark:text-secondary-dark" />
                <span>{user?.city || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
                <Calendar size={16} className="text-secondary dark:text-secondary-dark" />
                <span>Joined {user?.createdAt ? formatDate(user.createdAt) : "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manager Statistics */}
      <Container>
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
          Manager Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Teams</p>
                <p className="text-2xl font-bold text-blue-600">
                  {managerTeams?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-linear-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Players</p>
                <p className="text-2xl font-bold text-green-600">
                  {managerTeams?.reduce((acc, team) => acc + (team.players?.length || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-linear-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Teams</p>
                <p className="text-2xl font-bold text-purple-600">
                  {managerTeams?.filter(team => team.isActive)?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ManagerProfile;

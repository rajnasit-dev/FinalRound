import { User, Mail, Phone, MapPin, Calendar, Edit, Trophy, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import useDateFormat from "../../hooks/useDateFormat";
import defaultAvatar from "../../assets/defaultOrganizerAvatar.png";
import { updateUserAvatar } from "../../store/slices/authSlice";
import Spinner from "../../components/ui/Spinner";
import Container from "../../components/container/Container";
import BackButton from "../../components/ui/BackButton";
import AvatarUpload from "../../components/ui/AvatarUpload";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";

const OrganizerProfile = () => {
  const dispatch = useDispatch();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { tournaments, loading: tournamentsLoading } = useSelector((state) => state.tournament);
  const organizerTournaments = tournaments?.filter((t) => t.organizer?._id === user?._id) || [];

  const { formatDate } = useDateFormat();

  useEffect(() => {
    dispatch(fetchAllTournaments({}));
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
      toast.error(error.message || "Failed to update avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!user?.avatar) return;

    if (!window.confirm("Are you sure you want to delete your avatar?")) return;

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
      toast.error(error.message || "Failed to delete avatar");
    } finally {
      setDeletingAvatar(false);
    }
  };

  if (!user || tournamentsLoading) {
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
          to="/organizer/profile/edit"
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
              alt={user?.fullName || "Organizer"}
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                {user?.fullName || "Organizer Name"}
              </h2>
              <p className="text-base dark:text-base-dark mt-1">Tournament Organizer</p>
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

    </div>
  );
};

export default OrganizerProfile;

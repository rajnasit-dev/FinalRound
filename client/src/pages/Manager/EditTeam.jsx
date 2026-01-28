import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { Users, MapPin, FileText, Globe, Save, X, Trash2, Mail, Phone } from "lucide-react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import RadioGroup from "../../components/ui/RadioGroup";
import AddAchievements from "../../components/ui/AddAchievements";
import BackButton from "../../components/ui/BackButton";
import AvatarUpload from "../../components/ui/AvatarUpload";
import BannerUpload from "../../components/ui/BannerUpload";
import { fetchAllSports } from "../../store/slices/sportSlice";
import { fetchTeamById, clearError, clearSelectedTeam } from "../../store/slices/teamSlice";
import Spinner from "../../components/ui/Spinner";
import { validations, validateImageFile, validateFileSize } from "../../utils/formValidations";
import axios from "axios";
import defaultTeamAvatar from "../../assets/defaultTeamAvatar.png";
import defaultTeamCoverImage from "../../assets/defaultTeamCoverImage.png";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const openToJoinOptions = [
  { value: "true", label: "Open to join" },
  { value: "false", label: "Closed" },
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Mixed", label: "Mixed" },
];

const EditTeam = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sports } = useSelector((state) => state.sport);
  const { selectedTeam, loading } = useSelector((state) => state.team);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isDeletingBanner, setIsDeletingBanner] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [currentAchievement, setCurrentAchievement] = useState({ title: "", year: "" });
  const [achievementError, setAchievementError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      sport: "",
      city: "",
      description: "",
      gender: "",
      openToJoin: "true",
    },
  });

  useEffect(() => {
    dispatch(fetchAllSports());
    if (teamId) {
      dispatch(fetchTeamById(teamId));
    }
  }, [dispatch, teamId]);

  useEffect(() => {
    if (selectedTeam) {
      reset({
        name: selectedTeam.name || "",
        sport: selectedTeam.sport?._id || selectedTeam.sport || "",
        city: selectedTeam.city || "",
        description: selectedTeam.description || "",
        gender: selectedTeam.gender || "",
        openToJoin: selectedTeam.openToJoin ? "true" : "false",
      });
      setAchievements(selectedTeam.achievements || []);
      setLogoPreview(selectedTeam.logoUrl || null);
      setBannerPreview(selectedTeam.bannerUrl || null);
    }
  }, [selectedTeam, reset]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSelectedTeam());
      setError(null);
      reset();
    };
  }, [dispatch, reset]);

  const sportOptions = [
    { value: "", label: "Select Sport" },
    ...(sports?.map((sport) => ({ value: sport._id, label: sport.name })) || []),
  ];

  const handleCancel = () => {
    navigate("/manager/teams");
  };

  const handleRemovePlayer = async (playerId) => {
    if (!confirm("Remove this player from the team?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/teams/${teamId}/players/${playerId}`, {
        withCredentials: true,
      });
      toast.success("Player removed from team");
      dispatch(fetchTeamById(teamId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove player");
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const typeValidation = validateImageFile(file);
    if (typeValidation !== true) {
      setError(typeValidation);
      return;
    }

    const sizeValidation = validateFileSize(file, 5);
    if (sizeValidation !== true) {
      setError(sizeValidation);
      return;
    }

    setLogoFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async (file) => {
    const typeValidation = validateImageFile(file);
    if (typeValidation !== true) {
      setError(typeValidation);
      return;
    }

    const sizeValidation = validateFileSize(file, 5);
    if (sizeValidation !== true) {
      setError(sizeValidation);
      return;
    }

    // Show instant preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setIsUploadingLogo(true);
    setError(null);

    try {
      const logoForm = new FormData();
      logoForm.append("logo", file);
      const response = await axios.patch(`${API_BASE_URL}/teams/${teamId}/logo`, logoForm, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Update preview with uploaded URL
      if (response.data?.data?.logoUrl) {
        setLogoPreview(response.data.data.logoUrl);
      }
      dispatch(fetchTeamById(teamId));
    } catch (error) {
      console.error("Logo upload error:", error);
      setError(error.response?.data?.message || "Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLogoDelete = async () => {
    setIsDeletingLogo(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/teams/${teamId}/logo`, {
        withCredentials: true,
      });
      
      setLogoPreview(null);
      setLogoFile(null);
      dispatch(fetchTeamById(teamId));
    } catch (error) {
      console.error("Logo delete error:", error);
      setError(error.response?.data?.message || "Failed to delete logo");
    } finally {
      setIsDeletingLogo(false);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const typeValidation = validateImageFile(file);
    if (typeValidation !== true) {
      setError(typeValidation);
      return;
    }

    const sizeValidation = validateFileSize(file, 5);
    if (sizeValidation !== true) {
      setError(sizeValidation);
      return;
    }

    setBannerFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => setBannerPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = async (file) => {
    const typeValidation = validateImageFile(file);
    if (typeValidation !== true) {
      setError(typeValidation);
      return;
    }

    const sizeValidation = validateFileSize(file, 5);
    if (sizeValidation !== true) {
      setError(sizeValidation);
      return;
    }

    // Show instant preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setIsUploadingBanner(true);
    setError(null);

    try {
      const bannerForm = new FormData();
      bannerForm.append("banner", file);
      const response = await axios.patch(`${API_BASE_URL}/teams/${teamId}/banner`, bannerForm, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Update preview with uploaded URL
      if (response.data?.data?.bannerUrl) {
        setBannerPreview(response.data.data.bannerUrl);
      }
      dispatch(fetchTeamById(teamId));
    } catch (error) {
      console.error("Banner upload error:", error);
      setError(error.response?.data?.message || "Failed to upload banner");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleBannerDelete = async () => {
    setIsDeletingBanner(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/teams/${teamId}/banner`, {
        withCredentials: true,
      });
      
      setBannerPreview(null);
      setBannerFile(null);
      dispatch(fetchTeamById(teamId));
    } catch (error) {
      console.error("Banner delete error:", error);
      setError(error.response?.data?.message || "Failed to delete banner");
    } finally {
      setIsDeletingBanner(false);
    }
  };

  const handleAddAchievement = (newAchievement) => {
    setAchievements([...achievements, newAchievement]);
    setCurrentAchievement({ title: "", year: "" });
    setAchievementError("");
  };

  const handleRemoveAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleAchievementChange = ({ type, value }) => {
    if (type === "title") {
      setCurrentAchievement({ ...currentAchievement, title: value });
      setAchievementError("");
    } else if (type === "year") {
      setCurrentAchievement({ ...currentAchievement, year: value });
      setAchievementError("");
    } else if (type === "error") {
      setAchievementError(value);
    }
  };

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const payload = {
        name: data.name,
        sport: data.sport,
        city: data.city || undefined,
        description: data.description || "",
        gender: data.gender,
        openToJoin: data.openToJoin === "true",
        achievements,
      };

      await axios.put(`${API_BASE_URL}/teams/${teamId}`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      if (logoFile) {
        const logoForm = new FormData();
        logoForm.append("logo", logoFile);
        await axios.patch(`${API_BASE_URL}/teams/${teamId}/logo`, logoForm, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (bannerFile) {
        const bannerForm = new FormData();
        bannerForm.append("banner", bannerFile);
        await axios.patch(`${API_BASE_URL}/teams/${teamId}/banner`, bannerForm, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSuccess(true);
      setTimeout(() => navigate("/manager/teams"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !selectedTeam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary dark:bg-primary-dark py-8">
      <div className="max-w-4xl mx-auto px-4">
        <BackButton className="mb-6" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">Edit Team</h1>
          <p className="text-base dark:text-base-dark mt-2">Update your team profile</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-600 dark:text-green-400 text-sm">
                Team updated successfully! Redirecting...
              </p>
            </div>
          )}

          <div className="bg-card-background dark:bg-card-background-dark rounded-2xl p-8 shadow-md">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6">Team Information</h2>
            <div className="space-y-6">
              <Input
                label="Team Name"
                type="text"
                placeholder="Enter team name"
                icon={<Users size={18} />}
                error={errors.name?.message}
                {...register("name", validations.teamName)}
              />

              <Select
                label="Sport"
                options={sportOptions}
                icon={<Users size={18} />}
                error={errors.sport?.message}
                {...register("sport", validations.sport)}
              />

              <Controller
                name="gender"
                control={control}
                rules={{ required: "Gender is required" }}
                render={({ field: { value, onChange, ref } }) => (
                  <RadioGroup
                    ref={ref}
                    label="Gender"
                    options={genderOptions}
                    name="gender"
                    value={value}
                    onChange={onChange}
                    error={errors.gender?.message}
                    required
                  />
                )}
              />

              <Input
                label="City (Optional)"
                type="text"
                placeholder="Enter city name"
                icon={<MapPin size={18} />}
                error={errors.city?.message}
                {...register("city", {
                  minLength: { value: 2, message: "City must be at least 2 characters" },
                  maxLength: { value: 50, message: "City must be under 50 characters" },
                })}
              />

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                  Description (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-base dark:text-base-dark" size={18} />
                  <textarea
                    placeholder="Tell us about your team..."
                    {...register("description", validations.description)}
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 bg-card-background dark:bg-card-background-dark rounded-lg border border-base-dark dark:border-base dark:focus:border-base-dark/50 focus:border-base/50 focus:outline-none text-text-primary dark:text-text-primary-dark resize-none"
                  />
                </div>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <Controller
                name="openToJoin"
                control={control}
                render={({ field: { value, onChange, ref } }) => (
                  <RadioGroup
                    ref={ref}
                    label="Open to Join Requests"
                    options={openToJoinOptions}
                    name="openToJoin"
                    value={value}
                    onChange={onChange}
                    error={errors.openToJoin?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Team Members Management */}
          <div className="bg-card-background dark:bg-card-background-dark rounded-2xl p-8 shadow-md">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6">Team Members</h2>
            {selectedTeam?.players?.length ? (
              <div className="space-y-3">
                {selectedTeam.players.map((player) => (
                  <div key={player._id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={player.avatar || defaultTeamAvatar} alt={player.fullName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-text-primary dark:text-text-primary-dark truncate">{player.fullName}</p>
                        <div className="flex items-center gap-3 text-sm text-base dark:text-base-dark">
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="w-4 h-4 text-secondary" />
                            <span className="truncate">{player.email}</span>
                          </span>
                          {player.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4 text-secondary" />
                              <span className="font-num">{player.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-auto"
                      onClick={() => handleRemovePlayer(player._id)}
                    >
                      <Trash2 size={18} />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base dark:text-base-dark">No members in this team yet.</p>
            )}
          </div>

          <AddAchievements
            achievements={achievements}
            onAddAchievement={handleAddAchievement}
            onRemoveAchievement={handleRemoveAchievement}
            currentAchievement={currentAchievement}
            onCurrentAchievementChange={handleAchievementChange}
            achievementError={achievementError}
            title="Team Achievements (Optional)"
          />

          <div className="bg-card-background dark:bg-card-background-dark rounded-2xl p-8 shadow-md">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6">Team Media (Optional)</h2>
            
            {/* Avatar and Banner side by side */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left - Logo/Avatar */}
              <div className="flex flex-col items-center gap-3">
                <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">Team Logo</h3>
                <AvatarUpload
                  avatarUrl={selectedTeam?.logoUrl}
                  defaultAvatar={defaultTeamAvatar}
                  onUpload={handleLogoUpload}
                  onDelete={handleLogoDelete}
                  uploading={isUploadingLogo}
                  deleting={isDeletingLogo}
                  showDelete={!!selectedTeam?.logoUrl}
                  size="lg"
                  shape="circle"
                  alt="Team Logo"
                />
              </div>

              {/* Right - Banner */}
              <div className="flex-1 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">Team Banner</h3>
                <BannerUpload
                  bannerUrl={selectedTeam?.bannerUrl}
                  defaultBanner={defaultTeamCoverImage}
                  onUpload={handleBannerUpload}
                  onDelete={handleBannerDelete}
                  uploading={isUploadingBanner}
                  deleting={isDeletingBanner}
                  showDelete={!!selectedTeam?.bannerUrl}
                  height="h-40"
                  alt="Team Banner"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-3 flex items-center justify-center gap-2"
            >
              <X size={18} />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-secondary dark:bg-secondary-dark hover:opacity-90 px-6 py-3 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <Save size={18} />
                  Update Team
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeam;

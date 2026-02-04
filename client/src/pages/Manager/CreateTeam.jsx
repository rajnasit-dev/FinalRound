import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { Users, MapPin, FileText, Upload, Globe } from "lucide-react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import RadioGroup from "../../components/ui/RadioGroup";
import BackButton from "../../components/ui/BackButton";
import AvatarUpload from "../../components/ui/AvatarUpload";
import BannerUpload from "../../components/ui/BannerUpload";
import { fetchAllSports } from "../../store/slices/sportSlice";
import { clearError } from "../../store/slices/teamSlice";
import axios from "axios";
import defaultTeamAvatar from "../../assets/defaultTeamAvatar.png";
import defaultTeamCoverImage from "../../assets/defaultTeamCoverImage.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Validation functions
const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return "Please select a valid image file (JPEG, PNG, GIF, or WebP)";
  }
  return true;
};

const validateFileSize = (file, maxSizeInMB = 5) => {
  const maxSize = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSize) {
    return `File size must be less than ${maxSizeInMB}MB`;
  }
  return true;
};

const openToJoinOptions = [
  { value: "true", label: "Open to join" },
  { value: "false", label: "Closed" },
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Mixed", label: "Mixed" },
];

const CreateTeam = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sports } = useSelector((state) => state.sport);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, [dispatch]);

  useEffect(() => {
    reset({
      name: "",
      sport: "",
      city: "",
      description: "",
      gender: "",
      openToJoin: "true",
    });
  }, [reset]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
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

  const handleLogoUpload = (file) => {
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

  const handleLogoDelete = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleBannerUpload = (file) => {
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

  const handleBannerDelete = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    // Ensure sports are loaded
    if (!sports || sports.length === 0) {
      setError("Sports are still loading. Please wait and try again.");
      setIsSubmitting(false);
      return;
    }

    // Ensure selected sport is valid
    const selectedSport = sports.find(s => s._id === data.sport);
    if (!selectedSport) {
      setError("Selected sport is invalid. Please select a valid sport.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("sport", data.sport);
      formData.append("gender", data.gender);
      if (data.city) formData.append("city", data.city);
      if (data.description) formData.append("description", data.description);
      formData.append("openToJoin", data.openToJoin === "true");

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      await axios.post(`${API_BASE_URL}/teams`, formData, {
        withCredentials: true,
        // Let axios set the multipart boundary automatically
      });

      setSuccess(true);
      setTimeout(() => navigate("/manager/teams"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary dark:bg-primary-dark py-8">
      <div className="max-w-4xl mx-auto px-4">
        <BackButton className="mb-6" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            Create Team
          </h1>
          <p className="text-base dark:text-base-dark mt-2">
            Set up your team profile and start recruiting players
          </p>
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
                Team created successfully! Redirecting...
              </p>
            </div>
          )}

          <div className="bg-card-background dark:bg-card-background-dark rounded-2xl p-8 shadow-md">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
              Team Information
            </h2>
            <div className="space-y-6">
              <Input
                label="Team Name"
                type="text"
                placeholder="Enter team name"
                icon={<Users size={18} />}
                error={errors.name?.message}
                {...register("name", {
                  required: "Team name is required",
                  minLength: {
                    value: 3,
                    message: "Team name must be at least 3 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Team name must not exceed 50 characters",
                  },
                })}
              />

              <Select
                label="Sport"
                options={sportOptions}
                icon={<Users size={18} />}
                error={errors.sport?.message}
                {...register("sport", {
                  required: "Please select a sport",
                })}
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
                    {...register("description", {
                      maxLength: {
                        value: 500,
                        message: "Description must not exceed 500 characters",
                      },
                    })}
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

          <div className="bg-card-background dark:bg-card-background-dark rounded-2xl p-8 shadow-md">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
              Team Images (Optional)
            </h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center gap-3">
                <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">Team Logo</h3>
                <AvatarUpload
                  avatarUrl={logoPreview}
                  defaultAvatar={defaultTeamAvatar}
                  onUpload={handleLogoUpload}
                  onDelete={handleLogoDelete}
                  showDelete={!!logoPreview}
                  size="lg"
                  shape="circle"
                  alt="Team Logo"
                />
              </div>

              <div className="flex-1 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">Team Banner</h3>
                <BannerUpload
                  bannerUrl={bannerPreview}
                  defaultBanner={defaultTeamCoverImage}
                  onUpload={handleBannerUpload}
                  onDelete={handleBannerDelete}
                  showDelete={!!bannerPreview}
                  height="h-40"
                  alt="Team Banner"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-end">
            <Button type="button" onClick={handleCancel} variant="primary" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
              Create Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { Users, MapPin, FileText, Upload, Globe, User, Phone, Mail, Plus, Trash2, Stethoscope } from "lucide-react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import RadioGroup from "../../components/ui/RadioGroup";
import BackButton from "../../components/ui/BackButton";
import AvatarUpload from "../../components/ui/AvatarUpload";
import BannerUpload from "../../components/ui/BannerUpload";
import { fetchAllSports } from "../../store/slices/sportSlice";
import { clearError, fetchAllTeams } from "../../store/slices/teamSlice";
import axios from "axios";
import toast from "react-hot-toast";
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

const medicalRoleOptions = [
  "Physiotherapist",
  "Doctor",
  "Sports Therapist",
  "Nutritionist",
  "Trainer",
];

const CreateTeam = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sports } = useSelector((state) => state.sport);
  const [error, setError] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicalTeam, setMedicalTeam] = useState([]);
  const [medicalMember, setMedicalMember] = useState({ name: "", phone: "", email: "", role: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    reset,
  } = useForm({
    mode: "onChange",
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
    ...(sports?.filter(sport => sport.teamBased).map((sport) => ({ value: sport._id, label: sport.name })) || []),
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

      // Coach data
      const coachData = {
        name: data.coachName || "",
        phone: data.coachPhone || "",
        email: data.coachEmail || "",
        experience: data.coachExperience || "",
      };
      if (coachData.name) {
        formData.append("coach", JSON.stringify(coachData));
      }

      // Medical team data
      if (medicalTeam.length > 0) {
        formData.append("medicalTeam", JSON.stringify(medicalTeam));
      }

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

      toast.success("Team created successfully!");
      dispatch(fetchAllTeams());
      setTimeout(() => navigate("/manager/teams"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Sport"
                  options={sportOptions}
                  icon={<Users size={18} />}
                  error={errors.sport?.message}
                  {...register("sport", {
                    required: "Please select a sport",
                  })}
                />

                <Input
                  label="City (Optional)"
                  type="text"
                  placeholder="Enter city name"
                  icon={<MapPin size={18} />}
                  error={errors.city?.message}
                  {...register("city", {
                    minLength: { value: 2, message: "City must be at least 2 characters" },
                    maxLength: { value: 20, message: "City must be under 20 characters" },
                    pattern: {
                      value: /^[a-zA-Z\s'-]+$/,
                      message: "City can only contain letters and spaces",
                    },
                  })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </div>

          {/* Coach Information */}
          <div className="bg-card-background dark:bg-card-background-dark rounded-2xl p-8 shadow-md">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6 flex items-center gap-2">
              <User size={20} className="text-secondary" />
              Coach Information (Optional)
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Coach Name"
                  type="text"
                  placeholder="Enter coach name"
                  icon={<User size={18} />}
                  error={errors.coachName?.message}
                  {...register("coachName", {
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                    maxLength: { value: 25, message: "Name must be under 25 characters" },
                    pattern: {
                      value: /^[a-zA-Z\s'.]+$/,
                      message: "Name can only contain letters, spaces, and apostrophes",
                    },
                  })}
                />
                <Input
                  label="Coach Phone"
                  type="tel"
                  placeholder="Enter phone number"
                  icon={<Phone size={18} />}
                  error={errors.coachPhone?.message}
                  {...register("coachPhone", {
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Phone must be 10 digits",
                    },
                  })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Coach Email"
                  type="email"
                  placeholder="Enter email address"
                  icon={<Mail size={18} />}
                  error={errors.coachEmail?.message}
                  {...register("coachEmail", {
                    maxLength: { value: 50, message: "Email must be under 50 characters" },
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />
                <Input
                  label="Experience"
                  type="text"
                  placeholder="e.g., 5 years"
                  icon={<FileText size={18} />}
                  error={errors.coachExperience?.message}
                  {...register("coachExperience", {
                    maxLength: { value: 50, message: "Experience must be under 50 characters" },
                  })}
                />
              </div>
            </div>
          </div>

          {/* Medical Team */}
          <div className="bg-card-background dark:bg-card-background-dark rounded-2xl p-8 shadow-md">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6 flex items-center gap-2">
              <Stethoscope size={20} className="text-secondary" />
              Medical Team (Optional)
            </h2>

            {/* Existing members */}
            {medicalTeam.length > 0 && (
              <div className="space-y-3 mb-6">
                {medicalTeam.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-primary dark:bg-primary-dark rounded-xl border border-base-dark dark:border-base"
                  >
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-base dark:text-base-dark text-xs">Name</span>
                        <p className="font-medium text-text-primary dark:text-text-primary-dark">{member.name}</p>
                      </div>
                      <div>
                        <span className="text-base dark:text-base-dark text-xs">Role</span>
                        <p className="font-medium text-text-primary dark:text-text-primary-dark">{member.role}</p>
                      </div>
                      <div>
                        <span className="text-base dark:text-base-dark text-xs">Phone</span>
                        <p className="font-medium text-text-primary dark:text-text-primary-dark">{member.phone || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-base dark:text-base-dark text-xs">Email</span>
                        <p className="font-medium text-text-primary dark:text-text-primary-dark truncate">{member.email || "N/A"}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMedicalTeam(medicalTeam.filter((_, i) => i !== index))}
                      className="ml-3 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new member form */}
            {medicalTeam.length < 5 && (
              <div className="space-y-4 p-4 border-2 border-dashed border-base-dark dark:border-base rounded-xl">
                <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">Add Medical Staff</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">Name *</label>
                    <input
                      type="text"
                      value={medicalMember.name}
                      onChange={(e) => setMedicalMember({ ...medicalMember, name: e.target.value })}
                      placeholder="Staff name"
                      className="w-full px-4 py-2.5 bg-card-background dark:bg-card-background-dark rounded-lg border border-base-dark dark:border-base focus:outline-none text-text-primary dark:text-text-primary-dark text-sm"
                      maxLength={25}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">Role *</label>
                    <select
                      value={medicalMember.role}
                      onChange={(e) => setMedicalMember({ ...medicalMember, role: e.target.value })}
                      className="w-full px-4 py-2.5 bg-card-background dark:bg-card-background-dark rounded-lg border border-base-dark dark:border-base focus:outline-none text-text-primary dark:text-text-primary-dark text-sm"
                    >
                      <option value="">Select Role</option>
                      {medicalRoleOptions.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">Phone</label>
                    <input
                      type="tel"
                      value={medicalMember.phone}
                      onChange={(e) => setMedicalMember({ ...medicalMember, phone: e.target.value })}
                      placeholder="10-digit phone"
                      className="w-full px-4 py-2.5 bg-card-background dark:bg-card-background-dark rounded-lg border border-base-dark dark:border-base focus:outline-none text-text-primary dark:text-text-primary-dark text-sm"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">Email</label>
                    <input
                      type="email"
                      value={medicalMember.email}
                      onChange={(e) => setMedicalMember({ ...medicalMember, email: e.target.value })}
                      placeholder="Email address"
                      className="w-full px-4 py-2.5 bg-card-background dark:bg-card-background-dark rounded-lg border border-base-dark dark:border-base focus:outline-none text-text-primary dark:text-text-primary-dark text-sm"
                      maxLength={50}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!medicalMember.name || !medicalMember.role) return;
                    setMedicalTeam([...medicalTeam, { ...medicalMember }]);
                    setMedicalMember({ name: "", phone: "", email: "", role: "" });
                  }}
                  disabled={!medicalMember.name || !medicalMember.role}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-semibold"
                >
                  <Plus size={16} />
                  Add Staff Member
                </button>
              </div>
            )}
            {medicalTeam.length >= 5 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">Maximum 5 medical staff members reached.</p>
            )}
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
            <Button type="button" onClick={handleCancel} variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={!isValid || isSubmitting}>
              Create Team
            </Button>
          </div>
        </form>
    </div>
  );
};

export default CreateTeam;

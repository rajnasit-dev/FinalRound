import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, MapPin, Save, X, Ruler, Weight, Plus } from "lucide-react";
import toast from "react-hot-toast";
import AddAchievements from "../../components/ui/AddAchievements";
import SportsRolesInput from "../../components/ui/SportsRolesInput";
import { updatePlayerProfile, fetchPlayerProfile, clearError } from "../../store/slices/playerSlice";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";

const EditPlayerProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, loading } = useSelector((state) => state.player);
  const [error, setError] = useState(null);

  // Fetch latest player profile on mount
  useEffect(() => {
    dispatch(fetchPlayerProfile());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    setValue,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      bio: "",
      dateOfBirth: "",
      gender: "",
      height: "",
      weight: "",
      sports: [],
    },
  });

  const selectedSports = watch("sports");
  
  const [achievements, setAchievements] = useState([]);
  const [currentAchievement, setCurrentAchievement] = useState({ title: "", year: "" });
  const [achievementError, setAchievementError] = useState("");

  // Update form when profile data is loaded from database
  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        city: profile.city || "",
        bio: profile.bio || "",
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
        gender: profile.gender || "",
        height: profile.height || "",
        weight: profile.weight || "",
        sports: profile.sports || [],
      });
      setAchievements(profile.achievements || []);
    }
  }, [profile, reset]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      setError(null);
      reset();
    };
  }, [dispatch, reset]);

  const genderOptions = ["Male", "Female", "Other"];

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
    
    try {
      // Format sports data for backend
      const formattedSports = data.sports.map(s => ({
        sport: typeof s.sport === 'object' ? s.sport._id : s.sport,
        role: s.role
      }));

      const dataToSubmit = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        city: data.city || undefined,
        bio: data.bio || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender || undefined,
        height: data.height || undefined,
        weight: data.weight || undefined,
        sports: formattedSports,
        achievements: achievements,
      };

      await dispatch(updatePlayerProfile(dataToSubmit)).unwrap();
      await dispatch(fetchPlayerProfile());
      toast.success("Profile updated successfully!");
      
      setTimeout(() => {
        navigate("/player/profile");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/player/profile");
  };

  // Show loading spinner while fetching profile
  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            Edit Profile
          </h1>
          <p className="text-base dark:text-base-dark mt-2">
            Update your profile information
          </p>
        </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-2xl p-8 shadow-md">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base dark:text-base-dark"
                  size={18}
                />
                <input
                  type="text"
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Full name must be at least 2 characters",
                    },
                    maxLength: {
                      value: 25,
                      message: "Full name must be under 25 characters",
                    },
                  })}
                  className="w-full pl-10 pr-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base dark:text-base-dark"
                  size={18}
                />
                <input
                  type="email"
                  {...register("email")}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Phone
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base dark:text-base-dark"
                  size={18}
                />
                <input
                  type="tel"
                  {...register("phone", {
                    pattern: {
                      value: /^\+?[0-9]{7,15}$/,
                      message: "Enter a valid phone number",
                    },
                  })}
                  className="w-full pl-10 pr-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                City
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base dark:text-base-dark"
                  size={18}
                />
                <input
                  type="text"
                  {...register("city", {
                    minLength: {
                      value: 2,
                      message: "City must be at least 2 characters",
                    },
                    maxLength: {
                      value: 20,
                      message: "City must be under 20 characters",
                    },
                    pattern: {
                      value: /^[a-zA-Z\s'-]+$/,
                      message: "City can only contain letters and spaces",
                    },
                  })}
                  className="w-full pl-10 pr-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark"
                />
              </div>
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                {...register("dateOfBirth", {
                  required: "Date of birth is required",
                  validate: {
                    notFuture: (value) => {
                      if (!value) return true;
                      const dob = new Date(value);
                      const today = new Date();
                      return dob <= today || "Date of birth cannot be in the future";
                    },
                    minAge: (value) => {
                      if (!value) return true;
                      const dob = new Date(value);
                      const today = new Date();
                      const age = today.getFullYear() - dob.getFullYear();
                      return age >= 5 || "You must be at least 5 years old";
                    },
                  },
                })}
                className="w-full px-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark"
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Gender
              </label>
              <select
                {...register("gender", {
                  validate: (value) =>
                    !value || genderOptions.includes(value) || "Select a valid gender option",
                })}
                className="w-full px-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark"
              >
                <option value="">Select gender</option>
                {genderOptions.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Height (ft)
              </label>
              <div className="relative">
                <Ruler
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base dark:text-base-dark"
                  size={18}
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 5.8, 6.2"
                  {...register("height", {
                    min: { value: 3, message: "Height must be at least 3 ft" },
                    max: { value: 8, message: "Height must be at most 8 ft" },
                  })}
                  className="w-full pl-10 pr-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark"
                />
              </div>
              {errors.height && (
                <p className="text-red-500 text-xs mt-1">{errors.height.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Weight (kg)
              </label>
              <div className="relative">
                <Weight
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base dark:text-base-dark"
                  size={18}
                />
                <input
                  type="number"
                  placeholder="e.g., 70"
                  {...register("weight", {
                    min: { value: 30, message: "Weight must be at least 30 kg" },
                    max: { value: 200, message: "Weight must be under 200 kg" },
                  })}
                  className="w-full pl-10 pr-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark"
                />
              </div>
              {errors.weight && (
                <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
              Bio
            </label>
            <textarea
              {...register("bio", {
                maxLength: {
                  value: 500,
                  message: "Bio must be under 500 characters",
                },
              })}
              rows={4}
              className="w-full px-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark resize-none"
              placeholder="Tell us about yourself..."
            />
            {errors.bio && (
              <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>
            )}
          </div>
        </div>

        {/* Sports Section */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-2xl p-8 shadow-md">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
            Sports & Roles
          </h2>
          <SportsRolesInput
            value={selectedSports}
            onChange={(newSports) => setValue("sports", newSports)}
          />
        </div>

        {/* Achievements */}
        <AddAchievements
          achievements={achievements}
          onAddAchievement={handleAddAchievement}
          onRemoveAchievement={handleRemoveAchievement}
          currentAchievement={currentAchievement}
          onCurrentAchievementChange={handleAchievementChange}
          achievementError={achievementError}
          title="Achievements"
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            onClick={handleCancel}
            variant="secondary"
          >
            <X size={18} />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting || loading}
            loading={isSubmitting || loading}
            className="bg-secondary dark:bg-secondary-dark hover:opacity-90 px-6 py-3 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditPlayerProfile;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, MapPin, Save, X, Ruler, Weight, Plus } from "lucide-react";
import AddAchievements from "../../components/ui/AddAchievements";
import SportsRolesInput from "../../components/ui/SportsRolesInput";
import { updatePlayerProfile, fetchPlayerProfile, clearError } from "../../store/slices/playerSlice";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";

const EditPlayerProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.player);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      city: user?.city || "",
      bio: user?.bio || "",
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
      gender: user?.gender || "",
      height: user?.height || "",
      weight: user?.weight || "",
      sports: user?.sports || [],
    },
  });

  const selectedSports = watch("sports");
  
  const [achievements, setAchievements] = useState(user?.achievements || []);
  const [currentAchievement, setCurrentAchievement] = useState({ title: "", year: "" });
  const [achievementError, setAchievementError] = useState("");

  // Clear form on mount (page refresh) - reset to user data
  useEffect(() => {
    reset({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      city: user?.city || "",
      bio: user?.bio || "",
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
      gender: user?.gender || "",
      height: user?.height || "",
      weight: user?.weight || "",
      sports: user?.sports || [],
    });
    setAchievements(user?.achievements || []);
  }, [user, reset]);

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
    setSuccess(false);
    
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
      setSuccess(true);
      
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

  return (
    <div className="min-h-screen bg-primary dark:bg-primary-dark py-8">
      <div className="max-w-4xl mx-auto px-4">
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

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-600 dark:text-green-400 text-sm">Profile updated successfully! Redirecting...</p>
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
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full pl-10 pr-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
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
                      value: 60,
                      message: "City must be under 60 characters",
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
                Height (cm)
              </label>
              <div className="relative">
                <Ruler
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base dark:text-base-dark"
                  size={18}
                />
                <input
                  type="number"
                  {...register("height", {
                    min: { value: 1, message: "Height must be positive" },
                    max: { value: 300, message: "Height must be realistic" },
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
                  {...register("weight", {
                    min: { value: 1, message: "Weight must be positive" },
                    max: { value: 500, message: "Weight must be realistic" },
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
        <div className="flex items-center gap-4 justify-end">
          <Button
            type="button"
            onClick={handleCancel}
            variant="primary"
            className="w-auto!"
          >
            <X size={18} />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || loading}
            loading={isSubmitting || loading}
            variant="primary"
            className="w-auto!"
          >
            <Save size={18} />
            Save Changes
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default EditPlayerProfile;

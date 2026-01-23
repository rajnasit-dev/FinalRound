import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { Users, MapPin, FileText, Upload, Globe } from "lucide-react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import RadioGroup from "../../components/ui/RadioGroup";
import { fetchAllSports } from "../../store/slices/sportSlice";
import { clearError } from "../../store/slices/teamSlice";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const CreateTeam = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sports } = useSelector((state) => state.sport);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
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
      openToJoin: "true",
    },
  });

  useEffect(() => {
    dispatch(fetchAllSports());
  }, [dispatch]);

  // Clear form on mount (page refresh)
  useEffect(() => {
    reset({
      name: "",
      sport: "",
      city: "",
      description: "",
      openToJoin: "true",
    });
  }, [reset]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      setError(null);
      reset();
    };
  }, [dispatch, reset]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setLogoFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("sport", data.sport);
      if (data.city) formData.append("city", data.city);
      if (data.description) formData.append("description", data.description);
      formData.append("openToJoin", data.openToJoin === "true");
      
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await axios.post(`${API_BASE_URL}/teams`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/manager/teams");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/manager/teams");
  };

  // Prepare sport options for Select component
  const sportOptions = [
    { value: "", label: "Select a sport" },
    ...(sports || []).map((sport) => ({
      value: sport._id,
      label: sport.name,
    })),
  ];

  const openToJoinOptions = [
    { value: "true", label: "Yes, open to join requests" },
    { value: "false", label: "No, closed team" },
  ];

  return (
    <div className="min-h-screen bg-primary dark:bg-primary-dark py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            Create New Team
          </h1>
          <p className="text-base dark:text-base-dark mt-2">
            Set up your team profile and start recruiting players
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
              <p className="text-green-600 dark:text-green-400 text-sm">
                Team created successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-card-background dark:bg-card-background-dark rounded-2xl p-8 shadow-md">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
              Team Information
            </h2>
            <div className="space-y-6">
              {/* Team Name */}
              <Input
                label="Team Name"
                type="text"
                placeholder="Enter team name"
                icon={<Users size={18} />}
                error={errors.name?.message}
                {...register("name", {
                  required: "Team name is required",
                  minLength: {
                    value: 2,
                    message: "Team name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Team name must be under 50 characters",
                  },
                })}
              />

              {/* Sport Selection */}
              <Select
                label="Sport"
                options={sportOptions}
                icon={<Users size={18} />}
                error={errors.sport?.message}
                {...register("sport", {
                  required: "Please select a sport",
                })}
              />

              {/* City */}
              <Input
                label="City (Optional)"
                type="text"
                placeholder="Enter city name"
                icon={<MapPin size={18} />}
                error={errors.city?.message}
                {...register("city", {
                  minLength: {
                    value: 2,
                    message: "City must be at least 2 characters",
                  },
                  maxLength: {
                    value: 60,
                    message: "City must be under 60 characters",
                  },
                })}
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                  Description (Optional)
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-3 text-base dark:text-base-dark"
                    size={18}
                  />
                  <textarea
                    placeholder="Tell us about your team..."
                    {...register("description", {
                      maxLength: {
                        value: 500,
                        message: "Description must be under 500 characters",
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

              {/* Open to Join */}
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

          {/* Team Logo */}
          <div className="bg-card-background dark:bg-card-background-dark rounded-2xl p-8 shadow-md">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
              Team Logo (Optional)
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-6">
                {/* Preview */}
                <div className="shrink-0">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-base-dark dark:border-base flex items-center justify-center overflow-hidden bg-primary dark:bg-primary-dark">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="w-12 h-12 text-base dark:text-base-dark" />
                    )}
                  </div>
                </div>

                {/* Upload Section */}
                <div className="flex-1">
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 dark:bg-secondary-dark dark:hover:bg-secondary-dark/90 text-white rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    <Upload size={18} />
                    Choose Logo
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  {logoFile && (
                    <p className="text-sm text-secondary dark:text-secondary-dark mt-1">
                      Selected: {logoFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 justify-end">
            <Button
              type="button"
              onClick={handleCancel}
              variant="primary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;

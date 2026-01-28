import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, MapPin, Save, X } from "lucide-react";
import { updateUserProfile, clearError } from "../../store/slices/authSlice";
import Spinner from "../../components/ui/Spinner";
import Container from "../../components/container/Container";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";

const EditOrganizerProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      city: user?.city || "",
    },
  });

  // Clear form on mount (page refresh) - reset to user data
  useEffect(() => {
    reset({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      city: user?.city || "",
    });
  }, [user, reset]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      setError(null);
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(false);

    try {
      const dataToSubmit = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        city: data.city || undefined,
      };

      await dispatch(updateUserProfile(dataToSubmit)).unwrap();
      setSuccess(true);

      setTimeout(() => {
        navigate("/organizer/profile");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/organizer/profile");
  };

  if (!user || loading) {
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
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Edit Profile
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          Update your profile information
        </p>
      </div>

      <Container>
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
                Profile updated successfully! Redirecting...
              </p>
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
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                  Email Address
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
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base dark:text-base-dark"
                    size={18}
                  />
                  <input
                    type="tel"
                    {...register("phone")}
                    className="w-full pl-10 pr-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                  City (Optional)
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base dark:text-base-dark"
                    size={18}
                  />
                  <input
                    type="text"
                    {...register("city")}
                    className="w-full pl-10 pr-4 py-3 bg-primary dark:bg-primary-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
              disabled={isSubmitting || loading}
              className="bg-secondary dark:bg-secondary-dark hover:opacity-90 px-6 py-3 flex items-center justify-center gap-2"
            >
              {isSubmitting || loading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
};

export default EditOrganizerProfile;

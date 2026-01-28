import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Lock, Eye, EyeOff, Save, X } from "lucide-react";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";
import axios from "axios";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(false);

    // Check if new password matches confirm password
    if (data.newPassword !== data.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        { withCredentials: true }
      );

      setSuccess(true);
      reset();

      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to change password. Please try again."
      );
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-primary dark:bg-primary-dark p-6">
      <div className="max-w-2xl mx-auto">
        <BackButton />

        <div className="bg-card-background dark:bg-card-background-dark rounded-2xl shadow-lg p-8 mt-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
                Change Password
              </h1>
              <p className="text-base dark:text-base-dark mt-1">
                Update your account password
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm">
                Password changed successfully! Redirecting...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base dark:text-base-dark" />
                </div>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  {...register("currentPassword", {
                    required: "Current password is required",
                  })}
                  className="w-full pl-10 pr-10 py-3 border border-base-dark dark:border-base rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent bg-white dark:bg-gray-800 text-text-primary dark:text-text-primary-dark"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5 text-base dark:text-base-dark hover:text-text-primary dark:hover:text-text-primary-dark" />
                  ) : (
                    <Eye className="h-5 w-5 text-base dark:text-base-dark hover:text-text-primary dark:hover:text-text-primary-dark" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base dark:text-base-dark" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="w-full pl-10 pr-10 py-3 border border-base-dark dark:border-base rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent bg-white dark:bg-gray-800 text-text-primary dark:text-text-primary-dark"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-base dark:text-base-dark hover:text-text-primary dark:hover:text-text-primary-dark" />
                  ) : (
                    <Eye className="h-5 w-5 text-base dark:text-base-dark hover:text-text-primary dark:hover:text-text-primary-dark" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base dark:text-base-dark" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Please confirm your new password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                  className="w-full pl-10 pr-10 py-3 border border-base-dark dark:border-base rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent bg-white dark:bg-gray-800 text-text-primary dark:text-text-primary-dark"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-base dark:text-base-dark hover:text-text-primary dark:hover:text-text-primary-dark" />
                  ) : (
                    <Eye className="h-5 w-5 text-base dark:text-base-dark hover:text-text-primary dark:hover:text-text-primary-dark" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1 flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Change Password
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;

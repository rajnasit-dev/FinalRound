import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Lock, Eye, EyeOff, Save, X } from "lucide-react";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/change-password`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        { withCredentials: true }
      );

      toast.success("Password changed successfully!");
      reset();

      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to change password. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
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
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    maxLength: {
                      value: 64,
                      message: "Password must be under 64 characters",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
                      message: "Password must include uppercase, lowercase, number, and special character (@$!%*?&#)",
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
              <p className="mt-1 text-xs text-base dark:text-base-dark">
                Must be 8-64 characters with uppercase, lowercase, number, and special character
              </p>
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
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-3 flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <X size={18} />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="bg-secondary dark:bg-secondary-dark hover:opacity-90 px-6 py-3 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;

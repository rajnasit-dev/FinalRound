import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Container from "../../components/container/Container";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/auth/reset-password/${token}`,
        { password: data.password },
        { withCredentials: true }
      );

      toast.success("Password reset successful!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to reset password. The link may have expired. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-dark mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <Container>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-text-primary dark:text-text-primary-dark">
              Reset Password
            </h1>
            <p className="text-text-secondary dark:text-text-secondary-dark">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* New Password */}
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                icon={<Lock size={20} />}
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  maxLength: {
                    value: 64,
                    message: "Password must be under 64 characters",
                  },
                })}
              />

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm new password"
                icon={<Lock size={20} />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />

              {/* Error Message */}
              <ErrorMessage message={error} type="error" />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={!token}
              >
                Reset Password
              </Button>
            </form>
        </Container>

        {/* Additional Help */}
        
          <p className="text-center mt-6 text-text-secondary dark:text-text-secondary-dark text-sm">
            Didn't receive the email?{" "}
            <Link
              to="/forgot-password"
              className="text-primary dark:text-primary-dark hover:underline font-semibold"
            >
              Resend link
            </Link>
          </p>
      </div>
    </div>
  );
};

export default ResetPassword;

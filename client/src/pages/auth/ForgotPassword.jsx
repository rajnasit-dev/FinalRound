import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import axios from "axios";
import Container from "../../components/container/Container";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        { email: data.email },
        { withCredentials: true }
      );

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
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
          className="inline-flex items-center gap-2 text-text-primary dark:text-text-primary-dark hover:text-primary dark:hover:text-primary-dark mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <Container>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-text-primary dark:text-text-primary-dark">
              Forgot Password?
            </h1>
            <p className="text-text-primary dark:text-text-primary-dark">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <Input
                label="Email Address"
                type="email"
                placeholder="your.email@example.com"
                icon={<Mail size={20} />}
                error={errors.email?.message}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />

              {/* Error Message */}
              <ErrorMessage message={error} type="error" />

              {/* Submit Button */}
              <Button type="submit" variant="primary" loading={loading}>
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
                Check Your Email
              </h3>
              <p className="text-text-primary dark:text-text-primary-dark mb-6">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
              <Button as={Link} to="/login" variant="primary">
                Back to Login
              </Button>
              </div>
              
          )}
        </Container>

        {/* Additional Help */}
        {!success && (
          <p className="text-center mt-6 text-text-primary dark:text-text-primary-dark text-sm">
            Remember your password?{" "}
            <Link to="/login" className="text-secondary dark:text-primary-dark hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

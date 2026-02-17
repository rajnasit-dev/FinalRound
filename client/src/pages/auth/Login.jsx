import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Trophy } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { loginUser, clearError } from "../../store/slices/authSlice";
import { useEffect } from "react";
import loginImage from "../../assets/login.png";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Clear form on mount (page refresh)
  useEffect(() => {
    reset({
      email: "",
      password: "",
    });
  }, [reset]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      reset();
    };
  }, [dispatch, reset]);

  // Handle form submission
  const onSubmit = async (data) => {
    // Always call backend to set cookies
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      // Let backend determine user's role from database
      // and navigate based on the returned user role
      const user = result.payload;
      const roleRoutes = {
        Admin: "/admin/dashboard",
        Player: "/player/tournaments",
        TeamManager: "/manager/teams",
        TournamentOrganizer: "/organizer/dashboard",
      };
      navigate(roleRoutes[user.role] || "/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-5xl bg-card-background dark:bg-card-background-dark rounded-2xl shadow-2xl border border-base-dark/10 dark:border-base/10 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Image */}
          <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
            <img
              src={loginImage}
              alt="Sports illustration"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            {/* Mobile branding */}
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">SportsHub</h2>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
                Welcome Back
              </h1>
              <p className="text-base dark:text-base-dark">
                Sign in to your account to continue
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" autoComplete="off">
              {/* Email */}
              <Input
                label="Email"
                type="email"
                placeholder="your.email@example.com"
                icon={<Mail size={20} />}
                error={errors.email?.message}
                autoComplete="off"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                  maxLength: {
                    value: 50,
                    message: "Email must be under 50 characters",
                  },
                })}
              />

              {/* Password */}
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                icon={<Lock size={20} />}
                error={errors.password?.message}
                autoComplete="new-password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  maxLength: {
                    value: 25,
                    message: "Password must be under 25 characters",
                  },
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
                    message:
                      "Password must include uppercase, lowercase, number, and special character (@$!%*?&#)",
                  },
                })}
              />

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-secondary hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Error Message */}
              <ErrorMessage message={error} type="error" />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={!isValid || loading}
              >
                Sign In
              </Button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center mt-8 text-base dark:text-base-dark">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-secondary hover:underline font-semibold"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

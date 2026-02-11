import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock } from "lucide-react";
import Container from "../../components/container/Container";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { loginUser, clearError } from "../../store/slices/authSlice";
import { useEffect } from "react";

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

  // Role options for dropdown
  const roleOptions = [
    { value: "Player", label: "Player" },
    { value: "TeamManager", label: "Team Manager" },
    { value: "TournamentOrganizer", label: "Tournament Organizer" },
    { value: "Admin", label: "Admin" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Login Card */}

        <Container className="mt-16">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
            <p className="text-base dark:text-base-dark">
              Sign in to your SportsHub account
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
                  value: 120,
                  message: "Email must be under 120 characters",
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
                  value: 64,
                  message: "Password must be under 64 characters",
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
              Login
            </Button>
          </form>
        </Container>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-base dark:text-base-dark">
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
  );
};

export default Login;

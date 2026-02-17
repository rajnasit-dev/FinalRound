import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { setUser } from "../../store/slices/authSlice";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
  Trophy,
  Building2,
  Ruler,
  Weight,
} from "lucide-react";
import Container from "../../components/container/Container";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import RadioGroup from "../../components/ui/RadioGroup";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";
import SportsRolesInput from "../../components/ui/SportsRolesInput";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [role, setRole] = useState("player");
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      city: "",
      dateOfBirth: "",
      gender: "",
      height: "",
      weight: "",
      orgName: "",
      sports: [],
    },
  });

  const selectedSports = watch("sports");

  // Register gender field for validation (used with RadioGroup + setValue)
  useEffect(() => {
    register("gender", { required: role === "player" ? "Gender is required" : false });
  }, [role, register]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  const roleOptions = [
    { value: "player", label: "Player" },
    { value: "manager", label: "Team Manager" },
    { value: "organizer", label: "Tournament Organizer" },
  ];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const onSubmit = async (data) => {
    setError(null);

    try {
      const fd = new FormData();
      fd.append("fullName", data.fullName);
      fd.append("email", data.email);
      fd.append("password", data.password);
      fd.append("phone", data.phone);
      fd.append("city", data.city);

      // Player-specific fields
      if (role === "player") {
        if (data.dateOfBirth) fd.append("dateOfBirth", data.dateOfBirth);
        if (data.gender) fd.append("gender", data.gender);
        if (data.height) fd.append("height", data.height);
        if (data.weight) fd.append("weight", data.weight);
        // Append selected sports with roles as JSON
        if (data.sports && data.sports.length > 0) {
          fd.append("sports", JSON.stringify(data.sports));
        }
      }

      // Organizer-specific fields
      if (role === "organizer") {
        if (data.orgName) fd.append("orgName", data.orgName);
      }

      const res = await fetch(`${API_BASE}/auth/${role}`, {
        method: "POST",
        body: fd,
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData?.message || "Registration failed");
      }

      const result = responseData?.data;

      // If OTP is not required, user is already verified & logged in
      if (result?.otpRequired === false && result?.user) {
        dispatch(setUser(result.user));
        const roleRoutes = {
          Player: "/player/tournaments",
          TeamManager: "/manager/teams",
          TournamentOrganizer: "/organizer/dashboard",
        };
        navigate(roleRoutes[result.user.role] || "/", { replace: true });
        return;
      }

      // OTP required — redirect to verify page
      navigate("/verify-email", {
        replace: true,
        state: { email: data.email },
      });
    } catch (err) {
      setError(err.message);
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl">
        <Container className="mt-16">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Create Your Account</h1>
            <p className="text-base dark:text-base-dark">
              Join SportsHub and connect with the sports community
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Account Type - Grid Layout */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      role === option.value
                        ? "border-secondary bg-secondary/10 dark:bg-secondary/20"
                        : "border-base-dark dark:border-base hover:border-secondary/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <User
                        className={`w-8 h-8 ${role === option.value ? "text-secondary" : "text-base dark:text-base-dark"}`}
                      />
                      <span
                        className={`font-semibold ${role === option.value ? "text-secondary" : "text-text-primary dark:text-text-primary-dark"}`}
                      >
                        {option.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Two Column Grid - Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                icon={<User size={20} />}
                error={errors.fullName?.message}
                required={true}
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
              />

              <Input
                label="Email"
                type="email"
                placeholder="jane@example.com"
                icon={<Mail size={20} />}
                error={errors.email?.message}
                required={true}
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

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={20} />}
                error={errors.password?.message}
                required={true}
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

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={20} />}
                error={errors.confirmPassword?.message}
                required={true}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                  maxLength: {
                    value: 25,
                    message: "Password must be under 25 characters",
                  },
                })}
              />

              <Input
                label="Phone"
                placeholder="555 555 1234"
                icon={<Phone size={20} />}
                error={errors.phone?.message}
                required={true}
                {...register("phone", {
                  required: "Phone is required",
                  pattern: {
                    value: /^\+?[0-9]{7,15}$/,
                    message: "Enter a valid phone number",
                  },
                })}
              />

              <Input
                label="City"
                placeholder="Ahmedabad"
                icon={<MapPin size={20} />}
                error={errors.city?.message}
                required={true}
                {...register("city", {
                  required: "City is required",
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
              />
            </div>

            {/* Player-specific fields */}
            {role === "player" && (
              <>
                {/* DOB + Gender in a row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Date of Birth"
                    type="date"
                    icon={<Calendar size={20} />}
                    error={errors.dateOfBirth?.message}
                    required={true}
                    {...register("dateOfBirth", {
                      required: "Date of birth is required",
                      validate: {
                        notFuture: (value) => {
                          if (!value) return true;
                          const dob = new Date(value);
                          const today = new Date();
                          return (
                            dob <= today ||
                            "Date of birth cannot be in the future"
                          );
                        },
                        minAge: (value) => {
                          if (!value) return true;
                          const dob = new Date(value);
                          const today = new Date();
                          let age = today.getFullYear() - dob.getFullYear();
                          const monthDiff = today.getMonth() - dob.getMonth();
                          if (
                            monthDiff < 0 ||
                            (monthDiff === 0 && today.getDate() < dob.getDate())
                          ) {
                            age--;
                          }
                          return age >= 18 || "You must be at least 18 years old";
                        },
                        maxAge: (value) => {
                          if (!value) return true;
                          const dob = new Date(value);
                          const today = new Date();
                          const age = today.getFullYear() - dob.getFullYear();
                          return (
                            age <= 120 || "Please enter a valid date of birth"
                          );
                        },
                      },
                    })}
                  />
                  <RadioGroup
                    label="Gender"
                    name="gender"
                    options={genderOptions}
                    error={errors.gender?.message}
                    value={watch("gender")}
                    onChange={(value) => setValue("gender", value, { shouldValidate: true })}
                    required={true}
                  />
                </div>

                {/* Height & Weight (optional) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Height in ft (optional)"
                    type="number"
                    placeholder="e.g. 5.9"
                    step="0.1"
                    icon={<Ruler size={20} />}
                    error={errors.height?.message}
                    {...register("height", {
                      min: {
                        value: 3,
                        message: "Height must be at least 3 ft",
                      },
                      max: {
                        value: 8,
                        message: "Height must be at most 8 ft",
                      },
                    })}
                  />
                  <Input
                    label="Weight in kg (optional)"
                    type="number"
                    placeholder="e.g. 70"
                    icon={<Weight size={20} />}
                    error={errors.weight?.message}
                    {...register("weight", {
                      min: {
                        value: 30,
                        message: "Weight must be at least 30 kg",
                      },
                      max: {
                        value: 200,
                        message: "Weight must be under 200 kg",
                      },
                    })}
                  />
                </div>

                {/* Sports Selection with Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sports & Playing Roles (optional - select multiple)
                  </label>
                  <SportsRolesInput
                    value={selectedSports}
                    onChange={(newSports) => setValue("sports", newSports)}
                  />
                </div>
              </>
            )}

            {/* Organizer-specific fields */}
            {role === "organizer" && (
              <Input
                label="Organization Name"
                placeholder="SportsHub Organization"
                icon={<Building2 size={20} />}
                error={errors.orgName?.message}
                required={true}
                {...register("orgName", {
                  required:
                    role === "organizer"
                      ? "Organization name is required"
                      : false,
                  maxLength: {
                    value: 120,
                    message: "Organization name must be under 120 characters",
                  },
                  minLength: {
                    value: 2,
                    message: "Organization name must be at least 2 characters",
                  },
                })}
              />
            )}

            {/* Error Display */}
            <ErrorMessage message={error} type="error" />

            {/* Submit Button */}
            <Button type="submit" loading={isSubmitting} variant="primary" disabled={!isValid || isSubmitting}>
              Create Account
            </Button>
          </form>
        </Container>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-base dark:text-base-dark">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-secondary hover:underline font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

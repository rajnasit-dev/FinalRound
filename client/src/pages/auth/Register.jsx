import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Upload,
  Calendar,
  Trophy,
  Building2,
  Image,
  X,
  Plus,
} from "lucide-react";
import Container from "../../components/container/Container";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import ErrorMessage from "../../components/ui/ErrorMessage";
import SportsRolesInput from "../../components/ui/SportsRolesInput";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("player");
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      city: "",
      avatar: null,
      coverImage: null,
      age: "",
      gender: "",
      orgName: "",
      sports: [],
    },
  });

  const selectedSports = watch("sports");

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
    { value: "", label: "Select gender" },
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
      if (data.phone) fd.append("phone", data.phone);
      if (data.city) fd.append("city", data.city);

      // Handle avatar file
      if (data.avatar && data.avatar[0]) {
        fd.append("avatar", data.avatar[0]);
      }

      // Handle coverImage file (only for player)
      if (role === "player" && data.coverImage && data.coverImage[0]) {
        fd.append("coverImage", data.coverImage[0]);
      }

      // Player-specific fields
      if (role === "player") {
        if (data.age) fd.append("age", data.age);
        if (data.gender) fd.append("gender", data.gender);
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

      // Pass email to verify page
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
              <label className="block text-sm font-medium mb-3">Account Type</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      role === option.value
                        ? 'border-secondary bg-secondary/10 dark:bg-secondary/20'
                        : 'border-base-dark dark:border-base hover:border-secondary/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <User className={`w-8 h-8 ${role === option.value ? 'text-secondary' : 'text-base dark:text-base-dark'}`} />
                      <span className={`font-semibold ${role === option.value ? 'text-secondary' : 'text-text-primary dark:text-text-primary-dark'}`}>
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
                {...register("fullName", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Full name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 100,
                    message: "Full name must be under 100 characters",
                  },
                })}
              />

              <Input
                label="Email"
                type="email"
                placeholder="jane@example.com"
                icon={<Mail size={20} />}
                error={errors.email?.message}
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

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
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

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={20} />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                  maxLength: {
                    value: 64,
                    message: "Password must be under 64 characters",
                  },
                })}
              />

              <Input
                label="Phone (optional)"
                placeholder="+1 555 555 1234"
                icon={<Phone size={20} />}
                error={errors.phone?.message}
                {...register("phone", {
                  pattern: {
                    value: /^\+?[0-9]{7,15}$/,
                    message: "Enter a valid phone number",
                  },
                })}
              />

              <Input
                label="City (optional)"
                placeholder="New York"
                icon={<MapPin size={20} />}
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
                  pattern: {
                    value: /^[a-zA-Z\s'-]+$/,
                    message: "City can only contain letters and spaces",
                  },
                })}
              />

              <Input
                label="Avatar (optional)"
                type="file"
                id="avatar"
                accept="image/*"
                icon={<Upload size={20} />}
                error={errors.avatar?.message}
                {...register("avatar", {
                  validate: {
                    fileSize: (files) =>
                      !files?.length || files[0].size <= MAX_IMAGE_SIZE || "Avatar must be 5MB or smaller",
                    fileType: (files) =>
                      !files?.length || ALLOWED_IMAGE_TYPES.includes(files[0].type) || "Avatar must be an image (jpg, png, webp)",
                  },
                })}
              />
            </div>

            {/* Player-specific fields */}
            {role === "player" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Cover Image (optional)"
                    type="file"
                    id="coverImage"
                    accept="image/*"
                    icon={<Image size={20} />}
                    error={errors.coverImage?.message}
                    {...register("coverImage", {
                      validate: {
                        fileSize: (files) =>
                          !files?.length || files[0].size <= MAX_IMAGE_SIZE || "Cover image must be 5MB or smaller",
                        fileType: (files) =>
                          !files?.length || ALLOWED_IMAGE_TYPES.includes(files[0].type) || "Cover image must be an image (jpg, png, webp)",
                      },
                    })}
                  />
                  <Input
                    label="Age (optional)"
                    type="number"
                    placeholder="18"
                    icon={<Calendar size={20} />}
                    error={errors.age?.message}
                    {...register("age", {
                      min: {
                        value: 1,
                        message: "Age must be positive",
                      },
                      max: {
                        value: 120,
                        message: "Age must be realistic",
                      },
                    })}
                  />
                </div>

                {/* Gender Selection */}
                <div>
                  <Select
                    label="Gender (optional)"
                    options={genderOptions}
                    error={errors.gender?.message}
                    {...register("gender", {
                      validate: (value) =>
                        !value || ["Male", "Female", "Other"].includes(value) || "Select a valid gender option",
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
                {...register("orgName", {
                  required:
                    role === "organizer"
                      ? "Organization name is required"
                      : false,
                  maxLength: {
                    value: 120,
                    message: "Organization name must be under 120 characters",
                  },
                })}
              />
            )}

            {/* Error Display */}
            <ErrorMessage message={error} type="error" />

            {/* Submit Button */}
            <Button type="submit" loading={isSubmitting} variant="primary">
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

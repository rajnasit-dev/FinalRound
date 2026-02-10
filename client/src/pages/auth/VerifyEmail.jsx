import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Mail, ShieldCheck, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Container from "../../components/container/Container";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import BackButton from "../../components/ui/BackButton";
import { verifyEmail, resendOTP, clearError } from "../../store/slices/authSlice";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: location.state?.email || "",
      otp: "",
    },
  });

  // Clear form on mount (page refresh)
  useEffect(() => {
    reset({
      email: location.state?.email || "",
      otp: "",
    });
  }, [reset, location.state?.email]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      reset();
    };
  }, [dispatch, reset]);

  const onSubmit = async (data) => {
    const emailValue = location.state?.email || watch("email");
    const result = await dispatch(verifyEmail({ email: emailValue, otp: data.otp }));

    if (verifyEmail.fulfilled.match(result)) {
      toast.success("Email verified successfully!");
      
      // Redirect after successful verification based on role
      setTimeout(() => {
        const roleRoutes = {
          Player: "/player/tournaments",
          TeamManager: "/manager/teams",
          TournamentOrganizer: "/organizer/dashboard",
        };
        const redirectRoute = roleRoutes[result.payload?.role] || "/";
        navigate(redirectRoute, { replace: true });
      }, 2000);
    }
  };

  const handleResendOTP = async () => {
    const emailValue = location.state?.email || watch("email");
    
    if (!emailValue) {
      return;
    }

    const result = await dispatch(resendOTP(emailValue));
    
    if (resendOTP.fulfilled.match(result)) {
      toast.success("Verification code has been resent to your email!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Container>
          <BackButton className="mb-6" />
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="bg-secondary/10 p-4 rounded-full">
                <Mail className="text-secondary" size={40} />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-base dark:text-base-dark mb-2">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-secondary font-semibold text-lg">
              {location.state?.email || watch("email")}
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Verification Code"
              type="text"
              placeholder="Enter 6-digit code"
              icon={<ShieldCheck size={20} />}
              error={errors.otp?.message}
              {...register("otp", {
                required: "Verification code is required",
                pattern: {
                  value: /^\d{6}$/,
                  message: "Code must be exactly 6 digits",
                },
                minLength: {
                  value: 6,
                  message: "Code must be exactly 6 digits",
                },
                maxLength: {
                  value: 6,
                  message: "Code must be exactly 6 digits",
                },
              })}
              maxLength={6}
            />

            <ErrorMessage message={error} type="error" />

            <Button type="submit" loading={loading} variant="primary" disabled={!isValid || loading}>
              <span className="flex items-center justify-center gap-2">
                Verify Email
                <ArrowRight size={18} />
              </span>
            </Button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-base dark:text-base-dark text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-secondary hover:underline font-semibold text-sm"
            >
              Resend verification code
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-accent/10 border border-accent/30 rounded-lg p-4">
            <p className="text-sm text-base dark:text-base-dark">
              <strong>Note:</strong> The verification code expires in 5 minutes. Make sure to verify your email before it expires.
            </p>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default VerifyEmail;
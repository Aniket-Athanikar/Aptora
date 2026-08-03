"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Input, GlassCard } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { BrandHeader } from "../login/components/BrandHeader";
import { getPasswordStrength } from "../login/components/getPasswordStrength";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const signupSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { login, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState<"signup" | "verify-otp">("signup");
  const [emailForVerification, setEmailForVerification] = useState("");
  const [nameForSignup, setNameForSignup] = useState("");
  const phoneForOTP = "+91 98765 43210";
  const [otpTimer, setOtpTimer] = useState(90);
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [csrfToken] = useState(() =>
    typeof window !== "undefined"
      ? Math.random().toString(36).substring(2) + Date.now().toString(36)
      : ""
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [mounted, isAuthenticated, redirectTo, router]);

  // OTP Timer countdown
  useEffect(() => {
    if (step !== "verify-otp") return;
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  // Fetch latest OTP automatically in development
  useEffect(() => {
    if (step !== "verify-otp") return;
    if (!emailForVerification) return;

    const fetchLatestOtp = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/latest-otp?email=${encodeURIComponent(emailForVerification)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.otp) {
            setOtpValues(data.otp.split(""));
          }
        }
      } catch (e) {
        console.warn("Could not retrieve latest dev OTP:", e);
      }
    };

    fetchLatestOtp();
    const interval = setInterval(fetchLatestOtp, 2500);
    return () => clearInterval(interval);
  }, [step, emailForVerification]);

  // Clear retrieved code when timer expires
  useEffect(() => {
    if (otpTimer <= 0) {
      setOtpValues(Array(6).fill(""));
    }
  }, [otpTimer]);

  const onSignupSubmit = async (data: SignupValues) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          confirm_password: data.confirmPassword,
          phone: phoneForOTP,
          skip_email: false,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setEmailForVerification(data.email);
        setNameForSignup(data.name);
        setOtpValues(Array(6).fill(""));
        setOtpTimer(90);
        setStep("verify-otp");
      } else {
        setAuthError(result.detail || "Signup failed.");
      }
    } catch {
      setAuthError("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    const code = otpValues.join("");
    if (code.length !== 6) {
      setAuthError("Please fill out the complete 6-digit OTP code.");
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          otp: code,
          email: emailForVerification,
          phone: phoneForOTP,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setAuthSuccess("✓ Verified! Redirecting...");
        login({
          name: result.name || nameForSignup || emailForVerification.split("@")[0],
          email: emailForVerification,
        });
        setTimeout(() => {
          router.push(redirectTo);
        }, 1200);
      } else {
        setAuthError(result.detail || "Invalid OTP code. Please try again.");
      }
    } catch {
      setAuthError("Connection error while validating security token.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newValues = [...otpValues];
    newValues[index] = val.slice(-1);
    setOtpValues(newValues);
    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const watchedSignupPassword = watch("password") || "";

  return (
    <AuthLayout>
      {step === "signup" ? (
        <GlassCard className="p-8 bg-white/75 border-[#ECECEC] rounded-[32px] shadow-2xl flex flex-col gap-6">
          <BrandHeader />

          <div className="flex flex-col items-center text-center gap-1">
            <h2 className="text-2xl font-black text-neutral-900 leading-none">
              Create Account
            </h2>
            <p className="text-xs text-neutral-500 font-semibold">
              Start your exam preparation journey
            </p>
          </div>

          {authError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
              <Info className="w-4 h-4 shrink-0" /> {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSignupSubmit)} className="flex flex-col gap-4">
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                {...register("name")}
                type="text"
                placeholder="Full Name"
                className="pl-10 h-12 rounded-xl border-[#ECECEC] bg-white/50 text-sm font-medium focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]"
              />
              {errors.name && (
                <p className="text-[10px] text-red-500 font-bold mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                {...register("email")}
                type="email"
                placeholder="Email address"
                autoComplete="username"
                className="pl-10 h-12 rounded-xl border-[#ECECEC] bg-white/50 text-sm font-medium focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]"
              />
              {errors.email && (
                <p className="text-[10px] text-red-500 font-bold mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 chars)"
                autoComplete="new-password"
                className="pl-10 pr-10 h-12 rounded-xl border-[#ECECEC] bg-white/50 text-sm font-medium focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {errors.password && (
                <p className="text-[10px] text-red-500 font-bold mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {watchedSignupPassword && (
              <div className="flex flex-col gap-1.5 -mt-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-neutral-500">Password Strength:</span>
                  <span className={getPasswordStrength(watchedSignupPassword).text}>
                    {getPasswordStrength(watchedSignupPassword).label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden">
                  {[1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        getPasswordStrength(watchedSignupPassword).score >= index
                          ? getPasswordStrength(watchedSignupPassword).color
                          : "bg-neutral-200"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                autoComplete="new-password"
                className="pl-10 pr-10 h-12 rounded-xl border-[#ECECEC] bg-white/50 text-sm font-medium focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {errors.confirmPassword && (
                <p className="text-[10px] text-red-500 font-bold mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] hover:shadow-lg hover:shadow-purple-500/20 text-white font-bold py-3.5 h-12 rounded-2xl shadow-md transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="animate-spin w-4 h-4" /> Creating...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-xs font-semibold text-neutral-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#6D4AFF] font-bold hover:underline cursor-pointer"
            >
              Sign In
            </Link>
          </p>
        </GlassCard>
      ) : (
        <GlassCard className="p-8 bg-white/75 border-[#ECECEC] rounded-[32px] shadow-2xl flex flex-col gap-6 items-center text-center">
          <BrandHeader />

          {authSuccess ? (
            <div className="w-full flex flex-col items-center justify-center gap-6 py-6">
              <div className="w-24 h-24 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.15)] animate-pulse-subtle">
                <ShieldCheck className="w-12 h-12 text-emerald-500" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="text-2xl font-black text-neutral-900 leading-none">
                  Verified Successfully!
                </h2>
                <p className="text-xs text-neutral-500 font-semibold px-4 leading-relaxed">
                  Establishing your secure study session. Setting up dashboard workspace...
                </p>
              </div>

              <div className="w-full flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold justify-center">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-emerald-500" /> Redirecting...
              </div>
            </div>
          ) : (
            <>
              <div className="relative w-24 h-24 bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 rounded-full flex items-center justify-center">
                <KeyRound className="w-10 h-10 text-[#6D4AFF]" />
                <div className="absolute -bottom-0.5 -right-0.5 bg-[#6D4AFF] text-white rounded-full p-1.5 shadow-md">
                  <Mail className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-black text-neutral-900">
                  Verify OTP
                </h2>
                <p className="text-xs text-neutral-500 font-semibold px-2">
                  Enter the 6-digit code sent to{" "}
                  <span className="text-neutral-900 font-bold">
                    {emailForVerification}
                  </span>
                </p>
              </div>

              <div className="text-sm font-black text-[#6D4AFF] bg-[#6D4AFF]/5 px-5 py-2 rounded-full border border-[#6D4AFF]/10">
                {otpTimer > 0 ? formatTimer(otpTimer) : "Code expired"}
              </div>

              {authError && (
                <div className="w-full flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                  <Info className="w-4 h-4 shrink-0" /> {authError}
                </div>
              )}

              <div className="flex gap-2.5 justify-center">
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-xl font-black bg-white/50 border-2 border-[#ECECEC] rounded-xl focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/20 focus:outline-none transition-all"
                  />
                ))}
              </div>

              <Button
                onClick={onVerifyOtp}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white font-bold py-3.5 h-12 rounded-2xl shadow-md hover:shadow-lg hover:shadow-purple-500/20 transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="animate-spin w-4 h-4" /> Verifying...
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <div className="text-xs font-semibold text-neutral-500">
                Didn&apos;t receive OTP?{" "}
                <button
                  onClick={() => {
                    setOtpTimer(90);
                    setAuthError(null);
                  }}
                  className="text-[#6D4AFF] font-bold hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>

              <button
                onClick={() => {
                  setAuthError(null);
                  setStep("signup");
                }}
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Signup
              </button>
            </>
          )}
        </GlassCard>
      )}
    </AuthLayout>
  );
}

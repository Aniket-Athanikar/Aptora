"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Smartphone,
  ArrowLeft,
  CheckCircle2,
  Info,
  KeyRound,
  Eye,
  EyeOff,
  Chrome,
  Apple,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import GlassCard from "../../components/ui/GlassCard";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ThreeHero = dynamic(() => import("../../components/three/ThreeHero"), {
  ssr: false,
});

// ─── Validation Schemas ─────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const forgotSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

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

type LoginValues = z.infer<typeof loginSchema>;
type ForgotValues = z.infer<typeof forgotSchema>;
type ResetValues = z.infer<typeof resetSchema>;
type SignupValues = z.infer<typeof signupSchema>;

type AuthStep =
  | "login"
  | "signup"
  | "verify-otp"
  | "forgot-password"
  | "reset-password"
  | "reset-success";

// ─── Brand Header Component ────────────────────────────────────────
function BrandHeader({
  onHome,
}: {
  onHome: () => void;
}) {
  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Image
          src="/favicon.ico"
          alt="Logo"
          width={36}
          height={36}
          className="rounded-full animate-spin-slow glow-avatar object-cover border border-[#ECECEC]"
          priority
        />
        <span className="font-extrabold tracking-wider text-neutral-950 uppercase text-base">
          EXAM FORGE<span className="text-[#6D4AFF]"> AI</span>
        </span>
      </div>
      <button
        type="button"
        onClick={onHome}
        className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-500 hover:text-neutral-900 border border-[#ECECEC] hover:bg-neutral-50/50 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3 h-3" /> Home
      </button>
    </div>
  );
}

const getPasswordStrength = (pass: string) => {
  let score = 0;
  if (!pass) return { score: 0, label: "", color: "bg-neutral-200", text: "text-neutral-400" };
  if (pass.length >= 6) score += 1;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  
  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-orange-500", text: "text-orange-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-yellow-500", text: "text-yellow-500" };
  return { score: 4, label: "Strong", color: "bg-green-500", text: "text-green-500" };
};

// ─── Page Component ─────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { login, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [mounted, isAuthenticated, redirectTo, router]);

  const [step, setStep] = useState<AuthStep>("login");

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const [nameForSignup, setNameForSignup] = useState("");
  const phoneForOTP = "+91 98765 43210";
  const [otpTimer, setOtpTimer] = useState(90);
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));

  // Async status
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // CSRF token
  const [csrfToken] = useState(() =>
    typeof window !== "undefined"
      ? Math.random().toString(36).substring(2) + Date.now().toString(36)
      : ""
  );

  // OTP Timer countdown
  useEffect(() => {
    if (step !== "verify-otp" && step !== "reset-password") return;
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  // Fetch latest OTP automatically in development when step is verify-otp or reset-password
  useEffect(() => {
    if (step !== "verify-otp" && step !== "reset-password") {
      return;
    }
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
    // Poll every 2.5 seconds to retrieve it as soon as backend saves it
    const interval = setInterval(fetchLatestOtp, 2500);
    return () => clearInterval(interval);
  }, [step, emailForVerification]);

  // Clear retrieved code when timer expires
  useEffect(() => {
    if (otpTimer <= 0) {
      setOtpValues(Array(6).fill(""));
    }
  }, [otpTimer]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  // ── Forms ──
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    watch: watchReset,
    formState: { errors: resetErrors },
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    watch: watchSignup,
    formState: { errors: signupErrors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const watchedSignupPassword = watchSignup("password") || "";
  const watchedResetPassword = watchReset("password") || "";

  // ── Handlers ──
  const onLogin = async (data: LoginValues) => {
    setIsLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ email: data.email, skip_email: false }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setEmailForVerification(result.email || data.email);
        setNameForSignup(result.name || "");
        setOtpValues(Array(6).fill(""));
        setOtpTimer(90);
        setStep("verify-otp");
      } else {
        setAuthError(
          result.detail || "Authentication failed. Is backend running?"
        );
      }
    } catch {
      setAuthError("Failed to connect to the authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSignup = async (data: SignupValues) => {
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
      const response = await fetch(
        `${API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify({
            otp: code,
            email: emailForVerification,
            phone: phoneForOTP,
          }),
        }
      );
      const result = await response.json();
      if (response.ok && result.success) {
        setAuthSuccess("✓ Verified! Redirecting...");
        // Login user → store in context
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

  const onForgot = async (data: ForgotValues) => {
    setIsLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify({ email: data.email }),
        }
      );
      const result = await response.json();
      if (response.ok && result.success) {
        setEmailForVerification(data.email);
        setAuthSuccess("OTP sent to your email!");
        setOtpValues(Array(6).fill(""));
        setOtpTimer(90);
        // Go to reset-password step (which has OTP + new password)
        setTimeout(() => {
          setStep("reset-password");
          setAuthSuccess(null);
        }, 1000);
      } else {
        setAuthError(result.detail || "Request failed.");
      }
    } catch {
      setAuthError("Could not transmit request.");
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetValues) => {
    const code = otpValues.join("");
    if (code.length !== 6) {
      setAuthError("Please enter the 6-digit OTP sent to your email.");
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify({
            email: emailForVerification,
            otp: code,
            new_password: data.password,
          }),
        }
      );
      const result = await response.json();
      if (response.ok && result.success) {
        setStep("reset-success");
      } else {
        setAuthError(result.detail || "Reset failed.");
      }
    } catch {
      setAuthError("Connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newValues = [...otpValues];
    newValues[index] = val.slice(-1);
    setOtpValues(newValues);
    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const goHome = () => router.push("/");

  // ── Panel animation variants ──
  const panelVariants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -15, scale: 0.98 },
  };

  // ═══════════════════════════════════════════════════════════════════
  return (
    <main className="relative min-h-screen bg-white text-neutral-900 overflow-hidden font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Premium Clean Background Pattern (Dot Pattern & Soft Ambient Glows) */}
      <div className="absolute inset-0 bg-dot-pattern bg-radial-gradient z-0 opacity-80" />
      <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] bg-[#6D4AFF]/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] bg-[#8B5CF6]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[460px]">
        <AnimatePresence mode="wait">
          {/* ═══════════════════ LOGIN STEP ═══════════════════ */}
          {step === "login" && (
            <motion.div
              key="login"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 bg-white/75 border-[#ECECEC] rounded-[32px] shadow-2xl flex flex-col gap-6">
                <BrandHeader onHome={goHome} />

                <div className="flex flex-col items-center text-center gap-1">
                  <h2 className="text-2xl font-black text-neutral-900 leading-none">
                    Welcome Back!
                  </h2>
                  <p className="text-xs text-neutral-500 font-semibold">
                    Login to continue your learning journey
                  </p>
                </div>

                {/* Error / Success */}
                {authError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                    <Info className="w-4 h-4 shrink-0" /> {authError}
                  </div>
                )}

                <form
                  onSubmit={handleLoginSubmit(onLogin)}
                  className="flex flex-col gap-4"
                >
                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      {...registerLogin("email")}
                      type="email"
                      placeholder="Email address"
                      className="pl-10 h-12 rounded-xl border-[#ECECEC] bg-white/50 text-sm font-medium focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]"
                    />
                    {loginErrors.email && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">
                        {loginErrors.email.message}
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
                        <RefreshCw className="animate-spin w-4 h-4" />{" "}
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-neutral-200" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    or continue with
                  </span>
                  <div className="flex-1 h-px bg-neutral-200" />
                </div>

                {/* Social */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 h-11 border border-[#ECECEC] rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all cursor-pointer">
                    <Chrome className="w-4 h-4" /> Google
                  </button>
                  <button className="flex items-center justify-center gap-2 h-11 border border-[#ECECEC] rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all cursor-pointer">
                    <Apple className="w-4 h-4" /> Apple
                  </button>
                </div>

                {/* Switch to signup */}
                <p className="text-center text-xs font-semibold text-neutral-500">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => {
                      setAuthError(null);
                      setStep("signup");
                    }}
                    className="text-[#6D4AFF] font-bold hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              </GlassCard>
            </motion.div>
          )}

          {/* ═══════════════════ SIGNUP STEP ═══════════════════ */}
          {step === "signup" && (
            <motion.div
              key="signup"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 bg-white/75 border-[#ECECEC] rounded-[32px] shadow-2xl flex flex-col gap-6">
                <BrandHeader onHome={goHome} />

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

                <form
                  onSubmit={handleSignupSubmit(onSignup)}
                  className="flex flex-col gap-4"
                >
                  {/* Name */}
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      {...registerSignup("name")}
                      type="text"
                      placeholder="Full Name"
                      className="pl-10 h-12 rounded-xl border-[#ECECEC] bg-white/50 text-sm font-medium focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]"
                    />
                    {signupErrors.name && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">
                        {signupErrors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      {...registerSignup("email")}
                      type="email"
                      placeholder="Email address"
                      className="pl-10 h-12 rounded-xl border-[#ECECEC] bg-white/50 text-sm font-medium focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]"
                    />
                    {signupErrors.email && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">
                        {signupErrors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      {...registerSignup("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password (min 6 chars)"
                      className="pl-10 pr-10 h-12 rounded-xl border-[#ECECEC] bg-white/50 text-sm font-medium focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {signupErrors.password && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">
                        {signupErrors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Password Strength Meter */}
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

                  {/* Confirm Password */}
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      {...registerSignup("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      className="pl-10 pr-10 h-12 rounded-xl border-[#ECECEC] bg-white/50 text-sm font-medium focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {signupErrors.confirmPassword && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">
                        {signupErrors.confirmPassword.message}
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
                        <RefreshCw className="animate-spin w-4 h-4" />{" "}
                        Creating...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <p className="text-center text-xs font-semibold text-neutral-500">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setAuthError(null);
                      setStep("login");
                    }}
                    className="text-[#6D4AFF] font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </GlassCard>
            </motion.div>
          )}

          {/* ═══════════════════ VERIFY OTP STEP ═══════════════════ */}
          {step === "verify-otp" && (
            <motion.div
              key="verify-otp"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 bg-white/75 border-[#ECECEC] rounded-[32px] shadow-2xl flex flex-col gap-6 items-center text-center">
                <BrandHeader onHome={goHome} />

                {/* Phone icon */}
                <div className="relative w-24 h-24 bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 rounded-full flex items-center justify-center">
                  <Smartphone className="w-10 h-10 text-[#6D4AFF]" />
                  <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
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

                {/* Timer */}
                <div className="text-sm font-black text-[#6D4AFF] bg-[#6D4AFF]/5 px-5 py-2 rounded-full border border-[#6D4AFF]/10">
                  {otpTimer > 0 ? formatTimer(otpTimer) : "Code expired"}
                </div>

                {/* Error / Success */}
                {authError && (
                  <div className="w-full flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                    <Info className="w-4 h-4 shrink-0" /> {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="w-full flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {authSuccess}
                  </div>
                )}

                {/* OTP Inputs */}
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
                      <RefreshCw className="animate-spin w-4 h-4" />{" "}
                      Verifying...
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
                    setStep("login");
                  }}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </GlassCard>
            </motion.div>
          )}

          {/* ═══════════════════ FORGOT PASSWORD STEP ═══════════════════ */}
          {step === "forgot-password" && (
            <motion.div
              key="forgot-password"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 bg-white/75 border-[#ECECEC] rounded-[32px] shadow-2xl flex flex-col gap-6 items-center text-center">
                <BrandHeader onHome={goHome} />

                <div className="relative w-24 h-24 bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 rounded-full flex items-center justify-center">
                  <KeyRound className="w-10 h-10 text-[#6D4AFF]" />
                  <div className="absolute bottom-0 right-0 bg-amber-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md">
                    <span className="text-xs font-black">?</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-black text-neutral-900">
                    Forgot Password
                  </h2>
                  <p className="text-xs text-neutral-500 font-semibold px-4">
                    Enter your email and we&apos;ll send you an OTP to reset
                    your password.
                  </p>
                </div>

                {authError && (
                  <div className="w-full flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                    <Info className="w-4 h-4 shrink-0" /> {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="w-full flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {authSuccess}
                  </div>
                )}

                <form
                  onSubmit={handleForgotSubmit(onForgot)}
                  className="w-full flex flex-col gap-4"
                >
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      {...registerForgot("email")}
                      type="email"
                      placeholder="Your registered email"
                      className="pl-10 h-12 rounded-xl border-[#ECECEC] bg-white/50 text-sm font-medium focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]"
                    />
                    {forgotErrors.email && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">
                        {forgotErrors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white font-bold py-3.5 h-12 rounded-2xl shadow-md hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="animate-spin w-4 h-4" />{" "}
                        Sending...
                      </span>
                    ) : (
                      "Send Reset OTP"
                    )}
                  </Button>
                </form>

                <button
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setStep("login");
                  }}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </GlassCard>
            </motion.div>
          )}

          {/* ═══════════════════ RESET PASSWORD (OTP + New Password) ═══════════════════ */}
          {step === "reset-password" && (
            <motion.div
              key="reset-password"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 bg-white/75 border-[#ECECEC] rounded-[32px] shadow-2xl flex flex-col gap-6 items-center text-center">
                <BrandHeader onHome={goHome} />

                <div className="relative w-24 h-24 bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 rounded-full flex items-center justify-center">
                  <Lock className="w-10 h-10 text-[#6D4AFF]" />
                  <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-black text-neutral-900">
                    Create New Password
                  </h2>
                  <p className="text-xs text-neutral-500 font-semibold px-2">
                    Enter the OTP sent to{" "}
                    <span className="font-bold text-neutral-900">
                      {emailForVerification}
                    </span>{" "}
                    and set your new password.
                  </p>
                </div>

                {authError && (
                  <div className="w-full flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                    <Info className="w-4 h-4 shrink-0" /> {authError}
                  </div>
                )}

                {/* OTP Inputs */}
                <div>
                  <p className="text-xs font-bold text-neutral-600 mb-2">
                    Verification Code
                  </p>
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
                        className="w-11 h-13 text-center text-lg font-black bg-white/50 border-2 border-[#ECECEC] rounded-xl focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/20 focus:outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={handleResetSubmit(onResetPassword)}
                  className="w-full flex flex-col gap-4"
                >
                  {/* New password */}
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      {...registerReset("password")}
                      type={showResetPassword ? "text" : "password"}
                      placeholder="New Password (min 8 chars)"
                      className="pl-10 pr-10 h-12 rounded-xl border-[#ECECEC] bg-white/50 text-sm font-medium focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      {showResetPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {resetErrors.password && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">
                        {resetErrors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Password Strength Meter */}
                  {watchedResetPassword && (
                    <div className="flex flex-col gap-1.5 -mt-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-neutral-500">Password Strength:</span>
                        <span className={getPasswordStrength(watchedResetPassword).text}>
                          {getPasswordStrength(watchedResetPassword).label}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden">
                        {[1, 2, 3, 4].map((index) => (
                          <div
                            key={index}
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              getPasswordStrength(watchedResetPassword).score >= index
                                ? getPasswordStrength(watchedResetPassword).color
                                : "bg-neutral-200"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confirm password */}
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      {...registerReset("confirmPassword")}
                      type={showResetConfirmPassword ? "text" : "password"}
                      placeholder="Confirm New Password"
                      className="pl-10 pr-10 h-12 rounded-xl border-[#ECECEC] bg-white/50 text-sm font-medium focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      {showResetConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {resetErrors.confirmPassword && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">
                        {resetErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white font-bold py-3.5 h-12 rounded-2xl shadow-md hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="animate-spin w-4 h-4" />{" "}
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>

                <button
                  onClick={() => {
                    setAuthError(null);
                    setStep("forgot-password");
                  }}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              </GlassCard>
            </motion.div>
          )}

          {/* ═══════════════════ RESET SUCCESS ═══════════════════ */}
          {step === "reset-success" && (
            <motion.div
              key="reset-success"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 bg-white/75 border-[#ECECEC] rounded-[32px] shadow-2xl flex flex-col gap-6 items-center text-center">
                <BrandHeader onHome={goHome} />

                {/* Success animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="w-28 h-28 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                </motion.div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-black text-neutral-900">
                    Password Reset!
                  </h2>
                  <p className="text-sm text-neutral-500 font-semibold">
                    Your password has been changed successfully. You can now sign
                    in with your new password.
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setStep("login");
                  }}
                  className="w-full bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white font-bold py-3.5 h-12 rounded-2xl shadow-md hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                >
                  Back to Sign In
                </Button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

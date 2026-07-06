"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  RefreshCw
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import dynamic from "next/dynamic";
import ParticleBackground from "../../components/three/ParticleBackground";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import GlassCard from "../../components/ui/GlassCard";

const ThreeHero = dynamic(() => import("../../components/three/ThreeHero"), {
  ssr: false,
});

// Validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const forgotSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type LoginValues = z.infer<typeof loginSchema>;
type ForgotValues = z.infer<typeof forgotSchema>;

type AuthStep = "login" | "verify-email" | "verify-otp" | "forgot-password";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("rahulsharma123@gmail.com");
  const phoneForOTP = "+91 98765 43210";
  const [otpTimer, setOtpTimer] = useState(90); // 1:30 in seconds
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));

  // Async status indicators
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Timer countdown for OTP
  useEffect(() => {
    if (step !== "verify-otp") return;
    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [step, otpTimer]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Form setups
  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema)
  });

  const { register: registerForgot, handleSubmit: handleForgotSubmit, formState: { errors: forgotErrors } } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema)
  });

  // POST /api/auth/login
  const onLogin = async (data: LoginValues) => {
    setIsLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setEmailForVerification(result.email);
        setStep("verify-email");
      } else {
        setAuthError(result.detail || "Authentication failed. Is backend running?");
      }
    } catch {
      setAuthError("Failed to connect to the authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  // POST /api/auth/verify-otp
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
      const response = await fetch("http://localhost:8000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: code, email: emailForVerification, phone: phoneForOTP }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setAuthSuccess(result.message);
        // Direct routing to homepage after successful OTP
        setTimeout(() => {
          router.push("/");
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

  // POST /api/auth/forgot-password
  const onForgot = async (data: ForgotValues) => {
    setIsLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const response = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setAuthSuccess(result.message);
        setTimeout(() => {
          setStep("login");
          setAuthSuccess(null);
        }, 3000);
      } else {
        setAuthError(result.detail || "Request failed.");
      }
    } catch {
      setAuthError("Could not transmit request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return; // Only allow digits
    const newValues = [...otpValues];
    newValues[index] = val.slice(-1); // Take last character entered
    setOtpValues(newValues);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <main className="relative min-h-screen bg-white text-neutral-900 overflow-hidden font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Three.js Background particles and grids */}
      <ParticleBackground />
      <div className="absolute inset-0 w-full h-full opacity-60 z-0 pointer-events-none">
        <ThreeHero />
      </div>

      <div className="relative z-10 w-full max-w-[460px]">
        {/* Animated panel changes */}
        <AnimatePresence mode="wait">
          {step === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 bg-white/75 border-[#ECECEC] rounded-[32px] shadow-2xl flex flex-col gap-6">
                {/* Logo & Subtitle */}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/favicon.ico"
                        alt="Logo"
                        className="w-9 h-9 rounded-full animate-spin-slow glow-avatar object-cover border border-[#ECECEC]"
                      />
                      <span className="font-extrabold tracking-wider text-neutral-950 uppercase text-base">
                        EXAM FORGE<span className="text-[#6D4AFF]"> AI</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/")}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-500 hover:text-neutral-900 border border-[#ECECEC] hover:bg-neutral-50/50 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" /> Home
                    </button>
                  </div>
                  <h2 className="text-2xl font-black text-neutral-900 mt-4 leading-none">Welcome!</h2>
                  <p className="text-xs text-neutral-500 font-semibold">Login to continue your learning journey</p>
                </div>

                {authError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold p-3.5 rounded-xl">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit(onLogin)} className="flex flex-col gap-4">
                  {/* Email */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10 bg-white/50 border-neutral-200 text-neutral-900 placeholder-neutral-400"
                        {...registerLogin("email")}
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="text-red-500 text-[10px] font-semibold mt-1">{loginErrors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setStep("forgot-password")}
                        className="text-[10px] font-bold text-[#6D4AFF] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-white/50 border-neutral-200 text-neutral-900"
                        {...registerLogin("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-red-500 text-[10px] font-semibold mt-1">{loginErrors.password.message}</p>
                    )}
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-neutral-200 text-[#6D4AFF] focus:ring-[#6D4AFF]"
                    />
                    {/* <label htmlFor="remember" className="text-xs font-semibold text-neutral-600 cursor-pointer select-none">
                      Remember Me
                    </label> */}
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-purple-500/10 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <RefreshCw className="animate-spin w-4 h-4" /> Initiating...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>

                {/* Social Login */}
                <div className="flex flex-col gap-4">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#ECECEC]" />
                    </div>
                    <span className="relative px-3 bg-white/0 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      or continue with
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 transition-colors shadow-sm">
                      <Chrome className="w-4 h-4 text-neutral-700" /> Google
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 transition-colors shadow-sm">
                      <Apple className="w-4 h-4 text-neutral-700" /> Apple
                    </button>
                  </div>
                </div>

                {/* Register bottom */}
                <div className="text-center text-xs font-semibold text-neutral-500 mt-2">
                  Don&apos;t have an account?{" "}
                  <button onClick={() => setStep("verify-otp")} className="text-[#6D4AFF] font-bold hover:underline">
                    Register
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === "verify-email" && (
            <motion.div
              key="verify-email"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 bg-white/75 border-[#ECECEC] rounded-[32px] shadow-2xl flex flex-col gap-6 items-center text-center">
                {/* Envelope Illustration */}
                <div className="relative w-28 h-28 bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 rounded-full flex items-center justify-center shadow-inner">
                  <div className="absolute -inset-1.5 bg-[#6D4AFF]/5 rounded-full blur-sm" />
                  <Mail className="w-12 h-12 text-[#6D4AFF]" />
                  <div className="absolute bottom-1 right-1 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-black text-neutral-900 mt-2">Verify Your Email</h2>
                  <p className="text-xs text-neutral-500 font-semibold px-4 leading-relaxed">
                    We&apos;ve sent a verification link to <span className="text-neutral-900 font-bold">{emailForVerification}</span>
                  </p>
                  <p className="text-xs text-neutral-500 font-semibold mt-2">
                    Please check your inbox and click the link to verify your email address.
                  </p>
                </div>

                {/* Info Banner */}
                <div className="w-full flex items-start gap-3 p-4 bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 rounded-2xl text-left">
                  <Info className="w-5 h-5 text-[#6D4AFF] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-bold text-neutral-800">Didn&apos;t receive the email?</h4>
                    <p className="text-[10px] text-neutral-500 font-semibold mt-0.5">
                      Check your spam folder or click the button below to resend.
                    </p>
                  </div>
                </div>

                {/* Direct button to route to OTP screen */}
                <Button className="w-full bg-[#6D4AFF] hover:bg-[#8B5CF6] text-white font-bold py-3.5 rounded-2xl shadow-md" onClick={() => setStep("verify-otp")}>
                  Proceed to OTP Verification
                </Button>

                <button
                  onClick={() => setStep("login")}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </GlassCard>
            </motion.div>
          )}

          {step === "verify-otp" && (
            <motion.div
              key="verify-otp"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 bg-white/75 border-[#ECECEC] rounded-[32px] shadow-2xl flex flex-col gap-6 items-center text-center">
                {/* Phone Illustration */}
                <div className="relative w-28 h-28 bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 rounded-full flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-[#6D4AFF]" />
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white text-[9px] font-extrabold tracking-widest px-2.5 py-1 rounded-full uppercase shadow">
                    OTP
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-black text-neutral-900 mt-2">Verify Your Phone</h2>
                  <p className="text-xs text-neutral-500 font-semibold">
                    Enter the 6-digit OTP sent to <span className="text-neutral-900 font-bold">{phoneForOTP}</span>
                  </p>
                  <p className="text-[10px] text-neutral-400 font-semibold">
                    (Use code <span className="font-bold text-neutral-600">123456</span> for sandbox verification)
                  </p>
                </div>

                {authError && (
                  <div className="w-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold p-3.5 rounded-xl">
                    {authError}
                  </div>
                )}

                {authSuccess && (
                  <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold p-3.5 rounded-xl flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {/* 6 OTP Inputs */}
                <div className="flex gap-2 justify-center my-2">
                  {otpValues.map((val, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 bg-white/60 border border-neutral-200 focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF] rounded-xl text-center font-extrabold text-lg text-neutral-900 outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    OTP expires in
                  </span>
                  <span className="text-sm font-black text-neutral-800">
                    {formatTimer(otpTimer)}
                  </span>
                </div>

                <Button type="button" disabled={isLoading} className="w-full bg-[#6D4AFF] hover:bg-[#8B5CF6] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2" onClick={onVerifyOtp}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="animate-spin w-4 h-4" /> Authenticating...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                <div className="text-xs font-semibold text-neutral-500">
                  Didn&apos;t receive OTP?{" "}
                  <button onClick={() => { setOtpTimer(90); setAuthError(null); }} className="text-[#6D4AFF] font-bold hover:underline">
                    Resend OTP
                  </button>
                </div>

                <button
                  onClick={() => setStep("login")}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </GlassCard>
            </motion.div>
          )}

          {step === "forgot-password" && (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 bg-white/75 border-[#ECECEC] rounded-[32px] shadow-2xl flex flex-col gap-6 items-center text-center">
                {/* Lock Illustration */}
                <div className="relative w-28 h-28 bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 rounded-full flex items-center justify-center">
                  <KeyRound className="w-12 h-12 text-[#6D4AFF]" />
                  <div className="absolute bottom-1 right-1 bg-amber-500 text-white rounded-full p-1 shadow-md">
                    <span className="text-xs font-black">?</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-black text-neutral-900 mt-2">Forgot Password?</h2>
                  <p className="text-xs text-neutral-500 font-semibold px-4">
                    No worries! Enter your email address and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                {authSuccess && (
                  <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold p-3.5 rounded-xl">
                    {authSuccess}
                  </div>
                )}

                {authError && (
                  <div className="w-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold p-3.5 rounded-xl">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleForgotSubmit(onForgot)} className="w-full flex flex-col gap-4 text-left">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10 bg-white/50 border-neutral-200 text-neutral-900"
                        {...registerForgot("email")}
                      />
                    </div>
                    {forgotErrors.email && (
                      <p className="text-red-500 text-[10px] font-semibold mt-1">{forgotErrors.email.message}</p>
                    )}
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full bg-[#6D4AFF] hover:bg-[#8B5CF6] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <RefreshCw className="animate-spin w-4 h-4" /> Processing...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                <button
                  onClick={() => setStep("login")}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

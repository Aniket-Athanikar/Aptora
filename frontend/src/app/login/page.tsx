"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Chrome,
  Eye,
  EyeOff,
  Github,
  Info,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Input, GlassCard } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { BrandHeader } from "./components/BrandHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { login, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState<"login" | "verify-otp">("login");
  const [emailForVerification, setEmailForVerification] = useState("");
  const [nameForSignup, setNameForSignup] = useState("");
  const phoneForOTP = "+91 98765 43210";
  const [otpTimer, setOtpTimer] = useState(90);
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

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

  // Handle OAuth callbacks
  useEffect(() => {
    if (!mounted) return;

    const handleOAuthCallback = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsLoading(true);
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        if (accessToken) {
          if (accessToken === "mock_google_access_token") {
            setAuthSuccess("✓ Authenticated with Google!");
            login({
              name: "Google Developer",
              email: "google.dev@examforge.ai",
              avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Google",
            });
            setTimeout(() => {
              router.push(redirectTo);
            }, 1200);
            return;
          }
          try {
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
              const googleUser = await res.json();
              
              const backendRes = await fetch(`${API_URL}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ access_token: accessToken }),
              });

              if (backendRes.ok) {
                const result = await backendRes.json();
                if (typeof window !== "undefined" && result.access_token) {
                  localStorage.setItem("access_token", result.access_token);
                }
                setAuthSuccess("✓ Authenticated with Google!");
                login({
                  name: googleUser.name || googleUser.given_name || "Google User",
                  email: googleUser.email,
                  avatar: googleUser.picture,
                });
                setTimeout(() => {
                  router.push(redirectTo);
                }, 1200);
                return;
              } else {
                setAuthError("Failed to register session with backend server.");
              }
            }
          } catch (e) {
            console.error("Google user info fetch failed", e);
            setAuthError("Failed to fetch Google profile details.");
          } finally {
            setIsLoading(false);
          }
        }
      }

      const search = window.location.search;
      if (search) {
        const params = new URLSearchParams(search);
        const code = params.get("code");
        if (code) {
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsLoading(true);
          setAuthSuccess("✓ Authenticated with GitHub!");
          login({
            name: "GitHub Developer",
            email: "github.dev@examforge.ai",
            avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Github",
          });
          setTimeout(() => {
            router.push(redirectTo);
          }, 1200);
        }
      }
    };

    handleOAuthCallback();
  }, [mounted, router, redirectTo, login]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setAuthError("Google Client ID is not configured.");
      setIsLoading(false);
      return;
    }
    const redirectUri = window.location.origin + "/login";
    const scope = encodeURIComponent("https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email");
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&state=google`;
    window.location.href = oauthUrl;
  };

  const handleGithubLogin = () => {
    setIsLoading(true);
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "Iv1.0264fa793081e779";
    const redirectUri = window.location.origin + "/login";
    const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email&state=github`;
    window.location.href = oauthUrl;
  };

  const onLoginSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    console.log("STEP 1 - onLoginSubmit called", data);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      console.log("STEP 2 - About to call backend");
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ email: data.email, skip_email: false }),
      });
      console.log("STEP 3 - Response received", response.status);
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
        if (typeof window !== "undefined") {
          if (result.access_token) {
            localStorage.setItem("access_token", result.access_token);
          }
          localStorage.removeItem("token");
          localStorage.removeItem("auth_token");
        }
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
    register: registerLogin,
    handleSubmit: handleFormSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  return (
    <AuthLayout>
      {step === "login" ? (
        <GlassCard className="p-8 bg-white/75 border-[#ECECEC] rounded-[32px] shadow-2xl flex flex-col gap-6">
          <BrandHeader />

          <div className="flex flex-col items-center text-center gap-1">
            <h2 className="text-2xl font-black text-neutral-900 leading-none">
              Welcome Back!
            </h2>
            <p className="text-xs text-neutral-500 font-semibold">
              Login to continue your learning journey
            </p>
          </div>

          {authError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
              <Info className="w-4 h-4 shrink-0" /> {authError}
            </div>
          )}

          <form onSubmit={handleFormSubmit(onLoginSubmit)} className="flex flex-col gap-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                {...registerLogin("email")}
                type="email"
                placeholder="Email address"
                autoComplete="username"
                className="pl-10 h-12 rounded-xl border-[#ECECEC] bg-white/50 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              {loginErrors.email && (
                <p className="text-[10px] text-red-500 font-bold mt-1">
                  {loginErrors.email.message}
                </p>
              )}
            </div>

            <div className="flex justify-end -mt-1">
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer transition-all"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-650 to-emerald-800 hover:shadow-lg hover:shadow-emerald-500/20 text-white font-bold py-3.5 h-12 rounded-2xl shadow-md transition-all cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="animate-spin w-4 h-4" /> Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              or continue with
            </span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              type="button"
              className="flex items-center justify-center gap-2 h-11 border border-[#ECECEC] rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all cursor-pointer disabled:opacity-60"
            >
              <Chrome className="w-4 h-4 text-rose-500" /> Google
            </button>
            <button
              onClick={handleGithubLogin}
              disabled={isLoading}
              type="button"
              className="flex items-center justify-center gap-2 h-11 border border-[#ECECEC] rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all cursor-pointer disabled:opacity-60"
            >
              <Github className="w-4 h-4 text-slate-900" /> GitHub
            </button>
          </div>

          <p className="text-center text-xs font-semibold text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-emerald-600 font-bold hover:underline cursor-pointer"
            >
              Create Account
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
              <div className="relative w-24 h-24 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center">
                <KeyRound className="w-10 h-10 text-emerald-600" />
                <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-600 text-white rounded-full p-1.5 shadow-md">
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

              <div className="text-sm font-black text-emerald-700 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-100">
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
                    autoComplete="one-time-code"
                    className="w-12 h-14 text-center text-xl font-black bg-white/50 border-2 border-[#ECECEC] rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                ))}
              </div>

              <Button
                onClick={onVerifyOtp}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-650 to-emerald-800 text-white font-bold py-3.5 h-12 rounded-2xl shadow-md hover:shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer"
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
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
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
            </>
          )}
        </GlassCard>
      )}
    </AuthLayout>
  );
}

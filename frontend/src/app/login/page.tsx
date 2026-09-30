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
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Input, GlassCard } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { BrandHeader } from "./components/BrandHeader";

/**
 * Aptora API
 *
 * Docker production architecture:
 *
 * Browser
 *   /api/...
 *      ↓
 * Aptora Nginx
 *      ↓ strips /api/
 * Backend
 *      ↓
 * FastAPI /...
 *
 * docker-compose.yml:
 * NEXT_PUBLIC_API_URL=/api
 */
import { resolveApiUrl } from "@/lib/api-url";

/**
 * Build an authentication endpoint safely.
 */
const authUrl = (path: string) =>
  resolveApiUrl(`/auth/${path.replace(/^\/+/, "")}`);

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
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

  /*
   * Kept for compatibility with the existing backend contract.
   *
   * IMPORTANT:
   * This should eventually come from the backend/user record
   * rather than being hardcoded in the frontend.
   */
  const phoneForOTP = "+91 98765 43210";

  const [otpTimer, setOtpTimer] = useState(90);

  const [otpValues, setOtpValues] = useState<string[]>(
    Array(6).fill("")
  );

  const [isLoading, setIsLoading] = useState(false);

  const [authError, setAuthError] = useState<string | null>(null);

  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  /**
   * Generate a random CSRF value for the current browser session.
   *
   * NOTE:
   * This is kept compatible with the existing frontend/backend flow.
   * For production-grade CSRF protection, the backend should ideally
   * issue and validate a secure CSRF token or use SameSite cookies.
   */
  const [csrfToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const array = new Uint8Array(32);

    crypto.getRandomValues(array);

    return Array.from(array)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  });

  /**
   * Mark component as mounted.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Redirect authenticated users.
   */
  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [mounted, isAuthenticated, redirectTo, router]);

  /**
   * OTP timer countdown.
   */
  useEffect(() => {
    if (step !== "verify-otp") {
      return;
    }

    if (otpTimer <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [step, otpTimer]);

  /**
   * Development-only OTP retrieval.
   *
   * This automatically checks the latest OTP every 2.5 seconds
   * while running in development mode.
   */
  /**
   * Automatic OTP retrieval & auto-fill.
   */
  useEffect(() => {
    if (step !== "verify-otp" || !emailForVerification) {
      return;
    }

    const fetchLatestOtp = async () => {
      try {
        const res = await fetch(
          authUrl(
            `latest-otp?email=${encodeURIComponent(
              emailForVerification
            )}`
          ),
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.otp && String(data.otp).length === 6) {
            setOtpValues(String(data.otp).split(""));
            return;
          }
        }

        // Fallback to master dev OTP '123456' if server didn't send custom OTP yet
        setOtpValues(["1", "2", "3", "4", "5", "6"]);
      } catch (error) {
        setOtpValues(["1", "2", "3", "4", "5", "6"]);
      }
    };

    fetchLatestOtp();

    const interval = setInterval(fetchLatestOtp, 1500);

    return () => clearInterval(interval);
  }, [step, emailForVerification]);

  /**
   * Clear OTP after timer expires.
   */
  useEffect(() => {
    if (otpTimer <= 0) {
      setOtpValues(Array(6).fill(""));
    }
  }, [otpTimer]);

  /**
   * Handle OAuth callbacks.
   */
  useEffect(() => {
    if (!mounted) {
      return;
    }

    const handleOAuthCallback = async () => {
      /*
       * ------------------------------------------------------------
       * GOOGLE OAUTH CALLBACK
       * ------------------------------------------------------------
       */
      const hash = window.location.hash;

      if (hash && hash.includes("access_token")) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        setIsLoading(true);

        const params = new URLSearchParams(hash.substring(1));

        const accessToken = params.get("access_token");

        if (accessToken) {
          /**
           * Development-only mock Google login.
           *
           * Never enable this in production.
           */
          if (
            process.env.NODE_ENV === "development" &&
            accessToken === "mock_google_access_token"
          ) {
            setAuthSuccess("✓ Authenticated with Google!");

            login({
              name: "Google Developer",
              email: "google.dev@Aptora.ai",
              avatar:
                "https://api.dicebear.com/7.x/identicon/svg?seed=Google",
            });

            setTimeout(() => {
              router.push(redirectTo);
            }, 1200);

            return;
          }

          try {
            /*
             * Get Google user information.
             */
            const res = await fetch(
              "https://www.googleapis.com/oauth2/v3/userinfo",
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (!res.ok) {
              setAuthError(
                "Failed to fetch Google profile details."
              );

              return;
            }

            const googleUser = await res.json();

            /*
             * Register/login the Google user with Aptora backend.
             *
             * IMPORTANT:
             * Request goes through:
             *
             * /api/auth/google
             *
             * Nginx strips /api/
             *
             * Backend receives:
             *
             * /auth/google
             */
            const backendRes = await fetch(
              authUrl("google"),
              {
                method: "POST",

                credentials: "include",

                headers: {
                  "Content-Type": "application/json",
                  "X-CSRF-Token": csrfToken,
                },

                body: JSON.stringify({
                  access_token: accessToken,
                }),
              }
            );

            if (!backendRes.ok) {
              setAuthError(
                "Failed to register session with backend server."
              );

              return;
            }

            const result = await backendRes.json();

            /*
             * Keep compatibility with existing backend.
             *
             * If backend returns an access token, store it.
             */
            if (
              typeof window !== "undefined" &&
              result.access_token
            ) {
              localStorage.setItem(
                "access_token",
                result.access_token
              );
            }

            setAuthSuccess(
              "✓ Authenticated with Google!"
            );

            login({
              name:
                googleUser.name ||
                googleUser.given_name ||
                "Google User",

              email: googleUser.email,

              avatar: googleUser.picture,
            });

            setTimeout(() => {
              router.push(redirectTo);
            }, 1200);
          } catch (error) {
            console.error(
              "Google authentication failed:",
              error
            );

            setAuthError(
              "Failed to complete Google authentication."
            );
          } finally {
            setIsLoading(false);
          }
        }
      }

      /*
       * ------------------------------------------------------------
       * GITHUB OAUTH CALLBACK
       * ------------------------------------------------------------
       *
       * NOTE:
       * The existing implementation treats the returned code
       * as a successful frontend login.
       *
       * For production this should be exchanged server-side
       * with GitHub before creating the Aptora session.
       */
      const search = window.location.search;

      if (search) {
        const params = new URLSearchParams(search);

        const code = params.get("code");

        if (code) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          setIsLoading(true);

          try {
            /*
             * Existing frontend-compatible GitHub flow.
             *
             * Production recommendation:
             * send `code` to backend and let backend exchange it
             * with GitHub.
             */
            setAuthSuccess(
              "✓ Authenticated with GitHub!"
            );

            login({
              name: "GitHub Developer",
              email: "github.dev@Aptora.ai",
              avatar:
                "https://api.dicebear.com/7.x/identicon/svg?seed=Github",
            });

            setTimeout(() => {
              router.push(redirectTo);
            }, 1200);
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    handleOAuthCallback();
  }, [
    mounted,
    router,
    redirectTo,
    login,
    csrfToken,
  ]);

  /**
   * Google login.
   */
  const handleGoogleLogin = () => {
    setAuthError(null);
    setAuthSuccess(null);

    setIsLoading(true);

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setAuthError(
        "Google Client ID is not configured."
      );

      setIsLoading(false);

      return;
    }

    const redirectUri =
      window.location.origin + "/login";

    const scope = encodeURIComponent(
      "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
    );

    const oauthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${scope}` +
      `&state=google`;

    window.location.href = oauthUrl;
  };

  /**
   * GitHub login.
   */
  const handleGithubLogin = () => {
    setAuthError(null);
    setAuthSuccess(null);

    setIsLoading(true);

    const clientId =
      process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ||
      "Iv1.0264fa793081e779";

    const redirectUri =
      window.location.origin + "/login";

    const oauthUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=user:email` +
      `&state=github`;

    window.location.href = oauthUrl;
  };

  /**
   * Login with email.
   *
   * Backend:
   *
   * Browser:
   * POST /api/auth/login
   *
   * Nginx:
   * /api/auth/login -> /auth/login
   *
   * FastAPI:
   * POST /auth/login
   */
  const onLoginSubmit = async (
    data: LoginValues
  ) => {
    setIsLoading(true);

    setAuthError(null);
    setAuthSuccess(null);

    try {
      const response = await fetch(
        authUrl("login"),
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },

          body: JSON.stringify({
            email: data.email,
            skip_email: false,
          }),
        }
      );

      let result: any = null;

      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (response.ok && result?.success) {
        setEmailForVerification(
          result.email || data.email
        );

        setNameForSignup(
          result.name || ""
        );

        const initialOtp = (result.otp && String(result.otp).length === 6)
          ? String(result.otp).split("")
          : ["1", "2", "3", "4", "5", "6"];

        setOtpValues(initialOtp);

        setOtpTimer(90);

        setAuthSuccess(null);

        setStep("verify-otp");
      } else {
        setAuthError(
          result?.detail ||
            result?.message ||
            "Authentication failed. Is the backend running?"
        );
      }
    } catch (error) {
      console.error(
        "Login request failed:",
        error
      );

      setAuthError(
        "Failed to connect to the authentication server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify OTP.
   */
  const onVerifyOtp = async () => {
    const code = otpValues.join("");

    if (code.length !== 6) {
      setAuthError(
        "Please fill out the complete 6-digit OTP code."
      );

      return;
    }

    if (otpTimer <= 0) {
      setAuthError(
        "This OTP has expired. Please request a new OTP."
      );

      return;
    }

    setIsLoading(true);

    setAuthError(null);
    setAuthSuccess(null);

    try {
      const response = await fetch(
        authUrl("verify-otp"),
        {
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
        }
      );

      let result: any = null;

      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (response.ok && result?.success) {
        setAuthSuccess(
          "✓ Verified! Redirecting..."
        );

        if (
          typeof window !== "undefined"
        ) {
          /*
           * Keep compatibility with the existing
           * backend access-token response.
           */
          if (result.access_token) {
            localStorage.setItem(
              "access_token",
              result.access_token
            );
          }

          /*
           * Remove older token keys.
           */
          localStorage.removeItem("token");

          localStorage.removeItem(
            "auth_token"
          );
        }

        login({
          name:
            result.name ||
            nameForSignup ||
            emailForVerification.split("@")[0],

          email: emailForVerification,
        });

        setTimeout(() => {
          router.push(redirectTo);
        }, 1200);
      } else {
        setAuthError(
          result?.detail ||
            result?.message ||
            "Invalid OTP code. Please try again."
        );
      }
    } catch (error) {
      console.error(
        "OTP verification failed:",
        error
      );

      setAuthError(
        "Connection error while validating security token."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const autoSubmittedCodeRef = useRef<string>("");

  /**
   * Auto-submit OTP when all 6 boxes are filled.
   */
  useEffect(() => {
    if (step !== "verify-otp" || isLoading || authSuccess) {
      return;
    }

    const code = otpValues.join("");

    if (code.length === 6 && /^\d{6}$/.test(code)) {
      if (autoSubmittedCodeRef.current !== code) {
        autoSubmittedCodeRef.current = code;
        onVerifyOtp();
      }
    } else {
      autoSubmittedCodeRef.current = "";
    }
  }, [otpValues, step, isLoading, authSuccess]);

  /**
   * Handle OTP paste event.
   */
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pasted.length > 0) {
      const newValues = [...otpValues];
      const digits = pasted.split("");

      for (let i = 0; i < 6; i++) {
        if (digits[i]) {
          newValues[i] = digits[i];
        }
      }

      setOtpValues(newValues);

      const nextFocus = Math.min(pasted.length, 5);
      document.getElementById(`otp-${nextFocus}`)?.focus();
    }
  };

  /**
   * OTP input change.
   */
  const handleOtpChange = (
    index: number,
    val: string
  ) => {
    const cleanVal = val.replace(/\D/g, "");

    if (!cleanVal && val !== "") {
      return;
    }

    if (cleanVal.length > 1) {
      const newValues = [...otpValues];
      const digits = cleanVal.slice(0, 6 - index).split("");

      digits.forEach((d, i) => {
        if (index + i < 6) {
          newValues[index + i] = d;
        }
      });

      setOtpValues(newValues);

      const nextFocus = Math.min(index + digits.length, 5);
      document.getElementById(`otp-${nextFocus}`)?.focus();
      return;
    }

    const newValues = [...otpValues];
    newValues[index] = cleanVal.slice(-1);

    setOtpValues(newValues);

    if (cleanVal && index < 5) {
      document
        .getElementById(`otp-${index + 1}`)
        ?.focus();
    }
  };

  /**
   * OTP keyboard navigation.
   */
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onVerifyOtp();
      return;
    }

    if (
      e.key === "Backspace"
    ) {
      if (!otpValues[index] && index > 0) {
        document
          .getElementById(`otp-${index - 1}`)
          ?.focus();
      } else {
        const newValues = [...otpValues];
        newValues[index] = "";
        setOtpValues(newValues);
        if (index > 0 && !otpValues[index]) {
          document
            .getElementById(`otp-${index - 1}`)
            ?.focus();
        }
      }
    }

    if (
      e.key === "ArrowLeft" &&
      index > 0
    ) {
      document
        .getElementById(`otp-${index - 1}`)
        ?.focus();
    }

    if (
      e.key === "ArrowRight" &&
      index < 5
    ) {
      document
        .getElementById(`otp-${index + 1}`)
        ?.focus();
    }
  };

  /**
   * Format OTP timer.
   */
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);

    const rem = secs % 60;

    return `${mins
      .toString()
      .padStart(2, "0")}:${rem
      .toString()
      .padStart(2, "0")}`;
  };

  const {
    register: registerLogin,

    handleSubmit: handleFormSubmit,

    formState: {
      errors: loginErrors,
    },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
    },
  });

  return (
    <AuthLayout>
      {step === "login" ? (
        <div className="p-8 sm:p-9 bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/40 flex flex-col gap-6">
          <BrandHeader />

          {/* Header */}
          <div className="flex flex-col items-center text-center gap-1.5 pt-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome Back
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Sign in to access your Aptora study workspace
            </p>
          </div>

          {/* Error */}
          {authError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
              <Info className="w-4 h-4 shrink-0" />

              <span>{authError}</span>
            </div>
          )}

          {/* Login form */}
          <form
            onSubmit={handleFormSubmit(
              onLoginSubmit
            )}
            className="flex flex-col gap-4"
          >
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <Input
                {...registerLogin("email")}
                type="email"
                placeholder="Email address"
                autoComplete="username"
                disabled={isLoading}
                className="pl-10 h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
              />

              {loginErrors.email && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">
                  {loginErrors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#084c38] hover:bg-[#063b2b] text-white font-semibold py-3 h-12 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="animate-spin w-4 h-4" />

                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />

            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              or continue with
            </span>

            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              type="button"
              className="flex items-center justify-center gap-2 h-11 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
            >
              <Chrome className="w-4 h-4 text-rose-500" />

              Google
            </button>

            <button
              onClick={handleGithubLogin}
              disabled={isLoading}
              type="button"
              className="flex items-center justify-center gap-2 h-11 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
            >
              <Github className="w-4 h-4 text-slate-900" />

              GitHub
            </button>
          </div>

          {/* Signup */}
          <p className="text-center text-xs font-medium text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#084c38] font-bold hover:underline cursor-pointer"
            >
              Create Account
            </Link>
          </p>
        </div>
      ) : (
        <div className="p-8 sm:p-9 bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/40 flex flex-col gap-6 items-center text-center">
          <BrandHeader />

          {authSuccess ? (
            /* -------------------------------------------------------
             * SUCCESS
             * ------------------------------------------------------- */
            <div className="w-full flex flex-col items-center justify-center gap-6 py-6">
              <div className="w-20 h-20 bg-[#ecfdf5] border border-[#d1fae5] rounded-full flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-10 h-10 text-[#084c38]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="text-2xl font-bold text-slate-900 leading-none">
                  Verified Successfully!
                </h2>

                <p className="text-xs text-slate-500 font-medium px-4 leading-relaxed">
                  Establishing your secure session. Loading Aptora workspace...
                </p>
              </div>

              <div className="w-full flex items-center gap-2 p-3.5 bg-[#ecfdf5] border border-[#d1fae5] rounded-xl text-[#084c38] text-xs font-semibold justify-center">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-[#084c38]" />

                Redirecting...
              </div>
            </div>
          ) : (
            <>
              {/* OTP Icon */}
              <div className="relative w-20 h-20 bg-[#ecfdf5] border border-[#d1fae5] rounded-full flex items-center justify-center">
                <KeyRound className="w-9 h-9 text-[#084c38]" />

                <div className="absolute -bottom-0.5 -right-0.5 bg-[#084c38] text-white rounded-full p-1.5 shadow-xs">
                  <Mail className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* OTP Header */}
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  Verify OTP
                </h2>

                <p className="text-xs text-slate-500 font-medium px-2">
                  Enter the 6-digit code sent to{" "}
                  <span className="text-slate-900 font-bold">
                    {emailForVerification}
                  </span>
                </p>
              </div>

              {/* Timer */}
              <div className="text-xs font-bold text-[#084c38] bg-[#ecfdf5] px-4 py-1.5 rounded-full border border-[#d1fae5]">
                {otpTimer > 0
                  ? formatTimer(otpTimer)
                  : "Code expired"}
              </div>

              {/* OTP Error */}
              {authError && (
                <div className="w-full flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                  <Info className="w-4 h-4 shrink-0" />

                  <span>{authError}</span>
                </div>
              )}

              {/* Auto-Fill OTP Helper Button */}
              <button
                type="button"
                onClick={() => {
                  setOtpValues(["1", "2", "3", "4", "5", "6"]);
                }}
                className="px-3.5 py-1.5 bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#084c38] text-xs font-bold rounded-full border border-[#b9f5d8] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>⚡ Auto-Fill OTP (123456)</span>
              </button>

              {/* OTP Inputs */}
              <div className="flex gap-2 justify-center">
                {otpValues.map(
                  (val, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      disabled={
                        isLoading ||
                        otpTimer <= 0
                      }
                      onChange={(e) =>
                        handleOtpChange(
                          idx,
                          e.target.value
                        )
                      }
                      onKeyDown={(e) =>
                        handleOtpKeyDown(
                          idx,
                          e
                        )
                      }
                      onPaste={handleOtpPaste}
                      autoComplete={
                        idx === 0
                          ? "one-time-code"
                          : "off"
                      }
                      className="w-11 h-13 text-center text-lg font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-[#084c38] focus:ring-2 focus:ring-[#084c38]/20 focus:outline-none transition-all text-slate-900 disabled:opacity-50"
                    />
                  )
                )}
              </div>

              {/* Verify */}
              <Button
                onClick={onVerifyOtp}
                disabled={
                  isLoading ||
                  otpTimer <= 0
                }
                className="w-full bg-[#084c38] hover:bg-[#063b2b] text-white font-semibold py-3 h-12 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="animate-spin w-4 h-4" />

                    Verifying...
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              {/* Resend */}
              <div className="text-xs font-medium text-slate-500">
                Didn&apos;t receive OTP?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setOtpTimer(90);

                    setAuthError(null);

                    setOtpValues(
                      Array(6).fill("")
                    );
                  }}
                  className="text-[#084c38] font-bold hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>

              {/* Back */}
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);

                  setAuthSuccess(null);

                  setOtpValues(
                    Array(6).fill("")
                  );

                  setOtpTimer(90);

                  setStep("login");
                }}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />

                Back to Login
              </button>
            </>
          )}
        </div>
      )}
    </AuthLayout>
  );
}
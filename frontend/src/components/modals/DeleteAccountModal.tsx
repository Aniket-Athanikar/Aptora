"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, ShieldAlert, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { user, logout } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reason, setReason] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [autoFetchAttempted, setAutoFetchAttempted] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setReason("");
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setLoading(false);
      setCountdown(0);
      setAutoFetchAttempted(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-fetch OTP when step 2 is reached
  useEffect(() => {
    if (step === 2 && !autoFetchAttempted && user?.email) {
      setAutoFetchAttempted(true);
      fetchOtpFromBackend();
    }
  }, [step, autoFetchAttempted, user?.email]);

  const fetchOtpFromBackend = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`${API_URL}/api/account/get-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.success && data.otp) {
        // Auto-populate the OTP fields
        const otpDigits = data.otp.split("");
        setOtp(otpDigits);
        // Focus on the last field after population
        setTimeout(() => {
          otpRefs.current[5]?.focus();
        }, 100);
      }
    } catch (err) {
      console.log("Could not auto-fetch OTP. User will need to enter manually.");
    }
  };

  const handleRequestDeletion = async () => {
    if (!user?.email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/account/request-deletion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
        setCountdown(60);
      } else {
        setError(data.detail || data.message || "Failed to request deletion.");
      }
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyDeletion = async () => {
    const otpStr = otp.join("");
    if (otpStr.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    if (!user?.email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/account/verify-deletion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, otp: otpStr }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(3);
        setTimeout(async () => {
          await logout();
          window.location.href = "/";
        }, 3000);
      } else {
        setError(data.detail || data.message || "Invalid OTP. Please try again.");
      }
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleRequestDeletion();
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70">
      {/* Backdrop (Click to close) */}
      <div className="absolute inset-0" onClick={step !== 3 ? onClose : undefined} />

      {/* Modal Container - Centered & High-Visibility */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">

        {/* ──── STEP 1: Confirmation ──── */}
        {step === 1 && (
          <>
            {/* High-Visibility Header Bar */}
            <div className="bg-red-600 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Delete Account</h2>
                  <p className="text-xs text-red-100 font-semibold">Permanent & Irreversible</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 text-white transition-all"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-8 space-y-6">
              {/* Warning Card */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 space-y-3">
                <p className="text-base font-bold text-red-900">What will be deleted:</p>
                <ul className="space-y-2 text-base text-red-800 font-semibold">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0" />
                    Profile & personal data
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0" />
                    Mock tests & analytics
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0" />
                    Notes, PDFs & bookmarks
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0" />
                    XP, coins & achievements
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0" />
                    Order history & subscription
                  </li>
                </ul>
              </div>

              {/* Reason Input */}
              <div className="space-y-2">
                <label className="text-base font-bold text-gray-900 block">
                  Why are you leaving? (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Your feedback helps us improve..."
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-base resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-gray-500"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="text-base text-red-700 font-bold bg-red-100 p-4 rounded-lg border-2 border-red-300">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 border-2 border-gray-300 rounded-lg text-base font-bold text-gray-900 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestDeletion}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-base font-bold transition-all flex items-center justify-center gap-2 border-0"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continue <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ──── STEP 2: OTP Verification ──── */}
        {step === 2 && (
          <>
            {/* High-Visibility Header Bar */}
            <div className="bg-purple-600 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Verify Deletion</h2>
                  <p className="text-xs text-purple-100 font-semibold">OTP Auto-Fetched</p>
                </div>
              </div>
              <button
                onClick={() => { setStep(1); setError(""); }}
                className="p-2 rounded-lg hover:bg-white/20 text-white transition-all"
                aria-label="Go back"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-8 space-y-6">
              {/* Email Info */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-semibold">OTP sent to:</p>
                <p className="text-base font-bold text-gray-900 break-all mt-1">{user?.email}</p>
              </div>

              {/* Auto-Fetch Status */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-green-800">
                  ✓ OTP automatically fetched from your email
                </p>
              </div>

              {/* OTP Inputs */}
              <div className="space-y-3">
                <label className="text-base font-bold text-gray-900 block">6-digit OTP:</label>
                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={cn(
                        "w-14 h-16 text-center text-2xl font-black rounded-lg border-2 transition-all focus:outline-none",
                        digit
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-300 bg-white text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-base text-gray-600 font-semibold">
                    Resend OTP in <span className="font-bold text-gray-900">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-base font-bold text-purple-600 hover:text-purple-700 cursor-pointer transition-colors bg-transparent border-0"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="text-base text-red-700 font-bold bg-red-100 p-4 rounded-lg border-2 border-red-300 text-center">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setStep(1); setError(""); }}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 border-2 border-gray-300 rounded-lg text-base font-bold text-gray-900 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyDeletion}
                  disabled={loading || otp.join("").length !== 6}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-base font-bold transition-all flex items-center justify-center gap-2 border-0"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirm Deletion"
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ──── STEP 3: Success ──── */}
        {step === 3 && (
          <>
            {/* High-Visibility Header Bar */}
            <div className="bg-green-600 px-8 py-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Account Deleted</h2>
                <p className="text-xs text-green-100 font-semibold">Redirecting...</p>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8 text-center space-y-6">
              {/* Message */}
              <div className="space-y-3">
                <p className="text-base text-gray-700 font-semibold leading-relaxed">
                  Your account and all data have been permanently removed.
                </p>
              </div>

              {/* Loading */}
              <div className="flex items-center justify-center gap-2 text-base text-gray-600 font-bold">
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirecting...
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Render modal as a portal to avoid parent container constraints
  return createPortal(modalContent, document.body);
}

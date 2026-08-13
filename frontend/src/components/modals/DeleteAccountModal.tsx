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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      {/* Backdrop (Click to close) */}
      <div className="absolute inset-0" onClick={step !== 3 ? onClose : undefined} />

      {/* Modal Container - Centered & High-Visibility */}
      <div className="relative w-full max-w-[440px] bg-white border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-250 p-6 sm:p-8 space-y-6">

        {/* ──── STEP 1: Confirmation ──── */}
        {step === 1 && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Delete Account</h2>
                  <p className="text-[11px] text-rose-600 font-extrabold tracking-wide uppercase">Permanent & Irreversible</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-150 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Details */}
            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4.5 space-y-3">
              <p className="text-xs font-black text-rose-900">Following data will be lost forever:</p>
              <ul className="space-y-2 text-xs text-rose-800 font-semibold">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0" />
                  Profile and personal credentials
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0" />
                  AI Study guides, mock tests & analytics
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0" />
                  Notes, PDFs & bookmarks library
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0" />
                  Order history & subscriptions status
                </li>
              </ul>
            </div>

            {/* Reason Input */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 block">
                Why are you leaving? (optional)
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Feedback helps us improve..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs resize-none h-20 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200 transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-rose-700 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200 text-center animate-shake">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-700 transition-all cursor-pointer shadow-3xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDeletion}
                disabled={loading}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer border-none"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Continue <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* ──── STEP 2: OTP Verification ──── */}
        {step === 2 && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Verify Deletion</h2>
                  <p className="text-[11px] text-emerald-600 font-extrabold tracking-wide uppercase">OTP Auto-Fetched</p>
                </div>
              </div>
              <button
                onClick={() => { setStep(1); setError(""); }}
                className="p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-150 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                aria-label="Go back"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Info */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Verification email sent</span>
              <span className="text-xs font-black text-slate-800 break-all">{user?.email}</span>
            </div>

            {/* Auto-Fetch Status */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-center">
              <p className="text-[11px] font-black text-emerald-700 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> OTP automatically sync&apos;d from sandbox mailbox
              </p>
            </div>

            {/* OTP Inputs */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-750 block">Enter 6-digit OTP:</label>
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
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
                      "w-12 h-14 text-center text-xl font-black rounded-xl border-2 transition-all focus:outline-none focus:ring-0",
                      digit
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50/50 text-slate-800 focus:border-emerald-500"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Resend */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-xs text-slate-400 font-bold">
                  Resend OTP in <span className="text-slate-800 font-black">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-xs font-black text-emerald-600 hover:text-emerald-700 cursor-pointer transition-colors bg-transparent border-none"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-rose-700 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setStep(1); setError(""); }}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-700 transition-all cursor-pointer shadow-3xs"
              >
                Back
              </button>
              <button
                onClick={handleVerifyDeletion}
                disabled={loading || otp.join("").length !== 6}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer border-none"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Deletion"
                )}
              </button>
            </div>
          </>
        )}

        {/* ──── STEP 3: Success ──── */}
        {step === 3 && (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">Account Deleted</h2>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Your account and profile details have been permanently cleared. Redirecting you to home...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              Redirecting...
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render modal as a portal to avoid parent container constraints
  return createPortal(modalContent, document.body);
}

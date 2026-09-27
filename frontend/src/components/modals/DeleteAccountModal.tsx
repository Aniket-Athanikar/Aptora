"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, ShieldAlert, CheckCircle2, Loader2, ArrowRight, Trash2 } from "lucide-react";
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
        const otpDigits = data.otp.split("");
        setOtp(otpDigits);
        setTimeout(() => {
          otpRefs.current[5]?.focus();
        }, 100);
      }
    } catch {
      console.log("Auto-fetch OTP skipped. User can enter manually.");
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
        }, 2500);
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
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={step !== 3 ? onClose : undefined}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative w-full max-w-[460px] bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 z-10"
        >
          {/* Step Indicator Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold ${step === 1 ? "bg-rose-600 text-white" : "bg-[#084c38] text-white"}`}>
                {step === 3 ? "✓" : step}
              </span>
              <span>
                {step === 1 && "Step 1 of 2: Confirm Deletion"}
                {step === 2 && "Step 2 of 2: Verify Security Code"}
                {step === 3 && "Account Deletion Complete"}
              </span>
            </div>
            {step !== 3 && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ──── STEP 1: Confirmation ──── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">Delete Aptora Account</h2>
                  <p className="text-[10px] text-rose-600 font-extrabold tracking-wider uppercase mt-0.5">Permanent & Irreversible</p>
                </div>
              </div>

              {/* Data Warning List */}
              <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 space-y-2.5">
                <p className="text-xs font-bold text-rose-950">The following data will be permanently cleared:</p>
                <ul className="space-y-1.5 text-xs text-rose-900 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                    Profile & login credentials
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                    AI Study plans, mock test analytics & history
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                    Saved notes, PDFs & flashcards library
                  </li>
                </ul>
              </div>

              {/* Feedback Reason Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Why are you leaving? (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Tell us how we can improve..."
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-slate-200 rounded-xl text-xs resize-none h-20 focus:outline-none focus:border-[#084c38] focus:ring-2 focus:ring-[#084c38]/10 transition-all placeholder:text-slate-400 font-medium text-slate-900"
                />
              </div>

              {/* Error Alert */}
              {error && (
                <div className="text-xs text-rose-700 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestDeletion}
                  disabled={loading}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer border-none"
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
            </div>
          )}

          {/* ──── STEP 2: OTP Verification ──── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#ecfdf5] border border-[#d1fae5] text-[#084c38] shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">Verify Deletion Code</h2>
                  <p className="text-[10px] text-[#084c38] font-extrabold tracking-wider uppercase mt-0.5">Security Verification</p>
                </div>
              </div>

              {/* Email Notice */}
              <div className="bg-[#FAF9F6] border border-slate-200/90 rounded-2xl p-3.5 flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verification OTP sent to</span>
                <span className="text-xs font-bold text-slate-900 break-all">{user?.email}</span>
              </div>

              {/* Auto Sync Pill */}
              <div className="bg-[#ecfdf5] border border-[#d1fae5] rounded-xl p-2.5 text-center">
                <p className="text-[11px] font-bold text-[#084c38] flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> OTP code auto-synced for instant verification
                </p>
              </div>

              {/* 6 Digit Inputs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Enter 6-digit OTP code:</label>
                <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
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
                        "w-11 h-13 text-center text-lg font-bold rounded-xl border-2 transition-all focus:outline-none focus:ring-0",
                        digit
                          ? "border-[#084c38] bg-[#ecfdf5] text-[#084c38]"
                          : "border-slate-200 bg-slate-50 text-slate-900 focus:border-[#084c38]"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Resend Timer */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-xs text-slate-500 font-semibold">
                    Resend code in <span className="text-slate-900 font-bold">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-xs font-bold text-[#084c38] hover:underline cursor-pointer transition-colors bg-transparent border-none"
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="text-xs text-rose-700 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setStep(1); setError(""); }}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyDeletion}
                  disabled={loading || otp.join("").length !== 6}
                  className="flex-1 py-3 bg-[#084c38] hover:bg-[#063b2b] disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer border-none"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirm Deletion"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ──── STEP 3: Success ──── */}
          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-[#ecfdf5] border border-[#d1fae5] rounded-full flex items-center justify-center mx-auto text-[#084c38] shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900 font-display">Account Deleted</h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Your Aptora account data has been permanently cleared. Redirecting to home...
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-[#084c38] font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-[#084c38]" />
                <span>Redirecting...</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

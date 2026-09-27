"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-slate-900 relative overflow-hidden px-6 py-12">
      {/* Top subtle branding strip */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#084c38] z-50" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="bg-white border border-slate-200/90 p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/40 text-center flex flex-col items-center gap-6">
          {/* Badge Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold tracking-wide rounded-full">
              System Error Intercepted
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Something went wrong
            </h1>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
              An unexpected execution error occurred. Your session state remains safe
            </p>
          </div>

          {/* Error Digest (if available) */}
          {error.digest && (
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-mono text-slate-500 truncate">
              Digest Code: {error.digest}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
            <button
              onClick={reset}
              className="w-full sm:w-auto px-5 py-3 bg-[#084c38] hover:bg-[#063b2b] text-white text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#084c38]" /> Dashboard
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


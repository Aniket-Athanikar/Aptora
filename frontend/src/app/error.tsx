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
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="relative border-2 border-amber-500/20 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-8 sm:p-10 text-center flex flex-col items-center gap-6">
          {/* Top Accent Gradient Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

          {/* Badge Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-extrabold tracking-wide uppercase rounded-full">
              System Intercepted Exception
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
              Something went wrong
            </h1>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
              An unexpected execution error occurred. Your database session state remains safe and uncorrupted.
            </p>
          </div>

          {/* Error Digest (if available) */}
          {error.digest && (
            <div className="w-full bg-amber-50/50 border border-amber-200/80 rounded-xl p-3 text-[11px] font-mono text-amber-900 truncate">
              Digest Code: {error.digest}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
            <button
              onClick={reset}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#084c38]" /> Dashboard
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}



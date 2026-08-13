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
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 relative overflow-hidden px-6 py-12">
      {/* Ambient Radial Glows */}
      <div className="absolute top-[-25%] left-[-25%] w-[600px] h-[600px] bg-gradient-to-tr from-rose-500/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-25%] w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/5 to-transparent blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="bg-white border border-slate-200/80 p-8 md:p-10 rounded-[36px] shadow-xl shadow-slate-200/40 text-center flex flex-col items-center gap-6">
          {/* Animated Warning Badge Icon */}
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-xs">
            <AlertTriangle className="w-8 h-8 text-rose-600 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-wider rounded-full">
              System Error Intercepted
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Something went wrong
            </h1>
            <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto leading-relaxed">
              An unexpected execution error occurred. We have safely intercepted your session context.
            </p>
          </div>

          {/* Error Digest (if available) */}
          {error.digest && (
            <div className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-3 text-[10px] font-mono text-slate-400 truncate">
              Digest Code: {error.digest}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
            <button
              onClick={reset}
              className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" /> Dashboard
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/[0.04] backdrop-blur-xl">
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none animate-pulse" />

      <div className="relative flex flex-col items-center gap-6 p-8 bg-white/80 backdrop-blur-md border border-white/60 rounded-[32px] shadow-2xl shadow-emerald-500/5 max-w-xs w-full mx-auto">
        {/* Concentric Spinning Rings */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-emerald-500/10 border-t-emerald-500"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          {/* Inner Ring */}
          <motion.div
            className="absolute w-14 h-14 rounded-full border-[3px] border-teal-500/10 border-b-teal-500"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
          {/* Core Sparkle Sphere */}
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-650 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="flex flex-col items-center text-center space-y-2 w-full">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 select-none">
            Aptora
          </h2>
          <span className="text-xs text-slate-500 font-medium tracking-wide animate-pulse">
            Loading Preparation Dashboard...
          </span>
        </div>
      </div>
    </div>
  );
}
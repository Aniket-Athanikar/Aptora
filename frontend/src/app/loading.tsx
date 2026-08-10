"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#6D4AFF]/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-500/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6 p-8 bg-white/80 border border-slate-200/80 rounded-[36px] shadow-xl shadow-slate-200/40">
        {/* Concentric Spinning Rings */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-t-[#6D4AFF] border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
          />
          <motion.div
            className="absolute w-11 h-11 rounded-full border-2 border-t-transparent border-r-purple-500 border-b-transparent border-l-transparent"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.3, ease: "linear" }}
          />
          <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-[#6D4AFF] to-purple-600 flex items-center justify-center shadow-md shadow-[#6D4AFF]/20">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="flex flex-col items-center text-center space-y-1">
          <span className="text-sm font-black tracking-wider text-slate-900 uppercase">
            ExamForge-<span className="text-[#6D4AFF]">AI</span>
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            Syncing Study Cockpit...
          </span>
        </div>
      </div>
    </div>
  );
}

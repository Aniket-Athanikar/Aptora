"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Aurora Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#6D4AFF]/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-500/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6 p-10 bg-white/40 border border-slate-150 rounded-[40px] shadow-sm backdrop-blur-md">
        {/* Futuristic Concentric Pulsing Rings */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-t-[#6D4AFF] border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <motion.div
            className="absolute w-14 h-14 rounded-full border-2 border-t-transparent border-r-purple-500 border-b-transparent border-l-transparent"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
          />
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#6D4AFF] to-purple-650 flex items-center justify-center shadow-lg shadow-[#6D4AFF]/20">
            <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="flex flex-col items-center text-center">
          <span className="text-base font-black tracking-wider text-slate-800 uppercase">
            ExamForge-<span className="bg-gradient-to-r from-[#6D4AFF] to-purple-600 bg-clip-text text-transparent">AI</span>
          </span>
          <span className="text-[10px] text-slate-400 font-extrabold mt-1 uppercase tracking-widest animate-pulse">
            Configuring workspace environment...
          </span>
        </div>
      </div>
    </div>
  );
}

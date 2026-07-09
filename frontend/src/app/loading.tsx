"use client";

import { motion } from "framer-motion";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAFBFF]">
      {/* Aurora Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#6D5DFB]/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#4F8CFF]/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-4">
        {/* Futuristic Pulsing Rings */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-t-[#6D5DFB] border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          />
          <motion.div
            className="absolute w-12 h-12 rounded-full border border-t-transparent border-r-[#4F8CFF] border-b-transparent border-l-transparent"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          />
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6D5DFB] to-[#4F8CFF] shadow-lg shadow-[#6D5DFB]/30" />
        </div>

        {/* Brand Text */}
        <div className="flex flex-col items-center text-center">
          <span className="text-sm font-black tracking-wider text-neutral-800 uppercase">
            ExamForge<span className="text-[#6D5DFB]"> AI</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-bold mt-0.5 animate-pulse">
            Optimizing Learning Workspace...
          </span>
        </div>
      </div>
    </div>
  );
}

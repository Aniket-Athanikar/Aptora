"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FileQuestion, HelpCircle } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-6">
      {/* Background Glows */}
      <div className="absolute top-[-25%] left-[-25%] w-[650px] h-[650px] bg-gradient-to-tr from-[#6D4AFF]/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-25%] w-[650px] h-[650px] bg-gradient-to-tr from-purple-500/5 to-transparent blur-[140px] pointer-events-none" />

      {/* Floating 3D Bobbing Question Icons */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
        className="absolute left-[12%] top-[20%] text-indigo-250 opacity-20 pointer-events-none hidden md:block"
      >
        <FileQuestion className="w-16 h-16 text-[#6D4AFF]" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 0.5 }}
        className="absolute right-[14%] bottom-[25%] text-purple-250 opacity-20 pointer-events-none hidden md:block"
      >
        <HelpCircle className="w-16 h-16 text-purple-500" />
      </motion.div>

      {/* Main glass card container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-lg w-full"
      >
        <GlassCard className="p-8 md:p-14 bg-white/70 border border-slate-150 rounded-[40px] shadow-lg text-center flex flex-col items-center gap-6">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-[#6D4AFF] text-[10px] font-black uppercase tracking-wider rounded-full shadow-3xs">
            Path Unknown
          </span>

          {/* Heading */}
          <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-[#6D4AFF] via-purple-500 to-indigo-650 bg-clip-text text-transparent tracking-tight">
            404
          </h1>

          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight">
              Page Not Found
            </h2>
            <p className="text-xs md:text-sm text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
              The page you are looking for doesn&apos;t exist or has been shifted to another syllabus segment.
            </p>
          </div>

          {/* Back Action button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#6D4AFF] hover:bg-[#5A36EE] text-white text-xs font-black uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl hover:scale-103 transition-all duration-300 cursor-pointer mt-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </GlassCard>
      </motion.div>
    </div>
  );
}

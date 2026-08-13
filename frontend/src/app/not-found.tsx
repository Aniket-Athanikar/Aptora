"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FileQuestion, HelpCircle, Compass } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 relative overflow-hidden px-6 py-12">
      {/* Background Glows */}
      <div className="absolute top-[-25%] left-[-25%] w-[650px] h-[650px] bg-gradient-to-tr from-emerald-500/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-25%] w-[650px] h-[650px] bg-gradient-to-tr from-teal-500/5 to-transparent blur-[140px] pointer-events-none" />

      {/* Floating 3D Bobbing Question Icons */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
        className="absolute left-[12%] top-[20%] opacity-20 pointer-events-none hidden md:block"
      >
        <FileQuestion className="w-16 h-16 text-emerald-500" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 0.5 }}
        className="absolute right-[14%] bottom-[25%] opacity-20 pointer-events-none hidden md:block"
      >
        <HelpCircle className="w-16 h-16 text-teal-500" />
      </motion.div>

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-lg w-full"
      >
        <div className="p-8 md:p-12 bg-white border border-slate-200/80 rounded-[40px] shadow-xl shadow-slate-200/50 text-center flex flex-col items-center gap-6">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-wider rounded-full">
            <Compass className="w-3.5 h-3.5" /> Syllabus Path Unknown
          </span>

          {/* Heading */}
          <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-emerald-600 via-teal-650 to-emerald-800 bg-clip-text text-transparent tracking-tight">
            404
          </h1>

          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Page Not Found
            </h2>
            <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto leading-relaxed">
              The page you are looking for doesn&apos;t exist or has been shifted to another syllabus segment.
            </p>
          </div>

          {/* Back Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <ArrowLeft className="w-4 h-4" /> Go to Dashboard
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Home Page
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

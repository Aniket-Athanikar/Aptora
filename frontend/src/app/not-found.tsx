"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Compass, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-slate-900 relative overflow-hidden px-6 py-12">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="relative border-2 border-emerald-500/20 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-8 sm:p-10 text-center flex flex-col items-center gap-6">
          {/* Top Accent Gradient Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />

          {/* Badge Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Compass className="w-8 h-8" />
          </div>

          {/* Heading */}
          <h1 className="text-6xl sm:text-7xl font-black bg-gradient-to-r from-[#084c38] via-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight font-display">
            404
          </h1>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#084c38] text-[11px] font-extrabold tracking-wide uppercase rounded-full">
              Syllabus Path Unknown
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
              Requested Topic Not Found
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              The page you are looking for doesn&apos;t exist or has been shifted to another workspace topic.
            </p>
          </div>

          {/* Back Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#084c38] to-[#063b2b] hover:from-[#063b2b] hover:to-[#04281d] text-white text-xs font-bold rounded-xl shadow-md shadow-[#084c38]/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <ArrowLeft className="w-4 h-4" /> Go to Dashboard
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Home className="w-4 h-4 text-[#084c38]" /> Home Page
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}



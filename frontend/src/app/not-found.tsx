"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-slate-900 relative overflow-hidden px-6 py-12">
      {/* Top subtle branding strip */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#084c38] z-50" />

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="p-8 sm:p-10 bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/40 text-center flex flex-col items-center gap-6">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ecfdf5] border border-[#d1fae5] text-[#084c38] text-[11px] font-bold tracking-wide rounded-full">
            <Compass className="w-3.5 h-3.5" /> Page Not Found
          </span>

          {/* Heading */}
          <h1 className="text-7xl md:text-8xl font-black text-[#084c38] tracking-tight">
            404
          </h1>

          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              Syllabus Path Unknown
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              The page you are looking for doesn&apos;t exist or has been shifted to another workspace topic.
            </p>
          </div>

          {/* Back Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-[#084c38] hover:bg-[#063b2b] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <ArrowLeft className="w-4 h-4" /> Go to Dashboard
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Home Page
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


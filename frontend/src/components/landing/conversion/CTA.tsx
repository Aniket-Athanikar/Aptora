"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Compass, CheckCircle2 } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-14 md:py-18 bg-[#FAF9F6] relative z-10 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Well-Proportioned Medium CTA Banner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#04271d] via-[#084c38] to-[#063b2b] text-white rounded-3xl p-7 sm:p-9 md:p-11 shadow-xl shadow-[#084c38]/20 border border-emerald-500/20 relative overflow-hidden text-center flex flex-col items-center gap-5 group glow-emerald"
        >
          {/* Subtle Ambient Glowing Mesh Blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none transform translate-x-16 -translate-y-16 animate-mesh-float" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300/15 rounded-full blur-3xl pointer-events-none transform -translate-x-12 translate-y-12 animate-pulse-glow" />

          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-200 text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-2xs relative z-10 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>START YOUR PREPARATION TODAY</span>
          </div>

          {/* Medium Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight max-w-2xl font-display text-white relative z-10">
            Ready to transform how you prepare?
          </h2>

          {/* Medium Subtext */}
          <p className="text-xs sm:text-sm text-emerald-100/90 font-normal max-w-lg leading-relaxed relative z-10">
            Build a smarter preparation routine with Aptora&apos;s AI planning engine, practice quizzes, and real-time diagnostic analytics.
          </p>

          {/* Medium Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 w-full sm:w-auto relative z-10">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-[#084c38] font-extrabold text-xs sm:text-sm hover:bg-emerald-50 shadow-lg shadow-black/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group/btn overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-emerald-100/30 -translate-x-full group-hover/btn:animate-shimmer pointer-events-none" />
              <span>Start Preparing Now</span>
              <ArrowRight className="w-4 h-4 text-[#084c38] transition-transform duration-300 group-hover/btn:translate-x-1.5" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 text-white font-bold text-xs sm:text-sm hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-md cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-300" />
              <span>Explore Features</span>
            </a>
          </div>

          {/* Compact Highlights Bar */}
          <div className="flex flex-wrap items-center justify-center gap-5 pt-2 text-[11px] sm:text-xs font-semibold text-emerald-200/80 relative z-10">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Free Trial Available
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant Setup
            </span>
          </div>

        </motion.div>
      </div>
    </section>
  );
}

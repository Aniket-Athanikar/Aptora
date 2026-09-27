"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Compass } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-16 md:py-20 bg-[#FAF9F6] relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Well-Proportioned Medium CTA Card */}
        <div className="bg-gradient-to-br from-[#063b2b] via-[#084c38] to-[#0a634a] text-white rounded-3xl p-8 sm:p-10 md:p-12 shadow-xl shadow-[#084c38]/20 border border-white/10 relative overflow-hidden text-center flex flex-col items-center gap-5 sm:gap-6 group">
          
          {/* Subtle Ambient Glow Blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#10b981]/20 rounded-full blur-2xl pointer-events-none transform -translate-x-10 translate-y-10" />

          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-100 text-xs font-bold uppercase tracking-wider shadow-2xs relative z-10 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Start Your Preparation Today</span>
          </div>

          {/* Medium Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight max-w-2xl font-display text-white relative z-10">
            Ready to transform how you prepare?
          </h2>

          {/* Medium Subtext */}
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-lg leading-relaxed relative z-10">
            Build a smarter preparation routine with Aptora&apos;s AI planning engine, practice quizzes, and real-time analytics.
          </p>

          {/* Medium Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full sm:w-auto relative z-10">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#084c38] font-bold text-xs sm:text-sm hover:bg-emerald-50 shadow-md shadow-black/10 transition-all cursor-pointer group/btn"
            >
              <span>Start Preparing</span>
              <ArrowRight className="w-4 h-4 text-[#084c38] transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white font-semibold text-xs sm:text-sm hover:bg-white/10 transition-all backdrop-blur-xs cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-300" />
              <span>Explore Features</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}

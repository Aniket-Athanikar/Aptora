"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Award, Briefcase, RefreshCw, Sparkles } from "lucide-react";

export default function Users() {
  const categories = [
    {
      title: "Full-Time Students",
      desc: "Aspirants dedicating their primary routine to exam preparation. Aptora structures full daily study calendars to ensure complete syllabus coverage well before exam day.",
      icon: GraduationCap,
      tag: "Structured Routine",
      color: "from-[#084c38] to-[#059669]",
      badgeBg: "bg-emerald-50 text-[#084c38] border-emerald-200",
    },
    {
      title: "Competitive Exam Aspirants",
      desc: "Focused candidates targeting top-rank results in UPSC, SSC, or Banking. Uses advanced diagnostic analytics to pinpoint high-yield topics and eliminate margin of error.",
      icon: Award,
      tag: "Targeted Excellence",
      color: "from-blue-500 to-indigo-600",
      badgeBg: "bg-blue-50 text-blue-900 border-blue-200",
    },
    {
      title: "Working Professionals",
      desc: "Candidates balancing full-time jobs with 2-4 hours of daily study. Aptora prioritizes high-yield AI note summaries and quick-revision flashcards for maximum efficiency.",
      icon: Briefcase,
      tag: "High-Efficiency Prep",
      color: "from-purple-500 to-pink-600",
      badgeBg: "bg-purple-50 text-purple-900 border-purple-200",
    },
    {
      title: "Repeat & Foundation Aspirants",
      desc: "Candidates refining strategy after initial attempts. Focuses on weak-area diagnostic repair, PYQ pattern mastery, and timed mock test execution.",
      icon: RefreshCw,
      tag: "Strategy Refinement",
      color: "from-amber-500 to-orange-600",
      badgeBg: "bg-amber-50 text-amber-900 border-amber-200",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#FAF9F6] border-t border-slate-200/90 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#084c38] text-xs font-black uppercase tracking-widest mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>TAILORED PREPARATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
            Built around the way you prepare
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            Whether you study 10 hours a day or 2 hours after work, Aptora adapts to your schedule and goals
          </p>
        </div>

        {/* Audience Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-xl p-8 md:p-10 flex flex-col justify-between overflow-hidden hover:border-emerald-400 hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Top Accent Gradient Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />

                <div>
                  <div className="flex items-center justify-between mb-6 pt-1">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-all`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-xs font-black font-display ${cat.badgeBg}`}>
                      {cat.tag}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 font-display mb-3 group-hover:text-[#084c38] transition-colors">
                    {cat.title}
                  </h3>

                  <p className="text-slate-600 text-base leading-relaxed font-normal">
                    {cat.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

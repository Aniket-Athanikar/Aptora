"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Award, Briefcase, RefreshCw } from "lucide-react";

export default function Users() {
  const categories = [
    {
      title: "Full-Time Students",
      desc: "Aspirants dedicating their primary routine to exam preparation. Aptora structures full daily study calendars to ensure complete syllabus coverage well before exam day.",
      icon: GraduationCap,
      tag: "Structured Routine",
    },
    {
      title: "Competitive Exam Aspirants",
      desc: "Focused candidates targeting top-rank results in UPSC, SSC, or Banking. Uses advanced diagnostic analytics to pinpoint high-yield topics and eliminate margin of error.",
      icon: Award,
      tag: "Targeted Excellence",
    },
    {
      title: "Working Professionals",
      desc: "Candidates balancing full-time jobs with 2-4 hours of daily study. Aptora prioritizes high-yield AI note summaries and quick-revision flashcards for maximum efficiency.",
      icon: Briefcase,
      tag: "High-Efficiency Prep",
    },
    {
      title: "Repeat & Foundation Aspirants",
      desc: "Candidates refining strategy after initial attempts. Focuses on weak-area diagnostic repair, PYQ pattern mastery, and timed mock test execution.",
      icon: RefreshCw,
      tag: "Strategy Refinement",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#FAF9F6] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3">
            Tailored Preparation
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Built around the way you prepare
          </h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">
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
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-8 md:p-10 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between hover:border-emerald-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-700">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/60">
                      {cat.tag}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 font-display mb-3">
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

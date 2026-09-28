"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Layers, Target, Trophy, Award, Sparkles } from "lucide-react";

export default function Exams() {
  const examCategories = [
    {
      id: "upsc",
      title: "UPSC Civil Services",
      desc: "Comprehensive Prelims & Mains preparation with structured syllabus tracking, current-affairs integration, mock tests, and active revision notes.",
      subjects: ["Polity", "Economy", "Modern History", "Geography", "Environment", "CSAT"],
      tools: ["AI PYQ Finder", "Answer Structuring", "Mock Test Engine"],
      cta: "Explore UPSC",
      badge: "Premier Category",
      icon: Award,
      color: "from-[#084c38] to-[#059669]",
      badgeBg: "bg-emerald-50 text-[#084c38] border-emerald-200",
    },
    {
      id: "ssc",
      title: "SSC CGL & CHSL",
      desc: "High-speed Tier 1 & Tier 2 prep with timed speed drills, quantitative aptitude shortcuts, reasoning sets, and weekly full-length mocks.",
      subjects: ["Quant", "Reasoning", "English Comprehension", "General Awareness"],
      tools: ["Speed Drills", "Formula Flashcards", "Tier 2 Mocks"],
      cta: "Explore SSC CGL",
      badge: "Popular Category",
      icon: Target,
      color: "from-blue-500 to-indigo-600",
      badgeBg: "bg-blue-50 text-blue-900 border-blue-200",
    },
    {
      id: "banking",
      title: "Banking (IBPS, SBI PO & Clerk)",
      desc: "Prelims & Mains exam strategy focusing on sectional speed, data interpretation accuracy, reasoning puzzles, and banking awareness notes.",
      subjects: ["Data Interpretation", "Reasoning Puzzles", "English", "Financial Awareness"],
      tools: ["Puzzle Timers", "Sectional Analytics", "Mains Mocks"],
      cta: "Explore Banking",
      badge: "High Velocity",
      icon: Trophy,
      color: "from-purple-500 to-pink-600",
      badgeBg: "bg-purple-50 text-purple-900 border-purple-200",
    },
    {
      id: "railway",
      title: "Railway (RRB NTPC & Group D)",
      desc: "Structured syllabus coverage tailored for Computer Based Tests (CBT-1 & CBT-2) with general science guides and practice sets.",
      subjects: ["General Science", "Mathematics", "General Intelligence", "Current Affairs"],
      tools: ["CBT Simulation", "Science PYQs", "Topic Tests"],
      cta: "Explore Railway",
      badge: "CBT Ready",
      icon: BookOpen,
      color: "from-amber-500 to-orange-600",
      badgeBg: "bg-amber-50 text-amber-900 border-amber-200",
    },
    {
      id: "state-psc",
      title: "State PSC Exams",
      desc: "State-specific General Studies preparation covering state history, geography, local governance, PYQs, and custom AI revision cards.",
      subjects: ["State GS", "Indian Polity", "Geography", "State History & Culture"],
      tools: ["State PYQ Bank", "Custom Notes Engine", "Mock Tests"],
      cta: "Explore State PSC",
      badge: "State Specific",
      icon: Layers,
      color: "from-teal-500 to-emerald-600",
      badgeBg: "bg-teal-50 text-teal-900 border-teal-200",
    },
  ];

  return (
    <section id="exams" className="py-24 md:py-32 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#084c38] text-xs font-black uppercase tracking-widest mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>EXAM DISCOVERY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
            Prepare for the exam you&apos;re targeting
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            Aptora provides dedicated preparation modules tailored to the unique syllabus and exam pattern of India&apos;s major competitive examinations
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examCategories.map((exam, idx) => {
            const Icon = exam.icon;
            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-xl p-8 flex flex-col justify-between overflow-hidden hover:border-emerald-400 hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Top Accent Gradient Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />

                <div>
                  <div className="flex items-center justify-between mb-6 pt-1">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${exam.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-all`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-xs font-black font-display ${exam.badgeBg}`}>
                      {exam.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 font-display mb-3 group-hover:text-[#084c38] transition-colors">
                    {exam.title}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                    {exam.desc}
                  </p>

                  <div className="mb-6">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                      Key Subjects
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {exam.subjects.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-800 text-xs font-bold group-hover:border-emerald-300 transition-colors"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold">
                    {exam.tools.length} Prep Tools Included
                  </span>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#084c38] hover:text-[#059669] transition-colors group/link"
                  >
                    <span>{exam.cta}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

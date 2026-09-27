"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Layers, Target, Trophy, Award } from "lucide-react";

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
    },
  ];

  return (
    <section id="exams" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3">
            Exam Discovery
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Prepare for the exam you're targeting
          </h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">
            Aptora provides dedicated preparation modules tailored to the unique syllabus and exam pattern of India's major competitive examinations
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examCategories.map((exam, idx) => {
            const Icon = exam.icon;
            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-8 rounded-2xl bg-[#FAF9F6] border border-slate-200 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold">
                      {exam.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 font-display mb-3">
                    {exam.title}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                    {exam.desc}
                  </p>

                  <div className="mb-6">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Key Subjects
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {exam.subjects.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-xs font-medium"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {exam.tools.length} Prep Tools Included
                  </span>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{exam.cta}</span>
                    <ArrowRight className="w-4 h-4" />
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

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Flame,
  LineChart,
  ChevronRight,
  MessageSquare,
  FileText,
  Layers,
  Clock,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-[#FAF9F6] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Headline & Action Buttons matching reference screenshot */}
          <div className="lg:col-span-6 flex flex-col items-start">

            {/* Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ecfdf5] border border-[#d1fae5] text-[#084c38] text-xs font-black uppercase tracking-widest mb-5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#084c38] animate-pulse" />
              <span>SMARTER STUDY. BETTER RESULTS.</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[58px] font-black tracking-tight text-slate-900 leading-[1.08] font-display mb-6"
            >
              Your study material, <br />
              <span className="bg-gradient-to-r from-[#084c38] via-[#059669] to-[#063b2b] bg-clip-text text-transparent">
                turned into practice
              </span>
            </motion.h1>

            {/* Description Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-8 font-normal"
            >
              Select your notes, PDFs or textbooks and let Aptora build structured practice, tests and revision plans — powered by AI
            </motion.p>

            {/* Glowing Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base text-white bg-[#084c38] hover:bg-[#063c2b] shadow-lg shadow-[#084c38]/25 hover:shadow-xl hover:shadow-[#084c38]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <span>Start Preparing</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/features"
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-base text-slate-800 bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all duration-300"
              >
                Explore Platform
              </Link>
            </motion.div>

          </div>

          {/* Right Column: Dashboard UI Preview Mockup matching reference screenshot */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl bg-white border border-slate-200/90 shadow-xl p-4 sm:p-5 text-slate-800 font-sans space-y-4"
            >
              {/* Mockup App Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#084c38] flex items-center justify-center text-white text-[10px] font-black">
                    A
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 font-display">Aptora</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                  AA
                </div>
              </div>

              {/* Mockup Main Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">

                {/* Left Sidebar inside Mockup */}
                <div className="hidden sm:block md:col-span-3 space-y-2 border-r border-slate-100 pr-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-[#084c38] font-bold text-xs">
                    <BookOpen className="w-3.5 h-3.5" /> Home
                  </div>
                  <div className="flex items-center gap-2 p-2 text-slate-500 font-medium text-xs hover:text-slate-900">
                    <FileText className="w-3.5 h-3.5" /> Study Material
                  </div>
                  <div className="flex items-center gap-2 p-2 text-slate-500 font-medium text-xs hover:text-slate-900">
                    <Sparkles className="w-3.5 h-3.5" /> Practice
                  </div>
                  <div className="flex items-center gap-2 p-2 text-slate-500 font-medium text-xs hover:text-slate-900">
                    <Layers className="w-3.5 h-3.5" /> Tests
                  </div>
                  <div className="flex items-center gap-2 p-2 text-slate-500 font-medium text-xs hover:text-slate-900">
                    <Clock className="w-3.5 h-3.5" /> Revision
                  </div>
                  <div className="flex items-center gap-2 p-2 text-slate-500 font-medium text-xs hover:text-slate-900">
                    <LineChart className="w-3.5 h-3.5" /> Analytics
                  </div>
                </div>

                {/* Center Content inside Mockup */}
                <div className="md:col-span-9 space-y-4">
                  {/* Greeting */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Good morning, Jhon👋</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Keep going! You're making great progress</p>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-500 font-medium">Overall Progress</span>
                      <p className="text-sm font-bold text-slate-900">72%</p>
                      <div className="w-full bg-slate-200 rounded-full h-1">
                        <div className="bg-emerald-500 h-1 rounded-full" style={{ width: "72%" }} />
                      </div>
                      <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">Keep it up!</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-500 font-medium">Tests Completed</span>
                      <p className="text-sm font-bold text-slate-900">12</p>
                      <span className="text-[9px] text-emerald-600 font-medium">+3 this week</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-500 font-medium">Questions Practiced</span>
                      <p className="text-sm font-bold text-slate-900">842</p>
                      <span className="text-[9px] text-emerald-600 font-medium">+120 this week</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-500 font-medium">Study Streak 🔥</span>
                      <p className="text-sm font-bold text-slate-900">5 <span className="text-[11px] text-slate-500 font-normal">days</span></p>
                      <span className="text-[9px] text-emerald-600 font-medium">+1 today</span>
                    </div>
                  </div>

                  {/* Continue Learning List */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-800">Continue Learning</span>
                    <div className="space-y-1.5 text-xs">

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs hover:border-slate-300">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                            English
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">General English</p>
                            <p className="text-[10px] text-slate-400">Last studied 2 days ago</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs hover:border-slate-300">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[10px] flex items-center justify-center">
                            POL
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">Polity & Governance</p>
                            <p className="text-[10px] text-slate-400">Continue revision</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs hover:border-slate-300">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] flex items-center justify-center">
                            PHY
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">Physics - Modern Physics</p>
                            <p className="text-[10px] text-slate-400">Practice test available</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
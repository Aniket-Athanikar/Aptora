"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Flame,
  LineChart,
  ChevronRight,
  FileText,
  Layers,
  Clock,
  Zap,
  CheckCircle2,
  TrendingUp,
  Target,
  BrainCircuit,
  Bot,
  Activity,
  Award,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-14 md:pt-32 md:pb-20 bg-[#FAF9F6] overflow-hidden bg-grid-pattern">
      {/* Background Animated Gradient Mesh Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[480px] bg-gradient-to-tr from-emerald-200/40 via-emerald-400/20 to-teal-300/30 rounded-full blur-[130px] pointer-events-none animate-mesh-float z-0" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none animate-pulse-glow z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

          {/* Left Column: Headline & Action Buttons */}
          <div className="lg:col-span-6 flex flex-col items-start">

            {/* Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#084c38] text-xs font-black uppercase tracking-widest mb-5 shadow-2xs backdrop-blur-sm"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <Sparkles className="w-3.5 h-3.5 text-[#084c38]" />
              <span>SMARTER STUDY. BETTER RESULTS.</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.08] font-display mb-5"
            >
              Your study material, <br />
              <span className="bg-gradient-to-r from-[#084c38] via-[#059669] to-[#047857] bg-clip-text text-transparent">
                turned into practice
              </span>
            </motion.h1>

            {/* Description Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-7 font-normal"
            >
              Select your notes, PDFs or textbooks and let Aptora build structured practice, tests and revision plans — powered by AI.
            </motion.p>

            {/* Glowing Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-[#084c38] to-[#059669] hover:from-[#063b2b] hover:to-[#047857] shadow-lg shadow-[#084c38]/25 hover:shadow-xl hover:shadow-[#084c38]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                <span>Start Preparing</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>

              <Link
                href="/features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-extrabold text-base text-slate-800 bg-white/90 border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/40 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 backdrop-blur-sm"
              >
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Explore Platform</span>
              </Link>
            </motion.div>

            {/* Quick Feature Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero setup required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI-powered OCR note extraction</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>PYQ & Syllabus aligned</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Unique Colorful Dashboard UI Preview Mockup */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0">
            
            {/* Floating Decorative Badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -top-4 -right-2 z-20 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-emerald-300/80 shadow-xl text-xs font-bold text-slate-900 backdrop-blur-md glow-emerald"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xs">
                <Flame className="w-4 h-4 fill-white" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold leading-none uppercase tracking-wider">Streak Bonus</p>
                <p className="text-xs font-black text-slate-900 font-display">5 Days Consistency 🔥</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -bottom-4 -left-2 z-20 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 text-white border border-slate-700/80 shadow-2xl text-xs font-bold backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xs">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-400/90 font-semibold leading-none uppercase tracking-wider">Accuracy Boost</p>
                <p className="text-xs font-black text-emerald-300 font-display">+24% Mock Accuracy</p>
              </div>
            </motion.div>

            {/* Modern Colorful Dashboard Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-2xl shadow-emerald-950/10 p-4 sm:p-5 text-slate-800 font-sans space-y-3.5 backdrop-blur-md overflow-hidden"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />

              {/* Mockup App Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#084c38] to-[#059669] flex items-center justify-center text-white text-xs font-black shadow-md shadow-[#084c38]/20">
                    A
                  </div>
                  <div>
                    <span className="font-black text-sm text-slate-900 font-display tracking-tight block leading-tight">
                      Aptora AI Workspace
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">Target: UPSC Prelims 2026</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-[10px] font-black tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    AI ACTIVE ✦ LIVE
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                    MC
                  </div>
                </div>
              </div>

              {/* Mockup Inner Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">

                {/* Left Mini Sidebar */}
                <div className="hidden sm:block md:col-span-3 space-y-1 border-r border-slate-100 pr-2.5">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-[#084c38] font-black text-xs shadow-2xs">
                    <BookOpen className="w-3.5 h-3.5" /> Dashboard
                  </div>
                  <div className="flex items-center gap-2 p-2 text-slate-500 font-bold text-xs hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                    <FileText className="w-3.5 h-3.5 text-blue-500" /> AI Notes
                  </div>
                  <div className="flex items-center gap-2 p-2 text-slate-500 font-bold text-xs hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                    <BrainCircuit className="w-3.5 h-3.5 text-purple-500" /> Smart Practice
                  </div>
                  <div className="flex items-center gap-2 p-2 text-slate-500 font-bold text-xs hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                    <Layers className="w-3.5 h-3.5 text-amber-500" /> Mock Tests
                  </div>
                  <div className="flex items-center gap-2 p-2 text-slate-500 font-bold text-xs hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                    <Clock className="w-3.5 h-3.5 text-teal-500" /> Active Recall
                  </div>
                  <div className="flex items-center gap-2 p-2 text-slate-500 font-bold text-xs hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                    <Activity className="w-3.5 h-3.5 text-rose-500" /> Analytics
                  </div>
                </div>

                {/* Main Content Pane */}
                <div className="md:col-span-9 space-y-3.5">
                  {/* Greeting Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900 via-[#084c38] to-teal-900 text-white flex items-center justify-between shadow-md">
                    <div>
                      <h4 className="text-xs font-black text-white font-display flex items-center gap-1.5">
                        <span>Welcome back, Aspirant</span>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                      </h4>
                      <p className="text-[11px] text-emerald-100/80 font-medium">Daily Target: 3 Study Blocks • 85% Mastery</p>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
                      Phase 2 Active
                    </span>
                  </div>

                  {/* 4 Metric Cards with Vibrant Pastel Tints */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Metric 1 */}
                    <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-1">
                      <span className="text-[10px] text-emerald-800 font-bold block">Syllabus Covered</span>
                      <p className="text-base font-black text-slate-900 font-display">76%</p>
                      <div className="w-full bg-emerald-200/80 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "76%" }}
                          transition={{ duration: 1, delay: 0.4 }}
                          className="bg-emerald-600 h-full rounded-full"
                        />
                      </div>
                      <span className="text-[9px] text-emerald-700 font-black block">On Schedule</span>
                    </div>

                    {/* Metric 2 */}
                    <div className="p-2.5 rounded-2xl bg-blue-50/60 border border-blue-200/70 space-y-1">
                      <span className="text-[10px] text-blue-800 font-bold block">Mock Tests</span>
                      <p className="text-base font-black text-slate-900 font-display">14 <span className="text-[10px] text-slate-500 font-normal">Taken</span></p>
                      <span className="text-[9px] text-blue-700 font-black block">+3 this week</span>
                    </div>

                    {/* Metric 3 */}
                    <div className="p-2.5 rounded-2xl bg-purple-50/60 border border-purple-200/70 space-y-1">
                      <span className="text-[10px] text-purple-800 font-bold block">Questions Solved</span>
                      <p className="text-base font-black text-slate-900 font-display">1,240</p>
                      <span className="text-[9px] text-purple-700 font-black block">92% Accuracy</span>
                    </div>

                    {/* Metric 4 */}
                    <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                      <span className="text-[10px] text-amber-800 font-bold block">Study Streak 🔥</span>
                      <p className="text-base font-black text-slate-900 font-display">5 <span className="text-[10px] text-slate-500 font-normal">Days</span></p>
                      <span className="text-[9px] text-amber-700 font-black block">+1 Today</span>
                    </div>
                  </div>

                  {/* High Yield Active Study List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-slate-900 font-display uppercase tracking-wider">Recommended Revision Blocks</span>
                      <span className="text-[10px] text-emerald-700 font-black hover:underline cursor-pointer">Explore All &rarr;</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {/* Item 1 */}
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0">
                            POL
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs font-display">Polity & Governance — Preamble & Articles</p>
                            <p className="text-[10px] text-slate-400">Revision queued • 15 PYQs Available</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          Ready
                        </span>
                      </div>

                      {/* Item 2 */}
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-300 text-blue-800 font-black text-[10px] flex items-center justify-center shrink-0">
                            ECO
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs font-display">Indian Economy — Monetary Policy & RBI</p>
                            <p className="text-[10px] text-slate-400">High weightage topic • 92% Confidence</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                          In Progress
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Assistant Quick Prompt Bar */}
                  <div className="p-2 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2 px-2">
                      <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-300 truncate">
                        Ask Aptora AI: "Summarize Fiscal Deficit for UPSC Prelims"
                      </span>
                    </div>
                    <button className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] hover:bg-emerald-400 transition-colors shrink-0 cursor-pointer">
                      Generate
                    </button>
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
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, FileCheck, BookMarked, Sparkles, LineChart, Bot, Check, Clock, Award, ShieldCheck, Flame } from "lucide-react";

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState("plan");

  const tabs = [
    { id: "plan", label: "AI Study Plan", icon: Calendar },
    { id: "mocks", label: "Mock Tests", icon: FileCheck },
    { id: "library", label: "My Library", icon: BookMarked },
    { id: "notes", label: "AI Notes", icon: Sparkles },
    { id: "analytics", label: "Progress Analytics", icon: LineChart },
    { id: "coach", label: "AI Coach", icon: Bot },
  ];

  const content: Record<string, { title: string; subtitle: string; description: string; highlights: string[]; mockup: React.ReactNode }> = {
    plan: {
      title: "AI Goal Engine & Daily Study Planner",
      subtitle: "Dynamic schedule that adjusts as your exam date approaches.",
      description: "Aptora breaks down your entire syllabus into manageable daily study targets. Missed a day? The AI automatically reschedules topics without overloading your calendar.",
      highlights: [
        "Syllabus breakdown by weightage",
        "Auto-adjusting catch-up algorithms",
        "Time-blocking for revision & practice",
      ],
      mockup: (
        <div className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-2xl p-5 sm:p-6 text-slate-800 font-sans space-y-4 overflow-hidden glow-emerald">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 pt-1">
            <span className="text-xs font-black text-[#084c38] uppercase tracking-widest font-display flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              AI CALENDAR SYNC • ACTIVE PLAN
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Target: UPSC Prelims 2026
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between shadow-2xs">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-slate-900 font-display">09:00 AM - 11:30 AM • Indian Polity</span>
                <p className="text-[11px] text-slate-500 font-medium">Judiciary & Supreme Court Directives (Ch 26)</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-[11px] shadow-xs">
                Completed ✓
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between shadow-2xs">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-slate-900 font-display">02:00 PM - 04:00 PM • Mock Series</span>
                <p className="text-[11px] text-slate-500 font-medium">Full Length Polity Mock 04 (50 Questions)</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-black text-[11px] shadow-xs">
                In Progress ⚡
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex items-center justify-between shadow-2xs">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-slate-900 font-display">06:00 PM - 07:30 PM • Active Recall</span>
                <p className="text-[11px] text-slate-500 font-medium">Modern History Flashcards • 45 Cards Queued</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-black text-[11px]">
                Upcoming
              </span>
            </div>
          </div>
        </div>
      ),
    },
    mocks: {
      title: "Smart Mock Tests & Question Bank",
      subtitle: "Exam-realistic simulated environment with detailed explanations.",
      description: "Practice mock tests curated specifically around your exam board's pattern. Every question comes with instant step-by-step solutions and concept explanations.",
      highlights: [
        "Timed exam environment",
        "Instant explanation for every option",
        "Negative marking calculation & time analysis",
      ],
      mockup: (
        <div className="relative rounded-3xl bg-slate-900 text-white border-2 border-emerald-500/30 shadow-2xl p-5 sm:p-6 space-y-4 overflow-hidden glow-emerald">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500" />
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 pt-1">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest font-display">
              Question 14 of 50 • Polity Mock 04
            </span>
            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Time Left: 42:10
            </span>
          </div>

          <p className="text-sm font-black text-slate-100 leading-relaxed font-display">
            Which Constitutional Amendment inserted Article 21A into the Indian Constitution declaring Free and Compulsory Education?
          </p>

          <div className="space-y-2">
            {[
              { text: "86th Amendment Act, 2002", correct: true },
              { text: "44th Amendment Act, 1978", correct: false },
              { text: "42nd Amendment Act, 1976", correct: false },
              { text: "91st Amendment Act, 2003", correct: false },
            ].map((opt, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-colors ${
                  opt.correct
                    ? "bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/50"
                    : "bg-slate-800/60 border-slate-700 text-slate-300"
                }`}
              >
                <span>{String.fromCharCode(65 + i)}. {opt.text}</span>
                {opt.correct && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-[11px] text-emerald-300 font-medium">
            💡 <strong>AI Solution:</strong> The 86th Constitutional Amendment Act, 2002 inserted Article 21A making elementary education a fundamental right for children aged 6 to 14.
          </div>
        </div>
      ),
    },
    library: {
      title: "Centralized Student Resource Library",
      subtitle: "Organize books, NCERTs, PYQs, and class notes in one place.",
      description: "Upload study materials or select standard reference books. Aptora indexes every textbook so you can search across chapters or convert them into AI summary cards.",
      highlights: [
        "PDF & scanned textbook OCR",
        "Semantic search across all study material",
        "Custom tag & syllabus mapping",
      ],
      mockup: (
        <div className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-2xl p-5 sm:p-6 text-slate-800 font-sans space-y-4 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />

          <div className="flex items-center justify-between border-b border-slate-100 pb-3 pt-1">
            <span className="text-xs font-black text-[#084c38] uppercase tracking-widest font-display">
              My Library • 12 Active Textbooks
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Storage Used: 2.4 GB
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1 hover:border-emerald-400 transition-colors">
              <span className="text-xs font-black text-[#084c38] font-display block">Indian Polity (M. Laxmikanth)</span>
              <p className="text-[11px] text-slate-500 font-medium">6th Edition • 800 Pages Indexed</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-200/60 text-[#084c38] text-[9px] font-bold">100% OCR Processed</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1 hover:border-blue-400 transition-colors">
              <span className="text-xs font-black text-blue-900 font-display block">Modern History (Spectrum)</span>
              <p className="text-[11px] text-slate-500 font-medium">Revised Edition • 650 Pages</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-blue-200/60 text-blue-900 text-[9px] font-bold">Summary Flashcards Ready</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1 hover:border-purple-400 transition-colors">
              <span className="text-xs font-black text-purple-900 font-display block">Indian Economy (Ramesh Singh)</span>
              <p className="text-[11px] text-slate-500 font-medium">14th Edition • 540 Pages</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-purple-200/60 text-purple-900 text-[9px] font-bold">PYQ Mapped</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1 hover:border-amber-400 transition-colors">
              <span className="text-xs font-black text-amber-900 font-display block">Environment (Shankar IAS)</span>
              <p className="text-[11px] text-slate-500 font-medium">9th Edition • 420 Pages</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 text-[9px] font-bold">12 Revision Notes</span>
            </div>
          </div>
        </div>
      ),
    },
    notes: {
      title: "AI Notes & Active-Recall Summaries",
      subtitle: "Turn 100-page chapters into high-yield 2-page revision guides.",
      description: "Aptora synthesizes complex textbook chapters into crisp bullet points, key dates, memory anchors, and active-recall flashcard sets.",
      highlights: [
        "High-yield bullet point summaries",
        "Key articles & case law extraction",
        "One-click flashcard generation",
      ],
      mockup: (
        <div className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-2xl p-5 sm:p-6 text-slate-800 font-sans space-y-3.5 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />

          <div className="flex items-center justify-between border-b border-slate-100 pb-3 pt-1">
            <span className="text-xs font-black text-[#084c38] uppercase tracking-widest font-display">
              AI Note Summary • Chapter 3: Preamble
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black">
              Active Recall Ready
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
              <p className="font-black text-[#084c38] font-display">• Key Words Added by 42nd Amendment (1976):</p>
              <p className="pl-3 text-emerald-900 font-bold font-mono">Socialist, Secular, Integrity</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-black text-slate-900 font-display">• Kesavananda Bharati Case (1973):</p>
              <p className="pl-3 text-slate-600 font-medium leading-relaxed">
                Supreme Court held that Preamble IS a part of the Constitution and CAN be amended subject to Basic Structure doctrine.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    analytics: {
      title: "Real-Time Accuracy & Mastery Metrics",
      subtitle: "Know exactly which topics are driving or dropping your score.",
      description: "Visual charts break down your performance across subject domains, speed per question, confidence scores, and historical score trajectories.",
      highlights: [
        "Accuracy percentage by subject & sub-topic",
        "Time management & speed breakdown",
        "Historical mock score progression",
      ],
      mockup: (
        <div className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-2xl p-5 sm:p-6 text-slate-800 font-sans space-y-4 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />

          <div className="flex items-center justify-between border-b border-slate-100 pb-3 pt-1">
            <span className="text-xs font-black text-[#084c38] uppercase tracking-widest font-display">
              Performance Dashboard
            </span>
            <span className="text-xs font-black text-slate-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Overall Accuracy: 84.2%
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-900 font-black font-display">
                <span>Polity & Governance</span>
                <span className="text-emerald-700">92%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "92%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-900 font-black font-display">
                <span>Indian Economy</span>
                <span className="text-teal-700">86%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: "86%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-900 font-black font-display">
                <span>Environment & Ecology</span>
                <span className="text-blue-700">78%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "78%" }} />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    coach: {
      title: "24/7 Aptora AI Tutor & Mentor",
      subtitle: "Ask questions, clarify doubts, and get instant PYQ analysis.",
      description: "Stuck on a tricky concept or PYQ? Chat directly with the Aptora AI Tutor to get simplified explanations, historical context, and mnemonics.",
      highlights: [
        "Instant doubt resolution in natural language",
        "PYQ contextual breakdown",
        "Mnemonics & memory technique generator",
      ],
      mockup: (
        <div className="relative rounded-3xl bg-slate-900 text-white border-2 border-emerald-500/30 shadow-2xl p-5 sm:p-6 space-y-3.5 overflow-hidden glow-emerald">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500" />

          <div className="flex items-center justify-between border-b border-slate-800 pb-3 pt-1">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest font-display">
              Aptora AI Tutor
            </span>
            <span className="text-[10px] text-emerald-300 font-black px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> ONLINE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-200">
              <p className="font-black text-slate-400 text-[10px] mb-1 uppercase tracking-wider">User Question</p>
              Explain the difference between Writ of Habeas Corpus and Mandamus?
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-700/60 text-emerald-100 space-y-1 leading-relaxed shadow-lg">
              <p className="font-black text-emerald-400 text-[10px] mb-1 uppercase tracking-wider">Aptora AI Tutor Answer</p>
              • <strong>Habeas Corpus</strong> ("To have the body"): Issued against illegal detention. Can be issued against public AND private individuals<br />
              • <strong>Mandamus</strong> ("We command"): Issued to compel a public official to perform statutory duty. CANNOT be issued against private individuals
            </div>
          </div>
        </div>
      ),
    },
  };

  const current = content[activeTab];

  return (
    <section id="features" className="py-24 md:py-32 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#084c38] text-xs font-black uppercase tracking-widest mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>PRODUCT SHOWCASE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
            Everything you need to stay on track
          </h2>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 border-b border-slate-200/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${isActive
                  ? "text-white shadow-md shadow-[#084c38]/20"
                  : "bg-slate-50/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
                  }`}
              >
                <Icon className="w-4 h-4 z-10 relative" />
                <span className="z-10 relative font-display">{tab.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-gradient-to-r from-[#084c38] to-[#059669] rounded-2xl -z-0"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            {/* Left: Feature Text & Details */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 font-display leading-tight">
                {current.title}
              </h3>
              <p className="text-[#084c38] font-bold text-base font-display">
                {current.subtitle}
              </p>
              <p className="text-slate-600 text-base leading-relaxed font-normal">
                {current.description}
              </p>

              <div className="space-y-3.5 pt-2">
                {current.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 text-[#084c38] flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 font-display">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Interactive Product Mockup */}
            <div className="lg:col-span-7">
              {current.mockup}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}

export default ProductShowcase;

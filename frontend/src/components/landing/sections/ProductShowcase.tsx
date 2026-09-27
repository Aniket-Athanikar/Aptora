"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, FileCheck, BookMarked, Sparkles, LineChart, Bot, Check } from "lucide-react";

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
        <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">AI Calendar Sync • Active Plan</span>
            <span className="text-xs text-slate-400">Target: UPSC Prelims 2026</span>
          </div>
          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white">09:00 AM - 11:30 AM • Indian Polity</span>
                <p className="text-[11px] text-slate-400">Judiciary & Supreme Court Directives (Ch 26)</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">Completed</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white">02:00 PM - 04:00 PM • Mock Series</span>
                <p className="text-[11px] text-slate-400">Full Length Polity Mock 04 (50 Questions)</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">In Progress</span>
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
        <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Question 14 of 50 • Polity Mock 04</span>
            <span className="text-xs font-mono text-slate-300">Time Left: 42:10</span>
          </div>
          <p className="text-sm font-semibold text-slate-200 leading-relaxed">
            Which of the following Constitutional Amendments inserted Article 21A into the Indian Constitution declaring Free and Compulsory Education?
          </p>
          <div className="space-y-2">
            {["86th Amendment Act, 2002", "44th Amendment Act, 1978", "42nd Amendment Act, 1976", "91st Amendment Act, 2003"].map((opt, i) => (
              <div key={i} className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-between ${i === 0 ? "bg-emerald-950/80 border-emerald-500 text-emerald-200" : "bg-slate-800/50 border-slate-700/50 text-slate-300"}`}>
                <span>{String.fromCharCode(65 + i)}. {opt}</span>
                {i === 0 && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
            ))}
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
        <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">My Library • 12 Active Textbooks</span>
            <span className="text-xs text-slate-400">Storage Used: 2.4 GB</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-800 border border-slate-700 space-y-1">
              <span className="text-xs font-bold text-emerald-300">Indian Polity (M. Laxmikanth)</span>
              <p className="text-[11px] text-slate-400">6th Edition • 800 Pages Indexed</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-800 border border-slate-700 space-y-1">
              <span className="text-xs font-bold text-emerald-300">Modern History (Spectrum)</span>
              <p className="text-[11px] text-slate-400">Revised Edition • 650 Pages</p>
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
        <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">AI Note Summary • Chapter 3: Preamble</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Active Recall Ready</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <p className="font-bold text-white">• Key Words Added by 42nd Amendment (1976):</p>
            <p className="pl-4 text-emerald-300 font-mono">Socialist, Secular, Integrity</p>
            <p className="font-bold text-white">• Kesavananda Bharati Case (1973):</p>
            <p className="pl-4 text-slate-400">Supreme Court held that Preamble IS a part of the Constitution and CAN be amended subject to Basic Structure doctrine</p>
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
        <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Performance Dashboard</span>
            <span className="text-xs text-slate-400">Overall Accuracy: 84.2%</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Polity & Constitution</span>
                <span className="font-bold text-emerald-400">92%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-[8px] rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Environment & Ecology</span>
                <span className="font-bold text-emerald-400">86%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-[8px] rounded-full" style={{ width: "86%" }} />
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
        <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Aptora AI Tutor</span>
            <span className="text-[11px] text-emerald-400 font-bold">Online</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-800 text-slate-200">
              <p className="font-bold text-slate-400 text-[10px] mb-1">You</p>
              Explain the difference between Writ of Habeas Corpus and Mandamus?
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-100">
              <p className="font-bold text-emerald-400 text-[10px] mb-1">Aptora AI Tutor</p>
              • <strong>Habeas Corpus</strong> ("To have the body"): Issued against illegal detention. Can be issued against public AND private individuals<br />
              • <strong>Mandamus</strong> ("We command"): Issued to compel a public official to perform their statutory duty. CANNOT be issued against private individuals
            </div>
          </div>
        </div>
      ),
    },
  };

  const current = content[activeTab];

  return (
    <section id="features" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3">
            Product Showcase
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Everything you need to stay on track
          </h2>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 border-b border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${isActive
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            {/* Left: Feature Text & Details */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 font-display leading-tight">
                {current.title}
              </h3>
              <p className="text-emerald-800 font-semibold text-base">
                {current.subtitle}
              </p>
              <p className="text-slate-600 text-base leading-relaxed">
                {current.description}
              </p>

              <div className="space-y-3 pt-2">
                {current.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
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

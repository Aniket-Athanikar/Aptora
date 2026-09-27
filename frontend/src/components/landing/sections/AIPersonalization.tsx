"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserCheck, Cpu, CalendarCheck, BookOpen, BarChart3, Trophy, ArrowRight } from "lucide-react";

export function AIPersonalization() {
  const adaptationFactors = [
    { label: "Study Progress", desc: "Monitors daily completed vs pending chapters" },
    { label: "Weak Subjects", desc: "Identifies accuracy dips in specific sub-topics" },
    { label: "Mock Performance", desc: "Calculates time-per-question and negative marks" },
    { label: "Available Study Hours", desc: "Re-balances daily plan around work or college" },
    { label: "Target Examination", desc: "Calibrates question difficulty to exact PYQ standards" },
    { label: "Revision History", desc: "Triggers spaced-repetition prompts before memory fades" },
  ];

  const flowSteps = [
    { title: "Student Inputs", desc: "Goal, Timeline & Target Score", icon: UserCheck },
    { title: "Aptora AI Engine", desc: "Syllabus Weightage Analysis", icon: Cpu },
    { title: "Personalized Plan", desc: "Daily Time-Blocked Schedule", icon: CalendarCheck },
    { title: "Practice & Revision", desc: "Smart Mocks & Active Notes", icon: BookOpen },
    { title: "Performance Analysis", desc: "Real-time Diagnostic Insights", icon: BarChart3 },
    { title: "Targeted Mastery", desc: "Optimized Exam Readiness", icon: Trophy },
  ];

  return (
    <section id="ai-engine" className="py-24 md:py-32 bg-[#FAF9F6] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3">
            AI Personalization
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.12]">
            Your preparation should adapt to you
          </h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">
            Every aspirant has different strengths, revision speeds, and study windows. Aptora continuously adapts your preparation roadmap based on real empirical performance
          </p>
        </div>

        {/* Adaptation Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {adaptationFactors.map((factor, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors"
            >
              <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
                {factor.label}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {factor.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Visual Flow Diagram */}
        <div className="p-8 md:p-12 rounded-2xl bg-slate-900 text-white shadow-xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Adaptive Feedback Loop
            </span>
            <h3 className="text-2xl font-bold text-white font-display mt-2">
              How Aptora AI Optimizes Your Routine
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative">
            {flowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 mb-3 group-hover:border-emerald-500 group-hover:bg-slate-700 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

export default AIPersonalization;

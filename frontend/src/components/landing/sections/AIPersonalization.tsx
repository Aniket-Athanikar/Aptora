"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserCheck, Cpu, CalendarCheck, BookOpen, BarChart3, Trophy, Sparkles, Activity } from "lucide-react";

export function AIPersonalization() {
  const adaptationFactors = [
    { label: "Study Progress", desc: "Monitors daily completed vs pending chapters", bg: "bg-emerald-50/60 border-emerald-200/80 text-[#084c38]" },
    { label: "Weak Subjects", desc: "Identifies accuracy dips in specific sub-topics", bg: "bg-blue-50/60 border-blue-200/80 text-blue-900" },
    { label: "Mock Performance", desc: "Calculates time-per-question and negative marks", bg: "bg-purple-50/60 border-purple-200/80 text-purple-900" },
    { label: "Available Study Hours", desc: "Re-balances daily plan around work or college", bg: "bg-amber-50/60 border-amber-200/80 text-amber-900" },
    { label: "Target Examination", desc: "Calibrates question difficulty to exact PYQ standards", bg: "bg-teal-50/60 border-teal-200/80 text-teal-900" },
    { label: "Revision History", desc: "Triggers spaced-repetition prompts before memory fades", bg: "bg-rose-50/60 border-rose-200/80 text-rose-900" },
  ];

  const flowSteps = [
    { title: "Student Inputs", desc: "Goal, Timeline & Target Score", icon: UserCheck, color: "from-blue-500 to-indigo-600" },
    { title: "Aptora AI Engine", desc: "Syllabus Weightage Analysis", icon: Cpu, color: "from-emerald-500 to-teal-600" },
    { title: "Personalized Plan", desc: "Daily Time-Blocked Schedule", icon: CalendarCheck, color: "from-purple-500 to-pink-600" },
    { title: "Practice & Revision", desc: "Smart Mocks & Active Notes", icon: BookOpen, color: "from-amber-500 to-orange-600" },
    { title: "Performance Analysis", desc: "Real-time Diagnostic Insights", icon: BarChart3, color: "from-teal-500 to-emerald-600" },
    { title: "Targeted Mastery", desc: "Optimized Exam Readiness", icon: Trophy, color: "from-[#084c38] to-[#059669]" },
  ];

  return (
    <section id="ai-engine" className="py-24 md:py-32 bg-[#FAF9F6] border-t border-slate-200/90 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#084c38] text-xs font-black uppercase tracking-widest mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI PERSONALIZATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display leading-[1.12]">
            Your preparation should adapt to you
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            Every aspirant has different strengths, revision speeds, and study windows. Aptora continuously adapts your preparation roadmap based on real empirical performance
          </p>
        </div>

        {/* Adaptation Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {adaptationFactors.map((factor, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`p-6 rounded-3xl border ${factor.bg} shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden`}
            >
              <h3 className="text-base font-black mb-2 font-display">
                {factor.label}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {factor.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Visual Flow Diagram - Colorful Dashboard Container */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 md:p-12 rounded-3xl bg-white border-2 border-emerald-500/20 text-slate-900 shadow-2xl relative overflow-hidden glow-emerald"
        >
          {/* Top Accent Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />

          <div className="text-center max-w-xl mx-auto mb-12 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#084c38] font-display flex items-center justify-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              ADAPTIVE FEEDBACK LOOP
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-2">
              How Aptora AI Optimizes Your Routine
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 relative z-10">
            {flowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center text-center group cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-all`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 mb-1 font-display">{step.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-tight font-medium">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default AIPersonalization;

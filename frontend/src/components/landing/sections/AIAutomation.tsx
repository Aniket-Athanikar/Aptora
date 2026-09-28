"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Bell, Target, FileCheck, LineChart, Flame, Sparkles } from "lucide-react";

export function AIAutomation() {
  const automations = [
    {
      title: "Daily Study Planning",
      desc: "Automatically calculates remaining days, available hours, and subject weightage to assign daily study blocks.",
      icon: Calendar,
      tag: "Automated Scheduling",
      color: "from-emerald-500 to-teal-600",
      tagBg: "bg-emerald-50 text-[#084c38] border-emerald-200",
    },
    {
      title: "Revision Reminders",
      desc: "Triggers spaced-repetition prompts for topics studied 3, 7, and 21 days ago before recall decays.",
      icon: Bell,
      tag: "Spaced Repetition",
      color: "from-blue-500 to-indigo-600",
      tagBg: "bg-blue-50 text-blue-900 border-blue-200",
    },
    {
      title: "Weak-Topic Recommendations",
      desc: "Flags sub-topics where mock accuracy falls below 75% and queues targeted 15-minute practice sets.",
      icon: Target,
      tag: "Smart Targeting",
      color: "from-purple-500 to-pink-600",
      tagBg: "bg-purple-50 text-purple-900 border-purple-200",
    },
    {
      title: "Mock-Test Recommendations",
      desc: "Suggests sectional or full-length mocks at optimal intervals based on syllabus completion percentage.",
      icon: FileCheck,
      tag: "Exam Simulation",
      color: "from-amber-500 to-orange-600",
      tagBg: "bg-amber-50 text-amber-900 border-amber-200",
    },
    {
      title: "Progress Analysis",
      desc: "Synthesizes study time, question speed, and accuracy into a daily preparation health score.",
      icon: LineChart,
      tag: "Diagnostic Insights",
      color: "from-teal-500 to-emerald-600",
      tagBg: "bg-teal-50 text-teal-900 border-teal-200",
    },
    {
      title: "Study Streak Tracking",
      desc: "Maintains consistency metrics and study streak indicators to keep daily motivation high.",
      icon: Flame,
      tag: "Consistency Engine",
      color: "from-rose-500 to-red-600",
      tagBg: "bg-rose-50 text-rose-900 border-rose-200",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#084c38] text-xs font-black uppercase tracking-widest mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>SMART WORKFLOWS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
            Let Aptora handle the planning
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            Spend your energy learning and practicing. Aptora automatically handles scheduling, revision cycles, diagnostic tracking, and goal recalibration
          </p>
        </div>

        {/* Grid of Automation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {automations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-lg p-8 flex flex-col justify-between overflow-hidden hover:border-emerald-400 hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Top Accent Gradient Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />

                <div>
                  <div className="flex items-center justify-between mb-6 pt-1">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-all`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-xs font-black font-display ${item.tagBg}`}>
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 font-display mb-3 group-hover:text-[#084c38] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed font-normal">
                    {item.desc}
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

export default AIAutomation;

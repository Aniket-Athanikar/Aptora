"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Bell, Target, FileCheck, LineChart, Flame } from "lucide-react";

export function AIAutomation() {
  const automations = [
    {
      title: "Daily Study Planning",
      desc: "Automatically calculates remaining days, available hours, and subject weightage to assign daily study blocks.",
      icon: Calendar,
      tag: "Automated Scheduling",
    },
    {
      title: "Revision Reminders",
      desc: "Triggers spaced-repetition prompts for topics studied 3, 7, and 21 days ago before recall decays.",
      icon: Bell,
      tag: "Spaced Repetition",
    },
    {
      title: "Weak-Topic Recommendations",
      desc: "Flags sub-topics where mock accuracy falls below 75% and queues targeted 15-minute practice sets.",
      icon: Target,
      tag: "Smart Targeting",
    },
    {
      title: "Mock-Test Recommendations",
      desc: "Suggests sectional or full-length mocks at optimal intervals based on syllabus completion percentage.",
      icon: FileCheck,
      tag: "Exam Simulation",
    },
    {
      title: "Progress Analysis",
      desc: "Synthesizes study time, question speed, and accuracy into a daily preparation health score.",
      icon: LineChart,
      tag: "Diagnostic Insights",
    },
    {
      title: "Study Streak Tracking",
      desc: "Maintains consistency metrics and study streak indicators to keep daily motivation high.",
      icon: Flame,
      tag: "Consistency Engine",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3">
            Smart Workflows
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Let Aptora handle the planning
          </h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">
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
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="p-8 rounded-2xl bg-[#FAF9F6] border border-slate-200 flex flex-col justify-between hover:border-emerald-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 font-display mb-3">
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

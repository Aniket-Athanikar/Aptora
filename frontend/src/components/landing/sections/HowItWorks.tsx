"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, Calendar, BookOpenCheck, LineChart, Sparkles } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Set Your Goal",
      desc: "Choose your target exam from UPSC, SSC, Banking, Railway, or State PSC. Input your target score and exam date.",
      icon: Target,
      tags: ["UPSC", "SSC CGL", "Banking", "Railway", "State PSC"],
      bg: "bg-emerald-50/80 border-emerald-200 text-[#084c38]",
    },
    {
      num: "02",
      title: "Build Your Plan",
      desc: "Aptora generates a structured preparation strategy tailored to your available study hours, current level, and target timeline.",
      icon: Calendar,
      tags: ["Adaptive Schedule", "Daily Goals", "Syllabus Breakdown"],
      bg: "bg-blue-50/80 border-blue-200 text-blue-900",
    },
    {
      num: "03",
      title: "Practice & Revise",
      desc: "Master key concepts with AI-generated revision notes, exam-pattern mock tests, PYQ banks, and smart active-recall quizzes.",
      icon: BookOpenCheck,
      tags: ["AI Notes", "Mock Tests", "PYQ Analysis", "Quizzes"],
      bg: "bg-purple-50/80 border-purple-200 text-purple-900",
    },
    {
      num: "04",
      title: "Track Progress",
      desc: "Continuously evaluate accuracy, completion rates, weak-area targeting, and overall readiness with real-time analytics.",
      icon: LineChart,
      tags: ["Accuracy Metrics", "Weak Topic Diagnosis", "Mock Trends"],
      bg: "bg-amber-50/80 border-amber-200 text-amber-900",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-[#FAF9F6] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#084c38] text-xs font-black uppercase tracking-widest mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>HOW APTORA WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.12] font-display">
            One platform <br />
            <span className="bg-gradient-to-r from-[#084c38] via-[#059669] to-teal-600 bg-clip-text text-transparent">
              Your entire preparation journey
            </span>
          </h2>
        </div>

        {/* 4 Large Editorial Numbered Dashboard Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-xl p-8 md:p-10 flex flex-col justify-between overflow-hidden hover:border-emerald-400 hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Top Accent Gradient Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />

                <div>
                  {/* Number & Icon */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6 pt-1">
                    <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#084c38] to-[#059669] font-display tracking-tight">
                      {step.num}
                    </span>
                    <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#084c38] group-hover:bg-[#084c38] group-hover:text-white transition-all duration-300 shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-3 font-display group-hover:text-[#084c38] transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-slate-600 text-base leading-relaxed font-normal mb-6">
                    {step.desc}
                  </p>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 pt-5 border-t border-slate-100">
                  {step.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold ${step.bg}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

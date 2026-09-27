"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, Calendar, BookOpenCheck, LineChart } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Set Your Goal",
      desc: "Choose your target exam from UPSC, SSC, Banking, Railway, or State PSC. Input your target score and exam date.",
      icon: Target,
      tags: ["UPSC", "SSC CGL", "Banking", "Railway", "State PSC"],
    },
    {
      num: "02",
      title: "Build Your Plan",
      desc: "Aptora generates a structured preparation strategy tailored to your available study hours, current level, and target timeline.",
      icon: Calendar,
      tags: ["Adaptive Schedule", "Daily Goals", "Syllabus Breakdown"],
    },
    {
      num: "03",
      title: "Practice & Revise",
      desc: "Master key concepts with AI-generated revision notes, exam-pattern mock tests, PYQ banks, and smart active-recall quizzes.",
      icon: BookOpenCheck,
      tags: ["AI Notes", "Mock Tests", "PYQ Analysis", "Quizzes"],
    },
    {
      num: "04",
      title: "Track Progress",
      desc: "Continuously evaluate accuracy, completion rates, weak-area targeting, and overall readiness with real-time analytics.",
      icon: LineChart,
      tags: ["Accuracy Metrics", "Weak Topic Diagnosis", "Mock Trends"],
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3">
            How Aptora Works
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12] font-display">
            One platform <br />
            <span className="text-slate-500">Your entire preparation journey</span>
          </h2>
        </div>

        {/* 4 Large Editorial Numbered Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-8 md:p-10 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-colors"
              >
                <div>
                  {/* Number & Icon */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
                    <span className="text-4xl md:text-5xl font-extrabold text-emerald-700 font-display tracking-tight">
                      {step.num}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                      <Icon className="w-6 h-6 text-emerald-700" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-3 font-display">
                    {step.title}
                  </h3>

                  <p className="text-slate-600 text-base leading-relaxed font-normal mb-6">
                    {step.desc}
                  </p>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                  {step.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold"
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

"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Eye, ChevronLeft, Sparkles } from "lucide-react";

export function FeatureShowcase() {
  const features = [
    {
      eyebrow: "FROM MATERIAL TO MASTERY",
      headline: "Turn your notes into real progress",
      description: "Whether it's a PDF, textbook or your own notes, Aptora transforms your study material into structured practice — so you can learn faster and remember longer.",
      checklist: [
        "AI-powered question generation",
        "Topic-wise and full-length tests",
        "Smart revision plans",
      ],
      visual: (
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 text-slate-800 space-y-4 glow-emerald"
        >
          {/* Practice Test Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-bold">
              <ChevronLeft className="w-4 h-4 text-slate-400" />
              <span className="font-display">Practice Test</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#084c38] text-[10px] font-black border border-emerald-200">
                Physics - Modern Physics
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Question 5 of 20</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3 pt-1">
            <p className="text-sm font-extrabold text-slate-900 leading-snug font-display">
              Which of the following statements is correct about the photoelectric effect?
            </p>

            {/* Multiple Choice Options */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-600 font-medium flex items-center gap-2.5 hover:border-slate-300 transition-colors cursor-pointer">
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                <span>A) It proves the wave nature of light</span>
              </div>

              {/* Selected / Correct Option B */}
              <div className="p-3.5 rounded-xl border-2 border-emerald-400 bg-emerald-50 text-emerald-950 font-extrabold flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#084c38] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>B) It occurs only for light of a particular frequency</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-600 font-medium flex items-center gap-2.5 hover:border-slate-300 transition-colors cursor-pointer">
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                <span>C) It is independent of the intensity of light</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-600 font-medium flex items-center gap-2.5 hover:border-slate-300 transition-colors cursor-pointer">
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                <span>D) It occurs only at high temperatures</span>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Show Explanation</span>
            </button>

            <button className="px-4 py-2 rounded-xl bg-[#084c38] hover:bg-[#063b2b] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer">
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      ),
      reverse: true,
    },
    {
      eyebrow: "ADAPTIVE AI TUTOR",
      headline: "Learn complex topics with instant AI guidance",
      description: "Ask questions, get concept breakdowns in plain language, generate mnemonics, and solve tricky previous year questions with Aptora's 24/7 AI tutor.",
      checklist: [
        "Step-by-step PYQ solution walkthroughs",
        "Instant doubt resolution in natural language",
        "Custom flashcards & concept maps",
      ],
      visual: (
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 text-slate-800 space-y-4 glow-emerald"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
            <span className="font-extrabold text-[#084c38] uppercase tracking-wider font-display flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Aptora AI Tutor
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active Assistant
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">User Question</p>
              <p className="font-extrabold text-slate-800 font-display">Summarize the key takeaway of the Kesavananda Bharati Case (1973)?</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-2">
              <p className="text-[10px] font-black text-[#084c38] uppercase tracking-wider">Aptora AI Tutor Answer</p>
              <p className="text-xs leading-relaxed font-medium">
                The Supreme Court established the <strong>Basic Structure Doctrine</strong> — holding that while Parliament can amend any part of the Constitution under Article 368, it <em>cannot alter or destroy</em> its basic structure.
              </p>
            </div>
          </div>
        </motion.div>
      ),
      reverse: false,
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#FAF9F6] border-t border-slate-200/90 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 md:space-y-32">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center`}
          >
            {/* Visual Side */}
            <div className={`lg:col-span-6 ${feat.reverse ? "lg:order-1" : "lg:order-2"}`}>
              {feat.visual}
            </div>

            {/* Text Side */}
            <div className={`lg:col-span-6 space-y-6 ${feat.reverse ? "lg:order-2" : "lg:order-1"}`}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#084c38] text-xs font-black uppercase tracking-widest shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{feat.eyebrow}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-display leading-[1.1]">
                {feat.headline}
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
                {feat.description}
              </p>

              {/* Checklist */}
              <div className="space-y-3.5 pt-2">
                {feat.checklist.map((item, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 text-[#084c38] flex items-center justify-center shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-[#084c38]" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 font-display">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeatureShowcase;

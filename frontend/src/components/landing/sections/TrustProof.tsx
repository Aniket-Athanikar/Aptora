"use client";

import React from "react";
import { FileText, Sparkles, LineChart, Zap } from "lucide-react";

export function TrustProof() {
  const capabilities = [
    {
      icon: FileText,
      title: "Study Material",
      desc: "Select notes, PDFs and videos. Organize your content in one place.",
    },
    {
      icon: Sparkles,
      title: "Practice",
      desc: "Generate AI-powered questions, mock tests and topic-wise practice.",
    },
    {
      icon: LineChart,
      title: "Analytics",
      desc: "Track your progress, find weak areas and improve faster.",
    },
    {
      icon: Zap,
      title: "Built-in AI",
      desc: "Smart question generation, concept explanations and personalized revision.",
    },
  ];

  return (
    <section className="py-16 bg-white border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Eyebrow label */}
        <p className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mb-10">
          EVERYTHING YOU NEED TO PREPARE
        </p>

        {/* 4 Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div key={idx} className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 flex items-center justify-center text-[#084c38] shrink-0 group-hover:bg-[#084c38] group-hover:text-white transition-colors duration-200">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-1 font-display">
                    {cap.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default TrustProof;

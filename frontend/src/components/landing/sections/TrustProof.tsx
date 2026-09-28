"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, LineChart, Zap } from "lucide-react";

export function TrustProof() {
  const capabilities = [
    {
      icon: FileText,
      title: "Study Material",
      desc: "Select notes, PDFs and videos. Organize your content in one place.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: Sparkles,
      title: "Practice",
      desc: "Generate AI-powered questions, mock tests and topic-wise practice.",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: LineChart,
      title: "Analytics",
      desc: "Track your progress, find weak areas and improve faster.",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: Zap,
      title: "Built-in AI",
      desc: "Smart question generation, concept explanations and personalized revision.",
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <section className="py-16 bg-white border-y border-slate-200/80 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Eyebrow label */}
        <p className="text-center text-xs font-black uppercase tracking-widest text-[#084c38] mb-10 font-display">
          EVERYTHING YOU NEED TO PREPARE
        </p>

        {/* 4 Capabilities Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-md p-6 flex flex-col justify-between overflow-hidden hover:border-emerald-400 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Top Accent Gradient Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cap.color} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-all`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 mb-1 font-display group-hover:text-[#084c38] transition-colors">
                      {cap.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-normal leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default TrustProof;

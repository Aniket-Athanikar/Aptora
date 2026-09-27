"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote, Sparkles } from "lucide-react";

interface TestimonialItem {
  name: string;
  exam: string;
  quote: string;
  role: string;
}

export default function Testimonials() {
  const testimonials: TestimonialItem[] = [
    {
      name: "UPSC Aspirant",
      exam: "Civil Services Examination",
      role: "Verified Aspirant",
      quote: "The personalized daily planner transformed how I cover Laxmikanth and Spectrum. Automatically adjusting missed chapters kept my prep completely stress-free.",
    },
    {
      name: "SSC CGL Candidate",
      exam: "SSC CGL Tier 1 & 2",
      role: "Verified Aspirant",
      quote: "The timed mock test analytics identified my exact weak areas in Quantitative Aptitude. My sectional speed improved significantly within 3 weeks.",
    },
    {
      name: "Banking Aspirant",
      exam: "SBI PO & IBPS Mains",
      role: "Verified Aspirant",
      quote: "Aptora's AI note summaries allowed me to revise financial awareness and reasoning puzzles in half the time. The spaced recall flashcards are top-tier.",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-white relative z-10 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ecfdf5] border border-[#d1fae5] text-[#084c38] text-xs font-extrabold uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Experiences</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Real preparation requires the right system
          </h2>
          <p className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed font-medium">
            See how aspirants across India use Aptora&apos;s AI planning engine to bring structure to their competitive exam journey
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-[#FAF9F6] border border-slate-200/90 flex flex-col justify-between hover:border-[#084c38]/40 hover:shadow-md transition-all group"
            >
              <div>
                <Quote className="w-8 h-8 text-[#084c38] mb-4 opacity-40 group-hover:opacity-70 transition-opacity" />
                <p className="text-slate-700 text-sm md:text-base leading-relaxed mb-6 font-normal italic">
                  &quot;{item.quote}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-display">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {item.exam}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#084c38] text-[10px] font-extrabold border border-[#d1fae5]">
                  {item.role}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

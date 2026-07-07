"use client";

import { motion } from "framer-motion";
import {
  Upload,
  Cpu,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Select Your Books",
    description: "Choose PDFs, images, or notes",
    icon: Upload,
  },
  {
    number: "02",
    title: "AI Processes Content",
    description: "OCR scans and AI understands your material",
    icon: Cpu,
  },
  {
    number: "03",
    title: "AI Generates Materials",
    description: "Get AI-generated notes, MCQs, and flashcards",
    icon: Sparkles,
  },
  {
    number: "04",
    title: "Practice & Improve",
    description: "Practice daily and track performance",
    icon: TrendingUp,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function HowItWorksPage() {
  return (
    <PageLayout
      title="How ExamForge AI Works"
      description="Simple steps to smart learning"
      breadcrumb={[{ label: "How It Works", href: "/how-it-works" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto">
        {/* Section badge */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block bg-[#6D4AFF]/5 text-[#6D4AFF] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-[#6D4AFF]/10"
          >
            Step by Step
          </motion.span>
        </div>

        {/* Steps timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="relative max-w-2xl mx-auto"
        >
          {/* Connecting vertical line */}
          <div className="absolute left-8 md:left-10 top-10 bottom-10 w-[2px] border-l-2 border-dashed border-[#6D4AFF]/20 z-0" />

          <div className="flex flex-col gap-10">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  className="relative z-10 flex items-start gap-6"
                >
                  {/* Step number badge on the line */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#6D4AFF] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <span className="text-white text-lg md:text-xl font-black">
                        {step.number}
                      </span>
                    </div>
                    {/* Pulse ring effect */}
                    <div className="absolute inset-0 rounded-full bg-[#6D4AFF]/10 animate-ping opacity-20" />
                  </div>

                  {/* Glass card content */}
                  <div className="flex-1 bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-6 md:p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-[#6D4AFF]" />
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-neutral-900 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-14 text-neutral-400 font-semibold text-sm tracking-wide"
        >
          AI personalized notes and study plans
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex justify-center mt-8"
        >
          <Link
            href="/pricing"
            className="group bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            Get Exam Ready
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </PageLayout>
  );
}

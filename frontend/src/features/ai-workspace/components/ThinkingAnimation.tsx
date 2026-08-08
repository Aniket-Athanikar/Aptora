"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, BrainCircuit, FileText, Network, CheckCircle2 } from "lucide-react";

interface ThinkingAnimationProps {
  stage: "thinking" | "reading" | "analyzing" | "notes" | "knowledge" | "done" | null;
}

const STAGE_DETAILS = {
  thinking: {
    icon: Sparkles,
    label: "ExamForge AI Thinking...",
    color: "text-purple-700",
    bgColor: "bg-purple-100/90",
    borderColor: "border-purple-300",
    pct: 20,
  },
  reading: {
    icon: BookOpen,
    label: "Reading Study Vector Chunks...",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100/90",
    borderColor: "border-indigo-300",
    pct: 40,
  },
  analyzing: {
    icon: BrainCircuit,
    label: "Analyzing Syllabus & Case Laws...",
    color: "text-blue-700",
    bgColor: "bg-blue-100/90",
    borderColor: "border-blue-300",
    pct: 60,
  },
  notes: {
    icon: FileText,
    label: "Formatting Bullet Points & Notes...",
    color: "text-pink-700",
    bgColor: "bg-pink-100/90",
    borderColor: "border-pink-300",
    pct: 80,
  },
  knowledge: {
    icon: Network,
    label: "Mapping Concept Connections...",
    color: "text-violet-700",
    bgColor: "bg-violet-100/90",
    borderColor: "border-violet-300",
    pct: 95,
  },
  done: {
    icon: CheckCircle2,
    label: "Response Stream Ready!",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100/90",
    borderColor: "border-emerald-300",
    pct: 100,
  },
};

export function ThinkingAnimation({ stage }: ThinkingAnimationProps) {
  if (!stage) return null;

  const current = STAGE_DETAILS[stage];
  const Icon = current.icon;

  return (
    <div className="my-5 p-5 rounded-3xl border border-purple-200/90 bg-gradient-to-r from-white via-purple-50/40 to-indigo-50/30 max-w-xl shadow-sm">
      <div className="flex items-center gap-3.5">
        {/* Animated icon wrapper */}
        <motion.div
          animate={{
            scale: stage === "done" ? 1 : [1, 1.12, 1],
            rotate: stage === "done" ? 0 : [0, 6, -6, 0],
          }}
          transition={{
            repeat: stage === "done" ? 0 : Infinity,
            duration: 1.8,
            ease: "easeInOut",
          }}
          className={`p-3 rounded-2xl ${current.bgColor} ${current.borderColor} border ${current.color} shadow-sm shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        {/* Text descriptions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-700 uppercase tracking-widest leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
            ExamForge-AI Engine
          </div>
          <h4 className="text-xs font-black text-slate-900 truncate mt-1">
            {current.label}
          </h4>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-3 border-t border-purple-100/80">
        <div className="flex justify-between items-center text-[10px] font-black text-slate-700 mb-1.5">
          <span>REASONING PIPELINE</span>
          <span className="text-purple-700 font-black">{current.pct}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${current.pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 rounded-full shadow-xs"
          />
        </div>
      </div>
    </div>
  );
}
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
    label: "Thinking...",
    color: "text-purple-650",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-100",
    pct: 20,
  },
  reading: {
    icon: BookOpen,
    label: "Reading Book Pages...",
    color: "text-indigo-650",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-100",
    pct: 40,
  },
  analyzing: {
    icon: BrainCircuit,
    label: "Analyzing Conceptual Structure...",
    color: "text-blue-650",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    pct: 60,
  },
  notes: {
    icon: FileText,
    label: "Generating High-Yield Notes...",
    color: "text-pink-650",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-100",
    pct: 80,
  },
  knowledge: {
    icon: Network,
    label: "Mapping Connections into Knowledge Graph...",
    color: "text-violet-650",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-100",
    pct: 95,
  },
  done: {
    icon: CheckCircle2,
    label: "Workspace Synced!",
    color: "text-emerald-650",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
    pct: 100,
  },
};

export function ThinkingAnimation({ stage }: ThinkingAnimationProps) {
  if (!stage) return null;

  const current = STAGE_DETAILS[stage];
  const Icon = current.icon;

  return (
    <div className="my-6 p-5 rounded-3xl border border-dashed border-purple-150 bg-gradient-to-br from-white to-purple-50/20 max-w-xl shadow-sm">
      <div className="flex items-center gap-4">
        {/* Animated icon wrapper */}
        <motion.div
          animate={{
            scale: stage === "done" ? 1 : [1, 1.1, 1],
            rotate: stage === "done" ? 0 : [0, 8, -8, 0],
          }}
          transition={{
            repeat: stage === "done" ? 0 : Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
          className={`p-3 rounded-2xl ${current.bgColor} ${current.borderColor} border ${current.color} shadow-sm`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        {/* Text descriptions */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
            ExamForge AI
          </p>
          <h4 className="text-xs font-black text-slate-800 truncate mt-1.5">
            {current.label}
          </h4>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 pt-3.5 border-t border-slate-50">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-550 mb-1.5">
          <span>PIPELINE PROGRESS</span>
          <span className="text-purple-600 font-extrabold">{current.pct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${current.pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

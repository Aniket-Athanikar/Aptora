"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, BrainCircuit, FileText, Network, CheckCircle2, Cpu } from "lucide-react";

interface ThinkingAnimationProps {
  stage: "thinking" | "reading" | "analyzing" | "notes" | "knowledge" | "done" | null;
}

const STAGE_DETAILS = {
  thinking: {
    icon: Sparkles,
    label: "Initiating Deep RAG Reasoning...",
    sub: "Tokenizing query vectors",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    pct: 20,
  },
  reading: {
    icon: BookOpen,
    label: "Reading Document Vector Chunks...",
    sub: "Fetching relevant page embeddings",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    pct: 40,
  },
  analyzing: {
    icon: BrainCircuit,
    label: "Analyzing Conceptual Structure...",
    sub: "Evaluating high-yield exam patterns",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    pct: 60,
  },
  notes: {
    icon: FileText,
    label: "Generating Active Recall Notes...",
    sub: "Synthesizing bullet points & flashcards",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    pct: 80,
  },
  knowledge: {
    icon: Network,
    label: "Mapping Knowledge Graph Nodes...",
    sub: "Structuring relationships & formulas",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    pct: 95,
  },
  done: {
    icon: CheckCircle2,
    label: "Reasoning Complete & Synced!",
    sub: "Response streaming ready",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    pct: 100,
  },
};

const STAGE_KEYS = ["thinking", "reading", "analyzing", "notes", "knowledge", "done"] as const;

export function ThinkingAnimation({ stage }: ThinkingAnimationProps) {
  if (!stage) return null;

  const current = STAGE_DETAILS[stage];
  const Icon = current.icon;

  return (
    <div className="my-5 p-5 rounded-3xl border border-purple-100 bg-white/90 shadow-lg shadow-purple-500/5 max-w-xl text-slate-800 space-y-4 backdrop-blur-md relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-4 relative z-10">
        {/* Animated Icon Container */}
        <motion.div
          animate={{
            scale: stage === "done" ? 1 : [1, 1.08, 1],
            rotate: stage === "done" ? 0 : [0, 5, -5, 0],
          }}
          transition={{
            repeat: stage === "done" ? 0 : Infinity,
            duration: 2.2,
            ease: "easeInOut",
          }}
          className={`p-3.5 rounded-2xl ${current.bgColor} ${current.borderColor} border ${current.color} shadow-sm shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">
              ExamForge AI Reasoning Node
            </span>
          </div>
          <h4 className="text-xs font-black text-slate-900 truncate mt-1">
            {current.label}
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            {current.sub}
          </p>
        </div>

        <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-100 shrink-0">
          {current.pct}%
        </span>
      </div>

      {/* Pipeline Stage Indicators */}
      <div className="grid grid-cols-6 gap-1 pt-1">
        {STAGE_KEYS.map((key, idx) => {
          const isPassed = STAGE_KEYS.indexOf(stage) >= idx;
          const isCurrent = stage === key;
          return (
            <div key={key} className="space-y-1 text-center">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  isPassed
                    ? "bg-purple-600 shadow-xs"
                    : "bg-slate-100"
                } ${isCurrent ? "animate-pulse ring-2 ring-purple-300" : ""}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

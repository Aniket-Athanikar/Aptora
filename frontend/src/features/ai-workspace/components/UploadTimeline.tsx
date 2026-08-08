"use client";

import React from "react";
import { motion } from "framer-motion";
import { CloudUpload, Scan, Layout, FolderOpen, FileCheck, Network, Check, Sparkles } from "lucide-react";
import { BookMetadata } from "../types";

interface UploadTimelineProps {
  status: BookMetadata["ocrStatus"];
  progress: number;
}

const TIMELINE_STEPS = [
  { stage: "uploading", label: "Uploading", icon: CloudUpload, color: "text-blue-600", bg: "bg-blue-100/80" },
  { stage: "ocr", label: "OCR Engine", icon: Scan, color: "text-amber-600", bg: "bg-amber-100/80" },
  { stage: "understanding", label: "Layout Analysis", icon: Layout, color: "text-purple-600", bg: "bg-purple-100/80" },
  { stage: "chapters", label: "Extracting Chapters", icon: FolderOpen, color: "text-pink-600", bg: "bg-pink-100/80" },
  { stage: "notes", label: "Generating Notes", icon: FileCheck, color: "text-indigo-600", bg: "bg-indigo-100/80" },
  { stage: "graph", label: "Knowledge Graph", icon: Network, color: "text-teal-600", bg: "bg-teal-100/80" }
];

export function UploadTimeline({ status, progress }: UploadTimelineProps) {
  const getStepIndex = (currentStatus: string) => {
    if (currentStatus === "completed") return TIMELINE_STEPS.length;
    return TIMELINE_STEPS.findIndex((s) => s.stage === currentStatus);
  };

  const activeIndex = getStepIndex(status);

  return (
    <div className="w-full bg-gradient-to-br from-white via-purple-50/60 to-indigo-50/40 border border-purple-200 rounded-3xl p-5 sm:p-6 shadow-md mb-6 relative overflow-hidden backdrop-blur-xs">
      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div>
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" /> Processing Study Document
          </h4>
          <p className="text-xs text-slate-600 font-extrabold mt-0.5">High-fidelity parsing & conceptual extraction</p>
        </div>
        <span className="text-xs font-black text-purple-900 bg-white/90 px-3.5 py-1 rounded-full border border-purple-200 shadow-xs">
          {progress}% Complete
        </span>
      </div>

      {/* Progress slider bar */}
      <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden mb-6 relative border border-purple-200/50 shadow-inner">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 rounded-full shadow-xs"
        />
      </div>

      {/* Timeline Steps layout */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 relative z-10">
        {TIMELINE_STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex || status === "completed";
          const isActive = idx === activeIndex;
          const StepIcon = step.icon;

          return (
            <div
              key={step.stage}
              className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all ${isActive
                ? "bg-white border-purple-400 shadow-md ring-2 ring-purple-100"
                : isCompleted
                  ? "bg-emerald-50/80 border-emerald-300 shadow-2xs"
                  : "bg-white/60 border-purple-100 opacity-60"
                }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all mb-2 shadow-2xs ${isCompleted
                  ? "bg-emerald-600 border-emerald-700 text-white"
                  : isActive
                    ? `${step.bg} border-purple-400 ${step.color} animate-pulse`
                    : "bg-white border-slate-200 text-slate-400"
                  }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
              </div>
              <span
                className={`text-[10px] font-black tracking-tight ${isActive ? "text-purple-950" : isCompleted ? "text-emerald-900" : "text-slate-600"
                  }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
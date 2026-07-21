"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, Scan, Layout, FolderOpen, FileCheck, Network, Check } from "lucide-react";
import { BookMetadata } from "../types";

interface UploadTimelineProps {
  status: BookMetadata["ocrStatus"];
  progress: number;
}

const TIMELINE_STEPS = [
  { stage: "uploading", label: "Uploading", icon: CloudUpload, color: "text-blue-500", bg: "bg-blue-50" },
  { stage: "ocr", label: "OCR Engine", icon: Scan, color: "text-amber-500", bg: "bg-amber-50" },
  { stage: "understanding", label: "Layout Analysis", icon: Layout, color: "text-purple-500", bg: "bg-purple-50" },
  { stage: "chapters", label: "Extracting Chapters", icon: FolderOpen, color: "text-pink-500", bg: "bg-pink-50" },
  { stage: "notes", label: "Generating Notes", icon: FileCheck, color: "text-indigo-500", bg: "bg-indigo-50" },
  { stage: "graph", label: "Knowledge Graph", icon: Network, color: "text-teal-500", bg: "bg-teal-50" }
];

export function UploadTimeline({ status, progress }: UploadTimelineProps) {
  const getStepIndex = (currentStatus: string) => {
    if (currentStatus === "completed") return TIMELINE_STEPS.length;
    return TIMELINE_STEPS.findIndex((s) => s.stage === currentStatus);
  };

  const activeIndex = getStepIndex(status);

  return (
    <div className="w-full bg-white border border-purple-100/60 rounded-3xl p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="text-sm font-bold text-gray-800">Processing Study Document</h4>
          <p className="text-xs text-gray-400 mt-0.5">High-fidelity OCR parsing & conceptual extraction</p>
        </div>
        <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
          {progress}%
        </span>
      </div>

      {/* Progress slider bar */}
      <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden mb-6">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"
        />
      </div>

      {/* Timeline Steps layout */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {TIMELINE_STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex || status === "completed";
          const isActive = idx === activeIndex;
          const StepIcon = step.icon;

          return (
            <div
              key={step.stage}
              className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all ${
                isActive
                  ? "bg-purple-50/50 border-purple-200 scale-105"
                  : isCompleted
                  ? "bg-slate-50/50 border-slate-100"
                  : "bg-transparent border-transparent opacity-40"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all mb-2.5 ${
                  isCompleted
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                    : isActive
                    ? `${step.bg} border-purple-150 ${step.color} animate-pulse`
                    : "bg-slate-50 border-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
              </div>
              <span
                className={`text-[10px] font-bold tracking-tight ${
                  isActive ? "text-purple-700" : isCompleted ? "text-slate-600" : "text-slate-400"
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

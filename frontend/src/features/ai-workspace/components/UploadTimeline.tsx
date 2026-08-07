"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudUpload,
  Scan,
  Layout,
  FolderOpen,
  FileCheck,
  Network,
  Check,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock
} from "lucide-react";
import { BookMetadata } from "../types";

interface UploadTimelineProps {
  status: BookMetadata["ocrStatus"];
  progress: number;
  fileName?: string;
  onRetry?: () => void;
}

const TIMELINE_STEPS = [
  { stage: "uploading", label: "Cloud Upload", desc: "Transporting document stream", icon: CloudUpload, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { stage: "ocr", label: "OCR Vision Engine", desc: "High-precision character parsing", icon: Scan, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { stage: "understanding", label: "Layout Analysis", desc: "Table & structural breakdown", icon: Layout, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  { stage: "chapters", label: "Chapter Outline", desc: "Extracting syllabus hierarchy", icon: FolderOpen, color: "text-pink-600", bg: "bg-pink-50 border-pink-200" },
  { stage: "notes", label: "Concept Notes", desc: "Synthesizing key summaries", icon: FileCheck, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  { stage: "graph", label: "Vector & Graph DB", desc: "Indexing Qdrant embeddings", icon: Network, color: "text-teal-600", bg: "bg-teal-50 border-teal-200" },
];

export function UploadTimeline({ status, progress, fileName, onRetry }: UploadTimelineProps) {
  const [showLogs, setShowLogs] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (status === "completed" || status === "idle") return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  const getStepIndex = (currentStatus: string) => {
    if (currentStatus === "completed") return TIMELINE_STEPS.length;
    const found = TIMELINE_STEPS.findIndex((s) => s.stage === currentStatus);
    return found === -1 ? 0 : found;
  };

  const activeIndex = getStepIndex(status);
  const activeStep = TIMELINE_STEPS[activeIndex] || TIMELINE_STEPS[0];

  return (
    <div className="w-full bg-white border border-purple-100/70 rounded-3xl p-5 sm:p-6 shadow-sm mb-6 space-y-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-650 text-white flex items-center justify-center shadow-md shadow-purple-100 shrink-0">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-black text-slate-800 truncate">
              {fileName ? `Processing ${fileName}` : "Document Indexing Pipeline"}
            </h4>
            <p className="text-xs text-slate-400 font-semibold mt-0.5 flex items-center gap-2">
              <span>High-fidelity parsing & RAG vector sync</span>
              <span className="flex items-center gap-1 text-[10px] text-purple-600 font-black">
                <Clock className="w-3 h-3" />
                {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s elapsed
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-black text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full shadow-xs">
            {progress}% Complete
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
              title="Restart Indexing"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Futuristic Animated Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-150/60 p-0.5">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 rounded-full relative shadow-sm"
          >
            <div className="absolute top-0 right-0 bottom-0 w-3 bg-white/40 blur-xs animate-pulse" />
          </motion.div>
        </div>
        <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 px-0.5">
          <span>Active Stage: {activeStep.label}</span>
          <span>{status === "completed" ? "Fully Indexed" : "Qdrant Vector DB Syncing"}</span>
        </div>
      </div>

      {/* Timeline Grid Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {TIMELINE_STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex || status === "completed";
          const isActive = idx === activeIndex && status !== "completed";
          const StepIcon = step.icon;

          return (
            <div
              key={step.stage}
              className={`flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all duration-200 ${
                isActive
                  ? "bg-purple-50/70 border-purple-300 shadow-md shadow-purple-100/50 scale-[1.03]"
                  : isCompleted
                  ? "bg-slate-50/70 border-slate-200/80"
                  : "bg-slate-50/20 border-slate-100 opacity-40"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all mb-2 shadow-xs ${
                  isCompleted
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                    : isActive
                    ? `${step.bg} ${step.color} animate-pulse`
                    : "bg-white border-slate-200 text-slate-400"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
              </div>
              <span
                className={`text-xs font-black tracking-tight leading-tight ${
                  isActive ? "text-purple-700" : isCompleted ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold mt-1 leading-tight hidden sm:block">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Accordion Pipeline Logs Drawer */}
      <div className="border-t border-slate-100 pt-3">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="flex items-center justify-between w-full text-[10px] font-black text-purple-700 hover:text-purple-900 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Live Ingestion Telemetry Logs
          </span>
          {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <AnimatePresence>
          {showLogs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3.5 bg-slate-900 rounded-2xl font-mono text-[10px] text-slate-200 space-y-1.5 shadow-inner overflow-x-auto"
            >
              <p className="text-emerald-400 font-bold">[00:01] Initialization: Document stream opened successfully.</p>
              <p className="text-blue-300">[00:03] OCR Engine: Page Layout Analyzed (78% confidence score).</p>
              <p className="text-purple-300">[00:07] Text Cleaning: Strip noise headers and footnote markers.</p>
              <p className="text-amber-300">[00:11] Smart Chunking: Divided into 142 semantic text blocks.</p>
              <p className="text-pink-300">[00:14] Embeddings: Vectors generated via ExamForge-RAG model.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { GoalData } from "@/types/goal.types";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface RoadmapTimelineProps {
  goal: GoalData;
}

const MILESTONES = [
  { stage: "Foundation", desc: "Introductory concepts, syllabus overview & book list gathering" },
  { stage: "Core Learning", desc: "Detailed syllabus study, deep concept building & active reading" },
  { stage: "Practice Loop", desc: "Solving module exercises, practice quizzes & worksheets" },
  { stage: "PYQs Drill", desc: "Last 10 years papers analysis, timing strategy & theme mapping" },
  { stage: "Mock Trials", desc: "Full-length simulated tests, error-log audits & speed checks" },
  { stage: "Revision Sprint", desc: "Micro-notes review, formula lists, memorization drills" },
  { stage: "Exam Day Success", desc: "Execution under pressure, calm confidence, success achieved" }
];

export function RoadmapTimeline({ goal }: RoadmapTimelineProps) {
  // Determine current stage index based on syllabus coverage percent
  const syllabus = goal.profile.syllabusPercent || 0;
  const currentStageIndex = Math.min(
    MILESTONES.length - 1,
    Math.floor((syllabus / 100) * MILESTONES.length)
  );

  const [activeStage, setActiveStage] = useState<number>(currentStageIndex);

  return (
    <div className="p-6 glass border border-white/20 rounded-3xl space-y-6 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-650" /> Interactive Success Roadmap
          </h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
            Stages update dynamically according to syllabus coverage.
          </p>
        </div>
        <span className="text-[10px] font-black text-indigo-750 bg-indigo-50 border border-indigo-100/50 px-3 py-1 rounded-full uppercase tracking-wider">
          Active Stage: {MILESTONES[currentStageIndex].stage}
        </span>
      </div>

      {/* Horizontal timeline grid stepper wrapper */}
      <div className="relative flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 py-4 overflow-x-auto min-w-[280px]">
        {/* Horizontal bar connecting dots */}
        <div className="hidden md:block absolute left-4 right-4 h-0.5 bg-slate-100 top-[35px] -z-10" />

        {MILESTONES.map((mile, idx) => {
          const isCompleted = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isSelected = idx === activeStage;

          return (
            <button
              key={mile.stage}
              onClick={() => setActiveStage(idx)}
              className="flex md:flex-col items-center gap-3 text-left md:text-center flex-1 w-full min-w-[120px] focus:outline-none cursor-pointer"
            >
              {/* Dot Icon Indicator */}
              <motion.div
                whileHover={{ scale: 1.12 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                    : isCurrent
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100/50"
                      : isSelected
                        ? "bg-indigo-50 border-indigo-500 text-indigo-600 font-bold"
                        : "bg-white/40 border-white/20 text-slate-400 hover:border-slate-350"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="text-xs font-black">{idx + 1}</span>
                )}
              </motion.div>

              <div>
                <p className={`text-xs font-black tracking-tight ${
                  isCurrent ? "text-indigo-650" : isSelected ? "text-slate-800" : "text-slate-500"
                }`}>
                  {mile.stage}
                </p>
                <span className="text-[10px] text-slate-400 block md:hidden mt-0.5 leading-relaxed font-semibold">
                  {mile.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Detail Card of selected milestone */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/30 flex items-start gap-3"
        >
          <span className="text-xl">💡</span>
          <div>
            <h4 className="font-black text-indigo-900 text-[10px] uppercase tracking-wider">
              Stage {activeStage + 1} focus: {MILESTONES[activeStage].stage}
            </h4>
            <p className="text-xs text-slate-650 leading-relaxed mt-1 font-semibold">
              {MILESTONES[activeStage].desc}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

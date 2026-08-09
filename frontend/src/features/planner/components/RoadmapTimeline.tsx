"use client";

import React from "react";
import { CheckCircle2, ChevronRight, Compass } from "lucide-react";

const phases = [
  { id: 1, title: "Phase 1: Foundation", duration: "30 Days", desc: "Build base concepts & cover NCERT syllabus topics." },
  { id: 2, title: "Phase 2: Core Subjects", duration: "60 Days", desc: "Deep study of high-weightage subjects." },
  { id: 3, title: "Phase 3: Practice & PYQs", duration: "45 Days", desc: "Active recall, solve mock papers & past questions." },
  { id: 4, title: "Phase 4: Mock Test Series", duration: "30 Days", desc: "Full-length exams & speed calibration." },
  { id: 5, title: "Phase 5: Final Revision", duration: "15 Days", desc: "Brush up weak spots and consolidate notes." },
];

export function RoadmapTimeline() {
  const currentPhaseId = 2; // Default active phase

  return (
    <div className="premium-card rounded-3xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <Compass className="w-5 h-5 text-indigo-600 animate-spin-slow" />
        <div>
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">AI Goal Roadmap</h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Automated syllabus milestones progression.</p>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 after:absolute after:left-[11px] after:top-2 after:bottom-2 after:w-0.5 after:bg-gray-100">
        {phases.map((phase) => {
          const isCompleted = phase.id < currentPhaseId;
          const isActive = phase.id === currentPhaseId;

          return (
            <div key={phase.id} className="relative flex gap-4">
              <span className={`absolute -left-[20px] top-1 z-10 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                isCompleted
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : isActive
                    ? "bg-indigo-600 border-indigo-600 ring-4 ring-indigo-50 text-white"
                    : "bg-white border-gray-200 text-gray-300"
              }`}>
                {isCompleted && <span className="text-[8px] font-black">✓</span>}
              </span>

              <div className={`flex-1 p-4 rounded-2xl border transition-all ${
                isActive
                  ? "bg-indigo-50/40 border-indigo-100 shadow-xs"
                  : "bg-slate-50/50 border border-slate-100"
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-black tracking-tight ${isActive ? "text-indigo-600" : "text-gray-800"}`}>
                    {phase.title}
                  </h4>
                  <span className="text-[9px] font-extrabold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                    {phase.duration}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold mt-1 leading-relaxed">
                  {phase.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

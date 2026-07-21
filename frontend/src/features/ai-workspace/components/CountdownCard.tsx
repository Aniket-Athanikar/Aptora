"use client";

import React from "react";
import { useWorkspace } from "../workspaceContext";
import { CalendarRange, Hourglass } from "lucide-react";

export function CountdownCard() {
  const { studyGoal } = useWorkspace();

  return (
    <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-purple-50 text-purple-600 p-2 rounded-xl border border-purple-100">
            <CalendarRange className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Countdown</h5>
            <h4 className="text-sm font-black text-slate-800 mt-0.5">{studyGoal.examCountdownDays} Days Left</h4>
          </div>
        </div>

        <div className="bg-purple-50/50 border border-purple-100 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shrink-0">
          <Hourglass className="w-3.5 h-3.5 text-purple-600 animate-spin" />
          <span className="text-[9px] font-black text-purple-700 uppercase">Target May 24</span>
        </div>
      </div>

      {/* Progress metrics */}
      <div className="mt-4">
        <div className="flex justify-between items-center text-[10px] font-bold text-purple-750/70 mb-1.5">
          <span>SYLLABUS COVERAGE</span>
          <span>{studyGoal.weeklyProgress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${studyGoal.weeklyProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

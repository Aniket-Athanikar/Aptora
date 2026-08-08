"use client";

import React from "react";
import { useWorkspace } from "../workspaceContext";
import { CalendarRange, Hourglass, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function CountdownCard() {
  const { studyGoal } = useWorkspace();

  return (
    <div className="bg-gradient-to-br from-white to-purple-50/20 border border-purple-200/80 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-3 rounded-2xl border border-purple-400 shadow-md shadow-purple-100">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-[10px] font-black text-purple-700 uppercase tracking-widest leading-none flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" /> Exam Countdown
            </h5>
            <h4 className="text-sm font-black text-slate-900 mt-1">{studyGoal.examCountdownDays} Days Remaining</h4>
          </div>
        </div>

        <div className="bg-purple-100/80 border border-purple-200 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shrink-0 shadow-2xs">
          <Hourglass className="w-3.5 h-3.5 text-purple-700 animate-spin" />
          <span className="text-[9px] font-black text-purple-900 uppercase tracking-wider">Targeting Exams</span>
        </div>
      </div>

      {/* Progress metrics */}
      <div className="mt-4 pt-3 border-t border-purple-100">
        <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-700 mb-1.5">
          <span>SYLLABUS COVERAGE</span>
          <span className="text-purple-700 font-black">{studyGoal.weeklyProgress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/50 shadow-inner">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${studyGoal.weeklyProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 rounded-full shadow-xs"
          />
        </div>
      </div>
    </div>
  );
}
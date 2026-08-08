"use client";

import React from "react";
import { useWorkspace } from "../workspaceContext";
import { CalendarRange, Hourglass } from "lucide-react";
import { motion } from "framer-motion";

export function CountdownCard() {
  const { studyGoal } = useWorkspace();

  return (
    <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-purple-50 text-purple-600 p-2.5 rounded-2xl border border-purple-100/60">
            <CalendarRange className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Exam Countdown</h5>
            <h4 className="text-sm font-black text-slate-800 mt-1">{studyGoal.examCountdownDays} Days Left</h4>
          </div>
        </div>

        <div className="bg-purple-50/60 border border-purple-100/50 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shrink-0 shadow-sm">
          <Hourglass className="w-3.5 h-3.5 text-purple-600 animate-spin" />
          <span className="text-[9px] font-black text-purple-700 uppercase tracking-wider">Target May 24</span>
        </div>
      </div>

      {/* Progress metrics */}
      <div className="mt-4 pt-3.5 border-t border-slate-50">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-550 mb-1.5">
          <span>SYLLABUS PROGRESS</span>
          <span className="text-purple-600 font-extrabold">{studyGoal.weeklyProgress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${studyGoal.weeklyProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-500 via-[#6D4AFF] to-indigo-600 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

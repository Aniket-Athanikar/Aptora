"use client";

import React, { useState, useEffect } from "react";
import { useWorkspace } from "../workspaceContext";
import { CalendarRange, Hourglass, Sparkles, Target, Trophy, Flame } from "lucide-react";
import { motion } from "framer-motion";

export function CountdownCard() {
  const { studyGoal, activeWorkspace } = useWorkspace();
  const [timeLeft, setTimeLeft] = useState({ hours: 14, mins: 32, secs: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        return { hours: Math.max(0, prev.hours - 1), mins: 59, secs: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white border border-purple-100/70 rounded-3xl p-5 shadow-sm space-y-4 text-slate-800 relative overflow-hidden">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-purple-50 text-purple-600 p-2.5 rounded-2xl border border-purple-100">
            <Target className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h5 className="text-[9px] font-black text-purple-700 uppercase tracking-widest leading-none">
              {activeWorkspace?.examName || "UPSC CSE"} Target
            </h5>
            <h4 className="text-sm font-black text-slate-900 mt-1">
              {studyGoal.examCountdownDays} Days Remaining
            </h4>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shrink-0 shadow-2xs">
          <Hourglass className="w-3.5 h-3.5 text-purple-600 animate-spin" />
          <span className="text-[10px] font-black text-purple-800">Target Prelims</span>
        </div>
      </div>

      {/* Countdown Digital Timer Cards */}
      <div className="grid grid-cols-4 gap-2 text-center select-none">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2">
          <p className="text-base font-black text-slate-900 leading-none">{studyGoal.examCountdownDays}</p>
          <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">Days</p>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2">
          <p className="text-base font-black text-purple-700 leading-none">{String(timeLeft.hours).padStart(2, "0")}</p>
          <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">Hours</p>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2">
          <p className="text-base font-black text-indigo-700 leading-none">{String(timeLeft.mins).padStart(2, "0")}</p>
          <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">Mins</p>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2">
          <p className="text-base font-black text-rose-600 leading-none">{String(timeLeft.secs).padStart(2, "0")}</p>
          <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">Secs</p>
        </div>
      </div>

      {/* Syllabus Progress Bar */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-600 mb-1.5">
          <span className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" /> Syllabus Coverage
          </span>
          <span className="text-purple-700 font-black">{studyGoal.weeklyProgress}%</span>
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

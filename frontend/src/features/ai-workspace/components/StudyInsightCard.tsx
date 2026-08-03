"use client";

import React from "react";
import { useWorkspace } from "../workspaceContext";
import { Award, Flame, Clock, BarChart3, Compass, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function StudyInsightCard() {
  const { studyGoal } = useWorkspace();

  return (
    <div className="space-y-4">
      {/* Welcome & Streaks Widget */}
      <div className="bg-gradient-to-br from-purple-500/10 via-[#6D4AFF]/10 to-indigo-500/10 border border-purple-100/60 rounded-3xl p-5 shadow-sm text-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-[9px] font-black tracking-widest bg-purple-150 border border-purple-200/40 text-purple-700 px-2 py-0.5 rounded-md uppercase">
              STUDY
            </span>
            <h4 className="text-sm font-black text-slate-900 mt-2">Welcome Back, Scholar</h4>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">
              &ldquo;Consistency outperforms brilliance. Keep pushing.&rdquo;
            </p>
          </div>
          <Award className="w-8 h-8 text-purple-550 opacity-90 animate-pulse" />
        </div>

        {/* Goal & Streak list */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-200/50 relative z-10 text-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-white border border-purple-100/60 p-2 rounded-xl shadow-sm">
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Streak</p>
              <p className="text-xs font-black text-slate-800">{studyGoal.streak} Days</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white border border-purple-100/60 p-2 rounded-xl shadow-sm">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Study Time</p>
              <p className="text-xs font-black text-slate-800">{studyGoal.studyTimeMinutes} mins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal details */}
      <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Today&apos;s Study Goal</h5>
        <p className="text-xs font-bold text-slate-800 leading-relaxed bg-slate-50/50 border border-slate-100 p-3 rounded-2xl">
          {studyGoal.todayGoal}
        </p>
      </div>

      {/* Weak Subjects Breakdown */}
      <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Weak Topics Tracker</h5>
        </div>

        <div className="space-y-3.5">
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-650 mb-1">
              <span>Constitutional Writs</span>
              <span className="text-rose-600 font-extrabold">42% Mastery</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "42%" }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-rose-500 to-orange-450 rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-650 mb-1">
              <span>Fundamental Rights Exceptions</span>
              <span className="text-amber-600 font-extrabold">58% Mastery</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "58%" }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-450 rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-655 mb-1">
              <span>Directive Principles (DPSP)</span>
              <span className="text-emerald-600 font-extrabold">85% Mastery</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "85%" }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Study Assets */}
      <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3.5">
          <Compass className="w-5 h-5 text-purple-650" />
          <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Recommended Readings</h5>
        </div>
        <div className="space-y-2.5">
          <div className="p-3 bg-slate-50/60 hover:bg-purple-50/40 border border-slate-200/60 rounded-2xl transition-all cursor-pointer flex items-center justify-between group">
            <div className="space-y-1">
              <h6 className="text-[10px] font-black text-slate-800">Supreme Court Writs Landmark Cases</h6>
              <ul className="text-[9px] text-slate-400 list-disc pl-3.5 space-y-0.5">
                <li>Focus Case: ADM Jabalpur v. Shivkant Shukla</li>
                <li>Writ exceptions study guide</li>
              </ul>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          <div className="p-3 bg-slate-50/60 hover:bg-purple-50/40 border border-slate-200/60 rounded-2xl transition-all cursor-pointer flex items-center justify-between group">
            <div className="space-y-1">
              <h6 className="text-[10px] font-black text-slate-800">Fundamental Rights vs. DPSP Clash</h6>
              <ul className="text-[9px] text-slate-400 list-disc pl-3.5 space-y-0.5">
                <li>Focus Case: Kesavananda Bharati case 1973</li>
                <li>Basic structure doctrine checklist</li>
              </ul>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

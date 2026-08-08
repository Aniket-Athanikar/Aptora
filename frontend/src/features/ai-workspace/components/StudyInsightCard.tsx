"use client";

import React from "react";
import { useWorkspace } from "../workspaceContext";
import { Award, Flame, Clock, BarChart3, Compass, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function StudyInsightCard() {
  const { studyGoal } = useWorkspace();

  return (
    <div className="space-y-4">
      {/* Welcome & Streaks Widget */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 border border-purple-400 rounded-3xl p-5 shadow-md text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-[9px] font-black tracking-widest bg-white/20 text-white px-2 py-0.5 rounded-md uppercase backdrop-blur-xs">
              AI STUDY
            </span>
            <h4 className="text-sm font-black text-white mt-2">Welcome Back, Scholar</h4>
            <p className="text-[10px] text-purple-100 font-bold mt-1">
              &ldquo;Consistency outperforms brilliance. Keep pushing daily.&rdquo;
            </p>
          </div>
          <Award className="w-8 h-8 text-amber-300 animate-pulse shrink-0" />
        </div>

        {/* Goal & Streak list */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-purple-400/50 relative z-10 text-white">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 border border-white/30 p-2 rounded-xl backdrop-blur-xs">
              <Flame className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <p className="text-[9px] text-purple-200 font-extrabold uppercase tracking-wider">Streak</p>
              <p className="text-xs font-black text-white">{studyGoal.streak} Days Active</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 border border-white/30 p-2 rounded-xl backdrop-blur-xs">
              <Clock className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <p className="text-[9px] text-purple-200 font-extrabold uppercase tracking-wider">Study Time</p>
              <p className="text-xs font-black text-white">{studyGoal.studyTimeMinutes} Mins Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal details */}
      <div className="bg-white border border-purple-200/80 rounded-3xl p-5 shadow-sm">
        <h5 className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Today&apos;s Focus Goal
        </h5>
        <p className="text-xs font-extrabold text-slate-800 leading-relaxed bg-purple-50/50 border border-purple-100 p-3.5 rounded-2xl">
          {studyGoal.todayGoal}
        </p>
      </div>

      {/* Weak Subjects Breakdown */}
      <div className="bg-white border border-purple-200/80 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-purple-600" />
          <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Weak Topics Tracker</h5>
        </div>

        <div className="space-y-3.5">
          <div>
            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-800 mb-1">
              <span>Constitutional Writs</span>
              <span className="text-rose-600 font-black">42% Mastery</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "42%" }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-800 mb-1">
              <span>Fundamental Rights Exceptions</span>
              <span className="text-amber-600 font-black">58% Mastery</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "58%" }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-800 mb-1">
              <span>Directive Principles (DPSP)</span>
              <span className="text-emerald-600 font-black">85% Mastery</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
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
      <div className="bg-white border border-purple-200/80 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3.5">
          <Compass className="w-4 h-4 text-purple-700" />
          <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Recommended Readings</h5>
        </div>
        <div className="space-y-2.5">
          <div className="p-3 bg-purple-50/40 hover:bg-purple-100/50 border border-purple-100 rounded-2xl transition-all cursor-pointer flex items-center justify-between group shadow-2xs">
            <div className="space-y-1">
              <h6 className="text-[11px] font-black text-slate-900">Supreme Court Writs Landmark Cases</h6>
              <ul className="text-[10px] text-slate-700 font-bold list-disc pl-3.5 space-y-0.5">
                <li>Focus Case: ADM Jabalpur v. Shivkant Shukla</li>
                <li>Writ exceptions study guide</li>
              </ul>
            </div>
            <ChevronRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>

          <div className="p-3 bg-purple-50/40 hover:bg-purple-100/50 border border-purple-100 rounded-2xl transition-all cursor-pointer flex items-center justify-between group shadow-2xs">
            <div className="space-y-1">
              <h6 className="text-[11px] font-black text-slate-900">Fundamental Rights vs. DPSP Clash</h6>
              <ul className="text-[10px] text-slate-700 font-bold list-disc pl-3.5 space-y-0.5">
                <li>Focus Case: Kesavananda Bharati case 1973</li>
                <li>Basic structure doctrine checklist</li>
              </ul>
            </div>
            <ChevronRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
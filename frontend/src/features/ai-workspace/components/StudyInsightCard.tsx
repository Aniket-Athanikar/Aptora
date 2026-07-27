"use client";

import React from "react";
import { useWorkspace } from "../workspaceContext";
import { Award, Flame, Clock, BarChart3, AlertCircle, Bookmark, Compass } from "lucide-react";

export function StudyInsightCard() {
  const { studyGoal } = useWorkspace();

  return (
    <div className="space-y-4">
      {/* Welcome & Streaks Widget */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-5 shadow-md shadow-purple-150">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[9px] font-black tracking-widest bg-white/20 px-2 py-0.5 rounded-md uppercase">
              STUDY OSC
            </span>
            <h4 className="text-sm font-black mt-2">Welcome Back, Scholar</h4>
            <p className="text-[10px] text-purple-100 font-semibold mt-1">
              &ldquo;Consistency outperforms brilliance. Keep pushing.&rdquo;
            </p>
          </div>
          <Award className="w-8 h-8 text-purple-200 opacity-90 animate-pulse" />
        </div>

        {/* Goal & Streak list */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4.5 border-t border-white/10 text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/15 p-2 rounded-xl">
              <Flame className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <p className="text-[9px] opacity-70 font-bold uppercase tracking-wider">Streak</p>
              <p className="text-xs font-black">{studyGoal.streak} Days</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/15 p-2 rounded-xl">
              <Clock className="w-4 h-4 text-sky-200" />
            </div>
            <div>
              <p className="text-[9px] opacity-70 font-bold uppercase tracking-wider">Study Time</p>
              <p className="text-xs font-black">{studyGoal.studyTimeMinutes} mins</p>
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
        <div className="flex items-center gap-2 mb-3.5">
          <BarChart3 className="w-4 h-4 text-purple-500" />
          <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Weak Topics Tracker</h5>
        </div>

        <div className="space-y-3.5">
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 mb-1">
              <span>Constitutional Writs</span>
              <span className="text-red-500 font-extrabold">42% Mastery</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-400 rounded-full" style={{ width: "42%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 mb-1">
              <span>Fundamental Rights Exceptions</span>
              <span className="text-amber-500 font-extrabold">58% Mastery</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: "58%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 mb-1">
              <span>Directive Principles (DPSP)</span>
              <span className="text-emerald-500 font-extrabold">85% Mastery</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: "85%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Study Assets */}
      <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-4 h-4 text-purple-500" />
          <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Recommended Readings</h5>
        </div>
        <div className="space-y-2">
          <div className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-colors cursor-pointer">
            <h6 className="text-[10px] font-black text-slate-800 line-clamp-1">Supreme Court Writs Landmark Cases</h6>
            <p className="text-[8px] text-slate-400 mt-0.5">Focus Case: ADM Jabalpur v. Shivkant Shukla</p>
          </div>
          <div className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-colors cursor-pointer">
            <h6 className="text-[10px] font-black text-slate-800 line-clamp-1">Fundamental Rights vs. DPSP Clash</h6>
            <p className="text-[8px] text-slate-400 mt-0.5">Focus Case: Kesavananda Bharati case 1973</p>
          </div>
        </div>
      </div>
    </div>
  );
}

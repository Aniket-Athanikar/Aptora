import React from "react";
import { Sparkles, Calendar, Flame } from "lucide-react";

interface ProgressHeroProps {
  examName: string;
  completionPercentage: number;
  remainingDays: number;
  streak: number;
}

export function ProgressHero({ examName, completionPercentage, remainingDays, streak }: ProgressHeroProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-indigo-800/30">
      {/* Decorative backdrop shapes */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">
            Your Exam Journey 🚀
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">{examName}</h2>

          {/* Progress Bar */}
          <div className="space-y-2 max-w-md pt-2">
            <div className="flex justify-between text-xs font-bold text-indigo-200">
              <span>Overall Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800/80 border border-slate-700/35 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hero Counters */}
        <div className="flex gap-4.5">
          <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-4.5 text-center min-w-[125px] hover:scale-105 transition-transform duration-300">
            <Calendar className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <div className="text-xl font-black text-white">{remainingDays}</div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">Days Remaining</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-4.5 text-center min-w-[125px] hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(239,68,68,0.07)]">
            <Flame className="w-6 h-6 text-red-500 mx-auto mb-2 animate-bounce" />
            <div className="text-xl font-black text-white">{streak} Days</div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">Active Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}

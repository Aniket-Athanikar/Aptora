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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-purple-500/15 p-6 md:p-8 text-slate-900 border border-amber-200/60 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
      {/* Decorative backdrop glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <span className="inline-flex items-center gap-1.5 bg-amber-100/80 text-amber-900 border border-amber-300/60 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Your Exam Journey
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{examName}</h2>

          {/* Progress Bar */}
          <div className="space-y-2 max-w-md pt-1">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Overall Progress</span>
              <span className="text-emerald-700 font-black">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 border border-slate-200/60 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hero Counters */}
        <div className="flex gap-4 shrink-0">
          <div className="bg-white/90 border border-emerald-100/80 backdrop-blur-md rounded-2xl p-4.5 text-center min-w-[125px] hover:border-emerald-300 hover:shadow-md transition-all duration-300">
            <Calendar className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
            <div className="text-2xl font-black text-slate-900">{remainingDays}</div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">Days Remaining</div>
          </div>

          <div className="bg-white/90 border border-emerald-100/80 backdrop-blur-md rounded-2xl p-4.5 text-center min-w-[125px] hover:border-emerald-300 hover:shadow-md transition-all duration-300">
            <Flame className="w-6 h-6 text-amber-500 mx-auto mb-1.5 animate-bounce" />
            <div className="text-2xl font-black text-slate-900">{streak} Days</div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">Active Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}

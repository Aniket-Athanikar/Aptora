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
    <div className="bg-gradient-to-br from-white via-indigo-50/50 to-purple-50/40 text-slate-900 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden border border-indigo-100/80">
      {/* Decorative backdrop glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#6D4AFF]/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-300/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <span className="inline-flex items-center gap-1.5 bg-[#6D4AFF]/10 text-[#6D4AFF] border border-[#6D4AFF]/20 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Your Exam Journey
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{examName}</h2>

          {/* Progress Bar */}
          <div className="space-y-2 max-w-md pt-1">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Overall Progress</span>
              <span className="text-[#6D4AFF] font-black">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 border border-slate-200/60 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-[#6D4AFF] via-purple-500 to-indigo-500 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hero Counters */}
        <div className="flex gap-4">
          <div className="bg-white/90 border border-indigo-100/80 backdrop-blur-md rounded-2xl p-4.5 text-center min-w-[125px] hover:border-indigo-300 hover:shadow-md transition-all duration-300">
            <Calendar className="w-6 h-6 text-[#6D4AFF] mx-auto mb-1.5" />
            <div className="text-2xl font-black text-slate-900">{remainingDays}</div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">Days Remaining</div>
          </div>

          <div className="bg-white/90 border border-indigo-100/80 backdrop-blur-md rounded-2xl p-4.5 text-center min-w-[125px] hover:border-indigo-300 hover:shadow-md transition-all duration-300">
            <Flame className="w-6 h-6 text-rose-500 mx-auto mb-1.5 animate-bounce" />
            <div className="text-2xl font-black text-slate-900">{streak} Days</div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">Active Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}

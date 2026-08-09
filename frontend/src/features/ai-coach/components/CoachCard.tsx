import React from "react";
import { Bot, Sparkles } from "lucide-react";

interface CoachCardProps {
  userName: string;
  completionRate: number;
  message?: string;
  onViewRecommendations?: () => void;
}

export function CoachCard({ userName, completionRate, message, onViewRecommendations }: CoachCardProps) {
  const dynamicMessage = message || `Your target exam journey is progressing well. You completed ${completionRate}% of this week's target. Let's focus on high-weight revision blocks today.`;

  return (
    <div className="bg-gradient-to-br from-white via-indigo-50/50 to-purple-50/40 text-slate-900 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden border border-indigo-100/90">
      {/* Decorative radial glows */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#6D4AFF]/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-indigo-300/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2">
            <div className="bg-[#6D4AFF]/10 text-[#6D4AFF] border border-[#6D4AFF]/20 p-2 rounded-2xl">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-[#6D4AFF] font-black uppercase tracking-widest bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 px-2.5 py-0.5 rounded-full">
              AI STUDY COACH
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Good Morning, {userName} 👋
          </h2>

          <p className="text-sm md:text-base font-medium text-slate-700 max-w-xl leading-relaxed italic border-l-2 border-[#6D4AFF]/40 pl-4 py-1">
            {`"${dynamicMessage}"`}
          </p>

          <div className="pt-2">
            <button
              onClick={onViewRecommendations}
              className="bg-[#6D4AFF] hover:bg-[#5A36EE] text-white text-xs font-black px-5 py-3 rounded-2xl transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5 hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> View Smart Recommendations
            </button>
          </div>
        </div>

        {/* Small coaching stats block */}
        <div className="bg-white/90 border border-indigo-100/90 backdrop-blur-md rounded-2xl p-5 md:w-56 text-left space-y-3.5 shrink-0 shadow-xs">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Memory Profile</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-semibold">Weekly Target</span>
              <span className="font-extrabold text-[#6D4AFF]">{completionRate}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-semibold">Weak Area</span>
              <span className="font-extrabold text-amber-600">Economy</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-semibold">Study Habit</span>
              <span className="font-extrabold text-emerald-600">Morning Slots</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Bot, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";

interface CoachCardProps {
  userName: string;
  completionRate: number;
  message?: string;
  onViewRecommendations?: () => void;
}

export function CoachCard({ userName, completionRate, message, onViewRecommendations }: CoachCardProps) {
  const dynamicMessage = message || `Your UPSC journey is progressing well. You completed ${completionRate}% of this week's target. Let's improve Economy this week.`;

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-indigo-800/30">
      {/* Decorative radial glows */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 p-2 rounded-2xl">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">
              AI STUDY COACH
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            Good Morning {userName} 👋
          </h2>

          <p className="text-sm md:text-base font-medium text-indigo-100 max-w-xl leading-relaxed italic border-l-2 border-indigo-500/40 pl-4 py-1">
            {`"${dynamicMessage}"`}
          </p>

          <div className="pt-2">
            <button
              onClick={onViewRecommendations}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-5 py-3 rounded-2xl transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> View Smart Recommendations
            </button>
          </div>
        </div>

        {/* Small coaching stats block */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 md:w-56 text-left space-y-3.5 shrink-0">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Memory Profile</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-semibold">Weekly Target</span>
              <span className="font-extrabold text-indigo-300">{completionRate}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-semibold">Weak Area</span>
              <span className="font-extrabold text-amber-400">Economy</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-semibold">Study Habit</span>
              <span className="font-extrabold text-emerald-400">Morning Slots</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

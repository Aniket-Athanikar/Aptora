import React from "react";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { GoalData } from "@/types/goal.types";

interface StepTimelineProps {
  draft: Partial<GoalData>;
  errors: Record<string, string>;
  stepStyles: Record<string, string>;
  updateWizardDraft: (payload: Partial<GoalData>) => void;
  theme: Record<string, string>;
}

export function StepTimeline({
  draft,
  errors,
  stepStyles,
  updateWizardDraft,
  theme
}: StepTimelineProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5 pl-1">
              <Calendar className="w-4 h-4 text-amber-500" /> Exam Date
            </label>
            <input
              type="date"
              value={draft.timeline?.examDate || ""}
              onChange={(e) => updateWizardDraft({
                timeline: { ...draft.timeline!, examDate: e.target.value }
              })}
              className={`border rounded-xl px-4 py-3 text-xs focus:outline-none bg-white font-semibold ${stepStyles.focusBorder}`}
            />
            {errors.examDate && <p className="text-red-500 text-xs pl-1 font-bold">{errors.examDate}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5 pl-1">
              <Clock className="w-4 h-4 text-amber-500" /> Target Study Hours (Daily)
            </label>
            <div className="flex items-center gap-4 mt-1.5">
              <input
                type="range"
                min="2"
                max="15"
                value={draft.timeline?.dailyStudyHours || 8}
                onChange={(e) => updateWizardDraft({
                  timeline: { ...draft.timeline!, dailyStudyHours: parseInt(e.target.value) }
                })}
                className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="w-20 text-center font-black text-amber-700 text-xs bg-amber-50 border border-amber-100 py-2.5 px-3.5 rounded-xl shrink-0 shadow-sm flex items-center justify-center gap-0.5">
                {draft.timeline?.dailyStudyHours || 8} Hrs
              </span>
            </div>
            {errors.dailyStudyHours && <p className="text-red-500 text-xs pl-1 font-bold">{errors.dailyStudyHours}</p>}
          </div>
        </div>

        {/* Timeline calculations output */}
        <div className="bg-amber-50/15 border border-amber-200/30 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-300/10 rounded-full blur-xl pointer-events-none" />
          <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> AI Calculator Projections
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-slate-150 shadow-xs text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400">Days Remaining</span>
              <p className="text-lg font-black text-amber-600 mt-1">{draft.timeline?.remainingDays || 0} Days</p>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-slate-150 shadow-xs text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Study Hours</span>
              <p className="text-lg font-black text-amber-600 mt-1">
                {((draft.timeline?.remainingDays || 0) * (draft.timeline?.dailyStudyHours || 8)).toLocaleString()} Hrs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-slate-150 shadow-xs text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400">Burnout Risk</span>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${draft.timeline?.burnoutRisk === "High" ? "bg-rose-500" : draft.timeline?.burnoutRisk === "Moderate" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                <span className="text-xs font-extrabold text-slate-800">{draft.timeline?.burnoutRisk || "Low"}</span>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-slate-150 shadow-xs text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400">Difficulty Level</span>
              <p className="text-xs font-extrabold text-slate-800 mt-2">{draft.timeline?.difficulty || "Medium"}</p>
            </div>
          </div>

          <div className={`bg-gradient-to-r ${theme.gradient} text-white p-4.5 rounded-2xl flex items-center justify-between shadow-md`}>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-wider opacity-90 leading-none">Success Prediction Rate</p>
              <p className="text-[9px] opacity-75 mt-1 leading-none">Based on hours, coverage, target date</p>
            </div>
            <span className="text-2xl font-black">{draft.timeline?.successPrediction || 65}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

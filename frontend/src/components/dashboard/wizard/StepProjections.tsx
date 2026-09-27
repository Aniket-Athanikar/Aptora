import React from "react";
import { Sparkles, Star } from "lucide-react";
import { GoalData } from "@/types/goal.types";

interface StepProjectionsProps {
  draft: Partial<GoalData>;
  theme: Record<string, string>;
}

export function StepProjections({
  draft,
  theme
}: StepProjectionsProps) {
  return (
    <div className="space-y-6">
      {/* Performance projection panel */}
      <div className={`bg-gradient-to-r ${theme.gradient} text-white p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-2 relative z-10 text-left">
          <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-500/80 border border-yellow-450/50 px-3 py-1 rounded-full">
            Calibration Forecast Established
          </span>
          <h4 className="text-xl font-black">Calibration Projections Calculated!</h4>
          <p className="text-yellow-100 text-xs max-w-md">The Aptora engine combined your inputs from all steps to calibrate target milestones</p>
        </div>

        <div className="flex items-center gap-4 bg-yellow-700/40 p-4.5 rounded-2xl border border-yellow-500/40 relative z-10 shrink-0">
          <div className="text-center">
            <span className="text-[9px] text-yellow-200 uppercase font-black tracking-wider">Success Prediction</span>
            <p className="text-3xl font-black mt-1">{draft.timeline?.successPrediction || 65}%</p>
          </div>
        </div>
      </div>

      {/* Calculations math breakdown */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4">
        <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> Success Predictor Calculation Math
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-500">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
            <span className="text-[9px] text-slate-400 uppercase font-bold block">1. Baseline Level</span>
            <span className="text-sm font-black text-slate-800 mt-1 block">50.0%</span>
            <p className="text-[9px] text-slate-400 mt-1">Base probability chance</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
            <span className="text-[9px] text-slate-400 uppercase font-bold block">2. Hours Multiplier</span>
            <span className="text-sm font-black text-amber-606 mt-1 block">+{((draft.timeline?.dailyStudyHours || 8) * 2.5).toFixed(1)}%</span>
            <p className="text-[9px] text-slate-400 mt-1">Based on {draft.timeline?.dailyStudyHours || 8} study hrs</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
            <span className="text-[9px] text-slate-400 uppercase font-bold block">3. Study Formats Bonus</span>
            <span className="text-sm font-black text-emerald-606 mt-1 block">+{((draft.preferences?.length || 0) * 1.5).toFixed(1)}%</span>
            <p className="text-[9px] text-slate-400 mt-1">Based on {draft.preferences?.length || 0} active modes</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
            <span className="text-[9px] text-slate-400 uppercase font-bold block">4. Weakness Buffer</span>
            <span className="text-sm font-black text-amber-605 mt-1 block">
              -{(Math.max(0, 10 - ((draft.weaknesses || []).reduce((acc, w) => acc + w.confidence, 0) / ((draft.weaknesses || []).length || 1)) * 2)).toFixed(1)}%
            </span>
            <p className="text-[9px] text-slate-400 mt-1">Average weakness ratings drag</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile, Timeline & Environment */}
        <div className="md:col-span-2 space-y-5 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-3xs">
          <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-3">Profile & Logistics</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-semibold text-slate-700">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Aspirant Name</span>
              <p className="font-black text-slate-800">{draft.profile?.fullName || "Student"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Target Exam Category</span>
              <p className="font-black text-slate-800">{draft.targetExam} ({draft.examCategory || "Custom"})</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Syllabus Status</span>
              <p className="font-black text-slate-800">{draft.profile?.syllabusPercent || 0}% Complete</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Target Exam Date</span>
              <p className="font-black text-slate-800">{draft.timeline?.examDate} ({draft.timeline?.remainingDays} Days Left)</p>
            </div>
            <div className="space-y-2 col-span-2 border-t border-slate-100 pt-4.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Study Environment</span>
                <p className="font-bold text-slate-700">{draft.lifestyle?.learningEnvironment || "Quiet Study Room"}</p>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Study Slots / Device</span>
                <p className="font-bold text-slate-700">{draft.lifestyle?.slots?.join(", ")} via {draft.lifestyle?.preferredDevice}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Step 6 selections list */}
        <div className="space-y-5 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-3xs">
          <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-3">Weak Subjects</h5>
          <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
            {(draft.weaknesses || [])
              .filter((w) => w.confidence <= 3 || w.priority === "High" || w.priority === "Medium")
              .map((w, index) => (
                <div key={index} className="flex flex-col gap-2 bg-slate-50 border border-slate-200/40 p-3.5 rounded-xl text-xs font-bold">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Star className={`w-4 h-4 shrink-0 ${w.priority === "High"
                        ? "fill-rose-500 text-rose-500 animate-pulse"
                        : w.priority === "Medium"
                          ? "fill-amber-500 text-amber-500"
                          : "fill-emerald-500 text-emerald-500"
                        }`} />
                      <span className="text-slate-800 font-extrabold truncate max-w-[125px]">{w.subject}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{w.difficulty}</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-200/50 pt-2.5 mt-1">
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Confidence</span>
                    <span className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => {
                        const isFilled = i < w.confidence;
                        return (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${isFilled ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                          />
                        );
                      })}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
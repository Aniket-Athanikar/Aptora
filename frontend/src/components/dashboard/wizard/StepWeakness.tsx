import React from "react";
import { X } from "lucide-react";
import { GoalData } from "@/types/goal.types";

interface StepWeaknessProps {
  draft: Partial<GoalData>;
  errors: Record<string, string>;
  customSubjectName: string;
  setCustomSubjectName: (val: string) => void;
  onAddCustomSubject: () => void;
  onRemoveSubject: (index: number) => void;
  onWeaknessConfidenceChange: (index: number, stars: number) => void;
  onWeaknessDifficultyChange: (index: number, diff: "Easy" | "Medium" | "Hard") => void;
}

export function StepWeakness({
  draft,
  errors,
  customSubjectName,
  setCustomSubjectName,
  onAddCustomSubject,
  onRemoveSubject,
  onWeaknessConfidenceChange,
  onWeaknessDifficultyChange
}: StepWeaknessProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 pl-1">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-black text-slate-800">Review Subject Competencies for {draft.targetExam || "Selected Exam"}</label>
          <p className="text-xs text-slate-450 font-medium">Rate your active confidence (1 = No confidence, 5 = High mastery) to automatically program AI focus revisions.</p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Add custom subject/module name..."
            value={customSubjectName}
            onChange={(e) => setCustomSubjectName(e.target.value)}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-white font-semibold"
          />
          <button
            type="button"
            onClick={onAddCustomSubject}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-5 rounded-xl cursor-pointer transition-all hover:scale-102 shrink-0 shadow-sm"
          >
            Add Subject
          </button>
        </div>
        {errors.weaknesses && <p className="text-rose-500 text-[10px] font-black mt-1.5">{errors.weaknesses}</p>}
      </div>

      <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {draft.weaknesses?.map((w, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 p-4.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-3xs">
            <div className="flex-1 min-w-[180px]">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${w.priority === "High" ? "bg-rose-500" : w.priority === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                <h5 className="font-extrabold text-slate-800 text-sm">{w.subject}</h5>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block mt-1.5">
                Weakness: {w.weaknessScore}% &bull; Priority: {w.priority}
              </span>
            </div>

            <div className="flex flex-1 items-center gap-3 justify-start md:justify-center">
              <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Confidence</label>
              <div className="flex gap-1 p-0.5 rounded-xl border border-slate-200/60 bg-slate-50">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => onWeaknessConfidenceChange(idx, stars)}
                    className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${w.confidence >= stars
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-650"
                      }`}
                  >
                    {stars}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Difficulty</label>
              <div className="flex bg-slate-50 p-0.5 rounded-xl border border-slate-200/60">
                {(["Easy", "Medium", "Hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => onWeaknessDifficultyChange(idx, diff)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${w.difficulty === diff
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-400 hover:text-slate-700"
                      }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onRemoveSubject(idx)}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50/50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
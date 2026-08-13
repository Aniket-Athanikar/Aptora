import React from "react";
import { motion } from "framer-motion";
import { Compass, Trash2, Award } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { GoalData } from "@/types/goal.types";
import { PRESET_EXAMS } from "./constants";

interface StepTargetProps {
  draft: Partial<GoalData>;
  errors: Record<string, string>;
  stepStyles: Record<string, string>;
  customExam: string;
  setCustomCategory: (val: string) => void;
  customCategory: string;
  setCustomExam: (val: string) => void;
  onSelectExam: (exam: string, category: string) => void;
  onSetCustomExam: () => void;
  onClearExam: () => void;
}

export function StepTarget({
  draft,
  errors,
  stepStyles,
  customExam,
  setCustomExam,
  customCategory,
  setCustomCategory,
  onSelectExam,
  onSetCustomExam,
  onClearExam
}: StepTargetProps) {
  return (
    <div className="space-y-6">
      <div className={`flex flex-col gap-4 p-5 rounded-2xl border ${stepStyles.cardBg}`}>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Add custom Target Exam details</h4>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 flex flex-col gap-1.5 w-full">
            <label className="text-[9px] font-black text-slate-500 uppercase pl-1">Exam Name</label>
            <input
              type="text"
              placeholder="e.g. GRE, TOEFL, IELTS..."
              value={customExam}
              onChange={(e) => setCustomExam(e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:bg-white font-semibold transition-all ${errors.targetExam
                ? "border-red-400 focus:ring-2 focus:ring-red-400/10"
                : `border-slate-200 ${stepStyles.focusBorder}`
                }`}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1.5 w-full">
            <label className="text-[9px] font-black text-slate-500 uppercase pl-1">Exam Category</label>
            <input
              type="text"
              placeholder="e.g. Higher Studies, Lang Proficiency..."
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:bg-white font-semibold transition-all ${errors.targetExam
                ? "border-red-400 focus:ring-2 focus:ring-red-400/10"
                : `border-slate-200 ${stepStyles.focusBorder}`
                }`}
            />
          </div>
          <button
            type="button"
            onClick={onSetCustomExam}
            className={`text-xs font-black px-5 py-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center shrink-0 w-full md:w-auto ${stepStyles.btnBg}`}
          >
            Set Exam
          </button>
        </div>
        {errors.targetExam && <p className="text-red-500 text-xs mt-1 pl-1 font-bold">{errors.targetExam}</p>}
      </div>

      {draft.targetExam && (
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-between p-4 bg-indigo-50/40 border border-indigo-100/60 rounded-2xl relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-[#10B981] flex items-center justify-center text-white shadow-sm shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider leading-none block">Selected Exam Target</span>
              <h4 className="font-extrabold text-slate-800 text-sm mt-0.5 leading-tight">
                {draft.targetExam} <span className="text-slate-500 font-semibold text-xs ml-1.5">({draft.examCategory || "Custom"})</span>
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={onClearExam}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
            title="Clear Selection"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PRESET_EXAMS.map((item) => {
          const selected = draft.targetExam === item.name;
          const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[item.icon] || Award;
          return (
            <button
              key={item.name}
              onClick={() => onSelectExam(item.name, item.category)}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all relative overflow-hidden group cursor-pointer ${selected
                ? stepStyles.activeSelectionCard
                : "border-slate-200/60 bg-white/40 hover:bg-slate-50/50 hover:scale-[1.01]"
                }`}
              style={{
                boxShadow: selected ? `0 6px 20px ${item.glow}` : undefined
              }}
            >
              <div className={`mb-2 p-2 rounded-xl w-10 h-10 flex items-center justify-center transition-colors ${selected ? "bg-white text-indigo-600 shadow-xs" : "bg-slate-50 text-slate-400 group-hover:bg-white"}`}>
                <IconComponent className="w-5.5 h-5.5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{item.category}</p>
                <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{item.name}</h4>
              </div>
              {selected && (
                <div className="absolute right-3.5 top-3.5 bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">✓</div>
              )}
            </button>
          );
        })}
      </div>

      {draft.targetExam && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-5 rounded-2xl border flex items-center justify-between ${stepStyles.cardBg}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white rounded-xl shadow-xs">
              <LucideIcons.Target className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Active Choice</p>
              <p className="font-black text-slate-800 text-sm">{draft.targetExam} ({draft.examCategory})</p>
            </div>
          </div>
          <span className="text-xs text-indigo-600 bg-white border border-indigo-100 px-3 py-1 rounded-full font-bold shadow-xs">Syllabus Matrix Populated</span>
        </motion.div>
      )}
    </div>
  );
}
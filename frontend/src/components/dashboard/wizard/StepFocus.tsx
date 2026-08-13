import React from "react";
import * as LucideIcons from "lucide-react";
import { GoalData } from "@/types/goal.types";

interface StepFocusProps {
  draft: Partial<GoalData>;
  errors: Record<string, string>;
  updateWizardDraft: (payload: Partial<GoalData>) => void;
}

export function StepFocus({
  draft,
  errors,
  updateWizardDraft
}: StepFocusProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col pl-1">
        <label className="text-sm font-black text-slate-800 mb-1">Select Study & Revision preferences</label>
        <p className="text-xs text-slate-450 font-medium">Our study blueprint generator configures daily goals tailored to these learning formats.</p>
        {errors.preferences && <p className="text-rose-500 text-[10px] font-black mt-2">{errors.preferences}</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: "Video lectures", icon: "Video", color: "rgba(99, 102, 241, 0.08)" },
          { name: "Reading books", icon: "BookOpen", color: "rgba(16, 185, 129, 0.08)" },
          { name: "Practice Questions", icon: "PenTool", color: "rgba(245, 158, 11, 0.08)" },
          { name: "PYQs (Previous Years)", icon: "Calendar", color: "rgba(239, 68, 68, 0.08)" },
          { name: "Mock Tests", icon: "Award", color: "rgba(139, 92, 246, 0.08)" },
          { name: "Flashcards", icon: "Layers", color: "rgba(244, 63, 94, 0.08)" },
          { name: "Mind Maps", icon: "Brain", color: "rgba(6, 182, 212, 0.08)" },
          { name: "AI Tutor sessions", icon: "Bot", color: "rgba(79, 70, 229, 0.08)" },
          { name: "Revision Notes", icon: "FileText", color: "rgba(100, 116, 139, 0.08)" },
          { name: "Discussion Forums", icon: "Users", color: "rgba(79, 70, 229, 0.08)" },
          { name: "Live Classes", icon: "Radio", color: "rgba(217, 70, 239, 0.08)" }
        ].map((pref) => {
          const selected = draft.preferences?.includes(pref.name) || false;
          const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[pref.icon] || LucideIcons.Award;
          return (
            <button
              key={pref.name}
              type="button"
              onClick={() => {
                const currentPrefs = draft.preferences || [];
                const nextPrefs = selected
                  ? currentPrefs.filter((p) => p !== pref.name)
                  : [...currentPrefs, pref.name];
                updateWizardDraft({ preferences: nextPrefs });
              }}
              className={`p-5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer hover:scale-[1.02] ${selected
                ? "border-sky-500 bg-sky-50/40 shadow-sm"
                : "border-slate-200 hover:border-sky-300 hover:bg-slate-50/50"
                }`}
              style={{
                boxShadow: selected ? `0 6px 16px ${pref.color}` : undefined
              }}
            >
              <Icon className={`w-6 h-6 ${selected ? "text-sky-600 animate-pulse-subtle" : "text-slate-400"}`} />
              <span className="text-xs font-extrabold text-slate-700">{pref.name}</span>
              {selected && (
                <span className="text-[9px] font-black text-white bg-sky-600 px-2 py-0.5 rounded-full shadow-xs">Active</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
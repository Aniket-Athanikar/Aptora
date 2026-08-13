"use client";

import React from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { Sparkles, AlertTriangle, Lightbulb, Check } from "lucide-react";
import { motion } from "framer-motion";

export function Recommendations() {
  const { recommendations, activeGoal, completeWizard } = useGoalEngine();

  if (!activeGoal || recommendations.length === 0) return null;

  // Handler to perform action adjustments based on recommendation rule triggers
  const handleResolve = (ruleName: string) => {
    if (!activeGoal) return;

    const updatedGoal = {
      ...activeGoal,
      timeline: { ...activeGoal.timeline },
      preferences: [...activeGoal.preferences],
      weaknesses: [...activeGoal.weaknesses]
    };
    let desc = "";

    if (ruleName === "burnout_risk") {
      updatedGoal.timeline = {
        ...updatedGoal.timeline,
        dailyStudyHours: 8, // Adjust down to safe limit
      };
      desc = "Resolved Burnout risk by resetting daily study hours to 8";
    } else if (ruleName === "low_study_time") {
      updatedGoal.timeline = {
        ...updatedGoal.timeline,
        dailyStudyHours: 7, // Increase study target
      };
      desc = "Resolved Study Inconsistency by increasing daily study target to 7 hours";
    } else if (ruleName === "missing_practice") {
      updatedGoal.preferences = [...updatedGoal.preferences, "Practice Questions", "Mock Tests"];
      desc = "Resolved Practice deficit by enabling Practice Questions & Mocks";
    } else if (ruleName.startsWith("weakness_")) {
      const subjectName = ruleName.replace("weakness_", "");
      // Add a special recommendation log to that subject
      updatedGoal.weaknesses = updatedGoal.weaknesses.map((w) =>
        w.subject === subjectName
          ? { ...w, confidence: Math.min(5, w.confidence + 1), aiRecommendation: "Priority study hour slot allocated." }
          : w
      );
      desc = `Increased confidence parameter checklist for subject ${subjectName}`;
    }

    if (desc) {
      completeWizard(updatedGoal, desc);
    }
  };

  return (
    <div className="p-5 sm:p-6 bg-white/70 backdrop-blur-xl border border-white/45 rounded-3xl space-y-5 relative overflow-hidden shadow-xl">
      {/* Background glow highlights */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-soft)] rounded-full blur-3xl pointer-events-none -z-10 opacity-60" />

      <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
        <div className="space-y-0.5">
          <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> AI Recommendation Advisor
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Personalized feedback based on active study telemetry.
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {recommendations.map((rec) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-white/80 border border-slate-100/90 hover:border-[var(--primary)]/30 hover:bg-white/95 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mt-0.5 shrink-0">
                {rec.ruleName.includes("burnout") ? (
                  <AlertTriangle className="w-4.5 h-4.5" />
                ) : (
                  <Lightbulb className="w-4.5 h-4.5" />
                )}
              </div>
              <div>
                <h5 className="font-extrabold text-slate-800 text-xs tracking-tight">{rec.title}</h5>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">{rec.description}</p>
              </div>
            </div>

            {rec.actionText && (
              <button
                onClick={() => handleResolve(rec.ruleName)}
                className="self-end md:self-center bg-[var(--primary-soft)] hover:bg-[var(--primary)] hover:text-white text-[var(--primary)] text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border border-[var(--primary)]/20 transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                <Check className="w-3.5 h-3.5" /> {rec.actionText}
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

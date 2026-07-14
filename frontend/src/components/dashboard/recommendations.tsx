"use client";

import React from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { Sparkles, AlertTriangle, Lightbulb, Check } from "lucide-react";

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
    <div className="glass-panel p-6 space-y-4 bg-amber-50/10 border-l-4 border-l-amber-400">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> AI recommendation advisor
          </h3>
          <p className="text-xs text-gray-400">Personalized feedback based on study stats.</p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-4 rounded-2xl bg-white border border-amber-100 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mt-0.5">
                {rec.ruleName.includes("burnout") ? (
                  <AlertTriangle className="w-4.5 h-4.5" />
                ) : (
                  <Lightbulb className="w-4.5 h-4.5" />
                )}
              </div>
              <div>
                <h5 className="font-extrabold text-gray-800 text-xs">{rec.title}</h5>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{rec.description}</p>
              </div>
            </div>

            {rec.actionText && (
              <button
                onClick={() => handleResolve(rec.ruleName)}
                className="self-end md:self-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors flex items-center gap-1 shrink-0"
              >
                <Check className="w-3.5 h-3.5" /> {rec.actionText}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

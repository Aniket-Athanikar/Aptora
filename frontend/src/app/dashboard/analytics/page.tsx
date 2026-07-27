"use client";

import React, { useEffect, useMemo } from "react";
import { GoalEngineProvider, useGoalEngine } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard";
import { StudyChart } from "@/features/analytics/components/StudyChart";
import { ProgressChart } from "@/features/analytics/components/ProgressChart";
import { SubjectChart } from "@/features/analytics/components/SubjectChart";
import { useProgressStore } from "@/features/progress/store/progressStore";
import { Bot, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

function AnalyticsContent() {
  const { activeGoal } = useGoalEngine();
  const {
    subjectProgress,
    loadFromLocalStorage,
    initializeProgress,
    totalHours
  } = useProgressStore();

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  useEffect(() => {
    if (activeGoal && (!totalHours || totalHours === 0)) {
      initializeProgress(
        activeGoal.id,
        activeGoal.weaknesses.map(w => ({ subject: w.subject, confidence: w.confidence }))
      );
    }
  }, [activeGoal, initializeProgress, totalHours]);

  // Dynamic AI coach prompt generator
  const coachMessage = useMemo(() => {
    const userName = activeGoal?.profile.fullName || "Rahul";

    // Find weak subjects from store
    const weakSubjects = subjectProgress
      .filter((s) => s.revisionStatus === "Weak" || s.confidence <= 2)
      .map((s) => s.subject);

    const weakSubjectText = weakSubjects.length > 0
      ? `Focus next on ${weakSubjects[0]} revision.`
      : "Focus next on Economy revision.";

    return {
      name: userName,
      message: `"${userName}, your consistency improved 18% this month. Your strongest habit is morning study. ${weakSubjectText}"`
    };
  }, [activeGoal, subjectProgress]);

  return (
    <DashboardLayout activeTab="analytics">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            Performance Analytics <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">AI-calibrated analysis of study trends and coverage velocity.</p>
        </div>

        {/* AI Progress Coach Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-3xl p-6 relative overflow-hidden shadow-sm">
          {/* Backdrop bots */}
          <div className="absolute right-4 bottom-0 opacity-10 transform translate-y-4">
            <Bot className="w-48 h-48 text-indigo-900" />
          </div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-indigo-600 text-white p-3 rounded-2xl">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-black text-indigo-900 flex items-center gap-1.5">
                AI Progress Coach
              </h3>
              <p className="text-sm font-black text-gray-800 leading-relaxed italic">
                {coachMessage.message}
              </p>
              <div className="flex gap-4 pt-1 text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Mornings are optimal</span>
                <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Weak subjects detected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Charts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StudyChart />
            <ProgressChart />
          </div>
          <div className="space-y-6">
            <SubjectChart />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AnalyticsPage() {
  return (
    <GoalEngineProvider { ...{}} >
      <AnalyticsContent />
    </GoalEngineProvider>
  );
}

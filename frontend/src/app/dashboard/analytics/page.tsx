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

  const coachMessage = useMemo(() => {
    const userName = activeGoal?.profile?.fullName || "Student";
    const weakSubjects = subjectProgress
      .filter((s) => s.revisionStatus === "Weak" || s.confidence <= 2)
      .map((s) => s.subject);

    const weakSubjectText = weakSubjects.length > 0
      ? `Focus next on ${weakSubjects[0]} revision.`
      : "Focus next on targeted revision blocks.";

    return {
      name: userName,
      message: `"${userName}, your consistency improved 18% this month. Morning study sessions yield peak retention. ${weakSubjectText}"`
    };
  }, [activeGoal, subjectProgress]);

  return (
    <DashboardLayout activeTab="analytics">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              Performance Analytics <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              AI-calibrated analysis of study trends, subject velocity, and goal trajectory.
            </p>
          </div>
        </div>

        {/* AI Progress Coach Card - Crisp Light Gradient */}
        <div className="bg-gradient-to-br from-white via-indigo-50/60 to-purple-50/40 border border-indigo-100/90 rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute right-4 bottom-0 opacity-5 transform translate-y-4 pointer-events-none">
            <Bot className="w-48 h-48 text-indigo-900" />
          </div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-gradient-to-br from-[#6D4AFF] to-indigo-600 text-white p-3 rounded-2xl shadow-md shadow-indigo-200">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[#6D4AFF] uppercase tracking-widest bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 px-2.5 py-0.5 rounded-full">
                  AI Progress Insights
                </span>
              </div>
              <p className="text-sm font-black text-slate-800 leading-relaxed italic">
                {coachMessage.message}
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-[10px] font-extrabold text-[#6D4AFF] uppercase tracking-wider">
                <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Mornings are optimal</span>
                <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Syllabus priority detected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Charts Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StudyChart />
            <ProgressChart />
          </div>
          <div className="space-y-6">
            <SubjectChart subjects={subjectProgress} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AnalyticsPage() {
  return (
    <GoalEngineProvider>
      <AnalyticsContent />
    </GoalEngineProvider>
  );
}

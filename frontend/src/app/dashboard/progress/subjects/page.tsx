"use client";

import React, { useEffect } from "react";
import { GoalEngineProvider, useGoalEngine } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SubjectProgress } from "@/features/progress/components/SubjectProgress";
import { useProgressStore } from "@/features/progress/store/progressStore";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

function SubjectsProgressContent() {
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

  return (
    <DashboardLayout activeTab="progress">
      <div className="space-y-5">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/progress"
            className="p-1.5 hover:bg-white border border-transparent hover:border-gray-150 rounded-xl text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900">Syllabus Breakdown</h1>
          <p className="text-xs text-gray-500 font-semibold">Review specific metrics, confidence calibration, and study focus distributions.</p>
        </div>

        {/* Detailed subject list rendering */}
        <SubjectProgress subjects={subjectProgress} />
      </div>
    </DashboardLayout>
  );
}

export default function SubjectsProgressPage() {
  return (
    <GoalEngineProvider>
      <SubjectsProgressContent />
    </GoalEngineProvider>
  );
}

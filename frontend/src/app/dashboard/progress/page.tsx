"use client";

import React, { useEffect } from "react";
import { GoalEngineProvider, useGoalEngine } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProgressHero } from "@/features/progress/components/ProgressHero";
import { StatCard } from "@/features/progress/components/StatCard";
import { SubjectProgress } from "@/features/progress/components/SubjectProgress";
import { Heatmap } from "@/features/progress/components/Heatmap";
import { useProgressStore } from "@/features/progress/store/progressStore";
import { Clock, CheckSquare, Flame, BookOpen } from "lucide-react";

function ProgressDashboardContent() {
  const { activeGoal } = useGoalEngine();
  const {
    totalHours,
    completedTasks,
    streak,
    completionPercentage,
    subjectProgress,
    activityHistory,
    sessionsCount,
    loadFromLocalStorage,
    initializeProgress
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

  const examName = activeGoal?.targetExam || "UPSC CSE 2027";
  const daysRemaining = activeGoal?.timeline.remainingDays || 642;

  return (
    <DashboardLayout activeTab="progress">
      <div className="space-y-6">
        {/* Progress Dashboard Hero */}
        <ProgressHero
          examName={examName}
          completionPercentage={completionPercentage || 72}
          remainingDays={daysRemaining}
          streak={streak || 28}
        />

        {/* Statistical Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Study Hours"
            value={totalHours || 356}
            suffix="Hours"
            icon={Clock}
            color="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <StatCard
            title="Tasks Done"
            value={completedTasks || 420}
            suffix="Tasks"
            icon={CheckSquare}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            title="Streak"
            value={streak || 28}
            suffix="Days"
            icon={Flame}
            color="text-red-600"
            bgColor="bg-red-50"
          />
          <StatCard
            title="Sessions"
            value={sessionsCount || 145}
            suffix="Sessions"
            icon={BookOpen}
            color="text-violet-600"
            bgColor="bg-violet-50"
          />
        </div>

        {/* Heatmap Section */}
        <Heatmap activityHistory={activityHistory} />

        {/* Subject Progress Section */}
        <SubjectProgress subjects={subjectProgress} limit={4} showLink={true} />
      </div>
    </DashboardLayout>
  );
}

export default function ProgressPage() {
  return (
    <GoalEngineProvider>
      <ProgressDashboardContent />
    </GoalEngineProvider>
  );
}

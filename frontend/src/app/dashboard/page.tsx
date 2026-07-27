"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { GoalEngineProvider, useGoalEngine } from "@/contexts/goal-engine.context";
import {
  DashboardLayout,
  GoalCard,
  Recommendations,
  HistoryVersioning,
  GoalPlanPanel,
  Calendar2026,
  RealtimeHub,
  AnimatedWizard,
} from "@/components/dashboard";
import { RoadmapTimeline } from "@/features/planner/components/RoadmapTimeline";
import { DailyPlanner } from "@/features/planner/components/DailyPlanner";
import { FocusTimer } from "@/features/planner/components/FocusTimer";
import { Sparkles, Compass } from "lucide-react";
import { AIPlanner } from "@/features/planner/components/AIPlanner";
import { usePlanner } from "@/features/planner/hooks/usePlanner";
import { KnowledgeEngine } from "@/features/knowledge-engine";

function DashboardContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { activeGoal, wizardState, startWizard } = useGoalEngine();
  const [showWizard, setShowWizard] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(tabParam || "dashboard");
  const { todayTasks, updateTaskStatus, rescheduleTask } = usePlanner();

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Show onboarding wizard if no active goal is configured
  useEffect(() => {
    if (activeGoal === null && (!wizardState || wizardState.isCompleted === false)) {
      setShowWizard(true);
      setIsEditMode(false);
    } else {
      setShowWizard(false);
    }
  }, [activeGoal, wizardState?.isCompleted]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600" />
      </div>
    );
  }

  // Active dashboard view
  return (
    <>
      <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className={showWizard ? "blur-md select-none pointer-events-none" : ""}>
          {activeTab === "goal-plan" ? (
            <GoalPlanPanel onLaunchWizard={() => {
              startWizard();
              setIsEditMode(true);
              setShowWizard(true);
            }} />
          ) : activeTab === "planner" ? (
            <AIPlanner />
          ) : activeTab === "calendar" ? (
            <Calendar2026 goal={activeGoal!} />
          ) : activeTab === "knowledge" ? (
            <KnowledgeEngine />
          ) : activeGoal ? (
            <div className="space-y-4.5">
              {/* Header Title */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    Success Engine: <span className="gradient-text">{activeGoal.targetExam}</span> <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  </h1>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">Welcome back, {activeGoal.profile.fullName}! Monitor your calibration progress.</p>
                </div>

                <button
                  onClick={() => {
                    startWizard();
                    setIsEditMode(true);
                    setShowWizard(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Sparkles className="w-4 h-4" /> Recalibrate Success Goal
                </button>
              </div>

              {/* Restructured Grid Widgets layout */}
              <div className="space-y-6">
                {/* Row 1: Focus & Active Goal (3 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <GoalCard
                    goal={activeGoal}
                    onEdit={() => {
                      startWizard();
                      setIsEditMode(true);
                      setShowWizard(true);
                    }}
                  />
                  <FocusTimer defaultSubject={todayTasks[0]?.subject} defaultTaskId={todayTasks[0]?.id} />
                  <RealtimeHub />
                </div>

                {/* Row 2: Action Planner & Recommendations (2 Columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left (2/3): Timeline & Planner */}
                  <div className="lg:col-span-2 space-y-6">
                    <RoadmapTimeline />
                    <DailyPlanner tasks={todayTasks} onStatusChange={updateTaskStatus} onReschedule={rescheduleTask} />
                  </div>

                  {/* Right (1/3): AI Recommendations & History */}
                  <div className="space-y-6">
                    <Recommendations />
                    <HistoryVersioning />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Fallback dashboard display if wizard is dismissed or loading
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <Compass className="w-16 h-16 text-indigo-200 animate-spin-slow" />
              <h2 className="text-xl font-bold text-gray-800">Success journey not yet calibrated</h2>
              <p className="text-sm text-gray-500 max-w-sm">Please launch the Success Wizard to personalize your goals, planner, and daily timeline tracker.</p>
              <button
                onClick={() => {
                  startWizard();
                  setIsEditMode(false);
                  setShowWizard(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-2xl"
              >
                Launch Success Engine
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Onboarding / Edit wizard overlay */}
      {showWizard && (
        <AnimatedWizard
          isEditMode={isEditMode}
          onClose={activeGoal ? () => setShowWizard(false) : undefined}
        />
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <GoalEngineProvider>
      <DashboardContent />
    </GoalEngineProvider>
  );
}

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
            <div className="space-y-5 sm:space-y-6">
              {/* Top AI Source Library Style Header Banner */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-r from-emerald-50/80 via-amber-50/60 to-purple-50/50 p-6 sm:p-7 shadow-xs">
                {/* Decorative background glows */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-300/20 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                        AI Success Engine
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                        {activeGoal.targetExam}
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Welcome back, <span className="text-emerald-700">{activeGoal.profile.fullName}</span>!
                    </h1>
                    <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-xl">
                      Monitor your exam preparation progress, daily focus timeline, and study goals in real time.
                    </p>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                    <button
                      onClick={() => router.push("/ai-study/sources")}
                      className="h-11 px-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-800 hover:text-emerald-700 font-black text-xs transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>AI Library</span>
                    </button>

                    <button
                      onClick={() => router.push("/dashboard/ai")}
                      className="h-11 px-4.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Open AI Study</span>
                    </button>

                    <button
                      onClick={() => {
                        startWizard();
                        setIsEditMode(true);
                        setShowWizard(true);
                      }}
                      className="h-11 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Compass className="w-4 h-4 text-amber-400" />
                      <span>Recalibrate</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Restructured Grid Widgets layout */}
              <div className="space-y-4 sm:space-y-6">
                {/* Row 1: Focus & Active Goal (3 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Left (2/3): Timeline & Planner */}
                  <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    <RoadmapTimeline />
                    <DailyPlanner tasks={todayTasks} onStatusChange={updateTaskStatus} onReschedule={rescheduleTask} />
                  </div>

                  {/* Right (1/3): AI Recommendations & History */}
                  <div className="space-y-4 sm:space-y-6">
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

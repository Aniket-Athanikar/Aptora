"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { GoalEngineProvider, useGoalEngine } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { GoalCard } from "@/components/dashboard/goal-card";
import { RoadmapTimeline } from "@/components/dashboard/roadmap-timeline";
import { DailyPlanner } from "@/components/dashboard/daily-planner";
import { Recommendations } from "@/components/dashboard/recommendations";
import { Calendar2026 } from "@/components/dashboard/calendar-2026";
import { StudyTimer } from "@/components/dashboard/study-timer";
import { AnimatedWizard } from "@/components/dashboard/wizard/animated-wizard";
import { GoalPlanPanel } from "@/components/dashboard/goal-plan-panel";
import { Sparkles, Compass } from "lucide-react";

function DashboardContent() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { activeGoal, wizardState, startWizard } = useGoalEngine();
  const [showWizard, setShowWizard] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Show onboarding wizard if no active goal is configured
  useEffect(() => {
    if (activeGoal === null && wizardState.isCompleted === false) {
      setShowWizard(true);
      setIsEditMode(false);
    } else {
      setShowWizard(false);
    }
  }, [activeGoal, wizardState.isCompleted]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600" />
      </div>
    );
  }

  // Active dashboard view
  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className={showWizard ? "blur-md select-none pointer-events-none" : ""}>
        <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
          {activeTab === "goal-plan" ? (
            <GoalPlanPanel onLaunchWizard={() => {
              startWizard();
              setIsEditMode(true);
              setShowWizard(true);
            }} />
          ) : activeGoal ? (
            <div className="space-y-6">
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

              {/* Grid Widgets layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Columns */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Goal Card & Recommendation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GoalCard 
                      goal={activeGoal} 
                      onEdit={() => {
                        startWizard();
                        setIsEditMode(true);
                        setShowWizard(true);
                      }} 
                    />
                    <StudyTimer />
                  </div>

                  <Recommendations />

                  <RoadmapTimeline goal={activeGoal} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DailyPlanner />
                    <Calendar2026 goal={activeGoal} />
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
        </DashboardLayout>
      </div>

      {/* Onboarding / Edit wizard overlay */}
      {showWizard && (
        <AnimatedWizard 
          isEditMode={isEditMode}
          onClose={activeGoal ? () => setShowWizard(false) : undefined} 
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <GoalEngineProvider>
      <DashboardContent />
    </GoalEngineProvider>
  );
}

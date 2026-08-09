"use client";

import React, { useMemo } from "react";
import { usePlanner } from "../hooks/usePlanner";
import { FocusTimer } from "./FocusTimer";
import { DailyPlanner } from "./DailyPlanner";
import { RecommendationCard } from "./RecommendationCard";
import { Sparkles, Trophy, Calendar, Flame, GraduationCap, Compass } from "lucide-react";
import { useUIStore } from "@/store/ui";

export function AIPlanner() {
  const {
    todayTasks,
    progressPercent,
    completedTodayCount,
    totalTodayCount,
    streak,
    xpPoints,
    updateTaskStatus,
    rescheduleTask,
    activeGoal,
  } = usePlanner();

  const candidateName = activeGoal?.profile?.fullName || "Student";
  const targetExamName = activeGoal?.targetExam || "Configured Exam";

  // Dynamic recommendations logic
  const recommendations = useMemo(() => {
    const recs = [];
    if (activeGoal?.timeline?.burnoutRisk === "High") {
      recs.push({
        id: "r1",
        title: "Burnout Interception Triggered",
        description: "Your target daily study hours is set high. Balance core revision blocks with proper breaks.",
        actionText: "Reschedule workload",
      });
    }
    if (streak >= 3) {
      recs.push({
        id: "r2",
        title: "Streak challenge enabled",
        description: "Excellent consistency! Try adding an extra 15-minute MCQ practice session to challenge yourself.",
        actionText: "Add slot",
      });
    }
    const weakSubjects = activeGoal?.weaknesses || [];
    const criticalGaps = weakSubjects.filter((w) => w.weaknessScore > 60);
    if (criticalGaps.length > 0) {
      recs.push({
        id: "r3",
        title: `Priority focus: ${criticalGaps[0].subject}`,
        description: `Your confidence in ${criticalGaps[0].subject} is currently low. Focus on active recall and notes revision today.`,
        actionText: "Focus session",
      });
    }
    return recs;
  }, [activeGoal, streak]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/30 border border-indigo-100/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-[#6D4AFF]/10 text-[#6D4AFF] border border-[#6D4AFF]/20 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Study Workspace
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Welcome, <span className="text-[#6D4AFF]">{candidateName}</span> 👋
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Active Target Exam: <span className="text-slate-800 font-bold">{targetExamName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white/90 border border-amber-200/60 px-4 py-2.5 rounded-2xl shadow-xs transition-all hover:scale-[1.02]">
            <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Streak</p>
              <p className="text-xs font-black text-amber-700 leading-none mt-1">{streak} Days</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white/90 border border-indigo-200/60 px-4 py-2.5 rounded-2xl shadow-xs transition-all hover:scale-[1.02]">
            <Trophy className="w-5 h-5 text-[#6D4AFF] animate-pulse" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">XP Earned</p>
              <p className="text-xs font-black text-[#6D4AFF] leading-none mt-1">{xpPoints} XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main planner content structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Today's schedule activities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Today&apos;s Progress</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  Completed {completedTodayCount} of {totalTodayCount} focus activities.
                </p>
              </div>
              <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-2xl border border-indigo-100/50">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <DailyPlanner
            tasks={todayTasks}
            onStatusChange={updateTaskStatus}
            onReschedule={rescheduleTask}
          />
        </div>

        {/* Right Column - focus tools & coaching recommendations */}
        <div className="space-y-6">
          <FocusTimer
            defaultSubject={todayTasks[0]?.subject}
            defaultTaskId={todayTasks[0]?.id}
          />

          {recommendations.length > 0 && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 pb-2 border-b border-gray-50">
                <GraduationCap className="w-4.5 h-4.5 text-indigo-600" />
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">AI Study Coach</h3>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    title={rec.title}
                    description={rec.description}
                    actionText={rec.actionText}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

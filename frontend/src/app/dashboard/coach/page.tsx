"use client";

import React, { useEffect, useMemo } from "react";
import { GoalEngineProvider, useGoalEngine } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CoachCard } from "@/features/ai-coach/components/CoachCard";
import { DailyBriefing } from "@/features/ai-coach/components/DailyBriefing";
import { AIScore } from "@/features/ai-coach/components/AIScore";
import { useAICoachStore } from "@/features/ai-coach/store/aiCoachStore";
import { useProgressStore } from "@/features/progress/store/progressStore";
import { Bot, MessageSquare, Zap, Target, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

function CoachDashboardContent() {
  const { activeGoal } = useGoalEngine();
  const { loadCoachData, memory, dailyScore, initializeCoach } = useAICoachStore();
  const { loadFromLocalStorage, completionPercentage, totalHours, subjectProgress } = useProgressStore();

  useEffect(() => {
    loadCoachData();
    loadFromLocalStorage();
  }, [loadCoachData, loadFromLocalStorage]);

  useEffect(() => {
    if (activeGoal && (!memory.userName || memory.userName === "Rahul")) {
      initializeCoach(
        activeGoal.profile.fullName,
        activeGoal.targetExam,
        activeGoal.weaknesses.map((w) => w.subject)
      );
    }
  }, [activeGoal, memory.userName, initializeCoach]);

  const userName = activeGoal?.profile.fullName || "Rahul";
  const targetExamName = activeGoal?.targetExam || "UPSC CSE 2027";

  return (
    <DashboardLayout activeTab="coach">
      <div className="space-y-6">
        {/* Main Coach Header Card */}
        <CoachCard
          userName={userName}
          completionRate={completionPercentage || 72}
          onViewRecommendations={() => {
            const el = document.getElementById("suggestions-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily agenda brief */}
            <DailyBriefing
              userName={userName}
              tasks={[]} // empty will trigger defaults or planner sync
              durationMinutes={270} // 4h 30m
            />

            {/* Personality Profile */}
            <div className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4">
              <div className="pb-2 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900">Your Learning Personality</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Behavioral profile evaluated by AI Coach</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                {[
                  { label: "Consistency", val: "High 🔥", icon: Zap, color: "text-amber-500 bg-amber-50" },
                  { label: "Learning Style", val: "Visual 🎨", icon: BookOpen, color: "text-indigo-600 bg-indigo-50" },
                  { label: "Best Time", val: "Morning ☀️", icon: Clock, color: "text-violet-500 bg-violet-50" },
                  { label: "Strength", val: "Discipline 👑", icon: Target, color: "text-emerald-600 bg-emerald-50" },
                  { label: "Needs Work", val: "Revision 📖", icon: Bot, color: "text-pink-500 bg-pink-50" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/20 text-center space-y-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{item.label}</p>
                        <p className="text-xs font-black text-gray-800">{item.val}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggestions & Recommendations Section */}
            <div id="suggestions-section" className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4">
              <div className="pb-2 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-gray-900">AI Suggestions</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Context-aware advice tailored to you</p>
                </div>
                <Link
                  href="/dashboard/coach/chat"
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Chat with Mentor
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  { rank: 1, text: "Study Economy modules in morning study blocks when focus capacity is peak." },
                  { rank: 2, text: "Revise yesterday's History Chapter 4 notes prior to initiating Chapter 5." },
                  { rank: 3, text: "Schedule an MCQ mock practice test session this Sunday to boost confidence." },
                  { rank: 4, text: "Increase focus block durations from 25 mins to 40 mins to build stamina." }
                ].map((sug) => (
                  <div key={sug.rank} className="flex gap-3 p-3.5 rounded-2xl border border-gray-100 bg-slate-50/30">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0">
                      {sug.rank}
                    </span>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed mt-0.5">{sug.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Score */}
          <div className="space-y-6">
            <AIScore score={dailyScore || 87} />

            {/* Journey Logs Card */}
            <div className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4">
              <div className="pb-2 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900">Mentor Memory</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">What the AI Coach remembers about you</p>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600 font-bold">
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <span>Struggles with Economy terminology and active recall details.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <span>Studies best in early morning blocks (6 AM - 9 AM).</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <span>Prefers shorter practice sessions followed by immediate reviews.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CoachDashboardPage() {
  return (
    <GoalEngineProvider>
      <CoachDashboardContent />
    </GoalEngineProvider>
  );
}

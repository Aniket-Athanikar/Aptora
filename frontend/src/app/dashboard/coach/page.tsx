"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { GoalEngineProvider, useGoalEngine } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard";
import { CoachCard } from "@/features/ai-coach/components/CoachCard";
import { DailyBriefing } from "@/features/ai-coach/components/DailyBriefing";
import { AIScore } from "@/features/ai-coach/components/AIScore";
import { useAICoachStore } from "@/features/ai-coach/store/aiCoachStore";
import { useProgressStore } from "@/features/progress/store/progressStore";
import { Bot, MessageSquare, Zap, Target, BookOpen, Clock, Brain, Compass, Server, CheckCircle2 } from "lucide-react";
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
      <div className="space-y-6 max-w-7xl mx-auto p-1 relative text-slate-800">
        
        {/* Ambient background blur blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-300/10 rounded-full blur-[90px] pointer-events-none -z-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Top Hero Coach Card */}
        <CoachCard
          userName={userName}
          completionRate={completionPercentage || 72}
          onViewRecommendations={() => {
            const el = document.getElementById("suggestions-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Left Panels */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Daily Briefing Plan */}
            <DailyBriefing
              userName={userName}
              tasks={[]}
              durationMinutes={270}
            />

            {/* Premium Learning Personality Grid */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#6D4AFF]" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">Learning Personality Calibration</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Real-time study traits analyzed by the ExamForge Engine.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                {[
                  { label: "Consistency", val: "High 🔥", icon: Zap, color: "text-amber-500 bg-amber-50 border-amber-100" },
                  { label: "Learning Style", val: "Visual 🎨", icon: BookOpen, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
                  { label: "Best Time", val: "Morning ☀️", icon: Clock, color: "text-violet-500 bg-violet-50 border-violet-100" },
                  { label: "Strength", val: "Discipline 👑", icon: Target, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  { label: "Needs Work", val: "Revision 📖", icon: Bot, color: "text-rose-500 bg-rose-50 border-rose-100" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -3 }}
                      className={`p-4 rounded-2xl border text-center space-y-3 bg-white ${item.color.split(" ")[2]}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto shadow-3xs ${item.color.split(" ")[0]} ${item.color.split(" ")[1]}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</p>
                        <p className="text-xs font-black text-slate-800">{item.val}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Suggestion recommendations */}
            <div id="suggestions-section" className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="pb-3 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#6D4AFF]" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Custom AI Recommendations</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Dynamic strategy tips aligned to your weaknesses.</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/coach/chat"
                  className="text-xs bg-[#6D4AFF] hover:bg-[#5A36EE] text-white font-black px-4.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> Chat with Mentor
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { rank: 1, title: "Optimize Focus Slot", text: "Study high-weight Economy modules in morning blocks when your cognitive capacity is peaked." },
                  { rank: 2, title: "Active Recall Habit", text: "Revise yesterday's History chapters notes for 15 minutes before initiating new modules." },
                  { rank: 3, title: "Mock Exam Sprint", text: "Schedule a targeted practice quiz this Sunday to boost retention score accuracy." },
                  { rank: 4, title: "Sustained Stamina", text: "Increase Pomodoro focus timers from 25 minutes to 40 minutes to build exam stamina." }
                ].map((sug) => (
                  <div key={sug.rank} className="flex gap-3.5 p-4 rounded-2xl border border-slate-200/50 bg-slate-50/40 relative">
                    <span className="w-6.5 h-6.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-[#6D4AFF] shrink-0 shadow-3xs">
                      {sug.rank}
                    </span>
                    <div className="space-y-1 mt-0.5">
                      <h4 className="text-xs font-black text-slate-800">{sug.title}</h4>
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{sug.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column Panels */}
          <div className="space-y-6">
            
            {/* AIScore widget card */}
            <AIScore score={dailyScore || 87} />

            {/* Custom Mentor memory registry */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
                <Server className="w-5 h-5 text-[#6D4AFF]" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">Mentor Cognitive Logs</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Active recall logs registered about your behavior.</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs leading-relaxed text-slate-600 font-bold">
                {[
                  "Encountered friction with Economy terminology and active recall parameters.",
                  "Chronological retention peaks in early morning sessions (6 AM - 9 AM).",
                  "Demonstrates higher stamina in short micro-practice sessions followed by immediate reviews."
                ].map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-150/40">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] font-bold text-slate-605 text-slate-600">{log}</span>
                  </div>
                ))}
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

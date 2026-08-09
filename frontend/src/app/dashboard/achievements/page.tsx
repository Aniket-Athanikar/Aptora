"use client";

import React, { useEffect, useState } from "react";
import { GoalEngineProvider, useGoalEngine } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard";
import { BadgeGrid } from "@/features/achievements/components/BadgeGrid";
import { UnlockModal } from "@/features/achievements/components/UnlockModal";
import { useAchievementStore, Achievement } from "@/features/achievements/achievementEngine";
import { ProgressTimeline } from "@/features/progress/components/ProgressTimeline";
import { useProgressStore } from "@/features/progress/store/progressStore";
import { Trophy, Award, Users, Sparkles, Plus, Trash2, CheckCircle2, ChevronRight, Compass } from "lucide-react";
import Link from "next/link";

function AchievementsContent() {
  const { activeGoal } = useGoalEngine();
  const { totalHours, completedTasks, streak, completionPercentage, sessionsCount, loadFromLocalStorage } = useProgressStore();
  const {
    achievements,
    recentlyUnlocked,
    checkAchievements,
    loadAchievements,
    clearUnlockedBanner,
    addCustomMilestone,
    deleteAchievement,
    toggleClaimAchievement
  } = useAchievementStore();

  const [activeUnlock, setActiveUnlock] = useState<Achievement | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    loadFromLocalStorage();
    loadAchievements();
  }, [loadFromLocalStorage, loadAchievements]);

  useEffect(() => {
    checkAchievements({
      hasActiveGoal: !!activeGoal,
      totalHours: totalHours || 356,
      completedTasks: completedTasks || 420,
      streak: streak || 28,
      sessionsCount: sessionsCount || 145,
      completionPercentage: completionPercentage || 72
    });
  }, [activeGoal, totalHours, completedTasks, streak, sessionsCount, completionPercentage, checkAchievements]);

  useEffect(() => {
    if (recentlyUnlocked) {
      setActiveUnlock(recentlyUnlocked);
      clearUnlockedBanner();
    }
  }, [recentlyUnlocked, clearUnlockedBanner]);

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addCustomMilestone(newTitle.trim(), newDesc.trim() || "Custom user study milestone target.");
    setNewTitle("");
    setNewDesc("");
    setShowAddModal(false);
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <DashboardLayout activeTab="achievements">
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Header & Interlink Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              Achievements & Milestones <Trophy className="w-6 h-6 text-amber-500 animate-bounce" />
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Earn XP, unlock study badges, and track custom target milestones.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#6D4AFF] hover:bg-[#5A36EE] text-white text-xs font-black px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Custom Milestone
            </button>
          </div>
        </div>

        {/* Hero Level & Stats Overview Card */}
        <div className="bg-gradient-to-br from-white via-indigo-50/60 to-purple-50/40 border border-indigo-100/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#6D4AFF] uppercase tracking-widest bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> ExamForge XP Progression
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Mastery Rank: <span className="text-[#6D4AFF]">Scholar Level 14</span>
            </h2>
            <p className="text-xs text-slate-600 font-semibold max-w-xl">
              You have unlocked {unlockedCount} of {achievements.length} syllabus milestones. Interlinked with your daily planner and study timer.
            </p>
          </div>

          {/* Quick Interlinks */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Link
              href="/dashboard?tab=planner"
              className="px-3.5 py-2 bg-white hover:bg-indigo-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-all shadow-3xs flex items-center gap-1"
            >
              Planner <ChevronRight className="w-3.5 h-3.5 text-[#6D4AFF]" />
            </Link>
            <Link
              href="/dashboard/coach"
              className="px-3.5 py-2 bg-white hover:bg-indigo-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-all shadow-3xs flex items-center gap-1"
            >
              Coach <ChevronRight className="w-3.5 h-3.5 text-[#6D4AFF]" />
            </Link>
            <Link
              href="/dashboard/analytics"
              className="px-3.5 py-2 bg-white hover:bg-indigo-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-all shadow-3xs flex items-center gap-1"
            >
              Analytics <ChevronRight className="w-3.5 h-3.5 text-[#6D4AFF]" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Badges Grid */}
          <div className="lg:col-span-2 space-y-6">
            <BadgeGrid
              achievements={achievements}
              onShowUnlockModal={(ach) => setActiveUnlock(ach)}
            />

            {/* Custom Milestones CRUD List */}
            {achievements.some((a) => a.isCustom) && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#6D4AFF]" /> Custom Milestones (CRUD)
                  </h3>
                </div>

                <div className="space-y-3">
                  {achievements.filter((a) => a.isCustom).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/50"
                    >
                      <div className="space-y-0.5 min-w-0 pr-3">
                        <h4 className={`text-xs font-black text-slate-900 ${item.unlocked ? "line-through text-slate-400" : ""}`}>
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-semibold">{item.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleClaimAchievement(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            item.unlocked
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-[#6D4AFF] hover:bg-[#5A36EE] text-white"
                          }`}
                        >
                          {item.unlocked ? "Completed" : "Claim Reward"}
                        </button>
                        <button
                          onClick={() => deleteAchievement(item.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                          title="Delete Milestone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Leaderboard and Timeline */}
          <div className="space-y-6">
            {/* Community Leaderboard */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900">ExamForge Community</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Weekly leaderboard ranking. Click member to view profile.</p>
                </div>
                <Users className="w-4 h-4 text-[#6D4AFF]" />
              </div>

              <div className="space-y-2">
                {[
                  { rank: 1, name: `${activeGoal?.profile?.fullName || "Aspirant"} (You)`, xp: "14,850 XP", isUser: true, initial: (activeGoal?.profile?.fullName || "A").charAt(0).toUpperCase(), href: "/profile" },
                  { rank: 2, name: "Aman Sharma", xp: "13,200 XP", isUser: false, initial: "A", href: "/profile" },
                  { rank: 3, name: "Priya Patel", xp: "12,950 XP", isUser: false, initial: "P", href: "/profile" },
                ].map((member) => (
                  <Link
                    key={member.rank}
                    href={member.href}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-xs ${
                      member.isUser
                        ? "bg-indigo-50/70 border-indigo-200/90 hover:border-[#6D4AFF]"
                        : "border-slate-100 bg-slate-50/40 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        member.rank === 1
                          ? "bg-amber-100 text-amber-800"
                          : member.rank === 2
                          ? "bg-slate-100 text-slate-800"
                          : "bg-orange-100 text-orange-850"
                      }`}>
                        {member.rank}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-[#6D4AFF] text-white flex items-center justify-center text-xs font-black shadow-3xs">
                        {member.initial}
                      </div>
                      <span className={`text-xs font-black ${member.isUser ? "text-[#6D4AFF]" : "text-slate-800"}`}>
                        {member.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-500">{member.xp}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Progress History Timeline */}
            <ProgressTimeline />
          </div>
        </div>

        {/* Modal: Create Custom Milestone (Create CRUD) */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <form
              onSubmit={handleCreateMilestone}
              className="bg-white border border-slate-200 p-6 rounded-[32px] w-full max-w-sm space-y-4 shadow-2xl"
            >
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Add Custom Milestone</h3>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Milestone Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Complete 5 Mock Exams"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#6D4AFF] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Solve 500 MCQs in Geography"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#6D4AFF] focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#6D4AFF] hover:bg-[#5A36EE] text-white rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Floating Unlock Overlay Modal */}
        {activeUnlock && (
          <UnlockModal
            achievement={activeUnlock}
            onClose={() => setActiveUnlock(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default function AchievementsPage() {
  return (
    <GoalEngineProvider>
      <AchievementsContent />
    </GoalEngineProvider>
  );
}

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
      <div className="space-y-7 max-w-6xl mx-auto">

        {/* Header Banner - AI Library Style */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-purple-500/15 p-6 sm:p-8 text-slate-900 border border-amber-200/60 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300/60 text-[11px] font-black uppercase tracking-widest shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                Study Milestones
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                Achievements & Badges <Trophy className="w-8 h-8 text-amber-555 animate-bounce" />
              </h1>
              <p className="text-sm sm:text-base text-slate-700 font-medium max-w-xl">
                Earn XP, unlock study badges, and track custom target milestones as you cover your syllabus.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="self-start md:self-center h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-98 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Milestone</span>
            </button>
          </div>
        </div>

        {/* Hero Level & Stats Overview Card */}
        <div className="bg-gradient-to-br from-white via-emerald-50/60 to-amber-50/40 border border-emerald-100/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-xl pointer-events-none" />
          <div className="space-y-2 flex-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100/80 border border-emerald-300/60 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Aptora XP Progression
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Mastery Rank: <span className="text-emerald-750">Scholar Level 14</span>
            </h2>
            <p className="text-xs text-slate-650 font-semibold max-w-xl">
              You have unlocked {unlockedCount} of {achievements.length} syllabus milestones. Interlinked with your daily planner and study timer.
            </p>
          </div>

          {/* Quick Interlinks */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Link
              href="/dashboard?tab=planner"
              className="px-3.5 py-2 bg-white hover:bg-emerald-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-all shadow-3xs flex items-center gap-1 hover:border-emerald-300"
            >
              Planner <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
            </Link>
            <Link
              href="/dashboard/coach"
              className="px-3.5 py-2 bg-white hover:bg-emerald-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-all shadow-3xs flex items-center gap-1 hover:border-emerald-300"
            >
              Coach <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
            </Link>
            <Link
              href="/dashboard/analytics"
              className="px-3.5 py-2 bg-white hover:bg-emerald-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-all shadow-3xs flex items-center gap-1 hover:border-emerald-300"
            >
              Analytics <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
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
                    <Award className="w-4 h-4 text-emerald-600" /> Custom Milestones (CRUD)
                  </h3>
                </div>

                <div className="space-y-3">
                  {achievements.filter((a) => a.isCustom).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/50 hover:border-emerald-200 transition-colors"
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
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-250"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
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
                  <h3 className="text-sm font-black text-slate-900">Aptora Community</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Weekly leaderboard ranking. Click member to view profile.</p>
                </div>
                <Users className="w-4 h-4 text-emerald-650" />
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
                        ? "bg-emerald-50/70 border-emerald-200 hover:border-emerald-400"
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
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-3xs">
                        {member.initial}
                      </div>
                      <span className={`text-xs font-black ${member.isUser ? "text-emerald-700" : "text-slate-800"}`}>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Solve 500 MCQs in Geography"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
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

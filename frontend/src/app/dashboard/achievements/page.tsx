"use client";

import React, { useEffect, useState } from "react";
import { GoalEngineProvider, useGoalEngine } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { BadgeGrid } from "@/features/achievements/components/BadgeGrid";
import { UnlockModal } from "@/features/achievements/components/UnlockModal";
import { useAchievementStore, Achievement } from "@/features/achievements/achievementEngine";
import { ProgressTimeline } from "@/features/progress/components/ProgressTimeline";
import { useProgressStore } from "@/features/progress/store/progressStore";
import { Trophy, Award, Users, ChevronRight } from "lucide-react";

function AchievementsContent() {
  const { activeGoal } = useGoalEngine();
  const { totalHours, completedTasks, streak, completionPercentage, sessionsCount, loadFromLocalStorage } = useProgressStore();
  const { achievements, recentlyUnlocked, checkAchievements, loadAchievements, clearUnlockedBanner } = useAchievementStore();

  const [activeUnlock, setActiveUnlock] = useState<Achievement | null>(null);

  useEffect(() => {
    loadFromLocalStorage();
    loadAchievements();
  }, [loadFromLocalStorage, loadAchievements]);

  // Monitor stats to evaluate badges
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

  // If store triggers a recent unlock, show the overlay modal
  useEffect(() => {
    if (recentlyUnlocked) {
      setActiveUnlock(recentlyUnlocked);
      clearUnlockedBanner();
    }
  }, [recentlyUnlocked, clearUnlockedBanner]);

  return (
    <DashboardLayout activeTab="achievements">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            Achievements & Badges <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">Earn XP and unlock badges as you hit your milestones.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Badges Grid */}
          <div className="lg:col-span-2 space-y-6">
            <BadgeGrid
              achievements={achievements}
              onShowUnlockModal={(ach) => setActiveUnlock(ach)}
            />
          </div>

          {/* Right Column: Leaderboard and Timeline */}
          <div className="space-y-6">
            {/* Community Leaderboard */}
            <div className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-black text-gray-900">ExamForge Community</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Weekly leaderboard ranking</p>
                </div>
                <Users className="w-4 h-4 text-gray-400" />
              </div>

              <div className="space-y-2">
                {[
                  { rank: 1, name: "Rahul (You)", xp: "14,850 XP", isUser: true, avatar: "Felix" },
                  { rank: 2, name: "Aman", xp: "13,200 XP", isUser: false, avatar: "Jack" },
                  { rank: 3, name: "Priya", xp: "12,950 XP", isUser: false, avatar: "Sophia" },
                ].map((member) => (
                  <div
                    key={member.rank}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                      member.isUser
                        ? "bg-indigo-50/50 border-indigo-150"
                        : "border-gray-100 bg-gray-50/20"
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
                      <img
                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${member.avatar}`}
                        className="w-7 h-7 rounded-full object-cover border border-gray-250 bg-white"
                        alt={member.name}
                      />
                      <span className={`text-xs font-black ${member.isUser ? "text-indigo-900" : "text-gray-800"}`}>
                        {member.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-500">{member.xp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress History Timeline */}
            <ProgressTimeline />
          </div>
        </div>

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

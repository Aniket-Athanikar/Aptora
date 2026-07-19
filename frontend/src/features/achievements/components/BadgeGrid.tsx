import React from "react";
import { AchievementCard } from "./AchievementCard";
import { Achievement } from "../achievementEngine";

interface BadgeGridProps {
  achievements: Achievement[];
  onShowUnlockModal?: (ach: Achievement) => void;
}

export function BadgeGrid({ achievements, onShowUnlockModal }: BadgeGridProps) {
  const categories: ("Beginner" | "Consistency" | "Learning" | "Master")[] = [
    "Beginner", "Consistency", "Learning", "Master"
  ];

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "Beginner": return "🎯 Beginner Milestones";
      case "Consistency": return "🔥 Consistency Habits";
      case "Learning": return "📖 Learning Volume";
      case "Master": return "🏆 Master Milestones";
      default: return category;
    }
  };

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const catAchievements = achievements.filter((a) => a.tier === cat);
        if (catAchievements.length === 0) return null;

        return (
          <div key={cat} className="space-y-3">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">
              {getCategoryTitle(cat)}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {catAchievements.map((ach) => (
                <AchievementCard
                  key={ach.id}
                  achievement={ach}
                  onShowUnlockModal={onShowUnlockModal}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

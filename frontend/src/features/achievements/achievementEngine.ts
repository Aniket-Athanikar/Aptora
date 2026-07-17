import { create } from "zustand";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string;
  progress: number; // 0 to 100 percent
  tier: "Beginner" | "Consistency" | "Learning" | "Master";
}

interface AchievementStore {
  achievements: Achievement[];
  recentlyUnlocked: Achievement | null;
  clearUnlockedBanner: () => void;
  checkAchievements: (stats: {
    hasActiveGoal: boolean;
    totalHours: number;
    completedTasks: number;
    streak: number;
    sessionsCount: number;
    completionPercentage: number;
  }) => void;
  loadAchievements: () => void;
}

const defaultAchievements: Achievement[] = [
  // Beginner
  { id: "first_goal", title: "First Goal", description: "Created first exam goal", icon: "Target", unlocked: false, unlockedAt: "", progress: 0, tier: "Beginner" },
  { id: "first_session", title: "First Study Session", description: "Completed first session", icon: "BookOpen", unlocked: false, unlockedAt: "", progress: 0, tier: "Beginner" },
  { id: "first_week", title: "First Week", description: "7 days active", icon: "Rocket", unlocked: false, unlockedAt: "", progress: 0, tier: "Beginner" },
  // Consistency
  { id: "streak_7", title: "7 Day Warrior", description: "7 consecutive study days", icon: "Flame", unlocked: false, unlockedAt: "", progress: 0, tier: "Consistency" },
  { id: "streak_30", title: "30 Day Warrior", description: "30 consecutive study days", icon: "Zap", unlocked: false, unlockedAt: "", progress: 0, tier: "Consistency" },
  { id: "streak_100", title: "100 Day Warrior", description: "100 consecutive study days", icon: "Crown", unlocked: false, unlockedAt: "", progress: 0, tier: "Consistency" },
  // Learning
  { id: "hours_100", title: "100 Study Hours", description: "Completed 100 study hours", icon: "BookOpen", unlocked: false, unlockedAt: "", progress: 0, tier: "Learning" },
  { id: "hours_500", title: "500 Study Hours", description: "Completed 500 study hours", icon: "Brain", unlocked: false, unlockedAt: "", progress: 0, tier: "Learning" },
  { id: "hours_1000", title: "1000 Study Hours", description: "Completed 1000 study hours", icon: "GraduationCap", unlocked: false, unlockedAt: "", progress: 0, tier: "Learning" },
  // Master Level
  { id: "goal_master", title: "Goal Master", description: "Completed complete roadmap", icon: "Trophy", unlocked: false, unlockedAt: "", progress: 0, tier: "Master" },
  { id: "exam_ready", title: "Exam Ready", description: "Completed final revision", icon: "Medal", unlocked: false, unlockedAt: "", progress: 0, tier: "Master" },
];

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  achievements: defaultAchievements,
  recentlyUnlocked: null,
  clearUnlockedBanner: () => set({ recentlyUnlocked: null }),

  checkAchievements: (stats) => {
    let unlockedAny = false;
    let newlyUnlocked: Achievement | null = null;

    const nextAchievements = get().achievements.map((ach) => {
      if (ach.unlocked) return ach; // Already unlocked

      let progress = 0;
      let unlocked = false;

      switch (ach.id) {
        case "first_goal":
          progress = stats.hasActiveGoal ? 100 : 0;
          unlocked = stats.hasActiveGoal;
          break;
        case "first_session":
          progress = stats.sessionsCount > 0 ? 100 : 0;
          unlocked = stats.sessionsCount > 0;
          break;
        case "first_week":
          progress = Math.min(100, Math.round((stats.streak / 7) * 100));
          unlocked = stats.streak >= 7;
          break;
        case "streak_7":
          progress = Math.min(100, Math.round((stats.streak / 7) * 100));
          unlocked = stats.streak >= 7;
          break;
        case "streak_30":
          progress = Math.min(100, Math.round((stats.streak / 30) * 100));
          unlocked = stats.streak >= 30;
          break;
        case "streak_100":
          progress = Math.min(100, Math.round((stats.streak / 100) * 100));
          unlocked = stats.streak >= 100;
          break;
        case "hours_100":
          progress = Math.min(100, Math.round((stats.totalHours / 100) * 100));
          unlocked = stats.totalHours >= 100;
          break;
        case "hours_500":
          progress = Math.min(100, Math.round((stats.totalHours / 500) * 100));
          unlocked = stats.totalHours >= 500;
          break;
        case "hours_1000":
          progress = Math.min(100, Math.round((stats.totalHours / 1000) * 100));
          unlocked = stats.totalHours >= 1000;
          break;
        case "goal_master":
          progress = Math.min(100, stats.completionPercentage);
          unlocked = stats.completionPercentage >= 100;
          break;
        case "exam_ready":
          progress = Math.min(100, stats.completionPercentage);
          unlocked = stats.completionPercentage >= 95;
          break;
      }

      if (unlocked && !ach.unlocked) {
        unlockedAny = true;
        newlyUnlocked = {
          ...ach,
          unlocked: true,
          unlockedAt: new Date().toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' }),
          progress: 100,
        };
        return newlyUnlocked;
      }

      return { ...ach, progress };
    });

    if (unlockedAny && newlyUnlocked) {
      set({ achievements: nextAchievements, recentlyUnlocked: newlyUnlocked });
      localStorage.setItem("examforge_achievements", JSON.stringify(nextAchievements));
    } else {
      set({ achievements: nextAchievements });
    }
  },

  loadAchievements: () => {
    try {
      const stored = localStorage.getItem("examforge_achievements");
      if (stored) {
        set({ achievements: JSON.parse(stored) });
      } else {
        localStorage.setItem("examforge_achievements", JSON.stringify(defaultAchievements));
      }
    } catch (e) {
      console.error("Failed to load achievements", e);
    }
  },
}));

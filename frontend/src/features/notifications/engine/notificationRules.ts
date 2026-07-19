import { NotificationItem } from "../store/notificationStore";

export const notificationRules = {
  evaluateRules: (stats: {
    streak: number;
    completionPercentage: number;
    economyProgress: number;
    missedTasksCount: number;
    todayFocusMinutes: number;
  }): Omit<NotificationItem, "id" | "createdAt" | "read">[] => {
    const alerts: Omit<NotificationItem, "id" | "createdAt" | "read">[] = [];

    // Rule 1: Streak milestones
    if (stats.streak > 0 && stats.streak % 7 === 0) {
      alerts.push({
        type: "motivation",
        priority: "high",
        message: `🔥 Amazing! You are on a ${stats.streak}-day study streak. Don't break it today!`,
      });
    }

    // Rule 2: Subject warning (Economy)
    if (stats.economyProgress < 40) {
      alerts.push({
        type: "warning",
        priority: "medium",
        message: `⚠️ Economy coverage is low (${stats.economyProgress}%). Dedicate extra time to it this week.`,
      });
    }

    // Rule 3: Schedule overload
    if (stats.missedTasksCount >= 3) {
      alerts.push({
        type: "warning",
        priority: "high",
        message: `📅 Schedule overload! You have missed ${stats.missedTasksCount} tasks. Consider scaling down daily targets by 20%.`,
      });
    }

    // Rule 4: Health check-in
    if (stats.todayFocusMinutes > 120) {
      alerts.push({
        type: "study",
        priority: "low",
        message: "💧 Take a short break. Stretch and drink some water.",
      });
    }

    return alerts;
  },
};

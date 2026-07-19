export interface CoachAdvice {
  id: string;
  type: "warning" | "success" | "info" | "action";
  title: string;
  advice: string;
  actionText?: string;
}

export const recommendationRules = {
  generateSuggestions: (inputs: {
    economyProgress: number;
    missedTasksCount: number;
    streakDays: number;
    morningStudyCompleted: boolean;
  }): CoachAdvice[] => {
    const suggestions: CoachAdvice[] = [];

    // Rule 1: Weak Subject (Economy)
    if (inputs.economyProgress < 35) {
      suggestions.push({
        id: "advice_economy",
        type: "warning",
        title: "Economy Deficit detected",
        advice: `Your Economy progress is only ${inputs.economyProgress}%. Spend an extra 30 minutes daily on Economy fundamental revisions.`,
        actionText: "Focus Economy",
      });
    }

    // Rule 2: Overloaded schedule
    if (inputs.missedTasksCount >= 3) {
      suggestions.push({
        id: "advice_overload",
        type: "action",
        title: "Planner Overload",
        advice: `You missed ${inputs.missedTasksCount} tasks recently. Your schedule may be overloaded. Consider reducing your daily targets by 20% to reset pacing.`,
        actionText: "Reduce Targets",
      });
    }

    // Rule 3: Strong consistency streak
    if (inputs.streakDays >= 7) {
      suggestions.push({
        id: "advice_streak",
        type: "success",
        title: "High Caliber Streak",
        advice: `Great consistency! You are on a ${inputs.streakDays}-day streak. You are ready for a higher difficulty plan or expanded syllabus modules.`,
        actionText: "Increase Load",
      });
    }

    // Rule 4: Morning Study Style preference
    if (inputs.morningStudyCompleted) {
      suggestions.push({
        id: "advice_morning",
        type: "info",
        title: "Circadian Optimization",
        advice: "You perform best in morning blocks. Schedule your hardest topic (e.g. Economy or Geography) immediately after waking up.",
      });
    }

    // Fallback recommendation
    if (suggestions.length === 0) {
      suggestions.push({
        id: "advice_general",
        type: "info",
        title: "Consistency is Key",
        advice: "Your calibration is stable. Dedicate 20 minutes to active recall flashcards before closing today's session.",
      });
    }

    return suggestions;
  }
};

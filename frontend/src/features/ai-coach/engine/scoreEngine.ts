export const scoreEngine = {
  calculateScore: (metrics: {
    taskCompletionRate: number; // 0 to 100
    streakDays: number;
    focusHours: number;
    revisionCompletedCount: number;
    missedTasksCount: number;
  }): number => {
    // Base completion value (max 40 points)
    const completionScore = (metrics.taskCompletionRate / 100) * 40;

    // Consistency/Streak value (max 20 points, capped at 30 days)
    const consistencyScore = Math.min(20, (metrics.streakDays / 30) * 20);

    // Focus hours value (max 20 points, 1 point per hour up to 20h weekly/daily normalization)
    const focusScore = Math.min(20, metrics.focusHours * 3);

    // Revision volume (max 20 points)
    const revisionScore = Math.min(20, metrics.revisionCompletedCount * 4);

    // Penalty for missed tasks (-5 points each)
    const penalty = metrics.missedTasksCount * 5;

    const rawScore = completionScore + consistencyScore + focusScore + revisionScore - penalty;

    // Constrain score between 0 and 100
    return Math.max(0, Math.min(100, Math.round(rawScore)));
  }
};

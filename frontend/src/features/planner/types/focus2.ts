export type FocusMode = "focus" | "break";

export type SoundPreset = "Minimal" | "Calm" | "Focus" | "Nature" | "Classic" | "Silent";
export type AmbienceType = "None" | "Rain" | "White Noise" | "Brown Noise" | "Soft Ambient";
export type FeedbackMode = "All Feedback" | "Milestones Only" | "Completion Only" | "Off";

export interface FocusPreferences {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  notificationsEnabled: boolean;
  completionCelebration: boolean;
  finalFiveMinAlert: boolean;
  doNotDisturb: boolean;
  volume: number; // 0 to 1
  soundPreset: SoundPreset;
  ambience: AmbienceType;
  feedbackMode: FeedbackMode;
}

export type FocusEventType =
  | "SESSION_STARTED"
  | "SESSION_PAUSED"
  | "SESSION_RESUMED"
  | "MILESTONE_25"
  | "MILESTONE_50"
  | "MILESTONE_75"
  | "FIVE_MINUTES_LEFT"
  | "ONE_MINUTE_LEFT"
  | "SESSION_COMPLETED"
  | "BREAK_STARTED"
  | "BREAK_ENDING"
  | "BREAK_COMPLETED"
  | "GOAL_COMPLETED"
  | "ACHIEVEMENT_UNLOCKED"
  | "ERROR";

export interface ExtendedFocusSession {
  sessionId: string;
  mode: FocusMode;
  subjectId?: string;
  subject: string;
  goalId?: string;
  taskId?: string;

  plannedSeconds: number;
  elapsedSeconds: number;

  startedAt: string;
  completedAt?: string;

  status: "running" | "paused" | "completed" | "abandoned";

  milestonesTriggered: string[];
  notificationEvents: string[];

  soundEnabled: boolean;
  hapticEnabled: boolean;

  interruptionCount: number;
  totalAwaySeconds: number;
}

export interface FocusAnalytics {
  totalSessions: number;
  totalFocusSeconds: number;
  avgSessionSeconds: number;
  longestSessionSeconds: number;
  completionRate: number;
  totalInterruptions: number;
  avgAwaySeconds: number;
  bestFocusHour: string;
}

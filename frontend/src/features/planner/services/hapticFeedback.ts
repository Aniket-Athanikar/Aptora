import { supportsHaptics, prefersReducedMotion } from "./deviceCapabilities";
import { FocusEventType, FocusPreferences } from "../types/focus2";

export const HAPTIC_PATTERNS: Record<string, number[]> = {
  SESSION_STARTED: [30],
  SESSION_PAUSED: [20, 30, 20],
  SESSION_RESUMED: [30],
  MILESTONE_25: [15],
  MILESTONE_50: [20, 30],
  MILESTONE_75: [15, 20, 15],
  COMPLETION: [40, 30, 60],
  ERROR: [50, 50],
};

export function triggerHaptic(
  eventType: FocusEventType,
  prefs: FocusPreferences
): boolean {
  if (!prefs.hapticEnabled || prefs.doNotDisturb) return false;
  if (prefersReducedMotion()) return false;
  if (!supportsHaptics()) return false;

  // Filter based on feedbackMode
  if (prefs.feedbackMode === "Off") return false;
  if (prefs.feedbackMode === "Completion Only" && eventType !== "SESSION_COMPLETED") return false;
  if (
    prefs.feedbackMode === "Milestones Only" &&
    !["MILESTONE_25", "MILESTONE_50", "MILESTONE_75", "SESSION_COMPLETED"].includes(eventType)
  ) {
    return false;
  }

  let pattern: number[] | null = null;
  if (eventType === "SESSION_STARTED" || eventType === "BREAK_STARTED") {
    pattern = HAPTIC_PATTERNS.SESSION_STARTED;
  } else if (eventType === "SESSION_PAUSED") {
    pattern = HAPTIC_PATTERNS.SESSION_PAUSED;
  } else if (eventType === "SESSION_RESUMED") {
    pattern = HAPTIC_PATTERNS.SESSION_RESUMED;
  } else if (eventType === "MILESTONE_25") {
    pattern = HAPTIC_PATTERNS.MILESTONE_25;
  } else if (eventType === "MILESTONE_50") {
    pattern = HAPTIC_PATTERNS.MILESTONE_50;
  } else if (eventType === "MILESTONE_75") {
    pattern = HAPTIC_PATTERNS.MILESTONE_75;
  } else if (
    eventType === "SESSION_COMPLETED" ||
    eventType === "GOAL_COMPLETED" ||
    eventType === "ACHIEVEMENT_UNLOCKED"
  ) {
    pattern = HAPTIC_PATTERNS.COMPLETION;
  } else if (eventType === "ERROR") {
    pattern = HAPTIC_PATTERNS.ERROR;
  }

  if (pattern && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

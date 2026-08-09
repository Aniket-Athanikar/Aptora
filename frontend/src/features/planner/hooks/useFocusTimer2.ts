import { useState, useEffect, useRef, useCallback } from "react";
import { usePlannerStore } from "../store/plannerStore";
import { FocusSession } from "../types/planner";
import {
  FocusMode,
  FocusPreferences,
  ExtendedFocusSession,
  FocusEventType,
} from "../types/focus2";
import { FocusEventBus } from "../services/focusEventBus";
import { NotificationService } from "../services/notificationService";
import { SoundManager } from "../services/soundManager";
import { profileService } from "@/services";

const PREFS_STORAGE_KEY = "examforge_focus_preferences_v2";
const STATE_STORAGE_KEY = "examforge_focus_timer_state_v2";

export const DEFAULT_PREFERENCES: FocusPreferences = {
  soundEnabled: true,
  hapticEnabled: true,
  notificationsEnabled: true,
  completionCelebration: true,
  finalFiveMinAlert: true,
  doNotDisturb: false,
  volume: 0.35,
  soundPreset: "Calm",
  ambience: "None",
  feedbackMode: "All Feedback",
};

export function useFocusTimer2(defaultSubject = "General Study", defaultTaskId?: string) {
  const { addFocusSession, streak, tasks, sessions } = usePlannerStore();

  // 1. Preferences State
  const [preferences, setPreferences] = useState<FocusPreferences>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(PREFS_STORAGE_KEY);
        if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      } catch {}
    }
    return DEFAULT_PREFERENCES;
  });

  // Save Preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences));
      } catch {}
    }
  }, [preferences]);

  // 2. Active Session State
  const [activeSession, setActiveSession] = useState<ExtendedFocusSession>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STATE_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed;
        }
      } catch {}
    }
    return {
      sessionId: `session_${Date.now()}`,
      mode: "focus",
      subject: defaultSubject,
      taskId: defaultTaskId,
      plannedSeconds: 25 * 60,
      elapsedSeconds: 0,
      startedAt: new Date().toISOString(),
      status: "paused",
      milestonesTriggered: [],
      notificationEvents: [],
      soundEnabled: true,
      hapticEnabled: true,
      interruptionCount: 0,
      totalAwaySeconds: 0,
    };
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [awayModalState, setAwayModalState] = useState<{
    isOpen: boolean;
    type: "welcome_back" | "long_absence";
    awaySeconds: number;
  }>({ isOpen: false, type: "welcome_back", awaySeconds: 0 });

  const [completionCelebration, setCompletionCelebration] = useState<boolean>(false);
  const leaveTimeRef = useRef<number | null>(null);

  // Sync state to LocalStorage
  const saveStateToStorage = useCallback((session: ExtendedFocusSession) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(session));
      } catch {}
    }
  }, []);

  // Sync Ambience Audio Node
  useEffect(() => {
    if (isRunning && preferences.ambience !== "None") {
      SoundManager.setAmbience(preferences.ambience, preferences.volume);
    } else {
      SoundManager.stopAmbience();
    }
  }, [isRunning, preferences.ambience, preferences.volume]);

  // Handle Event Triggers (EventBus + NotificationService)
  const emitEvent = useCallback(
    (eventType: FocusEventType, payload?: any) => {
      FocusEventBus.emit(eventType, preferences, payload);

      // Report event to backend to calculate real XP/streak and broadcast via WebSockets
      profileService.reportEvent(eventType, {
        subject: activeSession.subject || defaultSubject,
        duration_minutes: Math.round(activeSession.plannedSeconds / 60)
      }).catch((e) => console.warn("Failed to report focus event to backend:", e));

      // Notification Handlers
      const sId = activeSession.sessionId;
      const subj = activeSession.subject || defaultSubject;
      const durMin = Math.round(activeSession.plannedSeconds / 60);

      if (eventType === "SESSION_STARTED") {
        NotificationService.notifySessionStarted(sId, subj, durMin, preferences);
      } else if (eventType === "FIVE_MINUTES_LEFT") {
        NotificationService.notifyFiveMinutesLeft(sId, preferences);
      } else if (eventType === "ONE_MINUTE_LEFT") {
        NotificationService.notifyOneMinuteLeft(sId, preferences);
      } else if (eventType === "SESSION_COMPLETED") {
        NotificationService.notifySessionCompleted(sId, subj, durMin, streak + 1, preferences);
      } else if (eventType === "BREAK_STARTED") {
        NotificationService.notifyBreakStarted(sId, Math.round(activeSession.plannedSeconds / 60), preferences);
      } else if (eventType === "BREAK_ENDING") {
        NotificationService.notifyBreakEnding(sId, preferences);
      }
    },
    [activeSession, preferences, defaultSubject, streak]
  );

  // Core Timer Interval Engine (Timestamp-based accuracy)
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (isRunning) {
      const startTime = Date.now();
      const initialElapsed = activeSession.elapsedSeconds;

      timerId = setInterval(() => {
        const now = Date.now();
        const deltaSecs = Math.floor((now - startTime) / 1000);
        const currentElapsed = Math.min(initialElapsed + deltaSecs, activeSession.plannedSeconds);
        const secondsRemaining = activeSession.plannedSeconds - currentElapsed;

        // Check Milestone Conditions
        const percent = Math.floor((currentElapsed / activeSession.plannedSeconds) * 100);
        const triggered = new Set(activeSession.milestonesTriggered);

        if (percent >= 25 && !triggered.has("25%")) {
          triggered.add("25%");
          emitEvent("MILESTONE_25");
        }
        if (percent >= 50 && !triggered.has("50%")) {
          triggered.add("50%");
          emitEvent("MILESTONE_50");
          NotificationService.notifyMilestone(activeSession.sessionId, "50%", `You've completed ${Math.round(currentElapsed / 60)} minutes. Keep going!`, preferences);
        }
        if (percent >= 75 && !triggered.has("75%")) {
          triggered.add("75%");
          emitEvent("MILESTONE_75");
          NotificationService.notifyMilestone(activeSession.sessionId, "75%", `Only ${Math.ceil(secondsRemaining / 60)} minutes remaining. Finish strong!`, preferences);
        }
        if (secondsRemaining <= 300 && secondsRemaining > 290 && !triggered.has("5min") && activeSession.plannedSeconds >= 600) {
          triggered.add("5min");
          emitEvent("FIVE_MINUTES_LEFT");
        }
        if (secondsRemaining <= 60 && secondsRemaining > 50 && !triggered.has("1min") && activeSession.plannedSeconds >= 120) {
          triggered.add("1min");
          emitEvent("ONE_MINUTE_LEFT");
        }

        // Completion Check
        if (currentElapsed >= activeSession.plannedSeconds) {
          if (timerId) clearInterval(timerId);
          setIsRunning(false);
          handleCompletion();
          return;
        }

        const updated = {
          ...activeSession,
          elapsedSeconds: currentElapsed,
          milestonesTriggered: Array.from(triggered),
        };
        setActiveSession(updated);
        saveStateToStorage(updated);
      }, 1000);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRunning, activeSession, emitEvent, saveStateToStorage, preferences]);

  // Visibility & Window Focus Distraction Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        leaveTimeRef.current = Date.now();
      } else {
        if (leaveTimeRef.current && isRunning) {
          const awaySecs = Math.floor((Date.now() - leaveTimeRef.current) / 1000);
          leaveTimeRef.current = null;

          if (awaySecs >= 5) {
            setActiveSession((prev) => ({
              ...prev,
              interruptionCount: prev.interruptionCount + 1,
              totalAwaySeconds: prev.totalAwaySeconds + awaySecs,
            }));

            if (awaySecs > 600) {
              setAwayModalState({ isOpen: true, type: "long_absence", awaySeconds: awaySecs });
            } else {
              setAwayModalState({ isOpen: true, type: "welcome_back", awaySeconds: awaySecs });
            }
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning]);

  // Session Completion Handler
  const handleCompletion = useCallback(() => {
    const isFocus = activeSession.mode === "focus";

    if (isFocus) {
      // Save FocusSession to Planner Store
      const completedSession: FocusSession = {
        id: activeSession.sessionId,
        taskId: activeSession.taskId,
        subject: activeSession.subject || defaultSubject,
        durationMinutes: Math.round(activeSession.plannedSeconds / 60),
        completedAt: new Date().toISOString(),
      };
      addFocusSession(completedSession);

      emitEvent("SESSION_COMPLETED");
      setCompletionCelebration(true);

      // Auto Switch to Break Session (5 mins)
      const nextSession: ExtendedFocusSession = {
        sessionId: `break_${Date.now()}`,
        mode: "break",
        subject: "Short Recess",
        plannedSeconds: 5 * 60,
        elapsedSeconds: 0,
        startedAt: new Date().toISOString(),
        status: "paused",
        milestonesTriggered: [],
        notificationEvents: [],
        soundEnabled: preferences.soundEnabled,
        hapticEnabled: preferences.hapticEnabled,
        interruptionCount: 0,
        totalAwaySeconds: 0,
      };
      setActiveSession(nextSession);
      saveStateToStorage(nextSession);
    } else {
      emitEvent("BREAK_COMPLETED");
      // Auto Switch back to Focus Session
      const nextSession: ExtendedFocusSession = {
        sessionId: `session_${Date.now()}`,
        mode: "focus",
        subject: defaultSubject,
        taskId: defaultTaskId,
        plannedSeconds: 25 * 60,
        elapsedSeconds: 0,
        startedAt: new Date().toISOString(),
        status: "paused",
        milestonesTriggered: [],
        notificationEvents: [],
        soundEnabled: preferences.soundEnabled,
        hapticEnabled: preferences.hapticEnabled,
        interruptionCount: 0,
        totalAwaySeconds: 0,
      };
      setActiveSession(nextSession);
      saveStateToStorage(nextSession);
    }
  }, [activeSession, defaultSubject, defaultTaskId, addFocusSession, emitEvent, saveStateToStorage, preferences]);

  // Actions
  const startTimer = useCallback(
    async (subject?: string, taskId?: string) => {
      if (preferences.notificationsEnabled) {
        NotificationService.requestPermission();
      }

      const updated = {
        ...activeSession,
        status: "running" as const,
        subject: subject || activeSession.subject || defaultSubject,
        taskId: taskId || activeSession.taskId || defaultTaskId,
      };
      setActiveSession(updated);
      setIsRunning(true);
      saveStateToStorage(updated);

      emitEvent(activeSession.elapsedSeconds > 0 ? "SESSION_RESUMED" : "SESSION_STARTED");
    },
    [activeSession, defaultSubject, defaultTaskId, preferences, emitEvent, saveStateToStorage]
  );

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    const updated = { ...activeSession, status: "paused" as const };
    setActiveSession(updated);
    saveStateToStorage(updated);
    emitEvent("SESSION_PAUSED");
  }, [activeSession, emitEvent, saveStateToStorage]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    NotificationService.clearSessionKeys(activeSession.sessionId);
    const updated: ExtendedFocusSession = {
      ...activeSession,
      sessionId: `session_${Date.now()}`,
      elapsedSeconds: 0,
      status: "paused",
      milestonesTriggered: [],
    };
    setActiveSession(updated);
    saveStateToStorage(updated);
  }, [activeSession, saveStateToStorage]);

  const setTimerDuration = useCallback(
    (minutes: number, mode: FocusMode = "focus") => {
      setIsRunning(false);
      NotificationService.clearSessionKeys(activeSession.sessionId);
      const updated: ExtendedFocusSession = {
        ...activeSession,
        sessionId: `${mode}_${Date.now()}`,
        mode,
        plannedSeconds: minutes * 60,
        elapsedSeconds: 0,
        status: "paused",
        milestonesTriggered: [],
      };
      setActiveSession(updated);
      saveStateToStorage(updated);
    },
    [activeSession, saveStateToStorage]
  );

  const repeatSession = useCallback(() => {
    setCompletionCelebration(false);
    setTimerDuration(Math.round(activeSession.plannedSeconds / 60), "focus");
    startTimer();
  }, [activeSession, setTimerDuration, startTimer]);

  const updatePreferences = useCallback((newPrefs: Partial<FocusPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  }, []);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["input", "textarea"].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (isRunning) pauseTimer();
        else startTimer();
      } else if (e.code === "KeyR" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        startTimer();
      } else if (e.code === "KeyM" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        updatePreferences({ soundEnabled: !preferences.soundEnabled });
      } else if (e.code === "Escape") {
        if (isRunning) pauseTimer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, startTimer, pauseTimer, updatePreferences, preferences.soundEnabled]);

  const secondsLeft = Math.max(0, activeSession.plannedSeconds - activeSession.elapsedSeconds);
  const progressPercent = ((activeSession.plannedSeconds - secondsLeft) / activeSession.plannedSeconds) * 100;

  return {
    activeSession,
    secondsLeft,
    isRunning,
    mode: activeSession.mode,
    progressPercent,
    preferences,
    awayModalState,
    setAwayModalState,
    completionCelebration,
    setCompletionCelebration,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerDuration,
    repeatSession,
    updatePreferences,
  };
}

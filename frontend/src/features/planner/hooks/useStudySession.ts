import { useState, useEffect, useRef } from "react";
import { usePlannerStore } from "../store/plannerStore";
import { FocusSession } from "../types/planner";

export function useStudySession() {
  const { addFocusSession } = usePlannerStore();
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [customDuration, setCustomDuration] = useState(25); // in minutes
  const [activeTaskSubject, setActiveTaskSubject] = useState("General Study");
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>(undefined);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, secondsLeft]);

  const handleSessionEnd = () => {
    if (mode === "focus") {
      const session: FocusSession = {
        id: `session_${Date.now()}`,
        taskId: activeTaskId,
        subject: activeTaskSubject,
        durationMinutes: customDuration,
        completedAt: new Date().toISOString(),
      };
      addFocusSession(session);

      // Auto switch to break mode
      setMode("break");
      setSecondsLeft(5 * 60);
    } else {
      setMode("focus");
      setSecondsLeft(customDuration * 60);
    }
  };

  const startTimer = (subject?: string, taskId?: string) => {
    if (subject) setActiveTaskSubject(subject);
    if (taskId) setActiveTaskId(taskId);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(customDuration * 60);
    setMode("focus");
  };

  const setTimerDuration = (minutes: number) => {
    setCustomDuration(minutes);
    setSecondsLeft(minutes * 60);
    setIsRunning(false);
    setMode("focus");
  };

  return {
    secondsLeft,
    isRunning,
    mode,
    customDuration,
    activeTaskSubject,
    activeTaskId,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerDuration,
  };
}

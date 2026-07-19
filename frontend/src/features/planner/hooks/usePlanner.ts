import { usePlannerStore } from "../store/plannerStore";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { useEffect, useMemo } from "react";
import { StudyTask } from "../types/planner";

export function usePlanner() {
  const { activeGoal } = useGoalEngine();
  const {
    tasks,
    generateTasksForGoal,
    updateTaskStatus,
    rescheduleTask,
    streak,
    xpPoints
  } = usePlannerStore();

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  // Generate today and tomorrow's tasks if active goal is set
  useEffect(() => {
    if (activeGoal) {
      generateTasksForGoal(activeGoal, [todayStr, tomorrowStr]);
    }
  }, [activeGoal, generateTasksForGoal, todayStr, tomorrowStr]);

  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.date === todayStr);
  }, [tasks, todayStr]);

  const completedTodayCount = useMemo(() => {
    return todayTasks.filter((t) => t.status === "completed").length;
  }, [todayTasks]);

  const progressPercent = useMemo(() => {
    if (todayTasks.length === 0) return 0;
    return Math.round((completedTodayCount / todayTasks.length) * 100);
  }, [todayTasks.length, completedTodayCount]);

  return {
    tasks,
    todayTasks,
    progressPercent,
    completedTodayCount,
    totalTodayCount: todayTasks.length,
    streak,
    xpPoints,
    updateTaskStatus,
    rescheduleTask,
    activeGoal,
  };
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StudyTask, FocusSession } from "../types/planner";
import { GoalData } from "@/types/goal.types";
import { plannerEngine } from "../services/plannerEngine";

interface PlannerState {
  tasks: StudyTask[];
  sessions: FocusSession[];
  streak: number;
  lastUpdatedDate: string | null;
  xpPoints: number;

  generateTasksForGoal: (goal: GoalData, dates: string[]) => void;
  updateTaskStatus: (taskId: string, status: "pending" | "completed" | "missed") => void;
  rescheduleTask: (taskId: string, date: string, timeSlot: string) => void;
  addFocusSession: (session: FocusSession) => void;
  addTask: (task: Omit<StudyTask, "id" | "goalId"> & { goalId?: string }) => void;
  updateTask: (taskId: string, updates: Partial<StudyTask>) => void;
  deleteTask: (taskId: string) => void;
  resetPlanner: () => void;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      tasks: [],
      sessions: [],
      streak: 0,
      lastUpdatedDate: null,
      xpPoints: 0,

      generateTasksForGoal: (goal: GoalData, dates: string[]) => {
        const existingTasks = get().tasks;
        const newTasks: StudyTask[] = [];

        dates.forEach((dateStr) => {
          // Check if tasks already exist for this date
          const dateExists = existingTasks.some((t) => t.date === dateStr && t.goalId === goal.id);
          if (!dateExists) {
            const daily = plannerEngine.generateDailyTasks(goal, dateStr);
            newTasks.push(...daily);
          }
        });

        if (newTasks.length > 0) {
          set({ tasks: [...existingTasks, ...newTasks] });
        }
      },

      updateTaskStatus: (taskId: string, status: "pending" | "completed" | "missed") => {
        const todayStr = new Date().toISOString().split("T")[0];
        const prevTasks = get().tasks;
        const task = prevTasks.find((t) => t.id === taskId);

        if (!task) return;

        const updatedTasks = prevTasks.map((t) =>
          t.id === taskId ? { ...t, status } : t
        );

        let streakChange = 0;
        let xpChange = 0;

        if (status === "completed" && task.status !== "completed") {
          xpChange = 50; // Earn 50 XP
          const lastDate = get().lastUpdatedDate;
          if (lastDate !== todayStr) {
            streakChange = 1; // Increment streak
          }
        } else if (status !== "completed" && task.status === "completed") {
          xpChange = -50;
        }

        set((state) => ({
          tasks: updatedTasks,
          xpPoints: Math.max(0, state.xpPoints + xpChange),
          streak: streakChange > 0 ? state.streak + 1 : state.streak,
          lastUpdatedDate: streakChange > 0 ? todayStr : state.lastUpdatedDate,
        }));
      },

      rescheduleTask: (taskId: string, date: string, timeSlot: string) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, date, timeSlot } : t
          ),
        }));
      },

      addFocusSession: (session: FocusSession) => {
        set((state) => ({
          sessions: [...state.sessions, session],
          xpPoints: state.xpPoints + 100, // Earn 100 XP for Pomodoro sessions
        }));
      },

      addTask: (task) => {
        const newTask: StudyTask = {
          ...task,
          id: `task_custom_${Date.now()}`,
          goalId: task.goalId || "default",
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
        }));
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        }));
      },

      resetPlanner: () => {
        set({ tasks: [], sessions: [], streak: 0, lastUpdatedDate: null, xpPoints: 0 });
      },
    }),
    {
      name: "Aptora_planner_store",
      partialize: (state) => ({
        tasks: state.tasks,
        sessions: state.sessions,
        streak: state.streak,
        lastUpdatedDate: state.lastUpdatedDate,
        xpPoints: state.xpPoints,
      }),
    }
  )
);

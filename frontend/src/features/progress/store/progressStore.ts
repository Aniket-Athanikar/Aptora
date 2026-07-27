import { create } from "zustand";

export interface SubjectProgressData {
  subject: string;
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
  confidence: number;
  revisionStatus: "Good" | "Needs Review" | "Weak";
}

export interface ActivityHistoryItem {
  date: string;
  hours: number;
  tasksCompleted: number;
  status: "completed" | "partial" | "missed";
}

interface ProgressStore {
  goalId: string;
  totalHours: number;
  completedTasks: number;
  streak: number;
  completionPercentage: number;
  subjectProgress: SubjectProgressData[];
  lastUpdated: string;
  sessionsCount: number;
  activityHistory: ActivityHistoryItem[];

  // Actions
  initializeProgress: (goalId: string, weaknesses: { subject: string; confidence: number }[]) => void;
  recordStudySession: (subject: string, minutes: number) => void;
  incrementStreak: () => void;
  updateTaskCompletion: (subject: string, completed: boolean) => void;
  loadFromLocalStorage: () => void;
  updateDailyActivity: (date: string, hours: number, tasksCompleted: number, status: "completed" | "partial" | "missed") => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  goalId: "",
  totalHours: 356, // Prepopulated with standard mock user statistics as requested (356 hours, 420 tasks, 28 day streak, 145 sessions)
  completedTasks: 420,
  streak: 28,
  completionPercentage: 72,
  sessionsCount: 145,
  lastUpdated: new Date().toISOString(),
  subjectProgress: [
    { subject: "History", completedTasks: 85, totalTasks: 100, completionPercentage: 85, confidence: 5, revisionStatus: "Good" },
    { subject: "Geography", completedTasks: 60, totalTasks: 100, completionPercentage: 60, confidence: 4, revisionStatus: "Good" },
    { subject: "Polity", completedTasks: 75, totalTasks: 100, completionPercentage: 75, confidence: 4, revisionStatus: "Good" },
    { subject: "Economy", completedTasks: 40, totalTasks: 100, completionPercentage: 40, confidence: 2, revisionStatus: "Weak" },
    { subject: "Science", completedTasks: 50, totalTasks: 100, completionPercentage: 50, confidence: 3, revisionStatus: "Needs Review" },
    { subject: "Current Affairs", completedTasks: 90, totalTasks: 100, completionPercentage: 90, confidence: 5, revisionStatus: "Good" },
    { subject: "Mathematics", completedTasks: 30, totalTasks: 100, completionPercentage: 30, confidence: 3, revisionStatus: "Needs Review" },
    { subject: "Reasoning", completedTasks: 65, totalTasks: 100, completionPercentage: 65, confidence: 4, revisionStatus: "Good" },
  ],
  activityHistory: [], // Will populate with past 365 days for heatmap
 
  initializeProgress: (goalId, weaknesses) => {
    // Generate active subject progress matching goal configuration
    const initialSubjects = [
      "History", "Geography", "Polity", "Economy", "Science", "Current Affairs", "Mathematics", "Reasoning"
    ];

    const subjectProgress = initialSubjects.map((sub) => {
      const weakness = weaknesses.find((w) => w.subject.toLowerCase() === sub.toLowerCase());
      const confidence = weakness ? weakness.confidence : 4;
      const completionPercentage = Math.round(30 + Math.random() * 55); // Random seed between 30% and 85%
      let revisionStatus: "Good" | "Needs Review" | "Weak" = "Good";
      if (confidence <= 2) revisionStatus = "Weak";
      else if (confidence <= 3) revisionStatus = "Needs Review";

      return {
        subject: sub,
        completedTasks: Math.round(completionPercentage * 1.2),
        totalTasks: 120,
        completionPercentage,
        confidence,
        revisionStatus,
      };
    });

    const totalCompleted = subjectProgress.reduce((sum, s) => sum + s.completedTasks, 0);
    const totalT = subjectProgress.reduce((sum, s) => sum + s.totalTasks, 0);
    const overallPercentage = Math.round((totalCompleted / totalT) * 100);

    // Generate mock heatmap history (past 365 days)
    const history: ActivityHistoryItem[] = [];
    const now = new Date();
    for (let i = 365; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const hours = Math.random() > 0.25 ? Math.round(1 + Math.random() * 7) : 0;
      const tasksCompleted = hours > 4 ? 3 : hours > 0 ? 1 : 0;
      const status = hours > 4 ? ("completed" as const) : hours > 0 ? ("partial" as const) : ("missed" as const);
      history.push({ date: dateStr, hours, tasksCompleted, status });
    }

    const state = {
      goalId,
      totalHours: 356,
      completedTasks: totalCompleted,
      streak: 28,
      completionPercentage: overallPercentage,
      sessionsCount: 145,
      subjectProgress,
      activityHistory: history,
      lastUpdated: new Date().toISOString(),
    };

    set(state);

    // Save to requested LocalStorage keys
    localStorage.setItem("examforge_progress", JSON.stringify(state));
    localStorage.setItem("examforge_streak", JSON.stringify({ streak: 28, lastUpdated: new Date().toISOString() }));
    localStorage.setItem("examforge_activity_history", JSON.stringify(history));
    localStorage.setItem("examforge_analytics", JSON.stringify({
      weeklyHours: [4, 5, 3, 6, 4, 2, 5],
      monthlyProgress: [20, 35, 50, 72]
    }));
  },

  recordStudySession: (subject, minutes) => {
    const hoursAdded = Number((minutes / 60).toFixed(2));
    const todayStr = new Date().toISOString().split("T")[0];

    const updatedHistory = get().activityHistory.map((h) => {
      if (h.date === todayStr) {
        const nextHours = Number((h.hours + hoursAdded).toFixed(2));
        return {
          ...h,
          hours: nextHours,
          status: nextHours > 5 ? "completed" as const : "partial" as const
        };
      }
      return h;
    });

    const subjectProgress = get().subjectProgress.map((sub) => {
      if (sub.subject.toLowerCase() === subject.toLowerCase()) {
        const nextCompleted = sub.completedTasks + 1;
        const percent = Math.min(100, Math.round((nextCompleted / sub.totalTasks) * 100));
        return {
          ...sub,
          completedTasks: nextCompleted,
          completionPercentage: percent,
          revisionStatus: percent > 75 ? "Good" as const : percent > 50 ? "Needs Review" as const : "Weak" as const
        };
      }
      return sub;
    });

    const nextCompletedTasks = get().completedTasks + 1;
    const totalT = subjectProgress.reduce((sum, s) => sum + s.totalTasks, 0);
    const overallPercentage = Math.round((subjectProgress.reduce((sum, s) => sum + s.completedTasks, 0) / totalT) * 100);

    const newState = {
      totalHours: Number((get().totalHours + hoursAdded).toFixed(1)),
      completedTasks: nextCompletedTasks,
      sessionsCount: get().sessionsCount + 1,
      subjectProgress,
      completionPercentage: overallPercentage,
      activityHistory: updatedHistory,
      lastUpdated: new Date().toISOString(),
    };

    set(newState);
    localStorage.setItem("examforge_progress", JSON.stringify({ ...get(), ...newState }));
    localStorage.setItem("examforge_activity_history", JSON.stringify(updatedHistory));
  },

  incrementStreak: () => {
    const nextStreak = get().streak + 1;
    set({ streak: nextStreak });
    localStorage.setItem("examforge_streak", JSON.stringify({ streak: nextStreak, lastUpdated: new Date().toISOString() }));
  },

  updateTaskCompletion: (subject, completed) => {
    const todayStr = new Date().toISOString().split("T")[0];
    let foundToday = false;
    const activityHistory = get().activityHistory.map((h) => {
      if (h.date === todayStr) {
        foundToday = true;
        const count = Math.max(0, h.tasksCompleted + (completed ? 1 : -1));
        return {
          ...h,
          tasksCompleted: count,
          status: count > 3 ? "completed" as const : count > 0 ? "partial" as const : "missed" as const
        };
      }
      return h;
    });

    if (!foundToday) {
      activityHistory.push({
        date: todayStr,
        hours: 0,
        tasksCompleted: completed ? 1 : 0,
        status: completed ? "partial" : "missed"
      });
    }

    const subjectProgress = get().subjectProgress.map((sub) => {
      if (sub.subject.toLowerCase() === subject.toLowerCase()) {
        const nextCompleted = Math.max(0, sub.completedTasks + (completed ? 1 : -1));
        const percent = Math.min(100, Math.round((nextCompleted / sub.totalTasks) * 100));
        return {
          ...sub,
          completedTasks: nextCompleted,
          completionPercentage: percent,
          revisionStatus: percent > 75 ? "Good" as const : percent > 50 ? "Needs Review" as const : "Weak" as const
        };
      }
      return sub;
    });

    const nextCompletedTasks = Math.max(0, get().completedTasks + (completed ? 1 : -1));
    const totalT = subjectProgress.reduce((sum, s) => sum + s.totalTasks, 0);
    const overallPercentage = Math.round((subjectProgress.reduce((sum, s) => sum + s.completedTasks, 0) / totalT) * 100);

    const newState = {
      completedTasks: nextCompletedTasks,
      subjectProgress,
      completionPercentage: overallPercentage,
      activityHistory,
      lastUpdated: new Date().toISOString(),
    };

    set(newState);
    localStorage.setItem("examforge_progress", JSON.stringify({ ...get(), ...newState }));
    localStorage.setItem("examforge_activity_history", JSON.stringify(activityHistory));
  },

  loadFromLocalStorage: () => {
    try {
      const storedProgress = localStorage.getItem("examforge_progress");
      if (storedProgress) {
        const parsed = JSON.parse(storedProgress);
        set(parsed);
      }

      const storedHistory = localStorage.getItem("examforge_activity_history");
      if (storedHistory) {
        set({ activityHistory: JSON.parse(storedHistory) });
      } else {
        // Generate mock activity history for heatmap (past 365 days)
        const history: ActivityHistoryItem[] = [];
        const now = new Date();
        for (let i = 365; i >= 0; i--) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          const hours = Math.random() > 0.25 ? Math.round(1 + Math.random() * 7) : 0;
          const tasksCompleted = hours > 4 ? 3 : hours > 0 ? 1 : 0;
          const status = hours > 4 ? ("completed" as const) : hours > 0 ? ("partial" as const) : ("missed" as const);
          history.push({ date: dateStr, hours, tasksCompleted, status });
        }
        set({ activityHistory: history });
        localStorage.setItem("examforge_activity_history", JSON.stringify(history));
      }

      const storedStreak = localStorage.getItem("examforge_streak");
      if (storedStreak) {
        const parsed = JSON.parse(storedStreak);
        set({ streak: parsed.streak });
      }
    } catch (e) {
      console.error("Failed to load progress from localStorage", e);
    }
  },

  updateDailyActivity: (date, hours, tasksCompleted, status) => {
    const activityHistory = get().activityHistory.map((h) => {
      if (h.date === date) {
        return { ...h, hours, tasksCompleted, status };
      }
      return h;
    });

    const exists = get().activityHistory.some(h => h.date === date);
    if (!exists) {
      activityHistory.push({ date, hours, tasksCompleted, status });
    }

    const nextTotalHours = Number(activityHistory.reduce((sum, h) => sum + h.hours, 0).toFixed(1));
    const nextCompletedTasks = activityHistory.reduce((sum, h) => sum + h.tasksCompleted, 0);

    const newState = {
      activityHistory,
      totalHours: nextTotalHours,
      completedTasks: nextCompletedTasks,
      lastUpdated: new Date().toISOString()
    };

    set(newState);
    localStorage.setItem("examforge_progress", JSON.stringify({ ...get(), ...newState }));
    localStorage.setItem("examforge_activity_history", JSON.stringify(activityHistory));
  }
}));

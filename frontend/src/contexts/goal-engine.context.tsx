"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  GoalData,
  HistorySnapshot,
  WizardState,
  DailyMissionItem,
  RecommendationItem,
  NotificationItem,
  AchievementItem
} from "@/types/goal.types";
import { goalService } from "@/services/goal.service";
import { useAuth } from "@/lib/auth-context";
import { profileService } from "@/services";

// Define context state type
interface GoalEngineState {
  activeGoal: GoalData | null;
  wizardState: WizardState;
  history: HistorySnapshot[];
  dailyMissions: DailyMissionItem[];
  recommendations: RecommendationItem[];
  notifications: NotificationItem[];
  achievements: AchievementItem[];
  studyTimer: {
    isActive: boolean;
    seconds: number;
    subject: string | null;
  };
}

// Actions
type GoalAction =
  | { type: "HYDRATE_STATE"; payload: { activeGoal: GoalData | null; history: HistorySnapshot[]; wizardState: WizardState | null } }
  | { type: "START_WIZARD" }
  | { type: "UPDATE_WIZARD_DRAFT"; payload: Partial<GoalData> }
  | { type: "WIZARD_UNDO" }
  | { type: "WIZARD_REDO" }
  | { type: "SET_WIZARD_STEP"; payload: number }
  | { type: "COMPLETE_WIZARD"; payload: GoalData }
  | { type: "DELETE_GOAL" }
  | { type: "RESTORE_VERSION"; payload: GoalData }
  | { type: "DELETE_VERSION"; payload: number }
  | { type: "TOGGLE_MISSION"; payload: string }
  | { type: "TICK_TIMER" }
  | { type: "START_TIMER"; payload: string }
  | { type: "PAUSE_TIMER" }
  | { type: "RESET_TIMER" }
  | { type: "ADD_NOTIFICATION"; payload: { title: string; description: string; type: "info" | "warning" | "success" } }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "CLEAR_ALL_NOTIFICATIONS" };

const initialAchievements: AchievementItem[] = [
  { id: "1", title: "Dreamer", description: "Created your first success goal", unlocked: false, icon: "Target", color: "from-blue-400 to-indigo-500" },
  { id: "2", title: "Disciplined", description: "Configured 10+ daily study hours", unlocked: false, icon: "Zap", color: "from-purple-400 to-pink-500" },
  { id: "3", title: "Focused Subject", description: "Identified syllabus weaknesses", unlocked: false, icon: "Brain", color: "from-amber-400 to-orange-500" },
  { id: "4", title: "Timer Master", description: "Completed a study session via the timer", unlocked: false, icon: "Timer", color: "from-emerald-400 to-teal-500" },
];

const initialWizardState: WizardState = {
  currentStep: 1,
  isCompleted: false,
  draft: {},
  historyIndex: -1,
  undoStack: [],
  redoStack: [],
};

const initialState: GoalEngineState = {
  activeGoal: null,
  wizardState: initialWizardState,
  history: [],
  dailyMissions: [],
  recommendations: [],
  notifications: [
    { id: "n1", title: "Welcome to ExamForge AI", description: "Configure your success journey roadmap to start studying.", timestamp: new Date().toISOString(), read: false, type: "info" }
  ],
  achievements: initialAchievements,
  studyTimer: {
    isActive: false,
    seconds: 0,
    subject: null,
  },
};

// Simple rules to dynamically generate daily planner items
function generateDailyMissions(goal: GoalData | null): DailyMissionItem[] {
  if (!goal) return [];
  const missions: DailyMissionItem[] = [];
  const hours = goal.timeline.dailyStudyHours || 8;

  // Allocate hours dynamically based on profile, weakness and study preference
  const weakSubjects = [...goal.weaknesses].sort((a, b) => b.weaknessScore - a.weaknessScore);

  let currentHoursAllocated = 0;

  // Add core study slot
  if (weakSubjects.length > 0) {
    const mainWeakness = weakSubjects[0].subject;
    const duration = Math.min(Math.floor(hours * 0.4), 4) * 60; // 40% of time up to 4 hrs
    missions.push({
      id: "m1",
      title: `Core Study: ${mainWeakness}`,
      durationMinutes: duration > 0 ? duration : 120,
      completed: false,
      type: "study",
      subject: mainWeakness
    });
    currentHoursAllocated += Math.ceil(duration / 60);
  }

  // Add practice slot
  const hasPractice = goal.preferences.some(p => 
    p.includes("Practice") || 
    p.includes("PYQ") || 
    p.includes("Mock")
  );
  if (hasPractice) {
    const duration = 60; // 1 hour practice
    missions.push({
      id: "m2",
      title: `Solve PYQs & Mock MCQs`,
      durationMinutes: duration,
      completed: false,
      type: "practice"
    });
    currentHoursAllocated += 1;
  }

  // Add secondary study slot or revision slot
  if (weakSubjects.length > 1 && currentHoursAllocated < hours) {
    const secondWeakness = weakSubjects[1].subject;
    const duration = Math.min(hours - currentHoursAllocated, 3) * 60;
    if (duration > 0) {
      missions.push({
        id: "m3",
        title: `Revision Focus: ${secondWeakness}`,
        durationMinutes: duration,
        completed: false,
        type: "revision",
        subject: secondWeakness
      });
      currentHoursAllocated += Math.ceil(duration / 60);
    }
  }

  // Final fallback revision task
  if (currentHoursAllocated < hours) {
    missions.push({
      id: "m4",
      title: `General Active Recall & Revision Notes`,
      durationMinutes: (hours - currentHoursAllocated) * 60,
      completed: false,
      type: "revision"
    });
  }

  return missions;
}

// Simple rules to dynamically generate AI Recommendations
function generateRecommendations(goal: GoalData | null): RecommendationItem[] {
  if (!goal) return [];
  const recs: RecommendationItem[] = [];

  // Rule 1: High Burnout Risk
  if (goal.timeline.burnoutRisk === "High") {
    recs.push({
      id: "r1",
      title: "High Burnout Risk Detected",
      description: "You've configured study targets > 12 hours. Consider reducing study targets or expanding your timeline to avoid fatigue.",
      ruleName: "burnout_risk",
      resolved: false,
      actionText: "Reduce Target Hours"
    });
  }

  // Rule 2: Low Daily Hours
  if (goal.timeline.dailyStudyHours < 4) {
    recs.push({
      id: "r2",
      title: "Curriculum Inconsistency Danger",
      description: "Under 4 study hours daily may struggle to complete the UPSC syllabus. Increase to at least 6-8 hours for full coverage.",
      ruleName: "low_study_time",
      resolved: false,
      actionText: "Increase Target Hours"
    });
  }

  // Rule 3: Missing Practice preferences
  const hasPracticeOrMock = goal.preferences.some(p =>
    p.includes("Practice") ||
    p.includes("PYQ") ||
    p.includes("Mock")
  );
  if (!hasPracticeOrMock) {
    recs.push({
      id: "r3",
      title: "Practice Engine Deficiency",
      description: "Your selection doesn't include active testing. Include PYQs or Mock Tests to double your memory recall rates.",
      ruleName: "missing_practice",
      resolved: false,
      actionText: "Enable Mock Tests"
    });
  }

  // Rule 4: Weak Subjects Focus
  const highWeakness = goal.weaknesses.filter(w => w.weaknessScore > 65);
  highWeakness.forEach((w, idx) => {
    recs.push({
      id: `r_weak_${idx}`,
      title: `Critical Gap: ${w.subject}`,
      description: `Your confidence in ${w.subject} is very low. Adjust timeline to allocate extra revisions or leverage interactive Mind Maps.`,
      ruleName: `weakness_${w.subject}`,
      resolved: false,
      actionText: "Add Focus Session"
    });
  });

  return recs;
}

// Reducer function
function goalEngineReducer(state: GoalEngineState, action: GoalAction): GoalEngineState {
  switch (action.type) {
    case "HYDRATE_STATE": {
      const activeGoal = action.payload.activeGoal;
      const history = action.payload.history;
      const loadedWizard = action.payload.wizardState;

      // Unlocked achievement validation
      const achievements = state.achievements.map((ach) => {
        if (ach.id === "1" && activeGoal) return { ...ach, unlocked: true, unlockedAt: activeGoal.createdAt };
        if (ach.id === "2" && activeGoal && activeGoal.timeline.dailyStudyHours >= 10) return { ...ach, unlocked: true, unlockedAt: activeGoal.createdAt };
        if (ach.id === "3" && activeGoal && activeGoal.weaknesses.some(w => w.weaknessScore > 60)) return { ...ach, unlocked: true, unlockedAt: activeGoal.createdAt };
        return ach;
      });

      return {
        ...state,
        activeGoal,
        history,
        wizardState: loadedWizard || {
          ...state.wizardState,
          isCompleted: !!activeGoal,
          draft: activeGoal ? JSON.parse(JSON.stringify(activeGoal)) : {}
        },
        dailyMissions: generateDailyMissions(activeGoal),
        recommendations: generateRecommendations(activeGoal),
        achievements
      };
    }

    case "START_WIZARD": {
      return {
        ...state,
        wizardState: {
          ...state.wizardState,
          currentStep: 1,
          isCompleted: false,
          draft: state.activeGoal ? JSON.parse(JSON.stringify(state.activeGoal)) : {},
          undoStack: [],
          redoStack: []
        }
      };
    }

    case "UPDATE_WIZARD_DRAFT": {
      const newDraft = { ...state.wizardState.draft, ...action.payload };

      // Maintain undo stack
      const updatedUndo = [...state.wizardState.undoStack, JSON.parse(JSON.stringify(state.wizardState.draft))];

      const updatedWizard = {
        ...state.wizardState,
        draft: newDraft,
        undoStack: updatedUndo,
        redoStack: [] // Clear redo on new action
      };

      return {
        ...state,
        wizardState: updatedWizard
      };
    }

    case "WIZARD_UNDO": {
      const { undoStack, redoStack, draft } = state.wizardState;
      if (undoStack.length === 0) return state;

      const previousDraft = undoStack[undoStack.length - 1];
      const newUndo = undoStack.slice(0, -1);
      const newRedo = [JSON.parse(JSON.stringify(draft)), ...redoStack];

      const updatedWizard = {
        ...state.wizardState,
        draft: previousDraft,
        undoStack: newUndo,
        redoStack: newRedo
      };

      return {
        ...state,
        wizardState: updatedWizard
      };
    }

    case "WIZARD_REDO": {
      const { undoStack, redoStack, draft } = state.wizardState;
      if (redoStack.length === 0) return state;

      const nextDraft = redoStack[0];
      const newRedo = redoStack.slice(1);
      const newUndo = [...undoStack, JSON.parse(JSON.stringify(draft))];

      const updatedWizard = {
        ...state.wizardState,
        draft: nextDraft,
        undoStack: newUndo,
        redoStack: newRedo
      };

      return {
        ...state,
        wizardState: updatedWizard
      };
    }

    case "SET_WIZARD_STEP": {
      const updatedWizard = {
        ...state.wizardState,
        currentStep: action.payload
      };
      return {
        ...state,
        wizardState: updatedWizard
      };
    }

    case "COMPLETE_WIZARD": {
      const goal = action.payload;
      const nextHistory = state.history;

      // Unlock Achievements
      const achievements = state.achievements.map((ach) => {
        if (ach.id === "1") return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
        if (ach.id === "2" && goal.timeline.dailyStudyHours >= 10) return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
        if (ach.id === "3" && goal.weaknesses.some(w => w.weaknessScore > 60)) return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
        return ach;
      });

      return {
        ...state,
        activeGoal: goal,
        wizardState: {
          ...state.wizardState,
          isCompleted: true,
          currentStep: 7,
          draft: JSON.parse(JSON.stringify(goal))
        },
        history: nextHistory,
        dailyMissions: generateDailyMissions(goal),
        recommendations: generateRecommendations(goal),
        achievements,
        notifications: [
          {
            id: `n_complete_${Date.now()}`,
            title: "Success Journey Calibrated!",
            description: `AI success model calibrated for ${goal.targetExam}. Your personalized roadmap is ready.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: "success"
          },
          ...state.notifications
        ]
      };
    }

    case "DELETE_GOAL": {
      return {
        ...state,
        activeGoal: null,
        wizardState: initialWizardState,
        history: [],
        dailyMissions: [],
        recommendations: [],
        studyTimer: { isActive: false, seconds: 0, subject: null },
        notifications: [
          {
            id: `n_del_${Date.now()}`,
            title: "Goal Reset Complete",
            description: "Success database cleared. Ready for fresh calibration.",
            timestamp: new Date().toISOString(),
            read: false,
            type: "info"
          },
          ...state.notifications
        ]
      };
    }

    case "RESTORE_VERSION": {
      const goal = action.payload;
      return {
        ...state,
        activeGoal: goal,
        wizardState: {
          ...state.wizardState,
          isCompleted: true,
          draft: JSON.parse(JSON.stringify(goal))
        },
        history: state.history,
        dailyMissions: generateDailyMissions(goal),
        recommendations: generateRecommendations(goal),
        notifications: [
          {
            id: `n_rest_${Date.now()}`,
            title: "Historical Snapshot Restored",
            description: "Reverted your success engine settings to a previous model version.",
            timestamp: new Date().toISOString(),
            read: false,
            type: "success"
          },
          ...state.notifications
        ]
      };
    }

    case "DELETE_VERSION": {
      const versionId = action.payload;
      return {
        ...state,
        history: state.history.filter((snapshot) => snapshot.version !== versionId),
        notifications: [
          {
            id: `n_delver_${Date.now()}`,
            title: "Snapshot Deleted",
            description: `Successfully deleted version snapshot #${versionId}.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: "info"
          },
          ...state.notifications
        ]
      };
    }

    case "TOGGLE_MISSION": {
      const updatedMissions = state.dailyMissions.map((m) =>
        m.id === action.payload ? { ...m, completed: !m.completed } : m
      );
      return {
        ...state,
        dailyMissions: updatedMissions
      };
    }

    case "TICK_TIMER": {
      if (!state.studyTimer.isActive) return state;
      const nextSeconds = state.studyTimer.seconds + 1;
      return {
        ...state,
        studyTimer: {
          ...state.studyTimer,
          seconds: nextSeconds
        }
      };
    }

    case "START_TIMER": {
      return {
        ...state,
        studyTimer: {
          isActive: true,
          seconds: state.studyTimer.seconds,
          subject: action.payload
        }
      };
    }

    case "PAUSE_TIMER": {
      return {
        ...state,
        studyTimer: {
          ...state.studyTimer,
          isActive: false
        }
      };
    }

    case "RESET_TIMER": {
      const achievements = [...state.achievements];
      // Unlock Master study timer achievement if sessions was > 0
      if (state.studyTimer.seconds > 0) {
        const itemIdx = achievements.findIndex((a) => a.id === "4");
        if (itemIdx !== -1 && !achievements[itemIdx].unlocked) {
          achievements[itemIdx] = {
            ...achievements[itemIdx],
            unlocked: true,
            unlockedAt: new Date().toISOString()
          };
        }
      }

      return {
        ...state,
        studyTimer: {
          isActive: false,
          seconds: 0,
          subject: null
        },
        achievements,
        notifications: state.studyTimer.seconds > 0 ? [
          {
            id: `n_timer_${Date.now()}`,
            title: "Study Session Logged",
            description: `Great job! Logged ${Math.floor(state.studyTimer.seconds / 60)} minutes of study for ${state.studyTimer.subject || "General Study"}.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: "success"
          },
          ...state.notifications
        ] : state.notifications
      };
    }

    case "ADD_NOTIFICATION": {
      const newNotif: NotificationItem = {
        id: `n_notif_${Date.now()}`,
        title: action.payload.title,
        description: action.payload.description,
        timestamp: new Date().toISOString(),
        read: false,
        type: action.payload.type
      };
      return {
        ...state,
        notifications: [newNotif, ...state.notifications]
      };
    }

    case "MARK_NOTIFICATION_READ": {
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      };
    }

    case "CLEAR_ALL_NOTIFICATIONS": {
      return {
        ...state,
        notifications: []
      };
    }

    default:
      return state;
  }
}

// Create Context
interface GoalEngineContextType extends GoalEngineState {
  startWizard: () => void;
  updateWizardDraft: (draft: Partial<GoalData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  undoWizardDraft: () => void;
  redoWizardDraft: () => void;
  completeWizard: (goal: GoalData, changeDesc: string) => void;
  deleteGoal: () => void;
  restoreVersion: (version: number) => void;
  deleteVersion: (version: number) => void;
  toggleMission: (id: string) => void;
  startTimer: (subject: string) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  addNotification: (title: string, description: string, type: "info" | "warning" | "success") => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const GoalEngineContext = createContext<GoalEngineContextType | undefined>(undefined);

const mapGoalToProfilePayload = (goal: GoalData) => {
  const weak = goal.weaknesses.filter(w => w.confidence <= 2).map(w => w.subject);
  const strong = goal.weaknesses.filter(w => w.confidence >= 4).map(w => w.subject);
  const fav = goal.weaknesses.filter(w => w.confidence === 3).map(w => w.subject);

  return {
    name: goal.profile.fullName,
    location: goal.profile.city,
    education: goal.profile.education,
    avatar_url: goal.profile.avatar,
    target_exam: goal.targetExam,
    study_hours_goal: goal.timeline.dailyStudyHours,
    target_date: goal.timeline.examDate,
    weak_subjects: weak,
    strong_subjects: strong,
    favorite_subjects: fav,
    completion_pct: goal.profile.syllabusPercent,
  };
};

export function GoalEngineProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(goalEngineReducer, initialState);
  const { user, login } = useAuth();

  // Load from services and backend database on mount
  useEffect(() => {
    const loadGoal = async () => {
      try {
        const workspaceState = await goalService.getWorkspace();
        dispatch({
          type: "HYDRATE_STATE",
          payload: {
            activeGoal: workspaceState.activeGoal,
            history: workspaceState.history || [],
            wizardState: workspaceState.wizardState || null
          }
        });
      } catch (err) {
        console.warn("Could not load workspace from backend:", err);
      }
    };
    loadGoal();
  }, [user]);

  // Tick study timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (state.studyTimer.isActive) {
      interval = setInterval(() => {
        dispatch({ type: "TICK_TIMER" });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.studyTimer.isActive]);

  const startWizard = () => dispatch({ type: "START_WIZARD" });
  const updateWizardDraft = (draft: Partial<GoalData>) => dispatch({ type: "UPDATE_WIZARD_DRAFT", payload: draft });

  const nextStep = () => {
    const nextS = Math.min(state.wizardState.currentStep + 1, 7);
    dispatch({ type: "SET_WIZARD_STEP", payload: nextS });
  };
  const prevStep = () => {
    const prevS = Math.max(state.wizardState.currentStep - 1, 1);
    dispatch({ type: "SET_WIZARD_STEP", payload: prevS });
  };
  const goToStep = (step: number) => {
    dispatch({ type: "SET_WIZARD_STEP", payload: step });
  };

  const undoWizardDraft = () => dispatch({ type: "WIZARD_UNDO" });
  const redoWizardDraft = () => dispatch({ type: "WIZARD_REDO" });

  const completeWizard = async (goal: GoalData, changeDesc: string) => {
    try {
      const workspaceState = await goalService.saveActiveGoal(goal, changeDesc);

      dispatch({
        type: "COMPLETE_WIZARD",
        payload: workspaceState.activeGoal ?? goal,
      });

      dispatch({
        type: "HYDRATE_STATE",
        payload: {
          activeGoal: workspaceState.activeGoal,
          history: workspaceState.history || [],
          wizardState: null,
        },
      });

      if (user?.email) {
        login({
          name: goal.profile.fullName,
          email: user.email,
          avatar: goal.profile.avatar,
        });
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteGoal = async () => {
    try {
      const workspace = await goalService.deleteActiveGoal();
      dispatch({
        type: "HYDRATE_STATE",
        payload: {
          activeGoal: workspace.activeGoal ?? null,
          history: workspace.history ?? [],
          wizardState: workspace.wizardState ?? null,
        },
      });
    } catch (error) {
      console.error("API Error", error);
    }
  };

  const restoreVersion = async () => {
    try {
      const workspace = await goalService.restoreVersion();
      dispatch({
        type: "HYDRATE_STATE",
        payload: {
          activeGoal: workspace.activeGoal ?? null,
          history: workspace.history ?? [],
          wizardState: workspace.wizardState ?? null,
        },
      });
    } catch (error) {
      console.error("API Error", error);
    }
  };

  const deleteVersion = async () => {
    try {
      const workspace = await goalService.deleteHistoryVersion();
      dispatch({
        type: "HYDRATE_STATE",
        payload: {
          activeGoal: workspace.activeGoal ?? null,
          history: workspace.history ?? [],
          wizardState: workspace.wizardState ?? null,
        },
      });
    } catch (error) {
      console.error("API Error", error);
    }
  };

  const toggleMission = (id: string) => dispatch({ type: "TOGGLE_MISSION", payload: id });

  const startTimer = (subject: string) => dispatch({ type: "START_TIMER", payload: subject });
  const pauseTimer = () => dispatch({ type: "PAUSE_TIMER" });
  const resetTimer = () => dispatch({ type: "RESET_TIMER" });

  const addNotification = (title: string, description: string, type: "info" | "warning" | "success") => {
    dispatch({ type: "ADD_NOTIFICATION", payload: { title, description, type } });
  };
  const markNotificationRead = (id: string) => dispatch({ type: "MARK_NOTIFICATION_READ", payload: id });
  const clearAllNotifications = () => dispatch({ type: "CLEAR_ALL_NOTIFICATIONS" });

  return (
    <GoalEngineContext.Provider
      value={{
        ...state,
        startWizard,
        updateWizardDraft,
        nextStep,
        prevStep,
        goToStep,
        undoWizardDraft,
        redoWizardDraft,
        completeWizard,
        deleteGoal,
        restoreVersion,
        deleteVersion,
        toggleMission,
        startTimer,
        pauseTimer,
        resetTimer,
        addNotification,
        markNotificationRead,
        clearAllNotifications
      }}
    >
      {children}
    </GoalEngineContext.Provider>
  );
}

export function useGoalEngine() {
  const context = useContext(GoalEngineContext);
  if (!context) {
    throw new Error("useGoalEngine must be used within a GoalEngineProvider");
  }
  return context;
}

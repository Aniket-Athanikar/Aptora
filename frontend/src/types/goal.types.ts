export interface PrepProfile {
  fullName: string;
  avatar: string;
  education: string;
  stream: string;
  city: string;
  occupation: string;
  age: number;
  gender: string;
  syllabusPercent: number;
  currentConfidence: number;
}

export interface GoalTimeline {
  examDate: string;
  dailyStudyHours: number;
  burnoutRisk: "Low" | "Moderate" | "High";
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
  successPrediction: number;
  remainingDays: number;
}

export interface StudyLifestyle {
  slots: ("Morning" | "Afternoon" | "Night" | "Weekend")[];
  dailyHours: number;
  preferredDevice: string;
  learningEnvironment: string;
  internetAvailability: string;
  consistency: string[];
}

export interface SubjectWeakness {
  subject: string;
  confidence: number; // 1 to 5
  difficulty: "Easy" | "Medium" | "Hard";
  weaknessScore: number; // calculated 0 to 100
  priority: "Low" | "Medium" | "High";
  aiRecommendation: string;
}

export interface GoalData {
  id: string;
  targetExam: string;
  examCategory: string;
  customExamName?: string;
  profile: PrepProfile;
  timeline: GoalTimeline;
  lifestyle: StudyLifestyle;
  preferences: string[];
  weaknesses: SubjectWeakness[];
  summary: string;
  isPinned: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HistorySnapshot {
  version: number;
  timestamp: string;
  changeDescription: string;
  goalData: GoalData;
}

export interface DailyMissionItem {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
  type: "study" | "practice" | "revision" | "mock";
  subject?: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  ruleName: string;
  resolved: boolean;
  actionText?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: "info" | "warning" | "success";
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
  color: string;
}

export interface WizardState {
  currentStep: number;
  isCompleted: boolean;
  draft: Partial<GoalData>;
  historyIndex: number;
  undoStack: Partial<GoalData>[];
  redoStack: Partial<GoalData>[];
}

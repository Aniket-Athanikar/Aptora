export interface StudyTask {
  id: string;
  goalId: string;
  title: string;
  subject: string;
  duration: number; // minutes
  date: string; // YYYY-MM-DD
  status: "pending" | "completed" | "missed";
  priority: "Low" | "Medium" | "High";
  timeSlot: string; // e.g., "06:00 AM"
  color?: "indigo" | "violet" | "emerald" | "red" | "amber" | "blue" | "gray";
}

export interface FocusSession {
  id: string;
  taskId?: string;
  subject: string;
  durationMinutes: number;
  completedAt: string;
}

export interface WeeklyActivity {
  day: string; // "Monday", "Tuesday", etc.
  subject: string;
  duration: number; // hours
}

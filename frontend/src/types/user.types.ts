/**
 * ExamForge AI — TypeScript Type Definitions
 */

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  name: string;
  email: string;
  member_since: string;
  phone: string;
  dob: string;
  gender: string;
  location: string;
  timezone: string;
  education: string;
  college: string;
  occupation: string;
  bio: string;
  avatar_url: string;
  // Gamification
  xp: number;
  coins: number;
  level: number;
  streak: number;
  // Exam preferences
  target_exam: string;
  secondary_exam: string;
  target_score: string;
  target_rank: string;
  target_date: string;
  study_hours_goal: number;
  weak_subjects: string[];
  strong_subjects: string[];
  favorite_subjects: string[];
  // Performance
  accuracy: number;
  mock_average: number;
  questions_solved: number;
  study_hours_total: number;
  completion_pct: number;
  bookmarks_count: number;
  certificates_count: number;
  // Meta
  social_links: Record<string, string>;
  achievements: string[];
  connected_devices: unknown[];
  notification_settings: Record<string, boolean>;
  privacy_settings: Record<string, boolean>;
  security_score: number;
  plan: string;
  plan_renewal: string;
  ai_credits: number;
  storage_used_mb: number;
  updated_at: string;
}

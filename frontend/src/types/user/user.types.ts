// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'user' | 'admin' | 'moderator';
export type UserPlan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface UserProfile extends User {
  stats: UserStats;
  preferences: UserPreferences;
}

export interface UserStats {
  totalExams: number;
  completedExams: number;
  averageScore: number;
  totalTimeSpent: number; // in minutes
  streak: number;
  rank: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface PublicUser {
  id: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface ProfileUpdateInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface NotificationPreferencesInput {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface TimezoneInput {
  timezone: string;
}

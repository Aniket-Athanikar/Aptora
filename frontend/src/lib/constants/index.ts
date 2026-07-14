import type { PlanType } from '@/types/billing';

export const APP_NAME = 'ExampForge';
export const APP_DESCRIPTION = 'Creating better exam experiences for students and educators worldwide';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  EXAMS: '/exams',
  EXAM_DETAIL: (id: string) => `/exams/${id}`,
  EXAM_CREATE: '/exams/create',
  EXAM_EDIT: (id: string) => `/exams/${id}/edit`,
  PROFILE: '/profile',
  SETTINGS: '/settings',
  CHECKOUT: '/checkout',
  INVOICES: '/invoices',
  BLOG: '/blog',
  ABOUT: '/about',
  PRICING: '/pricing',
  CONTACT: '/contact',
  FAQ: '/faqs',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  REFRESH_TOKEN: 'refresh-token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USER: {
    ME: '/users/me',
    PROFILE: '/users/me/profile',
    PREFERENCES: '/users/me/preferences',
    AVATAR: '/users/me/avatar',
  },
  EXAMS: {
    LIST: '/exams',
    CREATE: '/exams',
    DETAIL: (id: string) => `/exams/${id}`,
    UPDATE: (id: string) => `/exams/${id}`,
    DELETE: (id: string) => `/exams/${id}`,
    PUBLISH: (id: string) => `/exams/${id}/publish`,
    QUESTIONS: (id: string) => `/exams/${id}/questions`,
    ATTEMPTS: (id: string) => `/exams/${id}/attempts`,
    RESULTS: (id: string) => `/exams/${id}/results`,
  },
  BILLING: {
    PLANS: '/billing/plans',
    SUBSCRIPTION: '/billing/subscription',
    INVOICES: '/billing/invoices',
    CHECKOUT: '/billing/checkout',
    PORTAL: '/billing/portal',
  },
} as const;

export const PLAN_LIMITS: Record<PlanType, { exams: number; questions: number; attempts: number; storage: number }> = {
  free: { exams: 3, questions: 50, attempts: 10, storage: 100 },
  basic: { exams: 10, questions: 200, attempts: 50, storage: 500 },
  pro: { exams: 50, questions: 1000, attempts: 200, storage: 2000 },
  enterprise: { exams: -1, questions: -1, attempts: -1, storage: -1 },
};

export const EXAM_CATEGORIES = [
  'Mathematics',
  'Science',
  'Language',
  'History',
  'Geography',
  'Computer Science',
  'Arts',
  'Music',
  'Business',
  'Law',
  'Medicine',
  'Engineering',
  'Other',
] as const;

export const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True/False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
] as const;

export const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
] as const;

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
] as const;

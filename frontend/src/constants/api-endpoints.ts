/**
 * Aptora — API Endpoint Constants
 * Single source of truth for all backend API URLs.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
    VERIFY_OTP: "/api/auth/verify-otp",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    LATEST_OTP: "/api/auth/latest-otp",
    LOGOUT: "/api/auth/logout",
  },
  PROFILE: {
    GET: "/api/profile",
    UPDATE: "/api/profile",
  },
  WORKSPACE: {
    GET: "/api/workspace",
    PROFILE: "/api/onboarding-profile",
    TIMELINE: "/api/timeline",
    LIFESTYLE: "/api/lifestyle",
    STUDY_SLOTS: "/api/study-slots",
    LEARNING_MODES: "/api/learning-modes",
    GAP_ANALYSIS: "/api/gap-analysis",
  },
  BILLING: {
    SEND_INVOICE: "/api/billing/send-invoice",
    HISTORY: "/api/billing/history",
    ORDERS: "/api/billing/orders",
  },
  ACCOUNT: {
    REQUEST_DELETION: "/api/account/request-deletion",
    GET_OTP: "/api/account/get-otp",
    VERIFY_DELETION: "/api/account/verify-deletion",
  },
  CONTACT: {
    SUBMIT: "/api/contact",
  },
  NEWSLETTER: {
    SUBSCRIBE: "/api/newsletter/subscribe",
  },
  ADMIN: {
    CONTACTS: "/api/admin/contacts",
    NEWSLETTER: "/api/admin/newsletter",
  },
} as const;

/**
 * Aptora — Route Path Constants
 * Single source of truth for all application routes.
 */
export const ROUTES = {
  // Public
  HOME: "/",
  ABOUT: "/about",
  BLOG: "/blog",
  CAREERS: "/careers",
  CONTACT: "/contact",
  EXAMS: "/exams",
  FAQS: "/faqs",
  FEATURES: "/features",
  FEEDBACK: "/feedback",
  HELP: "/help",
  HOW_IT_WORKS: "/how-it-works",
  PRICING: "/pricing",
  SUCCESS_STORIES: "/success-stories",
  SOCIAL_MEDIA: "/social-media",

  // Auth
  LOGIN: "/login",

  // Legal
  PRIVACY_POLICY: "/privacy-policy",
  TERMS_OF_SERVICE: "/terms-of-service",
  SECURITY: "/security",

  // Dashboard (authenticated)
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  CHECKOUT: "/checkout",

  // Other
  SITEMAP: "/sitemap",
  REPORT_BUG: "/report-bug",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * ExamForge AI — Environment Configuration
 * Typed access to environment variables with defaults.
 */
export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEV: process.env.NODE_ENV === "development",
  IS_PROD: process.env.NODE_ENV === "production",
} as const;

export const envConfig = env;
export type EnvConfig = typeof env;

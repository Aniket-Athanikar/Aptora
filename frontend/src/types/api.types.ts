/**
 * ExamForge AI — API Type Definitions
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

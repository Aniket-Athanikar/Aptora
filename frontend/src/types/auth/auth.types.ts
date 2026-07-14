import type { User } from '../user/user.types';

// Auth Types
export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailVerification {
  token: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Session {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginAttempts {
  email: string;
  attempts: number;
  lockedUntil?: string;
}

export type LoginInput = AuthCredentials;
export type RegisterInput = RegisterData;
export type ForgotPasswordInput = PasswordResetRequest;
export type ChangePasswordInput = ChangePassword;


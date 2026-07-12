/**
 * ExamForge AI — Auth Type Definitions
 */

export interface LoginPayload {
  email: string;
  skip_email?: boolean;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  skip_email?: boolean;
}

export interface OtpPayload {
  otp: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  email: string;
  name?: string;
  token?: string;
}

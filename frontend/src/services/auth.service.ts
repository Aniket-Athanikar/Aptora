/**
 * Aptora — Auth Service
 * API calls for authentication endpoints.
 */
import { apiClient } from "./api-client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

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

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGIN, payload),

  signup: (payload: SignupPayload) =>
    apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, payload),

  verifyOtp: (payload: OtpPayload) =>
    apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, payload),

  forgotPassword: (email: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (email: string, otp: string, new_password: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email, otp, new_password }),

  getLatestOtp: (email: string) =>
    apiClient.get(`${API_ENDPOINTS.AUTH.LATEST_OTP}?email=${email}`),

  logout: () =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),

  me: () =>
    apiClient.get("/api/auth/me"),

};

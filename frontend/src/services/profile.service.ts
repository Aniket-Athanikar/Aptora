/**
 * ExamForge AI — Profile Service
 * API calls for profile endpoints.
 */
import { apiClient } from "./api-client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

export const profileService = {
  getProfile: (email: string) =>
    apiClient.get(`${API_ENDPOINTS.PROFILE.GET}?email=${email}`),

  updateProfile: (email: string, data: Record<string, unknown>) =>
    apiClient.post(`${API_ENDPOINTS.PROFILE.UPDATE}?email=${email}`, data),
};

/**
 * Aptora — Profile Service
 * API calls for profile endpoints.
 */
import { apiClient } from "./api-client";

export const profileService = {
  getProfile: () =>
    apiClient.get<any>("/api/profile"),

  updateProfile: (data: Record<string, unknown>) =>
    apiClient.patch<any>("/api/profile", data),

  uploadAvatar: (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append("avatar", file);
    if (onProgress) {
      return apiClient.uploadWithProgress<any>("/api/profile/avatar", formData, onProgress);
    }
    return apiClient.upload<any>("/api/profile/avatar", formData);
  },

  deleteAvatar: () =>
    apiClient.delete<any>("/api/profile/avatar"),

  reportEvent: (eventType: string, details?: Record<string, any>) =>
    apiClient.post<any>("/api/profile/event", { event_type: eventType, details }),
};

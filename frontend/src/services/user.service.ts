import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  ProfileUpdateInput,
  NotificationPreferencesInput,
  TimezoneInput,
  UserProfile,
  User,
} from '@/types/user';

export const userService = {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/users/me/profile');
  },

  async updateProfile(data: ProfileUpdateInput): Promise<ApiResponse<User>> {
    return apiClient.patch<User>('/users/me/profile', data);
  },

  async updateAvatar(_file: File): Promise<ApiResponse<User>> {
    throw new Error('Avatar upload endpoint is not implemented by this backend.');
  },

  async deleteAvatar(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/users/me/avatar');
  },

  async updatePreferences(data: NotificationPreferencesInput): Promise<ApiResponse<void>> {
    return apiClient.patch<void>('/users/me/preferences', data);
  },

  async updateTimezone(data: TimezoneInput): Promise<ApiResponse<void>> {
    return apiClient.patch<void>('/users/me/preferences/timezone', data);
  },

  async getPublicProfile(userId: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/users/${userId}`);
  },
};

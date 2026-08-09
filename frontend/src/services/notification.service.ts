import { apiClient } from "./api-client";
import { NotificationItem } from "@/features/notifications/store/notificationStore";

export interface NotificationResponse {
  success: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
}

export const notificationService = {
  getNotifications: () =>
    apiClient.get<NotificationResponse>("/api/notifications"),

  createNotification: (payload: { type: string; priority: string; message: string }) =>
    apiClient.post<{ success: boolean; notification: NotificationItem }>("/api/notifications", payload),

  markAsRead: (id: string) =>
    apiClient.patch<{ success: boolean; notification: NotificationItem }>(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.patch<{ success: boolean; message: string }>("/api/notifications/read-all"),

  deleteNotification: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/api/notifications/${id}`),

  clearAll: () =>
    apiClient.delete<{ success: boolean; message: string }>("/api/notifications"),
};

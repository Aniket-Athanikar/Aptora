import { create } from "zustand";

export interface NotificationItem {
  id: string;
  type: "study" | "progress" | "motivation" | "warning" | "achievement";
  priority: "low" | "medium" | "high";
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, "id" | "createdAt" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  loadNotifications: () => void;
}

const defaultNotifications: NotificationItem[] = [
  {
    id: "notif_1",
    type: "study",
    priority: "high",
    message: "📚 Your History revision is pending. Complete before 8 PM.",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif_2",
    type: "motivation",
    priority: "medium",
    message: "🔥 You are on a 28-day streak. Don't break it today!",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif_3",
    type: "progress",
    priority: "low",
    message: "📈 Your study efficiency improved 12% this week.",
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "notif_4",
    type: "warning",
    priority: "high",
    message: "⚠️ Economy progress is falling behind schedule (only 35%). Spend extra focus here.",
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: defaultNotifications,

  addNotification: (item) => {
    const newItem: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...get().notifications];
    set({ notifications: updated });
    localStorage.setItem("examforge_notifications", JSON.stringify(updated));
  },

  markAsRead: (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({ notifications: updated });
    localStorage.setItem("examforge_notifications", JSON.stringify(updated));
  },

  markAllAsRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications: updated });
    localStorage.setItem("examforge_notifications", JSON.stringify(updated));
  },

  clearNotification: (id) => {
    const updated = get().notifications.filter((n) => n.id !== id);
    set({ notifications: updated });
    localStorage.setItem("examforge_notifications", JSON.stringify(updated));
  },

  loadNotifications: () => {
    try {
      const stored = localStorage.getItem("examforge_notifications");
      if (stored) {
        set({ notifications: JSON.parse(stored) });
      } else {
        localStorage.setItem("examforge_notifications", JSON.stringify(defaultNotifications));
      }
    } catch (e) {
      console.error("Failed to load notifications from localStorage", e);
    }
  },
}));

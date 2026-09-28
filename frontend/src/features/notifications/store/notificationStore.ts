import { create } from "zustand";
import { notificationService } from "@/services/notification.service";

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
  isLoading: boolean;
  error: string | null;
  addNotification: (notification: Omit<NotificationItem, "id" | "createdAt" | "read">) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  connectWebSocket: () => () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,

  loadNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await notificationService.getNotifications();
      if (res.success && Array.isArray(res.notifications)) {
        set({ notifications: res.notifications, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      console.warn("Failed to load notifications from API, using cached state.", err);
      set({ isLoading: false, error: "Failed to connect to notification engine." });
    }
  },

  addNotification: async (item) => {
    const tempId = `notif_temp_${Date.now()}`;
    const optimistic: NotificationItem = {
      ...item,
      id: tempId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ notifications: [optimistic, ...state.notifications] }));

    try {
      const res = await notificationService.createNotification(item);
      if (res.success && res.notification) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === tempId ? res.notification : n
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to persist notification on server", err);
    }
  },

  markAsRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));

    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification read on server", err);
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));

    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications read on server", err);
    }
  },

  clearNotification: async (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));

    try {
      await notificationService.deleteNotification(id);
    } catch (err) {
      console.error("Failed to delete notification on server", err);
    }
  },

  clearAllNotifications: async () => {
    set({ notifications: [] });

    try {
      await notificationService.clearAll();
    } catch (err) {
      console.error("Failed to clear notifications on server", err);
    }
  },

  connectWebSocket: () => {
    let apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    let cleanHost = apiHost.replace("http://", "").replace("https://", "");
    let protocol = apiHost.startsWith("https") ? "wss://" : "ws://";
    let socketUrl = `${protocol}${cleanHost}/ws/dashboard`;

    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let delayTimeout: any = null;
    let active = true;

    const connect = () => {
      if (!active) return;
      try {
        socket = new WebSocket(socketUrl);

        socket.onopen = () => {
          if (!active) {
            try {
              socket?.close();
            } catch (err) {}
          }
        };

        socket.onmessage = (event) => {
          if (!active) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === "realtime_update" || data.type === "connection_status") {
              get().loadNotifications();
            }
          } catch (err) {
            console.error("Error parsing websocket notification event", err);
          }
        };

        socket.onclose = () => {
          if (active) {
            reconnectTimeout = setTimeout(connect, 5000);
          }
        };

        socket.onerror = () => {
          if (active) {
            socket?.close();
          }
        };
      } catch (e) {
        console.error("WebSocket init error inside notification store", e);
      }
    };

    delayTimeout = setTimeout(connect, 60);

    return () => {
      active = false;
      clearTimeout(delayTimeout);
      clearTimeout(reconnectTimeout);
      if (socket) {
        socket.onclose = null;
        socket.onerror = null;
        socket.onmessage = null;
        try {
          if (socket.readyState === WebSocket.OPEN) {
            socket.close();
          } else if (socket.readyState === WebSocket.CONNECTING) {
            socket.onopen = () => {
              try {
                socket?.close();
              } catch (err) {}
            };
          }
        } catch (err) {}
      }
    };
  },
}));

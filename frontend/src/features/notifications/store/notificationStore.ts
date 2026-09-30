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

  addNotification: (
    notification: Omit<NotificationItem, "id" | "createdAt" | "read">
  ) => Promise<void>;

  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  loadNotifications: () => Promise<void>;

  connectWebSocket: () => () => void;
}

/**
 * Build WebSocket URL from the current browser origin.
 *
 * Development:
 *   http://localhost
 *   -> ws://localhost/api/ws/dashboard
 *
 * Production HTTPS:
 *   https://example.com
 *   -> wss://example.com/api/ws/dashboard
 *
 * IMPORTANT:
 * Do not use:
 *   localhost:8000
 *   backend:8000
 *   api
 *
 * Nginx is responsible for forwarding /api/ws/dashboard
 * to the backend container.
 */
function getWebSocketUrl(): string {
  if (typeof window === "undefined") {
    return "ws://localhost/api/ws/dashboard";
  }

  const protocol =
    window.location.protocol === "https:" ? "wss:" : "ws:";

  return `${protocol}//${window.location.host}/api/ws/dashboard`;
}

export const useNotificationStore = create<NotificationStore>(
  (set, get) => ({
    notifications: [],
    isLoading: false,
    error: null,

    /**
     * Load notifications from backend.
     */
    loadNotifications: async () => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const res = await notificationService.getNotifications();

        if (res.success && Array.isArray(res.notifications)) {
          set({
            notifications: res.notifications,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        console.warn(
          "[Notifications] Failed to load notifications:",
          err
        );

        set({
          isLoading: false,
          error: "Failed to connect to notification engine.",
        });
      }
    },

    /**
     * Create notification optimistically.
     */
    addNotification: async (item) => {
      const tempId = `notif_temp_${Date.now()}`;

      const optimistic: NotificationItem = {
        ...item,
        id: tempId,
        read: false,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        notifications: [
          optimistic,
          ...state.notifications,
        ],
      }));

      try {
        const res =
          await notificationService.createNotification(item);

        if (res.success && res.notification) {
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notification.id === tempId
                ? res.notification
                : notification
            ),
          }));
        }
      } catch (err) {
        console.error(
          "[Notifications] Failed to persist notification:",
          err
        );

        // Remove optimistic notification if server failed.
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== tempId
          ),
        }));
      }
    },

    /**
     * Mark one notification as read.
     */
    markAsRead: async (id) => {
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id
            ? {
              ...notification,
              read: true,
            }
            : notification
        ),
      }));

      try {
        await notificationService.markAsRead(id);
      } catch (err) {
        console.error(
          "[Notifications] Failed to mark notification as read:",
          err
        );
      }
    },

    /**
     * Mark every notification as read.
     */
    markAllAsRead: async () => {
      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
      }));

      try {
        await notificationService.markAllAsRead();
      } catch (err) {
        console.error(
          "[Notifications] Failed to mark all notifications as read:",
          err
        );
      }
    },

    /**
     * Delete one notification.
     */
    clearNotification: async (id) => {
      const previousNotifications = get().notifications;

      set((state) => ({
        notifications: state.notifications.filter(
          (notification) => notification.id !== id
        ),
      }));

      try {
        await notificationService.deleteNotification(id);
      } catch (err) {
        console.error(
          "[Notifications] Failed to delete notification:",
          err
        );

        // Restore if API request failed.
        set({
          notifications: previousNotifications,
        });
      }
    },

    /**
     * Delete all notifications.
     */
    clearAllNotifications: async () => {
      const previousNotifications = get().notifications;

      set({
        notifications: [],
      });

      try {
        await notificationService.clearAll();
      } catch (err) {
        console.error(
          "[Notifications] Failed to clear notifications:",
          err
        );

        // Restore if API request failed.
        set({
          notifications: previousNotifications,
        });
      }
    },

    /**
     * Connect notification WebSocket.
     */
    connectWebSocket: () => {
      const socketUrl = getWebSocketUrl();

      let socket: WebSocket | null = null;

      let reconnectTimeout: ReturnType<typeof setTimeout> | null =
        null;

      let initialDelayTimeout: ReturnType<typeof setTimeout> | null =
        null;

      let active = true;

      let attempts = 0;

      const MAX_ATTEMPTS = 3;
      const RECONNECT_DELAY = 10000;

      console.log(
        "[Notifications WebSocket] URL:",
        socketUrl
      );

      const connect = () => {
        if (!active) {
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          console.warn(
            "[Notifications WebSocket] Maximum reconnect attempts reached."
          );
          return;
        }

        try {
          socket = new WebSocket(socketUrl);

          socket.onopen = () => {
            if (!active) {
              socket?.close();
              return;
            }

            attempts = 0;

            console.log(
              "[Notifications WebSocket] Connected."
            );
          };

          socket.onmessage = (event) => {
            if (!active) {
              return;
            }

            try {
              const data = JSON.parse(event.data);

              console.log(
                "[Notifications WebSocket] Message:",
                data
              );

              if (
                data.type === "realtime_update" ||
                data.type === "connection_status"
              ) {
                get().loadNotifications();
              }
            } catch (error) {
              console.warn(
                "[Notifications WebSocket] Invalid message:",
                error
              );
            }
          };

          socket.onerror = (error) => {
            if (!active) {
              return;
            }

            console.warn(
              "[Notifications WebSocket] Error:",
              error
            );
          };

          socket.onclose = () => {
            if (!active) {
              return;
            }

            attempts += 1;

            console.warn(
              `[Notifications WebSocket] Disconnected. Attempt ${attempts}/${MAX_ATTEMPTS}.`
            );

            if (attempts < MAX_ATTEMPTS) {
              reconnectTimeout = setTimeout(
                connect,
                RECONNECT_DELAY
              );
            }
          };
        } catch (error) {
          console.error(
            "[Notifications WebSocket] Connection failed:",
            error
          );
        }
      };

      initialDelayTimeout = setTimeout(connect, 100);

      /**
       * Cleanup function.
       */
      return () => {
        active = false;

        if (initialDelayTimeout) {
          clearTimeout(initialDelayTimeout);
        }

        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }

        if (socket) {
          socket.onopen = null;
          socket.onmessage = null;
          socket.onerror = null;
          socket.onclose = null;

          try {
            if (
              socket.readyState === WebSocket.OPEN ||
              socket.readyState === WebSocket.CONNECTING
            ) {
              socket.close();
            }
          } catch (error) {
            console.warn(
              "[Notifications WebSocket] Cleanup error:",
              error
            );
          }
        }
      };
    },
  })
);
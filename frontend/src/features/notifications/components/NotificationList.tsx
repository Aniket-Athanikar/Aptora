import React, { useState } from "react";
import { Check, Trash2, Bell, AlertTriangle, MessageSquare, Award } from "lucide-react";
import { NotificationItem } from "../store/notificationStore";

interface NotificationListProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearNotification: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onClearNotification,
  onMarkAllAsRead
}: NotificationListProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

  const displayNotifications = activeFilter === "all"
    ? notifications
    : notifications.filter((n) => !n.read);

  const getIcon = (type: string) => {
    switch (type) {
      case "study":
        return { icon: Bell, color: "text-indigo-600 bg-indigo-50 border-indigo-100" };
      case "warning":
        return { icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border-amber-100" };
      case "motivation":
        return { icon: MessageSquare, color: "text-rose-600 bg-rose-50 border-rose-100" };
      case "achievement":
        return { icon: Award, color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
      default:
        return { icon: Bell, color: "text-slate-500 bg-slate-50 border-slate-100" };
    }
  };

  const getPriorityBorder = (prio: string) => {
    if (prio === "high") return "border-l-4 border-l-rose-500";
    if (prio === "medium") return "border-l-4 border-l-amber-500";
    return "";
  };

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-gray-100">
        <div className="flex gap-2.5">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            All Messages
          </button>
          <button
            onClick={() => setActiveFilter("unread")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeFilter === "unread"
                ? "bg-slate-900 text-white"
                : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            Unread
          </button>
        </div>

        <button
          onClick={onMarkAllAsRead}
          className="text-xs text-indigo-650 hover:underline font-bold flex items-center gap-1"
        >
          <Check className="w-3.5 h-3.5" /> Mark all as read
        </button>
      </div>

      {/* List */}
      <div className="space-y-3.5">
        {displayNotifications.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Bell className="w-10 h-10 text-slate-200 mx-auto" />
            <h4 className="text-xs font-black text-gray-800">Inbox is empty</h4>
            <p className="text-[10px] text-gray-400">You are fully up-to-date with your notifications.</p>
          </div>
        ) : (
          displayNotifications.map((notif) => {
            const iconData = getIcon(notif.type);
            const Icon = iconData.icon;

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border border-gray-100 flex gap-3.5 justify-between items-start hover:shadow-xs transition-shadow ${
                  getPriorityBorder(notif.priority)
                } ${notif.read ? "bg-white opacity-70" : "bg-slate-50/40"}`}
              >
                <div className="flex gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconData.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-800 leading-normal">
                      {notif.message}
                    </p>
                    <p className="text-[9px] text-gray-400 font-extrabold uppercase">
                      {new Date(notif.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} • {notif.type}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => onMarkAsRead(notif.id)}
                      className="p-1.5 hover:bg-indigo-50 hover:text-indigo-650 text-gray-400 rounded-lg"
                      title="Mark as Read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onClearNotification(notif.id)}
                    className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-gray-400 rounded-lg"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

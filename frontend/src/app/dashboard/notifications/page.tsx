"use client";

import React, { useEffect } from "react";
import { GoalEngineProvider } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { NotificationList } from "@/features/notifications/components/NotificationList";
import { useNotificationStore } from "@/features/notifications/store/notificationStore";

function NotificationsPageContent() {
  const {
    notifications,
    markAsRead,
    clearNotification,
    markAllAsRead,
    loadNotifications
  } = useNotificationStore();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <DashboardLayout activeTab="notifications">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Notifications Center</h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">Manage study alerts, streak milestones, and system warnings.</p>
        </div>

        {/* Notifications list layout */}
        <NotificationList
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onClearNotification={clearNotification}
          onMarkAllAsRead={markAllAsRead}
        />
      </div>
    </DashboardLayout>
  );
}

export default function NotificationsPage() {
  return (
    <GoalEngineProvider>
      <NotificationsPageContent />
    </GoalEngineProvider>
  );
}

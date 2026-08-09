"use client";

import React, { useEffect, useState } from "react";
import { GoalEngineProvider } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard";
import { NotificationList } from "@/features/notifications/components/NotificationList";
import { useNotificationStore, NotificationItem } from "@/features/notifications/store/notificationStore";
import { Bell, Plus, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";

function NotificationsPageContent() {
  const {
    notifications,
    markAsRead,
    clearNotification,
    markAllAsRead,
    addNotification,
    loadNotifications
  } = useNotificationStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [msgType, setMsgType] = useState<NotificationItem["type"]>("study");
  const [msgPriority, setMsgPriority] = useState<NotificationItem["priority"]>("medium");

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    addNotification({
      type: msgType,
      priority: msgPriority,
      message: msgText.trim()
    });
    setMsgText("");
    setShowAddModal(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityCount = notifications.filter((n) => n.priority === "high").length;

  return (
    <DashboardLayout activeTab="notifications">
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Header & Interlink Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              Notifications Center <Bell className="w-6 h-6 text-[#6D4AFF] animate-bounce" />
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Real-time study alerts, streak milestones, and syllabus schedule warnings.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#6D4AFF] hover:bg-[#5A36EE] text-white text-xs font-black px-4.5 py-2.5 rounded-2xl transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Custom Alert
          </button>
        </div>

        {/* Hero Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-white via-indigo-50/50 to-purple-50/30 border border-indigo-100/90 rounded-3xl p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 text-[#6D4AFF] flex items-center justify-center font-black">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Notifications</p>
              <p className="text-xl font-black text-slate-900">{notifications.length}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 border border-amber-100/90 rounded-3xl p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unread Alerts</p>
              <p className="text-xl font-black text-amber-700">{unreadCount}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white via-rose-50/50 to-pink-50/30 border border-rose-100/90 rounded-3xl p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center font-black">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Warnings</p>
              <p className="text-xl font-black text-rose-700">{highPriorityCount}</p>
            </div>
          </div>
        </div>

        {/* Notifications List Container */}
        <NotificationList
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onClearNotification={clearNotification}
          onMarkAllAsRead={markAllAsRead}
        />

        {/* Create Custom Alert Modal (Create CRUD action) */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <form
              onSubmit={handleCreateAlert}
              className="bg-white border border-slate-200 p-6 rounded-[32px] w-full max-w-sm space-y-4 shadow-2xl"
            >
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Create Custom Study Alert</h3>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Alert Message</label>
                <textarea
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="e.g. ðŸ“š Complete Economy mock test by 7 PM today."
                  rows={3}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#6D4AFF] focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                  <select
                    value={msgType}
                    onChange={(e) => setMsgType(e.target.value as NotificationItem["type"])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#6D4AFF] focus:bg-white"
                  >
                    <option value="study">Study</option>
                    <option value="warning">Warning</option>
                    <option value="motivation">Motivation</option>
                    <option value="achievement">Achievement</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
                  <select
                    value={msgPriority}
                    onChange={(e) => setMsgPriority(e.target.value as NotificationItem["priority"])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#6D4AFF] focus:bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#6D4AFF] hover:bg-[#5A36EE] text-white rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        )}

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

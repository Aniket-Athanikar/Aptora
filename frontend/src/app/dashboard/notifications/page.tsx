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
      <div className="space-y-7 max-w-5xl mx-auto">

        {/* Header Banner - AI Library Style */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-purple-500/15 p-6 sm:p-8 text-slate-900 border border-amber-200/60 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300/60 text-[11px] font-black uppercase tracking-widest shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                Live Alerts
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                Notifications Center <Bell className="w-8 h-8 text-emerald-600 animate-bounce" />
              </h1>
              <p className="text-sm sm:text-base text-slate-700 font-medium max-w-xl">
                Real-time study alerts, streak milestones, and syllabus schedule warnings to keep you on track.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="self-start md:self-center h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-98 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Alert</span>
            </button>
          </div>
        </div>

        {/* Hero Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/30 border border-emerald-100/90 rounded-3xl p-5 shadow-xs flex items-center gap-3.5 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-black">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Notifications</p>
              <p className="text-xl font-black text-slate-900">{notifications.length}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 border border-amber-100/90 rounded-3xl p-5 shadow-xs flex items-center gap-3.5 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unread Alerts</p>
              <p className="text-xl font-black text-amber-700">{unreadCount}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white via-rose-50/50 to-pink-50/30 border border-rose-100/90 rounded-3xl p-5 shadow-xs flex items-center gap-3.5 relative overflow-hidden">
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
                  placeholder="e.g. 📚 Complete Economy mock test by 7 PM today."
                  rows={3}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-emerald-500 focus:bg-white resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                  <select
                    value={msgType}
                    onChange={(e) => setMsgType(e.target.value as NotificationItem["type"])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
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
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
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

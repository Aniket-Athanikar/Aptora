"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { useAuth, useProfile } from "@/contexts";
import { getAvatarUrl } from "@/lib/avatar";
import { Sidebar } from "@/components/layout/sidebar";
import { useNotificationStore } from "@/features/notifications/store/notificationStore";
import {
  Bell,
  Camera,
  Compass,
  Menu,
  Upload,
  X,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  noPadding?: boolean;
}

export function DashboardLayout({
  children,
  activeTab = "dashboard",
  noPadding = false,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const { notifications, markAsRead, markAllAsRead, loadNotifications } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const openProfileModal = () => {
    router.push("/profile");
  };

  const displayAvatar = getAvatarUrl(profile?.avatar_url);
  const displayName = profile?.name || user?.name || "Student";
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="h-screen flex flex-row overflow-hidden bg-[var(--background)]">
      <Sidebar
        activeTab={activeTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        openProfileModal={openProfileModal}
      />

      <div className="flex-1 flex flex-col relative z-10 min-w-0 bg-[var(--background)]/40">
        {/* Glow ambient meshes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-200/20 rounded-full filter blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-100/10 rounded-full filter blur-[120px]" />
        </div>

        <header className="h-14 sm:h-16 px-3 sm:px-5 lg:px-7 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-3xs relative z-30 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 pl-1">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden sm:inline">
                ExamForge Success Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-[-10px] sm:right-0 mt-2.5 w-[280px] xs:w-[320px] max-h-[420px] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-4.5 z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800">
                      Notifications ({unreadCount})
                    </span>
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-slate-450 hover:text-emerald-700 font-extrabold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            router.push("/dashboard/notifications");
                            setNotifOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                            n.read
                              ? "bg-slate-50/50 border-slate-100 text-slate-400"
                              : "bg-emerald-50 border-emerald-200 text-slate-800 font-bold"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-black text-[11px] text-slate-850 leading-tight">{n.message}</span>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1 shrink-0" />
                            )}
                          </div>
                          <p className="text-[9px] text-slate-400 mt-1 font-semibold">
                            {n.type} • {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="pt-1 border-t border-slate-100">
                    <Link
                      href="/dashboard/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="block text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-xs border border-emerald-500"
                    >
                      View All Notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={openProfileModal}
              className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-all p-1 pl-1.5 pr-2.5 rounded-full cursor-pointer"
            >
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-7 h-7 rounded-full border border-white object-cover shadow-3xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-[10px] uppercase border border-white shadow-3xs">
                  {displayName ? displayName.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <span className="text-xs font-black text-slate-800 hidden sm:inline">
                {displayName}
              </span>
            </button>
          </div>
        </header>

        <main
          className={`flex-1 ${
            noPadding ? "overflow-y-auto" : "p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 overflow-y-auto"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

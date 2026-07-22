"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
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
  const { user, logout, login } = useAuth();
  const { notifications, markNotificationRead, clearAllNotifications } = useGoalEngine();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const openProfileModal = () => {
    router.push("/profile");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="h-screen flex flex-row overflow-hidden bg-[var(--background)]">
      <Sidebar
        activeTab={activeTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        openProfileModal={openProfileModal}
      />

      <div className="flex-1 flex flex-col relative z-10 min-w-0 bg-slate-50/40">
        {/* Glow ambient meshes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-200/20 rounded-full filter blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-100/10 rounded-full filter blur-[120px]" />
        </div>

        <header className="h-16 px-5 lg:px-7 flex items-center justify-between bg-white/40 backdrop-blur-xl border-b border-[var(--border)] relative z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 pl-1">
              <Compass className="w-4 h-4 text-indigo-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] hidden sm:inline">
                ExamForge Success Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[320px] max-h-[420px] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">
                      Notifications ({unreadCount})
                    </span>
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs transition
                                      ${
                                        n.read
                                          ? "bg-white border-slate-100 text-slate-400"
                                          : "bg-indigo-50/40 border-indigo-100 text-slate-700"
                                      }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-[11px]">{n.title}</span>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                            {n.description}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={openProfileModal}
              className="flex items-center gap-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition p-1 pl-1.5 pr-2.5 rounded-full"
            >
              <img
                src={user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"}
                alt="avatar"
                className="w-7 h-7 rounded-full border border-white object-cover"
              />
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                {user?.name || "Student"}
              </span>
            </button>
          </div>
        </header>

        <main
          className={`flex-1 ${
            noPadding ? "overflow-hidden" : "p-4 md:p-6 space-y-5 overflow-y-auto"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { useAuth } from "@/lib/auth-context";
import { 
  LayoutDashboard, Compass, Sparkles, Bell, LogOut, 
  Menu, X, BookOpen, Clock, Heart, Award
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export function DashboardLayout({ children, activeTab = "dashboard", setActiveTab }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { notifications, markNotificationRead, clearAllNotifications, achievements } = useGoalEngine();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Background Dots Grid */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.25] pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-gray-150 shrink-0 relative z-20 transition-all duration-300 ease-in-out ${isCollapsed ? "w-20 px-3 py-6" : "w-64 p-6"}`}>
        <Link
          href="/"
          className={`flex items-center gap-2.5 mb-10 group transition-all duration-300 hover:scale-[1.02] ${isCollapsed ? "justify-center" : ""}`}
        >
          <img
            src="/favicon.ico"
            alt="ExamForge AI Logo"
            className="w-9 h-9 rounded-full animate-spin-slow object-cover border border-gray-150"
          />
          {!isCollapsed && (
            <span className="font-extrabold text-gray-900 tracking-tight text-lg uppercase">
              Exam Forge<span className="text-indigo-600"> AI</span>
            </span>
          )}
        </Link>

        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveTab?.("dashboard")}
            title="Success Dashboard"
            className={`flex items-center w-full rounded-2xl font-bold text-xs text-left transition-all ${isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-2.5"} ${
              activeTab === "dashboard"
                ? "bg-indigo-50/60 border border-indigo-100/50 text-indigo-600"
                : "text-gray-500 hover:bg-gray-50 border border-transparent"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> 
            {!isCollapsed && <span>Success Dashboard</span>}
          </button>
          <button
            onClick={() => setActiveTab?.("goal-plan")}
            title="Configure Goal Plan"
            className={`flex items-center w-full rounded-2xl font-bold text-xs text-left transition-all ${isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-2.5"} ${
              activeTab === "goal-plan"
                ? "bg-indigo-50/60 border border-indigo-100/50 text-indigo-600"
                : "text-gray-500 hover:bg-gray-50 border border-transparent"
            }`}
          >
            <Compass className="w-4 h-4" /> 
            {!isCollapsed && <span>Configure Goal Plan</span>}
          </button>
          <a
            href="#"
            title="Study Material"
            className={`flex items-center rounded-2xl text-gray-500 hover:bg-gray-50 font-bold text-xs ${isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-2.5"}`}
          >
            <BookOpen className="w-4 h-4" /> 
            {!isCollapsed && <span>Study Material</span>}
          </a>
          <a
            href="#"
            title="Achievements"
            className={`flex items-center rounded-2xl text-gray-500 hover:bg-gray-50 font-bold text-xs ${isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-2.5"}`}
          >
            <Award className="w-4 h-4" /> 
            {!isCollapsed && <span>Achievements</span>}
          </a>
        </nav>

        {/* Sidebar Achievements */}
        {!isCollapsed && (
          <div className="mt-8 border-t border-gray-100 pt-6 space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unlocked Achievements</label>
            <div className="space-y-2">
              {achievements.map((ach) => (
                <div 
                  key={ach.id} 
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                    ach.unlocked ? "bg-emerald-50/50 border-emerald-100" : "bg-gray-50 border-gray-100 opacity-60"
                  }`}
                >
                  <span className="text-lg">{ach.icon}</span>
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-800 leading-tight">{ach.title}</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Card */}
        <div className="border-t border-gray-100 pt-6 mt-auto">
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
            <img
              src={user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"}
              alt="Avatar"
              title={user?.name || "Student"}
              className="w-10 h-10 rounded-full border border-gray-200"
            />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.name || "Student"}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email || "student@examforge.ai"}</p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg"
                title="Sign Out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile Toggle overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex bg-black/40 backdrop-blur-xs">
          <aside className="w-64 bg-white p-6 flex flex-col h-full border-r border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="flex items-center gap-2 group transition-all duration-300 hover:scale-[1.02]"
              >
                <img
                  src="/favicon.ico"
                  alt="ExamForge AI Logo"
                  className="w-7 h-7 rounded-full object-cover border border-gray-150"
                />
                <span className="font-extrabold text-gray-950 text-sm uppercase">
                  Exam Forge<span className="text-indigo-600"> AI</span>
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-500 hover:bg-gray-50 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              <button
                onClick={() => {
                  setActiveTab?.("dashboard");
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl font-bold text-xs text-left transition-all ${
                  activeTab === "dashboard"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Success Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab?.("goal-plan");
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl font-bold text-xs text-left transition-all ${
                  activeTab === "goal-plan"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Compass className="w-4 h-4" /> Configure Goal Plan
              </button>
            </nav>

            <button
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="mt-auto flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-red-600 hover:bg-red-50 font-bold text-xs border border-transparent hover:border-red-100"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Navigation Header */}
        <header className="bg-white border-b border-gray-100 h-16 px-6 flex items-center justify-between relative z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-indigo-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:inline">ExamForge Success Center</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 max-h-[400px] overflow-y-auto rounded-3xl bg-white border border-gray-100 shadow-2xl p-4 space-y-3 z-50">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-xs font-bold text-gray-800">Notifications ({unreadCount})</span>
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-gray-400 hover:text-gray-600 font-semibold"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No notifications yet.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-3 rounded-2xl text-left text-xs transition-colors cursor-pointer border ${
                            notif.read 
                              ? "bg-white border-gray-50 text-gray-400" 
                              : "bg-indigo-50/40 border-indigo-50 text-gray-700"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-extrabold text-[11px]">{notif.title}</span>
                            {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1" />}
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{notif.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile widget */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 p-1.5 pr-3 rounded-2xl">
              <img
                src={user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"}
                alt="Avatar"
                className="w-7 h-7 rounded-full border border-gray-200"
              />
              <span className="text-xs font-bold text-gray-800 hidden sm:inline">{user?.name || "Student"}</span>
            </div>
          </div>
        </header>

        {/* Inner Content Grid */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  LayoutDashboard,
  Compass,
  ListTodo,
  Star,
  TrendingUp,
  Trophy,
  Bot,
  Bell,
  Calendar,
  User,
  LogOut,
  Camera,
  X,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { useAuth } from "@/lib/auth-context";

interface SidebarProps {
  activeTab: string;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  openProfileModal: () => void;
}

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home, color: "text-slate-500", glowColor: "rgba(100, 116, 139, 0.15)" },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-indigo-500", glowColor: "rgba(99, 102, 241, 0.15)" },
  { key: "knowledge", label: "Knowledge Engine", icon: BookOpen, color: "text-amber-605", glowColor: "rgba(217, 119, 6, 0.15)" },
  { key: "goal-plan", label: "Goal Plan", icon: Compass, color: "text-violet-500", glowColor: "rgba(139, 92, 246, 0.15)" },
  { key: "planner", label: "Planner", icon: ListTodo, color: "text-sky-500", glowColor: "rgba(14, 165, 233, 0.15)" },
  { key: "progress", label: "Progress", icon: Star, color: "text-amber-500", glowColor: "rgba(245, 158, 11, 0.15)" },
  { key: "analytics", label: "Analytics", icon: TrendingUp, color: "text-emerald-500", glowColor: "rgba(16, 185, 129, 0.15)" },
  { key: "achievements", label: "Achievements", icon: Trophy, color: "text-fuchsia-500", glowColor: "rgba(217, 70, 239, 0.15)" },
  { key: "coach", label: "AI Coach", icon: Bot, color: "text-indigo-500", glowColor: "rgba(99, 102, 241, 0.15)" },
  { key: "notifications", label: "Notifications", icon: Bell, color: "text-rose-500", glowColor: "rgba(244, 63, 94, 0.15)" },
  { key: "calendar", label: "Calendar", icon: Calendar, color: "text-cyan-500", glowColor: "rgba(6, 182, 212, 0.15)" },
];

const QUOTES = [
  "Consistency beats talent — keep showing up.",
  "Focus on progress, not perfection.",
  "Small daily wins compound into big results.",
  "Active recall locks knowledge into memory.",
  "Pomodoro breaks keep your mind fresh.",
];

function navigate(router: ReturnType<typeof useRouter>, tab: string, sub?: string) {
  if (tab === "home") return router.push("/");
  if (tab === "dashboard") return router.push("/dashboard");
  if (tab === "progress") return router.push("/dashboard/progress");
  if (tab === "analytics") return router.push("/dashboard/analytics");
  if (tab === "achievements") return router.push("/dashboard/achievements");
  if (tab === "coach") return router.push("/dashboard/coach");
  if (tab === "notifications") return router.push("/dashboard/notifications");
  
  if (tab === "knowledge" && sub) {
    return router.push(`/dashboard?tab=knowledge&sub=${sub}`);
  }
  return router.push(`/dashboard?tab=${tab}`);
}

export function Sidebar({
  activeTab,
  mobileOpen,
  setMobileOpen,
  openProfileModal,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? "w-[88px]" : "w-[280px]";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen z-30 transition-all duration-500 ease-in-out
                    bg-gradient-to-b from-white/90 via-slate-50/70 to-white/90 backdrop-blur-2xl 
                    border-r border-slate-200/60 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.03)]
                    ${sidebarWidth} ${isCollapsed ? "px-3 py-6" : "px-5 py-7"}`}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-white border border-slate-200 
                     flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300
                     shadow-sm hover:shadow transition-all duration-300 z-50 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Brand/Logo Area */}
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} mb-8 relative px-1`}>
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 blur-lg opacity-40 group-hover:opacity-75 transition-all duration-500" />
            <div className="relative w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105">
              <img
                src="/favicon.ico"
                alt="ExamForge"
                className="w-7 h-7 object-contain"
              />
            </div>
          </div>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="leading-tight flex-1"
            >
              <h1 className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-1">
                <span>Exam</span>
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Forge</span>
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                AI Study
              </p>
            </motion.div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
          {NAV_ITEMS.map(({ key, label, icon: Icon, color, glowColor }) => {
            const active = activeTab === key;
            const isHovered = hoveredItem === key;
            return (
              <button
                key={key}
                onClick={() => navigate(router, key)}
                onMouseEnter={() => setHoveredItem(key)}
                onMouseLeave={() => setHoveredItem(null)}
                title={isCollapsed ? label : undefined}
                className={`group relative flex w-full items-center rounded-2xl text-[13px] font-extrabold
                            transition-all duration-300 cursor-pointer overflow-hidden
                            ${isCollapsed ? "justify-center h-12" : "gap-3.5 h-11 px-4"}
                            ${active
                    ? "text-indigo-650 bg-indigo-50/50 border border-indigo-150/40 shadow-[0_4px_16px_-6px_rgba(79,70,229,0.15)]"
                    : "text-slate-500 hover:text-slate-900 border border-transparent hover:bg-slate-100/40"
                  }`}
              >
                {/* Active glow backing */}
                {active && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-violet-50/20 -z-10 rounded-2xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Left Active Line indicator */}
                {active && (
                  <motion.span
                    layoutId="activeBar"
                    className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-gradient-to-b from-indigo-600 to-violet-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <div
                  className={`relative p-1.5 rounded-xl transition-all duration-300 
                             ${active ? "bg-white text-indigo-600 shadow-sm" : "group-hover:bg-white group-hover:shadow-sm"}`}
                  style={{
                    boxShadow: (active || isHovered) ? `0 4px 12px ${glowColor}` : undefined
                  }}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 transition-transform duration-300 group-hover:scale-110 ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-700"}`} />
                </div>

                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {label}
                  </motion.span>
                )}
              </button>
            );
          })}

          <div className="h-px bg-slate-200/50 my-3 mx-2" />

          {/* Profile Item */}
          <Link
            href="/profile"
            title={isCollapsed ? "Profile" : undefined}
            onMouseEnter={() => setHoveredItem("profile")}
            onMouseLeave={() => setHoveredItem(null)}
            className={`group relative flex items-center rounded-2xl text-[13px] font-extrabold
                        transition-all duration-300 cursor-pointer overflow-hidden
                        ${isCollapsed ? "justify-center h-12" : "gap-3.5 h-11 px-4"}
                        ${pathname?.startsWith("/profile")
                ? "text-indigo-655 bg-indigo-50/50 border border-indigo-150/40 shadow-[0_4px_16px_-6px_rgba(79,70,229,0.15)]"
                : "text-slate-500 hover:text-slate-900 border border-transparent hover:bg-slate-100/40"
              }`}
          >
            {pathname?.startsWith("/profile") && (
              <motion.span
                layoutId="activeBar"
                className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-gradient-to-b from-indigo-600 to-violet-600"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${pathname?.startsWith("/profile") || hoveredItem === "profile" ? "bg-white text-indigo-600 shadow-sm" : "group-hover:bg-white group-hover:shadow-sm"}`}>
              <User className="w-[18px] h-[18px] shrink-0 text-slate-400 group-hover:text-slate-700" />
            </div>
            {!isCollapsed && <span>Profile</span>}
          </Link>
        </nav>

        {/* Coach / Dynamic Quote Card */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-slate-200/50"
          >
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 p-4 shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-400/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-indigo-600 tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span>Daily Coach</span>
              </div>
              <p className="mt-2.5 min-h-[38px] text-[11px] font-bold text-slate-600 leading-relaxed italic">
                "{QUOTES[quoteIdx]}"
              </p>
              <div className="mt-3 flex justify-center gap-1.5">
                {QUOTES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === quoteIdx ? "w-5 bg-indigo-500" : "w-1.5 bg-slate-200"
                      }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* User profile footer */}
        <div className="mt-4 pt-4 border-t border-slate-250/40">
          <div className={`flex items-center gap-3 ${isCollapsed ? "flex-col justify-center" : ""}`}>
            <button
              onClick={openProfileModal}
              title="Edit profile"
              className="relative shrink-0 group cursor-pointer"
            >
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm scale-95 group-hover:scale-100" />
              <img
                src={user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"}
                alt="avatar"
                className="relative w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="w-3.5 h-3.5 text-white" />
              </span>
            </button>

            {!isCollapsed ? (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[12px] font-black text-slate-800 truncate hover:text-indigo-600 transition cursor-pointer" onClick={openProfileModal}>
                    {user?.name || "Student User"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user?.email || "student@examforge.ai"}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-300 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 transition-all duration-300 cursor-pointer mt-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Collapsible) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-md"
            />

            {/* Sidebar content */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-[300px] h-full bg-white border-r border-slate-100 flex flex-col p-6 shadow-2xl z-10"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-md">
                    <img
                      src="/favicon.ico"
                      alt="ExamForge"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <h1 className="font-extrabold text-base tracking-tight text-slate-900">
                    Exam<span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">Forge</span>
                  </h1>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
                {NAV_ITEMS.map(({ key, label, icon: Icon, color }) => {
                  const active = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        navigate(router, key);
                        setMobileOpen(false);
                      }}
                      className={`flex items-center gap-3.5 w-full h-11 px-4 rounded-2xl text-[13px] font-extrabold transition-all cursor-pointer
                                  ${active
                          ? "text-indigo-650 bg-indigo-50/50 border border-indigo-150/40 shadow-sm"
                          : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      <div className={`p-1.5 rounded-xl ${active ? "bg-white text-indigo-650 shadow-sm" : ""}`}>
                        <Icon className={`w-[18px] h-[18px] ${active ? "text-indigo-600" : "text-slate-400"}`} />
                      </div>
                      {label}
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-black text-slate-800 truncate">
                      {user?.name || "Student User"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {user?.email || "student@examforge.ai"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl text-rose-500 hover:bg-rose-50 text-[12.5px] font-extrabold border border-rose-100 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { useAuth } from "@/lib/auth-context";

const {
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
} = LucideIcons;

interface SidebarProps {
  activeTab: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  openProfileModal: () => void;
}

const NAV_ITEMS: { key: string; label: string; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
  { key: "home", label: "Home", icon: Home, tone: "text-slate-500" },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, tone: "text-indigo-500" },
  { key: "goal-plan", label: "Goal Plan", icon: Compass, tone: "text-violet-500" },
  { key: "planner", label: "Planner", icon: ListTodo, tone: "text-sky-500" },
  { key: "progress", label: "Progress", icon: Star, tone: "text-amber-500" },
  { key: "analytics", label: "Analytics", icon: TrendingUp, tone: "text-emerald-500" },
  { key: "achievements", label: "Achievements", icon: Trophy, tone: "text-fuchsia-500" },
  { key: "coach", label: "AI Coach", icon: Bot, tone: "text-indigo-500" },
  { key: "notifications", label: "Notifications", icon: Bell, tone: "text-emerald-500" },
  { key: "calendar", label: "Calendar", icon: Calendar, tone: "text-rose-500" },
];

const QUOTES = [
  "Consistency beats talent — keep showing up.",
  "Focus on progress, not perfection.",
  "Small daily wins compound into big results.",
  "Active recall locks knowledge into memory.",
  "Pomodoro breaks keep your mind fresh.",
];

function navigate(router: ReturnType<typeof useRouter>, tab: string) {
  if (tab === "home") return router.push("/");
  if (tab === "dashboard") return router.push("/dashboard");
  if (tab === "progress") return router.push("/dashboard/progress");
  if (tab === "analytics") return router.push("/dashboard/analytics");
  if (tab === "achievements") return router.push("/dashboard/achievements");
  if (tab === "coach") return router.push("/dashboard/coach");
  if (tab === "notifications") return router.push("/dashboard/notifications");
  return router.push(`/dashboard?tab=${tab}`);
}

export function Sidebar({
  activeTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  openProfileModal,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const { achievements } = useGoalEngine();
  const router = useRouter();
  const pathname = usePathname();
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const width = isCollapsed ? "w-[78px]" : "w-[264px]";

  return (
    <>
      {/* Desktop — full-view sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen z-20 transition-[width] duration-300 ease-out
                    bg-white/70 backdrop-blur-xl border-r border-[var(--border)] shadow-sm
                    ${width} ${isCollapsed ? "px-3 py-5" : "px-4 py-6"}`}
      >
        {/* Brand */}
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5"} mb-7`}>
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] blur-md opacity-40 animate-pulse-subtle" />
            <img
              src="/favicon.ico"
              alt="ExamForge"
              className="relative w-9 h-9 rounded-xl object-cover border border-white shadow-sm transition-transform duration-300 hover:scale-110"
            />
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <p className="font-black text-[16px] tracking-tight text-slate-900">
                Exam<span className="gradient-text-animated">Forge</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                AI Study
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1 -mr-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon, tone }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => navigate(router, key)}
                title={label}
                className={`group relative flex w-full items-center rounded-xl text-[12.5px] font-bold
                            transition-all duration-200 cursor-pointer
                            ${isCollapsed ? "justify-center h-11" : "gap-3 h-10 px-3"}
                            ${
                              active
                                ? "bg-gradient-to-r from-[var(--primary-soft)] via-[var(--primary-soft)] to-[var(--accent-soft)] text-[var(--primary)] border border-[var(--primary)]/10 shadow-[0_4px_12px_-4px_rgba(90,54,238,0.18)] scale-[1.02]"
                                : "text-slate-500 hover:text-[var(--primary)] hover:bg-[var(--surface-soft)] hover:scale-[1.01] border border-transparent"
                            }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-gradient-to-b from-[var(--primary)] to-[var(--accent)]" />
                )}
                <Icon className={`w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-110 duration-200 ${active ? "text-[var(--primary)]" : tone}`} />
                {!isCollapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })}

          <Link
            href="/profile"
            title="Profile"
            className={`group flex items-center rounded-xl text-[12.5px] font-bold
                        transition-all duration-200 cursor-pointer
                        ${isCollapsed ? "justify-center h-11" : "gap-3 h-10 px-3"}
                        ${
                          pathname?.startsWith("/profile")
                            ? "bg-gradient-to-r from-[var(--primary-soft)] via-[var(--primary-soft)] to-[var(--accent-soft)] text-[var(--primary)] border border-[var(--primary)]/10 shadow-[0_4px_12px_-4px_rgba(90,54,238,0.18)] scale-[1.02]"
                            : "text-slate-500 hover:text-[var(--primary)] hover:bg-[var(--surface-soft)] hover:scale-[1.01] border border-transparent"
                        }`}
          >
            <User className="w-[18px] h-[18px] shrink-0 text-slate-500 transition-transform group-hover:scale-110 duration-200" />
            {!isCollapsed && <span>Profile</span>}
          </Link>
        </nav>

        {/* Achievements teaser */}
        {/* <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
          {!isCollapsed ? (
            <>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-2 flex items-center gap-1.5">
                <Trophy className="w-3 h-3 text-amber-500" /> Unlocked
              </p>
              <div className="space-y-1.5">
                {achievements.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 border transition-all duration-300 hover:translate-x-0.5
                                ${
                                  a.unlocked
                                    ? "bg-emerald-50/60 border-emerald-100/80 shadow-sm"
                                    : "bg-slate-50 border-slate-100 opacity-55"
                                }`}
                  >
                    <span className="text-base leading-none">
                      {(() => {
                        const Icon = (LucideIcons as any)[a.icon] || LucideIcons.Award;
                        return <Icon className="w-4.5 h-4.5 text-emerald-650" />;
                      })()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-bold text-slate-800 truncate leading-tight">
                        {a.title}
                      </p>
                      <p className="text-[9px] text-slate-500 truncate leading-tight">
                        {a.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              {achievements.slice(0, 3).map((a) => {
                const Icon = (LucideIcons as any)[a.icon] || LucideIcons.Award;
                return (
                  <div
                    key={a.id}
                    title={`${a.title} — ${a.description}`}
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center text-sm transition-transform duration-300 hover:scale-105
                                ${
                                  a.unlocked
                                    ? "bg-emerald-50/80 border-emerald-200"
                                    : "bg-slate-50 border-slate-200 opacity-50"
                                }`}
                  >
                    <Icon className={`w-4 h-4 ${a.unlocked ? "text-emerald-650" : "text-gray-450"}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div> */}

        {/* Daily quote */}
        {!isCollapsed && (
          <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
            <div className="relative overflow-hidden rounded-xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50/40 via-white to-fuchsia-50/30 p-3 shadow-xs">
              <p className="flex items-center gap-1.5 text-[8.5px] font-black uppercase text-indigo-500 tracking-[0.2em]">
                <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" /> Daily Coach
              </p>
              <p className="mt-1.5 min-h-[36px] text-[10.5px] font-semibold text-slate-600 leading-snug">
                {QUOTES[quoteIdx]}
              </p>
              <div className="mt-2 flex justify-center gap-1">
                {QUOTES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-full transition-all ${
                      i === quoteIdx ? "w-4 bg-indigo-500" : "w-1 bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User card */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div
            className={`flex items-center gap-2.5 ${isCollapsed ? "flex-col" : ""}`}
          >
            <button
              onClick={openProfileModal}
              title="Edit profile"
              className="relative shrink-0 group"
            >
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] opacity-60 group-hover:opacity-100 transition animate-pulse-subtle" />
              <img
                src={user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"}
                alt="avatar"
                className="relative w-9 h-9 rounded-full object-cover border-2 border-white"
              />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition">
                <Camera className="w-3.5 h-3.5 text-white" />
              </span>
            </button>

            {!isCollapsed ? (
              <>
                <button
                  onClick={openProfileModal}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="text-[12px] font-bold text-slate-900 truncate hover:text-[var(--primary)] transition">
                    {user?.name || "Student"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {user?.email || "student@examforge.ai"}
                  </p>
                </button>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex bg-slate-900/55 backdrop-blur-sm">
          <aside className="w-[280px] h-full bg-white border-r border-slate-200 flex flex-col p-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <img
                  src="/favicon.ico"
                  alt="ExamForge"
                  className="w-8 h-8 rounded-xl border border-white shadow-sm"
                />
                <p className="font-black text-sm tracking-tight text-slate-900">
                  Exam<span className="gradient-text-animated">Forge</span>
                </p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map(({ key, label, icon: Icon, tone }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      navigate(router, key);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full h-10 px-3 rounded-xl text-[12.5px] font-bold
                                ${active
                                  ? "bg-gradient-to-r from-[var(--primary-soft)] via-[var(--primary-soft)] to-[var(--accent-soft)] text-[var(--primary)] border border-[var(--primary)]/10 shadow-sm"
                                  : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    <Icon className={`w-[18px] h-[18px] ${active ? "text-[var(--primary)]" : tone}`} />
                    {label}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="mt-4 flex items-center gap-3 w-full h-10 px-3 rounded-xl text-rose-500 hover:bg-rose-50 text-[12.5px] font-bold border border-rose-100"
            >
              <LogOut className="w-[18px] h-[18px]" /> Sign Out
            </button>
          </aside>
        </div>
      )}
    </>
  );
}

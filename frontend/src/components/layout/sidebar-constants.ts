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
  Sparkles,
  BookOpen,
} from "lucide-react";

export const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home, gradient: "from-slate-600 to-slate-800", textClass: "text-slate-700", bgLight: "bg-slate-200/50 text-slate-900 border-slate-200/50", glow: "rgba(148, 163, 184, 0.45)" },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, gradient: "from-[#6D4AFF] to-indigo-600", textClass: "text-[#6D4AFF]", bgLight: "bg-indigo-100/50 text-indigo-950 border-indigo-200/30", glow: "rgba(109, 74, 255, 0.45)" },
  { key: "ai", label: "AI Study", icon: Sparkles, gradient: "from-purple-500 to-pink-500", textClass: "text-purple-600", bgLight: "bg-purple-100/50 text-purple-955 border-purple-200/30", glow: "rgba(168, 85, 247, 0.45)" },
  { key: "knowledge", label: "AI Library", icon: BookOpen, gradient: "from-amber-500 to-orange-500", textClass: "text-amber-600", bgLight: "bg-amber-100/50 text-amber-955 border-amber-200/30", glow: "rgba(245, 158, 11, 0.45)" },
  { key: "goal-plan", label: "Goal", icon: Compass, gradient: "from-violet-500 to-fuchsia-600", textClass: "text-violet-600", bgLight: "bg-violet-100/50 text-violet-955 border-violet-200/30", glow: "rgba(139, 92, 246, 0.45)" },
  { key: "planner", label: "Planner", icon: ListTodo, gradient: "from-sky-500 to-blue-600", textClass: "text-sky-600", bgLight: "bg-sky-100/50 text-sky-955 border-sky-200/30", glow: "rgba(14, 165, 233, 0.45)" },
  { key: "progress", label: "Progress", icon: Star, gradient: "from-yellow-400 to-amber-500", textClass: "text-amber-600", bgLight: "bg-amber-100/50 text-amber-955 border-amber-200/30", glow: "rgba(245, 158, 11, 0.45)" },
  { key: "analytics", label: "Analytics", icon: TrendingUp, gradient: "from-emerald-400 to-teal-600", textClass: "text-emerald-600", bgLight: "bg-emerald-100/50 text-emerald-955 border-emerald-200/30", glow: "rgba(16, 185, 129, 0.45)" },
  { key: "achievements", label: "Achievements", icon: Trophy, gradient: "from-fuchsia-500 to-rose-600", textClass: "text-fuchsia-600", bgLight: "bg-fuchsia-100/50 text-fuchsia-955 border-fuchsia-200/30", glow: "rgba(217, 70, 239, 0.45)" },
  { key: "coach", label: "AI Mentor", icon: Bot, gradient: "from-indigo-500 to-blue-600", textClass: "text-indigo-600", bgLight: "bg-indigo-100/50 text-indigo-955 border-indigo-200/30", glow: "rgba(99, 102, 241, 0.45)" },
  { key: "notifications", label: "Notifications", icon: Bell, gradient: "from-rose-500 to-red-600", textClass: "text-rose-600", bgLight: "bg-rose-100/50 text-rose-955 border-rose-200/30", glow: "rgba(244, 63, 94, 0.45)" },
  { key: "calendar", label: "Target", icon: Calendar, gradient: "from-cyan-500 to-teal-500", textClass: "text-cyan-600", bgLight: "bg-cyan-100/50 text-cyan-955 border-cyan-200/30", glow: "rgba(6, 182, 212, 0.45)" },
];

export const QUOTES = [
  "Consistency beats talent — keep showing up.",
  "Focus on progress, not perfection.",
  "Small daily wins compound into big results.",
  "Active recall locks knowledge into memory.",
  "Pomodoro breaks keep your mind fresh.",
];

export const COACH_TEMPLATES = [
  {
    gradient: "from-indigo-50/90 via-purple-50/60 to-white",
    border: "border-indigo-100/90",
    glow: "bg-[#6D4AFF]/10",
    accent: "text-[#6D4AFF]",
    badge: "bg-[#6D4AFF]/10 text-[#6D4AFF]",
    text: "text-slate-800"
  },
  {
    gradient: "from-emerald-50/90 via-teal-50/60 to-white",
    border: "border-emerald-100/90",
    glow: "bg-emerald-500/10",
    accent: "text-emerald-600",
    badge: "bg-emerald-500/10 text-emerald-700",
    text: "text-slate-800"
  },
  {
    gradient: "from-amber-50/90 via-orange-50/60 to-white",
    border: "border-amber-100/90",
    glow: "bg-amber-500/10",
    accent: "text-amber-600",
    badge: "bg-amber-500/10 text-amber-700",
    text: "text-slate-800"
  },
  {
    gradient: "from-sky-50/90 via-blue-50/60 to-white",
    border: "border-sky-100/90",
    glow: "bg-sky-500/10",
    accent: "text-sky-600",
    badge: "bg-sky-500/10 text-sky-700",
    text: "text-slate-800"
  },
  {
    gradient: "from-rose-50/90 via-pink-50/60 to-white",
    border: "border-rose-100/90",
    glow: "bg-rose-500/10",
    accent: "text-rose-600",
    badge: "bg-rose-500/10 text-rose-700",
    text: "text-slate-800"
  }
];

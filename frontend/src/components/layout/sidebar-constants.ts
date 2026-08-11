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
  { key: "home", label: "Home", icon: Home, gradient: "from-emerald-400 to-teal-500", textClass: "text-emerald-700", bgLight: "bg-emerald-100/70 text-emerald-950 border-emerald-300/40", glow: "rgba(16, 185, 129, 0.45)" },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, gradient: "from-emerald-400 to-teal-500", textClass: "text-emerald-700", bgLight: "bg-emerald-50 text-emerald-950 border-emerald-200/60", glow: "rgba(16, 185, 129, 0.4)" },
  { key: "ai", label: "AI Study", icon: Sparkles, gradient: "from-purple-500 to-pink-500", textClass: "text-purple-700", bgLight: "bg-purple-100/70 text-purple-955 border-purple-300/40", glow: "rgba(168, 85, 247, 0.45)" },
  { key: "ai-sources", label: "AI Library", icon: BookOpen, gradient: "from-amber-400 to-yellow-500", textClass: "text-amber-700", bgLight: "bg-amber-100/80 text-amber-950 border-amber-300/50", glow: "rgba(245, 158, 11, 0.45)" },
  { key: "goal-plan", label: "Goal", icon: Compass, gradient: "from-emerald-400 to-teal-500", textClass: "text-emerald-700", bgLight: "bg-emerald-50 text-emerald-955 border-emerald-200/60", glow: "rgba(16, 185, 129, 0.4)" },
  { key: "planner", label: "Planner", icon: ListTodo, gradient: "from-sky-400 to-blue-500", textClass: "text-sky-700", bgLight: "bg-sky-100/70 text-sky-950 border-sky-300/40", glow: "rgba(14, 165, 233, 0.45)" },
  { key: "progress", label: "Progress", icon: Star, gradient: "from-yellow-400 to-amber-500", textClass: "text-yellow-800", bgLight: "bg-yellow-100/80 text-yellow-950 border-yellow-300/50", glow: "rgba(234, 179, 8, 0.45)" },
  { key: "analytics", label: "Analytics", icon: TrendingUp, gradient: "from-emerald-400 to-lime-500", textClass: "text-emerald-800", bgLight: "bg-emerald-100/70 text-emerald-955 border-emerald-300/50", glow: "rgba(34, 197, 94, 0.45)" },
  { key: "achievements", label: "Achievements", icon: Trophy, gradient: "from-fuchsia-500 to-rose-500", textClass: "text-fuchsia-700", bgLight: "bg-fuchsia-100/70 text-fuchsia-955 border-fuchsia-300/40", glow: "rgba(217, 70, 239, 0.45)" },
  // { key: "coach", label: "AI Mentor", icon: Bot, gradient: "from-emerald-400 to-teal-555", textClass: "text-emerald-700", bgLight: "bg-emerald-50 text-emerald-955 border-emerald-250", glow: "rgba(16, 185, 129, 0.4)" },
  { key: "notifications", label: "Notifications", icon: Bell, gradient: "from-rose-500 to-red-500", textClass: "text-rose-700", bgLight: "bg-rose-100/70 text-rose-955 border-rose-300/40", glow: "rgba(244, 63, 94, 0.45)" },
  { key: "calendar", label: "Target", icon: Calendar, gradient: "from-lime-400 to-teal-500", textClass: "text-lime-800", bgLight: "bg-lime-100/70 text-lime-955 border-lime-300/50", glow: "rgba(132, 204, 22, 0.45)" },
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
    gradient: "from-emerald-50/90 via-teal-50/60 to-white",
    border: "border-emerald-100/90",
    glow: "bg-emerald-600/10",
    accent: "text-emerald-700",
    badge: "bg-emerald-600/10 text-emerald-750",
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

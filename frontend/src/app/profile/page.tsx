"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const ThreeHero = dynamic(() => import("../../components/three/ThreeHero"), {
  ssr: false,
});
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Edit3,
  Share2,
  Sparkles,
  Mic,
  CalendarClock,
  TrendingUp,
  Zap,
  Coins,
  Flame,
  Target,
  Brain,
  BookOpen,
  Clock,
  Award,
  Trophy,
  Star,
  Crown,
  Shield,
  Lock,
  Smartphone,
  Eye,
  CreditCard,
  HardDrive,
  ArrowUpRight,
  X,
  Phone,
  GraduationCap,
  Briefcase,
  Globe,
  FileText,
  Save,
  ChevronRight,
  Loader2,
  BadgeCheck,
  Gem,
  MessageSquare,
  Sun,
  Sunset,
  Moon,
  CircleDot,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ─── Types ───────────────────────────────────────────────────────────────
interface ProfileData {
  name: string;
  email: string;
  member_since: string;
  phone: string;
  dob: string;
  gender: string;
  location: string;
  timezone: string;
  education: string;
  college: string;
  occupation: string;
  bio: string;
  avatar_url: string;
  xp: number;
  coins: number;
  level: number;
  streak: number;
  target_exam: string;
  secondary_exam: string;
  target_score: number;
  target_rank: number;
  target_date: string;
  study_hours_goal: number;
  weak_subjects: string[];
  strong_subjects: string[];
  favorite_subjects: string[];
  accuracy: number;
  mock_average: number;
  questions_solved: number;
  study_hours_total: number;
  completion_pct: number;
  bookmarks_count: number;
  certificates_count: number;
  social_links: Record<string, string>;
  achievements: string[];
  connected_devices: string[];
  notification_settings: Record<string, boolean>;
  privacy_settings: Record<string, boolean>;
  security_score: number;
  plan: string;
  plan_renewal: string;
  ai_credits: number;
  storage_used_mb: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function getGreeting(): { text: string; icon: typeof Sun } {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good Morning", icon: Sun };
  if (h < 17) return { text: "Good Afternoon", icon: Sunset };
  return { text: "Good Evening", icon: Moon };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(d: string): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

// ─── Animated Counter ────────────────────────────────────────────────────
function useAnimatedCounter(end: number, duration = 1200): number {
  const [count, setCount] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    let start = 0;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * end);
      setCount(start);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}

// ─── Card Wrapper ────────────────────────────────────────────────────────
function GlassCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-white/80 backdrop-blur-xl border border-[#E9ECF8] rounded-3xl shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ─── KPI Stat Card ───────────────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  color,
  delay,
}: {
  icon: typeof Zap;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  delay: number;
}) {
  const animatedValue = useAnimatedCounter(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="bg-white/80 backdrop-blur-xl border border-[#E9ECF8] rounded-3xl p-5 shadow-sm cursor-default group transition-shadow hover:shadow-md hover:shadow-[#6D5DFB]/5"
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}14` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-[13px] font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
        {animatedValue.toLocaleString()}
        {suffix && (
          <span className="text-sm font-semibold text-gray-400 ml-0.5">
            {suffix}
          </span>
        )}
      </p>
    </motion.div>
  );
}

// ─── SVG Circular Progress ──────────────────────────────────────────────
function CircularProgress({
  pct,
  size = 140,
  strokeWidth = 10,
}: {
  pct: number;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E9ECF8"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#progressGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6D5DFB" />
            <stop offset="100%" stopColor="#4F8CFF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-gray-900">{pct}%</span>
        <span className="text-[11px] font-medium text-gray-400">Complete</span>
      </div>
    </div>
  );
}

// ─── Tag Pill ────────────────────────────────────────────────────────────
function TagPill({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: `${color}14`,
        color: color,
      }}
    >
      {text}
    </span>
  );
}

// ─── Achievement Badge ───────────────────────────────────────────────────
const achievementMeta: Record<
  string,
  { icon: typeof Trophy; gradient: string; glow: string }
> = {
  "Top Performer": {
    icon: Trophy,
    gradient: "from-amber-400 to-orange-500",
    glow: "rgba(245,158,11,0.25)",
  },
  "Mock Master": {
    icon: Target,
    gradient: "from-blue-400 to-indigo-500",
    glow: "rgba(79,140,255,0.25)",
  },
  "Consistency King": {
    icon: Crown,
    gradient: "from-purple-400 to-violet-500",
    glow: "rgba(155,92,255,0.25)",
  },
  "Early Bird": {
    icon: Sun,
    gradient: "from-yellow-300 to-amber-400",
    glow: "rgba(250,204,21,0.25)",
  },
  "Elite Learner": {
    icon: GraduationCap,
    gradient: "from-emerald-400 to-teal-500",
    glow: "rgba(34,197,94,0.25)",
  },
};

function AchievementBadge({ title }: { title: string }) {
  const meta = achievementMeta[title] || {
    icon: Star,
    gradient: "from-gray-400 to-gray-500",
    glow: "rgba(100,100,100,0.2)",
  };
  const Icon = meta.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      className="flex-shrink-0 w-[140px] flex flex-col items-center gap-3 p-5 rounded-3xl bg-white/90 border border-[#E9ECF8] cursor-default transition-shadow"
      style={{
        boxShadow: `0 0 0 0 transparent`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 8px 32px ${meta.glow}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 transparent`;
      }}
    >
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-lg`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <p className="text-xs font-bold text-gray-700 text-center leading-tight">
        {title}
      </p>
    </motion.div>
  );
}

// ─── Heatmap Cell ────────────────────────────────────────────────────────
function HeatmapCell({ level }: { level: number }) {
  const colors = [
    "#EBEDF0",
    "#D6CBFF",
    "#B09EFF",
    "#8A75FF",
    "#6D5DFB",
  ];
  return (
    <motion.div
      whileHover={{ scale: 1.3 }}
      className="w-6 h-6 rounded-md cursor-default transition-colors"
      style={{ backgroundColor: colors[level] || colors[0] }}
      title={`Activity level: ${level}`}
    />
  );
}

// ─── Field Input ─────────────────────────────────────────────────────────
function FieldRow({
  icon: Icon,
  label,
  value,
  editing,
  name,
  onChange,
  type = "text",
}: {
  icon: typeof User;
  label: string;
  value: string;
  editing: boolean;
  name: string;
  onChange: (name: string, val: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full h-11 px-4 rounded-xl border border-[#E9ECF8] bg-white text-sm font-medium text-gray-900 outline-none focus:border-[#6D5DFB] focus:ring-2 focus:ring-[#6D5DFB]/10 transition-all"
        />
      ) : (
        <p className="h-11 flex items-center px-4 rounded-xl bg-[#F4F5FA] text-sm font-medium text-gray-700">
          {value || "—"}
        </p>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// ─── MAIN PAGE ───────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // ── State ──
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingExam, setEditingExam] = useState(false);

  // Editable form fields
  const [formPersonal, setFormPersonal] = useState({
    name: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    location: "",
    timezone: "",
    education: "",
    college: "",
    occupation: "",
    bio: "",
  });

  const [formExam, setFormExam] = useState({
    target_exam: "",
    secondary_exam: "",
    target_score: "",
    target_rank: "",
    target_date: "",
    study_hours_goal: "",
  });

  // ── Auth guard ──
  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  // ── Fetch profile ──
  const fetchProfile = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(
        `${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`
      );
      const data = await res.json();
      if (data.success && data.profile) {
        const p = data.profile as ProfileData;
        setProfile(p);
        setFormPersonal({
          name: p.name || "",
          dob: p.dob || "",
          gender: p.gender || "",
          email: p.email || "",
          phone: p.phone || "",
          location: p.location || "",
          timezone: p.timezone || "",
          education: p.education || "",
          college: p.college || "",
          occupation: p.occupation || "",
          bio: p.bio || "",
        });
        setFormExam({
          target_exam: p.target_exam || "",
          secondary_exam: p.secondary_exam || "",
          target_score: String(p.target_score || ""),
          target_rank: String(p.target_rank || ""),
          target_date: p.target_date || "",
          study_hours_goal: String(p.study_hours_goal || ""),
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Save handlers ──
  const savePersonal = async () => {
    if (!user?.email) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formPersonal),
        }
      );
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
      setEditingPersonal(false);
    } catch (err) {
      console.error("Failed to save personal info:", err);
    } finally {
      setSaving(false);
    }
  };

  const saveExam = async () => {
    if (!user?.email) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target_exam: formExam.target_exam,
            secondary_exam: formExam.secondary_exam,
            target_score: Number(formExam.target_score) || 0,
            target_rank: Number(formExam.target_rank) || 0,
            target_date: formExam.target_date,
            study_hours_goal: Number(formExam.study_hours_goal) || 0,
          }),
        }
      );
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
      setEditingExam(false);
    } catch (err) {
      console.error("Failed to save exam prefs:", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePersonalChange = (name: string, val: string) => {
    setFormPersonal((prev) => ({ ...prev, [name]: val }));
  };

  const handleExamChange = (name: string, val: string) => {
    setFormExam((prev) => ({ ...prev, [name]: val }));
  };

  // ── Loading / Auth check ──
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFBFF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6D5DFB] animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFF] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-[#6D5DFB]" />
        </motion.div>
        <p className="text-sm font-semibold text-gray-400">
          Loading your profile...
        </p>
      </div>
    );
  }

  const p = profile;
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const displayName = p?.name || user.name || "Student";

  // Study heatmap data (generated from mock weekly data)
  const heatmapData: number[][] = [];
  for (let week = 0; week < 4; week++) {
    const row: number[] = [];
    for (let day = 0; day < 7; day++) {
      row.push(Math.floor(Math.random() * 5));
    }
    heatmapData.push(row);
  }

  const weeklyBarData = [65, 78, 52, 90, 44, 85, 72];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxBar = Math.max(...weeklyBarData);

  // ═══════════════════════════════════════════════════════════════════════
  return (
    <main className="min-h-screen bg-[#FAFBFF] font-[var(--font-inter)]">
      {/* Subtle background decorations with Three.js 3D Neural Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 opacity-[0.25]">
          <ThreeHero />
        </div>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#6D5DFB]/5 to-[#4F8CFF]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#9B5CFF]/5 to-[#6D5DFB]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-5 md:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
        {/* ─── Breadcrumb ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400"
        >
          <button
            onClick={() => router.push("/")}
            className="hover:text-[#6D5DFB] transition-colors cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">Profile</span>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            1. PROFILE HERO CARD
        ═══════════════════════════════════════════════════════ */}
        <GlassCard className="p-8 md:p-10" delay={0.05}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex-shrink-0"
            >
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#6D5DFB] to-[#4F8CFF] flex items-center justify-center shadow-xl shadow-[#6D5DFB]/20">
                <span className="text-3xl font-extrabold text-white">
                  {getInitials(displayName)}
                </span>
              </div>
              {/* Online dot */}
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#22C55E] border-[3px] border-white" />
            </motion.div>

            {/* Info */}
            <div className="flex-1 flex flex-col items-center md:items-start gap-3 text-center md:text-left">
              <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
                <h1 className="text-3xl font-bold text-gray-900">
                  {displayName}
                </h1>
                {/* Premium badge */}
                {p?.plan && p.plan !== "Free" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#6D5DFB] to-[#9B5CFF] text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                    <Gem className="w-3 h-3" />
                    {p.plan}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#4F8CFF]" />
                  {p?.email || user.email}
                </span>
                {p?.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#EF4444]" />
                    {p.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#9B5CFF]" />
                  Joined {formatDate(p?.member_since || "")}
                </span>
              </div>

              {p?.bio && (
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl mt-1">
                  {p.bio}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setEditingPersonal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF] text-white text-sm font-bold shadow-md shadow-[#6D5DFB]/20 hover:shadow-lg hover:shadow-[#6D5DFB]/30 transition-shadow cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-[#E9ECF8] text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Share Profile
                </motion.button>
              </div>
            </div>

            {/* Student ID chip (desktop) */}
            <div className="hidden lg:flex flex-col items-end gap-2">
              <div className="px-4 py-2 rounded-2xl bg-[#F4F5FA] text-xs font-bold text-gray-500">
                Student ID:&nbsp;
                <span className="text-gray-800">
                  EF-{(p?.email || "").slice(0, 4).toUpperCase()}
                  {String(p?.xp || 0).slice(-4)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#22C55E]">
                <CircleDot className="w-3 h-3" />
                Online Now
              </div>
            </div>
          </div>
        </GlassCard>

        {/* ═══════════════════════════════════════════════════════
            2. AI PROFILE INSIGHTS CARD
        ═══════════════════════════════════════════════════════ */}
        <GlassCard
          className="p-8 md:p-10 relative overflow-hidden"
          delay={0.1}
        >
          {/* Decorative gradient orb */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-[#6D5DFB]/10 to-[#9B5CFF]/5 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6D5DFB] to-[#9B5CFF] flex items-center justify-center shadow-lg shadow-[#6D5DFB]/25">
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <GreetingIcon className="w-5 h-5 text-amber-400" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {greeting.text}, {displayName.split(" ")[0]}!
                  </h2>
                </div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-2xl">
                  {p?.streak && p.streak > 5
                    ? `You're on a ${p.streak}-day streak! Keep the momentum going. Focus on your weak areas today to maximize growth.`
                    : "Start strong today! Review your bookmarks and attempt a quick mock test to warm up your brain."}
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F4F5FA]/80 border border-[#E9ECF8]">
                <MessageSquare className="w-5 h-5 text-[#6D5DFB] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600 font-medium italic">
                  &ldquo;The expert in anything was once a beginner. Every
                  question you solve today brings you closer to your goal.&rdquo;
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-1">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF] text-white text-sm font-bold shadow-md shadow-[#6D5DFB]/20 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask AI
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-[#E9ECF8] text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  Voice Chat
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-[#E9ECF8] text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <CalendarClock className="w-4 h-4" />
                  Generate Plan
                </motion.button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* ═══════════════════════════════════════════════════════
            3. KPI STATS ROW
        ═══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
          <KpiCard
            icon={TrendingUp}
            label="Level"
            value={p?.level || 0}
            color="#6D5DFB"
            delay={0.12}
          />
          <KpiCard
            icon={Zap}
            label="XP"
            value={p?.xp || 0}
            color="#4F8CFF"
            delay={0.16}
          />
          <KpiCard
            icon={Coins}
            label="Coins"
            value={p?.coins || 0}
            color="#F59E0B"
            delay={0.2}
          />
          <KpiCard
            icon={Flame}
            label="Streak"
            value={p?.streak || 0}
            suffix=" days"
            color="#EF4444"
            delay={0.24}
          />
          <KpiCard
            icon={Target}
            label="Accuracy"
            value={p?.accuracy || 0}
            suffix="%"
            color="#22C55E"
            delay={0.28}
          />
          <KpiCard
            icon={Brain}
            label="Questions"
            value={p?.questions_solved || 0}
            color="#9B5CFF"
            delay={0.32}
          />
          <KpiCard
            icon={BookOpen}
            label="Mock Avg"
            value={p?.mock_average || 0}
            suffix="%"
            color="#4F8CFF"
            delay={0.36}
          />
          <KpiCard
            icon={Clock}
            label="Study Hrs"
            value={p?.study_hours_total || 0}
            suffix="h"
            color="#6D5DFB"
            delay={0.4}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════
            4 & 5. PERSONAL INFO + EXAM PREFERENCES (Two column)
        ═══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 4. Personal Information */}
          <GlassCard className="p-8" delay={0.15}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#6D5DFB]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#6D5DFB]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Personal Information
                </h3>
              </div>
              {editingPersonal ? (
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingPersonal(false)}
                    className="p-2 rounded-xl border border-[#E9ECF8] text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={savePersonal}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D5DFB] text-white text-sm font-bold hover:bg-[#5b4be0] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingPersonal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E9ECF8] text-gray-500 text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </motion.button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldRow
                icon={User}
                label="Full Name"
                value={formPersonal.name}
                editing={editingPersonal}
                name="name"
                onChange={handlePersonalChange}
              />
              <FieldRow
                icon={Calendar}
                label="Date of Birth"
                value={formPersonal.dob}
                editing={editingPersonal}
                name="dob"
                onChange={handlePersonalChange}
                type="date"
              />
              <FieldRow
                icon={User}
                label="Gender"
                value={formPersonal.gender}
                editing={editingPersonal}
                name="gender"
                onChange={handlePersonalChange}
              />
              <FieldRow
                icon={Mail}
                label="Email"
                value={formPersonal.email}
                editing={false}
                name="email"
                onChange={handlePersonalChange}
              />
              <FieldRow
                icon={Phone}
                label="Phone"
                value={formPersonal.phone}
                editing={editingPersonal}
                name="phone"
                onChange={handlePersonalChange}
              />
              <FieldRow
                icon={MapPin}
                label="Location"
                value={formPersonal.location}
                editing={editingPersonal}
                name="location"
                onChange={handlePersonalChange}
              />
              <FieldRow
                icon={Globe}
                label="Timezone"
                value={formPersonal.timezone}
                editing={editingPersonal}
                name="timezone"
                onChange={handlePersonalChange}
              />
              <FieldRow
                icon={GraduationCap}
                label="Education"
                value={formPersonal.education}
                editing={editingPersonal}
                name="education"
                onChange={handlePersonalChange}
              />
              <FieldRow
                icon={BookOpen}
                label="College"
                value={formPersonal.college}
                editing={editingPersonal}
                name="college"
                onChange={handlePersonalChange}
              />
              <FieldRow
                icon={Briefcase}
                label="Occupation"
                value={formPersonal.occupation}
                editing={editingPersonal}
                name="occupation"
                onChange={handlePersonalChange}
              />
              <div className="sm:col-span-2">
                <FieldRow
                  icon={FileText}
                  label="Bio"
                  value={formPersonal.bio}
                  editing={editingPersonal}
                  name="bio"
                  onChange={handlePersonalChange}
                />
              </div>
            </div>
          </GlassCard>

          {/* 5. Exam Preferences */}
          <GlassCard className="p-8" delay={0.2}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#4F8CFF]/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#4F8CFF]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Exam Preferences
                </h3>
              </div>
              {editingExam ? (
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingExam(false)}
                    className="p-2 rounded-xl border border-[#E9ECF8] text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveExam}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F8CFF] text-white text-sm font-bold hover:bg-[#3d7ae6] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingExam(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E9ECF8] text-gray-500 text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </motion.button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldRow
                icon={Target}
                label="Target Exam"
                value={formExam.target_exam}
                editing={editingExam}
                name="target_exam"
                onChange={handleExamChange}
              />
              <FieldRow
                icon={BookOpen}
                label="Secondary Exam"
                value={formExam.secondary_exam}
                editing={editingExam}
                name="secondary_exam"
                onChange={handleExamChange}
              />
              <FieldRow
                icon={TrendingUp}
                label="Target Score"
                value={formExam.target_score}
                editing={editingExam}
                name="target_score"
                onChange={handleExamChange}
                type="number"
              />
              <FieldRow
                icon={Award}
                label="Target Rank"
                value={formExam.target_rank}
                editing={editingExam}
                name="target_rank"
                onChange={handleExamChange}
                type="number"
              />
              <FieldRow
                icon={Calendar}
                label="Target Date"
                value={formExam.target_date}
                editing={editingExam}
                name="target_date"
                onChange={handleExamChange}
                type="date"
              />
              <FieldRow
                icon={Clock}
                label="Daily Study Goal (hrs)"
                value={formExam.study_hours_goal}
                editing={editingExam}
                name="study_hours_goal"
                onChange={handleExamChange}
                type="number"
              />
            </div>

            {/* Subject Tags */}
            {(p?.weak_subjects?.length ||
              p?.strong_subjects?.length ||
              p?.favorite_subjects?.length) && (
              <div className="mt-6 flex flex-col gap-4">
                {p?.strong_subjects && p.strong_subjects.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Strong Subjects
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.strong_subjects.map((s) => (
                        <TagPill key={s} text={s} color="#22C55E" />
                      ))}
                    </div>
                  </div>
                )}
                {p?.weak_subjects && p.weak_subjects.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Weak Subjects
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.weak_subjects.map((s) => (
                        <TagPill key={s} text={s} color="#EF4444" />
                      ))}
                    </div>
                  </div>
                )}
                {p?.favorite_subjects && p.favorite_subjects.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Favorite Subjects
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.favorite_subjects.map((s) => (
                        <TagPill key={s} text={s} color="#6D5DFB" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>

        {/* ═══════════════════════════════════════════════════════
            6. PERFORMANCE OVERVIEW
        ═══════════════════════════════════════════════════════ */}
        <GlassCard className="p-8 md:p-10" delay={0.25}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#22C55E]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Performance Overview
            </h3>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Circular Progress */}
            <div className="flex-shrink-0">
              <CircularProgress pct={p?.completion_pct || 0} />
            </div>

            {/* Bar Chart */}
            <div className="flex-1 w-full">
              <p className="text-sm font-bold text-gray-600 mb-4">
                Weekly Progress
              </p>
              <div className="flex items-end gap-3 h-40">
                {weeklyBarData.map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <motion.div
                      className="w-full rounded-xl bg-gradient-to-t from-[#6D5DFB] to-[#4F8CFF]"
                      initial={{ height: 0 }}
                      animate={{ height: `${(val / maxBar) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                      style={{ minHeight: 8 }}
                    />
                    <span className="text-[10px] font-semibold text-gray-400">
                      {dayLabels[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Stats */}
            <div className="flex flex-row lg:flex-col gap-6 flex-shrink-0">
              {[
                {
                  label: "Accuracy",
                  value: `${p?.accuracy || 0}%`,
                  icon: Target,
                  color: "#22C55E",
                },
                {
                  label: "Solved",
                  value: String(p?.questions_solved || 0),
                  icon: Brain,
                  color: "#6D5DFB",
                },
                {
                  label: "Study Time",
                  value: `${p?.study_hours_total || 0}h`,
                  icon: Clock,
                  color: "#4F8CFF",
                },
                {
                  label: "Growth",
                  value: "+12%",
                  icon: TrendingUp,
                  color: "#22C55E",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}14` }}
                  >
                    <stat.icon
                      className="w-4 h-4"
                      style={{ color: stat.color }}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-sm font-extrabold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* ═══════════════════════════════════════════════════════
            7. ACHIEVEMENTS
        ═══════════════════════════════════════════════════════ */}
        <GlassCard className="p-8 md:p-10" delay={0.3}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
            {p?.achievements && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-[#F4F5FA] text-xs font-bold text-gray-500">
                {p.achievements.length} earned
              </span>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {(
              p?.achievements || [
                "Top Performer",
                "Mock Master",
                "Consistency King",
                "Early Bird",
                "Elite Learner",
              ]
            ).map((title) => (
              <AchievementBadge key={title} title={title} />
            ))}
          </div>
        </GlassCard>

        {/* ═══════════════════════════════════════════════════════
            8 & 9. SUBSCRIPTION + SECURITY (Two column)
        ═══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 8. Subscription */}
          <GlassCard className="p-8" delay={0.35}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#9B5CFF]/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#9B5CFF]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Subscription</h3>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#6D5DFB]/5 to-[#9B5CFF]/5 border border-[#E9ECF8]">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {p?.plan || "Free"} Plan
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Renews {formatDate(p?.plan_renewal || "")}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#6D5DFB] to-[#9B5CFF] text-white text-[10px] font-bold uppercase">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  AI Credits Remaining
                </span>
                <span className="text-sm font-extrabold text-gray-900">
                  {p?.ai_credits || 0}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4" />
                    Storage Used
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    {p?.storage_used_mb || 0} MB / 5000 MB
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-[#F4F5FA] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF]"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        ((p?.storage_used_mb || 0) / 5000) * 100,
                        100
                      )}%`,
                    }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#6D5DFB] to-[#9B5CFF] text-white text-sm font-bold shadow-md shadow-[#6D5DFB]/20 hover:shadow-lg hover:shadow-[#6D5DFB]/30 transition-shadow cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                Upgrade Plan
              </motion.button>
            </div>
          </GlassCard>

          {/* 9. Security */}
          <GlassCard className="p-8" delay={0.4}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#22C55E]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Security</h3>
            </div>

            <div className="flex flex-col gap-5">
              {/* Security Score */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F5FA] border border-[#E9ECF8]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg text-white"
                    style={{
                      backgroundColor:
                        (p?.security_score || 0) >= 80
                          ? "#22C55E"
                          : (p?.security_score || 0) >= 50
                            ? "#F59E0B"
                            : "#EF4444",
                    }}
                  >
                    {p?.security_score || 0}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Security Score
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {(p?.security_score || 0) >= 80
                        ? "Excellent protection"
                        : (p?.security_score || 0) >= 50
                          ? "Room for improvement"
                          : "Needs attention"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Password
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      Last changed 30 days ago
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl border border-[#E9ECF8] text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                  Change
                </button>
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Two-Factor Auth
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      SMS-based verification
                    </p>
                  </div>
                </div>
                <div className="w-11 h-6 rounded-full bg-[#22C55E] flex items-center p-0.5 cursor-pointer">
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-sm"
                    animate={{ x: 20 }}
                  />
                </div>
              </div>

              {/* Login Activity */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Login Activity
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      {p?.connected_devices?.length || 1} active device(s)
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl border border-[#E9ECF8] text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                  View
                </button>
              </div>

              {/* Verified badge */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#22C55E]/5 border border-[#22C55E]/20">
                <BadgeCheck className="w-5 h-5 text-[#22C55E]" />
                <span className="text-sm font-semibold text-[#22C55E]">
                  Email verified
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ═══════════════════════════════════════════════════════
            10. STUDY HEATMAP
        ═══════════════════════════════════════════════════════ */}
        <GlassCard className="p-8 md:p-10" delay={0.45}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#6D5DFB]/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#6D5DFB]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Study Activity Heatmap
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            {/* Day labels */}
            <div className="flex items-center gap-6">
              <div className="w-10 flex-shrink-0" />
              <div className="flex-1 flex justify-between">
                {dayLabels.map((d) => (
                  <span
                    key={d}
                    className="text-[10px] font-semibold text-gray-400 w-6 text-center"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Grid */}
            {heatmapData.map((week, wi) => (
              <div key={wi} className="flex items-center gap-6">
                <span className="w-10 text-[10px] font-semibold text-gray-400 text-right flex-shrink-0">
                  W{wi + 1}
                </span>
                <div className="flex-1 flex justify-between">
                  {week.map((level, di) => (
                    <HeatmapCell key={`${wi}-${di}`} level={level} />
                  ))}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 justify-end">
              <span className="text-[10px] font-semibold text-gray-400">
                Less
              </span>
              {[0, 1, 2, 3, 4].map((l) => (
                <div
                  key={l}
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor: [
                      "#EBEDF0",
                      "#D6CBFF",
                      "#B09EFF",
                      "#8A75FF",
                      "#6D5DFB",
                    ][l],
                  }}
                />
              ))}
              <span className="text-[10px] font-semibold text-gray-400">
                More
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Footer spacing */}
        <div className="h-8" />
      </div>
    </main>
  );
}

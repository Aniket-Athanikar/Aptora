"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Compass,
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Flame,
  Bell,
  Play,
  Pause,
  Brain,
  ArrowLeft,
  Search,
  Settings,
  User,
  Gem,
  RefreshCw,
  Clock,
  Check,
  Trash2,
  Edit,
  X,
  Layers,
  Trophy,
  Camera,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/ToastContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Types ---
interface UserProfile {
  name: string;
  email: string;
  streak: number;
  xp: number;
  coins: number;
  avatar_url?: string;
  target_exam?: string;
  target_score?: string;
  study_hours_goal?: number;
  weak_subjects?: string[];
  favorite_subjects?: string[];
  phone?: string;
  dob?: string;
  gender?: string;
  location?: string;
  timezone?: string;
  bio?: string;
  education?: string;
  occupation?: string;
  college?: string;
  security_score?: number;
  notification_settings?: {
    email?: boolean;
    push?: boolean;
    whatsapp?: boolean;
    sms?: boolean;
  };
  privacy_settings?: {
    profile_visibility?: boolean;
    public_streaks?: boolean;
    analytics_sharing?: boolean;
  };
  member_since?: string;
  accuracy?: number;
  questions_solved?: number;
  mock_average?: number;
  study_hours_total?: number;
  completion_pct?: number;
  connected_devices?: string[];
  plan?: string;
  plan_renewal?: string;
  ai_credits?: number;
  storage_used_mb?: number;
}

interface StudyLog {
  id: string;
  day: number;
  subject: string;
  hours: number;
  mode: "Mock Test" | "Reading" | "Notes";
}

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}



function getInitials(name: string): string {
  if (!name) return "SC";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, login } = useAuth();
  const { toast } = useToast();

  // Page States
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile data state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Layout States
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit State
  const [editingPersonal, setEditingPersonal] = useState(false);

  // Editable Form fields
  const [formPersonal, setFormPersonal] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    dob: "",
    education: "",
    occupation: "",
    college: "",
    gender: "",
    timezone: "Asia/Kolkata",
    avatar_url: "",
  });

  interface OrderHistoryItem {
    id: number;
    plan_name: string;
    cycle: string;
    amount: string;
    txn_id: string;
    created_at: string;
  }

  const [billingHistory, setBillingHistory] = useState<OrderHistoryItem[]>([]);

  // Editing state for invoices
  const [editingOrder, setEditingOrder] = useState<OrderHistoryItem | null>(null);
  const [editPlanName, setEditPlanName] = useState("");
  const [editCycle, setEditCycle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editTxnId, setEditTxnId] = useState("");

  const handleEditClick = (order: OrderHistoryItem) => {
    setEditingOrder(order);
    setEditPlanName(order.plan_name);
    setEditCycle(order.cycle);
    setEditAmount(order.amount);
    setEditTxnId(order.txn_id);
  };

  const handleSaveOrderEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const res = await fetch(`${API_URL}/api/billing/orders/${editingOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_name: editPlanName,
          cycle: editCycle,
          amount: editAmount,
          txn_id: editTxnId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          toast("Invoice details updated successfully!", "success");
          setBillingHistory((prev) =>
            prev.map((item) => (item.id === editingOrder.id ? data.order : item))
          );
          setEditingOrder(null);
        } else {
          toast("Failed to save invoice changes.", "error");
        }
      } else {
        toast("Server rejected invoice changes.", "error");
      }
    } catch (err) {
      console.error("Error editing invoice:", err);
      toast("Could not connect to the server.", "error");
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!confirm("Are you sure you want to delete this invoice record from the database?")) return;
    try {
      const res = await fetch(`${API_URL}/api/billing/orders/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast("Invoice deleted successfully!", "success");
        setBillingHistory((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast("Failed to delete invoice.", "error");
      }
    } catch (err) {
      console.error("Error deleting invoice:", err);
      toast("Could not connect to server.", "error");
    }
  };

  // Pomodoro Widget State (Sidebar Footer)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<"study" | "break">("study");
  const pomodoroIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Live Focus Session Timer (Stopwatch Card)
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchActive, setStopwatchActive] = useState(false);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Interactive Heatmap / Real-Time Study Calendar State (July 2026)
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([
    { id: "1", day: 3, subject: "Quantitative Aptitude", hours: 2.5, mode: "Mock Test" },
    { id: "2", day: 5, subject: "Reasoning & Analytical Logic", hours: 4.0, mode: "Reading" },
    { id: "3", day: 8, subject: "English Comprehension", hours: 1.5, mode: "Notes" },
    { id: "4", day: 10, subject: "General Awareness", hours: 5.5, mode: "Mock Test" },
  ]);

  // Log Form State
  const [logSubject, setLogSubject] = useState("");
  const [logHours, setLogHours] = useState<number>(1);
  const [logMode, setLogMode] = useState<"Mock Test" | "Reading" | "Notes">("Mock Test");
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Daily Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "1", label: "Solve 50 MCQs", done: false },
    { id: "2", label: "Revise Flashcards", done: false },
    { id: "3", label: "Attempt Mock Drill", done: false },
    { id: "4", label: "Read AI Coach Editorial", done: false },
  ]);
  const [streakAwardedToday, setStreakAwardedToday] = useState(false);

  // Initialize Sidebar Toggle from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("ef_sidebar_expanded");
    if (saved !== null) {
      setIsSidebarExpanded(saved === "true");
    }
  }, []);

  // Check auth
  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        if (!localStorage.getItem("ef_user")) {
          router.push("/login");
        } else {
          setAuthLoading(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAuthLoading(false);
    }
  }, [isAuthenticated, router]);

  // Load profile from API and sync with local storage values
  const loadProfile = useCallback(async () => {
    if (!user?.email) return;
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          const prof = data.profile as UserProfile;
          setUserProfile(prof);
          setFormPersonal({
            name: prof.name || "",
            phone: prof.phone || "",
            location: prof.location || "",
            bio: prof.bio || "",
            dob: prof.dob || "",
            education: prof.education || "",
            occupation: prof.occupation || "",
            college: prof.college || "",
            gender: prof.gender || "",
            timezone: prof.timezone || "Asia/Kolkata",
            avatar_url: prof.avatar_url || "",
          });

          // Sync basic auth info to local storage/state if name changes
          if (prof.name && prof.name !== user.name) {
            login({ name: prof.name, email: user.email });
          }
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setProfileLoading(false);
    }
  }, [user?.email, user?.name, login]);

  useEffect(() => {
    if (!authLoading && user?.email) {
      loadProfile();
    }
  }, [authLoading, user?.email, loadProfile]);

  const loadBillingHistory = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`${API_URL}/api/billing/history?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.history) {
          setBillingHistory(data.history);
        }
      }
    } catch (err) {
      console.error("Error loading billing history:", err);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!authLoading && user?.email) {
      loadBillingHistory();
    }
  }, [authLoading, user?.email, loadBillingHistory]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          setUserProfile((prev) => (prev ? { ...prev, avatar_url: compressedBase64 } : null));
          setFormPersonal((prev) => ({ ...prev, avatar_url: compressedBase64 }));

          if (user?.email) {
            fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...formPersonal,
                avatar_url: compressedBase64,
              }),
            })
              .then((res) => {
                if (res.ok) {
                  toast("Profile picture updated successfully!", "success");
                } else {
                  toast("Server rejected image update.", "error");
                }
              })
              .catch((err) => {
                console.error("Network error saving avatar:", err);
                toast("Could not connect to server.", "error");
              });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Pomodoro Timer Logic
  useEffect(() => {
    if (pomodoroActive) {
      pomodoroIntervalRef.current = setInterval(() => {
        setPomodoroTime((prev) => {
          if (prev <= 1) {
            if (pomodoroMode === "study") {
              setPomodoroMode("break");
              toast("Pomodoro Completed! Take a short 5-minute break.", "info");
              return 5 * 60;
            } else {
              setPomodoroMode("study");
              toast("Break over! Time to focus.", "success");
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (pomodoroIntervalRef.current) {
        clearInterval(pomodoroIntervalRef.current);
      }
    }
    return () => {
      if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current);
    };
  }, [pomodoroActive, pomodoroMode, toast]);

  // Live Focus Session Timer (Stopwatch) Logic
  useEffect(() => {
    if (stopwatchActive) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [stopwatchActive]);

  const formatPomodoroTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formatStopwatchTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Stopwatch Finish & Log Action
  const handleFinishStopwatch = async () => {
    if (stopwatchTime < 5) {
      toast("Study session too short to log! Keep focusing.", "info");
      return;
    }
    setStopwatchActive(false);
    const sessionSeconds = stopwatchTime;
    setStopwatchTime(0);

    const studyHoursAdded = parseFloat((sessionSeconds / 3600).toFixed(3));
    const currentTotalHours = userProfile?.study_hours_total || 0;
    const currentXp = userProfile?.xp || 0;
    const currentCoins = userProfile?.coins || 0;

    const updatedTotalHours = parseFloat((currentTotalHours + studyHoursAdded).toFixed(3));
    const updatedXp = currentXp + 10;
    const updatedCoins = currentCoins + 5;

    // Trigger local state updates
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        study_hours_total: updatedTotalHours,
        xp: updatedXp,
        coins: updatedCoins,
      });
    }

    toast(`Awesome focus session! Awarded +10 XP and +5 Coins.`, "success");

    // Sync to database
    if (user?.email) {
      try {
        await fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            study_hours_total: updatedTotalHours,
            xp: updatedXp,
            coins: updatedCoins,
          }),
        });
      } catch (err) {
        console.error("Failed to sync session stats:", err);
      }
    }
  };

  // Checklist Check/Uncheck handler
  const handleToggleChecklist = async (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setChecklist(updated);

    const allChecked = updated.every((item) => item.done);
    if (allChecked && !streakAwardedToday) {
      const nextStreak = (userProfile?.streak || 0) + 1;
      const nextXp = (userProfile?.xp || 0) + 10;
      setStreakAwardedToday(true);

      if (userProfile) {
        setUserProfile({
          ...userProfile,
          streak: nextStreak,
          xp: nextXp,
        });
      }

      toast("Perfect Daily Habit Checklist! Streak extended & +10 XP awarded!", "success");

      // Save to Database
      if (user?.email) {
        try {
          await fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              streak: nextStreak,
              xp: nextXp,
            }),
          });
        } catch (err) {
          console.error("Failed to update streak:", err);
        }
      }
    }
  };

  const getChecklistPercentage = () => {
    const doneCount = checklist.filter((item) => item.done).length;
    return Math.round((doneCount / checklist.length) * 100);
  };

  // Calendar Heatmap configuration for July 2026
  // July 1, 2026 is a Wednesday.
  // 3 empty grids at the beginning for Sun, Mon, Tue
  const calendarPadding = 3;
  const daysInJuly = 31;

  const getDayTotalHours = (day: number) => {
    return studyLogs
      .filter((log) => log.day === day)
      .reduce((sum, log) => sum + log.hours, 0);
  };

  const getDayIntensityColor = (day: number) => {
    const hours = getDayTotalHours(day);
    if (hours === 0) return "bg-neutral-100";
    if (hours <= 2) return "bg-indigo-100 border-indigo-200/50 text-indigo-800";
    if (hours <= 5) return "bg-indigo-300 border-indigo-400/50 text-indigo-900";
    return "bg-indigo-600 border-indigo-700/50 text-white";
  };

  // CRUD handlers for study logs
  const handleSaveStudyLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDay === null) return;

    if (!logSubject.trim()) {
      toast("Please enter a subject name.", "error");
      return;
    }

    if (editingLogId) {
      // Edit mode
      setStudyLogs((prev) =>
        prev.map((log) =>
          log.id === editingLogId
            ? { ...log, subject: logSubject, hours: logHours, mode: logMode }
            : log
        )
      );
      toast("Study log updated!", "success");
      setEditingLogId(null);
    } else {
      // Add mode
      const newLog: StudyLog = {
        id: Date.now().toString(),
        day: selectedDay,
        subject: logSubject,
        hours: logHours,
        mode: logMode,
      };
      setStudyLogs((prev) => [...prev, newLog]);
      toast("Study log saved!", "success");
    }

    // Reset log inputs
    setLogSubject("");
    setLogHours(1);
    setLogMode("Mock Test");
  };

  const handleDeleteLog = (id: string) => {
    setStudyLogs((prev) => prev.filter((log) => log.id !== id));
    toast("Study log deleted.", "info");
    if (editingLogId === id) {
      setEditingLogId(null);
      setLogSubject("");
      setLogHours(1);
      setLogMode("Mock Test");
    }
  };

  const handleEditLogStart = (log: StudyLog) => {
    setEditingLogId(log.id);
    setLogSubject(log.subject);
    setLogHours(log.hours);
    setLogMode(log.mode);
  };

  // Save Settings Changes (POST /api/profile)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formPersonal),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          setUserProfile(data.profile);
          login({ name: data.profile.name, email: user.email });
          toast("Profile saved successfully!", "success");
          setEditingPersonal(false);
        } else {
          toast("Failed to update profile.", "error");
        }
      } else {
        toast("Error saving profile details.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Connection error while saving profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFF] flex flex-col items-center justify-center font-sans">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
          <Sparkles className="w-8 h-8 text-indigo-600 animate-bounce" />
        </div>
        <p className="mt-6 text-sm font-semibold tracking-wide text-neutral-600 animate-pulse">
          Hydrating your AI Workspace...
        </p>
      </div>
    );
  }

  const displayName = userProfile?.name || user?.name || "Scholar";
  const initials = getInitials(displayName);

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-neutral-800 flex font-sans">
      {/* EXPANDABLE LEFT SIDEBAR NAVIGATION */}
      <aside
        className={cn(
          "bg-white border-r border-[#E9ECF8] flex flex-col justify-between py-6 shrink-0 relative z-20 transition-all duration-300",
          isSidebarExpanded ? "w-64 px-6" : "w-20 px-3 items-center"
        )}
      >
        <div className="flex flex-col gap-8 w-full">
          {/* Sidebar Logo & Toggle Button */}
          <div className={cn("flex items-center justify-between w-full", isSidebarExpanded ? "px-2" : "flex-col gap-4")}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/10">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {isSidebarExpanded && (
                <span className="font-extrabold tracking-wider text-neutral-900 uppercase text-sm">
                  EXAM FORGE<span className="text-indigo-600"> AI</span>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                const nextVal = !isSidebarExpanded;
                setIsSidebarExpanded(nextVal);
                localStorage.setItem("ef_sidebar_expanded", String(nextVal));
              }}
              className="p-1.5 rounded-lg border border-[#E9ECF8] hover:bg-indigo-50 hover:text-indigo-600 text-neutral-400 transition-colors cursor-pointer bg-transparent"
            >
              {isSidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav Tabs */}
          <nav className="flex flex-col gap-2 w-full">
            {[
              { id: "home", label: "Home / Workspace", icon: Compass, active: false, path: "/dashboard" },
              { id: "analytics", label: "Analytics & Graphs", icon: TrendingUp, active: false, path: "/dashboard" },
              { id: "planner", label: "Study Plan & Goals", icon: Calendar, active: false, path: "/dashboard" },
              { id: "tutor", label: "AI Tutor Chat", icon: Brain, active: false, path: "/dashboard" },
              { id: "revision", label: "Revision & Decks", icon: Layers, active: false, path: "/dashboard" },
              { id: "mocktests", label: "Mock Test Suite", icon: Trophy, active: false, path: "/dashboard" },
              { id: "settings", label: "Settings & Profile", icon: Settings, active: true, path: "/profile" },
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <div key={tab.id} className="relative group w-full">
                  <button
                    onClick={() => {
                      if (!tab.active) {
                        router.push(tab.path);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 cursor-pointer border-0 text-left",
                      tab.active
                        ? "bg-indigo-50 text-indigo-600 font-extrabold ring-1 ring-indigo-100"
                        : "text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 font-medium"
                    )}
                  >
                    <IconComp className="w-5 h-5 flex-shrink-0" />
                    {isSidebarExpanded && <span className="text-xs">{tab.label}</span>}
                  </button>
                  {!isSidebarExpanded && (
                    <span className="absolute left-24 top-3 px-2 py-1 text-[10px] font-extrabold text-white bg-neutral-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                      {tab.label}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Widget - Pomodoro Timer */}
        <div className="flex flex-col gap-6 w-full items-center">
          <div
            className={cn(
              "w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl p-3 flex flex-col gap-2 shadow-sm transition-all",
              !isSidebarExpanded && "items-center"
            )}
          >
            {isSidebarExpanded && (
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Pomodoro Timer</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  {pomodoroMode === "study" ? "Focus" : "Break"}
                </span>
              </div>
            )}
            <div className={cn("flex items-center gap-2.5", !isSidebarExpanded && "flex-col")}>
              <span className="text-xs font-black text-indigo-600 tabular-nums font-mono">
                {formatPomodoroTime(pomodoroTime)}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPomodoroActive((a) => !a)}
                  className="p-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer border-0"
                >
                  {pomodoroActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setPomodoroActive(false);
                    setPomodoroTime(pomodoroMode === "study" ? 25 * 60 : 5 * 60);
                  }}
                  className="p-1 bg-neutral-200 text-neutral-600 hover:bg-neutral-300 rounded-lg transition-colors cursor-pointer border-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Reset/Refresh button */}
          <div className="relative group w-full">
            <button
              onClick={() => {
                loadProfile();
                toast("Profile data reloaded from system", "success");
              }}
              className={cn(
                "w-full flex items-center gap-3.5 p-3 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer border-0 bg-transparent text-left",
                !isSidebarExpanded && "justify-center"
              )}
            >
              <RefreshCw className="w-5 h-5 flex-shrink-0" />
              {isSidebarExpanded && <span className="text-xs font-semibold">Reset / Refresh data</span>}
            </button>
            {!isSidebarExpanded && (
              <span className="absolute left-24 top-3 px-2 py-1 text-[10px] font-extrabold text-white bg-neutral-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                Reload system data
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* TOP NAVBAR CONTAINER */}
        <header className="h-20 bg-white border-b border-[#E9ECF8] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6 flex-grow max-w-xl">
            {/* Go to Home (Back Button) */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-indigo-600 transition-colors border border-neutral-200/80 bg-white hover:bg-neutral-50 px-3.5 py-2 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-500" />
              <span>Go to Home</span>
            </button>

            {/* Global Search Input */}
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules, settings, target exams, achievements..."
                className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Gamified stats & User Info */}
          <div className="flex items-center gap-4.5">
            {/* Streak */}
            <div className="group relative flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/40 px-3.5 py-1.5 rounded-full font-extrabold text-xs">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{userProfile?.streak || 0} Days</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200/40 px-3.5 py-1.5 rounded-full font-extrabold text-xs">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>{userProfile?.xp || 0} XP</span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200/40 px-3.5 py-1.5 rounded-full font-extrabold text-xs">
              <Award className="w-4 h-4 text-yellow-600 animate-bounce" />
              <span>{userProfile?.coins || 0} Coins</span>
            </div>

            {/* Notification Bell */}
            <button className="p-2.5 rounded-full border border-[#E9ECF8] hover:bg-neutral-50 text-neutral-500 relative cursor-pointer bg-transparent">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* User Dropdown / Avatar */}
            <div className="flex items-center gap-2 border-l border-neutral-200 pl-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-sm cursor-pointer overflow-hidden">
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* PROFILE BODY */}
        <main className="flex-grow p-8 overflow-y-auto space-y-8 bg-gradient-to-tr from-[#fbfbfe] to-[#f5f6ff]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT / CENTER TWO-THIRD PANEL CONTAINER */}
            <div className="lg:col-span-2 space-y-8">
              {/* PROFILE HERO CARD */}
              <div className="p-6 md:p-8 bg-white border border-[#E9ECF8] rounded-[24px] shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                <div className="relative flex-shrink-0">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-3xl shadow-lg cursor-pointer overflow-hidden"
                  >
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                    {/* Camera / Edit Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 text-[10px] font-bold">
                      <Camera className="w-5.5 h-5.5 text-white" />
                      <span>Edit</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white animate-ping"
                    title="Online Status"
                  />
                  <div
                    className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white"
                    title="Online Status"
                  />
                </div>

                <div className="flex-grow text-center sm:text-left space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight">{displayName}</h2>
                    {userProfile?.plan && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider self-center shadow-sm">
                        <Gem className="w-3 h-3 text-white" />
                        {userProfile.plan} Member
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 font-bold">{userProfile?.email || user?.email}</p>
                  <p className="text-xs text-neutral-500 font-semibold leading-relaxed max-w-lg">
                    {userProfile?.bio ||
                      "No bio added yet. Add a short description about yourself to customize your profile standing."}
                  </p>
                  <div className="pt-2 text-[11px] font-bold text-neutral-400 flex flex-wrap gap-x-4 gap-y-1 justify-center sm:justify-start">
                    <span>
                      Member Since:{" "}
                      {userProfile?.member_since
                        ? new Date(userProfile.member_since).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                          })
                        : "Recently Joined"}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600">Active online status enabled</span>
                  </div>
                </div>
              </div>

              {/* LIVE FOCUS SESSION TIMER (STOPWATCH CARD) */}
              <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[24px] shadow-lg relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                  <Clock className="w-64 h-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 animate-pulse" /> Live Focus Session Timer
                    </span>
                    <h3 className="text-xl font-extrabold tracking-tight">Active Learning Stopwatch</h3>
                    <p className="text-xs text-indigo-100 max-w-md leading-relaxed">
                      Track your live session in real-time. Finish your session to log study hours, and gain
                      instant bonuses to your level standing!
                    </p>
                  </div>

                  <div className="flex flex-col items-center bg-white/10 border border-white/20 px-6 py-5 rounded-2xl min-w-[200px] text-center shadow-md">
                    <span className="text-3xl font-black tracking-widest font-mono tabular-nums">
                      {formatStopwatchTime(stopwatchTime)}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-200 uppercase mt-2">
                      {stopwatchActive ? "Session Running" : "Session Paused"}
                    </span>

                    <div className="flex gap-2.5 mt-4 w-full">
                      {!stopwatchActive ? (
                        <button
                          onClick={() => setStopwatchActive(true)}
                          className="flex-1 bg-white hover:bg-neutral-50 text-indigo-700 font-extrabold text-xs py-2 rounded-xl transition-all cursor-pointer border-0 shadow-sm"
                        >
                          Start Study Session
                        </button>
                      ) : (
                        <button
                          onClick={() => setStopwatchActive(false)}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-2 rounded-xl transition-all cursor-pointer border-0 shadow-sm"
                        >
                          Pause
                        </button>
                      )}
                      <button
                        onClick={handleFinishStopwatch}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer border-0 shadow-sm"
                      >
                        Finish & Log
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE DAILY FOCUS CHECKLIST */}
              <div className="p-6 md:p-8 bg-white border border-[#E9ECF8] rounded-[24px] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 gap-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-neutral-900 text-base flex items-center gap-2">
                      <Check className="w-5 h-5 text-indigo-600" /> Interactive Daily Focus Checklist
                    </h3>
                    <p className="text-xs text-neutral-400 font-medium">
                      Complete all targets to secure your study habit loop and extend your active streak!
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      {getChecklistPercentage()}% Done
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${getChecklistPercentage()}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none",
                        item.done
                          ? "bg-indigo-50/40 border-indigo-100 text-neutral-400"
                          : "bg-neutral-50 hover:bg-neutral-100/50 border-neutral-200/80 text-neutral-700 hover:border-neutral-300"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                          item.done ? "bg-indigo-600 border-indigo-600 text-white" : "border-neutral-300 bg-white"
                        )}
                      >
                        {item.done && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={cn("text-xs font-bold", item.done && "line-through")}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PERSONAL INFORMATION CARD (EDITABLE FORM) */}
              <div className="p-6 md:p-8 bg-white border border-[#E9ECF8] rounded-[24px] shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                  <h3 className="font-extrabold text-neutral-900 text-base flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" /> Personal Information
                  </h3>
                  {!editingPersonal ? (
                    <button
                      onClick={() => setEditingPersonal(true)}
                      className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Edit Information
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPersonal(false)}
                        className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSettings}
                        disabled={savingProfile}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        {savingProfile ? "Saving..." : "Save Details"}
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      disabled={!editingPersonal}
                      value={formPersonal.name}
                      onChange={(e) => setFormPersonal({ ...formPersonal, name: e.target.value })}
                      className="w-full bg-neutral-50 disabled:bg-neutral-100/50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Phone</label>
                    <input
                      type="text"
                      disabled={!editingPersonal}
                      value={formPersonal.phone}
                      onChange={(e) => setFormPersonal({ ...formPersonal, phone: e.target.value })}
                      className="w-full bg-neutral-50 disabled:bg-neutral-100/50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      disabled={!editingPersonal}
                      value={formPersonal.location}
                      onChange={(e) => setFormPersonal({ ...formPersonal, location: e.target.value })}
                      className="w-full bg-neutral-50 disabled:bg-neutral-100/50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Date of Birth</label>
                    <input
                      type="text"
                      disabled={!editingPersonal}
                      value={formPersonal.dob}
                      placeholder="YYYY-MM-DD"
                      onChange={(e) => setFormPersonal({ ...formPersonal, dob: e.target.value })}
                      className="w-full bg-neutral-50 disabled:bg-neutral-100/50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Education Level</label>
                    <input
                      type="text"
                      disabled={!editingPersonal}
                      value={formPersonal.education}
                      onChange={(e) => setFormPersonal({ ...formPersonal, education: e.target.value })}
                      className="w-full bg-neutral-50 disabled:bg-neutral-100/50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Occupation</label>
                    <input
                      type="text"
                      disabled={!editingPersonal}
                      value={formPersonal.occupation}
                      onChange={(e) => setFormPersonal({ ...formPersonal, occupation: e.target.value })}
                      className="w-full bg-neutral-50 disabled:bg-neutral-100/55 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">College / Institution</label>
                    <input
                      type="text"
                      disabled={!editingPersonal}
                      value={formPersonal.college}
                      onChange={(e) => setFormPersonal({ ...formPersonal, college: e.target.value })}
                      className="w-full bg-neutral-50 disabled:bg-neutral-100/50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Personal Bio</label>
                    <textarea
                      disabled={!editingPersonal}
                      value={formPersonal.bio}
                      rows={3}
                      onChange={(e) => setFormPersonal({ ...formPersonal, bio: e.target.value })}
                      className="w-full bg-neutral-50 disabled:bg-neutral-100/50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold resize-none"
                    />
                  </div>
                </form>
              </div>

              {/* BILLING & INVOICES HISTORY CARD */}
              <div className="p-6 md:p-8 bg-white border border-[#E9ECF8] rounded-[24px] shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                  <h3 className="font-extrabold text-neutral-900 text-base flex items-center gap-2">
                    <Gem className="w-5 h-5 text-[#6D4AFF]" /> Billing & Invoices
                  </h3>
                  {userProfile?.plan && (
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider text-[9px]">
                      Active: {userProfile.plan}
                    </span>
                  )}
                </div>

                {billingHistory.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-neutral-400 font-bold">No past invoices recorded in database.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[550px]">
                      <thead>
                        <tr className="border-b border-neutral-100 text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Plan Cycle</th>
                          <th className="pb-3">Transaction ID</th>
                          <th className="pb-3 text-right">Paid</th>
                          <th className="pb-3 text-right">Receipt</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingHistory.map((item, idx) => {
                          const isEditing = editingOrder?.id === item.id;
                          return (
                            <tr key={idx} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                              <td className="py-3.5 text-xs text-neutral-600 font-bold">
                                {new Date(item.created_at).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </td>
                              <td className="py-3.5 text-xs text-neutral-800 font-black capitalize">
                                {isEditing ? (
                                  <div className="flex flex-col gap-1">
                                    <input
                                      type="text"
                                      value={editPlanName}
                                      onChange={(e) => setEditPlanName(e.target.value)}
                                      className="border border-neutral-200 rounded px-1.5 py-0.5 text-xs font-bold w-24"
                                    />
                                    <input
                                      type="text"
                                      value={editCycle}
                                      onChange={(e) => setEditCycle(e.target.value)}
                                      className="border border-neutral-200 rounded px-1.5 py-0.5 text-[9px] font-bold text-[#6D4AFF] w-24"
                                    />
                                  </div>
                                ) : (
                                  <>
                                    {item.plan_name}
                                    <span className="block text-[9px] text-[#6D4AFF] font-bold uppercase tracking-wider">{item.cycle}</span>
                                  </>
                                )}
                              </td>
                              <td className="py-3.5 text-xs text-neutral-500 font-mono">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editTxnId}
                                    onChange={(e) => setEditTxnId(e.target.value)}
                                    className="border border-neutral-200 rounded px-1.5 py-0.5 text-xs font-mono w-32"
                                  />
                                ) : (
                                  item.txn_id
                                )}
                              </td>
                              <td className="py-3.5 text-xs text-neutral-800 font-black text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <span>₹</span>
                                    <input
                                      type="text"
                                      value={editAmount}
                                      onChange={(e) => setEditAmount(e.target.value)}
                                      className="border border-neutral-200 rounded px-1.5 py-0.5 text-xs font-black text-right w-16"
                                    />
                                  </div>
                                ) : (
                                  `₹${item.amount}`
                                )}
                              </td>
                              <td className="py-3.5 text-xs text-right">
                                <Link
                                  href={`/checkout/invoice?plan=${item.plan_name}&cycle=${item.cycle}&amount=${item.amount}&txnId=${item.txn_id}&email=${user?.email || "user@examforge.ai"}`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/50 px-2.5 py-1.5 rounded-lg transition-all"
                                >
                                  View Invoice
                                </Link>
                              </td>
                              <td className="py-3.5 text-xs text-right">
                                {isEditing ? (
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={handleSaveOrderEdit}
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black transition-all cursor-pointer"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingOrder(null)}
                                      className="px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded text-[10px] font-black transition-all cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleEditClick(item)}
                                      className="p-1.5 hover:bg-neutral-100 rounded text-neutral-500 hover:text-indigo-600 transition-colors cursor-pointer"
                                      title="Edit Order"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteOrder(item.id)}
                                      className="p-1.5 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                                      title="Delete Order"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR PANEL CONTAINER */}
            <div className="space-y-8">
              {/* EXAM PREFERENCES CARD */}
              <div className="p-6 bg-white border border-[#E9ECF8] rounded-[24px] shadow-sm space-y-4">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Target Preferences</span>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
                    <span className="text-xs font-bold text-neutral-500">Target Exam</span>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded">
                      {userProfile?.target_exam || "Not Configured"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
                    <span className="text-xs font-bold text-neutral-500">Target Score</span>
                    <span className="text-xs font-black text-neutral-800">
                      {userProfile?.target_score || "80%"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
                    <span className="text-xs font-bold text-neutral-500">Study Pace</span>
                    <span className="text-xs font-black text-neutral-800">
                      {userProfile?.study_hours_goal || "3.5"} Hours / Day
                    </span>
                  </div>
                </div>

                {/* Favorite Subjects Tag Pills */}
                {userProfile?.favorite_subjects && userProfile.favorite_subjects.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Favorite Subjects</span>
                    <div className="flex flex-wrap gap-1.5">
                      {userProfile.favorite_subjects.map((sub, i) => (
                        <span key={i} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weak Subjects Tag Pills */}
                {userProfile?.weak_subjects && userProfile.weak_subjects.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Areas of Focus</span>
                    <div className="flex flex-wrap gap-1.5">
                      {userProfile.weak_subjects.map((sub, i) => (
                        <span key={i} className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PERFORMANCE CHARTS CARD */}
              <div className="p-6 bg-white border border-[#E9ECF8] rounded-[24px] shadow-sm space-y-4">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Mock Progression Scores</span>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-neutral-700">
                      <span>Mock Average</span>
                      <span>{userProfile?.mock_average || 72}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${userProfile?.mock_average || 72}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-neutral-700">
                      <span>Syllabus Covered</span>
                      <span>{userProfile?.completion_pct || 64}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${userProfile?.completion_pct || 64}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-neutral-700">
                      <span>Subject Accuracy</span>
                      <span>{userProfile?.accuracy || 81}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${userProfile?.accuracy || 81}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs font-bold text-neutral-700">
                      <span>Total Hours Studied</span>
                      <span>{userProfile?.study_hours_total ? userProfile.study_hours_total.toFixed(2) : 0} hrs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* REAL-TIME STUDY CALENDAR (JULY 2026) */}
              <div className="p-6 bg-white border border-[#E9ECF8] rounded-[24px] shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">July 2026 Calendar</span>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                    Study Heatmap
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-neutral-400 pb-1">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 justify-center">
                  {/* Calendar Padding Cells */}
                  {Array.from({ length: calendarPadding }).map((_, i) => (
                    <div key={`pad-${i}`} className="w-8 h-8 bg-transparent" />
                  ))}

                  {/* Calendar Day Blocks */}
                  {Array.from({ length: daysInJuly }).map((_, i) => {
                    const day = i + 1;
                    const hours = getDayTotalHours(day);
                    const isSelected = selectedDay === day;
                    return (
                      <div
                        key={`day-${day}`}
                        onClick={() => {
                          setSelectedDay(day);
                          // Reset input states when opening day log
                          setEditingLogId(null);
                          setLogSubject("");
                          setLogHours(1);
                          setLogMode("Mock Test");
                        }}
                        className={cn(
                          "w-8 h-8 rounded-lg transition-all border flex items-center justify-center text-[10px] font-bold cursor-pointer hover:scale-105 select-none relative",
                          getDayIntensityColor(day),
                          isSelected ? "ring-2 ring-indigo-500 scale-105 border-indigo-600" : "border-neutral-200/50"
                        )}
                        title={`July ${day}, 2026: ${hours} study hours`}
                      >
                        <span>{day}</span>
                        {hours > 0 && (
                          <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-[9px] font-bold text-neutral-400 pt-2 border-t border-neutral-100">
                  <span>Less Active</span>
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 bg-neutral-100 rounded border border-neutral-200/40"></span>
                    <span className="w-2.5 h-2.5 bg-indigo-100 rounded border border-indigo-200/40"></span>
                    <span className="w-2.5 h-2.5 bg-indigo-300 rounded border border-indigo-300/40"></span>
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded border border-indigo-600/40"></span>
                  </div>
                  <span>High Sprint</span>
                </div>
              </div>

              {/* INTERACTIVE CALENDAR STUDY LOG SUB-CARD / MODAL */}
              {selectedDay !== null && (
                <div className="p-6 bg-white border border-[#E9ECF8] rounded-[24px] shadow-md space-y-4 animate-fade-in relative">
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 border-0 bg-transparent cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <h3 className="font-extrabold text-neutral-900 text-sm text-left">
                    Study Logs: July {selectedDay}, 2026
                  </h3>

                  {/* Display total day hours */}
                  <div className="text-[11px] font-bold text-neutral-500 text-left">
                    Total Hours for this day:{" "}
                    <span className="text-indigo-600">{getDayTotalHours(selectedDay)} hrs</span>
                  </div>

                  {/* List of current logs for the day */}
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {studyLogs.filter((log) => log.day === selectedDay).length === 0 ? (
                      <p className="text-[10px] text-neutral-400 italic text-left">No study logs tracked for today.</p>
                    ) : (
                      studyLogs
                        .filter((log) => log.day === selectedDay)
                        .map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-100"
                          >
                            <div className="space-y-0.5 text-left">
                              <span className="block text-xs font-black text-neutral-800">{log.subject}</span>
                              <div className="flex gap-2 text-[9px] font-bold text-neutral-400">
                                <span>{log.mode}</span>
                                <span>•</span>
                                <span className="text-indigo-600">{log.hours} hours</span>
                              </div>
                            </div>

                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() => handleEditLogStart(log)}
                                className="p-1 hover:bg-indigo-50 hover:text-indigo-600 text-neutral-400 rounded transition-colors cursor-pointer border-0 bg-transparent"
                              >
                                <Settings className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLog(log.id)}
                                className="p-1 hover:bg-rose-50 hover:text-rose-600 text-neutral-400 rounded transition-colors cursor-pointer border-0 bg-transparent"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Save Log Form */}
                  <form onSubmit={handleSaveStudyLog} className="space-y-3 pt-3 border-t border-neutral-100 text-left">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                      {editingLogId ? "Edit Study Log" : "Add Study Log"}
                    </span>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-500 uppercase">Subject Name</label>
                      <input
                        type="text"
                        value={logSubject}
                        onChange={(e) => setLogSubject(e.target.value)}
                        placeholder="e.g. Quantitative Formulas"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-neutral-500 uppercase">Hours Studied</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="24"
                          value={logHours}
                          onChange={(e) => setLogHours(parseFloat(e.target.value) || 0)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-neutral-500 uppercase">Study Mode</label>
                        <select
                          value={logMode}
                          onChange={(e) => setLogMode(e.target.value as "Mock Test" | "Reading" | "Notes")}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Mock Test">Mock Test</option>
                          <option value="Reading">Reading</option>
                          <option value="Notes">Notes</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer border-0"
                      >
                        {editingLogId ? "Update Log" : "Save Log"}
                      </button>
                      {editingLogId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLogId(null);
                            setLogSubject("");
                            setLogHours(1);
                            setLogMode("Mock Test");
                          }}
                          className="px-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          <div className="h-8" />
        </main>
      </div>
    </div>
  );
}

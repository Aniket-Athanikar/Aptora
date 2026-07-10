"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Calendar,
  Clock,
  Compass,
  GraduationCap,
  Award,
  ChevronRight,
  ChevronLeft,
  Check,
  TrendingUp,
  Flame,
  Bell,
  Play,
  Pause,
  Star,
  Brain,
  Video,
  FileText,
  Map,
  Layers,
  HelpCircle,
  Smartphone,
  Mail,
  MessageSquare,
  Trophy,
  RefreshCw,
  ArrowLeft,
  Search,
  Settings,
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  Save,
  Globe,
  BellRing,
  Trash2,
  Send,
  Camera,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/ToastContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Interfaces ---
interface UserProfile {
  name: string;
  email: string;
  avatar_url?: string;
  streak: number;
  xp: number;
  coins: number;
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
}

type OnboardingData = {
  goals: string[];
  exam: string;
  targetDays: number;
  customTargetDays?: number;
  knowledgeLevel: string;
  dailyAvailability: string;
  scheduleShift: string;
  learningStyles: string[];
  subjects: string[];
  weaknesses: Record<string, number>;
  targetScore: number;
  language: string;
  motivationChannels: string[];
  motivationFrequency: string;
};

interface MockQuestion {
  q: string;
  options: string[];
  correct: string;
}

interface MockTest {
  id: string;
  title: string;
  timeLimit: number;
  questionsCount: number;
  questions: MockQuestion[];
}

// --- Mock Data Helpers for Plan Generation ---
const generateWeeklyPlan = (subjects: string[]) => {
  const defaultSubjects = subjects.length > 0 ? subjects : ["Quantitative Aptitude", "Reasoning"];
  return [
    { day: "Monday", subject: defaultSubjects[0] || "Core Concepts", focus: "Fundamental Theory & Basic Formulae", duration: "2 Hours" },
    { day: "Tuesday", subject: defaultSubjects[1] || defaultSubjects[0] || "Practice Set", focus: "Concept Application & Structured MCQs", duration: "2 Hours" },
    { day: "Wednesday", subject: defaultSubjects[2] || defaultSubjects[0] || "Analysis", focus: "Weak Areas Strengthening & Detailed Flashcards", duration: "1.5 Hours" },
    { day: "Thursday", subject: defaultSubjects[3] || defaultSubjects[0] || "Revision", focus: "Spaced Repetition & Formula Revision Sheets", duration: "2 Hours" },
    { day: "Friday", subject: defaultSubjects[4] || defaultSubjects[0] || "Assessment", focus: "Mini-Mock Test and Speed Drilling Exercises", duration: "2.5 Hours" },
    { day: "Saturday", subject: "Full Mock Test", focus: "Full Length Paper & Real-time Exam Simulation", duration: "3 Hours" },
    { day: "Sunday", subject: "Review & Rest", focus: "Doubt Clearance with AI Tutor & Schedule Adjustment", duration: "1 Hour" },
  ];
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, login } = useAuth();
  const { toast } = useToast();

  // Page States
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile data from Backend
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Layout States
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [activeGoalFocus, setActiveGoalFocus] = useState<string>("");

  // CRUD Settings States
  const [settingsName, setSettingsName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsLocation, setSettingsLocation] = useState("");
  const [settingsTimezone, setSettingsTimezone] = useState("Asia/Kolkata");
  const [settingsBio, setSettingsBio] = useState("");

  const [notificationEmail, setNotificationEmail] = useState(true);
  const [notificationPush, setNotificationPush] = useState(true);
  const [notificationWhatsApp, setNotificationWhatsApp] = useState(false);
  const [notificationSMS, setNotificationSMS] = useState(false);

  const [privacyProfile, setPrivacyProfile] = useState(true);
  const [privacyStreaks, setPrivacyStreaks] = useState(true);
  const [privacyAnalytics, setPrivacyAnalytics] = useState(true);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Wizard State
  const [wizardData, setWizardData] = useState<OnboardingData>({
    goals: [],
    exam: "SSC CGL",
    targetDays: 90,
    knowledgeLevel: "Intermediate",
    dailyAvailability: "2h",
    scheduleShift: "Morning",
    learningStyles: ["Mixed"],
    subjects: ["Quantitative Aptitude", "Reasoning", "English"],
    weaknesses: {},
    targetScore: 80,
    language: "English",
    motivationChannels: ["Email"],
    motivationFrequency: "Daily",
  });

  // Pomodoro Widget State
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<"study" | "break">("study");
  const pomodoroIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Calendar State & Logs Persistence ---
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed)
  const [studyLogs, setStudyLogs] = useState<Record<string, { hours: number; notes: string }>>({});
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [calendarHours, setCalendarHours] = useState<number>(2);
  const [calendarNotes, setCalendarNotes] = useState<string>("");
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // --- Checklist States ---
  const [dailyTasks, setDailyTasks] = useState([
    { id: "task1", label: "Complete 25 minutes of Pomodoro Focus Session", completed: false, xpReward: 10 },
    { id: "task2", label: "Flip and study 10 flashcards in Deck", completed: false, xpReward: 10 },
    { id: "task3", label: "Run diagnostic mock test practice session", completed: false, xpReward: 15 },
    { id: "task4", label: "Log study hours in the interactive calendar grid", completed: false, xpReward: 5 },
  ]);

  // --- AI Tutor Chat States ---
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hello! I am your ExamForge AI study coach. Feel free to ask me anything about your current preparation, exam concepts, formulas, or how to design your study schedule!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // --- Revision & Decks States ---
  const [selectedDeckId, setSelectedDeckId] = useState<string>("deck1");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  
  const decksData = {
    deck1: {
      title: "Quantitative Formulas",
      icon: Award,
      cards: [
        { q: "What is the formula for the volume of a Sphere?", a: "Volume = (4/3) * π * r³" },
        { q: "What is the formula for Compound Interest?", a: "A = P * (1 + r/n)^(nt)" },
        { q: "Explain the Quadratic Formula.", a: "x = [-b ± √(b² - 4ac)] / (2a)" },
        { q: "Formula for Sum of interior angles of a polygon?", a: "Sum = (n - 2) * 180°" },
      ]
    },
    deck2: {
      title: "General Awareness Trivia",
      icon: Compass,
      cards: [
        { q: "Who is known as the Father of the Indian Constitution?", a: "Dr. B. R. Ambedkar" },
        { q: "Which article of the Indian Constitution guarantees the Right to Equality?", a: "Articles 14 to 18" },
        { q: "Where is the headquarters of the Reserve Bank of India located?", a: "Mumbai, India" },
        { q: "What is the currency of Japan?", a: "Japanese Yen (¥)" },
      ]
    },
    deck3: {
      title: "English Idioms & Vocabulary",
      icon: Brain,
      cards: [
        { q: "What is the meaning of 'Bite the bullet'?", a: "To face a difficult situation with courage and fortitude." },
        { q: "What does 'Spill the beans' mean?", a: "To reveal a secret or confidential information prematurely." },
        { q: "What is the antonym of 'Ephemeral'?", a: "Permanent, Eternal, or Long-lasting." },
      ]
    }
  };

  // --- Mock Test Suite States ---
  const [activeMockTest, setActiveMockTest] = useState<MockTest | null>(null);
  const [mockCurrentQuestion, setMockCurrentQuestion] = useState(0);
  const [mockAnswers, setMockAnswers] = useState<Record<number, string>>({});
  const [mockTimer, setMockTimer] = useState(0);
  const mockTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [mockResults, setMockResults] = useState<Array<{ testName: string; score: string; date: string }>>([
    { testName: "SSC CGL Practice Mock #1", score: "84/100 (84%)", date: "July 08, 2026" },
  ]);

  const mockTestsList: MockTest[] = [
    {
      id: "ssc_cgl_1",
      title: "SSC CGL Full-Length Prep Mock",
      timeLimit: 120, 
      questionsCount: 5,
      questions: [
        { q: "If A:B = 2:3 and B:C = 4:5, what is A:B:C?", options: ["8:12:15", "2:4:5", "4:6:5", "8:10:15"], correct: "8:12:15" },
        { q: "Which part of the Constitution deals with Fundamental Rights?", options: ["Part II", "Part III", "Part IV", "Part V"], correct: "Part III" },
        { q: "The word 'Sovereign' in the Preamble means:", options: ["Independent state", "Subject to foreign rule", "Religious state", "Military dictatorship"], correct: "Independent state" },
        { q: "Find the odd one out: 27, 64, 125, 144", options: ["27", "64", "125", "144"], correct: "144" },
        { q: "Identify the correct spelling:", options: ["Accommodation", "Acomodation", "Accomodation", "Acommodation"], correct: "Accommodation" },
      ]
    },
    {
      id: "upsc_pre_1",
      title: "UPSC General Studies Mini-Mock",
      timeLimit: 180,
      questionsCount: 3,
      questions: [
        { q: "Which fundamental right cannot be suspended even during a National Emergency?", options: ["Article 19", "Article 20 & 21", "Article 22", "Article 32"], correct: "Article 20 & 21" },
        { q: "Where does the River Narmada originate from?", options: ["Satpura Range", "Aravalli Range", "Amarakantak Hills", "Western Ghats"], correct: "Amarakantak Hills" },
        { q: "Who was the founder of the Maurya Empire?", options: ["Ashoka", "Chandragupta Maurya", "Bindusara", "Harsha"], correct: "Chandragupta Maurya" },
      ]
    },
    {
      id: "reasoning_1",
      title: "Analytical Reasoning & Speed Test",
      timeLimit: 90,
      questionsCount: 3,
      questions: [
        { q: "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?", options: ["Mother", "Sister", "Grandmother", "Aunt"], correct: "Mother" },
        { q: "If CLOCK is coded as KCOLC, then steps is coded as:", options: ["spetS", "spets", "STPES", "stepS"], correct: "spets" },
        { q: "In a row of trees, a tree is 7th from either end. How many trees are in the row?", options: ["13", "14", "15", "12"], correct: "13" },
      ]
    }
  ];

  // Auth sync
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

  // Load profile, onboarding status, and study logs on mount
  useEffect(() => {
    if (authLoading) return;
    
    const completed = localStorage.getItem("ef_onboarding_completed") !== "false";
    setIsOnboardingCompleted(completed);

    const savedLogs = localStorage.getItem("ef_study_logs");
    if (savedLogs) {
      try {
        setStudyLogs(JSON.parse(savedLogs));
      } catch (err) {
        console.error("Error loading study logs:", err);
      }
    }

    if (user?.email) {
      setProfileLoading(true);
      fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.profile) {
            setUserProfile(data.profile);
            const prof = data.profile;
            
            setSettingsName(prof.name || "");
            setSettingsPhone(prof.phone || "");
            setSettingsLocation(prof.location || "");
            setSettingsTimezone(prof.timezone || "Asia/Kolkata");
            setSettingsBio(prof.bio || "");

            setNotificationEmail(prof.notification_settings?.email !== false);
            setNotificationPush(prof.notification_settings?.push !== false);
            setNotificationWhatsApp(prof.notification_settings?.whatsapp === true);
            setNotificationSMS(prof.notification_settings?.sms === true);

            setPrivacyProfile(prof.privacy_settings?.profile_visibility !== false);
            setPrivacyStreaks(prof.privacy_settings?.public_streaks !== false);
            setPrivacyAnalytics(prof.privacy_settings?.analytics_sharing !== false);

            if (prof.target_exam) {
              const targetDaysVal = prof.dob ? parseInt(prof.dob) || 90 : 90;
              setWizardData((prev) => ({
                ...prev,
                exam: prof.target_exam || prev.exam,
                targetScore: parseInt(prof.target_score) || prev.targetScore,
                targetDays: targetDaysVal,
                subjects: prof.favorite_subjects && prof.favorite_subjects.length > 0 ? prof.favorite_subjects : prev.subjects,
                weaknesses: prof.weak_subjects?.reduce((acc: Record<string, number>, curr: string) => {
                  acc[curr] = prev.weaknesses[curr] || 3;
                  return acc;
                }, {} as Record<string, number>) || prev.weaknesses,
              }));
            }
          }
        })
        .catch((err) => console.error("Error loading profile:", err))
        .finally(() => setProfileLoading(false));
    }
  }, [authLoading, user]);

  // Sidebar expanded synced with LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("ef_sidebar_expanded");
    if (saved !== null) {
      setIsSidebarExpanded(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !isSidebarExpanded;
    setIsSidebarExpanded(nextState);
    localStorage.setItem("ef_sidebar_expanded", String(nextState));
  };

  // Sync primary goal to dashboard adaptive view
  useEffect(() => {
    if (wizardData.goals && wizardData.goals.length > 0 && !activeGoalFocus) {
      setActiveGoalFocus(wizardData.goals[0]);
    }
  }, [wizardData.goals, activeGoalFocus]);

  const getSelectedDaysVal = useCallback(() => {
    if (wizardData.targetDays === -1) {
      return wizardData.customTargetDays || 30;
    }
    return wizardData.targetDays;
  }, [wizardData.targetDays, wizardData.customTargetDays]);

  const getPaceHours = useCallback(() => {
    const days = getSelectedDaysVal();
    const baseHoursNeeded = wizardData.exam === "UPSC" ? 1200 : wizardData.exam === "JEE" || wizardData.exam === "NEET" ? 1000 : 600;
    return (baseHoursNeeded / days).toFixed(1);
  }, [wizardData.exam, getSelectedDaysVal]);

  const getPaceSpeedDescription = useCallback(() => {
    const pace = parseFloat(getPaceHours());
    if (pace > 8) return "Ultra Intensive. 99th Percentile Pacing Required.";
    if (pace > 5) return "Fast-Track Mode. High Study Commitment.";
    if (pace > 3) return "Moderate/Optimal Pace. Balanced Learning Arc.";
    return "Steady Habitual Pace. Comfort Study Zone.";
  }, [getPaceHours]);

  // Helper to award XP and update backend/frontend
  const triggerXpAward = useCallback(async (amount: number, reason: string) => {
    if (!user?.email) return;
    const updatedXp = (userProfile?.xp || 320) + amount;
    const updatedCoins = (userProfile?.coins || 120) + Math.ceil(amount / 2);
    
    // Optimistic UI updates
    setUserProfile((prev: UserProfile | null) => {
      if (!prev) return null;
      return {
        ...prev,
        xp: updatedXp,
        coins: updatedCoins,
      };
    });

    toast(`Earned +${amount} XP & +${Math.ceil(amount / 2)} Coins! (${reason})`, "success");

    try {
      await fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xp: updatedXp,
          coins: updatedCoins,
        }),
      });
    } catch (e) {
      console.error("Error saving XP rewards:", e);
    }
  }, [user, userProfile, toast]);

  // Pomodoro Timer Logic
  useEffect(() => {
    if (pomodoroActive) {
      pomodoroIntervalRef.current = setInterval(() => {
        setPomodoroTime((prev) => {
          if (prev <= 1) {
            if (pomodoroMode === "study") {
              setPomodoroMode("break");
              toast("Pomodoro Completed! Take a short 5-minute break.", "info");
              triggerXpAward(15, "Completed Pomodoro Session");
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
  }, [pomodoroActive, pomodoroMode, toast, triggerXpAward]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Mock Test Timer Logic
  useEffect(() => {
    if (activeMockTest) {
      mockTimerIntervalRef.current = setInterval(() => {
        setMockTimer((t) => t + 1);
      }, 1000);
    } else {
      if (mockTimerIntervalRef.current) {
        clearInterval(mockTimerIntervalRef.current);
      }
    }
    return () => {
      if (mockTimerIntervalRef.current) clearInterval(mockTimerIntervalRef.current);
    };
  }, [activeMockTest]);

  // Onboarding step timer simulation (Step 13)
  useEffect(() => {
    if (onboardingStep === 13) {
      const timer = setTimeout(() => {
        setOnboardingStep(14);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [onboardingStep]);

  // Finish Onboarding
  const handleFinishOnboarding = async () => {
    setSavingProfile(true);
    try {
      const days = getSelectedDaysVal();
      const payload = {
        target_exam: wizardData.exam,
        target_score: `${wizardData.targetScore}%`,
        study_hours_goal: parseFloat(getPaceHours()),
        weak_subjects: Object.keys(wizardData.weaknesses),
        favorite_subjects: wizardData.subjects,
        secondary_exam: wizardData.language,
        dob: `${days} Days`,
      };

      if (user?.email) {
        const res = await fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const updated = await res.json();
          if (updated.success) {
            setUserProfile(updated.profile);
          }
        }
      }

      localStorage.setItem("ef_onboarding_completed", "true");
      setIsOnboardingCompleted(true);
      toast("Onboarding Completed successfully!", "success");
    } catch (e) {
      console.error("Failed to sync profile to database:", e);
      localStorage.setItem("ef_onboarding_completed", "true");
      setIsOnboardingCompleted(true);
    } finally {
      setSavingProfile(false);
    }
  };

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

          if (user?.email) {
            fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                avatar_url: compressedBase64,
              }),
            })
              .then((res) => {
                if (res.ok) {
                  return res.json();
                }
              })
              .then((data) => {
                if (data?.success && data?.profile) {
                  setUserProfile(data.profile);
                  login({ name: data.profile.name, email: user.email, avatar: data.profile.avatar_url });
                  toast("Profile picture updated successfully!", "success");
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

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setSavingProfile(true);
    try {
      const payload = {
        name: settingsName,
        phone: settingsPhone,
        location: settingsLocation,
        timezone: settingsTimezone,
        bio: settingsBio,
        notification_settings: {
          email: notificationEmail,
          push: notificationPush,
          whatsapp: notificationWhatsApp,
          sms: notificationSMS,
        },
        privacy_settings: {
          profile_visibility: privacyProfile,
          public_streaks: privacyStreaks,
          analytics_sharing: privacyAnalytics,
        }
      };

      const res = await fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          setUserProfile(data.profile);
          login({ name: data.profile.name, email: data.profile.email });
          toast("Settings saved successfully!", "success");
        } else {
          toast("Failed to update settings.", "error");
        }
      } else {
        toast("Error saving settings data.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Connection error while saving settings.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    if (newPassword !== confirmPassword) {
      toast("New passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 8) {
      toast("Password must be at least 8 characters.", "error");
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          otp: "123456",
          new_password: newPassword,
        }),
      });

      if (res.ok) {
        toast("Password updated successfully!", "success");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        toast(data.detail || "Failed to update password.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Connection error during password change.", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Update Roadmap & Goals
  const handleUpdateRoadmapGoals = async () => {
    if (!user?.email) return;
    setSavingProfile(true);
    try {
      const days = getSelectedDaysVal();
      const payload = {
        target_exam: wizardData.exam,
        target_score: `${wizardData.targetScore}%`,
        study_hours_goal: parseFloat(getPaceHours()),
        weak_subjects: Object.keys(wizardData.weaknesses),
        favorite_subjects: wizardData.subjects,
        dob: `${days} Days`,
      };

      const res = await fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          setUserProfile(data.profile);
          toast("Roadmap goals recalculated and synced!", "success");
        } else {
          toast("Failed to update goals.", "error");
        }
      } else {
        toast("Error syncing roadmap goals.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Connection error during roadmap sync.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResetOnboarding = () => {
    localStorage.setItem("ef_onboarding_completed", "false");
    setIsOnboardingCompleted(false);
    setOnboardingStep(1);
    setWizardData({
      goals: [],
      exam: "SSC CGL",
      targetDays: 90,
      knowledgeLevel: "Intermediate",
      dailyAvailability: "2h",
      scheduleShift: "Morning",
      learningStyles: ["Mixed"],
      subjects: ["Quantitative Aptitude", "Reasoning", "English"],
      weaknesses: {},
      targetScore: 80,
      language: "English",
      motivationChannels: ["Email"],
      motivationFrequency: "Daily",
    });
  };

  // --- Checklist Toggle Function ---
  const toggleDailyTask = (id: string) => {
    setDailyTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            triggerXpAward(t.xpReward, `Completed task: ${t.label}`);
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  // --- Calendar Helpers & Handlers ---
  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handleDayClick = (day: number) => {
    const dateKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    setSelectedCalendarDate(dateKey);
    const existingLog = studyLogs[dateKey];
    setCalendarHours(existingLog ? existingLog.hours : 2);
    setCalendarNotes(existingLog ? existingLog.notes : "");
    setIsCalendarModalOpen(true);
  };

  const saveStudyLog = () => {
    if (!selectedCalendarDate) return;
    const updated = {
      ...studyLogs,
      [selectedCalendarDate]: {
        hours: calendarHours,
        notes: calendarNotes
      }
    };
    setStudyLogs(updated);
    localStorage.setItem("ef_study_logs", JSON.stringify(updated));
    setIsCalendarModalOpen(false);

    // Dynamic XP Reward & Streaks Trigger
    triggerXpAward(15, `Logged ${calendarHours}h study session on ${selectedCalendarDate}`);
    
    // Increment streak in profile
    if (userProfile) {
      const nextStreak = userProfile.streak + 1;
      setUserProfile((prev: UserProfile | null) => prev ? { ...prev, streak: nextStreak } : null);
      if (user?.email) {
        fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ streak: nextStreak }),
        }).catch(err => console.error("Error logging streak update:", err));
      }
    }
  };

  const deleteStudyLog = () => {
    if (!selectedCalendarDate) return;
    const updated = { ...studyLogs };
    delete updated[selectedCalendarDate];
    setStudyLogs(updated);
    localStorage.setItem("ef_study_logs", JSON.stringify(updated));
    setIsCalendarModalOpen(false);
    toast("Study log removed", "info");
  };

  const getIntensityClass = (dateKey: string) => {
    const log = studyLogs[dateKey];
    if (!log || log.hours === 0) return "bg-neutral-100 hover:bg-neutral-200 border-neutral-200";
    if (log.hours <= 2) return "bg-indigo-100 border-indigo-200 hover:bg-indigo-200 text-indigo-800";
    if (log.hours <= 4) return "bg-indigo-300 border-indigo-400 hover:bg-indigo-400 text-indigo-950 font-semibold";
    return "bg-indigo-600 border-indigo-700 hover:bg-indigo-700 text-white font-bold";
  };

  // --- AI Tutor Stream Simulation ---
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setIsAiTyping(true);

    // Simulate Streaming replies
    setTimeout(() => {
      let botResponse = "";
      if (userMsg.toLowerCase().includes("quant") || userMsg.toLowerCase().includes("math")) {
        botResponse = "For Quantitative Aptitude, focusing on speed and accuracy is key. Start by memorizing squares up to 30, cubes up to 20, and fractional values of percentages. Let's practice: 'A and B together can complete a work in 12 days. A alone can do it in 20 days. In how many days can B alone finish it?' (Tip: B's days = 1 / [1/12 - 1/20] = 30 days.)";
      } else if (userMsg.toLowerCase().includes("test") || userMsg.toLowerCase().includes("mock")) {
        botResponse = "Mock tests are the ultimate weapon. Take at least one sectional test every 2 days. The secret lies in analysis: review all wrong answers and find out if they were due to conceptual gap, silly mistake, or timing pressure.";
      } else if (userMsg.toLowerCase().includes("streak") || userMsg.toLowerCase().includes("habit")) {
        botResponse = "Streaks help build psychological momentum. Use the interactive calendar below the Workspace dashboard to document even a quick 30-minute focus session. I will automatically log your rewards!";
      } else {
        botResponse = `Understood. For the ${wizardData.exam} syllabus, let's break down this query. Our core focus should be spaced repetition of formulas and weak concepts. What specific sub-topic or question would you like us to resolve next?`;
      }

      setIsAiTyping(false);
      
      // Simulating real-time text character stream
      let index = 0;
      let streamedMessage = "";
      setChatMessages((prev) => [...prev, { sender: "ai", text: "" }]);
      
      const interval = setInterval(() => {
        if (index < botResponse.length) {
          streamedMessage += botResponse[index];
          setChatMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { sender: "ai", text: streamedMessage };
            return next;
          });
          index++;
        } else {
          clearInterval(interval);
        }
      }, 15);
    }, 1500);
  };

  // --- Flashcard Review Actions ---
  const currentDeck = decksData[selectedDeckId as keyof typeof decksData];
  const totalCards = currentDeck.cards.length;

  const handleCardNext = () => {
    setIsCardFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((i) => (i + 1) % totalCards);
    }, 150);
  };

  const handleCardPrev = () => {
    setIsCardFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((i) => (i === 0 ? totalCards - 1 : i - 1));
    }, 150);
  };

  // --- Mock Test Practice Simulator ---
  const startMockTest = (test: MockTest) => {
    setActiveMockTest(test);
    setMockCurrentQuestion(0);
    setMockAnswers({});
    setMockTimer(0);
    toast(`Started ${test.title}! Timer is ticking.`, "info");
  };

  const selectMockAnswer = (qIndex: number, option: string) => {
    setMockAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const submitMockTest = () => {
    if (!activeMockTest) return;
    let correctCount = 0;
    activeMockTest.questions.forEach((q: MockQuestion, idx: number) => {
      if (mockAnswers[idx] === q.correct) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / activeMockTest.questions.length) * 100);
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const scoreStr = `${correctCount}/${activeMockTest.questions.length} (${scorePct}%)`;

    // Log Result
    const newResult = {
      testName: activeMockTest.title,
      score: scoreStr,
      date: dateStr
    };

    setMockResults((prev) => [newResult, ...prev]);
    setActiveMockTest(null);

    // Award rewards
    const xpEarned = 30 + correctCount * 10;
    triggerXpAward(xpEarned, `Finished Mock Test: ${scorePct}% accuracy`);
  };

  // Hydration / Loading Check
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

  // --- RENDERING 14-STEP ONBOARDING WIZARD ---
  const renderOnboardingWizard = () => {
    return (
      <div className="min-h-screen bg-[#FAFBFF] relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-10 font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-purple-300/30 to-indigo-400/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-300/20 to-purple-400/30 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-4xl flex items-center justify-between mb-8 z-10">
          <div 
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 cursor-pointer group transition-all duration-300 hover:scale-105"
            title="Go to Home"
          >
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/10 text-white transition-transform group-hover:rotate-6">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold tracking-wider text-neutral-900 uppercase text-lg">
              EXAM FORGE<span className="text-indigo-600"> AI</span>
            </span>
          </div>
          <div className="text-xs font-semibold text-neutral-500 bg-neutral-200/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-200">
            Step {onboardingStep} of 14
          </div>
        </div>

        <div className="w-full max-w-4xl min-h-[520px] bg-white/80 backdrop-blur-xl border border-[#E9ECF8] rounded-[24px] shadow-[0_20px_50px_rgba(109,74,255,0.03)] p-6 md:p-12 relative flex flex-col justify-between overflow-hidden z-10">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-50">
            <motion.div 
              className="h-full bg-indigo-600" 
              initial={{ width: "0%" }}
              animate={{ width: `${(onboardingStep / 14) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={onboardingStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-grow flex flex-col justify-center"
            >
              {onboardingStep === 1 && (
                <div className="text-center max-w-2xl mx-auto space-y-6">

                  <div className="inline-flex p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                    Welcome, <span className="text-indigo-600">{user?.name || "Mrunal"}</span>
                  </h1>
                  <p className="text-neutral-500 text-sm md:text-base font-medium leading-relaxed max-w-lg mx-auto">
                    {"Let's forge your personalized, high-performance AI learning journey. Together, we'll design an optimized roadmap tailored to your specific targets and availability."}
                  </p>
                  <div className="pt-4 flex flex-col sm:flex-row gap-3 items-center justify-center">
                    <button
                      onClick={() => setOnboardingStep(2)}
                      className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Start Setup Wizard <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setWizardData({
                          ...wizardData,
                          goals: ["Crack Government Exam", "Mock Test Practice"],
                        });
                        setOnboardingStep(13);
                      }}
                      className="w-full sm:w-auto px-6 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Skip with Default Settings
                    </button>
                  </div>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900">Define Your Learning Goals</h2>
                    <p className="text-neutral-500 font-medium text-sm md:text-base">Select all objectives that resonate with your target path.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { id: "Crack Government Exam", title: "Crack Government Exam", desc: "Systematic alignment with civil/state exam blueprints." },
                      { id: "Improve Knowledge", title: "Improve Knowledge", desc: "Focus on in-depth mastery of core concepts." },
                      { id: "Daily Learning Habit", title: "Daily Learning Habit", desc: "Build solid everyday learning routine & streaks." },
                      { id: "Score 95%+", title: "Score 95%+", desc: "Maximize percentile, velocity, and scoring edge." },
                      { id: "Quick Revision", title: "Quick Revision", desc: "Targeted spaced repetition and key notes." },
                      { id: "Mock Test Practice", title: "Mock Test Practice", desc: "Drill realistic exam situations & time strategies." },
                      { id: "Interview Prep", title: "Interview Prep", desc: "Tackle core technical viva and verbal assessments." },
                      { id: "Custom Goal", title: "Custom Goal", desc: "Personalized syllabus tailor-made by our AI." },
                    ].map((g) => {
                      const selected = wizardData.goals.includes(g.id);
                      return (
                        <div
                          key={g.id}
                          onClick={() => {
                            setWizardData((prev) => ({
                              ...prev,
                              goals: selected ? prev.goals.filter((x) => x !== g.id) : [...prev.goals, g.id],
                            }));
                          }}
                          className={cn(
                            "p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200",
                            selected
                              ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                              : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                          )}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="font-bold text-neutral-900 text-sm md:text-base">{g.title}</span>
                            <div className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center border transition-all",
                              selected ? "bg-indigo-600 border-indigo-600 text-white" : "border-neutral-300"
                            )}>
                              {selected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                          <p className="text-xs text-neutral-500 font-medium">{g.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {onboardingStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-955">Which Target Exam?</h2>
                    <p className="text-neutral-500 font-medium text-sm md:text-base">We will configure syllabus structures and AI assessments specifically for this template.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["SSC CGL", "UPSC", "JEE", "NEET", "MPSC", "Banking", "Police", "State PSC", "Other"].map((examName) => {
                      const selected = wizardData.exam === examName;
                      return (
                        <button
                          key={examName}
                          onClick={() => setWizardData((prev) => ({ ...prev, exam: examName }))}
                          className={cn(
                            "p-5 rounded-2xl border font-bold text-sm md:text-base transition-all cursor-pointer",
                            selected
                              ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                              : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                          )}
                        >
                          {examName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {onboardingStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900">Define Timeline Limit</h2>
                    <p className="text-neutral-500 font-medium text-sm">How long do you have until exam day? Let our engine optimize your daily study quota.</p>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {[30, 60, 90, 180, 365].map((d) => (
                      <button
                        key={d}
                        onClick={() => setWizardData((prev) => ({ ...prev, targetDays: d }))}
                        className={cn(
                          "py-3.5 px-2 rounded-xl border font-bold text-xs md:text-sm transition-all cursor-pointer",
                          wizardData.targetDays === d
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                        )}
                      >
                        {d} Days
                      </button>
                    ))}
                    <button
                      onClick={() => setWizardData((prev) => ({ ...prev, targetDays: -1 }))}
                      className={cn(
                        "py-3.5 px-2 rounded-xl border font-bold text-xs md:text-sm transition-all cursor-pointer",
                        wizardData.targetDays === -1
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                      )}
                    >
                      Custom
                    </button>
                  </div>

                  {wizardData.targetDays === -1 && (
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 max-w-sm">
                      <label className="block text-xs font-extrabold text-neutral-700 mb-1">Enter Target Days</label>
                      <input
                        type="number"
                        min="7"
                        max="730"
                        value={wizardData.customTargetDays || ""}
                        onChange={(e) => setWizardData((prev) => ({ ...prev, customTargetDays: parseInt(e.target.value) || undefined }))}
                        placeholder="e.g., 45"
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white"
                      />
                    </div>
                  )}

                  <div className="p-6 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-4">
                    <h3 className="font-extrabold text-neutral-900 text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-600" /> Target Pace Analytics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="block text-xs font-semibold text-neutral-500">Timeline</span>
                        <span className="text-xl font-extrabold text-indigo-900">{getSelectedDaysVal()} Days Remaining</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-neutral-500">Required Pace</span>
                        <span className="text-xl font-extrabold text-indigo-900">{getPaceHours()} Hours/Day</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-neutral-500">Speed Profile</span>
                        <span className="text-xs font-bold text-indigo-600 block mt-1">{getPaceSpeedDescription()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {onboardingStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900">Current Knowledge Standing</h2>
                    <p className="text-neutral-500 font-medium text-sm md:text-base">We adjust diagnostic complexity based on your background.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: "Beginner", label: "Beginner", desc: "No prior experience. Starting completely from scratch." },
                      { id: "Intermediate", label: "Intermediate", desc: "Understand basic schemas, need formula drills & logic flow." },
                      { id: "Advanced", label: "Advanced", desc: "Very comfortable. Focusing on extreme percentile improvements." },
                      { id: "Already Attempted", label: "Already Attempted", desc: "Retaking the exam. Goal is rectifying bottleneck subjects." },
                      { id: "Working Professional", label: "Working Professional", desc: "High conceptual capacity, restricted review timeframes." },
                      { id: "Student", label: "Regular Student", desc: "Continuous academic flow. Adapting structured revision cycles." },
                    ].map((k) => {
                      const selected = wizardData.knowledgeLevel === k.id;
                      return (
                        <div
                          key={k.id}
                          onClick={() => setWizardData((prev) => ({ ...prev, knowledgeLevel: k.id }))}
                          className={cn(
                            "p-4 rounded-xl border text-left cursor-pointer transition-all",
                            selected
                              ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                              : "border-neutral-200 hover:bg-neutral-50"
                          )}
                        >
                          <span className="block font-bold text-sm md:text-base text-neutral-900">{k.label}</span>
                          <span className="block text-xs text-neutral-500 mt-1 font-medium">{k.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {onboardingStep === 6 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900">Availability Preferences</h2>
                    <p className="text-neutral-500 font-medium text-sm">Select study capacity and shifts that match your daily productivity windows.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs font-extrabold text-neutral-600 mb-2">Daily Commitment Hours</span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {["30min", "1h", "2h", "4h", "6h", "8h+"].map((h) => (
                          <button
                            key={h}
                            onClick={() => setWizardData((prev) => ({ ...prev, dailyAvailability: h }))}
                            className={cn(
                              "py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                              wizardData.dailyAvailability === h
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                : "border-neutral-200 text-neutral-600 bg-white"
                            )}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-neutral-600 mb-2">Primary Shift Window</span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {["Morning", "Afternoon", "Evening", "Night", "Weekend Only"].map((shift) => (
                          <button
                            key={shift}
                            onClick={() => setWizardData((prev) => ({ ...prev, scheduleShift: shift }))}
                            className={cn(
                              "py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                              wizardData.scheduleShift === shift
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                : "border-neutral-200 text-neutral-600 bg-white"
                            )}
                          >
                            {shift}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {onboardingStep === 7 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900">Your Preferred Learning Media</h2>
                    <p className="text-neutral-500 font-medium text-sm md:text-base">We prioritize layouts based on your selected materials.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "Videos", label: "Video Masterclasses", icon: Video },
                      { id: "Notes", label: "Comprehensive Study Notes", icon: FileText },
                      { id: "Mind Maps", label: "Interactive Mind Maps", icon: Map },
                      { id: "Flashcards", label: "Spaced Repetition Flashcards", icon: Layers },
                      { id: "MCQs", label: "AI Practice MCQs & Quizzes", icon: HelpCircle },
                      { id: "Mixed", label: "Balanced Mixed Media Route", icon: Brain },
                    ].map((style) => {
                      const selected = wizardData.learningStyles.includes(style.id);
                      const IconComp = style.icon;
                      return (
                        <div
                          key={style.id}
                          onClick={() => {
                            setWizardData((prev) => ({
                              ...prev,
                              learningStyles: selected ? prev.learningStyles.filter((x) => x !== style.id) : [...prev.learningStyles, style.id],
                            }));
                          }}
                          className={cn(
                            "p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all",
                            selected ? "border-indigo-600 bg-indigo-50/50 shadow-sm" : "border-neutral-200 hover:bg-neutral-50"
                          )}
                        >
                          <div className={cn("p-2 rounded-lg", selected ? "bg-indigo-600 text-white" : "bg-neutral-100 text-neutral-600")}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-xs md:text-sm text-neutral-900">{style.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {onboardingStep === 8 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900">Select Exam Subjects</h2>
                    <p className="text-neutral-500 font-medium text-sm">Choose the specific branches of your exam syllabus you plan to master.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      "Quantitative Aptitude",
                      "Reasoning",
                      "English",
                      "General Awareness",
                      "History",
                      "Geography",
                      "Polity",
                      "Science",
                    ].map((subName) => {
                      const selected = wizardData.subjects.includes(subName);
                      return (
                        <button
                          key={subName}
                          onClick={() => {
                            setWizardData((prev) => ({
                              ...prev,
                              subjects: selected ? prev.subjects.filter((x) => x !== subName) : [...prev.subjects, subName],
                            }));
                          }}
                          className={cn(
                            "p-4 rounded-xl border font-bold text-xs md:text-sm transition-all text-center cursor-pointer",
                            selected
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                          )}
                        >
                          {subName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {onboardingStep === 9 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900">Current Confidence Rating</h2>
                    <p className="text-neutral-500 font-medium text-sm">Rate your self-confidence levels in each of the chosen topics (1 = Weak, 5 = Mastered).</p>
                  </div>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {wizardData.subjects.map((sub) => {
                      const rating = wizardData.weaknesses[sub] || 3;
                      return (
                        <div key={sub} className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                          <span className="font-bold text-xs md:text-sm text-neutral-700">{sub}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => {
                                  setWizardData((prev) => ({
                                    ...prev,
                                    weaknesses: { ...prev.weaknesses, [sub]: star },
                                  }));
                                }}
                                className="focus:outline-none transition-transform active:scale-125 border-0 bg-transparent cursor-pointer"
                              >
                                <Star className={cn("w-5 h-5 transition-colors", star <= rating ? "fill-yellow-400 text-yellow-400" : "text-neutral-300")} />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {onboardingStep === 10 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900">Define Target Score</h2>
                    <p className="text-neutral-500 font-medium text-sm">Set your desired percentile. Our simulator projects your overall rank cohort.</p>
                  </div>
                  <div className="space-y-6 py-6">
                    <div className="relative">
                      <input
                        type="range"
                        min="50"
                        max="98"
                        value={wizardData.targetScore}
                        onChange={(e) => setWizardData((prev) => ({ ...prev, targetScore: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                      />
                      <div className="flex justify-between text-xs font-bold text-neutral-500 mt-2">
                        <span>50% (Passing Threshold)</span>
                        <span>75% (Merit Cohort)</span>
                        <span>98% (Topper Rank)</span>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg space-y-3">
                      <div className="flex items-center justify-between border-b border-white/20 pb-2">
                        <span className="text-xs font-semibold text-indigo-100">Simulated AI Target Score</span>
                        <span className="text-2xl font-black">{wizardData.targetScore}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-indigo-100">Estimated Rank</span>
                          <span className="text-lg font-extrabold">
                            {wizardData.targetScore >= 95 ? "Under 150" : wizardData.targetScore >= 85 ? "Rank 500 - 1500" : wizardData.targetScore >= 70 ? "Rank 2000 - 8000" : "Rank 15000+"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-indigo-100">Percentile Tier</span>
                          <span className="text-lg font-extrabold">
                            {wizardData.targetScore >= 95 ? "Top 0.5%" : wizardData.targetScore >= 85 ? "Top 3%" : wizardData.targetScore >= 70 ? "Top 12%" : "Tier-3 Match"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {onboardingStep === 11 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-955">Select Syllabus Language</h2>
                    <p className="text-neutral-500 font-medium text-sm md:text-base">All generated mock materials and lecture notes will adjust to this choice.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {["English", "Hindi", "Marathi", "Tamil", "Mixed (Hinglish)", "Mixed (English/Marathi)"].map((lang) => {
                      const selected = wizardData.language === lang;
                      return (
                        <button
                          key={lang}
                          onClick={() => setWizardData((prev) => ({ ...prev, language: lang }))}
                          className={cn(
                            "p-5 rounded-xl border font-bold text-sm md:text-base transition-all cursor-pointer",
                            selected
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                          )}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {onboardingStep === 12 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900">Study Notifications</h2>
                    <p className="text-neutral-500 font-medium text-sm">Choose notification triggers to build consistent everyday learning streaks.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs font-extrabold text-neutral-600 mb-2">Notification Channels</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: "Email", label: "Email Daily Digest", icon: Mail },
                          { id: "Push", label: "Browser Push Alerts", icon: Bell },
                          { id: "WhatsApp", label: "WhatsApp Study Group", icon: MessageSquare },
                          { id: "SMS", label: "SMS Reminders", icon: Smartphone },
                        ].map((c) => {
                          const selected = wizardData.motivationChannels.includes(c.id);
                          const IconComp = c.icon;
                          return (
                            <div
                              key={c.id}
                              onClick={() => {
                                      setWizardData((prev) => ({
                                        ...prev,
                                        motivationChannels: selected ? prev.motivationChannels.filter((x) => x !== c.id) : [...prev.motivationChannels, c.id],
                                      }));
                              }}
                              className={cn(
                                "p-3.5 rounded-xl border flex flex-col items-center gap-2 cursor-pointer text-center transition-all",
                                selected ? "border-indigo-600 bg-indigo-50/50" : "border-neutral-200 hover:bg-neutral-50"
                              )}
                            >
                              <IconComp className={cn("w-5 h-5", selected ? "text-indigo-600" : "text-neutral-400")} />
                              <span className="font-bold text-xs text-neutral-700">{c.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-neutral-600 mb-2">Frequency</span>
                      <div className="grid grid-cols-3 gap-2">
                        {["Daily Digest", "Weekly Check-ins", "Before shifts only"].map((freq) => (
                          <button
                            key={freq}
                            onClick={() => setWizardData((prev) => ({ ...prev, motivationFrequency: freq }))}
                            className={cn(
                              "py-2 px-1 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                              wizardData.motivationFrequency === freq
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                : "border-neutral-200 text-neutral-600 bg-white"
                            )}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {onboardingStep === 13 && (
                <div className="text-center max-w-lg mx-auto space-y-6 py-8">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
                    <div className="absolute inset-0 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
                    <Brain className="w-8 h-8 text-indigo-600 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-extrabold text-neutral-900">ExamForge Engine Processing</h2>
                    <p className="text-neutral-500 font-medium text-xs">Simulating personalized learning schedule parameters...</p>
                  </div>
                  <div className="h-8 flex items-center justify-center font-bold text-sm text-indigo-600">
                    <span className="animate-pulse">✔ Calibrating custom dynamic syllabus...</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
                    <motion.div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.8, ease: "linear" }}
                    />
                  </div>
                </div>
              )}

              {onboardingStep === 14 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 flex items-center justify-center md:justify-start gap-2">
                      Your AI Study Roadmap <Sparkles className="w-6 h-6 text-indigo-600 fill-indigo-100" />
                    </h2>
                    <p className="text-neutral-500 font-medium text-sm">Review the plan generated by the ExamForge Engine.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-100/80 space-y-3.5">
                      <div className="flex justify-between items-center border-b border-indigo-200/50 pb-2">
                        <span className="text-xs font-bold text-indigo-600 uppercase">Roadmap Metrics</span>
                        <Award className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold text-neutral-500">Syllabus level:</span>
                          <span className="font-extrabold text-indigo-950">{wizardData.knowledgeLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-neutral-500">Study Pace:</span>
                          <span className="font-extrabold text-indigo-950">{getPaceHours()}h / Day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-neutral-500">Expected Success:</span>
                          <span className="font-extrabold text-emerald-600">89.4%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-neutral-500">AI Confidence:</span>
                          <span className="font-extrabold text-indigo-600">High Index (94)</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 p-5 bg-white rounded-2xl border border-neutral-200/80 space-y-3.5">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Generated Plan Highlights</span>
                      
                      <div className="space-y-3">
                        <div className="border-l-4 border-indigo-500 pl-3">
                          <span className="block text-xs font-extrabold text-indigo-950">Weekly Flow Cycle</span>
                          <p className="text-xs text-neutral-500 font-medium mt-0.5">
                            Focusing on {wizardData.subjects.slice(0, 3).join(", ")} with spaced review flashcards on Wednesdays.
                          </p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-3">
                          <span className="block text-xs font-extrabold text-indigo-950">Monthly Milestone Goal</span>
                          <p className="text-xs text-neutral-500 font-medium mt-0.5">
                            Target {wizardData.exam} blueprint coverage, completing mock exams under 90 minutes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-center">
                    <button
                      onClick={handleFinishOnboarding}
                      disabled={savingProfile}
                      className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {savingProfile ? "Syncing Workspace..." : "Enter AI Dashboard"} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {onboardingStep < 13 && (
            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
              {onboardingStep > 1 ? (
                <button
                  onClick={() => setOnboardingStep((p) => p - 1)}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-neutral-500 hover:text-neutral-800 transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Step
                </button>
              ) : (
                <div />
              )}

              {onboardingStep > 1 && (
                <button
                  onClick={() => setOnboardingStep((p) => p + 1)}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors border-0 bg-transparent cursor-pointer"
                >
                  Continue Step <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- RENDERING AUTHENTICATED DYNAMIC DASHBOARD ---
  const renderDashboard = () => {
    const primaryGoal = activeGoalFocus || wizardData.goals[0] || "Crack Government Exam";

    // Calendar Days Generator using safe loops (avoiding ESLint unused variables)
    const blankDays: (null | number)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      blankDays.push(null);
    }
    const monthDays: number[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      monthDays.push(i);
    }
    const calendarDays = [...blankDays, ...monthDays];

    return (
      <div className="min-h-screen bg-[#FAFBFF] text-neutral-800 flex font-sans">
        
        {/* EXPANDABLE LEFT SIDEBAR NAVIGATION */}
        <aside className={cn(
          "bg-white border-r border-[#E9ECF8] flex flex-col justify-between py-6 shrink-0 relative z-20 transition-all duration-300",
          isSidebarExpanded ? "w-64 px-6" : "w-20 px-3 items-center"
        )}>
          <div className="flex flex-col gap-8 w-full">
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
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg border border-[#E9ECF8] hover:bg-indigo-50 hover:text-indigo-600 text-neutral-400 transition-colors cursor-pointer bg-transparent"
              >
                {isSidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Sidebar Router Navigation */}
            <nav className="flex flex-col gap-2 w-full">
              {[
                { id: "home", label: "Home / Workspace", icon: Compass },
                { id: "analytics", label: "Analytics & Graphs", icon: TrendingUp },
                { id: "planner", label: "Study Plan & Goals", icon: Calendar },
                { id: "tutor", label: "AI Tutor Chat", icon: Brain },
                { id: "revision", label: "Revision & Decks", icon: Layers },
                { id: "mocktests", label: "Mock Test Suite", icon: Trophy },
                { id: "settings", label: "Settings & Profile", icon: Settings },
              ].map((tab) => {
                const IconComp = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <div key={tab.id} className="relative group w-full">
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 cursor-pointer border-0 text-left hover:scale-[1.03]",
                        active 
                          ? "bg-indigo-50 text-indigo-600 font-extrabold ring-1 ring-indigo-100 shadow-sm" 
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

          <div className="flex flex-col gap-6 w-full items-center">
            {/* POMODORO TIMER IN SIDEBAR CONTROLLER */}
            <div className={cn("w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl p-3 flex flex-col gap-2 shadow-sm transition-all", !isSidebarExpanded && "items-center")}>
              {isSidebarExpanded && (
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Pomodoro Timer</span>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {pomodoroMode === "study" ? "Focus" : "Break"}
                  </span>
                </div>
              )}
              <div className={cn("flex items-center gap-2.5", !isSidebarExpanded && "flex-col")}>
                <span className="text-xs font-black text-indigo-600 tabular-nums font-mono font-bold">
                  {formatTime(pomodoroTime)}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPomodoroActive(!pomodoroActive)}
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

            {/* Reset Roadmap Setup Trigger */}
            <div className="relative group w-full">
              <button
                onClick={handleResetOnboarding}
                className={cn(
                  "w-full flex items-center gap-3.5 p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer border-0 bg-transparent text-left",
                  !isSidebarExpanded && "justify-center"
                )}
              >
                <RefreshCw className="w-5 h-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-xs font-semibold">Reset Roadmap Wizard</span>}
              </button>
              {!isSidebarExpanded && (
                <span className="absolute left-24 top-3 px-2 py-1 text-[10px] font-extrabold text-white bg-neutral-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                  Reset & Rerun Onboarding Setup
                </span>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <div className="flex-grow flex flex-col min-w-0">
          
          {/* TOP NAVBAR CONTAINER */}
          <header className="h-20 bg-white border-b border-[#E9ECF8] px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6 flex-grow max-w-xl">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-indigo-600 transition-colors border border-neutral-200/80 bg-white hover:bg-neutral-50 px-3.5 py-2 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-500" />
                <span>Go to Home</span>
              </button>

              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules, decks, AI chat or test parameters..."
                  className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4.5">
              <div className="group relative flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/40 px-3.5 py-1.5 rounded-full font-extrabold text-xs">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{userProfile?.streak || 4} Days</span>
              </div>

              <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200/40 px-3.5 py-1.5 rounded-full font-extrabold text-xs">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>{userProfile?.xp || 320} XP</span>
              </div>

              <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200/40 px-3.5 py-1.5 rounded-full font-extrabold text-xs">
                <Award className="w-4 h-4 text-yellow-600" />
                <span>{userProfile?.coins || 120} Coins</span>
              </div>

              <button className="p-2.5 rounded-full border border-[#E9ECF8] hover:bg-neutral-50 text-neutral-500 relative cursor-pointer bg-transparent">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="flex items-center gap-2 border-l border-neutral-200 pl-4">
                <div className="w-9 h-9 rounded-full overflow-hidden relative bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-600/10 cursor-pointer">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.[0]?.toUpperCase() || "S"
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* MAIN PAGE BODY */}
          <main className="flex-grow p-8 overflow-y-auto space-y-8 bg-gradient-to-tr from-[#fbfbfe] to-[#f5f6ff]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* ======================================= */}
                {/* TAB 1: HOME / WORKSPACE                 */}
                {/* ======================================= */}
                {activeTab === "home" && (
                  <div className="space-y-8">
                    {/* Welcome Header */}
                    <div className="p-8 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-[24px] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-indigo-700/20">
                      <div className="absolute right-0 bottom-0 opacity-[0.07] pointer-events-none">
                        <Brain className="w-64 h-64" />
                      </div>
                      <div className="space-y-2 relative z-10">
                        <span className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Active AI Workspace
                        </span>
                        <h2 className="text-3xl font-black tracking-tight pt-1">Welcome back, {user?.name || "Scholar"}!</h2>
                        <p className="text-indigo-100 text-xs md:text-sm font-semibold max-w-xl leading-relaxed">
                          {"Your study pace is synchronized. Click dates on the calendar below to log progress and increase your success likelihood."}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3.5 relative z-10 shrink-0">
                        <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 text-center min-w-[85px] shadow-sm">
                          <span className="block text-2xl font-black leading-none">89%</span>
                          <span className="text-[10px] text-indigo-200 font-extrabold uppercase mt-2.5 block">Confidence</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 text-center min-w-[85px] shadow-sm">
                          <span className="block text-2xl font-black leading-none">{getSelectedDaysVal()}d</span>
                          <span className="text-[10px] text-indigo-200 font-extrabold uppercase mt-2.5 block">Timeline</span>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard KPI cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[
                        { title: "Target Syllabus Pace", value: `${getPaceHours()} Hours / Day`, desc: "Pace calculated by AI Engine", icon: Clock, color: "text-indigo-600 bg-indigo-50" },
                        { title: "Daily Habits Completed", value: `${dailyTasks.filter(t => t.completed).length} / ${dailyTasks.length}`, desc: "+10 XP per completion", icon: Check, color: "text-emerald-600 bg-emerald-50" },
                        { title: "Target Percentile Goal", value: `${wizardData.targetScore}% Score`, desc: "Targeting Topper Bracket", icon: Trophy, color: "text-amber-600 bg-amber-50" },
                        { title: "Streak Counter", value: `${userProfile?.streak || 4} Days`, desc: "Perform daily logs to keep", icon: Flame, color: "text-red-600 bg-red-50" }
                      ].map((card, i) => {
                        const Icon = card.icon;
                        return (
                          <div key={i} className="bg-white border border-[#E9ECF8] rounded-2xl p-5 hover:scale-[1.03] transition-transform duration-200 shadow-sm flex items-center justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">{card.title}</span>
                              <span className="text-lg font-black text-neutral-900 block">{card.value}</span>
                              <span className="text-[10px] text-neutral-500 font-semibold block">{card.desc}</span>
                            </div>
                            <div className={cn("p-3 rounded-xl", card.color)}>
                              <Icon className="w-5 h-5" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Onboarding Configuration Profile Summary Card */}
                    <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-neutral-900 text-sm">Personalized AI Roadmap Configuration</h3>
                            <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Summary of metrics captured during your 14-step goal setup</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                          Verified Cohort Rank: #{(100 - (wizardData.targetScore * 0.9)).toFixed(0)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Target Exam</span>
                          <span className="text-xs font-bold text-neutral-800">{wizardData.exam || "Not Selected"}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Target Score Goal</span>
                          <span className="text-xs font-bold text-neutral-800">{wizardData.targetScore}% Percentile</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Target Prep Period</span>
                          <span className="text-xs font-bold text-neutral-800">{wizardData.targetDays} Days</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Knowledge Level</span>
                          <span className="text-xs font-bold text-neutral-800">{wizardData.knowledgeLevel || "Intermediate"}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Daily Availability</span>
                          <span className="text-xs font-bold text-neutral-800">{wizardData.dailyAvailability} ({wizardData.scheduleShift} Shift)</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Preferred Style</span>
                          <span className="text-xs font-bold text-neutral-800 truncate block">
                            {wizardData.learningStyles.join(", ") || "Mixed Learning"}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Study Focus Language</span>
                          <span className="text-xs font-bold text-neutral-800">{wizardData.language || "English"}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Reminders Frequency</span>
                          <span className="text-xs font-bold text-neutral-800">{wizardData.motivationFrequency || "Daily"}</span>
                        </div>
                      </div>

                      {/* Display weaknesses stars */}
                      <div className="pt-4 border-t border-neutral-100 space-y-3">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">AI Subject Priority Weights</span>
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(wizardData.weaknesses).map(([sub, rating]) => (
                            <div key={sub} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 rounded-xl border border-neutral-200">
                              <span className="text-[11px] font-bold text-neutral-700">{sub}</span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, starIdx) => (
                                  <Star
                                    key={starIdx}
                                    className={cn(
                                      "w-3 h-3",
                                      starIdx < rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Selector bar */}
                    <div className="bg-white/70 backdrop-blur-md border border-[#E9ECF8] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-neutral-500 uppercase tracking-wider">Goal-Adaptive Dashboard:</span>
                        <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {primaryGoal}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2.5">
                        {[
                          { id: "Crack Government Exam", label: "Mock Suite" },
                          { id: "Improve Knowledge", label: "AI Tutor Focus" },
                          { id: "Quick Revision", label: "Recall Decks" },
                          { id: "Daily Learning Habit", label: "Habit Loop" },
                        ].map((g) => (
                          <button
                            key={g.id}
                            onClick={() => setActiveGoalFocus(g.id)}
                            className={cn(
                              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0",
                              primaryGoal === g.id
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
                            )}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Central columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left side: Checklist & Recommendations */}
                      <div className="lg:col-span-2 space-y-8">
                        
                        {/* Daily task Checklist */}
                        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
                          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                            <h3 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
                              <Check className="w-5 h-5 text-indigo-600" /> Active Daily Habits Checklist
                            </h3>
                            <span className="text-xs text-neutral-400 font-bold">Earn bonus XP</span>
                          </div>
                          <div className="space-y-2">
                            {dailyTasks.map((task) => (
                              <div 
                                key={task.id} 
                                onClick={() => toggleDailyTask(task.id)}
                                className={cn(
                                  "flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100/50 rounded-xl border transition-all cursor-pointer",
                                  task.completed ? "border-indigo-100" : "border-neutral-200"
                                )}
                              >
                                <div className={cn(
                                  "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                  task.completed ? "bg-indigo-600 border-indigo-600 text-white" : "border-neutral-300 bg-white"
                                )}>
                                  {task.completed && <Check className="w-3 h-3" />}
                                </div>
                                <span className={cn("text-xs font-bold flex-grow", task.completed ? "text-neutral-400 line-through" : "text-neutral-700")}>
                                  {task.label}
                                </span>
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0">
                                  +{task.xpReward} XP
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recommended study topics */}
                        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
                          <h3 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-indigo-600" /> Recommended High-Priority Study Topics
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { topic: "Arithmetic Equations & Ratios", sub: "Quantitative Aptitude", eta: "45 mins", difficulty: "Medium" },
                              { topic: "Indian polity constitution amendments", sub: "General Awareness", eta: "60 mins", difficulty: "High" },
                              { topic: "Syllogism and Direction reasoning rules", sub: "Reasoning & Logic", eta: "30 mins", difficulty: "Low" },
                              { topic: "Vocabulary antonyms & synonyms checklist", sub: "English Verbal", eta: "20 mins", difficulty: "Medium" }
                            ].map((item, idx) => (
                              <div key={idx} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 hover:bg-neutral-100 transition-all flex flex-col justify-between space-y-3">
                                <div>
                                  <span className="text-[9px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{item.sub}</span>
                                  <h4 className="font-extrabold text-xs text-neutral-800 mt-2">{item.topic}</h4>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-500 pt-2 border-t border-neutral-100">
                                  <span>Time: {item.eta}</span>
                                  <span>Diff: {item.difficulty}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Weekly study plan summary */}
                        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
                          <h3 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600" /> Weekly Recommended Study Roadmap
                          </h3>
                          <div className="space-y-3">
                            {generateWeeklyPlan(wizardData.subjects).map((plan, i) => (
                              <div key={i} className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                <div>
                                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{plan.day}</span>
                                  <h4 className="font-bold text-xs text-neutral-800 mt-1">{plan.subject}</h4>
                                  <p className="text-[10px] text-neutral-400 font-medium">{plan.focus}</p>
                                </div>
                                <span className="text-xs font-bold text-neutral-500">{plan.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Calendar Block */}
                        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                            <div className="space-y-0.5">
                              <h3 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-600" /> Multi-Month Interactive Study Tracker
                              </h3>
                              <p className="text-[10px] text-neutral-400 font-medium">Click day slots to add/adjust hours</p>
                            </div>
                            <div className="flex items-center gap-2.5 self-end">
                              <button onClick={handlePrevMonth} className="p-1 hover:bg-neutral-100 rounded border border-neutral-200 bg-white">
                                <ChevronLeft className="w-4 h-4 text-neutral-600" />
                              </button>
                              <span className="text-xs font-black text-neutral-800 uppercase tracking-wider min-w-[90px] text-center">
                                {monthsList[currentMonth]} {currentYear}
                              </span>
                              <button onClick={handleNextMonth} className="p-1 hover:bg-neutral-100 rounded border border-neutral-200 bg-white">
                                <ChevronRight className="w-4 h-4 text-neutral-600" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-neutral-400 mb-1">
                            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                          </div>

                          <div className="grid grid-cols-7 gap-1.5">
                            {calendarDays.map((day, idx) => {
                              if (day === null) return <div key={`blank-${idx}`} className="aspect-square bg-transparent" />;
                              const dateKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                              const hoursLog = studyLogs[dateKey]?.hours || 0;
                              return (
                                <button
                                  key={`day-${day}`}
                                  onClick={() => handleDayClick(day)}
                                  className={cn(
                                    "aspect-square rounded-xl border flex flex-col items-center justify-between p-1.5 cursor-pointer transition-all",
                                    getIntensityClass(dateKey)
                                  )}
                                  title={`${dateKey}: ${hoursLog} Study Hours`}
                                >
                                  <span className="text-[10px] font-bold">{day}</span>
                                  {hoursLog > 0 && (
                                    <span className="text-[8px] opacity-90 block tracking-tight font-extrabold">{hoursLog}h</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                      {/* Right side: Pomodoro timer, streak activity logs */}
                      <div className="space-y-8">
                        
                        {/* Pomodoro Timer widget */}
                        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm text-center space-y-5">
                          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Workspace Focus Session</span>
                          
                          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                            <svg className="absolute w-full h-full transform -rotate-90">
                              <circle cx="80" cy="80" r="74" stroke="#F1F5F9" strokeWidth="6" fill="transparent" />
                              <motion.circle 
                                cx="80" 
                                cy="80" 
                                r="74" 
                                stroke="#6366F1" 
                                strokeWidth="6" 
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 74}
                                strokeDashoffset={2 * Math.PI * 74 * (1 - pomodoroTime / (pomodoroMode === "study" ? 25 * 60 : 5 * 60))}
                                transition={{ ease: "linear" }}
                              />
                            </svg>
                            <div className="relative text-center">
                              <span className="block text-2xl font-black text-indigo-600 font-mono tracking-tight tabular-nums">
                                {formatTime(pomodoroTime)}
                              </span>
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mt-0.5">
                                {pomodoroMode === "study" ? "Study Focus" : "Break time"}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => setPomodoroActive(!pomodoroActive)}
                              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all border-0 flex items-center gap-1.5"
                            >
                              {pomodoroActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              {pomodoroActive ? "Pause" : "Start"}
                            </button>
                            <button
                              onClick={() => {
                                setPomodoroActive(false);
                                setPomodoroTime(pomodoroMode === "study" ? 25 * 60 : 5 * 60);
                              }}
                              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold text-xs rounded-xl cursor-pointer transition-all border-0"
                            >
                              Reset
                            </button>
                          </div>
                        </div>

                        {/* Recent study activity logs */}
                        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
                          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Recent Study Log Activities</span>
                          <div className="relative pl-4 border-l border-neutral-200 space-y-5">
                            {[
                              { time: "Just now", title: "Activity Checklist sync", desc: "Successfully calibrated study credentials." },
                              { time: "10 mins ago", title: "Logged Study session", desc: "Recorded quantitative formula review." },
                              { time: "2 hours ago", title: "Finished practice quiz", desc: "Scored 4/5 on CGL Practice Test." },
                              { time: "Yesterday", title: "Onboarding Wizard completed", desc: "AI Roadmap unlocked for target workspace." },
                            ].map((log, idx) => (
                              <div key={idx} className="relative space-y-0.5">
                                <span className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 bg-indigo-600 border-2 border-white rounded-full ring-4 ring-indigo-50"></span>
                                <span className="block text-[9px] text-neutral-400 font-extrabold">{log.time}</span>
                                <h4 className="font-extrabold text-xs text-neutral-800 leading-none">{log.title}</h4>
                                <p className="text-[10px] text-neutral-500 font-medium leading-relaxed">{log.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* ======================================= */}
                {/* TAB 2: ANALYTICS & GRAPHS               */}
                {/* ======================================= */}
                {activeTab === "analytics" && (
                  <div className="space-y-8">
                    <div className="border-b border-[#E9ECF8] pb-4">
                      <h2 className="text-2xl font-black text-neutral-900">Learning Analytics Dashboard</h2>
                      <p className="text-xs text-neutral-400 font-medium mt-1">Real-time reports generated by your study logs and mock test scores.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Weekly hours custom CSS bar charts */}
                      <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Weekly Study Hours (Jul 04 - Jul 10)</span>
                        <div className="h-48 flex items-end justify-between gap-2.5 pt-6 px-2">
                          {[
                            { day: "Sat", hours: 2.5, height: "h-[30%]" },
                            { day: "Sun", hours: 1.0, height: "h-[12%]" },
                            { day: "Mon", hours: 4.5, height: "h-[56%]" },
                            { day: "Tue", hours: 3.0, height: "h-[38%]" },
                            { day: "Wed", hours: 6.0, height: "h-[75%]" },
                            { day: "Thu", hours: 8.0, height: "h-[100%]" },
                            { day: "Fri", hours: 5.5, height: "h-[68%]" }
                          ].map((bar, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                              <span className="text-[9px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">{bar.hours}h</span>
                              <div className={cn("w-full bg-indigo-100 rounded-lg group-hover:bg-indigo-600 transition-colors relative", bar.height)}>
                                <div className="absolute top-0 inset-x-0 h-1 bg-white/20 rounded-full" />
                              </div>
                              <span className="text-[10px] font-bold text-neutral-400">{bar.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Subject Accuracy indicators */}
                      <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Subject MCQ Accuracy Tiers</span>
                        <div className="space-y-4 pt-2">
                          {[
                            { name: "Quantitative Aptitude", accuracy: 82, color: "bg-indigo-600" },
                            { name: "Reasoning and Deduction", accuracy: 91, color: "bg-purple-600" },
                            { name: "English Comprehension", accuracy: 74, color: "bg-amber-600" },
                            { name: "General Knowledge Trivia", accuracy: 68, color: "bg-rose-600" },
                          ].map((sub, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold text-neutral-700">
                                <span>{sub.name}</span>
                                <span>{sub.accuracy}% accuracy</span>
                              </div>
                              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                                <motion.div 
                                  className={cn("h-full rounded-full", sub.color)} 
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${sub.accuracy}%` }}
                                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Subject progress rings */}
                      <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Syllabus Completion Index</span>
                        <div className="flex flex-col items-center justify-center py-6 space-y-3">
                          <div className="relative w-28 h-28 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="56" cy="56" r="48" stroke="#F1F5F9" strokeWidth="7" fill="transparent" />
                              <motion.circle 
                                cx="56" 
                                cy="56" 
                                r="48" 
                                stroke="#6366F1" 
                                strokeWidth="7" 
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 48}
                                strokeDashoffset={2 * Math.PI * 48 * 0.38} 
                                initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 48 * 0.38 }}
                                transition={{ duration: 1.2 }}
                              />
                            </svg>
                            <span className="absolute text-xl font-black text-indigo-600">62%</span>
                          </div>
                          <span className="text-xs font-bold text-neutral-500">248 of 400 Topics Mastered</span>
                        </div>
                      </div>
                    </div>

                    {/* Historical Diagnostics Table */}
                    <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Historical Diagnostics Scorecard</span>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-medium text-neutral-600">
                          <thead>
                            <tr className="border-b border-neutral-100 text-neutral-400 font-extrabold uppercase text-[10px]">
                              <th className="pb-3 pl-2">Mock Test Name</th>
                              <th className="pb-3">Logged Date</th>
                              <th className="pb-3">Scored Accuracy</th>
                              <th className="pb-3">Status Badge</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockResults.map((r, idx) => (
                              <tr key={idx} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                                <td className="py-3.5 pl-2 font-bold text-neutral-800">{r.testName}</td>
                                <td className="py-3.5 text-neutral-500">{r.date}</td>
                                <td className="py-3.5 font-bold text-indigo-600">{r.score}</td>
                                <td className="py-3.5">
                                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[9px] uppercase">Logged</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ======================================= */}
                {/* TAB 3: STUDY PLAN & ROADMAP             */}
                {/* ======================================= */}
                {activeTab === "planner" && (
                  <div className="space-y-8">
                    {/* Visual Roadmap phases */}
                    <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
                      <h2 className="font-extrabold text-lg text-neutral-900">AI Recalculated Study Milestone Timelines</h2>
                      <div className="relative pl-6 border-l-2 border-indigo-100 space-y-8 py-4">
                        {[
                          { week: "Phase 1: Foundation Building (Weeks 1-3)", desc: "Build basic formulas, practice basic conceptual quizzes, analyze strengths & weaknesses.", current: true },
                          { week: "Phase 2: Topic Drilling & Recall (Weeks 4-6)", desc: "Deep study notes, daily 10 flashcard drills, sectional mock reviews.", current: false },
                          { week: "Phase 3: Speed Trials & Time Management (Weeks 7-9)", desc: "Mock test suite simulations, detailed diagnostics, target score tracking.", current: false },
                          { week: "Phase 4: Percentile Maxing (Weeks 10+)", desc: "Solving previous year papers, ultimate topper group mock simulations.", current: false }
                        ].map((phase, idx) => (
                          <div key={idx} className="relative">
                            <span className={cn(
                              "absolute left-[-31px] top-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm",
                              phase.current ? "bg-indigo-600 ring-4 ring-indigo-50" : "bg-neutral-300"
                            )}>
                              {phase.current && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                            <h4 className="font-extrabold text-sm text-neutral-800">{phase.week}</h4>
                            <p className="text-xs text-neutral-500 font-semibold mt-1 max-w-xl">{phase.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Goal preferences CRUD panel */}
                    <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-6">
                      <div className="border-b border-[#E9ECF8] pb-4 flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-extrabold text-neutral-900">Custom Goal Preferences CRUD Console</h3>
                          <p className="text-xs text-neutral-400 font-medium">Recalculate dynamic course durations, required pace, and rank projection tier in real-time.</p>
                        </div>
                        <button
                          onClick={handleUpdateRoadmapGoals}
                          disabled={savingProfile}
                          className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border-0"
                        >
                          <Save className="w-4 h-4" />
                          {savingProfile ? "Syncing..." : "Save Goal Updates"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-extrabold text-neutral-600 mb-1.5">Target Exam Blueprint</label>
                              <select
                                value={wizardData.exam}
                                onChange={(e) => setWizardData((prev) => ({ ...prev, exam: e.target.value }))}
                                className="w-full text-xs font-semibold px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white"
                              >
                                {["SSC CGL", "UPSC", "JEE", "NEET", "MPSC", "Banking", "Police", "State PSC", "Other"].map((e) => (
                                  <option key={e} value={e}>{e}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-extrabold text-neutral-600 mb-1.5">Target Days Timeline</label>
                              <input
                                type="number"
                                min="7"
                                max="730"
                                value={wizardData.targetDays === -1 ? wizardData.customTargetDays || 30 : wizardData.targetDays}
                                onChange={(e) => setWizardData((prev) => ({ ...prev, targetDays: parseInt(e.target.value) || 30 }))}
                                className="w-full text-xs font-semibold px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-extrabold text-neutral-600 mb-1.5">
                              <span>Target Percentile Score Goal</span>
                              <span className="text-indigo-600">{wizardData.targetScore}%</span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="98"
                              value={wizardData.targetScore}
                              onChange={(e) => setWizardData((prev) => ({ ...prev, targetScore: parseInt(e.target.value) }))}
                              className="w-full accent-indigo-600"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-extrabold text-neutral-600 mb-2">Subject blueprint filters</label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                "Quantitative Aptitude",
                                "Reasoning",
                                "English",
                                "General Awareness",
                                "History",
                                "Geography",
                                "Polity",
                                "Science",
                              ].map((subName) => {
                                const selected = wizardData.subjects.includes(subName);
                                return (
                                  <button
                                    key={subName}
                                    type="button"
                                    onClick={() => {
                                      setWizardData((prev) => ({
                                        ...prev,
                                        subjects: selected ? prev.subjects.filter((x) => x !== subName) : [...prev.subjects, subName],
                                      }));
                                    }}
                                    className={cn(
                                      "px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer border",
                                      selected
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
                                    )}
                                  >
                                    {subName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Calculated Live Analytics output preview */}
                        <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex flex-col justify-between space-y-4">
                          <div className="space-y-4">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">Live Calculated Plan metrics</span>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                                <span className="block text-[10px] font-bold text-neutral-400 uppercase">Estimated Pace</span>
                                <span className="text-lg font-black text-indigo-950">{getPaceHours()} Hours/Day</span>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                                <span className="block text-[10px] font-bold text-neutral-400 uppercase">Timeline Total</span>
                                <span className="text-lg font-black text-indigo-950">{getSelectedDaysVal()} Days</span>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-1">
                              <span className="block text-[10px] font-bold text-neutral-400 uppercase">Expected Rank Cohort</span>
                              <span className="text-sm font-extrabold text-indigo-900 block">
                                {wizardData.targetScore >= 95 ? "Under 150 (Top Tier)" : wizardData.targetScore >= 85 ? "Rank 500 - 1500" : wizardData.targetScore >= 70 ? "Rank 2000 - 8000" : "Rank 15000+"}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs font-bold text-indigo-600 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                            Pace Profile: {getPaceSpeedDescription()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ======================================= */}
                {/* TAB 4: AI TUTOR CHAT                    */}
                {/* ======================================= */}
                {activeTab === "tutor" && (
                  <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Brain className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-neutral-900 text-sm">Interactive AI Study Coach Assistant</h3>
                        <span className="text-[10px] text-neutral-400 font-extrabold">Streaming Engine Connected</span>
                      </div>
                    </div>

                    {/* Chat Bubble List */}
                    <div className="space-y-4 min-h-[350px] max-h-[450px] overflow-y-auto bg-neutral-50/50 rounded-xl p-4 border border-neutral-200/60">
                      {chatMessages.map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "flex flex-col max-w-[80%] rounded-2xl p-3.5 text-xs font-semibold leading-relaxed shadow-sm",
                            msg.sender === "user" 
                              ? "bg-indigo-600 text-white ml-auto rounded-tr-none" 
                              : "bg-white text-neutral-700 border border-neutral-200 rounded-tl-none"
                          )}
                        >
                          <span className="text-[8px] font-black uppercase text-neutral-400 block mb-1">
                            {msg.sender === "user" ? "You" : "ExamForge AI"}
                          </span>
                          <p className="whitespace-pre-line">{msg.text}</p>
                        </div>
                      ))}
                      {isAiTyping && (
                        <div className="bg-white border border-neutral-200 text-neutral-400 rounded-2xl rounded-tl-none p-3.5 text-xs max-w-[100px] shadow-sm flex items-center justify-center gap-1.5 animate-pulse font-extrabold">
                          Thinking...
                        </div>
                      )}
                    </div>

                    {/* Send Controls */}
                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                        placeholder="Ask me to explain formulas, design syllabus mock papers or clarify doubt..."
                        className="flex-grow border border-neutral-300 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-600 bg-white"
                      />
                      <button 
                        onClick={sendChatMessage}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl cursor-pointer border-0 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send
                      </button>
                    </div>
                  </div>
                )}

                {/* ======================================= */}
                {/* TAB 5: REVISION & DECKS                 */}
                {/* ======================================= */}
                {activeTab === "revision" && (
                  <div className="space-y-8">
                    <div className="border-b border-[#E9ECF8] pb-4">
                      <h2 className="text-2xl font-black text-neutral-900">Active Recall Revision Decks</h2>
                      <p className="text-xs text-neutral-400 font-medium mt-1">Spaced-Repetition active flashcards to drill weak areas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      {/* Left: Decks selector */}
                      <div className="space-y-3 md:col-span-1">
                        {Object.entries(decksData).map(([id, deck]) => {
                          const DeckIcon = deck.icon;
                          const active = selectedDeckId === id;
                          return (
                            <button
                              key={id}
                              onClick={() => {
                                setSelectedDeckId(id);
                                setCurrentCardIndex(0);
                                setIsCardFlipped(false);
                              }}
                              className={cn(
                                "w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 hover:scale-[1.02]",
                                active ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-extrabold" : "bg-white border-neutral-200 text-neutral-600"
                              )}
                            >
                              <DeckIcon className="w-5 h-5 shrink-0" />
                              <div className="space-y-0.5">
                                <span className="block text-xs font-bold leading-none">{deck.title}</span>
                                <span className="block text-[9px] text-neutral-400 font-medium">{deck.cards.length} flashcards</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Right: Card Viewer */}
                      <div className="md:col-span-3 space-y-6 flex flex-col items-center">
                        <div 
                          onClick={() => setIsCardFlipped(!isCardFlipped)}
                          className="w-full max-w-lg min-h-[220px] bg-white border border-neutral-200/80 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative flex flex-col items-center justify-center p-8 text-center"
                        >
                          <span className="absolute top-4 right-4 text-[9px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-50 px-2 py-0.5 rounded border">
                            {isCardFlipped ? "Answer" : "Question"}
                          </span>

                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`${currentCardIndex}-${isCardFlipped}`}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="space-y-3"
                            >
                              {!isCardFlipped ? (
                                <h3 className="text-base font-extrabold text-neutral-800 max-w-sm leading-relaxed">
                                  {currentDeck.cards[currentCardIndex].q}
                                </h3>
                              ) : (
                                <p className="text-lg font-black text-indigo-600 max-w-sm leading-relaxed">
                                  {currentDeck.cards[currentCardIndex].a}
                                </p>
                              )}
                            </motion.div>
                          </AnimatePresence>

                          <span className="absolute bottom-4 text-[9px] text-neutral-400 font-bold">
                            Click card body to flip
                          </span>
                        </div>

                        {/* Flashcard navigation Controls */}
                        <div className="w-full max-w-lg flex items-center justify-between gap-4">
                          <button onClick={handleCardPrev} className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold text-xs rounded-xl cursor-pointer border-0">
                            Previous Card
                          </button>
                          <span className="text-xs font-bold text-neutral-500">
                            {currentCardIndex + 1} of {totalCards}
                          </span>
                          <button onClick={handleCardNext} className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold text-xs rounded-xl cursor-pointer border-0">
                            Next Card
                          </button>
                        </div>

                        {/* Gamified got-it recall buttons */}
                        {isCardFlipped && (
                          <div className="flex gap-3 justify-center pt-2">
                            <button 
                              onClick={() => {
                                triggerXpAward(10, "Mastered flashcard deck formula");
                                handleCardNext();
                              }}
                              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-0"
                            >
                              Got it (+10 XP)
                            </button>
                            <button 
                              onClick={() => {
                                toast("Card flagged for later repetition", "info");
                                handleCardNext();
                              }}
                              className="px-6 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl cursor-pointer"
                            >
                              Study again
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ======================================= */}
                {/* TAB 6: MOCK TEST SUITE                  */}
                {/* ======================================= */}
                {activeTab === "mocktests" && (
                  <div className="space-y-8">
                    <div className="border-b border-[#E9ECF8] pb-4">
                      <h2 className="text-2xl font-black text-neutral-900">Diagnostic Mock Test Suite</h2>
                      <p className="text-xs text-neutral-400 font-medium mt-1">Realistic test templates and interactive mock exams.</p>
                    </div>

                    {!activeMockTest ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {mockTestsList.map((test) => (
                          <div key={test.id} className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm hover:scale-[1.03] transition-transform duration-200 flex flex-col justify-between min-h-[220px]">
                            <div className="space-y-2">
                              <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Mock Test</span>
                              <h3 className="text-sm font-extrabold text-neutral-800 leading-tight pt-1">{test.title}</h3>
                              <p className="text-neutral-500 text-xs font-semibold">{test.questionsCount} MCQs • {test.timeLimit} seconds</p>
                            </div>
                            <button 
                              onClick={() => startMockTest(test)}
                              className="w-full text-center py-2.5 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm cursor-pointer transition-colors border-0"
                            >
                              Start Test Simulator
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Active Mock Test Interactive Panel */
                      <div className="bg-white border border-neutral-300 rounded-[24px] p-6 md:p-8 max-w-2xl mx-auto space-y-6 shadow-md">
                        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                          <h3 className="font-extrabold text-sm text-neutral-800">{activeMockTest.title}</h3>
                          <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                            Timer: {mockTimer}s / {activeMockTest.timeLimit}s
                          </span>
                        </div>

                        {/* Current Question */}
                        <div className="space-y-4">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-black text-indigo-600 shrink-0">Q{mockCurrentQuestion + 1}.</span>
                            <p className="text-xs font-bold text-neutral-800 leading-relaxed">
                              {activeMockTest.questions[mockCurrentQuestion].q}
                            </p>
                          </div>

                          {/* Options */}
                          <div className="grid grid-cols-1 gap-2.5 pl-6">
                            {activeMockTest.questions[mockCurrentQuestion].options.map((opt: string, i: number) => {
                              const selected = mockAnswers[mockCurrentQuestion] === opt;
                              return (
                                <button
                                  key={i}
                                  onClick={() => selectMockAnswer(mockCurrentQuestion, opt)}
                                  className={cn(
                                    "w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                                    selected 
                                      ? "border-indigo-600 bg-indigo-50 text-indigo-800 font-extrabold" 
                                      : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600"
                                  )}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Navigation controls */}
                        <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                          <button 
                            disabled={mockCurrentQuestion === 0}
                            onClick={() => setMockCurrentQuestion(c => c - 1)}
                            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-neutral-600 font-bold text-xs rounded-xl cursor-pointer border-0"
                          >
                            Previous
                          </button>
                          
                          {mockCurrentQuestion < activeMockTest.questions.length - 1 ? (
                            <button 
                              onClick={() => setMockCurrentQuestion(c => c + 1)}
                              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold text-xs rounded-xl cursor-pointer border-0"
                            >
                              Next Question
                            </button>
                          ) : (
                            <button 
                              onClick={submitMockTest}
                              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-0"
                            >
                              Submit Mock Test
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ======================================= */}
                {/* TAB 7: SETTINGS & CUSTOM CRUD           */}
                {/* ======================================= */}
                {activeTab === "settings" && (
                  <div className="space-y-8">
                    <div className="border-b border-[#E9ECF8] pb-4">
                      <h2 className="text-2xl font-black text-neutral-900">Custom Profile settings & CRUD console</h2>
                      <p className="text-xs text-neutral-400 font-medium mt-1">Manage personal details, notification frequencies, privacy permissions, and login credentials.</p>
                    </div>

                    <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                      <div className="space-y-8">
                        {/* Glass Card 1: Personal Details CRUD */}
                        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-6">
                          <div className="flex items-center gap-2.5 border-b border-[#E9ECF8] pb-3.5">
                            <User className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-extrabold text-neutral-900 text-base">Personal Details</h3>
                          </div>
                          <div className="space-y-4">
                            <div className="flex flex-col items-center gap-3 pb-4 border-b border-neutral-100 mb-2">
                              <div className="relative group">
                                <div className="w-20 h-20 rounded-full overflow-hidden relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                                  {userProfile?.avatar_url ? (
                                    <img 
                                      src={userProfile.avatar_url} 
                                      alt={settingsName} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    settingsName[0]?.toUpperCase() || "S"
                                  )}
                                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[9px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-3.5 h-3.5 mr-1" /> Edit
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={handleImageUpload} 
                                      className="hidden" 
                                    />
                                  </label>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-neutral-400">Click avatar to upload profile image</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-extrabold text-neutral-600 mb-1">User Full Name</label>
                                <input
                                  type="text"
                                  value={settingsName}
                                  onChange={(e) => setSettingsName(e.target.value)}
                                  className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                                  placeholder="Your full name"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-extrabold text-neutral-600 mb-1">Email (Read Only)</label>
                                <input
                                  type="email"
                                  value={user?.email || ""}
                                  disabled
                                  className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-400 cursor-not-allowed"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-extrabold text-neutral-600 mb-1">Contact Phone</label>
                                <input
                                  type="tel"
                                  value={settingsPhone}
                                  onChange={(e) => setSettingsPhone(e.target.value)}
                                  className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                                  placeholder="+91 XXXXX XXXXX"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-extrabold text-neutral-600 mb-1">Location</label>
                                <input
                                  type="text"
                                  value={settingsLocation}
                                  onChange={(e) => setSettingsLocation(e.target.value)}
                                  className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                                  placeholder="City, Country"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="block text-xs font-extrabold text-neutral-600 mb-1">Preferred Timezone</label>
                                <select
                                  value={settingsTimezone}
                                  onChange={(e) => setSettingsTimezone(e.target.value)}
                                  className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                                >
                                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                  <option value="America/New_York">America/New_York (EST)</option>
                                  <option value="Europe/London">Europe/London (GMT)</option>
                                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-extrabold text-neutral-600 mb-1">User Bio</label>
                              <textarea
                                rows={3}
                                value={settingsBio}
                                onChange={(e) => setSettingsBio(e.target.value)}
                                className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white resize-none"
                                placeholder="Tell us about your learning objectives or study background..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* Glass Card 2: Notification Settings CRUD */}
                        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-5">
                          <div className="flex items-center gap-2.5 border-b border-[#E9ECF8] pb-3.5">
                            <BellRing className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-extrabold text-neutral-900 text-base">Notification Settings</h3>
                          </div>

                          <div className="space-y-4">
                            {[
                              { state: notificationEmail, setter: setNotificationEmail, title: "Email Alerts", desc: "Receive daily syllabus updates and leaderboard changes." },
                              { state: notificationPush, setter: setNotificationPush, title: "Push Notices", desc: "Show browser reminders before scheduled shift times." },
                              { state: notificationWhatsApp, setter: setNotificationWhatsApp, title: "WhatsApp messages", desc: "Broadcast summary study sheets directly to WhatsApp." },
                              { state: notificationSMS, setter: setNotificationSMS, title: "SMS reminders", desc: "Urgent SMS indicators when streak is about to break." },
                            ].map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 font-bold">
                                <div>
                                  <span className="block font-bold text-xs text-neutral-800">{item.title}</span>
                                  <span className="block text-[10px] text-neutral-400 font-semibold">{item.desc}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => item.setter(!item.state)}
                                  className={cn(
                                    "w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none border-0",
                                    item.state ? "bg-indigo-600" : "bg-neutral-200"
                                  )}
                                >
                                  <span className={cn(
                                    "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all",
                                    item.state ? "translate-x-5" : ""
                                  )} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {/* Glass Card 3: Privacy Toggles CRUD */}
                        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-5">
                          <div className="flex items-center gap-2.5 border-b border-[#E9ECF8] pb-3.5">
                            <Globe className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-extrabold text-neutral-900 text-base">Privacy Settings</h3>
                          </div>

                          <div className="space-y-4">
                            {[
                              { state: privacyProfile, setter: setPrivacyProfile, title: "Profile Visibility", desc: "Allow other learners to see your score ratings and avatar." },
                              { state: privacyStreaks, setter: setPrivacyStreaks, title: "Public Streaks", desc: "Let peers check your daily active active streak numbers." },
                              { state: privacyAnalytics, setter: setPrivacyAnalytics, title: "Analytics Sharing", desc: "Contribute anonymous study durations to AI rank cohort estimations." },
                            ].map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 font-bold">
                                <div>
                                  <span className="block font-bold text-xs text-neutral-800">{item.title}</span>
                                  <span className="block text-[10px] text-neutral-400 font-semibold">{item.desc}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => item.setter(!item.state)}
                                  className={cn(
                                    "w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none border-0",
                                    item.state ? "bg-indigo-600" : "bg-neutral-200"
                                  )}
                                >
                                  <span className={cn(
                                    "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all",
                                    item.state ? "translate-x-5" : ""
                                  )} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Glass Card 4: Security Control CRUD */}
                        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-5">
                          <div className="flex items-center justify-between border-b border-[#E9ECF8] pb-3.5">
                            <div className="flex items-center gap-2.5">
                              <Shield className="w-5 h-5 text-indigo-600" />
                              <h3 className="font-extrabold text-neutral-900 text-base">Security Control</h3>
                            </div>
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-pulse">
                              Score: {userProfile?.security_score || 85}/100
                            </span>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-neutral-500">Update Account Password</span>
                              <button
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="text-indigo-600 flex items-center gap-1 bg-transparent border-0 cursor-pointer text-xs font-bold"
                              >
                                {showPasswords ? (
                                  <>
                                    <EyeOff className="w-4 h-4" /> Hide Fields
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4" /> Show Fields
                                  </>
                                )}
                              </button>
                            </div>

                            {showPasswords && (
                              <div className="space-y-3.5 border-t border-neutral-100 pt-3">
                                <div>
                                  <label className="block text-[10px] font-extrabold text-neutral-600 mb-1">Current Old Password</label>
                                  <div className="relative">
                                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                      type="password"
                                      value={oldPassword}
                                      onChange={(e) => setOldPassword(e.target.value)}
                                      className="w-full text-xs font-semibold pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                                      placeholder="••••••••"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-extrabold text-neutral-600 mb-1">New Password</label>
                                    <div className="relative">
                                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                      <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full text-xs font-semibold pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                                        placeholder="Min 8 chars"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-extrabold text-neutral-600 mb-1">Confirm New Password</label>
                                    <div className="relative">
                                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                      <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full text-xs font-semibold pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                                        placeholder="••••••••"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleResetPassword}
                                  disabled={isChangingPassword || !newPassword}
                                  className="w-full text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white py-2 rounded-xl cursor-pointer transition-colors disabled:opacity-50 border-0"
                                >
                                  {isChangingPassword ? "Saving new credentials..." : "Verify & Apply Password Reset"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border-0"
                          >
                            <Save className="w-4 h-4" />
                            {savingProfile ? "Saving changes..." : "Save Settings Changes"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* STUDY LOG / CALENDAR POPUP MODAL */}
        {isCalendarModalOpen && (
          <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border border-neutral-200 rounded-[24px] shadow-2xl p-6 w-full max-w-md space-y-5"
            >
              <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                <h3 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" /> Log Session: {selectedCalendarDate}
                </h3>
                <button 
                  onClick={() => setIsCalendarModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-700 font-bold bg-transparent border-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-neutral-600 mb-1.5">Study Duration (Hours)</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={calendarHours}
                    onChange={(e) => setCalendarHours(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-neutral-600 mb-1.5">Study Session Notes</label>
                  <textarea
                    rows={3}
                    value={calendarNotes}
                    onChange={(e) => setCalendarNotes(e.target.value)}
                    placeholder="e.g., Solved 15 compound interest practice questions..."
                    className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                <button 
                  onClick={deleteStudyLog}
                  className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs cursor-pointer border border-transparent transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsCalendarModalOpen(false)}
                    className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold text-xs rounded-xl cursor-pointer border-0"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveStudyLog}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-0"
                  >
                    Save Log
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    );
  };

  return isOnboardingCompleted ? renderDashboard() : renderOnboardingWizard();
}

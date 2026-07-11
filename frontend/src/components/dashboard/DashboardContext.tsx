"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/ToastContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Interfaces ---
export interface UserProfile {
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

export type OnboardingData = {
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

export interface MockQuestion {
  q: string;
  options: string[];
  correct: string;
}

export interface MockTest {
  id: string;
  title: string;
  timeLimit: number;
  questionsCount: number;
  questions: MockQuestion[];
}

export interface DeckItem {
  title: string;
  cards: Array<{ q: string; a: string }>;
}

interface DashboardContextType {
  user: { email: string; name: string; avatar?: string } | null;
  isAuthenticated: boolean;
  login: (credentials: { name: string; email: string; avatar?: string }) => void;
  logout: () => void;
  toast: (msg: string, type?: "success" | "info" | "error") => void;
  router: { push: (href: string) => void; prefetch?: (href: string) => void; replace?: (href: string) => void; back?: () => void };

  // States
  authLoading: boolean;
  profileLoading: boolean;
  isOnboardingCompleted: boolean;
  onboardingStep: number;
  setOnboardingStep: React.Dispatch<React.SetStateAction<number>>;
  savingProfile: boolean;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  activeGoalFocus: string;
  setActiveGoalFocus: (g: string) => void;

  // Onboarding Wizard Data
  wizardData: OnboardingData;
  setWizardData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  getSelectedDaysVal: () => number;
  getPaceHours: () => string;
  getPaceSpeedDescription: () => string;
  handleFinishOnboarding: () => Promise<void>;
  handleResetOnboarding: () => void;

  // Pomodoro
  pomodoroTime: number;
  setPomodoroTime: React.Dispatch<React.SetStateAction<number>>;
  pomodoroActive: boolean;
  setPomodoroActive: React.Dispatch<React.SetStateAction<boolean>>;
  pomodoroMode: "study" | "break";
  setPomodoroMode: React.Dispatch<React.SetStateAction<"study" | "break">>;
  formatTime: (secs: number) => string;

  // Study log calendar
  currentYear: number;
  setCurrentYear: React.Dispatch<React.SetStateAction<number>>;
  currentMonth: number;
  setCurrentMonth: React.Dispatch<React.SetStateAction<number>>;
  studyLogs: Record<string, { hours: number; notes: string }>;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleDayClick: (day: number) => void;
  selectedCalendarDate: string | null;
  calendarHours: number;
  setCalendarHours: React.Dispatch<React.SetStateAction<number>>;
  calendarNotes: string;
  setCalendarNotes: React.Dispatch<React.SetStateAction<string>>;
  isCalendarModalOpen: boolean;
  setIsCalendarModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  saveStudyLog: () => void;
  deleteStudyLog: () => void;

  // Daily Habits checklist
  dailyTasks: Array<{ id: string; label: string; completed: boolean; xpReward: number }>;
  toggleDailyTask: (id: string) => void;

  // AI Tutor chat
  chatMessages: Array<{ sender: "user" | "ai"; text: string }>;
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  isAiTyping: boolean;
  sendChatMessage: () => void;

  // Flashcards Decks
  selectedDeckId: string;
  setSelectedDeckId: React.Dispatch<React.SetStateAction<string>>;
  currentCardIndex: number;
  setCurrentCardIndex: React.Dispatch<React.SetStateAction<number>>;
  isCardFlipped: boolean;
  setIsCardFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  decksData: Record<string, DeckItem>;

  // Mock Test Suite
  activeMockTest: MockTest | null;
  mockCurrentQuestion: number;
  setMockCurrentQuestion: React.Dispatch<React.SetStateAction<number>>;
  mockAnswers: Record<number, string>;
  mockTimer: number;
  mockResults: Array<{ testName: string; score: string; date: string }>;
  mockTestsList: MockTest[];
  startMockTest: (test: MockTest) => void;
  selectMockAnswer: (qIndex: number, option: string) => void;
  submitMockTest: () => void;
  cancelMockTest: () => void;

  // Settings tab CRUD values
  settingsName: string;
  setSettingsName: React.Dispatch<React.SetStateAction<string>>;
  settingsPhone: string;
  setSettingsPhone: React.Dispatch<React.SetStateAction<string>>;
  settingsLocation: string;
  setSettingsLocation: React.Dispatch<React.SetStateAction<string>>;
  settingsTimezone: string;
  setSettingsTimezone: React.Dispatch<React.SetStateAction<string>>;
  settingsBio: string;
  setSettingsBio: React.Dispatch<React.SetStateAction<string>>;

  notificationEmail: boolean;
  setNotificationEmail: React.Dispatch<React.SetStateAction<boolean>>;
  notificationPush: boolean;
  setNotificationPush: React.Dispatch<React.SetStateAction<boolean>>;
  notificationWhatsApp: boolean;
  setNotificationWhatsApp: React.Dispatch<React.SetStateAction<boolean>>;
  notificationSMS: boolean;
  setNotificationSMS: React.Dispatch<React.SetStateAction<boolean>>;

  privacyProfile: boolean;
  setPrivacyProfile: React.Dispatch<React.SetStateAction<boolean>>;
  privacyStreaks: boolean;
  setPrivacyStreaks: React.Dispatch<React.SetStateAction<boolean>>;
  privacyAnalytics: boolean;
  setPrivacyAnalytics: React.Dispatch<React.SetStateAction<boolean>>;

  oldPassword: string;
  setOldPassword: React.Dispatch<React.SetStateAction<string>>;
  newPassword: string;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  showPasswords: boolean;
  setShowPasswords: React.Dispatch<React.SetStateAction<boolean>>;
  isChangingPassword: boolean;
  handleSaveSettings: (e: React.FormEvent) => Promise<void>;
  handleResetPassword: (e: React.FormEvent) => Promise<void>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  triggerXpAward: (amount: number, reason: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { user, isAuthenticated, login, logout } = useAuth();
  const { toast } = useToast();

  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [savingProfile, setSavingProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [activeGoalFocus, setActiveGoalFocus] = useState("");

  // Settings CRUD
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

  // Wizard Data
  const [wizardData, setWizardData] = useState<OnboardingData>({
    goals: [],
    exam: "SSC CGL",
    targetDays: 90,
    knowledgeLevel: "Intermediate",
    dailyAvailability: "2h",
    scheduleShift: "Morning",
    learningStyles: [],
    subjects: ["Quantitative Aptitude", "Reasoning", "English"],
    weaknesses: {},
    targetScore: 80,
    language: "English",
    motivationChannels: ["Email"],
    motivationFrequency: "Daily Digest",
  });

  // Pomodoro
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<"study" | "break">("study");
  const pomodoroIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calendar
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // July
  const [studyLogs, setStudyLogs] = useState<Record<string, { hours: number; notes: string }>>({});
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [calendarHours, setCalendarHours] = useState(2);
  const [calendarNotes, setCalendarNotes] = useState("");
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Habits
  const [dailyTasks, setDailyTasks] = useState([
    { id: "task1", label: "Complete 25 minutes of Pomodoro Focus Session", completed: false, xpReward: 10 },
    { id: "task2", label: "Flip and study 10 flashcards in Deck", completed: false, xpReward: 10 },
    { id: "task3", label: "Run diagnostic mock test practice session", completed: false, xpReward: 15 },
    { id: "task4", label: "Log study hours in the interactive calendar grid", completed: false, xpReward: 5 },
  ]);

  // AI Tutor chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hello! I am your ExamForge AI study coach. Feel free to ask me anything about your current preparation, exam concepts, formulas, or how to design your study schedule!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Flashcards
  const [selectedDeckId, setSelectedDeckId] = useState("deck1");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const decksData: Record<string, DeckItem> = {
    deck1: {
      title: "Quantitative Formulas",
      cards: [
        { q: "What is the formula for the volume of a Sphere?", a: "Volume = (4/3) * π * r³" },
        { q: "What is the formula for Compound Interest?", a: "A = P * (1 + r/n)^(nt)" },
        { q: "Explain the Quadratic Formula.", a: "x = [-b ± √(b² - 4ac)] / (2a)" },
        { q: "Formula for Sum of interior angles of a polygon?", a: "Sum = (n - 2) * 180°" },
      ]
    },
    deck2: {
      title: "General Awareness Trivia",
      cards: [
        { q: "Who is known as the Father of the Indian Constitution?", a: "Dr. B. R. Ambedkar" },
        { q: "Which article of the Indian Constitution guarantees the Right to Equality?", a: "Articles 14 to 18" },
        { q: "Where is the headquarters of the Reserve Bank of India located?", a: "Mumbai, India" },
        { q: "What is the currency of Japan?", a: "Japanese Yen (¥)" },
      ]
    },
    deck3: {
      title: "English Idioms & Vocabulary",
      cards: [
        { q: "What is the meaning of 'Bite the bullet'?", a: "To face a difficult situation with courage and fortitude." },
        { q: "What does 'Spill the beans' mean?", a: "To reveal a secret or confidential information prematurely." },
        { q: "What is the antonym of 'Ephemeral'?", a: "Permanent, Eternal, or Long-lasting." },
      ]
    }
  };

  // Mock Tests
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

  // Load Profile, Onboarding status, and calendar logs on mount
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

  const triggerXpAward = useCallback(async (amount: number, reason: string) => {
    if (!user?.email) return;
    const updatedXp = (userProfile?.xp || 320) + amount;
    const updatedCoins = (userProfile?.coins || 120) + Math.ceil(amount / 2);
    
    setUserProfile((prev: UserProfile | null) => {
      if (!prev) return null;
      return { ...prev, xp: updatedXp, coins: updatedCoins };
    });

    toast(`Earned +${amount} XP & +${Math.ceil(amount / 2)} Coins! (${reason})`, "success");

    try {
      await fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xp: updatedXp, coins: updatedCoins }),
      });
    } catch (e) {
      console.error("Error saving XP rewards:", e);
    }
  }, [user, userProfile, toast]);

  // Pomodoro
  useEffect(() => {
    if (pomodoroActive) {
      pomodoroIntervalRef.current = setInterval(() => {
        setPomodoroTime((prev) => {
          if (prev <= 1) {
            const nextMode = pomodoroMode === "study" ? "break" : "study";
            setTimeout(() => {
              setPomodoroMode(nextMode);
              if (nextMode === "break") {
                toast("Pomodoro Completed! Take a short 5-minute break.", "info");
                triggerXpAward(15, "Completed Pomodoro Session");
              } else {
                toast("Break over! Time to focus.", "success");
              }
            }, 0);
            return nextMode === "break" ? 5 * 60 : 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current);
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

  // Mock Test timer
  useEffect(() => {
    if (activeMockTest) {
      mockTimerIntervalRef.current = setInterval(() => {
        setMockTimer((t) => t + 1);
      }, 1000);
    } else {
      if (mockTimerIntervalRef.current) clearInterval(mockTimerIntervalRef.current);
    }
    return () => {
      if (mockTimerIntervalRef.current) clearInterval(mockTimerIntervalRef.current);
    };
  }, [activeMockTest]);

  // Finish Onboarding Wizard
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
      learningStyles: [],
      subjects: ["Quantitative Aptitude", "Reasoning", "English"],
      weaknesses: {},
      targetScore: 80,
      language: "English",
      motivationChannels: ["Email"],
      motivationFrequency: "Daily Digest",
    });
  };

  const toggleDailyTask = (id: string) => {
    const task = dailyTasks.find((t) => t.id === id);
    if (task && !task.completed) {
      triggerXpAward(task.xpReward, `Completed task: ${task.label}`);
    }

    setDailyTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === id) {
          return { ...t, completed: !t.completed };
        }
        return t;
      })
    );
  };

  // Calendar Controls
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
      [selectedCalendarDate]: { hours: calendarHours, notes: calendarNotes }
    };
    setStudyLogs(updated);
    localStorage.setItem("ef_study_logs", JSON.stringify(updated));
    setIsCalendarModalOpen(false);

    triggerXpAward(15, `Logged ${calendarHours}h study session on ${selectedCalendarDate}`);
    
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

  // AI Tutor chat replies stream simulation
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setIsAiTyping(true);

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
    activeMockTest.questions.forEach((q, idx) => {
      if (mockAnswers[idx] === q.correct) correctCount++;
    });

    const scorePct = Math.round((correctCount / activeMockTest.questions.length) * 100);
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const scoreStr = `${correctCount}/${activeMockTest.questions.length} (${scorePct}%)`;

    const newResult = {
      testName: activeMockTest.title,
      score: scoreStr,
      date: dateStr
    };

    setMockResults((prev) => [newResult, ...prev]);
    setActiveMockTest(null);

    const xpEarned = 30 + correctCount * 10;
    triggerXpAward(xpEarned, `Finished Mock Test: ${scorePct}% accuracy`);
  };

  const cancelMockTest = () => {
    setActiveMockTest(null);
    toast("Mock test cancelled", "info");
  };

  // Profile Save Settings
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
        }
      }
    } catch (err) {
      console.error(err);
      toast("Connection error while saving settings.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

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
      }
    } catch (err) {
      console.error(err);
      toast("Connection error during password change.", "error");
    } finally {
      setIsChangingPassword(false);
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
              body: JSON.stringify({ avatar_url: compressedBase64 }),
            })
              .then((res) => res.ok && res.json())
              .then((data) => {
                if (data?.success && data?.profile) {
                  setUserProfile(data.profile);
                  login({ name: data.profile.name, email: user?.email || "", avatar: data.profile.avatar_url });
                  toast("Profile picture updated successfully!", "success");
                }
              })
              .catch((err) => console.error("Error saving avatar:", err));
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <DashboardContext.Provider value={{
      user, isAuthenticated, login, logout, toast, router,
      authLoading, profileLoading, isOnboardingCompleted, onboardingStep, setOnboardingStep, savingProfile, userProfile, setUserProfile,
      isSidebarExpanded, toggleSidebar, searchQuery, setSearchQuery, activeTab, setActiveTab, activeGoalFocus, setActiveGoalFocus,
      wizardData, setWizardData, getSelectedDaysVal, getPaceHours, getPaceSpeedDescription, handleFinishOnboarding, handleResetOnboarding,
      pomodoroTime, setPomodoroTime, pomodoroActive, setPomodoroActive, pomodoroMode, setPomodoroMode, formatTime,
      currentYear, setCurrentYear, currentMonth, setCurrentMonth, studyLogs, handlePrevMonth, handleNextMonth, handleDayClick,
      selectedCalendarDate, calendarHours, setCalendarHours, calendarNotes, setCalendarNotes, isCalendarModalOpen, setIsCalendarModalOpen,
      saveStudyLog, deleteStudyLog, dailyTasks, toggleDailyTask, chatMessages, chatInput, setChatInput, isAiTyping, sendChatMessage,
      selectedDeckId, setSelectedDeckId, currentCardIndex, setCurrentCardIndex, isCardFlipped, setIsCardFlipped, decksData,
      activeMockTest, mockCurrentQuestion, setMockCurrentQuestion, mockAnswers, mockTimer, mockResults, mockTestsList,
      startMockTest, selectMockAnswer, submitMockTest, cancelMockTest,
      settingsName, setSettingsName, settingsPhone, setSettingsPhone, settingsLocation, setSettingsLocation, settingsTimezone, setSettingsTimezone, settingsBio, setSettingsBio,
      notificationEmail, setNotificationEmail, notificationPush, setNotificationPush, notificationWhatsApp, setNotificationWhatsApp, notificationSMS, setNotificationSMS,
      privacyProfile, setPrivacyProfile, privacyStreaks, setPrivacyStreaks, privacyAnalytics, setPrivacyAnalytics,
      oldPassword, setOldPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, showPasswords, setShowPasswords, isChangingPassword,
      handleSaveSettings, handleResetPassword, handleImageUpload, triggerXpAward
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

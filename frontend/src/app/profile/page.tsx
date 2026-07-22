"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { GoalEngineProvider, useGoalEngine } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Award, Star, Flame, Trophy, Coins, CheckCircle, AlertCircle,
  MapPin, Clock, Calendar, Mail, Phone, BookOpen, GraduationCap, Code,
  Globe, Share2, Settings, Edit3, Camera, Plus, Trash2, ArrowUpRight,
  Lock, Eye, Shield, BellRing, Link2, Download, Search, Check, ChevronRight,
  TrendingUp, Activity, Bookmark, Zap, BrainCircuit, MessageSquare,
  HelpCircle, Lightbulb, Compass, RotateCcw, AlertTriangle, Upload, Save,
  History, FileText, Scale, Sparkles, Sliders, ChevronDown, ChevronLeft, Undo, Redo,
  CheckSquare
} from "lucide-react";
import { useToast } from "@/lib/ToastContext";

// Interface definitions
interface SubjectStats {
  subjectName: string;
  confidence: number;
  interest: number;
  difficulty: "Easy" | "Medium" | "Hard";
  completionPct: number;
  revisionPct: number;
  mockPct: number;
}

interface RoutineItem {
  time: string;
  activity: string;
}

interface DocumentItem {
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: "verified" | "pending";
}

interface VersionSnapshot {
  id: string;
  timestamp: string;
  description: string;
  data: string; // Serialized AspirantProfileData
}

interface AspirantProfileData {
  fullName: string;
  preferredName: string;
  gender: string;
  age: number;
  dob: string;
  mobile: string;
  email: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pinCode: string;
  preferredLanguage: string;
  timezone: string;
  avatarUrl: string;
  coverPreset: string;

  currentQualification: string;
  tenthPercent: string;
  twelfthPercent: string;
  graduationStream: string;
  graduationPassingYear: string;
  graduationCgpa: string;
  university: string;
  college: string;
  medium: string;

  preparingFor: string;
  attemptNumber: string;
  previousScore: string;
  expectedScore: string;
  dreamRank: string;
  dreamJob: string;
  dreamDepartment: string;
  targetExamDate: string;

  studyBudget: string;
  canBuyBooks: boolean;
  internetAvailability: string;
  preferredDevice: string;
  learningEnvironment: string;

  wakeUpTime: string;
  sleepTime: string;
  studyHoursGoal: number;
  availableTimeSlots: string[];
  lifestyleStatus: string;
  travelTime: string;

  learningStylePreference: string[];
  subjects: SubjectStats[];

  learningSpeed: string;
  memoryRetention: string;
  concentration: number;
  stressLevel: number;
  confidenceLevel: number;
  consistency: number;
  motivationLevel: number;
  burnoutRisk: string;

  routine: RoutineItem[];

  dreamDesc: string;
  whyThisJob: string;
  familyMotivation: string;
  socialImpact: string;
  motivationStatement: string;

  theme: "light" | "dark";
  language: string;
  notificationsEnabled: {
    email: boolean;
    push: boolean;
    weeklyDigest: boolean;
    aiReminders: boolean;
  };
  reminderTime: string;
  weekendStudy: boolean;
  studyTimer: boolean;
  pomodoro: boolean;
  voiceAssistant: boolean;

  documents: DocumentItem[];

  badges: string[];
  currentStreak: number;
  longestStreak: number;
  hoursStudied: number;
  booksFinished: number;
  mockTestsCount: number;
  revisionSessionsCount: number;
  aiPoints: number;

  weeklyHours: number[];
  monthlyProgress: number[];
  examReadiness: number;
  consistencyScore: number;
  knowledgeScore: number;
  weaknessScore: number;
  aiConfidence: number;

  selectedMentor: string;
}

const DEFAULT_ASPIRANT_PROFILE: AspirantProfileData = {
  fullName: "Aniket Athanikar",
  preferredName: "Aniket",
  gender: "Male",
  age: 23,
  dob: "2003-09-12",
  mobile: "+91 9876543210",
  email: "aniket@examforge.ai",
  city: "Mumbai",
  district: "Mumbai Suburban",
  state: "Maharashtra",
  country: "India",
  pinCode: "400001",
  preferredLanguage: "English",
  timezone: "Asia/Kolkata",
  avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
  coverPreset: "from-indigo-600 via-purple-600 to-pink-500",

  currentQualification: "Graduation",
  tenthPercent: "92%",
  twelfthPercent: "88%",
  graduationStream: "Computer Engineering",
  graduationPassingYear: "2025",
  graduationCgpa: "8.9",
  university: "Mumbai University",
  college: "Vidyalankar Institute of Technology",
  medium: "English",

  preparingFor: "UPSC CSE",
  attemptNumber: "First Attempt",
  previousScore: "N/A",
  expectedScore: "115/200",
  dreamRank: "AIR 12",
  dreamJob: "IAS Officer",
  dreamDepartment: "Home Ministry",
  targetExamDate: "2027-05-30",

  studyBudget: "₹1000/month",
  canBuyBooks: true,
  internetAvailability: "Good",
  preferredDevice: "Laptop",
  learningEnvironment: "Library Access",

  wakeUpTime: "06:00",
  sleepTime: "23:00",
  studyHoursGoal: 6.0,
  availableTimeSlots: ["Morning", "Night"],
  lifestyleStatus: "Student",
  travelTime: "45 mins",

  learningStylePreference: ["Visual", "Practice", "Revision"],

  subjects: [
    { subjectName: "Indian Polity", confidence: 4, interest: 5, difficulty: "Medium", completionPct: 75, revisionPct: 50, mockPct: 68 },
    { subjectName: "History & Culture", confidence: 3, interest: 4, difficulty: "Hard", completionPct: 60, revisionPct: 30, mockPct: 55 },
    { subjectName: "Geography", confidence: 4, interest: 4, difficulty: "Easy", completionPct: 80, revisionPct: 60, mockPct: 72 },
    { subjectName: "Indian Economy", confidence: 2, interest: 3, difficulty: "Hard", completionPct: 45, revisionPct: 20, mockPct: 40 }
  ],

  learningSpeed: "Fast",
  memoryRetention: "Average",
  concentration: 4,
  stressLevel: 3,
  confidenceLevel: 4,
  consistency: 4,
  motivationLevel: 5,
  burnoutRisk: "Moderate",

  routine: [
    { time: "06:00", activity: "Wake Up & Hydrate" },
    { time: "06:30", activity: "Study Session 1: Indian Polity (Core)" },
    { time: "09:00", activity: "Breakfast & News Analysis" },
    { time: "10:30", activity: "Study Session 2: Indian Economy" },
    { time: "13:30", activity: "Lunch & Rest" },
    { time: "15:00", activity: "Solve PYQs & Mock MCQs" }
  ],

  dreamDesc: "To bring structural efficiency and transparent service delivery.",
  whyThisJob: "To utilize state authority for positive social impact.",
  familyMotivation: "Parents dedicated to education.",
  socialImpact: "Automated redressal models for district level grievances.",
  motivationStatement: "Success is a compounding series of disciplined daily routines.",

  theme: "light",
  language: "English",
  notificationsEnabled: {
    email: true,
    push: true,
    weeklyDigest: true,
    aiReminders: true
  },
  reminderTime: "20:00",
  weekendStudy: true,
  studyTimer: true,
  pomodoro: true,
  voiceAssistant: false,

  documents: [
    { name: "College_ID.pdf", type: "PDF", size: "1.2 MB", uploadedAt: "2026-07-15", status: "verified" }
  ],

  badges: ["Daily Streaker", "Mock Slayer", "Focus Champion"],
  currentStreak: 12,
  longestStreak: 45,
  hoursStudied: 245,
  booksFinished: 8,
  mockTestsCount: 14,
  revisionSessionsCount: 29,
  aiPoints: 1250,

  weeklyHours: [5.5, 6.0, 4.5, 6.5, 7.0, 5.0, 6.0],
  monthlyProgress: [30, 35, 42, 48, 55, 62, 70, 75, 78, 80, 82, 85],
  examReadiness: 68,
  consistencyScore: 88,
  knowledgeScore: 72,
  weaknessScore: 32,
  aiConfidence: 78,

  selectedMentor: "UPSC Expert"
};

const COVER_PRESETS = [
  { name: "Cosmic Purple", css: "from-indigo-600 via-purple-600 to-pink-500" },
  { name: "Cyber Sunset", css: "from-orange-500 via-rose-500 to-violet-600" },
  { name: "Aurora Green", css: "from-teal-500 via-emerald-600 to-indigo-700" },
  { name: "Tech Blue", css: "from-blue-600 via-indigo-600 to-cyan-500" }
];

export default function ProfilePage() {
  return (
    <GoalEngineProvider>
      <ProfileInner />
    </GoalEngineProvider>
  );
}

// Custom dropdown element that styling-wise blends beautifully
function PremiumSelect({
  value,
  onChange,
  options,
  label,
  disabled = false
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  label: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex flex-col gap-1 w-full text-left">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full bg-slate-50 border border-slate-200/70 text-slate-700 text-xs rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all font-semibold flex items-center justify-between cursor-pointer disabled:opacity-60"
      >
        <span>{value}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>
      {open && !disabled && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 max-h-[180px] overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full p-2 text-xs font-bold rounded-lg text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                  value === opt ? "bg-indigo-50 text-indigo-700" : "text-slate-600"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProfileInner() {
  const { user, login } = useAuth();
  const { activeGoal, completeWizard } = useGoalEngine();
  const { toast } = useToast();

  // Profile states
  const [profile, setProfile] = useState<AspirantProfileData>(DEFAULT_ASPIRANT_PROFILE);
  const [editMode, setEditMode] = useState(false);
  
  // Tab/Step flow
  const STEPS: { id: "identity" | "academics" | "journey" | "lifestyle" | "subjects" | "analytics" | "history"; label: string; icon: any }[] = [
    { id: "identity", label: "Personal Identity", icon: User },
    { id: "academics", label: "Education & Academics", icon: GraduationCap },
    { id: "journey", label: "Exam Journey", icon: Compass },
    { id: "lifestyle", label: "Study & Lifestyle", icon: Clock },
    { id: "subjects", label: "Subject Profiler", icon: BookOpen },
    { id: "analytics", label: "Living Analytics & AI", icon: BrainCircuit },
    { id: "history", label: "Version Control", icon: History }
  ];
  
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeTab = STEPS[activeStepIndex].id;

  // History version control
  const [historyList, setHistoryList] = useState<VersionSnapshot[]>([]);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);

  // Undo/Redo tracking inside edit mode
  const [editHistory, setEditHistory] = useState<AspirantProfileData[]>([]);
  const [redoStack, setRedoStack] = useState<AspirantProfileData[]>([]);

  // Confirmation Modal
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveDescription, setSaveDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic values
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDifficulty, setNewSubjectDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Load profile on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("ef_aspirant_profile");
      const savedHistory = localStorage.getItem("ef_profile_history");

      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else if (activeGoal) {
        const hydrated = {
          ...DEFAULT_ASPIRANT_PROFILE,
          fullName: activeGoal.profile.fullName || DEFAULT_ASPIRANT_PROFILE.fullName,
          preparingFor: activeGoal.targetExam || DEFAULT_ASPIRANT_PROFILE.preparingFor,
          avatarUrl: activeGoal.profile.avatar || DEFAULT_ASPIRANT_PROFILE.avatarUrl,
          studyHoursGoal: activeGoal.timeline.dailyStudyHours || DEFAULT_ASPIRANT_PROFILE.studyHoursGoal,
          burnoutRisk: activeGoal.timeline.burnoutRisk || DEFAULT_ASPIRANT_PROFILE.burnoutRisk
        };
        setProfile(hydrated);
        localStorage.setItem("ef_aspirant_profile", JSON.stringify(hydrated));
      }

      if (savedHistory) {
        setHistoryList(JSON.parse(savedHistory));
      } else {
        const initialSnapshot = {
          id: "v_init",
          timestamp: new Date().toISOString(),
          description: "Initial profile calibration",
          data: JSON.stringify(DEFAULT_ASPIRANT_PROFILE)
        };
        setHistoryList([initialSnapshot]);
        localStorage.setItem("ef_profile_history", JSON.stringify([initialSnapshot]));
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeGoal]);

  // Validation
  const validateForm = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!profile.fullName.trim()) tempErrors.fullName = "Full Name is required";
    if (!profile.email.includes("@")) tempErrors.email = "Valid Email is required";
    if (profile.age < 16 || profile.age > 60) tempErrors.age = "Age must be between 16 and 60";
    if (profile.studyHoursGoal < 1 || profile.studyHoursGoal > 18) tempErrors.studyHoursGoal = "Study Hours must be between 1 and 18";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Update profile with state tracking (Undo/Redo)
  const updateProfileData = (updated: AspirantProfileData) => {
    setEditHistory(prev => [...prev, profile]);
    setRedoStack([]); // clear redo stack on fresh changes
    setProfile(updated);
  };

  const handleUndo = () => {
    if (editHistory.length === 0) return;
    const previous = editHistory[editHistory.length - 1];
    setRedoStack(prev => [profile, ...prev]);
    setProfile(previous);
    setEditHistory(prev => prev.slice(0, -1));
    toast("Action undone", "info");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setEditHistory(prev => [...prev, profile]);
    setProfile(next);
    setRedoStack(prev => prev.slice(1));
    toast("Action redone", "info");
  };

  // Final Commit Save
  const commitSave = () => {
    if (!validateForm()) {
      toast("Please fix form errors before saving.", "error");
      setShowSaveDialog(false);
      return;
    }

    const desc = saveDescription.trim() || "Profile state updated";
    localStorage.setItem("ef_aspirant_profile", JSON.stringify(profile));

    // Update global auth user info
    login({
      name: profile.fullName,
      email: profile.email,
      avatar: profile.avatarUrl
    });

    // History snapshot
    const nextSnapshot = {
      id: `v_${Date.now()}`,
      timestamp: new Date().toISOString(),
      description: desc,
      data: JSON.stringify(profile)
    };
    const updatedHistory = [nextSnapshot, ...historyList];
    setHistoryList(updatedHistory);
    localStorage.setItem("ef_profile_history", JSON.stringify(updatedHistory));

    // Sync to active goal
    if (activeGoal) {
      const syncedGoal = {
        ...activeGoal,
        targetExam: profile.preparingFor,
        profile: {
          ...activeGoal.profile,
          fullName: profile.fullName,
          avatar: profile.avatarUrl
        },
        timeline: {
          ...activeGoal.timeline,
          dailyStudyHours: profile.studyHoursGoal,
          burnoutRisk: profile.burnoutRisk as any
        }
      };
      completeWizard(syncedGoal, `Profile sync: ${desc}`);
    }

    toast("Profile identity saved successfully!", "success");
    setEditMode(false);
    setShowSaveDialog(false);
    setSaveDescription("");
    setEditHistory([]);
    setRedoStack([]);
  };

  const handleExportProfile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `aspirant_profile_${profile.fullName.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast("Profile downloaded", "success");
  };

  const handleImportProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.fullName && imported.preparingFor) {
          setProfile(imported);
          toast("Aspirant profile loaded. Save to commit changes.", "info");
        }
      } catch {
        toast("Failed to parse profile file", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <DashboardLayout activeTab="profile">
      {/* Premium Linear Gradient Background elements */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 via-indigo-50/10 to-purple-50/20 -z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-6 pb-12 text-slate-800">
        
        {/* PROFILE HEADER HERO */}
        <div className="relative rounded-3xl bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-xl overflow-hidden">
          <div className={`h-36 w-full bg-gradient-to-r ${profile.coverPreset} relative opacity-90`}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-4 right-4 flex gap-1.5 bg-black/25 p-1.5 rounded-xl backdrop-blur-sm">
              {COVER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateProfileData({ ...profile, coverPreset: preset.css })}
                  className="w-4 h-4 rounded-full border border-white cursor-pointer shadow hover:scale-110 transition"
                  style={{ background: `linear-gradient(135deg, ${preset.css.split(" ")[1]}, ${preset.css.split(" ")[4] || "#000"})` }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          <div className="p-6 pt-0 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-5">
            <div className="flex flex-col sm:flex-row gap-5 -mt-14 items-start sm:items-end relative z-10">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 blur opacity-60" />
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="relative w-24 h-24 rounded-full border-4 border-white bg-slate-50 object-cover shadow"
                />
                <label className="absolute bottom-1 right-1 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow transition">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => updateProfileData({ ...profile, avatarUrl: reader.result as string });
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-black text-slate-800">{profile.fullName}</h2>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
                    {profile.preparingFor}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {profile.currentStreak} Day Streak
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold">
                  Target: {profile.dreamJob} • Aiming for {profile.dreamRank}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 flex-wrap w-full md:w-auto">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl shadow cursor-pointer transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Identity Settings
                </button>
              ) : (
                <div className="flex items-center gap-1.5 w-full md:w-auto">
                  <button
                    disabled={editHistory.length === 0}
                    onClick={handleUndo}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl disabled:opacity-50 cursor-pointer"
                    title="Undo Edit"
                  >
                    <Undo className="w-4 h-4" />
                  </button>
                  <button
                    disabled={redoStack.length === 0}
                    onClick={handleRedo}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl disabled:opacity-50 cursor-pointer"
                    title="Redo Edit"
                  >
                    <Redo className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (validateForm()) setShowSaveDialog(true);
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Settings
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditHistory([]);
                      setRedoStack([]);
                    }}
                    className="flex-1 md:flex-none px-4 py-2 text-xs font-bold bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <button
                onClick={handleExportProfile}
                title="Export Profile"
                className="p-2 bg-slate-50 border border-slate-250/50 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-600"
              >
                <Download className="w-4 h-4" />
              </button>
              <label className="p-2 bg-slate-55 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer text-slate-600 flex items-center justify-center">
                <Upload className="w-4 h-4" />
                <input type="file" accept=".json" onChange={handleImportProfile} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* STEPPER BAR */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200/70 p-1.5 rounded-2xl shadow-sm overflow-x-auto">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeStepIndex === idx
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {step.label}
              </button>
            );
          })}
        </div>

        {/* STEP WORKSPACE */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/70 rounded-3xl p-6 shadow-sm min-h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              
              {/* STEP 1: IDENTITY */}
              {activeTab === "identity" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Aspirant Personal Identity</h3>
                    <p className="text-xs text-slate-400">Core personal metadata linked to regional state exams.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profile.fullName}
                        onChange={(e) => updateProfileData({ ...profile, fullName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                      {errors.fullName && <p className="text-[10px] text-rose-500 font-bold pl-1">{errors.fullName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Preferred Name</label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profile.preferredName}
                        onChange={(e) => updateProfileData({ ...profile, preferredName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <PremiumSelect
                      label="Gender"
                      disabled={!editMode}
                      value={profile.gender}
                      onChange={(val) => updateProfileData({ ...profile, gender: val })}
                      options={["Male", "Female", "Other"]}
                    />

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Age</label>
                      <input
                        type="number"
                        disabled={!editMode}
                        value={profile.age}
                        onChange={(e) => updateProfileData({ ...profile, age: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                      {errors.age && <p className="text-[10px] text-rose-500 font-bold pl-1">{errors.age}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Date of Birth</label>
                      <input
                        type="date"
                        disabled={!editMode}
                        value={profile.dob}
                        onChange={(e) => updateProfileData({ ...profile, dob: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <PremiumSelect
                      label="Preferred Language"
                      disabled={!editMode}
                      value={profile.preferredLanguage}
                      onChange={(val) => updateProfileData({ ...profile, preferredLanguage: val })}
                      options={["English", "Hindi", "Marathi", "Tamil", "Telugu", "Kannada", "Bengali"]}
                    />

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Mobile Number</label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profile.mobile}
                        onChange={(e) => updateProfileData({ ...profile, mobile: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
                      <input
                        type="email"
                        disabled={!editMode}
                        value={profile.email}
                        onChange={(e) => updateProfileData({ ...profile, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                      {errors.email && <p className="text-[10px] text-rose-500 font-bold pl-1">{errors.email}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">State</label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profile.state}
                        onChange={(e) => updateProfileData({ ...profile, state: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ACADEMICS */}
              {activeTab === "academics" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Academic Credentials</h3>
                    <p className="text-xs text-slate-400">Historically tracked education grades and background qualifications.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <PremiumSelect
                      label="Highest Qualification"
                      disabled={!editMode}
                      value={profile.currentQualification}
                      onChange={(val) => updateProfileData({ ...profile, currentQualification: val })}
                      options={["Graduation", "Post Graduation", "PhD", "12th Standard", "Diploma"]}
                    />

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Graduation Stream</label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profile.graduationStream}
                        onChange={(e) => updateProfileData({ ...profile, graduationStream: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Graduation CGPA / %</label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profile.graduationCgpa}
                        onChange={(e) => updateProfileData({ ...profile, graduationCgpa: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">University Name</label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profile.university}
                        onChange={(e) => updateProfileData({ ...profile, university: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Medium of Study</label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profile.medium}
                        onChange={(e) => updateProfileData({ ...profile, medium: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: EXAM JOURNEY */}
              {activeTab === "journey" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Civil Services & Exam Journey</h3>
                    <p className="text-xs text-slate-400">Target metrics, attempt history, department goals, and core dreams.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <PremiumSelect
                      label="Preparing For"
                      disabled={!editMode}
                      value={profile.preparingFor}
                      onChange={(val) => updateProfileData({ ...profile, preparingFor: val })}
                      options={["UPSC CSE", "State PSC", "JEE Advanced", "NEET UG", "CAT", "GATE", "SSC CGL", "Banking PO"]}
                    />

                    <PremiumSelect
                      label="Attempt Number"
                      disabled={!editMode}
                      value={profile.attemptNumber}
                      onChange={(val) => updateProfileData({ ...profile, attemptNumber: val })}
                      options={["First Attempt", "Second Attempt", "Third Attempt", "Fourth Attempt", "Fifth Attempt+"]}
                    />

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Target Exam Date</label>
                      <input
                        type="date"
                        disabled={!editMode}
                        value={profile.targetExamDate}
                        onChange={(e) => updateProfileData({ ...profile, targetExamDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Dream Rank</label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profile.dreamRank}
                        onChange={(e) => updateProfileData({ ...profile, dreamRank: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Dream Job Position</label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profile.dreamJob}
                        onChange={(e) => updateProfileData({ ...profile, dreamJob: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: STUDY & LIFESTYLE */}
              {activeTab === "lifestyle" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Study Lifestyle & Routine</h3>
                    <p className="text-xs text-slate-400">Available study slots, book budgets, device compatibility, and routines.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <PremiumSelect
                      label="Current Lifestyle Status"
                      disabled={!editMode}
                      value={profile.lifestyleStatus}
                      onChange={(val) => updateProfileData({ ...profile, lifestyleStatus: val })}
                      options={["Student", "Working Professional", "Homemaker", "Part-Time Job"]}
                    />

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Daily Study Hours Goal</label>
                      <input
                        type="number"
                        disabled={!editMode}
                        value={profile.studyHoursGoal}
                        onChange={(e) => updateProfileData({ ...profile, studyHoursGoal: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                      {errors.studyHoursGoal && <p className="text-[10px] text-rose-500 font-bold pl-1">{errors.studyHoursGoal}</p>}
                    </div>

                    <PremiumSelect
                      label="Study Budget"
                      disabled={!editMode}
                      value={profile.studyBudget}
                      onChange={(val) => updateProfileData({ ...profile, studyBudget: val })}
                      options={["Free", "₹500/month", "₹1000/month", "₹5000+/month"]}
                    />

                    <PremiumSelect
                      label="Internet Quality"
                      disabled={!editMode}
                      value={profile.internetAvailability}
                      onChange={(val) => updateProfileData({ ...profile, internetAvailability: val })}
                      options={["Poor", "Average", "Good"]}
                    />

                    <PremiumSelect
                      label="Learning Environment"
                      disabled={!editMode}
                      value={profile.learningEnvironment}
                      onChange={(val) => updateProfileData({ ...profile, learningEnvironment: val })}
                      options={["Library Access", "Hostel", "Coaching Institute", "Self-Study Home"]}
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: SUBJECT PROFILER */}
              {activeTab === "subjects" && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center flex-wrap gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Syllabus Subject Profile</h3>
                      <p className="text-xs text-slate-400">Confidence, progress rates, chapters, and dynamic exam weights.</p>
                    </div>
                    {editMode && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add Subject..."
                          value={newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={handleAddSubject}
                          className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.subjects.map((sub, idx) => (
                      <div key={idx} className="border border-slate-200/80 bg-slate-50/20 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800">{sub.subjectName}</span>
                          {editMode && (
                            <button
                              onClick={() => {
                                const updated = profile.subjects.filter((_, i) => i !== idx);
                                updateProfileData({ ...profile, subjects: updated });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-white border border-slate-200/40 rounded-xl p-2">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Confidence</span>
                            <span className="font-bold text-indigo-700">{sub.confidence}/5</span>
                          </div>
                          <div className="bg-white border border-slate-200/40 rounded-xl p-2">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Completion</span>
                            <span className="font-bold text-slate-700">{sub.completionPct}%</span>
                          </div>
                          <div className="bg-white border border-slate-200/40 rounded-xl p-2">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Mock score</span>
                            <span className="font-bold text-emerald-600">{sub.mockPct}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: ANALYTICS & AI */}
              {activeTab === "analytics" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Living Analytics & AI Behavior</h3>
                    <p className="text-xs text-slate-400">Consistency metrics, stress thresholds, and target AI Mentor Personality.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PremiumSelect
                      label="Select AI Mentor Personality"
                      disabled={!editMode}
                      value={profile.selectedMentor}
                      onChange={(val) => updateProfileData({ ...profile, selectedMentor: val })}
                      options={["UPSC Expert", "Strict Coach", "Friendly Teacher", "Motivational Coach", "Exam Strategist"]}
                    />

                    <div className="bg-indigo-50/20 border border-indigo-100/50 rounded-2xl p-4 space-y-2">
                      <span className="text-[10px] font-black text-indigo-950 uppercase tracking-wider block">AI Behavior stats</span>
                      <p className="text-xs text-indigo-850">
                        Learning Speed: <span className="font-bold text-indigo-900">{profile.learningSpeed}</span> • Memory Retention: <span className="font-bold text-indigo-900">{profile.memoryRetention}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: HISTORY SNAPSHOTS */}
              {activeTab === "history" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Profile Snapshots History</h3>
                    <p className="text-xs text-slate-400">Compare previous data snapshots or restore session settings.</p>
                  </div>

                  <div className="space-y-2.5">
                    {historyList.map((hist) => (
                      <div key={hist.id} className="flex justify-between items-center p-3.5 border border-slate-200/60 rounded-xl bg-slate-50/30">
                        <div>
                          <p className="text-xs font-black text-slate-800">{hist.description}</p>
                          <p className="text-[10px] text-slate-400">{new Date(hist.timestamp).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => {
                            try {
                              const restored = JSON.parse(hist.data);
                              updateProfileData(restored);
                              toast(`Loaded snapshot: ${hist.description}`, "info");
                            } catch {
                              toast("Could not read snapshot data", "error");
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black cursor-pointer"
                        >
                          Load Snapshot
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stepper Navigation Buttons */}
              <div className="flex justify-between items-center pt-5 border-t border-slate-150/40">
                <button
                  type="button"
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="button"
                  disabled={activeStepIndex === STEPS.length - 1}
                  onClick={() => setActiveStepIndex(prev => Math.min(STEPS.length - 1, prev + 1))}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-550 hover:text-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* FINAL COMMIT SAVE DIALOG CONFIRMATION BOX */}
      <AnimatePresence>
        {showSaveDialog && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-650 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Confirm Profile Calibration</h3>
                  <p className="text-[11px] text-slate-400">Save current edits and commit updates to active goals.</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider pl-1">Change Description</label>
                <input
                  type="text"
                  placeholder="e.g., Updated daily study hours, added Polity weakness"
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-650 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={commitSave}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Confirm & Commit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );

  function handleAddSubject() {
    if (!newSubjectName.trim()) return;
    const newSub: SubjectStats = {
      subjectName: newSubjectName,
      confidence: 3,
      interest: 3,
      difficulty: newSubjectDifficulty,
      completionPct: 0,
      revisionPct: 0,
      mockPct: 0
    };
    updateProfileData({
      ...profile,
      subjects: [...profile.subjects, newSub]
    });
    setNewSubjectName("");
  }
}

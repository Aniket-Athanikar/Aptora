"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { GoalEngineProvider, useGoalEngine } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Award, Star, Flame, Trophy, Coins, CheckCircle, AlertCircle,
  MapPin, Clock, Calendar, Mail, Phone, BookOpen, GraduationCap, Code,
  Globe, Share2, Settings, Edit3, Camera, Plus, Trash2, ArrowUpRight,
  Lock, Eye, Shield, BellRing, Link2, Download, Search, Check, ChevronRight,
  TrendingUp, Activity, Bookmark, Zap, BookOpenCheck, BrainCircuit, MessageSquare,
  HelpCircle, Lightbulb, Compass, RotateCcw, AlertTriangle
} from "lucide-react";
import { useToast } from "@/lib/ToastContext";
import * as LucideIcons from "lucide-react";

// Interface for editable profile state
interface UserProfileData {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  education: string;
  stream: string;
  targetExam: string;
  attemptYear: string;
  preferredLanguage: string;
  dailyStudyGoal: number;
  weeklyGoal: number;
  location: string;
  timezone: string;
  skills: string[];
  languages: string[];
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
  };
  connectedAccounts: {
    google: boolean;
    github: boolean;
  };
  studyPreferences: string[];
  notificationSettings: {
    email: boolean;
    push: boolean;
    weeklyDigest: boolean;
    aiReminders: boolean;
  };
}

const DEFAULT_PROFILE: UserProfileData = {
  fullName: "Aniket Athanikar",
  email: "aniket.athanikar@examforge.ai",
  phone: "+1 (555) 019-2834",
  bio: "Senior AI Aspirant & Engineering graduate preparing for elite exams. Passionate about system architectures, active recall, and deep cognitive training sessions.",
  education: "B.Tech in Computer Science",
  stream: "Information Technology",
  targetExam: "GATE CS 2027",
  attemptYear: "2027",
  preferredLanguage: "English",
  dailyStudyGoal: 6, // hours
  weeklyGoal: 40, // hours
  location: "Mumbai, India",
  timezone: "Asia/Kolkata (GMT+5:30)",
  skills: ["Algorithms", "Data Structures", "System Design", "Operating Systems", "DBMS", "Computer Networks"],
  languages: ["English"],
  socialLinks: {
    github: "https://github.com/aniket-athanikar",
    linkedin: "https://linkedin.com/in/aniketathanikar",
    twitter: "https://twitter.com/aniket_codes"
  },
  connectedAccounts: {
    google: true,
    github: true
  },
  studyPreferences: ["Solo focus block", "Active recall quizzes", "Late-night Pomodoro", "Visual flashcards"],
  notificationSettings: {
    email: true,
    push: true,
    weeklyDigest: true,
    aiReminders: true
  }
};








// Dicebear premium seeds to choose from
const AVATAR_SEEDS = [
  "Felix", "Aneka", "Jack", "Oliver", "Sophia", "Zoe", "Buster", "Luna"
];

// Cover banner preset gradients
const COVER_PRESETS = [
  { name: "Cosmic Purple", css: "from-indigo-600 via-purple-600 to-pink-500" },
  { name: "Cyber Sunset", css: "from-orange-500 via-rose-500 to-violet-600" },
  { name: "Aurora Green", css: "from-teal-500 via-emerald-600 to-indigo-700" },
  { name: "Tech Blue", css: "from-blue-600 via-indigo-600 to-cyan-500" }
];

function ProfileContent() {
  const { user, login } = useAuth();
  const { toast } = useToast();

  // Local profile state backed by storage
  const [profile, setProfile] = useState<UserProfileData>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [avatarSeed, setAvatarSeed] = useState("Felix");
  const [coverIndex, setCoverIndex] = useState(0);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  // Settings emulation variables
  const [settingsLanguage, setSettingsLanguage] = useState("English");
  const [settingsTheme, setSettingsTheme] = useState("light");
  const [privacySearchable, setPrivacySearchable] = useState(true);
  const [privacyShowActivity, setPrivacyShowActivity] = useState(true);

  // AI interactive states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("ef_profile_data");
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
      const storedSeed = localStorage.getItem("ef_avatar_seed");
      if (storedSeed) {
        setAvatarSeed(storedSeed);
      }
      const storedCover = localStorage.getItem("ef_cover_index");
      if (storedCover) {
        setCoverIndex(parseInt(storedCover, 10));
      }
    } catch (e) {
      console.error("Could not load profile preferences:", e);
    }
  }, []);

  // Synchronize dynamic updates from the authentication session (e.g. sidebar modal save)
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
      }));
      if (user.avatar) {
        const match = user.avatar.match(/seed=([^&]+)/);
        if (match && match[1]) {
          setAvatarSeed(match[1]);
        }
      }
    }
  }, [user]);

  // Save utility
  const saveProfileData = (updated: UserProfileData) => {
    setProfile(updated);
    localStorage.setItem("ef_profile_data", JSON.stringify(updated));

    // Sync to main auth context so sidebar updates instantly
    login({
      name: updated.fullName,
      email: updated.email,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`
    });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfileData(profile);
    setIsEditing(false);
    toast("Profile successfully synchronized!", "success");
  };

  const handleAvatarChange = (seed: string) => {
    setAvatarSeed(seed);
    localStorage.setItem("ef_avatar_seed", seed);
    login({
      name: profile.fullName,
      email: profile.email,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`
    });
    setShowAvatarPicker(false);
    toast("Avatar customized successfully!", "success");
  };

  const handleCoverChange = (index: number) => {
    setCoverIndex(index);
    localStorage.setItem("ef_cover_index", index.toString());
    setShowCoverPicker(false);
    toast("Banner aesthetic updated!", "success");
  };

  // Profile completion calculation
  const getProfileCompletion = () => {
    let score = 0;
    const total = 8;

    if (profile.fullName.trim()) score++;
    if (profile.bio.trim()) score++;
    if (profile.education.trim()) score++;
    if (profile.location.trim()) score++;
    if (profile.skills.length > 0) score++;
    if (profile.languages.length > 0) score++;
    if (profile.socialLinks.github || profile.socialLinks.linkedin) score++;
    if (profile.phone.trim()) score++;

    return {
      percentage: Math.round((score / total) * 100),
      missing: [
        !profile.fullName.trim() && "Full Name",
        !profile.bio.trim() && "Personal Bio",
        !profile.education.trim() && "Education Details",
        !profile.location.trim() && "Location/Country",
        profile.skills.length === 0 && "Skills Tags",
        profile.languages.length === 0 && "Languages",
        (!profile.socialLinks.github && !profile.socialLinks.linkedin) && "Social Connections",
        !profile.phone.trim() && "Phone Number"
      ].filter(Boolean) as string[]
    };
  };

  const completion = getProfileCompletion();

  // Simulated AI response generation
  const handleAskAI = (action: string) => {
    setIsGeneratingAi(true);
    setAiResponse(null);
    setTimeout(() => {
      setIsGeneratingAi(false);
      if (action === "motivation") {
        setAiResponse("ðŸŽ¯ AI Mentor: Aniket, you're on a 5-day streak and scoring 84% in Algorithms. The cognitive model predicts that devoting 35 minutes to 'Graph Traversals' today will elevate your test readiness for your target exam by 6.4%. Keep pushing!");
      } else if (action === "revision") {
        setAiResponse("ðŸ“ AI Quick Revision Notes Generated: 'Mutex vs Semaphore'. Mutex is a locking mechanism (binary) used to synchronize access to a resource. Semaphore is a signaling mechanism (counting/binary) using wait/signal operations. Perfect for a 5-minute refresher!");
      } else if (action === "ask") {
        setAiResponse(`ðŸ¤– AI Insights response to "${aiPrompt || "How to optimize study blocks?"}": Structuring study sessions in 50-minute intense deep blocks followed by 10-minute active recall drills maximizes retention. Based on your peak performance history, your prime comprehension hours are 8:30 PM to 11:30 PM. Focus on DBMS theory during this next window.`);
      }
    }, 1200);
  };

  // Mock analytical and gamified items
  const stats = {
    solved: 542,
    totalQuestions: 1200,
    mockTests: 24,
    studyHours: 184,
    streak: 8,
    longestStreak: 21,
    accuracy: 78,
    rank: 142,
    xp: 4850,
    coins: 720,
    level: 14,
    targetXp: 6000
  };

  const subjectsPerformance = [
    { subject: "Algorithms", value: 85, color: "bg-indigo-500", text: "text-indigo-600" },
    { subject: "Operating Systems", value: 78, color: "bg-purple-500", text: "text-purple-600" },
    { subject: "Data Structures", value: 92, color: "bg-emerald-500", text: "text-emerald-600" },
    { subject: "System Design", value: 65, color: "bg-amber-500", text: "text-amber-600" },
    { subject: "Database Systems", value: 72, color: "bg-pink-500", text: "text-pink-600" },
  ];

  const recentTimeline = [
    { type: "quiz", title: "Practice Quiz: Advanced Sorting Algorithms", time: "2 hours ago", details: "Scored 90% (9/10 correct) â€¢ +50 XP", icon: <Code className="w-4 h-4 text-white" />, color: "bg-indigo-600" },
    { type: "mock", title: "GATE CS Mock Test #12", time: "Yesterday", details: "Scored 74.5/100 â€¢ Predicted percentile: 98.4% â€¢ +200 XP", icon: <Award className="w-4 h-4 text-white" />, color: "bg-emerald-600" },
    { type: "note", title: "Created AI Summary: CPU Scheduling Criteria", time: "2 days ago", details: "3-page synthesis created from reference syllabus", icon: <BookOpen className="w-4 h-4 text-white" />, color: "bg-amber-500" },
    { type: "chat", title: "Consulted AI Mentor: Memory Management", time: "3 days ago", details: "Asked 4 clarification questions regarding Virtual Memory pagination", icon: <MessageSquare className="w-4 h-4 text-white" />, color: "bg-purple-500" },
  ];

  const achievements = [
    { title: "Quiz Conqueror", desc: "10 quizzes completed with >80% accuracy", unlocked: true, icon: "Target", color: "from-blue-400 to-indigo-500" },
    { title: "Night Owl", desc: "Studied 5 times between 12 AM and 4 AM", unlocked: true, icon: "Moon", color: "from-purple-400 to-pink-500" },
    { title: "Syllabus Explorer", desc: "Completed 50% of the core syllabus", unlocked: true, icon: "Compass", color: "from-amber-400 to-orange-500" },
    { title: "Flawless Streak", desc: "Reached a 7-day study consistency", unlocked: true, icon: "Flame", color: "from-orange-500 to-rose-500" },
    { title: "Elite Ranker", desc: "Enter top 5% of global leaderboard", unlocked: false, icon: "Crown", color: "from-emerald-400 to-teal-500" },
  ];

  const bookmarks = [
    { id: 1, title: "Question: Red-Black Tree Rotation properties", type: "Question", tag: "Data Structures", date: "Added July 12" },
    { id: 2, title: "Revision Guide: TCP/IP Congestion Control Windows", type: "Note", tag: "Computer Networks", date: "Added July 10" },
    { id: 3, title: "Standard PDF: Process States & Context Switching", type: "PDF Reference", tag: "Operating Systems", date: "Added July 05" },
    { id: 4, title: "AI chat: Difference between 2PL and strict 2PL", type: "Saved Chat", tag: "DBMS", date: "Added June 28" },
  ];

  return (
    <div className="space-y-8 pb-16 relative">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-indigo-200/20 rounded-full filter blur-[120px]" />
        <div className="absolute top-2/3 right-1/4 w-[500px] h-[500px] bg-purple-100/10 rounded-full filter blur-[150px]" />
      </div>
      {/* ----------------- PHASE 2: COVER BANNER ----------------- */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-gray-100 group/banner">
        {/* Animated Background */}
        <div className={`h-48 md:h-64 w-full bg-gradient-to-r ${COVER_PRESETS[coverIndex].css} relative transition-all duration-700 ease-in-out`}>
          <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Animated floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="absolute top-10 left-[15%] w-24 h-24 bg-white/10 rounded-full blur-xl animate-soft-pulse" />
            <div className="absolute bottom-5 right-[20%] w-32 h-32 bg-white/20 rounded-full blur-2xl animate-soft-pulse" style={{ animationDelay: "2s" }} />
          </div>
        </div>

        {/* Change Cover Trigger */}
        <button
          onClick={() => setShowCoverPicker(!showCoverPicker)}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-md hover:bg-white text-gray-700 text-[10px] md:text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs border border-white/20"
        >
          <Camera className="w-3.5 h-3.5" /> Customize Banner
        </button>

        {/* Banner Presets Drawer */}
        <AnimatePresence>
          {showCoverPicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass border border-white/20 p-3 rounded-2xl shadow-xl z-30 w-56 space-y-2 backdrop-blur-xl"
            >
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Select Theme Gradient</p>
              <div className="grid grid-cols-2 gap-2">
                {COVER_PRESETS.map((preset, idx) => (
                  <button
                    key={preset.name}
                    onClick={() => handleCoverChange(idx)}
                    className={`h-12 rounded-xl bg-gradient-to-r ${preset.css} border transition-all relative ${coverIndex === idx ? "border-indigo-600 scale-[1.03] ring-2 ring-indigo-100" : "border-gray-200 hover:scale-[1.02]"}`}
                    title={preset.name}
                  >
                    {coverIndex === idx && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                        <Check className="w-4 h-4 text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Banner Content Details */}
        <div className="absolute bottom-4 left-6 right-6 hidden md:flex items-end justify-between text-white">
          <div className="flex items-center gap-2.5">
            <span className="bg-indigo-500/80 backdrop-blur-md text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10">
              {profile.targetExam}
            </span>
            <span className="bg-emerald-500/80 backdrop-blur-md text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10">
              Attempt: {profile.attemptYear}
            </span>
          </div>
          <p className="text-xs text-white/80 font-medium">Last active profile update: Just now</p>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ----------------- PHASE 3: LEFT SIDEBAR PROFILE CARD ----------------- */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar & Main Credentials Panel */}
          <div className="glass border border-white/20 rounded-3xl p-6 relative shadow-xs flex flex-col items-center text-center">

            {/* Avatar block with active status indicator */}
            <div className="relative group/avatar cursor-pointer -mt-16 mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 relative">
                <img
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />

                {/* Upload Hover Overlay */}
                <div
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                >
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Online Indicator */}
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-50 pointer-events-none" />
            </div>

            {/* Avatar Seed Picker Drawer */}
            <AnimatePresence>
              {showAvatarPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-20 glass border border-white/20 p-4 rounded-2xl shadow-xl z-30 w-72 backdrop-blur-xl"
                >
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 text-center">Select Profile Persona</p>
                  <div className="grid grid-cols-4 gap-2">
                    {AVATAR_SEEDS.map((seed) => (
                      <button
                        key={seed}
                        onClick={() => handleAvatarChange(seed)}
                        className={`w-12 h-12 rounded-full overflow-hidden border p-1 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-400 transition-all ${avatarSeed === seed ? "border-indigo-600 scale-[1.05]" : "border-gray-200"}`}
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`}
                          alt={seed}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verification / Premium Badge & User Identity */}
            <div className="flex items-center gap-1.5 mt-1">
              <h2 className="text-lg font-black text-gray-900 leading-tight"><span className="gradient-text">{profile.fullName}</span></h2>
              <div className="flex gap-0.5">
                <span className="text-indigo-600 cursor-help" title="Premium AI SaaS Subscriber">
                  <Sparkles className="w-4.5 h-4.5 fill-indigo-100" />
                </span>
                <span className="text-emerald-500 cursor-help" title="Identity Verified Student Account">
                  <CheckCircle className="w-4.5 h-4.5 fill-emerald-100" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 font-bold tracking-tight mt-0.5">{profile.email}</p>

            {/* Streak, Rank, Coins grid */}
            <div className="grid grid-cols-3 gap-2 w-full mt-6 bg-gray-50 border border-gray-100 p-3 rounded-2xl text-center">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">Streak</p>
                <div className="flex items-center justify-center gap-0.5 text-xs font-black text-orange-600 mt-0.5">
                  <Flame className="w-3.5 h-3.5 fill-orange-200" /> {stats.streak} Days
                </div>
              </div>
              <div className="border-x border-gray-150">
                <p className="text-[9px] font-bold text-gray-400 uppercase">Rank</p>
                <div className="flex items-center justify-center gap-0.5 text-xs font-black text-indigo-600 mt-0.5">
                  <Trophy className="w-3.5 h-3.5 fill-indigo-150" /> #{stats.rank}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">Coins</p>
                <div className="flex items-center justify-center gap-0.5 text-xs font-black text-amber-600 mt-0.5">
                  <Coins className="w-3.5 h-3.5 fill-amber-100" /> {stats.coins}
                </div>
              </div>
            </div>

            {/* Gamification Level status */}
            <div className="w-full mt-5 space-y-1 text-left">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                <span>LVL {stats.level} Scholar</span>
                <span>{stats.xp} / {stats.targetXp} XP</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-1000"
                  style={{ width: `${(stats.xp / stats.targetXp) * 100}%` }}
                />
              </div>
            </div>

            {/* Main Interactive Controls */}
            <div className="flex items-center gap-2 w-full mt-6">
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (!isEditing) setActiveTab("settings");
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast("Profile link copied to clipboard!", "success");
                }}
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 p-2.5 rounded-xl transition-all"
                title="Share Profile Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActiveTab("settings");
                  setIsEditing(false);
                }}
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 p-2.5 rounded-xl transition-all"
                title="Account Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profile Completion Panel */}
          <div className="glass border border-white/20 rounded-3xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Profile Strength</h3>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-2 py-0.5 rounded-lg">
                {completion.percentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>

            {/* Checklist of missing items */}
            {completion.missing.length > 0 ? (
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Strengthen profile by completing:</p>
                {completion.missing.slice(0, 3).map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Provide {item}</span>
                  </div>
                ))}
                {completion.missing.length > 3 && (
                  <p className="text-[10px] text-indigo-500 font-bold mt-1">+ {completion.missing.length - 3} more action items</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                <Check className="w-4 h-4" />
                <span>Enterprise profile fully populated!</span>
              </div>
            )}
          </div>

          {/* Core Professional Credentials Section */}
          <div className="glass border border-white/20 rounded-3xl p-6 space-y-5 shadow-xs">
            <h3 className="text-xs font-black text-gray-950 uppercase tracking-wider border-b border-gray-50 pb-2.5">Profile Info</h3>

            {/* Bio Card */}
            <div className="space-y-1.5 text-xs text-gray-700">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase">Biography</label>
              <p className="leading-relaxed font-semibold italic text-gray-600">{profile.bio}</p>
            </div>

            {/* Information attributes list */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Education</p>
                  <p className="text-xs text-gray-700 font-bold mt-1">{profile.education}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">{profile.stream}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Location</p>
                  <p className="text-xs text-gray-700 font-bold mt-1">{profile.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Timezone</p>
                  <p className="text-xs text-gray-700 font-bold mt-1">{profile.timezone}</p>
                </div>
              </div>
            </div>

            {/* Skill tags */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Active Syllabus Skills</label>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-indigo-50/70 border border-indigo-100/50 text-indigo-600 font-bold text-[10px] px-2.5 py-1 rounded-xl"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Language details */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Languages</label>
              <p className="text-xs text-gray-700 font-bold">{profile.languages.join(", ")}</p>
            </div>

            {/* Connected Accounts & Social integrations */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Integrations</label>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-sky-500" /> LinkedIn Professional
                </span>
                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">Linked</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-gray-800" /> GitHub Sync
                </span>
                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">Synced</span>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------- PHASE 4: RIGHT TABS INTERFACE ----------------- */}
        <div className="lg:col-span-2 space-y-6">

          {/* Navigation Tab list header */}
          <div className="glass border border-white/20 rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-xs sticky top-0 z-10 overflow-x-auto backdrop-blur-md">
            {[
              { id: "overview", label: "Overview", icon: <Compass className="w-3.5 h-3.5" /> },
              { id: "analytics", label: "Analytics", icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { id: "ai", label: "AI Insights", icon: <BrainCircuit className="w-3.5 h-3.5" /> },
              { id: "activity", label: "Activity Logs", icon: <Activity className="w-3.5 h-3.5" /> },
              { id: "achievements", label: "Achievements", icon: <Award className="w-3.5 h-3.5" /> },
              { id: "bookmarks", label: "Bookmarks", icon: <Bookmark className="w-3.5 h-3.5" /> },
              { id: "settings", label: "Settings", icon: <Settings className="w-3.5 h-3.5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== "settings") setIsEditing(false);
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab.id ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Dynamic Tab Body renders */}
          <div className="space-y-6">

            {/* ----------------- OVERVIEW TAB ----------------- */}
            {activeTab === "overview" && (
              <div className="space-y-6">

                {/* Solved stats metrics row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-150 p-4.5 rounded-2xl shadow-xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Solved Questions</p>
                    <h4 className="text-2xl font-black text-gray-900 mt-1">{stats.solved} / {stats.totalQuestions}</h4>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: `${(stats.solved / stats.totalQuestions) * 100}%` }} />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-150 p-4.5 rounded-2xl shadow-xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Mock Tests Took</p>
                    <h4 className="text-2xl font-black text-gray-900 mt-1">{stats.mockTests}</h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-2">Avg. Score: 78.4%</p>
                  </div>

                  <div className="bg-white border border-gray-150 p-4.5 rounded-2xl shadow-xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Weekly Study Hours</p>
                    <h4 className="text-2xl font-black text-gray-900 mt-1">{stats.studyHours}h</h4>
                    <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" /> +12% from last week
                    </p>
                  </div>

                  <div className="bg-white border border-gray-150 p-4.5 rounded-2xl shadow-xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Subject Accuracy</p>
                    <h4 className="text-2xl font-black text-gray-900 mt-1">{stats.accuracy}%</h4>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${stats.accuracy}%` }} />
                    </div>
                  </div>
                </div>

                {/* Progress Goals with Rings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Daily Goal card */}
                  <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Daily Goal</p>
                      <h4 className="text-lg font-black text-gray-900 mt-1">6h Target</h4>
                      <p className="text-xs text-gray-500 font-semibold mt-1">4.5h completed today</p>
                    </div>
                    {/* SVG progress ring */}
                    <div className="relative w-16 h-16 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" className="stroke-gray-150" strokeWidth="6" fill="transparent" />
                        <circle cx="32" cy="32" r="28" className="stroke-indigo-600" strokeWidth="6" fill="transparent" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - 4.5/6)} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-indigo-600">75%</div>
                    </div>
                  </div>

                  {/* Weekly Goal Card */}
                  <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Weekly Goal</p>
                      <h4 className="text-lg font-black text-gray-900 mt-1">40h Target</h4>
                      <p className="text-xs text-gray-500 font-semibold mt-1">32h completed</p>
                    </div>
                    {/* SVG progress ring */}
                    <div className="relative w-16 h-16 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" className="stroke-gray-150" strokeWidth="6" fill="transparent" />
                        <circle cx="32" cy="32" r="28" className="stroke-purple-600" strokeWidth="6" fill="transparent" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - 32/40)} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-purple-600">80%</div>
                    </div>
                  </div>

                  {/* Monthly Target syllabus completion */}
                  <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Monthly Syllabus</p>
                      <h4 className="text-lg font-black text-gray-900 mt-1">68% Target</h4>
                      <p className="text-xs text-gray-500 font-semibold mt-1">62% currently calibrated</p>
                    </div>
                    {/* SVG progress ring */}
                    <div className="relative w-16 h-16 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" className="stroke-gray-150" strokeWidth="6" fill="transparent" />
                        <circle cx="32" cy="32" r="28" className="stroke-emerald-600" strokeWidth="6" fill="transparent" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - 62/68)} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-emerald-600">91%</div>
                    </div>
                  </div>

                </div>

                {/* Exam preparation parameters */}
                <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-4">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-2">Active Success Path Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                        <span className="text-gray-400 font-bold">Preparation Level</span>
                        <span className="text-indigo-600 font-black">Advanced (Stage 3)</span>
                      </div>
                      <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                        <span className="text-gray-400 font-bold">Preferred Study Slot</span>
                        <span className="text-gray-700 font-black">Night Owls (8 PM - 12 AM)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                        <span className="text-gray-400 font-bold">Favorite Syllabus subjects</span>
                        <span className="text-gray-700 font-black">Data Structures, Algorithms</span>
                      </div>
                      <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                        <span className="text-gray-400 font-bold">Focus Target Strategy</span>
                        <span className="text-gray-700 font-black">Active Recall & PYQ analysis</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Study Suggestion widget */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 fill-indigo-200" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-100">Live AI Mentor Suggestion</span>
                    </div>
                    <h3 className="text-lg font-black">Focus on Operating Systems Semaphores today!</h3>
                    <p className="text-xs text-white/80 max-w-lg leading-relaxed">
                      Your historical correctness rate in synchronization primitives is 62%, compared to your overall OS accuracy of 78%. We recommend attempting a 10-question quiz to solidify your understanding.
                    </p>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setActiveTab("ai");
                          handleAskAI("revision");
                        }}
                        className="bg-white text-indigo-600 text-xs font-black px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-all shadow-xs"
                      >
                        Quick Revision Notes
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("ai");
                          handleAskAI("motivation");
                        }}
                        className="bg-indigo-700/40 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-700/60 transition-all border border-white/10"
                      >
                        Unlock AI Coaching Advice
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ----------------- ANALYTICS TAB ----------------- */}
            {activeTab === "analytics" && (
              <div className="space-y-6">

                {/* SVG charts mock representation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Subject Prep Levels Radar/Polar Chart */}
                  <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Subject Preparation Levels</h4>
                      <span className="text-[10px] text-gray-400 font-bold">Accuracy Metric</span>
                    </div>

                    {/* Graph drawing via CSS lists for perfect visual beauty */}
                    <div className="space-y-3.5 pt-2">
                      {subjectsPerformance.map((sub) => (
                        <div key={sub.subject} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-gray-600">
                            <span>{sub.subject}</span>
                            <span className={sub.text}>{sub.value}% Accuracy</span>
                          </div>
                          <div className="w-full bg-gray-50 border border-gray-100 rounded-full h-3.5 p-0.5 overflow-hidden">
                            <div
                              className={`${sub.color} h-full rounded-full transition-all duration-1000`}
                              style={{ width: `${sub.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hourly study distribution line graph */}
                  <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Study Duration Trends (Week)</h4>
                      <span className="text-[10px] text-indigo-600 font-bold">Avg. 5.8h/day</span>
                    </div>

                    <div className="h-56 flex items-end justify-between gap-1 pt-6 px-2 relative">
                      {/* Grid background markers */}
                      <div className="absolute inset-x-0 top-12 border-t border-dashed border-gray-100" />
                      <div className="absolute inset-x-0 top-24 border-t border-dashed border-gray-100" />
                      <div className="absolute inset-x-0 top-36 border-t border-dashed border-gray-100" />

                      {/* Bar columns */}
                      {[
                        { day: "Mon", hrs: 4.5, percentage: "65%" },
                        { day: "Tue", hrs: 6.2, percentage: "85%" },
                        { day: "Wed", hrs: 7.0, percentage: "95%" },
                        { day: "Thu", hrs: 5.0, percentage: "70%" },
                        { day: "Fri", hrs: 6.5, percentage: "88%" },
                        { day: "Sat", hrs: 8.0, percentage: "100%" },
                        { day: "Sun", hrs: 3.5, percentage: "50%" }
                      ].map((item) => (
                        <div key={item.day} className="flex flex-col items-center flex-1 z-10 group cursor-pointer">
                          <span className="text-[9px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-indigo-50 border border-indigo-100 px-1 rounded-md">
                            {item.hrs}h
                          </span>
                          <div className="w-full bg-gray-100 rounded-t-xl h-36 flex items-end overflow-hidden">
                            <div
                              className="bg-indigo-600 hover:bg-indigo-500 w-full rounded-t-xl transition-all duration-700"
                              style={{ height: item.percentage }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 mt-2">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Heatmap Activity Grid */}
                <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Consistency Heatmap</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Study grid for the past 24 weeks</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase">
                      <span>Less</span>
                      <span className="w-3.5 h-3.5 bg-gray-50 border border-gray-150 rounded" />
                      <span className="w-3.5 h-3.5 bg-indigo-100 border border-indigo-200 rounded" />
                      <span className="w-3.5 h-3.5 bg-indigo-300 border border-indigo-400 rounded" />
                      <span className="w-3.5 h-3.5 bg-indigo-600 border border-indigo-700 rounded" />
                      <span>More</span>
                    </div>
                  </div>

                  {/* Grid blocks representation */}
                  <div className="overflow-x-auto pt-2">
                    <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[620px]">
                      {Array.from({ length: 119 }).map((_, idx) => {
                        // Generate color intensities based on simple mock logic
                        let colorClass = "bg-gray-50 border-gray-150";
                        const weights = [0, 0, 1, 1, 2, 2, 3, 3, 3];
                        const intensity = weights[idx % weights.length];

                        if (intensity === 1) colorClass = "bg-indigo-100/70 border-indigo-200/40";
                        if (intensity === 2) colorClass = "bg-indigo-300/80 border-indigo-400/30";
                        if (intensity === 3) colorClass = "bg-indigo-600 border-indigo-700/20";

                        return (
                          <div
                            key={idx}
                            className={`w-3.5 h-3.5 rounded-sm border ${colorClass} hover:scale-110 hover:shadow-xs transition-transform cursor-crosshair`}
                            title={`Session details for day ${idx + 1}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ----------------- AI INSIGHTS TAB ----------------- */}
            {activeTab === "ai" && (
              <div className="space-y-6">

                {/* Score & predictions parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Learning Score card */}
                  <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs text-center space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase">AI Learning Score</p>
                    <h3 className="text-4xl font-black text-indigo-600">84.5 <span className="text-xs text-gray-400 font-bold">/ 100</span></h3>
                    <p className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-xl inline-block">Highly Progressive</p>
                  </div>

                  {/* Predicted Rank */}
                  <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs text-center space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase">Predicted Rank</p>
                    <h3 className="text-4xl font-black text-purple-600">Top 1.2%</h3>
                    <p className="text-[11px] text-gray-500 font-semibold bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-xl inline-block">Estimated percentile</p>
                  </div>

                  {/* Readiness Indicator */}
                  <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs text-center space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase">Exam Readiness</p>
                    <h3 className="text-4xl font-black text-emerald-600">76%</h3>
                    <p className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-xl inline-block">Ready for mock test</p>
                  </div>

                </div>

                {/* Focus topic summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-3">
                    <h4 className="text-xs font-black text-gray-950 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Strong Syllabus Topics
                    </h4>
                    <ul className="space-y-2 text-xs font-semibold text-gray-600">
                      <li className="flex justify-between">
                        <span>Binary Search Trees</span>
                        <span className="text-emerald-600 font-bold">95% Accuracy</span>
                      </li>
                      <li className="flex justify-between">
                        <span>TCP Protocol handshakes</span>
                        <span className="text-emerald-600 font-bold">91% Accuracy</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Relational Algebra</span>
                        <span className="text-emerald-600 font-bold">88% Accuracy</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-3">
                    <h4 className="text-xs font-black text-gray-950 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Weakness Points (Priority Fix)
                    </h4>
                    <ul className="space-y-2 text-xs font-semibold text-gray-600">
                      <li className="flex justify-between">
                        <span>Thread Scheduling & Deadlocks</span>
                        <span className="text-rose-600 font-bold">62% Accuracy</span>
                      </li>
                      <li className="flex justify-between">
                        <span>B+ Tree Index splits</span>
                        <span className="text-rose-600 font-bold">65% Accuracy</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Dijkstra Shortest Path</span>
                        <span className="text-rose-600 font-bold">68% Accuracy</span>
                      </li>
                    </ul>
                  </div>

                </div>

                {/* AI Interactive Panel */}
                <div className="bg-white border border-indigo-100/60 rounded-3xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Interact with AI Exam Mentor</h4>
                  </div>

                  {/* Suggested Quick Triggers */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAskAI("motivation")}
                      className="bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all"
                    >
                      ðŸ’¡ Request motivation coach
                    </button>
                    <button
                      onClick={() => handleAskAI("revision")}
                      className="bg-purple-50/60 hover:bg-purple-50 border border-purple-100 text-purple-600 font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all"
                    >
                      âš¡ Make revision notes (Mutex vs Semaphore)
                    </button>
                  </div>

                  {/* Ask Prompt Box */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask the AI about your weaknesses, study schedule or attempt strategy..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="flex-1 border border-gray-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 font-semibold"
                    />
                    <button
                      onClick={() => handleAskAI("ask")}
                      disabled={isGeneratingAi}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shrink-0"
                    >
                      {isGeneratingAi ? "Thinking..." : "Query AI"}
                    </button>
                  </div>

                  {/* Response display */}
                  <AnimatePresence>
                    {aiResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-indigo-50/40 border border-indigo-100/40 p-4.5 rounded-2xl text-xs text-gray-700 leading-relaxed font-semibold relative"
                      >
                        <p>{aiResponse}</p>
                        <button
                          onClick={() => setAiResponse(null)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-[10px] font-bold"
                        >
                          Clear
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            )}

            {/* ----------------- ACTIVITY TAB ----------------- */}
            {activeTab === "activity" && (
              <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-6">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Chronological Progress Feed</h4>
                  <span className="text-[10px] text-gray-400 font-bold">Last 3 days</span>
                </div>

                <div className="relative border-l border-gray-100 pl-6 ml-3 space-y-6">
                  {recentTimeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[35px] top-1 w-7 h-7 rounded-full flex items-center justify-center border border-white shadow-xs ${item.color}`}>
                        {item.icon}
                      </span>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-black text-gray-900">{item.title}</h5>
                          <span className="text-[10px] text-gray-400 font-semibold">{item.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------- ACHIEVEMENTS TAB ----------------- */}
            {activeTab === "achievements" && (
              <div className="space-y-6">

                {/* Badges Grid */}
                <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3">Unlocked Achievements & Badges</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((ach) => (
                      <div
                        key={ach.title}
                        className={`p-4.5 rounded-2xl border flex items-center gap-4 transition-all ${ach.unlocked ? "bg-white border-indigo-100 shadow-2xs hover:shadow-xs" : "bg-gray-50/50 border-gray-100 opacity-50"}`}
                      >
                        <span className="p-2 bg-gray-50 rounded-xl flex items-center justify-center">
                          {(() => {
                            const Icon = (LucideIcons as any)[ach.icon] || LucideIcons.Award;
                            return <Icon className="w-6 h-6 text-indigo-650" />;
                          })()}
                        </span>
                        <div>
                          <h5 className="text-xs font-black text-gray-955">{ach.title}</h5>
                          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{ach.desc}</p>
                          {ach.unlocked ? (
                            <span className="text-[9px] font-bold text-emerald-600 mt-2 block">Unlocked</span>
                          ) : (
                            <span className="text-[9px] font-bold text-gray-400 mt-2 block">Locked</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificates emulation card */}
                <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Earned Credentials & Certificates</h4>

                  <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <GraduationCap className="w-8 h-8 text-indigo-600 mt-1" />
                      <div>
                        <h5 className="text-xs font-black text-gray-900">Certificate of Completion: Algorithms (Advanced Part II)</h5>
                        <p className="text-[11px] text-gray-500 font-semibold mt-1">Verified ID: EF-ALG-829381 â€¢ Issued by ExamForge AI Engine</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toast("Downloading Certificate PDF...", "info")}
                      className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-black px-4.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs shrink-0"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* ----------------- BOOKMARKS TAB ----------------- */}
            {activeTab === "bookmarks" && (
              <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Saved Resources</h4>
                  <span className="text-[10px] text-gray-400 font-bold">{bookmarks.length} Bookmarks</span>
                </div>

                <div className="space-y-3">
                  {bookmarks.map((b) => (
                    <div key={b.id} className="p-4 border border-gray-100 hover:border-indigo-100 rounded-2xl flex items-start justify-between transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-50 border border-indigo-100/50 text-indigo-600 font-bold text-[9px] px-2 py-0.5 rounded-lg">
                            {b.type}
                          </span>
                          <span className="text-gray-400 text-[10px] font-bold">{b.tag}</span>
                        </div>
                        <h5 className="text-xs font-black text-gray-900">{b.title}</h5>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 font-medium">{b.date}</span>
                        <button
                          onClick={() => toast("Removed bookmark", "info")}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------- SETTINGS & EDIT TAB ----------------- */}
            {activeTab === "settings" && (
              <div className="space-y-6">

                {/* Interactive profile edit form */}
                <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                      {isEditing ? "Modify Personal Credentials" : "Personal Information"}
                    </h4>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-indigo-600 font-black flex items-center gap-1 hover:text-indigo-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Form
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveForm} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Full Name</label>
                        <input
                          type="text"
                          required
                          disabled={!isEditing}
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                          className="w-full border border-gray-200 disabled:bg-gray-50 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Email Address</label>
                        <input
                          type="email"
                          required
                          disabled={!isEditing}
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full border border-gray-200 disabled:bg-gray-50 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Phone Number</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full border border-gray-200 disabled:bg-gray-50 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Target Exam</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={profile.targetExam}
                          onChange={(e) => setProfile({ ...profile, targetExam: e.target.value })}
                          className="w-full border border-gray-200 disabled:bg-gray-50 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Personal Biography</label>
                      <textarea
                        disabled={!isEditing}
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={3}
                        className="w-full border border-gray-200 disabled:bg-gray-50 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                      />
                    </div>

                    {isEditing && (
                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProfile(DEFAULT_PROFILE);
                            setIsEditing(false);
                          }}
                          className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-black py-2.5 px-5 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2.5 px-6 rounded-xl shadow-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {/* Simulated notifications toggles */}
                <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3">Notification Preferences</h4>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-gray-800">Email Updates</p>
                        <p className="text-[10px] text-gray-400 font-medium">Receive weekly study summaries and goal tips</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.notificationSettings.email}
                        onChange={(e) => setProfile({
                          ...profile,
                          notificationSettings: { ...profile.notificationSettings, email: e.target.checked }
                        })}
                        className="w-4 h-4 accent-indigo-600"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer pt-2.5 border-t border-gray-50">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-gray-800">AI Reminder Alerts</p>
                        <p className="text-[10px] text-gray-400 font-medium">Let the AI coach prompt you based on consistency risk</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.notificationSettings.aiReminders}
                        onChange={(e) => setProfile({
                          ...profile,
                          notificationSettings: { ...profile.notificationSettings, aiReminders: e.target.checked }
                        })}
                        className="w-4 h-4 accent-indigo-600"
                      />
                    </label>
                  </div>
                </div>

                {/* Simulated language / Theme selections */}
                <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3">Platform Customization</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Preferred Language</label>
                      <select
                        value={settingsLanguage}
                        onChange={(e) => setSettingsLanguage(e.target.value)}
                        className="w-full border border-gray-200 px-4 py-2.5 rounded-xl bg-gray-50 cursor-not-allowed"
                        disabled
                      >
                        <option>English</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Theme Preference</label>
                      <select
                        value={settingsTheme}
                        onChange={(e) => {
                          setSettingsTheme(e.target.value);
                          toast(`Emulated theme set to ${e.target.value}!`, "success");
                        }}
                        className="w-full border border-gray-200 px-4 py-2.5 rounded-xl"
                      >
                        <option value="light">Premium Light</option>
                        <option value="dark">Dark Theme (Preview)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dangerous settings mock */}
                <div className="bg-white border border-red-150 p-6 rounded-3xl shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4.5 h-4.5" /> Danger Zone
                  </h4>
                  <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                    Permanently delete your ExamForge student account. All statistics, verified achievements, and notes summaries will be deleted. This operation is irreversible.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const confirm = window.confirm("Are you absolutely sure you want to delete your ExamForge account?");
                      if (confirm) toast("Simulated Account Delete Action", "error");
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-black py-2.5 px-4.5 rounded-xl transition-all"
                  >
                    Delete Account
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <GoalEngineProvider>
      <DashboardLayout activeTab="profile">
        <ProfileContent />
      </DashboardLayout>
    </GoalEngineProvider>
  );
}

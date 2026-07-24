"use client";

import React, { useState, useEffect } from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { useAuth } from "@/lib/auth-context";
import { GoalData, SubjectWeakness } from "@/types/goal.types";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";

const {
  Compass, User, Calendar, Watch, CheckSquare, Brain,
  Sparkles, Undo2, Redo2, ChevronLeft, ChevronRight, X, ChevronDown,
  Clock, AlertTriangle, Monitor, Wifi, BookOpen, Layers, Upload,
  Coffee, Trophy, Star, Flame, CalendarDays, Zap
} = LucideIcons;

// Standard UPSC and other target exams
const PRESET_EXAMS = [
  { name: "UPSC CSE", category: "Civil Services", color: "from-amber-500 to-orange-600", icon: "FileText", glow: "rgba(245, 158, 11, 0.1)" },
  { name: "State PSC", category: "Civil Services", color: "from-orange-500 to-red-600", icon: "Building", glow: "rgba(239, 68, 68, 0.1)" },
  { name: "JEE Advanced", category: "Engineering", color: "from-blue-500 to-indigo-600", icon: "Atom", glow: "rgba(79, 70, 229, 0.1)" },
  { name: "NEET UG", category: "Medical", color: "from-emerald-500 to-teal-600", icon: "Activity", glow: "rgba(16, 185, 129, 0.1)" },
  { name: "CAT", category: "Management", color: "from-pink-500 to-rose-600", icon: "TrendingUp", glow: "rgba(244, 63, 94, 0.1)" },
  { name: "GATE", category: "Engineering", color: "from-purple-500 to-violet-600", icon: "Settings", glow: "rgba(139, 92, 246, 0.1)" },
  { name: "SSC CGL", category: "Government", color: "from-cyan-500 to-blue-600", icon: "Briefcase", glow: "rgba(6, 182, 212, 0.1)" },
  { name: "Banking PO", category: "Government", color: "from-sky-500 to-indigo-600", icon: "Landmark", glow: "rgba(14, 165, 233, 0.1)" },
];

const PRESET_SUBJECTS: Record<string, string[]> = {
  "UPSC CSE": ["Indian Polity", "History & Culture", "Geography", "Indian Economy", "Environment & Ecology", "Science & Tech", "CSAT & Logic"],
  "State PSC": ["State History", "Polity & Governance", "Geography", "Economy & Development", "General Mental Ability"],
  "JEE Advanced": ["Physics", "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Mathematics"],
  "NEET UG": ["Biology (Botany)", "Biology (Zoology)", "Physics", "Chemistry"],
  "CAT": ["Quantitative Aptitude", "Data Interpretation", "Logical Reasoning", "Verbal Ability & RC"],
  "GATE": ["Engineering Mathematics", "General Aptitude", "Core Technical Subject 1", "Core Technical Subject 2"],
  "SSC CGL": ["Quantitative Aptitude", "General Intelligence & Reasoning", "English Language", "General Awareness"],
  "Banking PO": ["Quantitative Aptitude", "Reasoning Ability", "English Language", "General Financial Awareness"],
  "default": ["General Knowledge", "Analytical Reasoning", "Quantitative Ability", "Verbal Ability"]
};

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe"
];

const STEP_HEADERS = [
  { id: 1, label: "Target" },
  { id: 2, label: "Profile" },
  { id: 3, label: "Timeline" },
  { id: 4, label: "Lifestyle" },
  { id: 5, label: "Focus" },
  { id: 6, label: "Weakness" },
  { id: 7, label: "Projections" }
];

interface AnimatedWizardProps {
  onClose?: () => void;
  isEditMode?: boolean;
}

function CustomSelect({
  value,
  onChange,
  options,
  label,
  focusClass = "focus:border-indigo-500 focus:ring-indigo-500/10",
  activeClass = "bg-indigo-50/60 text-indigo-650"
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  label: string;
  focusClass?: string;
  activeClass?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex flex-col gap-1.5 w-full text-left">
      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full bg-white border border-slate-200/80 text-slate-800 text-xs rounded-xl px-4 py-3 outline-none transition-all font-semibold flex items-center justify-between cursor-pointer focus:ring-4 ${focusClass}`}
      >
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-1.5 w-full bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-xl p-2.5 z-50 space-y-1 max-h-[160px] overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full p-2 px-3 text-xs font-bold rounded-xl text-left hover:bg-slate-50 transition-colors cursor-pointer ${value === opt ? activeClass : "text-slate-655"
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

export function AnimatedWizard({ onClose, isEditMode = false }: AnimatedWizardProps) {
  const { user } = useAuth();
  const {
    wizardState,
    updateWizardDraft,
    nextStep,
    prevStep,
    goToStep,
    undoWizardDraft,
    redoWizardDraft,
    completeWizard,
  } = useGoalEngine();

  const { currentStep, draft, undoStack, redoStack } = wizardState;
  const [customExam, setCustomExam] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customSubjectName, setCustomSubjectName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Custom states for loading animation (AI Thinking Screen)
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [celebrationGoal, setCelebrationGoal] = useState<GoalData | null>(null);

  // Initialize draft with fallback names on start
  useEffect(() => {
    if (!draft.profile?.fullName && user?.name) {
      updateWizardDraft({
        profile: {
          fullName: user.name,
          avatar: AVATAR_OPTIONS[0],
          education: "Bachelor of Arts",
          stream: "Arts & Humanities",
          city: "Delhi",
          occupation: "Student",
          age: 21,
          gender: "Male",
          syllabusPercent: 20,
          currentConfidence: 3,
        },
        timeline: {
          examDate: "2026-10-04",
          dailyStudyHours: 8,
          burnoutRisk: "Low",
          difficulty: "Medium",
          successPrediction: 65,
          remainingDays: 90
        },
        lifestyle: {
          slots: ["Morning", "Afternoon"],
          dailyHours: 8,
          preferredDevice: "Laptop & Tablet",
          learningEnvironment: "Home Study Room",
          internetAvailability: "High-speed Wi-Fi",
          consistency: ["Everyday"]
        },
        preferences: [],
        weaknesses: [],
        targetExam: "UPSC CSE",
        examCategory: "Civil Services",
        summary: "",
        isPinned: true,
        isArchived: false,
        isFavorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }, [user]);

  // Recalculate remaining days and predictions when timeline metrics change
  useEffect(() => {
    if (draft.timeline?.examDate) {
      const examDateObj = new Date(draft.timeline.examDate);
      const today = new Date();
      const diffTime = examDateObj.getTime() - today.getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      const hours = draft.timeline.dailyStudyHours || 8;
      const risk = hours > 12 ? "High" : hours >= 9 ? "Moderate" : "Low";

      // Basic mock formula to forecast prediction
      const confidence = draft.profile?.currentConfidence || 3;
      const syllabus = draft.profile?.syllabusPercent || 20;
      const calcPrediction = Math.min(
        98,
        Math.max(
          10,
          Math.floor((syllabus * 0.4) + (confidence * 10) + (hours * 2) + (diffDays > 120 ? 10 : 0))
        )
      );

      const computedDiff = diffDays > 180 ? "Medium" : diffDays > 60 ? "Hard" : "Extreme";

      // Prevent infinite loop by checking difference
      if (
        draft.timeline.remainingDays !== diffDays ||
        draft.timeline.burnoutRisk !== risk ||
        draft.timeline.successPrediction !== calcPrediction ||
        draft.timeline.difficulty !== computedDiff
      ) {
        updateWizardDraft({
          timeline: {
            ...draft.timeline,
            remainingDays: diffDays,
            burnoutRisk: risk,
            successPrediction: calcPrediction,
            difficulty: computedDiff
          }
        });
      }
    }
  }, [draft.timeline?.examDate, draft.timeline?.dailyStudyHours, draft.profile?.syllabusPercent, draft.profile?.currentConfidence]);

  // Handle preset subject generation on exam change
  const handleSelectExam = (exam: string, category: string) => {
    if (draft.targetExam === exam) {
      updateWizardDraft({
        targetExam: "",
        examCategory: "",
        weaknesses: []
      });
      return;
    }

    const defaultSubjects = PRESET_SUBJECTS[exam] || PRESET_SUBJECTS["default"];
    const weaknesses: SubjectWeakness[] = defaultSubjects.map(sub => ({
      subject: sub,
      confidence: 3,
      difficulty: "Medium",
      weaknessScore: 50,
      priority: "Medium",
      aiRecommendation: `Incorporate active practice on ${sub} once a week.`
    }));

    updateWizardDraft({
      targetExam: exam,
      examCategory: category,
      weaknesses
    });
  };

  // Step Validations
  const validateStep = (): boolean => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      let finalExam = draft.targetExam;
      if (!finalExam && customExam.trim()) {
        const examName = customExam.trim();
        if (examName.length < 2) {
          stepErrors.targetExam = "Custom exam name must be at least 2 characters.";
        } else if (examName.length > 50) {
          stepErrors.targetExam = "Custom exam name must not exceed 50 characters.";
        } else {
          const categoryName = customCategory.trim() || "Custom Exam";
          handleSelectExam(examName, categoryName);
          setCustomExam("");
          setCustomCategory("");
          finalExam = examName;
        }
      } else if (!finalExam) {
        stepErrors.targetExam = "Please select a target exam or type a custom one to proceed.";
      }
    }

    if (currentStep === 2) {
      if (!draft.profile?.fullName?.trim()) {
        stepErrors.fullName = "Name is required.";
      }
      if (!draft.profile?.age || draft.profile.age < 16 || draft.profile.age > 40) {
        stepErrors.age = "Student age must be between 16 and 40.";
      }
      if (!draft.profile?.city?.trim()) {
        stepErrors.city = "City location is required.";
      }
    }

    if (currentStep === 3) {
      if (!draft.timeline?.examDate) {
        stepErrors.examDate = "Exam date is required.";
      } else {
        const selected = new Date(draft.timeline.examDate);
        if (selected <= new Date()) {
          stepErrors.examDate = "Exam date must be in the future.";
        }
      }
      if (draft.timeline?.dailyStudyHours && (draft.timeline.dailyStudyHours < 1 || draft.timeline.dailyStudyHours > 15)) {
        stepErrors.dailyStudyHours = "Daily study hours must be between 1 and 15 hours.";
      }
    }

    if (currentStep === 4) {
      if (!draft.lifestyle?.slots || draft.lifestyle.slots.length === 0) {
        stepErrors.slots = "Please select at least one preferred study slot.";
      }
      if (!draft.lifestyle?.consistency || draft.lifestyle.consistency.length === 0) {
        stepErrors.consistency = "Please select at least one consistency commit option.";
      }
    }

    if (currentStep === 5) {
      const validOptions = [
        "Video lectures", "Reading books", "Practice Questions", "PYQs (Previous Years)",
        "Mock Tests", "Flashcards", "Mind Maps", "AI Tutor sessions", "Revision Notes",
        "Discussion Forums", "Live Classes"
      ];
      const selectedValid = draft.preferences?.filter(p => validOptions.includes(p)) || [];
      if (selectedValid.length === 0) {
        stepErrors.preferences = "Please choose at least one active study preference.";
      }
    }

    if (currentStep === 6) {
      if (!draft.weaknesses || draft.weaknesses.length === 0) {
        stepErrors.weaknesses = "Please configure at least one subject weakness sprint.";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < 7) {
        nextStep();
      } else {
        triggerThinkingScreen();
      }
    }
  };

  // Simulated AI Calibration Thinking Screen
  const triggerThinkingScreen = () => {
    setIsThinking(true);
    let stepCount = 0;
    const interval = setInterval(() => {
      stepCount++;
      setThinkingStep(stepCount);
      if (stepCount >= 7) {
        clearInterval(interval);
        setTimeout(() => {
          // Compile summary descriptive string
          const finalSummary = `AI success model calibrated for ${draft.profile?.fullName || user?.name || "Student"} preparing for ${draft.targetExam}. Target date ${draft.timeline?.examDate} (${draft.timeline?.remainingDays} remaining days) with a success prediction score of ${draft.timeline?.successPrediction}%. Weak subjects have been prioritized with custom active study loops.`;

          const finishedGoal: GoalData = {
            id: draft.id || `goal_${Date.now()}`,
            targetExam: draft.targetExam || "UPSC CSE",
            examCategory: draft.examCategory || "Civil Services",
            profile: {
              fullName: draft.profile?.fullName || user?.name || "Success Student",
              avatar: draft.profile?.avatar || AVATAR_OPTIONS[0],
              education: draft.profile?.education || "Graduate",
              stream: draft.profile?.stream || "Commerce",
              city: draft.profile?.city || "New Delhi",
              occupation: draft.profile?.occupation || "Aspirant",
              age: draft.profile?.age || 22,
              gender: draft.profile?.gender || "Male",
              syllabusPercent: draft.profile?.syllabusPercent || 20,
              currentConfidence: draft.profile?.currentConfidence || 3,
            },
            timeline: {
              examDate: draft.timeline?.examDate || "2026-10-04",
              dailyStudyHours: draft.timeline?.dailyStudyHours || 8,
              burnoutRisk: draft.timeline?.burnoutRisk || "Low",
              difficulty: draft.timeline?.difficulty || "Medium",
              successPrediction: draft.timeline?.successPrediction || 65,
              remainingDays: draft.timeline?.remainingDays || 90,
            },
            lifestyle: {
              slots: draft.lifestyle?.slots || ["Morning", "Night"],
              dailyHours: draft.timeline?.dailyStudyHours || 8,
              preferredDevice: draft.lifestyle?.preferredDevice || "Tablet",
              learningEnvironment: draft.lifestyle?.learningEnvironment || "Home Library",
              internetAvailability: draft.lifestyle?.internetAvailability || "Full Access",
              consistency: draft.lifestyle?.consistency || ["Daily"],
            },
            preferences: draft.preferences || ["PYQs", "Mock Tests"],
            weaknesses: draft.weaknesses || [],
            summary: finalSummary,
            isPinned: true,
            isArchived: false,
            isFavorite: true,
            createdAt: draft.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          setCelebrationGoal(finishedGoal);
          setIsThinking(false);
          setIsCelebrating(true);
        }, 1000);
      }
    }, 600);
  };

  // Weakness updates
  const handleWeaknessConfidenceChange = (index: number, val: number) => {
    if (!draft.weaknesses) return;
    const items = [...draft.weaknesses];
    const item = { ...items[index] };
    item.confidence = val;
    // Calculate weakness score: lower confidence, harder difficulty -> higher weakness score
    const diffMultiplier = item.difficulty === "Hard" ? 1.5 : item.difficulty === "Medium" ? 1.0 : 0.6;
    item.weaknessScore = Math.min(100, Math.round(((6 - val) * 20) * diffMultiplier));
    item.priority = item.weaknessScore > 65 ? "High" : item.weaknessScore > 40 ? "Medium" : "Low";

    // Add custom rule recomendations
    if (item.weaknessScore > 65) {
      item.aiRecommendation = `Flagged for intensive revisions. Dedicate 2+ hours daily.`;
    } else {
      item.aiRecommendation = `Standard study preference cycle and flashcard checks.`;
    }

    items[index] = item;
    updateWizardDraft({ weaknesses: items });
  };

  const handleWeaknessDifficultyChange = (index: number, diff: "Easy" | "Medium" | "Hard") => {
    if (!draft.weaknesses) return;
    const items = [...draft.weaknesses];
    const item = { ...items[index] };
    item.difficulty = diff;
    const diffMultiplier = diff === "Hard" ? 1.5 : diff === "Medium" ? 1.0 : 0.6;
    item.weaknessScore = Math.min(100, Math.round(((6 - item.confidence) * 20) * diffMultiplier));
    item.priority = item.weaknessScore > 65 ? "High" : item.weaknessScore > 40 ? "Medium" : "Low";
    items[index] = item;
    updateWizardDraft({ weaknesses: items });
  };

  const handleAddCustomSubject = () => {
    if (!customSubjectName.trim()) return;
    const newWeakness: SubjectWeakness = {
      subject: customSubjectName.trim(),
      confidence: 3,
      difficulty: "Medium",
      weaknessScore: 50,
      priority: "Medium",
      aiRecommendation: "Added custom focus slot in planner."
    };
    updateWizardDraft({
      weaknesses: [...(draft.weaknesses || []), newWeakness]
    });
    setCustomSubjectName("");
  };

  const handleRemoveSubject = (idx: number) => {
    if (!draft.weaknesses) return;
    const items = draft.weaknesses.filter((_, i) => i !== idx);
    updateWizardDraft({ weaknesses: items });
  };

  // Step Header Details
  const stepMeta = [
    { num: 1, title: "Target Exam", icon: Compass, desc: "What goal or exam are you pursuing?" },
    { num: 2, title: "Your Profile", icon: User, desc: "Tell us a bit about your preparation background" },
    { num: 3, title: "Timeline Calc", icon: Calendar, desc: "Set target date and daily hours" },
    { num: 4, title: "Study Lifestyle", icon: Coffee, desc: "Tailor learning environment & schedule" },
    { num: 5, title: "Learning Modes", icon: CheckSquare, desc: "Select preferred studying tools" },
    { num: 6, title: "Gap Analysis", icon: Brain, desc: "Audit and map syllabus confidence gaps" },
    { num: 7, title: "AI Blueprint Summary", icon: Trophy, desc: "Review and calibrate your Success Engine" }
  ];

  const currentMeta = stepMeta[currentStep - 1];
  const StepIcon = currentMeta.icon;

  if (isThinking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xl">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg p-8 rounded-[32px] bg-white border border-slate-200/50 shadow-2xl text-center flex flex-col items-center relative overflow-hidden"
        >
          {/* Subtle floating background colors inside loader */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
            <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
          </div>

          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-dashed border-indigo-600/35"
            />
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shadow-md shadow-indigo-600/5"
            >
              <Sparkles className="w-6.5 h-6.5 text-indigo-600" />
            </motion.div>
          </div>

          <h2 className="text-2xl font-black mb-1 text-slate-900">Calibrating Success Engine</h2>
          <p className="text-slate-500 mb-8 text-xs font-semibold">Building personalized roadmap blueprints...</p>

          <div className="w-full space-y-3.5 max-w-sm">
            {[
              "Mapping Selected Exam Architecture",
              "Synthesizing Timeline Math & Study Balance",
              "Profiling Subject Gaps & Priority Weights",
              "Injecting Active Learning Strategy Preferences",
              "Engineering Rule Engine Daily Planner Matrix",
              "Formulating Success Prediction Metrics",
              "Launching Success Dashboard Engine"
            ].map((text, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{
                  opacity: thinkingStep > idx ? 0.95 : thinkingStep === idx ? 1 : 0.3,
                  x: thinkingStep === idx ? 4 : 0,
                  scale: thinkingStep === idx ? 1.015 : 1
                }}
                transition={{ duration: 0.3 }}
                className="flex items-center text-left text-xs gap-3"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-all duration-300 ${
                  thinkingStep > idx
                    ? "bg-emerald-500 text-white shadow-sm"
                    : thinkingStep === idx
                      ? "bg-indigo-600 text-white shadow-md scale-105"
                      : "bg-slate-100 text-slate-400 border border-slate-200/50"
                }`}>
                  {thinkingStep > idx ? (
                    <LucideIcons.Check className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className={`font-bold transition-all duration-300 ${
                  thinkingStep === idx ? "text-indigo-600 font-extrabold" : thinkingStep > idx ? "text-slate-800" : "text-slate-400"
                }`}>
                  {text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }
  if (isCelebrating && celebrationGoal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg p-8 rounded-[32px] bg-white border border-slate-200/50 shadow-2xl text-center flex flex-col items-center relative overflow-hidden"
        >
          {/* Animated sparkles/particles backgrounds */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] bg-emerald-400/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[80px]" />
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
            className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 relative"
          >
            <Trophy className="w-11 h-11 text-white" />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -inset-2 rounded-full border border-orange-400/50 -z-10"
            />
          </motion.div>

          <h2 className="text-2xl font-black mb-2 bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
            Success Engine Calibrated!
          </h2>
          <p className="text-slate-500 text-xs font-semibold max-w-sm mb-6 leading-relaxed">
            Your customized roadmap blueprint has been generated. Ready to target your exam milestones.
          </p>

          {/* Metric Details Panel */}
          <div className="grid grid-cols-2 gap-3.5 w-full mb-8">
            <div className="p-4 rounded-2xl border border-indigo-50 bg-indigo-50/20 text-left">
              <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Target Goal</span>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">{celebrationGoal.targetExam}</p>
            </div>
            <div className="p-4 rounded-2xl border border-emerald-50 bg-emerald-50/20 text-left">
              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Success Score</span>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">{celebrationGoal.timeline.successPrediction}%</p>
            </div>
            <div className="p-4 rounded-2xl border border-amber-50 bg-amber-50/20 text-left">
              <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Commitment</span>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">{celebrationGoal.timeline.dailyStudyHours} hrs / day</p>
            </div>
            <div className="p-4 rounded-2xl border border-rose-50 bg-rose-50/20 text-left">
              <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Time Remaining</span>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">{celebrationGoal.timeline.remainingDays} Days</p>
            </div>
          </div>

          {/* Enter Button */}
          <button
            type="button"
            onClick={() => {
              completeWizard(celebrationGoal, isEditMode ? "Calibrated and Edited success profile params" : "Configured initial Success engine blueprint");
              setIsCelebrating(false);
              if (onClose) onClose();
            }}
            className="w-full py-4 bg-gradient-to-r from-indigo-650 to-[#6D4AFF] hover:from-[#6D4AFF] hover:to-indigo-650 text-white text-xs font-black rounded-2xl cursor-pointer shadow-lg shadow-indigo-600/10 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
          >
            <span>Enter Study Workspace</span>
            <LucideIcons.ArrowRight className="w-4.5 h-4.5 text-white" />
          </button>
        </motion.div>
      </div>
    );
  }

  const STEP_COLORS: Record<number, { glowLeft: string; glowRight: string; shadow: string; gradient: string; glowBtn: string }> = {
    1: { glowLeft: "bg-[#6D4AFF]/12", glowRight: "bg-[#A855F7]/12", shadow: "shadow-[0_24px_85px_rgba(109,74,255,0.18)]", gradient: "from-[#6D4AFF] to-[#A855F7]", glowBtn: "rgba(109,74,255,0.3)" },
    2: { glowLeft: "bg-[#10B981]/12", glowRight: "bg-[#14B8A6]/12", shadow: "shadow-[0_24px_85px_rgba(16,185,129,0.15)]", gradient: "from-[#10B981] to-[#14B8A6]", glowBtn: "rgba(16,185,129,0.3)" },
    3: { glowLeft: "bg-[#F59E0B]/12", glowRight: "bg-[#F97316]/12", shadow: "shadow-[0_24px_85px_rgba(245,158,11,0.15)]", gradient: "from-[#F59E0B] to-[#F97316]", glowBtn: "rgba(245,158,11,0.3)" },
    4: { glowLeft: "bg-[#F43F5E]/12", glowRight: "bg-[#D946EF]/12", shadow: "shadow-[0_24px_85px_rgba(244,63,94,0.15)]", gradient: "from-[#F43F5E] to-[#D946EF]", glowBtn: "rgba(244,63,94,0.3)" },
    5: { glowLeft: "bg-[#0EA5E9]/12", glowRight: "bg-[#06B6D4]/12", shadow: "shadow-[0_24px_85px_rgba(14,165,233,0.15)]", gradient: "from-[#0EA5E9] to-[#06B6D4]", glowBtn: "rgba(14,165,233,0.3)" },
    6: { glowLeft: "bg-[#EF4444]/12", glowRight: "bg-[#F43F5E]/12", shadow: "shadow-[0_24px_85px_rgba(239,68,68,0.15)]", gradient: "from-[#EF4444] to-[#F43F5E]", glowBtn: "rgba(239,68,68,0.3)" },
    7: { glowLeft: "bg-[#EAB308]/15", glowRight: "bg-[#F59E0B]/15", shadow: "shadow-[0_24px_85px_rgba(234,179,8,0.2)]", gradient: "from-[#EAB308] to-[#F59E0B]", glowBtn: "rgba(234,179,8,0.4)" }
  };

  const theme = STEP_COLORS[currentStep] || STEP_COLORS[1];

  const stepStyles = {
    cardBg: currentStep === 1 ? "bg-indigo-50/30 border-indigo-200/40"
      : currentStep === 2 ? "bg-emerald-50/30 border-emerald-200/40"
        : currentStep === 3 ? "bg-amber-50/30 border-amber-200/40"
          : currentStep === 4 ? "bg-rose-50/30 border-rose-200/40"
            : currentStep === 5 ? "bg-sky-50/30 border-sky-200/40"
              : currentStep === 6 ? "bg-red-50/30 border-red-200/40"
                : "bg-yellow-50/30 border-yellow-250/40",

    badgeBg: currentStep === 1 ? "bg-indigo-100/60 text-indigo-750 border-indigo-200/40"
      : currentStep === 2 ? "bg-emerald-100/60 text-emerald-750 border-emerald-200/40"
        : currentStep === 3 ? "bg-amber-100/60 text-amber-750 border-amber-200/40"
          : currentStep === 4 ? "bg-rose-100/60 text-rose-750 border-rose-200/40"
            : currentStep === 5 ? "bg-sky-100/60 text-sky-750 border-sky-200/40"
              : currentStep === 6 ? "bg-red-100/60 text-red-750 border-red-200/40"
                : "bg-yellow-100/60 text-yellow-800 border-yellow-250/40",

    accentText: currentStep === 1 ? "text-indigo-650"
      : currentStep === 2 ? "text-emerald-700"
        : currentStep === 3 ? "text-amber-700"
          : currentStep === 4 ? "text-rose-700"
            : currentStep === 5 ? "text-sky-700"
              : currentStep === 6 ? "text-red-700"
                : "text-yellow-750",

    focusBorder: currentStep === 1 ? "focus:border-indigo-500 focus:ring-indigo-500/10"
      : currentStep === 2 ? "focus:border-emerald-500 focus:ring-emerald-500/10"
        : currentStep === 3 ? "focus:border-amber-500 focus:ring-amber-500/10"
          : currentStep === 4 ? "focus:border-rose-500 focus:ring-rose-500/10"
            : currentStep === 5 ? "focus:border-sky-500 focus:ring-sky-500/10"
              : currentStep === 6 ? "focus:border-red-500 focus:ring-red-500/10"
                : "focus:border-yellow-500 focus:ring-yellow-500/10",

    btnBg: currentStep === 1 ? "bg-indigo-600 hover:bg-indigo-750 text-white"
      : currentStep === 2 ? "bg-emerald-600 hover:bg-emerald-750 text-white"
        : currentStep === 3 ? "bg-amber-600 hover:bg-amber-750 text-white"
          : currentStep === 4 ? "bg-rose-600 hover:bg-rose-750 text-white"
            : currentStep === 5 ? "bg-sky-600 hover:bg-sky-750 text-white"
              : currentStep === 6 ? "bg-red-600 hover:bg-red-750 text-white"
                : "bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:brightness-105",

    activeSelectionCard: currentStep === 1 ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-[0_4px_20px_rgba(99,102,241,0.08)] scale-[1.01]"
      : currentStep === 2 ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-[0_4px_20px_rgba(16,185,129,0.08)] scale-[1.01]"
        : currentStep === 3 ? "border-amber-600 bg-amber-50/50 text-amber-900 shadow-[0_4px_20px_rgba(245,158,11,0.08)] scale-[1.01]"
          : currentStep === 4 ? "border-rose-600 bg-rose-50/50 text-rose-900 shadow-[0_4px_20px_rgba(244,63,94,0.08)] scale-[1.01]"
            : currentStep === 5 ? "border-sky-600 bg-sky-50/50 text-sky-900 shadow-[0_4px_20px_rgba(14,165,233,0.08)] scale-[1.01]"
              : currentStep === 6 ? "border-red-650 bg-red-50/50 text-red-900 shadow-[0_4px_20px_rgba(239,68,68,0.08)] scale-[1.01]"
                : "border-yellow-500 bg-yellow-50/50 text-yellow-955 shadow-[0_4px_20px_rgba(234,179,8,0.1)] scale-[1.01]"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 15 }}
        transition={{ type: "spring", damping: 30, stiffness: 250 }}
        className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[32px] bg-white/75 glass border border-white/30 overflow-hidden backdrop-blur-3xl transition-all duration-700 ${theme.shadow}`}
      >
        {/* Ambient background glows inside the modal with float motion */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <motion.div
            animate={{
              x: [-15, 15, -15],
              y: [-10, 20, -10],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute top-[-25%] left-[-15%] w-[400px] h-[400px] ${theme.glowLeft} rounded-full filter blur-[100px] transition-all duration-700`}
          />
          <motion.div
            animate={{
              x: [15, -15, 15],
              y: [15, -15, 15],
              scale: [1.08, 0.95, 1.08],
            }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute bottom-[-25%] right-[-15%] w-[400px] h-[400px] ${theme.glowRight} rounded-full filter blur-[100px] transition-all duration-700`}
          />
        </div>

        {/* Top Header Navigation */}
        <div className="p-6 border-b border-white/20 flex items-center justify-between bg-white/40 backdrop-blur-sm relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-[#6D4AFF] shadow-sm shrink-0">
              <StepIcon className="w-5.5 h-5.5 text-[#6D4AFF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider bg-white/90 px-2.5 py-0.5 rounded-full border border-slate-100 ${stepStyles.accentText}`}>
                  Step {currentStep} of 7
                </span>
                {isEditMode && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100/40">
                    Edit Mode
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-slate-800 tracking-tight">{currentMeta.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Undo/Redo Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              <button
                onClick={undoWizardDraft}
                disabled={undoStack.length === 0}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redoWizardDraft}
                disabled={redoStack.length === 0}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Step Indicator Badges Strip */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 bg-white/30 border-b border-white/20 text-[10px] font-black uppercase tracking-wider text-slate-400 relative z-10">
          {STEP_HEADERS.map((s) => {
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            const IconMap: Record<number, React.ComponentType<{ className?: string }>> = {
              1: LucideIcons.Compass,
              2: LucideIcons.User,
              3: LucideIcons.Calendar,
              4: LucideIcons.Coffee,
              5: LucideIcons.CheckSquare,
              6: LucideIcons.Brain,
              7: LucideIcons.Trophy
            };
            const StepIconComponent = IconMap[s.id];
            return (
              <div key={s.id} className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${isActive
                  ? `bg-gradient-to-r ${theme.gradient} border-white/10 text-white shadow-md scale-105`
                  : isCompleted
                    ? "bg-emerald-500 border-emerald-400 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                    : "bg-white/40 border-white/20 text-slate-500"
                  }`}>
                  {isCompleted ? <LucideIcons.Check className="w-4 h-4" /> : StepIconComponent ? <StepIconComponent className="w-4 h-4" /> : s.id}
                </span>
                <span className={isActive ? `${stepStyles.accentText} font-black tracking-wide` : isCompleted ? "text-emerald-600 font-bold" : "text-slate-500"}>
                  {s.label}
                </span>
                {s.id < 7 && <LucideIcons.ChevronRight className="w-4 h-4 text-slate-400/60 ml-1 shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Step Progress Bar with Glowing Line Effect */}
        <div className="w-full bg-white/25 h-1.5 relative z-10 border-b border-white/10">
          <motion.div
            className={`bg-gradient-to-r ${theme.gradient} h-full transition-all duration-500`}
            style={{ boxShadow: `0 0 15px ${theme.glowBtn}` }}
            initial={{ width: `${((currentStep - 1) / 7) * 100}%` }}
            animate={{ width: `${(currentStep / 7) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* STEP 1: Target Exam */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className={`flex flex-col gap-4 p-5 rounded-2xl border ${stepStyles.cardBg}`}>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Add custom Target Exam details</h4>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <label className="text-[9px] font-black text-slate-500 uppercase pl-1">Exam Name</label>
                        <input
                          type="text"
                          placeholder="e.g. GRE, TOEFL, IELTS..."
                          value={customExam}
                          onChange={(e) => setCustomExam(e.target.value)}
                          className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:bg-white font-semibold ${stepStyles.focusBorder}`}
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <label className="text-[9px] font-black text-slate-500 uppercase pl-1">Exam Category</label>
                        <input
                          type="text"
                          placeholder="e.g. Higher Studies, Lang Proficiency..."
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:bg-white font-semibold ${stepStyles.focusBorder}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (customExam.trim()) {
                            handleSelectExam(customExam.trim(), customCategory.trim() || "Custom Exam");
                            setCustomExam("");
                            setCustomCategory("");
                          }
                        }}
                        className={`text-xs font-black px-5 py-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center shrink-0 w-full md:w-auto ${stepStyles.btnBg}`}
                      >
                        Set Exam
                      </button>
                    </div>
                    {errors.targetExam && <p className="text-red-500 text-xs mt-1 pl-1">{errors.targetExam}</p>}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {PRESET_EXAMS.map((item) => {
                      const selected = draft.targetExam === item.name;
                      return (
                        <button
                          key={item.name}
                          onClick={() => handleSelectExam(item.name, item.category)}
                          className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all relative overflow-hidden group cursor-pointer ${selected
                              ? stepStyles.activeSelectionCard
                              : "border-slate-250/60 bg-white/40 hover:bg-slate-50/50 hover:scale-[1.01]"
                            }`}
                          style={{
                            boxShadow: selected ? `0 6px 20px ${item.glow}` : undefined
                          }}
                        >
                          <div className={`mb-2 p-2 rounded-xl w-10 h-10 flex items-center justify-center transition-colors ${selected ? "bg-white text-indigo-600 shadow-xs" : "bg-slate-50 text-slate-400 group-hover:bg-white"}`}>
                            {(() => {
                              const Icon = (LucideIcons as any)[item.icon] || LucideIcons.Award;
                              return <Icon className="w-5.5 h-5.5" />;
                            })()}
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{item.category}</p>
                            <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                          </div>
                          {selected && (
                            <div className="absolute right-3.5 top-3.5 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">✓</div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {draft.targetExam && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-5 rounded-2xl border flex items-center justify-between ${stepStyles.cardBg}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-xl shadow-xs">
                          <LucideIcons.Target className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Active Choice</p>
                          <p className="font-black text-slate-800 text-sm">{draft.targetExam} ({draft.examCategory})</p>
                        </div>
                      </div>
                      <span className="text-xs text-indigo-600 bg-white border border-indigo-100 px-3 py-1 rounded-full font-bold shadow-xs">Syllabus Matrix Populated</span>
                    </motion.div>
                  )}
                </div>
              )}
              {/* STEP 2: Prep Profile */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`md:col-span-1 flex flex-col items-center gap-4 p-6 rounded-3xl justify-center border ${stepStyles.cardBg}`}>
                      <div className="relative group shrink-0">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 blur-md opacity-40 group-hover:opacity-75 transition-opacity" />
                        <img
                          src={draft.profile?.avatar || AVATAR_OPTIONS[0]}
                          alt="Avatar"
                          className="relative w-24 h-24 rounded-full border-4 border-white object-cover bg-white shadow-md"
                        />
                      </div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-center">Aspirant Profile</label>

                      {/* File Uploader system */}
                      <label className={`flex items-center gap-1.5 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-md hover:-translate-y-0.5 ${stepStyles.btnBg}`}>
                        <Upload className="w-3.5 h-3.5" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                updateWizardDraft({
                                  profile: { ...draft.profile!, avatar: reader.result as string }
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>

                      {/* <div className="w-full border-t border-slate-200/60 my-2" /> */}
                      {/* <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Or Choose Preset</span> */}
                    </div>

                    <div className="md:col-span-2 space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-black text-slate-600 uppercase pl-1">Full Name</label>
                          <input
                            type="text"
                            value={draft.profile?.fullName || ""}
                            onChange={(e) => updateWizardDraft({
                              profile: { ...draft.profile!, fullName: e.target.value }
                            })}
                            className={`border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-semibold ${stepStyles.focusBorder}`}
                            placeholder="John Doe"
                          />
                          {errors.fullName && <p className="text-red-500 text-xs pl-1">{errors.fullName}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-black text-slate-600 uppercase pl-1">Age</label>
                          <input
                            type="number"
                            min="16"
                            max="40"
                            value={draft.profile?.age || 21}
                            onChange={(e) => updateWizardDraft({
                              profile: { ...draft.profile!, age: parseInt(e.target.value) || 21 }
                            })}
                            className={`border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-semibold ${stepStyles.focusBorder}`}
                          />
                          {errors.age && <p className="text-red-500 text-xs pl-1">{errors.age}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <CustomSelect
                          label="Education / Degree"
                          value={draft.profile?.education || "Bachelor of Arts"}
                          options={["Bachelor of Technology", "Bachelor of Science", "Bachelor of Arts", "Bachelor of Comerce", "Master of Business Admin", "High School", "Any Diploma", "Others"]}
                          onChange={(val) => updateWizardDraft({
                            profile: { ...draft.profile!, education: val }
                          })}
                          focusClass={stepStyles.focusBorder}
                          activeClass={stepStyles.badgeBg}
                        />

                        <CustomSelect
                          label="Stream"
                          value={draft.profile?.stream || "Arts & Humanities"}
                          options={["Science & Technology", "Arts & Humanities", "Commerce & Accounts", "Medical & Health"]}
                          onChange={(val) => updateWizardDraft({
                            profile: { ...draft.profile!, stream: val }
                          })}
                          focusClass={stepStyles.focusBorder}
                          activeClass={stepStyles.badgeBg}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-black text-slate-655 uppercase pl-1">Target Exam City</label>
                          <input
                            type="text"
                            value={draft.profile?.city || ""}
                            onChange={(e) => updateWizardDraft({
                              profile: { ...draft.profile!, city: e.target.value }
                            })}
                            className={`border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-semibold ${stepStyles.focusBorder}`}
                            placeholder="e.g. Delhi, Mumbai"
                          />
                          {errors.city && <p className="text-red-500 text-xs pl-1">{errors.city}</p>}
                        </div>

                        <CustomSelect
                          label="Occupation"
                          value={draft.profile?.occupation || "Full-time Aspirant"}
                          options={["Full-time Aspirant", "Working Professional", "College Student"]}
                          onChange={(val) => updateWizardDraft({
                            profile: { ...draft.profile!, occupation: val }
                          })}
                          focusClass={stepStyles.focusBorder}
                          activeClass={stepStyles.badgeBg}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Confidence and syllabus coverage */}
                  <div className={`p-6 rounded-3xl border grid grid-cols-1 md:grid-cols-2 gap-6 ${stepStyles.cardBg}`}>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between pl-1">
                        <label className={`text-xs font-extrabold uppercase ${stepStyles.accentText}`}>Syllabus Covered (%): {draft.profile?.syllabusPercent || 0}%</label>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={draft.profile?.syllabusPercent || 0}
                          onChange={(e) => updateWizardDraft({
                            profile: { ...draft.profile!, syllabusPercent: parseInt(e.target.value) }
                          })}
                          className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between pl-1">
                        <label className={`text-xs font-extrabold uppercase ${stepStyles.accentText}`}>Current Confidence Level: {draft.profile?.currentConfidence || 3}/5</label>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={draft.profile?.currentConfidence || 3}
                          onChange={(e) => updateWizardDraft({
                            profile: { ...draft.profile!, currentConfidence: parseInt(e.target.value) }
                          })}
                          className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Goal Timeline */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black text-slate-650 uppercase flex items-center gap-1.5 pl-1">
                          <Calendar className="w-4 h-4 text-indigo-600" /> Exam Date
                        </label>
                        <input
                          type="date"
                          value={draft.timeline?.examDate || ""}
                          onChange={(e) => updateWizardDraft({
                            timeline: { ...draft.timeline!, examDate: e.target.value }
                          })}
                          className="border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 font-semibold bg-white"
                        />
                        {errors.examDate && <p className="text-red-500 text-xs pl-1">{errors.examDate}</p>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-slate-650 uppercase flex items-center gap-1.5 pl-1">
                          <Clock className="w-4 h-4 text-indigo-600" /> Target Study Hours (Daily)
                        </label>
                        <div className="flex items-center gap-4 mt-1.5">
                          <input
                            type="range"
                            min="2"
                            max="15"
                            value={draft.timeline?.dailyStudyHours || 8}
                            onChange={(e) => updateWizardDraft({
                              timeline: { ...draft.timeline!, dailyStudyHours: parseInt(e.target.value) }
                            })}
                            className="flex-1 h-2 bg-indigo-150 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <span className="w-20 text-center font-black text-indigo-700 text-xs bg-indigo-50 border border-indigo-100 py-2 px-3 rounded-xl shrink-0 shadow-xs">
                            {draft.timeline?.dailyStudyHours || 8} Hrs
                          </span>
                        </div>
                        {errors.dailyStudyHours && <p className="text-red-500 text-xs pl-1">{errors.dailyStudyHours}</p>}
                      </div>
                    </div>

                    {/* Timeline calculations output */}
                    <div className="bg-slate-50/50 border border-slate-200/60 p-6 rounded-3xl space-y-4">
                      <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> AI Calculator Projections
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Days Remaining</span>
                          <p className="text-lg font-black text-indigo-600 mt-1">{draft.timeline?.remainingDays || 0} Days</p>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Total Study Hours</span>
                          <p className="text-lg font-black text-indigo-600 mt-1">
                            {((draft.timeline?.remainingDays || 0) * (draft.timeline?.dailyStudyHours || 8)).toLocaleString()} Hrs
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Burnout Risk</span>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${draft.timeline?.burnoutRisk === "High" ? "bg-rose-500" : draft.timeline?.burnoutRisk === "Moderate" ? "bg-amber-500" : "bg-emerald-500"
                              }`} />
                            <span className="text-xs font-extrabold text-slate-800">{draft.timeline?.burnoutRisk || "Low"}</span>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Difficulty Level</span>
                          <p className="text-xs font-extrabold text-slate-800 mt-2">{draft.timeline?.difficulty || "Medium"}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-indigo-600 to-violet-650 text-white p-4.5 rounded-2xl flex items-center justify-between shadow-md">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider opacity-90">Success Prediction Rate</p>
                          <p className="text-[10px] opacity-75 mt-0.5">Based on hours, coverage, target date</p>
                        </div>
                        <span className="text-2xl font-black">{draft.timeline?.successPrediction || 65}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Study Lifestyle */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs font-black text-slate-650 uppercase block mb-3 pl-1">Preferred Study Time Slots</label>
                        <div className="flex flex-wrap gap-2">
                          {(["Morning", "Afternoon", "Night", "Weekend"] as const).map((slot) => {
                            const active = draft.lifestyle?.slots?.includes(slot) || false;
                            const SlotIcon = {
                              Morning: LucideIcons.Sun,
                              Afternoon: LucideIcons.CloudSun,
                              Night: LucideIcons.Moon,
                              Weekend: LucideIcons.Calendar
                            }[slot];
                            return (
                              <button
                                key={slot}
                                onClick={() => {
                                  const currentSlots = draft.lifestyle?.slots || [];
                                  const nextSlots = active
                                    ? currentSlots.filter((s) => s !== slot)
                                    : [...currentSlots, slot];
                                  updateWizardDraft({
                                    lifestyle: { ...draft.lifestyle!, slots: nextSlots }
                                  });
                                }}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] ${active
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                                  }`}
                              >
                                {SlotIcon && <SlotIcon className="w-4 h-4" />}
                                <span>{slot}</span>
                              </button>
                            );
                          })}
                        </div>
                        {errors.slots && <p className="text-rose-500 text-[10px] font-black mt-2 pl-1">{errors.slots}</p>}
                      </div>

                      <CustomSelect
                        label="Preferred Learning Device"
                        value={draft.lifestyle?.preferredDevice || "Laptop & Tablet"}
                        options={["Laptop & Tablet", "Desktop & Workstation", "Mobile Smartphone only", "Physical books/Printed notes"]}
                        onChange={(val) => updateWizardDraft({
                          lifestyle: { ...draft.lifestyle!, preferredDevice: val }
                        })}
                      />

                      <CustomSelect
                        label="Learning Environment"
                        value={draft.lifestyle?.learningEnvironment || "Home Study Room (Quiet)"}
                        options={["Home Study Room (Quiet)", "Public Library / Study Cafe", "College / University Lounge", "Co-working Space / Commute"]}
                        onChange={(val) => updateWizardDraft({
                          lifestyle: { ...draft.lifestyle!, learningEnvironment: val }
                        })}
                      />
                    </div>

                    <div className="space-y-5">
                      <CustomSelect
                        label="Internet Access / Availability"
                        value={draft.lifestyle?.internetAvailability || "High-speed Wi-Fi (Continuous)"}
                        options={["High-speed Wi-Fi (Continuous)", "Cellular Data / Limited access", "Offline / Intermittent sync only"]}
                        onChange={(val) => updateWizardDraft({
                          lifestyle: { ...draft.lifestyle!, internetAvailability: val }
                        })}
                      />

                      <div>
                        <label className="text-xs font-black text-slate-650 uppercase block mb-3 pl-1">Consistency Commits</label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {["Everyday", "Weekdays Only", "Weekends Intensive", "Skip Festivals/Holidays"].map((item) => {
                            const selected = draft.lifestyle?.consistency?.includes(item) || false;
                            const CommitIcon = {
                              "Everyday": Flame,
                              "Weekdays Only": CalendarDays,
                              "Weekends Intensive": Zap,
                              "Skip Festivals/Holidays": Sparkles
                            }[item as "Everyday" | "Weekdays Only" | "Weekends Intensive" | "Skip Festivals/Holidays"];
                            return (
                              <button
                                key={item}
                                onClick={() => {
                                  const currentCon = draft.lifestyle?.consistency || [];
                                  const nextCon = selected
                                    ? currentCon.filter((c) => c !== item)
                                    : [...currentCon, item];
                                  updateWizardDraft({
                                    lifestyle: { ...draft.lifestyle!, consistency: nextCon }
                                  });
                                }}
                                className={`p-3.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer hover:scale-[1.01] ${selected
                                  ? "bg-indigo-50/50 border-indigo-650 text-indigo-700 shadow-sm"
                                  : "bg-white border-slate-200 hover:border-indigo-300"
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  {CommitIcon && <CommitIcon className={`w-4.5 h-4.5 ${selected ? "text-indigo-600 animate-pulse-subtle" : "text-slate-400"}`} />}
                                  <span>{item}</span>
                                </div>
                                {selected && <LucideIcons.Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                        {errors.consistency && <p className="text-rose-500 text-[10px] font-black mt-2 pl-1">{errors.consistency}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Learning Preferences */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex flex-col pl-1">
                    <label className="text-sm font-black text-slate-800 mb-1">Select Study & Revision preferences</label>
                    <p className="text-xs text-slate-450 font-medium">Our study blueprint generator configures daily goals tailored to these learning formats.</p>
                    {errors.preferences && <p className="text-rose-500 text-[10px] font-black mt-2">{errors.preferences}</p>}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: "Video lectures", icon: "Video", color: "rgba(99, 102, 241, 0.08)" },
                      { name: "Reading books", icon: "BookOpen", color: "rgba(16, 185, 129, 0.08)" },
                      { name: "Practice Questions", icon: "PenTool", color: "rgba(245, 158, 11, 0.08)" },
                      { name: "PYQs (Previous Years)", icon: "Calendar", color: "rgba(239, 68, 68, 0.08)" },
                      { name: "Mock Tests", icon: "Award", color: "rgba(139, 92, 246, 0.08)" },
                      { name: "Flashcards", icon: "Layers", color: "rgba(244, 63, 94, 0.08)" },
                      { name: "Mind Maps", icon: "Brain", color: "rgba(6, 182, 212, 0.08)" },
                      { name: "AI Tutor sessions", icon: "Bot", color: "rgba(79, 70, 229, 0.08)" },
                      { name: "Revision Notes", icon: "FileText", color: "rgba(100, 116, 139, 0.08)" },
                      { name: "Discussion Forums", icon: "Users", color: "rgba(79, 70, 229, 0.08)" },
                      { name: "Live Classes", icon: "Radio", color: "rgba(217, 70, 239, 0.08)" }
                    ].map((pref) => {
                      const selected = draft.preferences?.includes(pref.name) || false;
                      const Icon = (LucideIcons as any)[pref.icon] || LucideIcons.Award;
                      return (
                        <button
                          key={pref.name}
                          onClick={() => {
                            const currentPrefs = draft.preferences || [];
                            const nextPrefs = selected
                              ? currentPrefs.filter((p) => p !== pref.name)
                              : [...currentPrefs, pref.name];
                            updateWizardDraft({ preferences: nextPrefs });
                          }}
                          className={`p-5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer hover:scale-[1.02] ${selected
                            ? "border-indigo-600 bg-indigo-50/40 shadow-sm"
                            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"
                            }`}
                          style={{
                            boxShadow: selected ? `0 6px 16px ${pref.color}` : undefined
                          }}
                        >
                          <Icon className={`w-6 h-6 ${selected ? "text-indigo-600 animate-pulse-subtle" : "text-slate-400"}`} />
                          <span className="text-xs font-extrabold text-slate-700">{pref.name}</span>
                          {selected && (
                            <span className="text-[9px] font-black text-white bg-indigo-650 px-2 py-0.5 rounded-full shadow-xs">Active</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 6: Weakness Analysis */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 pl-1">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-black text-slate-800">Review Subject Competencies for {draft.targetExam || "Selected Exam"}</label>
                      <p className="text-xs text-slate-450 font-medium">Rate your active confidence (1 = No confidence, 5 = High mastery) to automatically program AI focus revisions.</p>
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Add custom subject/module name..."
                        value={customSubjectName}
                        onChange={(e) => setCustomSubjectName(e.target.value)}
                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 bg-white font-semibold"
                      />
                      <button
                        onClick={handleAddCustomSubject}
                        className="bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-black px-5 rounded-xl cursor-pointer transition-all hover:scale-102 shrink-0 shadow-sm"
                      >
                        Add Subject
                      </button>
                    </div>
                    {errors.weaknesses && <p className="text-rose-500 text-[10px] font-black mt-1.5">{errors.weaknesses}</p>}
                  </div>

                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                    {draft.weaknesses?.map((w, idx) => (
                      <div key={idx} className="bg-white border border-slate-200/80 p-4.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-3xs">
                        <div className="flex-1 min-w-[180px]">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${w.priority === "High" ? "bg-rose-500" : w.priority === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                              }`} />
                            <h5 className="font-extrabold text-slate-800 text-sm">{w.subject}</h5>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mt-1.5">
                            Weakness: {w.weaknessScore}% &bull; Priority: {w.priority}
                          </span>
                        </div>

                        <div className="flex flex-1 items-center gap-3 justify-start md:justify-center">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Confidence</label>
                          <div className="flex gap-1 bg-slate-55 p-0.5 rounded-xl border border-slate-200/60 bg-slate-50">
                            {[1, 2, 3, 4, 5].map((stars) => (
                              <button
                                key={stars}
                                onClick={() => handleWeaknessConfidenceChange(idx, stars)}
                                className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${w.confidence >= stars
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "text-slate-400 hover:text-slate-650"
                                  }`}
                              >
                                {stars}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Difficulty</label>
                          <div className="flex bg-slate-50 p-0.5 rounded-xl border border-slate-200/60">
                            {(["Easy", "Medium", "Hard"] as const).map((diff) => (
                              <button
                                key={diff}
                                onClick={() => handleWeaknessDifficultyChange(idx, diff)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${w.difficulty === diff
                                  ? "bg-white text-slate-900 shadow-xs"
                                  : "text-slate-400 hover:text-slate-700"
                                  }`}
                              >
                                {diff}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveSubject(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50/50 transition-all cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: Review summary */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  {/* Performance projection panel */}
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-650 text-white p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-2 relative z-10">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-500/80 border border-indigo-400/50 px-3 py-1 rounded-full">
                        Calibration Forecast Established
                      </span>
                      <h4 className="text-xl font-black">Calibration Projections Calculated!</h4>
                      <p className="text-indigo-100 text-xs max-w-md">The ExamForge engine combined your inputs from all steps to calibrate target metrics</p>
                    </div>

                    <div className="flex items-center gap-4 bg-indigo-700/40 p-4.5 rounded-2xl border border-indigo-500/40 relative z-10 shrink-0">
                      <div className="text-center">
                        <span className="text-[9px] text-indigo-200 uppercase font-black tracking-wider">Success Prediction</span>
                        <p className="text-3xl font-black mt-1">{draft.timeline?.successPrediction || 65}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Calculations math breakdown (Aesthetics/Predict correct analysis) */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4">
                    <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> Success Predictor Calculation Math
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-500">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">1. Baseline Level</span>
                        <span className="text-sm font-black text-slate-800 mt-1 block">50.0%</span>
                        <p className="text-[9px] text-slate-400 mt-1">Base probability chance</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">2. Hours Multiplier</span>
                        <span className="text-sm font-black text-indigo-650 mt-1 block">+{((draft.timeline?.dailyStudyHours || 8) * 2.5).toFixed(1)}%</span>
                        <p className="text-[9px] text-slate-400 mt-1">Based on {draft.timeline?.dailyStudyHours || 8} study hrs</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">3. Study Formats Bonus</span>
                        <span className="text-sm font-black text-emerald-600 mt-1 block">+{((draft.preferences?.length || 0) * 1.5).toFixed(1)}%</span>
                        <p className="text-[9px] text-slate-400 mt-1">Based on {draft.preferences?.length || 0} active modes</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">4. Weakness Buffer</span>
                        <span className="text-sm font-black text-amber-605 mt-1 block">
                          -{(Math.max(0, 10 - ((draft.weaknesses || []).reduce((acc, w) => acc + w.confidence, 0) / ((draft.weaknesses || []).length || 1)) * 2)).toFixed(1)}%
                        </span>
                        <p className="text-[9px] text-slate-400 mt-1">Average weakness ratings drag</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Profile, Timeline & Environment */}
                    <div className="md:col-span-2 space-y-5 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-3xs">
                      <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-3">Profile & Logistics</h5>
                      <div className="grid grid-cols-2 gap-5 text-xs font-semibold text-slate-700">
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Aspirant Name</span>
                          <p className="font-black text-slate-800">{draft.profile?.fullName || "Student"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Target Exam Category</span>
                          <p className="font-black text-slate-800">{draft.targetExam} ({draft.examCategory || "Custom"})</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Syllabus Status</span>
                          <p className="font-black text-slate-800">{draft.profile?.syllabusPercent || 0}% Complete</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Target Exam Date</span>
                          <p className="font-black text-slate-800">{draft.timeline?.examDate} ({draft.timeline?.remainingDays} Days Left)</p>
                        </div>
                        <div className="space-y-2 col-span-2 border-t border-slate-100 pt-4.5 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Study Environment</span>
                            <p className="font-bold text-slate-700">{draft.lifestyle?.learningEnvironment || "Quiet Study Room"}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Study Slots / Device</span>
                            <p className="font-bold text-slate-700">{draft.lifestyle?.slots?.join(", ")} via {draft.lifestyle?.preferredDevice}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Step 6 selections list (Subject Confidence Model) */}
                    <div className="space-y-5 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-3xs">
                      <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-3">Weak Subjects</h5>
                      <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
                        {(draft.weaknesses || [])
                          .filter((w) => w.confidence <= 3 || w.priority === "High" || w.priority === "Medium")
                          .map((w, index) => (
                            <div key={index} className="flex flex-col gap-2 bg-slate-50 border border-slate-200/40 p-3.5 rounded-xl text-xs font-bold">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Star className={`w-4 h-4 shrink-0 ${w.priority === "High"
                                    ? "fill-rose-500 text-rose-500 animate-pulse"
                                    : w.priority === "Medium"
                                      ? "fill-amber-500 text-amber-500"
                                      : "fill-emerald-500 text-emerald-500"
                                    }`} />
                                  <span className="text-slate-800 font-extrabold truncate max-w-[125px]">{w.subject}</span>
                                </div>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{w.difficulty}</span>
                              </div>

                              <div className="flex justify-between items-center border-t border-slate-200/50 pt-2.5 mt-1">
                                <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Confidence</span>
                                <span className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => {
                                    const isFilled = i < w.confidence;
                                    return (
                                      <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${isFilled ? "fill-amber-400 text-amber-400" : "text-slate-355"}`}
                                      />
                                    );
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-6 border-t border-slate-200/50 flex items-center justify-between bg-slate-55/60 bg-slate-50">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="p-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer shadow-xs flex items-center justify-center"
            title="Previous Step"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="bg-indigo-600 hover:bg-indigo-750 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer hover:scale-[1.02] hover:shadow-lg"
            title={currentStep === 7 ? "Launch success engine" : "Save & Continue"}
          >
            <span>{currentStep === 7 ? "Launch Engine" : "Next Step"}</span>
            {currentStep === 7 ? <Trophy className="w-4.5 h-4.5 text-amber-350 animate-bounce" /> : <ChevronRight className="w-4.5 h-4.5" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

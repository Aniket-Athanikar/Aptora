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
  { name: "UPSC CSE", category: "Civil Services", color: "from-amber-500 to-orange-600", icon: "FileText" },
  { name: "State PSC", category: "Civil Services", color: "from-orange-500 to-red-600", icon: "Building" },
  { name: "JEE Advanced", category: "Engineering", color: "from-blue-500 to-indigo-600", icon: "Atom" },
  { name: "NEET UG", category: "Medical", color: "from-emerald-500 to-teal-600", icon: "Activity" },
  { name: "CAT", category: "Management", color: "from-pink-500 to-rose-600", icon: "TrendingUp" },
  { name: "GATE", category: "Engineering", color: "from-purple-500 to-violet-600", icon: "Settings" },
  { name: "SSC CGL", category: "Government", color: "from-cyan-500 to-blue-600", icon: "Briefcase" },
  { name: "Banking PO", category: "Government", color: "from-sky-500 to-indigo-600", icon: "Landmark" },
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
  label
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex flex-col gap-1 w-full text-left">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-gray-50 border border-gray-250 text-gray-800 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold flex items-center justify-between cursor-pointer"
      >
        <span>{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-1 w-full bg-white border border-gray-150 rounded-2xl shadow-xl p-2 z-50 space-y-0.5 max-h-[160px] overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full p-2 text-xs font-bold rounded-xl text-left hover:bg-indigo-50/50 transition-colors cursor-pointer ${
                  value === opt ? "bg-indigo-50 text-indigo-600" : "text-gray-700"
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
    activeGoal
  } = useGoalEngine();

  const { currentStep, draft, undoStack, redoStack } = wizardState;
  const [customExam, setCustomExam] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customSubjectName, setCustomSubjectName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Custom states for loading animation (AI Thinking Screen)
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);

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

    if (currentStep === 1 && !draft.targetExam) {
      stepErrors.targetExam = "Please select or type your target exam to proceed.";
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
        stepErrors.dailyStudyHours = "Daily study hours must be between 1 and 15 hours (leaving at least 8 hours for sleep/rest).";
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

          completeWizard(finishedGoal, isEditMode ? "Calibrated and Edited success profile params" : "Configured initial Success engine blueprint");
          setIsThinking(false);
          if (onClose) onClose();
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg p-8 rounded-3xl bg-white border border-gray-100 shadow-2xl text-center flex flex-col items-center"
        >
          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
            <span className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-pulse"></span>
            <span className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></span>
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>

          <h2 className="text-2xl font-bold mb-1 text-gray-900">Calibrating Success Engine</h2>
          <p className="text-gray-500 mb-8 text-sm">Building personalized roadmap blueprints...</p>

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
              <div key={idx} className="flex items-center text-left text-sm gap-3">
                <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  thinkingStep > idx
                    ? "bg-emerald-500 text-white"
                    : thinkingStep === idx
                      ? "bg-indigo-600 text-white animate-pulse"
                      : "bg-gray-100 text-gray-400"
                }`}>
                  {thinkingStep > idx ? (
                    <LucideIcons.Check className="w-3 h-3 text-white" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className={`font-medium ${thinkingStep >= idx ? "text-gray-800" : "text-gray-400"}`}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl glass border border-white/20 shadow-2xl overflow-hidden backdrop-blur-xl"
      >
        {/* Top Header Navigation */}
        <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xs">
              <StepIcon className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Step {currentStep} of 7
                </span>
                {isEditMode && (
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    Edit Mode
                  </span>
                )}
              </div>
              <h3 className="font-bold text-gray-900">{currentMeta.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Undo/Redo Buttons */}
            <div className="flex items-center gap-1.5 bg-gray-150/55 p-1 rounded-xl">
              <button
                onClick={undoWizardDraft}
                disabled={undoStack.length === 0}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redoWizardDraft}
                disabled={redoStack.length === 0}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Step Indicator Badges Strip */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 bg-white/30 border-b border-gray-150 text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
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
              <div key={s.id} className="flex items-center gap-1.5">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                  isActive
                    ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-md animate-pulse-subtle"
                    : isCompleted
                    ? "bg-emerald-50 border-emerald-250 text-emerald-600 font-bold"
                    : "bg-white border-gray-200 text-gray-400"
                }`}>
                  {isCompleted ? <LucideIcons.Check className="w-3.5 h-3.5" /> : StepIconComponent ? <StepIconComponent className="w-3.5 h-3.5" /> : s.id}
                </span>
                <span className={isActive ? "text-indigo-600 font-black text-[10px]" : isCompleted ? "text-emerald-600 text-[10px]" : "text-[10px]"}>
                  {s.label}
                </span>
                {s.id < 7 && <LucideIcons.ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-1 shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-gray-150 h-1.5">
          <motion.div
            className="bg-[var(--primary)] h-full"
            initial={{ width: `${((currentStep - 1) / 7) * 100}%` }}
            animate={{ width: `${(currentStep / 7) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 1: Target Exam */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 bg-gray-50 border border-gray-200/60 p-4.5 rounded-2xl">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Add custom Target Exam details</h4>
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase">Exam Name</label>
                        <input
                          type="text"
                          placeholder="e.g. GRE, TOEFL, IELTS..."
                          value={customExam}
                          onChange={(e) => setCustomExam(e.target.value)}
                          className="w-full border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-indigo-600 font-semibold"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase">Exam Category</label>
                        <input
                          type="text"
                          placeholder="e.g. Higher Studies, Lang Proficiency..."
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-indigo-600 font-semibold"
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
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl self-end cursor-pointer transition-all hover:scale-102 flex items-center justify-center h-[34px]"
                      >
                        Set Exam
                      </button>
                    </div>
                    {errors.targetExam && <p className="text-red-500 text-xs mt-1">{errors.targetExam}</p>}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PRESET_EXAMS.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleSelectExam(item.name, item.category)}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all relative overflow-hidden group ${
                          draft.targetExam === item.name
                            ? "border-indigo-600 bg-indigo-50/40 shadow-sm"
                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-indigo-650 mb-2">
                          {(() => {
                            const Icon = (LucideIcons as any)[item.icon] || LucideIcons.Award;
                            return <Icon className="w-6 h-6" />;
                          })()}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">{item.category}</p>
                          <h4 className="font-bold text-gray-800 text-sm group-hover:text-indigo-600">{item.name}</h4>
                        </div>
                        {draft.targetExam === item.name && (
                          <div className="absolute right-2 top-2 bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">✓</div>
                        )}
                      </button>
                    ))}
                  </div>

                  {draft.targetExam && (
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <LucideIcons.Target className="w-6 h-6 text-indigo-600" />
                        <div>
                          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Active Choice</p>
                          <p className="font-bold text-gray-800 text-sm">{draft.targetExam} ({draft.examCategory})</p>
                        </div>
                      </div>
                      <span className="text-xs text-indigo-600 bg-indigo-100/50 px-3 py-1 rounded-full font-semibold">Subject metrics populated</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Prep Profile */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex flex-col items-center gap-3 bg-gray-50 p-6 rounded-2xl border border-gray-100 justify-center">
                      <img
                        src={draft.profile?.avatar || AVATAR_OPTIONS[0]}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full border-4 border-indigo-200 p-1 object-cover bg-white shadow-xs"
                      />
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block text-center">Aspirant Profile Image</label>

                      {/* File Uploader system */}
                      <label className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl cursor-pointer transition-all shadow-xs hover:-translate-y-0.5">
                        <Upload className="w-3.5 h-3.5" /> Upload JPG/PNG
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

                      <div className="w-full border-t border-gray-200/60 my-2" />

                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Or Choose Preset</span>
                      <div className="flex gap-1.5 justify-center flex-wrap">
                        {AVATAR_OPTIONS.map((av, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => updateWizardDraft({
                              profile: { ...draft.profile!, avatar: av }
                            })}
                            className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                              draft.profile?.avatar === av ? "border-indigo-600 scale-110 shadow-xs" : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img src={av} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-600 uppercase">Full Name</label>
                          <input
                            type="text"
                            value={draft.profile?.fullName || ""}
                            onChange={(e) => updateWizardDraft({
                              profile: { ...draft.profile!, fullName: e.target.value }
                            })}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
                            placeholder="John Doe"
                          />
                          {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-600 uppercase">Age Range (16-40)</label>
                          <input
                            type="number"
                            min="16"
                            max="40"
                            value={draft.profile?.age || 21}
                            onChange={(e) => updateWizardDraft({
                              profile: { ...draft.profile!, age: parseInt(e.target.value) || 21 }
                            })}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
                          />
                          {errors.age && <p className="text-red-500 text-xs">{errors.age}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <CustomSelect
                          label="Education / Degree"
                          value={draft.profile?.education || "Bachelor of Arts"}
                          options={["Bachelor of Technology", "Bachelor of Science", "Bachelor of Arts", "Master of Business Admin", "High School"]}
                          onChange={(val) => updateWizardDraft({
                            profile: { ...draft.profile!, education: val }
                          })}
                        />

                        <CustomSelect
                          label="Stream"
                          value={draft.profile?.stream || "Arts & Humanities"}
                          options={["Science & Technology", "Arts & Humanities", "Commerce & Accounts", "Medical & Health"]}
                          onChange={(val) => updateWizardDraft({
                            profile: { ...draft.profile!, stream: val }
                          })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Exam City</label>
                          <input
                            type="text"
                            value={draft.profile?.city || ""}
                            onChange={(e) => updateWizardDraft({
                              profile: { ...draft.profile!, city: e.target.value }
                            })}
                            className="border border-gray-250 bg-gray-50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-indigo-600 transition-all font-semibold"
                            placeholder="e.g. Delhi, Mumbai"
                          />
                          {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                        </div>

                        <CustomSelect
                          label="Occupation"
                          value={draft.profile?.occupation || "Full-time Aspirant"}
                          options={["Full-time Aspirant", "Working Professional", "College Student"]}
                          onChange={(val) => updateWizardDraft({
                            profile: { ...draft.profile!, occupation: val }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Confidence and syllabus coverage */}
                  <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <label className="text-xs font-bold text-indigo-700 uppercase">Syllabus Covered (%): {draft.profile?.syllabusPercent || 0}%</label>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={draft.profile?.syllabusPercent || 0}
                        onChange={(e) => updateWizardDraft({
                          profile: { ...draft.profile!, syllabusPercent: parseInt(e.target.value) }
                        })}
                        className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <label className="text-xs font-bold text-indigo-700 uppercase">Current Confidence Level: {draft.profile?.currentConfidence || 3}/5</label>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={draft.profile?.currentConfidence || 3}
                        onChange={(e) => updateWizardDraft({
                          profile: { ...draft.profile!, currentConfidence: parseInt(e.target.value) }
                        })}
                        className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Goal Timeline */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-indigo-600" /> Exam Date
                        </label>
                        <input
                          type="date"
                          value={draft.timeline?.examDate || ""}
                          onChange={(e) => updateWizardDraft({
                            timeline: { ...draft.timeline!, examDate: e.target.value }
                          })}
                          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 bg-white"
                        />
                        {errors.examDate && <p className="text-red-500 text-xs">{errors.examDate}</p>}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-indigo-600" /> Target Study Hours (Daily)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="2"
                            max="15"
                            value={draft.timeline?.dailyStudyHours || 8}
                            onChange={(e) => updateWizardDraft({
                              timeline: { ...draft.timeline!, dailyStudyHours: parseInt(e.target.value) }
                            })}
                            className="flex-1 h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <span className="w-16 text-center font-bold text-gray-800 text-sm bg-gray-100 py-1 px-2.5 rounded-lg border border-gray-200">
                            {draft.timeline?.dailyStudyHours || 8} Hrs
                          </span>
                        </div>
                        {errors.dailyStudyHours && <p className="text-red-500 text-xs">{errors.dailyStudyHours}</p>}
                      </div>
                    </div>

                    {/* Timeline calculations output */}
                    <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> AI Calculator Projections
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3.5 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] uppercase font-bold text-gray-500">Days Remaining</span>
                          <p className="text-xl font-extrabold text-indigo-600 mt-1">{draft.timeline?.remainingDays || 0} Days</p>
                        </div>

                        <div className="bg-white p-3.5 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] uppercase font-bold text-gray-500">Total study allocation</span>
                          <p className="text-xl font-extrabold text-indigo-600 mt-1">
                            {((draft.timeline?.remainingDays || 0) * (draft.timeline?.dailyStudyHours || 8)).toLocaleString()} Hrs
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3.5 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] uppercase font-bold text-gray-500">Burnout Risk</span>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              draft.timeline?.burnoutRisk === "High" ? "bg-red-500" : draft.timeline?.burnoutRisk === "Moderate" ? "bg-amber-500" : "bg-emerald-500"
                            }`} />
                            <span className="text-xs font-bold text-gray-800">{draft.timeline?.burnoutRisk || "Low"}</span>
                          </div>
                        </div>

                        <div className="bg-white p-3.5 rounded-xl border border-gray-200/60">
                          <span className="text-[10px] uppercase font-bold text-gray-500">Curriculum Difficulty</span>
                          <p className="text-xs font-bold text-gray-800 mt-2">{draft.timeline?.difficulty || "Medium"}</p>
                        </div>
                      </div>

                      <div className="bg-indigo-600 text-white p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-semibold opacity-85 uppercase">Success Prediction Probability</p>
                          <p className="text-xs opacity-75 mt-0.5">Based on hours, coverage, date</p>
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
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-gray-700 block mb-2">Preferred Study Time Slots</label>
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
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] ${
                                  active
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                                }`}
                              >
                                {SlotIcon && <SlotIcon className="w-3.5 h-3.5" />}
                                <span>{slot}</span>
                              </button>
                            );
                          })}
                        </div>
                        {errors.slots && <p className="text-red-500 text-[10px] font-bold mt-1.5">{errors.slots}</p>}
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

                    <div className="space-y-4">
                      <CustomSelect
                        label="Internet Access / Availability"
                        value={draft.lifestyle?.internetAvailability || "High-speed Wi-Fi (Continuous)"}
                        options={["High-speed Wi-Fi (Continuous)", "Cellular Data / Limited access", "Offline / Intermittent sync only"]}
                        onChange={(val) => updateWizardDraft({
                          lifestyle: { ...draft.lifestyle!, internetAvailability: val }
                        })}
                      />

                      <div>
                        <label className="text-sm font-bold text-gray-700 block mb-2">Consistency Commits</label>
                        <div className="grid grid-cols-2 gap-2">
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
                                className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer hover:scale-[1.01] ${
                                  selected
                                    ? "bg-indigo-50 border-indigo-600 text-indigo-800 shadow-2xs"
                                    : "bg-white border-gray-200 hover:border-indigo-300"
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  {CommitIcon && <CommitIcon className={`w-4.5 h-4.5 ${selected ? "text-indigo-600 animate-pulse-subtle" : "text-gray-400"}`} />}
                                  <span>{item}</span>
                                </div>
                                {selected && <LucideIcons.Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                        {errors.consistency && <p className="text-red-500 text-[10px] font-bold mt-1.5">{errors.consistency}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Learning Preferences */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-800 mb-1">Select Study & Revision preferences</label>
                    <p className="text-xs text-gray-500 mb-2">Our study blueprint generator configures daily goals tailored to these learning formats.</p>
                    {errors.preferences && <p className="text-red-500 text-[10px] font-bold mb-3">{errors.preferences}</p>}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: "Video lectures", icon: "Video" },
                      { name: "Reading books", icon: "BookOpen" },
                      { name: "Practice Questions", icon: "PenTool" },
                      { name: "PYQs (Previous Years)", icon: "Calendar" },
                      { name: "Mock Tests", icon: "Award" },
                      { name: "Flashcards", icon: "Layers" },
                      { name: "Mind Maps", icon: "Brain" },
                      { name: "AI Tutor sessions", icon: "Bot" },
                      { name: "Revision Notes", icon: "FileText" },
                      { name: "Discussion Forums", icon: "Users" },
                      { name: "Live Classes", icon: "Radio" }
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
                          className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                            selected
                              ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                              : "border-gray-200 hover:bg-gray-50 hover:border-indigo-300"
                          }`}
                        >
                          <Icon className={`w-6 h-6 ${selected ? "text-indigo-600" : "text-gray-500"}`} />
                          <span className="text-xs font-bold text-gray-700">{pref.name}</span>
                          {selected && (
                            <span className="text-[10px] text-white bg-indigo-600 px-2 py-0.5 rounded-full">Active</span>
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
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold text-gray-800">Review Subject Competencies for {draft.targetExam || "Selected Exam"}</label>
                      <p className="text-xs text-gray-500">Rate your active confidence (1 = No confidence, 5 = High mastery) to automatically program AI focus revisions.</p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add custom subject/module name..."
                        value={customSubjectName}
                        onChange={(e) => setCustomSubjectName(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-600 bg-white"
                      />
                      <button
                        onClick={handleAddCustomSubject}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 rounded-xl"
                      >
                        Add Subject
                      </button>
                    </div>
                    {errors.weaknesses && <p className="text-red-500 text-[10px] font-bold mt-1.5">{errors.weaknesses}</p>}
                  </div>

                  <div className="space-y-3.5">
                    {draft.weaknesses?.map((w, idx) => (
                      <div key={idx} className="bg-white border border-gray-200/80 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-[180px]">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              w.priority === "High" ? "bg-red-500" : w.priority === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                            }`} />
                            <h5 className="font-extrabold text-gray-800 text-sm">{w.subject}</h5>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase block mt-1">
                            Weakness Score: {w.weaknessScore}% &bull; Priority: {w.priority}
                          </span>
                        </div>

                        <div className="flex flex-1 items-center gap-3">
                          <label className="text-xs font-bold text-gray-500 uppercase">Confidence</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((stars) => (
                              <button
                                key={stars}
                                onClick={() => handleWeaknessConfidenceChange(idx, stars)}
                                className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-all ${
                                  w.confidence >= stars
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                }`}
                              >
                                {stars}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-gray-500 uppercase">Difficulty</label>
                          <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                            {(["Easy", "Medium", "Hard"] as const).map((diff) => (
                              <button
                                key={diff}
                                onClick={() => handleWeaknessDifficultyChange(idx, diff)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  w.difficulty === diff
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                              >
                                {diff}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveSubject(idx)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded-lg"
                        >
                          <X className="w-4.5 h-4.5" />
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
                  <div className="bg-indigo-600 text-white p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-2 relative z-10">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest bg-indigo-500/80 border border-indigo-400 px-3 py-1 rounded-full">
                        Calibration Forecast Established
                      </span>
                      <h4 className="text-xl font-black">Calibration Projections Calculated!</h4>
                      <p className="text-indigo-100 text-xs max-w-md">The ExamForge engine combined your inputs from all  steps to calibrate target metrics</p>
                    </div>

                    <div className="flex items-center gap-4 bg-indigo-700/60 p-4.5 rounded-2xl border border-indigo-500/50 relative z-10 shrink-0">
                      <div className="text-center">
                        <span className="text-[9px] text-indigo-200 uppercase font-black tracking-wider">Success Prediction</span>
                        <p className="text-3xl font-black mt-1">{draft.timeline?.successPrediction || 65}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Calculations math breakdown (Aesthetics/Predict correct analysis) */}
                  <div className="bg-white border border-gray-150 rounded-3xl p-5.5 space-y-4">
                    <h5 className="font-extrabold text-gray-800 text-xs uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Success Predictor Calculation Math
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium text-gray-600">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[9px] text-gray-400 uppercase font-bold block">1. Baseline Level</span>
                        <span className="text-sm font-extrabold text-slate-800 mt-1 block">50.0%</span>
                        <p className="text-[9px] text-gray-400 mt-0.5">Base probability chance</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[9px] text-gray-400 uppercase font-bold block">2. Hours Multiplier</span>
                        <span className="text-sm font-extrabold text-indigo-600 mt-1 block">+{((draft.timeline?.dailyStudyHours || 8) * 2.5).toFixed(1)}%</span>
                        <p className="text-[9px] text-gray-400 mt-0.5">Based on {draft.timeline?.dailyStudyHours || 8} study hrs</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[9px] text-gray-400 uppercase font-bold block">3. Study Formats Bonus</span>
                        <span className="text-sm font-extrabold text-emerald-600 mt-1 block">+{((draft.preferences?.length || 0) * 1.5).toFixed(1)}%</span>
                        <p className="text-[9px] text-gray-400 mt-0.5">Based on {draft.preferences?.length || 0} active modes</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[9px] text-gray-400 uppercase font-bold block">4. Weakness Buffer</span>
                        <span className="text-sm font-extrabold text-amber-600 mt-1 block">
                          -{(Math.max(0, 10 - ((draft.weaknesses || []).reduce((acc, w) => acc + w.confidence, 0) / ((draft.weaknesses || []).length || 1)) * 2)).toFixed(1)}%
                        </span>
                        <p className="text-[9px] text-gray-400 mt-0.5">Average weakness ratings drag</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Profile, Timeline & Environment */}
                    <div className="md:col-span-2 space-y-5 bg-white border border-gray-150 rounded-3xl p-5.5 shadow-xs">
                      <h5 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-100 pb-2">Profile & Logistics</h5>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 uppercase font-bold block">Aspirant Name</span>
                          <p>{draft.profile?.fullName || "Student"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 uppercase font-bold block">Target Exam Category</span>
                          <p>{draft.targetExam} ({draft.examCategory || "Custom"})</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 uppercase font-bold block">Syllabus Status</span>
                          <p>{draft.profile?.syllabusPercent || 0}% Complete</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 uppercase font-bold block">Target Exam Date</span>
                          <p>{draft.timeline?.examDate} ({draft.timeline?.remainingDays} Days Left)</p>
                        </div>
                        <div className="space-y-1 col-span-2 border-t border-slate-100 pt-2.5 grid grid-cols-2 gap-2.5">
                          <div>
                            <span className="text-[9px] text-gray-400 uppercase font-bold block">Study Environment</span>
                            <p className="font-medium">{draft.lifestyle?.learningEnvironment || "Quiet Study Room"}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 uppercase font-bold block">Study Slots / Device</span>
                            <p className="font-medium">{draft.lifestyle?.slots?.join(", ")} via {draft.lifestyle?.preferredDevice}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Step 6 selections list (Subject Confidence Model) */}
                    <div className="space-y-5 bg-white border border-gray-150 rounded-3xl p-5.5 shadow-xs">
                      <h5 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-100 pb-2">Weak Subjects</h5>
                      <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                        {(draft.weaknesses || [])
                          .filter((w) => w.confidence <= 3 || w.priority === "High" || w.priority === "Medium")
                          .map((w, index) => (
                            <div key={index} className="flex flex-col gap-1.5 bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Star className={`w-3.5 h-3.5 shrink-0 ${
                                    w.priority === "High"
                                      ? "fill-red-500 text-red-500 animate-pulse"
                                      : w.priority === "Medium"
                                      ? "fill-amber-500 text-amber-500"
                                      : "fill-emerald-500 text-emerald-500"
                                  }`} />
                                  <span className="text-gray-800 font-extrabold truncate max-w-[125px]">{w.subject}</span>
                                </div>
                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{w.difficulty}</span>
                              </div>

                              <div className="flex justify-between items-center border-t border-gray-100 pt-1.5 mt-1">
                                <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Confidence</span>
                                <span className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => {
                                    const isFilled = i < w.confidence;
                                    return (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${isFilled ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
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
        <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="p-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer shadow-3xs flex items-center justify-center"
            title="Previous Step"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer hover:scale-[1.02]"
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

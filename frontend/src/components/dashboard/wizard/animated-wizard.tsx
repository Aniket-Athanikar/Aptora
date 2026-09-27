"use client";

import React, { useState, useEffect } from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { useAuth } from "@/lib/auth-context";
import { GoalData, SubjectWeakness } from "@/types/goal.types";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";

import {
  PRESET_EXAMS,
  PRESET_SUBJECTS,
  AVATAR_OPTIONS,
  STEP_HEADERS,
  STEP_COLORS,
  getStepStyles
} from "./constants";

import { playClickSound, playSuccessSound } from "./sound-effects";
import confetti from "canvas-confetti";

import { CustomSelect } from "./CustomSelect";
import { StepTarget } from "./StepTarget";
import { StepProfile } from "./StepProfile";
import { StepTimeline } from "./StepTimeline";
import { StepLifestyle } from "./StepLifestyle";
import { StepFocus } from "./StepFocus";
import { StepWeakness } from "./StepWeakness";
import { StepProjections } from "./StepProjections";

const {
  Compass, Undo2, Redo2, ChevronLeft, ChevronRight, X,
  Clock, AlertTriangle, Monitor, BookOpen, Layers, Upload,
  Coffee, Trophy, Star, Flame, CalendarDays, Zap, Trash2
} = LucideIcons;

interface AnimatedWizardProps {
  onClose?: () => void;
  isEditMode?: boolean;
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
    addNotification,
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
          avatar: "",
          education: "Bachelor of Arts",
          stream: "Arts & Humanities",
          city: "Delhi",
          occupation: "Student",
          gender: "",
          phone: "",
          age: 21,
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
        const examNameRegex = /^[a-zA-Z\s\-\/]{2,50}$/;
        if (!examNameRegex.test(examName)) {
          stepErrors.targetExam = "Exam name must be 2-50 alphabetical letters (spaces, hyphens, or slashes only).";
        } else {
          const categoryName = customCategory.trim() || "Custom Exam";
          handleSelectExam(examName, categoryName);
          setCustomExam("");
          setCustomCategory("");
          finalExam = examName;
        }
      } else if (!finalExam) {
        stepErrors.targetExam = "Please select a target exam or enter custom details to proceed.";
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
        const stepHeader = STEP_HEADERS[currentStep - 1];
        playClickSound();
        addNotification(
          `Step ${currentStep} Completed`,
          `Successfully saved and updated your calibration for the ${stepHeader.label} section.`,
          "success"
        );
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
    
    // Play initial sound
    playClickSound();

    const interval = setInterval(() => {
      stepCount++;
      setThinkingStep(stepCount);
      playClickSound();

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
              gender: draft.profile?.gender || "",
              phone: draft.profile?.phone || "",
              age: draft.profile?.age || 22,
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
            createdAt: draft.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          setCelebrationGoal(finishedGoal);
          setIsThinking(false);
          setIsCelebrating(true);
          
          // Play success chime & trigger confetti celebration!
          playSuccessSound();
          confetti({
            particleCount: 160,
            spread: 85,
            origin: { y: 0.6 }
          });
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
      aiRecommendation: `Review core materials and active practice loops for ${customSubjectName.trim()}.`
    };
    const current = draft.weaknesses || [];
    updateWizardDraft({ weaknesses: [...current, newWeakness] });
    setCustomSubjectName("");
    setErrors({});
  };

  const handleRemoveSubject = (idx: number) => {
    if (!draft.weaknesses) return;
    const current = draft.weaknesses.filter((_, i) => i !== idx);
    updateWizardDraft({ weaknesses: current });
  };

  const currentMeta = STEP_HEADERS.find((s) => s.id === currentStep) || STEP_HEADERS[0];
  const StepIcon = {
    1: Compass,
    2: LucideIcons.User,
    3: LucideIcons.Calendar,
    4: Coffee,
    5: LucideIcons.CheckSquare,
    6: LucideIcons.Brain,
    7: Trophy
  }[currentStep as 1 | 2 | 3 | 4 | 5 | 6 | 7] || Compass;

  if (isThinking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/50 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md p-8 rounded-[32px] bg-white border border-slate-200/50 shadow-2xl text-center flex flex-col items-center"
        >
          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-dashed border-indigo-600/35"
            />
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-md shadow-indigo-600/5"
            >
              <LucideIcons.Sparkles className="w-6.5 h-6.5 text-indigo-600" />
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/50 backdrop-blur-md">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mb-8 text-left">
            <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 text-left">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Target Goal</span>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">{celebrationGoal.targetExam}</p>
            </div>
            <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50/20 text-left">
              <span className="text-[10px] font-black uppercase text-teal-600 tracking-wider">Success Score</span>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">{celebrationGoal.timeline.successPrediction}%</p>
            </div>
            <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/20 text-left">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Commitment</span>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">{celebrationGoal.timeline.dailyStudyHours} hrs / day</p>
            </div>
            <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/20 text-left">
              <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">Time Remaining</span>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">{celebrationGoal.timeline.remainingDays} Days</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 w-full">
            <button
              type="button"
              onClick={() => {
                setIsCelebrating(false);
              }}
              className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-black rounded-2xl cursor-pointer hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
              <span>Back & Edit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                completeWizard(celebrationGoal, isEditMode ? "Calibrated and Edited success profile params" : "Configured initial Success engine blueprint");
                setIsCelebrating(false);
                if (onClose) onClose();
              }}
              className="flex-[2] py-4 bg-gradient-to-r from-emerald-600 to-[#10B981] hover:brightness-105 text-white text-xs font-black rounded-2xl cursor-pointer shadow-lg shadow-emerald-500/15 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 border-none"
            >
              <span>Enter Study Workspace</span>
              <LucideIcons.ArrowRight className="w-4.5 h-4.5 text-white" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const theme = STEP_COLORS[currentStep] || STEP_COLORS[1];
  const stepStyles = getStepStyles(currentStep);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/50 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 15 }}
        transition={{ type: "spring", damping: 30, stiffness: 250 }}
        className={`relative w-full max-w-4xl h-[95vh] sm:h-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-[24px] sm:rounded-[32px] bg-white/75 glass border border-white/30 overflow-hidden backdrop-blur-3xl transition-all duration-700 ${theme.shadow}`}
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
        <div className="p-4 sm:p-6 border-b border-white/20 flex items-center justify-between bg-white/40 backdrop-blur-sm relative z-10">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-11 h-11 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-center shadow-sm shrink-0"
            >
              <StepIcon className={`w-5.5 h-5.5 ${stepStyles.accentText}`} />
            </motion.div>
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
              <h3 className="font-extrabold text-slate-800 tracking-tight text-left">{currentMeta.label} Milestones</h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Undo/Redo Buttons */}
            <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md p-1 rounded-xl border border-slate-200/40 shadow-sm">
              <button
                onClick={undoWizardDraft}
                disabled={undoStack.length === 0}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-55 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                title="Undo"
              >
                <Undo2 className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={redoWizardDraft}
                disabled={redoStack.length === 0}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-55 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                title="Redo"
              >
                <Redo2 className="w-4.5 h-4.5" />
              </button>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-100 shadow-sm"
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
              1: Compass,
              2: LucideIcons.User,
              3: LucideIcons.Calendar,
              4: Coffee,
              5: LucideIcons.CheckSquare,
              6: LucideIcons.Brain,
              7: Trophy
            };
            const IconColorMap: Record<number, string> = {
              1: "text-blue-500",
              2: "text-purple-500",
              3: "text-emerald-500",
              4: "text-amber-500",
              5: "text-rose-500",
              6: "text-indigo-500",
              7: "text-yellow-500"
            };
            const StepIconComponent = IconMap[s.id];
            const stepColorClass = IconColorMap[s.id] || "text-slate-400";
            return (
              <div key={s.id} className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${isActive
                    ? `bg-gradient-to-r ${theme.gradient} border-white/10 text-white shadow-md scale-105`
                    : isCompleted
                      ? "bg-emerald-500 border-emerald-400 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                      : "bg-white/40 border-white/20 text-slate-500"
                    }`}
                >
                  {isCompleted ? (
                    <LucideIcons.Check className="w-4 h-4 text-white" />
                  ) : StepIconComponent ? (
                    <StepIconComponent className={`w-4 h-4 ${isActive ? "text-white" : stepColorClass}`} />
                  ) : (
                    s.id
                  )}
                </motion.div>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
            >
              {currentStep === 1 && (
                <StepTarget
                  draft={draft}
                  errors={errors}
                  stepStyles={stepStyles}
                  customExam={customExam}
                  setCustomExam={setCustomExam}
                  customCategory={customCategory}
                  setCustomCategory={setCustomCategory}
                  onSelectExam={handleSelectExam}
                  onClearExam={() => {
                    updateWizardDraft({ targetExam: "", examCategory: "" });
                    setErrors({});
                  }}
                  onSetCustomExam={() => {
                    const examName = customExam.trim();
                    if (!examName) {
                      setErrors({ targetExam: "Please enter an exam name." });
                      return;
                    }
                    const examNameRegex = /^[a-zA-Z\s\-\/]{2,50}$/;
                    if (!examNameRegex.test(examName)) {
                      setErrors({ targetExam: "Exam name must be 2-50 alphabetical letters (spaces, hyphens, or slashes only)." });
                      return;
                    }
                    setErrors({});
                    handleSelectExam(examName, customCategory.trim() || "Custom Exam");
                    setCustomExam("");
                    setCustomCategory("");
                  }}
                />
              )}

              {currentStep === 2 && (
                <StepProfile
                  draft={draft}
                  errors={errors}
                  stepStyles={stepStyles}
                  updateWizardDraft={updateWizardDraft}
                />
              )}

              {currentStep === 3 && (
                <StepTimeline
                  draft={draft}
                  errors={errors}
                  stepStyles={stepStyles}
                  updateWizardDraft={updateWizardDraft}
                  theme={theme}
                />
              )}

              {currentStep === 4 && (
                <StepLifestyle
                  draft={draft}
                  errors={errors}
                  stepStyles={stepStyles}
                  updateWizardDraft={updateWizardDraft}
                />
              )}

              {currentStep === 5 && (
                <StepFocus
                  draft={draft}
                  errors={errors}
                  updateWizardDraft={updateWizardDraft}
                />
              )}

              {currentStep === 6 && (
                <StepWeakness
                  draft={draft}
                  errors={errors}
                  customSubjectName={customSubjectName}
                  setCustomSubjectName={setCustomSubjectName}
                  onAddCustomSubject={handleAddCustomSubject}
                  onRemoveSubject={handleRemoveSubject}
                  onWeaknessConfidenceChange={handleWeaknessConfidenceChange}
                  onWeaknessDifficultyChange={handleWeaknessDifficultyChange}
                />
              )}

              {currentStep === 7 && (
                <StepProjections
                  draft={draft}
                  theme={theme}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-6 border-t border-slate-200/60 flex items-center justify-between bg-[#FAF9F6]">
          <button
            onClick={() => {
              playClickSound();
              prevStep();
            }}
            disabled={currentStep === 1}
            className="px-4 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 rounded-xl transition-all shadow-2xs text-xs font-bold"
            title="Previous Step"
          >
            <ChevronLeft className="w-4.5 h-4.5 text-slate-600" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className={`${stepStyles.btnBg} font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-[#084c38]/20`}
            title={currentStep === 7 ? "Launch success engine" : "Save & Continue"}
          >
            <span>{currentStep === 7 ? "Launch Engine" : "Next Step"}</span>
            {currentStep === 7 ? <Trophy className="w-4.5 h-4.5 text-amber-300" /> : <ChevronRight className="w-4.5 h-4.5" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

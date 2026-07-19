"use client";

import React, { useState, useEffect } from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { useAuth } from "@/lib/auth-context";
import { GoalData, SubjectWeakness } from "@/types/goal.types";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Compass, User, Calendar, Watch, CheckSquare, Brain, 
  Sparkles, Undo2, Redo2, ChevronLeft, ChevronRight, X,
  Clock, AlertTriangle, Monitor, Wifi, BookOpen, Layers
} from "lucide-react";

// Standard UPSC and other target exams
const PRESET_EXAMS = [
  { name: "UPSC CSE", category: "Civil Services", color: "from-amber-500 to-orange-600", icon: "🏛️" },
  { name: "State PSC", category: "Civil Services", color: "from-orange-500 to-red-600", icon: "🧭" },
  { name: "JEE Advanced", category: "Engineering", color: "from-blue-500 to-indigo-600", icon: "📐" },
  { name: "NEET UG", category: "Medical", color: "from-emerald-500 to-teal-600", icon: "🩺" },
  { name: "CAT", category: "Management", color: "from-pink-500 to-rose-600", icon: "📈" },
  { name: "GATE", category: "Engineering", color: "from-purple-500 to-violet-600", icon: "⚙️" },
  { name: "SSC CGL", category: "Government", color: "from-cyan-500 to-blue-600", icon: "💼" },
  { name: "Banking PO", category: "Government", color: "from-sky-500 to-indigo-600", icon: "🏦" },
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
    activeGoal
  } = useGoalEngine();

  const { currentStep, draft, undoStack, redoStack } = wizardState;
  const [customExam, setCustomExam] = useState("");
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
        preferences: ["Practice", "PYQs", "AI Tutor", "Mind Maps"],
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
    { num: 4, title: "Study Lifestyle", icon: Watch, desc: "Tailor learning environment & schedule" },
    { num: 5, title: "Learning Modes", icon: CheckSquare, desc: "Select preferred studying tools" },
    { num: 6, title: "Gap Analysis", icon: Brain, desc: "Audit and map syllabus confidence gaps" },
    { num: 7, title: "AI Blueprint Summary", icon: Sparkles, desc: "Review and calibrate your Success Engine" }
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
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                  thinkingStep > idx 
                    ? "bg-emerald-500 text-white" 
                    : thinkingStep === idx 
                      ? "bg-indigo-600 text-white animate-pulse" 
                      : "bg-gray-100 text-gray-400"
                }`}>
                  {thinkingStep > idx ? "✓" : idx + 1}
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
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-gray-100 shadow-2xl overflow-hidden"
      >
        {/* Top Header Navigation */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <StepIcon className="w-5 h-5" />
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
            <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl">
              <button
                onClick={undoWizardDraft}
                disabled={undoStack.length === 0}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redoWizardDraft}
                disabled={redoStack.length === 0}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {onClose && (
              <button 
                onClick={onClose} 
                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5">
          <motion.div 
            className="bg-indigo-600 h-full"
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
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Choose Preset Exam or Add Custom</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search or enter custom exam (e.g. UPSC CSE, GRE, GATE...)"
                        value={customExam}
                        onChange={(e) => setCustomExam(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 bg-white"
                      />
                      <button
                        onClick={() => {
                          if (customExam.trim()) {
                            handleSelectExam(customExam.trim(), "Custom Exam");
                            setCustomExam("");
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 rounded-xl"
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
                        <div className="text-2xl mb-2">{item.icon}</div>
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
                        <span className="text-2xl">🎯</span>
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
                    <div className="md:col-span-1 flex flex-col items-center gap-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <img 
                        src={draft.profile?.avatar || AVATAR_OPTIONS[0]} 
                        alt="Avatar" 
                        className="w-24 h-24 rounded-full border-4 border-indigo-200 p-1 object-cover bg-white"
                      />
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Choose Avatar</label>
                      <div className="flex gap-1.5">
                        {AVATAR_OPTIONS.map((av, idx) => (
                          <button
                            key={idx}
                            onClick={() => updateWizardDraft({
                              profile: { ...draft.profile!, avatar: av }
                            })}
                            className={`w-7 h-7 rounded-full overflow-hidden border-2 ${
                              draft.profile?.avatar === av ? "border-indigo-600 scale-110" : "border-transparent"
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
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-600 uppercase">Education / Degree</label>
                          <select
                            value={draft.profile?.education || "Bachelor"}
                            onChange={(e) => updateWizardDraft({
                              profile: { ...draft.profile!, education: e.target.value }
                            })}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white focus:border-indigo-600"
                          >
                            <option>Bachelor of Technology</option>
                            <option>Bachelor of Science</option>
                            <option>Bachelor of Arts</option>
                            <option>Master of Business Admin</option>
                            <option>High School</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-600 uppercase">Stream</label>
                          <select
                            value={draft.profile?.stream || "Arts"}
                            onChange={(e) => updateWizardDraft({
                              profile: { ...draft.profile!, stream: e.target.value }
                            })}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white focus:border-indigo-600"
                          >
                            <option>Science & Technology</option>
                            <option>Arts & Humanities</option>
                            <option>Commerce & Accounts</option>
                            <option>Medical & Health</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-600 uppercase">Target Exam City</label>
                          <input
                            type="text"
                            value={draft.profile?.city || ""}
                            onChange={(e) => updateWizardDraft({
                              profile: { ...draft.profile!, city: e.target.value }
                            })}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
                            placeholder="e.g. Delhi, Mumbai"
                          />
                          {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-600 uppercase">Occupation</label>
                          <select
                            value={draft.profile?.occupation || "Student"}
                            onChange={(e) => updateWizardDraft({
                              profile: { ...draft.profile!, occupation: e.target.value }
                            })}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white focus:border-indigo-600"
                          >
                            <option>Full-time Aspirant</option>
                            <option>Working Professional</option>
                            <option>College Student</option>
                          </select>
                        </div>
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
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  active 
                                    ? "bg-indigo-600 text-white border-indigo-600" 
                                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Preferred Learning Device</label>
                        <select
                          value={draft.lifestyle?.preferredDevice || "Laptop"}
                          onChange={(e) => updateWizardDraft({
                            lifestyle: { ...draft.lifestyle!, preferredDevice: e.target.value }
                          })}
                          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white focus:border-indigo-600"
                        >
                          <option>Laptop & Tablet</option>
                          <option>Desktop & Workstation</option>
                          <option>Mobile Smartphone only</option>
                          <option>Physical books/Printed notes</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Learning Environment</label>
                        <select
                          value={draft.lifestyle?.learningEnvironment || "Home"}
                          onChange={(e) => updateWizardDraft({
                            lifestyle: { ...draft.lifestyle!, learningEnvironment: e.target.value }
                          })}
                          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white focus:border-indigo-600"
                        >
                          <option>Home Study Room (Quiet)</option>
                          <option>Public Library / Study Cafe</option>
                          <option>College / University Lounge</option>
                          <option>Co-working Space / Commute</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Internet Access / Availability</label>
                        <select
                          value={draft.lifestyle?.internetAvailability || "High-speed"}
                          onChange={(e) => updateWizardDraft({
                            lifestyle: { ...draft.lifestyle!, internetAvailability: e.target.value }
                          })}
                          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white focus:border-indigo-600"
                        >
                          <option>High-speed Wi-Fi (Continuous)</option>
                          <option>Cellular Data / Limited access</option>
                          <option>Offline / Intermittent sync only</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-gray-700 block mb-2">Consistency Commits</label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Everyday", "Weekdays Only", "Weekends Intensive", "Skip Festivals/Holidays"].map((item) => {
                            const selected = draft.lifestyle?.consistency?.includes(item) || false;
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
                                className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                                  selected 
                                    ? "bg-indigo-50 border-indigo-600 text-indigo-800" 
                                    : "bg-white border-gray-200 hover:border-indigo-300"
                                }`}
                              >
                                {item}
                                {selected && <span className="text-xs text-indigo-600">✓</span>}
                              </button>
                            );
                          })}
                        </div>
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
                    <p className="text-xs text-gray-500 mb-4">Our study blueprint generator configures daily goals tailored to these learning formats.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: "Video lectures", icon: "🎥" },
                      { name: "Reading books", icon: "📚" },
                      { name: "Practice Questions", icon: "✏️" },
                      { name: "PYQs (Previous Years)", icon: "🗓️" },
                      { name: "Mock Tests", icon: "🏁" },
                      { name: "Flashcards", icon: "🗂️" },
                      { name: "Mind Maps", icon: "🗺️" },
                      { name: "AI Tutor sessions", icon: "🤖" },
                      { name: "Revision Notes", icon: "📝" },
                      { name: "Discussion Forums", icon: "👥" },
                      { name: "Live Classes", icon: "📡" }
                    ].map((pref) => {
                      const selected = draft.preferences?.includes(pref.name) || false;
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
                          <span className="text-2xl">{pref.icon}</span>
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
                  <div className="bg-indigo-600 text-white p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <span className="text-xs font-extrabold uppercase tracking-widest bg-indigo-500 px-3 py-1 rounded-full">
                        Success engine calibrated
                      </span>
                      <h4 className="text-2xl font-black">All Systems Ready!</h4>
                      <p className="text-indigo-100 text-xs max-w-md">Your dream of cracking the {draft.targetExam} is supported by a customized roadmap and daily active study hours.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-indigo-700/60 p-4 rounded-2xl border border-indigo-500/50">
                      <div className="text-center">
                        <span className="text-[10px] text-indigo-200 uppercase font-bold">Prediction Probability</span>
                        <p className="text-3xl font-black mt-1">{draft.timeline?.successPrediction || 65}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-extrabold text-gray-900 text-sm border-b border-gray-100 pb-2">Profile & Timeline</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-gray-500">FullName:</span> <span className="font-bold text-gray-800">{draft.profile?.fullName}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Target Exam:</span> <span className="font-bold text-gray-800">{draft.targetExam} ({draft.examCategory})</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Exam Date:</span> <span className="font-bold text-gray-800">{draft.timeline?.examDate}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Remaining Days:</span> <span className="font-bold text-gray-800">{draft.timeline?.remainingDays} Days</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Daily Study Hours:</span> <span className="font-bold text-indigo-600">{draft.timeline?.dailyStudyHours} Hours</span></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-extrabold text-gray-900 text-sm border-b border-gray-100 pb-2">Revision & Weak Subject gaps</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-gray-500">Study slots:</span> <span className="font-bold text-gray-800">{draft.lifestyle?.slots?.join(", ")}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Learning modes:</span> <span className="font-bold text-gray-800">{draft.preferences?.slice(0, 4).join(", ")}...</span></div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Weak Subjects flagged:</span>
                          <span className="font-bold text-red-500">
                            {draft.weaknesses?.filter((w) => w.weaknessScore > 60).map((w) => w.subject).join(", ") || "None"}
                          </span>
                        </div>
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
            className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <button
            onClick={handleNext}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            {currentStep === 7 ? "Launch success engine" : "Save & Continue"}{" "}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

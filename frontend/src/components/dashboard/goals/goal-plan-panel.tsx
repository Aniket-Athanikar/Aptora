"use client";

import React, { useState, useEffect } from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { GoalData, SubjectWeakness } from "@/types/goal.types";
import { useToast } from "@/lib/ToastContext";
import * as LucideIcons from "lucide-react";

const {
  Clock, AlertCircle, CheckCircle2, ChevronDown,
  Sun, Sunrise, Moon, Laptop, Smartphone, Monitor, BookOpenCheck,
  FileText, Building, Atom, Activity, Settings, TrendingUp, Target,
  Brain, Compass, Sparkles
} = LucideIcons;

const EXAMS_LIST = [
  { name: "UPSC CSE", icon: "FileText", desc: "Civil Services Examination" },
  { name: "State PSC (UPPSC/BPSC/MPSC)", icon: "Building", desc: "Provincial Civil Services" },
  { name: "JEE Main & Advanced", icon: "Atom", desc: "Joint Entrance Examination" },
  { name: "NEET UG", icon: "Activity", desc: "Medical Entrance Exam" },
  { name: "GATE Exam", icon: "Settings", desc: "Graduate Aptitude Test in Engineering" },
  { name: "CAT (Common Admission Test)", icon: "TrendingUp", desc: "Management Aptitude Test" },
  { name: "Custom Target Exam", icon: "Target", desc: "Custom Syllabus Blueprint" }
];

const PRESET_SUBJECTS: Record<string, string[]> = {
  "UPSC CSE": ["Polity & Governance", "History & Culture", "Geography", "Economy", "Environment & Ecology", "International Relations", "Science & Technology", "CSAT (Aptitude)"],
  "State PSC (UPPSC/BPSC/MPSC)": ["General Studies", "State Specific GK", "Current Affairs", "Aptitude & Mental Ability"],
  "JEE Main & Advanced": ["Physics (Mechanics/Electrodynamics)", "Chemistry (Organic/Inorganic/Physical)", "Mathematics (Calculus/Algebra/Coordinate)"],
  "NEET UG": ["Biology (Botany/Zoology)", "Physics (General & Modern)", "Chemistry (Organic & Physical)"],
  "GATE Exam": ["Engineering Mathematics", "Core Technical Syllabus", "General Aptitude"],
  "CAT (Common Admission Test)": ["Quantitative Aptitude (QA)", "Data Interpretation & Logical Reasoning (DILR)", "Verbal Ability & Reading Comprehension (VARC)"],
  "Custom Target Exam": ["General Knowledge", "Analytical Ability", "Specialized Subject Area"]
};

interface GoalPlanPanelProps {
  onLaunchWizard?: () => void;
}

export function GoalPlanPanel({ onLaunchWizard }: GoalPlanPanelProps) {
  const { activeGoal, history, completeWizard, startWizard } = useGoalEngine();
  const { toast } = useToast();

  const [targetExam, setTargetExam] = useState<string>("UPSC CSE");
  const [fullName, setFullName] = useState<string>("Student");
  const [age, setAge] = useState<number>(22);
  const [examDate, setExamDate] = useState<string>("2026-06-07");
  const [dailyHours, setDailyHours] = useState<number>(8);
  const [preferredSlot, setPreferredSlot] = useState<string>("Morning (6 AM - 12 PM)");
  const [primaryDevice, setPrimaryDevice] = useState<string>("Laptop & Tablet");
  const [studyEnv, setStudyEnv] = useState<string>("Quiet Study Room");
  const [internet, setInternet] = useState<string>("Always Connected (High Speed WiFi)");
  const [modes, setModes] = useState<string[]>(["Flashcards", "Practice Loops"]);
  const [weaknesses, setWeaknesses] = useState<SubjectWeakness[]>([]);

  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [slotDropdownOpen, setSlotDropdownOpen] = useState(false);
  const [deviceDropdownOpen, setDeviceDropdownOpen] = useState(false);

  useEffect(() => {
    const defaultGoal = activeGoal || (history && history.length > 0 ? history[0].goalData : null);
    if (defaultGoal) {
      setTargetExam(defaultGoal.targetExam);
      setFullName(defaultGoal.profile.fullName);
      setAge(defaultGoal.profile.age);
      setExamDate(defaultGoal.timeline.examDate);
      setDailyHours(defaultGoal.timeline.dailyStudyHours);

      const primarySlot = defaultGoal.lifestyle.slots[0] || "Morning";
      setPreferredSlot(
        primarySlot === "Morning"
          ? "Morning (6 AM - 12 PM)"
          : primarySlot === "Afternoon"
          ? "Afternoon (12 PM - 5 PM)"
          : "Late Night (10 PM - 3 AM)"
      );

      setPrimaryDevice(defaultGoal.lifestyle.preferredDevice || "Laptop & Tablet");
      setStudyEnv(defaultGoal.lifestyle.learningEnvironment || "Quiet Study Room");
      setInternet(defaultGoal.lifestyle.internetAvailability || "Always Connected (High Speed WiFi)");
      setModes(defaultGoal.preferences || ["Flashcards", "Practice Loops"]);
      setWeaknesses(defaultGoal.weaknesses);
    } else {
      setTargetExam("UPSC CSE");
      setFullName("Aspirant");
      setAge(23);
      setExamDate("2026-06-07");
      setDailyHours(7);
      setPreferredSlot("Morning (6 AM - 12 PM)");
      setWeaknesses(
        PRESET_SUBJECTS["UPSC CSE"].map((subj) => ({
          subject: subj,
          confidence: 3,
          difficulty: "Medium",
          weaknessScore: 40,
          priority: "Medium",
          aiRecommendation: `Reinforce study loops for ${subj}`
        }))
      );
    }
  }, [activeGoal, history]);

  const handleExamChange = (newExam: string) => {
    setTargetExam(newExam);
    const presets = PRESET_SUBJECTS[newExam] || ["General Knowledge", "Analytical Ability"];
    setWeaknesses(
      presets.map((subj) => ({
        subject: subj,
        confidence: 3,
        difficulty: "Medium",
        weaknessScore: 40,
        priority: "Medium",
        aiRecommendation: `Reinforce study loops for ${subj}`
      }))
    );
    toast(`Exam set to ${newExam}. Loaded default syllabus subjects.`, "info");
  };

  const calculateDaysRemaining = () => {
    const today = new Date();
    const target = new Date(examDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 0 : Math.max(0, diffDays);
  };

  const calculateSuccessPrediction = () => {
    const hoursFactor = Math.min(100, (dailyHours / 12) * 50);
    const confidenceAvg = weaknesses.length > 0
      ? (weaknesses.reduce((acc, w) => acc + w.confidence, 0) / weaknesses.length) * 10
      : 50;
    const dateFactor = Math.min(100, (calculateDaysRemaining() / 365) * 50);

    return Math.min(99, Math.round(hoursFactor + confidenceAvg * 0.6 + dateFactor * 0.4));
  };

  const handleConfidenceChange = (index: number, val: number) => {
    const updated = [...weaknesses];
    updated[index].confidence = val;
    updated[index].priority = val <= 2 ? "High" : val === 3 ? "Medium" : "Low";
    updated[index].weaknessScore = 100 - val * 20;
    setWeaknesses(updated);
  };

  const handleToggleMode = (mode: string) => {
    if (modes.includes(mode)) {
      setModes(modes.filter((m) => m !== mode));
    } else {
      setModes([...modes, mode]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const remainingDays = calculateDaysRemaining();
    const successPrediction = calculateSuccessPrediction();

    const newGoal: GoalData = {
      id: activeGoal?.id || `goal_${Date.now()}`,
      targetExam,
      examCategory: activeGoal?.examCategory || "General",
      profile: {
        fullName,
        avatar: "",
        education: activeGoal?.profile.education || "Undergraduate",
        stream: activeGoal?.profile.stream || "General",
        city: activeGoal?.profile.city || "New Delhi",
        occupation: activeGoal?.profile.occupation || "Student",
        age: Number(age),
        syllabusPercent: activeGoal?.profile.syllabusPercent || 0,
        currentConfidence: activeGoal?.profile.currentConfidence || 3
      },
      timeline: {
        examDate,
        dailyStudyHours: Number(dailyHours),
        burnoutRisk: Number(dailyHours) >= 11 ? "High" : Number(dailyHours) >= 8 ? "Moderate" : "Low",
        difficulty: "Hard",
        successPrediction,
        remainingDays
      },
      lifestyle: {
        slots: [preferredSlot.includes("Morning") ? "Morning" : preferredSlot.includes("Afternoon") ? "Afternoon" : "Night"],
        dailyHours: Number(dailyHours),
        preferredDevice: primaryDevice,
        learningEnvironment: studyEnv,
        internetAvailability: internet,
        consistency: activeGoal?.lifestyle.consistency || ["Daily Tracker"]
      },
      preferences: modes,
      weaknesses: weaknesses.map((w) => ({
        ...w,
        difficulty: w.difficulty || "Medium",
        weaknessScore: w.weaknessScore || (100 - w.confidence * 20),
        aiRecommendation: w.aiRecommendation || `Reinforce study loops for ${w.subject}`
      })),
      createdAt: activeGoal?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    completeWizard(newGoal, `Configured calibrations via goal settings panel`);
    toast("Success Goal Calibrated Successfully!", "success");
  };

  const getSlotIcon = (slot: string) => {
    if (slot.includes("Morning")) return <Sun className="w-4 h-4 text-amber-500" />;
    if (slot.includes("Afternoon")) return <Sunrise className="w-4 h-4 text-orange-500" />;
    return <Moon className="w-4 h-4 text-emerald-600" />;
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes("Phone")) return <Smartphone className="w-4 h-4 text-emerald-500" />;
    if (device.includes("Laptop")) return <Laptop className="w-4 h-4 text-emerald-600" />;
    if (device.includes("Desktop")) return <Monitor className="w-4 h-4 text-blue-500" />;
    return <BookOpenCheck className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-7 max-w-5xl mx-auto pb-12 text-slate-800 relative z-10">
      
      {/* Header Banner - AI Library Style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-purple-500/15 p-6 sm:p-8 text-slate-900 border border-amber-200/60 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300/60 text-[11px] font-black uppercase tracking-widest shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              AI Goal Calibrator
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              Success Goal <span className="text-emerald-700">Calibration Panel</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-700 font-medium max-w-xl">
              {activeGoal
                ? "View, select, and recalibrate your active exam preparation goals. Tailor your schedule, targets, and study metrics."
                : "Establish your custom success model by tailoring your schedule, targets, and study metrics."}
            </p>
          </div>

          <button
            type="button"
            onClick={onLaunchWizard || startWizard}
            className="self-start md:self-center h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-emerald-600/25 active:scale-98 cursor-pointer shrink-0"
          >
            <span>Launch Guided Wizard</span>
            <Compass className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Main Form Split */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Settings Columns */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card 1: Exam & Basics */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-emerald-600" /> Target Exam & Basics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 pl-1">Target Exam</label>
                <button
                  type="button"
                  onClick={() => setExamDropdownOpen(!examDropdownOpen)}
                  className="w-full bg-slate-50/80 border border-slate-200/80 text-slate-800 text-xs rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {(() => {
                      const iconName = EXAMS_LIST.find((e) => e.name === targetExam)?.icon || "Target";
                      const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName] || Target;
                      return <Icon className="w-4 h-4 text-emerald-600" />;
                    })()}
                    <span>{targetExam}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${examDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {examDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setExamDropdownOpen(false)} />
                    <div className="absolute left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 space-y-0.5 max-h-[220px] overflow-y-auto">
                      {EXAMS_LIST.map((exam) => (
                        <button
                          key={exam.name}
                          type="button"
                          onClick={() => {
                            handleExamChange(exam.name);
                            setExamDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                            targetExam === exam.name ? "bg-emerald-50 text-emerald-800 font-extrabold" : "text-slate-600"
                          }`}
                        >
                          {(() => {
                            const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[exam.icon] || Target;
                            return <Icon className="w-4 h-4 text-slate-450" />;
                          })()}
                          <div>
                            <p className="text-[11px] font-bold leading-tight">{exam.name}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{exam.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 pl-1">Your Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-50/80 border border-slate-200/80 text-slate-800 text-xs rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 pl-1">Age</label>
                <input
                  type="number"
                  min={16}
                  max={40}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50/80 border border-slate-200/80 text-slate-800 text-xs rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 pl-1">Exam Target Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                  className="w-full bg-slate-50/80 border border-slate-200/80 text-slate-800 text-xs rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Daily Timeline & Study Slots */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-emerald-600" /> Daily Timeline & Study Slots
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Daily Study Commitment</label>
                  <span className="text-xs font-black text-emerald-700">{dailyHours} Hours / day</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-semibold pl-1">Recommended: 6-10 hours for competitive exams like UPSC.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 pl-1">Preferred Study Slot</label>
                  <button
                    type="button"
                    onClick={() => setSlotDropdownOpen(!slotDropdownOpen)}
                    className="w-full bg-slate-50/80 border border-slate-200/80 text-slate-800 text-xs rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {getSlotIcon(preferredSlot)}
                      <span>{preferredSlot}</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  {slotDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSlotDropdownOpen(false)} />
                      <div className="absolute left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 space-y-0.5">
                        {["Morning (6 AM - 12 PM)", "Afternoon (12 PM - 5 PM)", "Late Night (10 PM - 3 AM)"].map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setPreferredSlot(slot);
                              setSlotDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 transition-colors text-xs font-bold cursor-pointer ${
                              preferredSlot === slot ? "bg-emerald-50 text-emerald-800 font-extrabold" : "text-slate-600"
                            }`}
                          >
                            {getSlotIcon(slot)}
                            <span>{slot}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 pl-1">Primary Study Device</label>
                  <button
                    type="button"
                    onClick={() => setDeviceDropdownOpen(!deviceDropdownOpen)}
                    className="w-full bg-slate-50/80 border border-slate-200/80 text-slate-800 text-xs rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {getDeviceIcon(primaryDevice)}
                      <span>{primaryDevice}</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  {deviceDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDeviceDropdownOpen(false)} />
                      <div className="absolute left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 space-y-0.5">
                        {["Laptop & Tablet", "Smart Phone only", "Desktop Computer", "Paper & Books only"].map((device) => (
                          <button
                            key={device}
                            type="button"
                            onClick={() => {
                              setPrimaryDevice(device);
                              setDeviceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 transition-colors text-xs font-bold cursor-pointer ${
                              primaryDevice === device ? "bg-emerald-50 text-emerald-800 font-extrabold" : "text-slate-600"
                            }`}
                          >
                            {getDeviceIcon(device)}
                            <span>{device}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Syllabus Subject Confidence */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Brain className="w-4.5 h-4.5 text-emerald-600" /> Syllabus Subject Confidence
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold pl-1">Rate your confidence (1 = Weak, 5 = Mastered). Priorities are adjusted dynamically.</p>

            <div className="space-y-3">
              {weaknesses.map((item, index) => (
                <div key={item.subject} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-800">{item.subject}</span>
                    <span className={`text-[9px] font-black uppercase tracking-wider block px-2 py-0.5 rounded-full w-max mt-0.5 ${
                      item.priority === "High"
                        ? "bg-rose-50 text-rose-600 border border-rose-100"
                        : item.priority === "Medium"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}>
                      {item.priority} Priority
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleConfidenceChange(index, star)}
                        className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          item.confidence >= star
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-emerald-350"
                        }`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-755 text-white font-black text-xs py-3.5 px-6 rounded-2xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer text-center uppercase tracking-wider"
            >
              Save Calibration
            </button>
          </div>

        </div>

        {/* Dynamic Sidebar Predictions */}
        <div className="space-y-6">

          {/* Projections Card - Crisp Light Gradient */}
          <div className="bg-gradient-to-br from-white via-emerald-50/60 to-amber-50/40 text-slate-900 rounded-3xl p-6 shadow-xs relative overflow-hidden border border-emerald-100/90 space-y-5">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest pb-2 border-b border-emerald-100/60">
              Goal Engine Projections
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">SUCCESS PREDICTION</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-slate-900">{calculateSuccessPrediction()}%</span>
                  <span className="text-xs text-emerald-600 font-bold">Accuracy</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200/50">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 transition-all duration-500 rounded-full"
                    style={{ width: `${calculateSuccessPrediction()}%` }}
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">REMAINING TIMELINE</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900">{calculateDaysRemaining()} Days</span>
                  <span className="text-[10px] text-slate-500 font-bold">until exam</span>
                </div>
              </div>

              {dailyHours >= 12 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-rose-800">Burnout Warning Triggered</span>
                    <p className="text-[9px] text-rose-600 font-medium leading-relaxed">Studying {dailyHours}h daily compromises retention. Limit study to &lt; 12 hours.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Study Modes Selection */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 pl-1">
              Active Study Modes
            </h3>

            <div className="space-y-2">
              {["Flashcards", "Practice Loops", "Mock Exams", "PYQ Retrieval"].map((mode) => {
                const isActive = modes.includes(mode);
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleToggleMode(mode)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-50/60 border-emerald-500 text-emerald-800 font-extrabold shadow-3xs"
                        : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:border-emerald-350"
                    }`}
                  >
                    <span>{mode}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isActive ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300"
                    }`}>
                      {isActive && <CheckCircle2 className="w-2.5 h-2.5" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}

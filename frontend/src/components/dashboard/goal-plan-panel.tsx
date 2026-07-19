import React, { useState, useEffect } from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { GoalData, SubjectWeakness } from "@/types/goal.types";
import * as LucideIcons from "lucide-react";

const {
  Flame, Clock, BookOpen, AlertCircle, CheckCircle, ChevronDown,
  Sun, Sunrise, Moon, Laptop, Smartphone, Monitor, BookOpenCheck,
  FileText, Building, Atom, Activity, Settings, TrendingUp, Target
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

const PRESET_EXAMS = EXAMS_LIST.map(e => e.name);

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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Local state representing the goal form fields
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

  // Dropdown UI state variables
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [slotDropdownOpen, setSlotDropdownOpen] = useState(false);
  const [deviceDropdownOpen, setDeviceDropdownOpen] = useState(false);

  // Hydrate local state when activeGoal is loaded or changes
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
      // Setup defaults for building a new goal
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
  }, [activeGoal]);

  // Adjust weaknesses list automatically when target exam changes (if not editing an already saved custom goal)
  const handleExamChange = (newExam: string) => {
    setTargetExam(newExam);
    const presets = PRESET_SUBJECTS[newExam] || ["General Studies", "Quantitative Aptitude"];
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
  };

  // Compute stats on the fly
  const calculateDaysRemaining = () => {
    const today = new Date("2026-07-14"); // Simulated base date
    const target = new Date(examDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 0 : Math.max(0, diffDays);
  };

  const calculateSuccessPrediction = () => {
    // Basic dynamic prediction logic
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
    // Set priority based on confidence: 1-2 -> High priority, 3 -> Medium, 4-5 -> Low
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
        avatar: activeGoal?.profile.avatar || "Felix",
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
    setSuccessMsg("Success Goal Calibrated Successfully!");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const getSlotIcon = (slot: string) => {
    if (slot.includes("Morning")) return <Sun className="w-4 h-4 text-amber-500" />;
    if (slot.includes("Afternoon")) return <Sunrise className="w-4 h-4 text-orange-500" />;
    return <Moon className="w-4 h-4 text-indigo-400" />;
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes("Phone")) return <Smartphone className="w-4 h-4 text-emerald-500" />;
    if (device.includes("Laptop")) return <Laptop className="w-4 h-4 text-indigo-500" />;
    if (device.includes("Desktop")) return <Monitor className="w-4 h-4 text-blue-500" />;
    return <BookOpenCheck className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Top Welcome Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          Success Goal <span className="gradient-text">Configuration</span>
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">
          {activeGoal
            ? "View, select, and recalibrate your exam preparation settings directly."
            : "Establish your custom success model by tailoring your schedule, targets, and study metrics."}
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{successMsg}</span>
        </div>
      )}

      {/* Main Form Split */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Settings Columns */}
        <div className="md:col-span-2 space-y-6">

          {/* Card 1: Exam & Basics */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-indigo-600" /> Target Exam & Basics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Target Exam</label>
                <button
                  type="button"
                  onClick={() => setExamDropdownOpen(!examDropdownOpen)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {(() => {
                      const iconName = EXAMS_LIST.find((e) => e.name === targetExam)?.icon || "Target";
                      const Icon = (LucideIcons as any)[iconName] || Target;
                      return <Icon className="w-4 h-4 text-indigo-550" />;
                    })()}
                    <span>{targetExam}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${examDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {examDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setExamDropdownOpen(false)} />
                    <div className="absolute left-0 mt-1 w-full bg-white border border-gray-150 rounded-2xl shadow-xl p-2 z-50 space-y-0.5 max-h-[220px] overflow-y-auto">
                      {EXAMS_LIST.map((exam) => (
                        <button
                          key={exam.name}
                          type="button"
                          onClick={() => {
                            handleExamChange(exam.name);
                            setExamDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-indigo-50/50 transition-colors cursor-pointer ${
                            targetExam === exam.name ? "bg-indigo-50 text-indigo-600 font-bold" : "text-gray-700"
                          }`}
                        >
                          {(() => {
                            const Icon = (LucideIcons as any)[exam.icon] || Target;
                            return <Icon className="w-4 h-4 text-slate-450" />;
                          })()}
                          <div>
                            <p className="text-[11px] font-bold leading-tight">{exam.name}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">{exam.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Your Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Age</label>
                <input
                  type="number"
                  min={16}
                  max={40}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  required
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Exam Target Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Timeline & Schedule */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Daily Timeline & Study Slots
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Daily Study Commitment</label>
                  <span className="text-xs font-black text-indigo-600">{dailyHours} Hours / day</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <p className="text-[10px] text-gray-400 mt-1 font-medium">Recommended: 6-10 hours for competitive exams like UPSC.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Preferred Study Slot</label>
                  <button
                    type="button"
                    onClick={() => setSlotDropdownOpen(!slotDropdownOpen)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {getSlotIcon(preferredSlot)}
                      <span>{preferredSlot}</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {slotDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSlotDropdownOpen(false)} />
                      <div className="absolute left-0 mt-1 w-full bg-white border border-gray-150 rounded-2xl shadow-xl p-2 z-50 space-y-0.5">
                        {["Morning (6 AM - 12 PM)", "Afternoon (12 PM - 5 PM)", "Late Night (10 PM - 3 AM)"].map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setPreferredSlot(slot);
                              setSlotDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-indigo-50/50 transition-colors text-xs font-bold cursor-pointer ${
                              preferredSlot === slot ? "bg-indigo-50 text-indigo-600" : "text-gray-700"
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
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Primary Study Device</label>
                  <button
                    type="button"
                    onClick={() => setDeviceDropdownOpen(!deviceDropdownOpen)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {getDeviceIcon(primaryDevice)}
                      <span>{primaryDevice}</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {deviceDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDeviceDropdownOpen(false)} />
                      <div className="absolute left-0 mt-1 w-full bg-white border border-gray-150 rounded-2xl shadow-xl p-2 z-50 space-y-0.5">
                        {["Laptop & Tablet", "Smart Phone only", "Desktop Computer", "Paper & Books only"].map((device) => (
                          <button
                            key={device}
                            type="button"
                            onClick={() => {
                              setPrimaryDevice(device);
                              setDeviceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-indigo-50/50 transition-colors text-xs font-bold cursor-pointer ${
                              primaryDevice === device ? "bg-indigo-50 text-indigo-600" : "text-gray-700"
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

          {/* Card 3: Subjects Gap Audit */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" /> Syllabus Subject Confidence
            </h2>
            <p className="text-[10px] text-gray-400 font-semibold">Rate your confidence (1 = Weak, 5 = Mastered). Priorities are adjusted dynamically.</p>

            <div className="space-y-3.5">
              {weaknesses.map((item, index) => (
                <div key={item.subject} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-800">{item.subject}</span>
                    <span className={`text-[9px] font-bold block px-1.5 py-0.5 rounded-full w-max ${
                      item.priority === "High"
                        ? "bg-red-50 text-red-600"
                        : item.priority === "Medium"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {item.priority} Priority
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleConfidenceChange(index, star)}
                        className={`w-6 h-6 rounded-lg text-xs font-black transition-all ${
                          item.confidence >= star
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white border border-gray-200 text-gray-400 hover:border-gray-300"
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
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-2xl transition-all shadow-md shadow-indigo-150"
            >
              Save Calibration
            </button>

            <button
              type="button"
              onClick={onLaunchWizard || startWizard}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 font-bold text-xs py-3 px-6 rounded-2xl transition-all"
            >
              Launch Interactive Wizard
            </button>
          </div>

        </div>

        {/* Dynamic Sidebar Predictions */}
        <div className="space-y-6">

          {/* Card: Projections */}
          <div className="bg-gradient-to-br from-gray-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">Goal Engine Projections</h3>

            <div className="space-y-5">
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold">SUCCESS PREDICTION</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-white">{calculateSuccessPrediction()}%</span>
                  <span className="text-xs text-indigo-400 font-bold">Accuracy</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${calculateSuccessPrediction()}%` }}
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 block font-semibold">REMAINING PREPARATION TIMELINE</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-white">{calculateDaysRemaining()} Days</span>
                  <span className="text-[10px] text-gray-400 font-bold">until exam</span>
                </div>
              </div>

              {dailyHours >= 12 && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-red-200">Burnout Warning Triggered</span>
                    <p className="text-[9px] text-red-300 font-medium leading-relaxed">Studying {dailyHours}h daily compromises retention. Limit study to &lt; 12 hours.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card: Study Modes selection */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Active Study Modes</h3>

            <div className="space-y-2.5">
              {["Flashcards", "Practice Loops", "Mock Exams", "PYQ Retrieval"].map((mode) => {
                const isActive = modes.includes(mode);
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleToggleMode(mode)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                      isActive
                        ? "bg-indigo-50/50 border-indigo-200 text-indigo-600"
                        : "bg-white border-gray-150 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{mode}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isActive ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"
                    }`}>
                      {isActive && <CheckCircle className="w-2.5 h-2.5" />}
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

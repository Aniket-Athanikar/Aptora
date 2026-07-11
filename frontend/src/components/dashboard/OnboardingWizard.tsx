"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Check, 
  Clock, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  GraduationCap, 
  Shield, 
  Globe, 
  Compass, 
  Landmark, 
  Activity, 
  Brain, 
  Settings, 
  PenTool,
  Star,
  Calendar,
  Award,
  Train
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "./DashboardContext";

export const OnboardingWizard: React.FC = () => {
  const {
    onboardingStep,
    setOnboardingStep,
    savingProfile,
    wizardData,
    setWizardData,
    getSelectedDaysVal,
    getPaceHours,
    getPaceSpeedDescription,
    handleFinishOnboarding
  } = useDashboard();

  const selectedDays = getSelectedDaysVal();
  const paceHours = getPaceHours();
  const paceSpeed = getPaceSpeedDescription();

  const stepsList = [
    "Target Exam",
    "Preparation Stage",
    "Goal Timeline",
    "Daily Study Time",
    "What do you expect?",
    "Weak Subjects",
    "Review & Confirm"
  ];

  const examsList = [
    { id: "UPSC", title: "UPSC", subtitle: "Civil Services Examination", icon: GraduationCap, colorClass: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    { id: "SSC CGL", title: "SSC CGL", subtitle: "Staff Selection Commission", icon: Shield, colorClass: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { id: "Banking", title: "Banking", subtitle: "IBPS, SBI, RBI & Others", icon: Landmark, colorClass: "bg-blue-50 text-blue-600 border-blue-100" },
    { id: "Railway", title: "Railway", subtitle: "RRB NTPC, Group D & Others", icon: Train, colorClass: "bg-rose-50 text-rose-600 border-rose-100" },
    { id: "State PSC", title: "State PSC", subtitle: "State Public Service Commissions", icon: Landmark, colorClass: "bg-orange-50 text-orange-600 border-orange-100" },
    { id: "NEET", title: "NEET", subtitle: "Medical Entrance Examination", icon: Activity, colorClass: "bg-teal-50 text-teal-600 border-teal-100" },
    { id: "JEE", title: "JEE", subtitle: "Engineering Entrance Examination", icon: Brain, colorClass: "bg-purple-50 text-purple-600 border-purple-100" },
    { id: "GATE", title: "GATE", subtitle: "Graduate Aptitude Test in Engineering", icon: Settings, colorClass: "bg-cyan-50 text-cyan-600 border-cyan-100" },
  ];

  const stagesList = [
    { id: "Beginner", label: "Beginner", desc: "Just started preparing, need to cover core concepts." },
    { id: "Intermediate", label: "Intermediate", desc: "Have covered basics, want to improve speed & accuracy." },
    { id: "Advanced", label: "Advanced", desc: "Ready for mock tests & intensive problem solving." },
    { id: "Retaker", label: "Retaker / Attempted", desc: "Re-attempting the exam, want to fix weak areas." }
  ];

  const timelinesList = [30, 60, 90, 180, 365];

  const studyTimesList = [
    { id: "1h", label: "1 Hour / Day", desc: "Steady Habitual Pace" },
    { id: "2h", label: "2 Hours / Day", desc: "Optimal Pace" },
    { id: "4h", label: "4 Hours / Day", desc: "Intensive Pace" },
    { id: "6h", label: "6 Hours / Day", desc: "Extreme Commitment" },
    { id: "8h+", label: "8+ Hours / Day", desc: "Ultra Intensive Mode" }
  ];

  const expectationsList = [
    { id: "Personalized Plan", title: "Personalized Study Plan", desc: "Weekly & Monthly Plan tailored to your timeline." },
    { id: "Smart Recommendations", title: "Smart Recommendations", desc: "AI suggested reference resources." },
    { id: "Mock Test Scheduler", title: "Mock Test Scheduler", desc: "Scheduled mock tests based on your pacing." },
    { id: "Progress Tracking", title: "Progress Tracking", desc: "Detailed performance analytics & insights." },
    { id: "AI Tutor Support", title: "AI Tutor Support", desc: "24/7 Doubt solving and concept clarification." }
  ];

  const defaultSubjects = [
    "Quantitative Aptitude",
    "Reasoning",
    "English",
    "General Awareness",
    "History",
    "Geography",
    "Polity",
    "Science"
  ];

  return (
    <div className="w-full h-full bg-[#FAFBFF] p-6 lg:p-10 flex flex-col overflow-y-auto">
      {/* Top Header Row (matches image design) */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 shrink-0 select-none">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            Let&apos;s personalize your learning journey <span className="animate-bounce">🚀</span>
          </h2>
          <p className="text-xs md:text-sm font-semibold text-neutral-400">
            Answer a few questions and we&apos;ll create the perfect plan for you.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3.5 select-none shrink-0 w-full sm:w-auto">
          <button className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-neutral-900 border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2 rounded-xl cursor-pointer transition-colors shadow-sm self-end">
            <HelpCircle className="w-4 h-4 text-neutral-500" />
            <span>Need help?</span>
          </button>

          <div className="space-y-1.5 w-full sm:w-60 text-right">
            <div className="flex justify-between text-[10px] font-black text-neutral-500 uppercase tracking-wider">
              <span>Step {onboardingStep} of 7</span>
              <span>{Math.round((onboardingStep / 7) * 100)}%</span>
            </div>
            <div className="w-full bg-neutral-200/60 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-600 animate-pulse" 
                initial={{ width: "0%" }}
                animate={{ width: `${(onboardingStep / 7) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Grid Content Column */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start flex-grow">
        {/* Step Wizard Container */}
        <div className="xl:col-span-2 bg-white border border-[#E9ECF8] rounded-[24px] shadow-[0_12px_40px_rgba(109,74,255,0.02)] p-6 md:p-8 flex flex-col justify-between min-h-[520px] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-neutral-50">
            <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${(onboardingStep / 7) * 100}%` }} />
          </div>

          {/* Steps Progress Row (Screenshot 2 design) */}
          <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-6 overflow-x-auto gap-2 select-none shrink-0">
            {stepsList.map((stepName, idx) => {
              const stepNum = idx + 1;
              const active = onboardingStep === stepNum;
              const completed = onboardingStep > stepNum;
              return (
                <div key={idx} className="flex items-center gap-2 shrink-0">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    active ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 scale-105" : 
                    completed ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-400"
                  )}>
                    {completed ? <Check className="w-3.5 h-3.5 stroke-[3.5]" /> : stepNum}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold hidden md:inline transition-colors",
                    active ? "text-indigo-600 font-extrabold" : completed ? "text-emerald-600" : "text-neutral-400"
                  )}>
                    {stepName}
                  </span>
                  {stepNum < 7 && <ChevronRight className="w-3.5 h-3.5 text-neutral-300 hidden md:block" />}
                </div>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="flex-grow flex flex-col justify-center min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={onboardingStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* STEP 1: TARGET EXAM */}
                {onboardingStep === 1 && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-neutral-900">1. Select your target exam</h3>
                      <p className="text-xs font-semibold text-neutral-400">Choose the exam you are preparing for</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {examsList.map((examItem) => {
                        const selected = wizardData.exam === examItem.id;
                        const IconComp = examItem.icon;
                        return (
                          <button
                            key={examItem.id}
                            onClick={() => setWizardData((prev) => ({ ...prev, exam: examItem.id }))}
                            className={cn(
                              "px-4 py-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.02] relative group h-20 w-full min-w-0 select-none overflow-hidden",
                              selected
                                ? "border-indigo-500 bg-indigo-50/20 shadow-sm"
                                : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/30"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className={cn(
                                "p-2.5 rounded-xl shrink-0 transition-colors border",
                                selected ? "bg-indigo-600 text-white border-indigo-600" : examItem.colorClass
                              )}>
                                <IconComp className="w-5 h-5" />
                              </div>
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <span className="block font-black text-neutral-900 text-sm truncate">{examItem.title}</span>
                                <span className="block text-[11px] text-neutral-400 font-semibold leading-snug truncate" title={examItem.subtitle}>
                                  {examItem.subtitle}
                                </span>
                              </div>
                            </div>
                            <div className={cn(
                              "w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                              selected ? "bg-indigo-600 border-indigo-600 text-white" : "border-neutral-300 bg-white"
                            )}>
                              {selected && <Check className="w-3.5 h-3.5 stroke-[3.5] text-white" />}
                            </div>
                          </button>
                        );
                      })}

                      {/* Custom Exam Card */}
                      <div className={cn(
                        "px-4 py-3.5 rounded-2xl border text-left flex flex-col justify-center gap-2.5 transition-all w-full select-none overflow-hidden",
                        wizardData.exam === "Other" ? "border-indigo-500 bg-indigo-50/20 min-h-20" : "border-neutral-200 bg-white h-20"
                      )}>
                        <button
                          onClick={() => setWizardData((prev) => ({ ...prev, exam: "Other" }))}
                          className="flex items-center justify-between w-full text-left bg-transparent border-0 cursor-pointer p-0"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={cn(
                              "p-2.5 rounded-xl shrink-0 border",
                              wizardData.exam === "Other" ? "bg-indigo-600 text-white border-indigo-600" : "bg-neutral-100 text-neutral-500 border-neutral-200"
                            )}>
                              <PenTool className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <span className="block font-black text-neutral-900 text-xs">Other Exam</span>
                              <span className="block text-[9px] text-neutral-400 font-semibold leading-snug truncate">Type your exam name</span>
                            </div>
                          </div>
                          <div className={cn(
                            "w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                            wizardData.exam === "Other" ? "bg-indigo-600 border-indigo-600 text-white" : "border-neutral-300 bg-white"
                          )}>
                            {wizardData.exam === "Other" && <Check className="w-3.5 h-3.5 stroke-[3.5] text-white" />}
                          </div>
                        </button>
                        {wizardData.exam === "Other" && (
                          <input
                            type="text"
                            value={wizardData.language.startsWith("Custom:") ? wizardData.language.replace("Custom:", "") : ""}
                            onChange={(e) => setWizardData((prev) => ({ ...prev, language: `Custom:${e.target.value}` }))}
                            placeholder="Enter custom exam name..."
                            className="w-full text-xs font-semibold px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white text-neutral-800"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: PREPARATION STAGE */}
                {onboardingStep === 2 && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-neutral-900">2. Select your preparation stage</h3>
                      <p className="text-xs font-semibold text-neutral-400">Choose the description that matches your current standing</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {stagesList.map((stage) => {
                        const selected = wizardData.knowledgeLevel === stage.id;
                        return (
                          <button
                            key={stage.id}
                            onClick={() => setWizardData((prev) => ({ ...prev, knowledgeLevel: stage.id }))}
                            className={cn(
                              "p-5 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] flex flex-col gap-2",
                              selected
                                ? "border-indigo-500 bg-indigo-50/20 shadow-sm"
                                : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50"
                            )}
                          >
                            <span className="block font-bold text-sm text-neutral-900">{stage.label}</span>
                            <span className="block text-xs text-neutral-500 font-medium leading-relaxed">{stage.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3: GOAL TIMELINE */}
                {onboardingStep === 3 && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-neutral-900">3. Select preparation timeline</h3>
                      <p className="text-xs font-semibold text-neutral-400">Specify the timeline you have until exam day</p>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {timelinesList.map((daysVal) => {
                        const selected = wizardData.targetDays === daysVal;
                        return (
                          <button
                            key={daysVal}
                            onClick={() => setWizardData((prev) => ({ ...prev, targetDays: daysVal }))}
                            className={cn(
                              "py-3.5 px-2 rounded-xl border font-bold text-xs md:text-sm transition-all cursor-pointer",
                              selected
                                ? "border-indigo-500 bg-indigo-50/20 text-indigo-600"
                                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                            )}
                          >
                            {daysVal} Days
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setWizardData((prev) => ({ ...prev, targetDays: -1 }))}
                        className={cn(
                          "py-3.5 px-2 rounded-xl border font-bold text-xs md:text-sm transition-all cursor-pointer",
                          wizardData.targetDays === -1 ? "border-indigo-500 bg-indigo-50/20 text-indigo-600" : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                        )}
                      >
                        Custom
                      </button>
                    </div>

                    {wizardData.targetDays === -1 && (
                      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 max-w-sm shrink-0">
                        <label className="block text-xs font-extrabold text-neutral-700 mb-1.5">Enter Target Days</label>
                        <input
                          type="number"
                          min="7"
                          max="730"
                          value={wizardData.customTargetDays || ""}
                          onChange={(e) => setWizardData((prev) => ({ ...prev, customTargetDays: parseInt(e.target.value) || undefined }))}
                          placeholder="e.g., 45"
                          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white text-neutral-800 font-semibold"
                        />
                      </div>
                    )}

                    <div className="p-5 bg-indigo-50/20 rounded-2xl border border-indigo-100 space-y-4">
                      <h3 className="font-extrabold text-neutral-900 text-xs flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-indigo-600" /> Target Pace Analytics
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Timeline</span>
                          <span className="text-base font-extrabold text-neutral-800">{selectedDays} Days Remaining</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Required Pace</span>
                          <span className="text-base font-extrabold text-neutral-800">{paceHours} Hours/Day</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Speed Profile</span>
                          <span className="text-xs font-bold text-indigo-600 block mt-1">{paceSpeed}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: DAILY STUDY TIME */}
                {onboardingStep === 4 && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-neutral-900">4. Set daily study commitment</h3>
                      <p className="text-xs font-semibold text-neutral-400">Choose how many hours you can dedicate per day</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {studyTimesList.map((timeItem) => {
                        const selected = wizardData.dailyAvailability === timeItem.id;
                        return (
                          <button
                            key={timeItem.id}
                            onClick={() => setWizardData((prev) => ({ ...prev, dailyAvailability: timeItem.id }))}
                            className={cn(
                              "p-4 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] flex flex-col gap-1.5",
                              selected ? "border-indigo-500 bg-indigo-50/20 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50"
                            )}
                          >
                            <span className="block font-bold text-sm text-neutral-900">{timeItem.label}</span>
                            <span className="block text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">{timeItem.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 5: WHAT DO YOU EXPECT? */}
                {onboardingStep === 5 && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-neutral-900">5. What do you expect from ExamForge AI?</h3>
                      <p className="text-xs font-semibold text-neutral-400">Select all features you want to focus on (multi-select)</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {expectationsList.map((expectItem) => {
                        const selected = wizardData.learningStyles.includes(expectItem.id);
                        return (
                          <div
                            key={expectItem.id}
                            onClick={() => {
                              setWizardData((prev) => ({
                                ...prev,
                                learningStyles: selected
                                  ? prev.learningStyles.filter((x) => x !== expectItem.id)
                                  : [...prev.learningStyles, expectItem.id],
                              }));
                            }}
                            className={cn(
                              "p-4 rounded-xl border text-left cursor-pointer transition-all hover:bg-neutral-50/30 flex justify-between items-start",
                              selected ? "border-indigo-500 bg-indigo-50/20 shadow-sm" : "border-neutral-200 bg-white"
                            )}
                          >
                            <div className="space-y-1 pr-4">
                              <span className="block font-bold text-neutral-900 text-sm">{expectItem.title}</span>
                              <span className="block text-[10px] text-neutral-500 font-medium leading-relaxed">{expectItem.desc}</span>
                            </div>
                            <div className={cn(
                              "w-5 h-5 rounded flex items-center justify-center border shrink-0 mt-0.5 transition-colors",
                              selected ? "bg-indigo-600 border-indigo-600 text-white" : "border-neutral-300 bg-white"
                            )}>
                              {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 6: WEAK SUBJECTS */}
                {onboardingStep === 6 && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-neutral-900">6. Identify your weak subjects</h3>
                      <p className="text-xs font-semibold text-neutral-400">Select topics you need focus on, and rate your confidence (1 = Weakest, 5 = Strongest)</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {defaultSubjects.map((subName) => {
                        const selected = wizardData.subjects.includes(subName);
                        return (
                          <button
                            key={subName}
                            onClick={() => {
                              setWizardData((prev) => {
                                const nextSubjects = selected ? prev.subjects.filter((x) => x !== subName) : [...prev.subjects, subName];
                                const nextWeaknesses = { ...prev.weaknesses };
                                if (!selected) {
                                  nextWeaknesses[subName] = 2;
                                } else {
                                  delete nextWeaknesses[subName];
                                }
                                return { ...prev, subjects: nextSubjects, weaknesses: nextWeaknesses };
                              });
                            }}
                            className={cn(
                              "p-3 rounded-lg border font-bold text-xs transition-all text-center cursor-pointer",
                              selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                            )}
                          >
                            {subName}
                          </button>
                        );
                      })}
                    </div>

                    {wizardData.subjects.length > 0 && (
                      <div className="space-y-3.5 pt-3 border-t border-neutral-100 max-h-[180px] overflow-y-auto pr-1.5">
                        <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">Confidence Level Matrix</span>
                        {wizardData.subjects.map((sub) => {
                          const rating = wizardData.weaknesses[sub] || 3;
                          return (
                            <div key={sub} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                              <span className="font-bold text-xs text-neutral-700">{sub}</span>
                              <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => {
                                      setWizardData((prev) => ({ ...prev, weaknesses: { ...prev.weaknesses, [sub]: star } }));
                                    }}
                                    className="focus:outline-none transition-transform active:scale-125 border-0 bg-transparent cursor-pointer p-0"
                                  >
                                    <Star className={cn("w-4.5 h-4.5 transition-colors", star <= rating ? "fill-yellow-400 text-yellow-400" : "text-neutral-300")} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 7: REVIEW & CONFIRM */}
                {onboardingStep === 7 && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-neutral-900">7. Review & Confirm your setup</h3>
                      <p className="text-xs font-semibold text-neutral-400">Verify your inputs. ExamForge AI will construct your workspace.</p>
                    </div>

                    {savingProfile ? (
                      <div className="text-center max-w-sm mx-auto space-y-5 py-8 shrink-0">
                        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse" />
                          <div className="absolute inset-0 rounded-full border-t-4 border-indigo-600 animate-spin" />
                          <Brain className="w-7 h-7 text-indigo-600 animate-pulse" />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="font-extrabold text-neutral-900 text-sm">ExamForge Engine Calibrating</h4>
                          <p className="text-[10px] text-neutral-400 font-medium">Generating study targets & personalized schedule sheets...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 font-bold text-xs space-y-3.5">
                          <span className="block text-[10px] text-indigo-600 uppercase tracking-wider">Metrics Snapshot</span>
                          <div className="space-y-2 text-[11px] font-semibold text-neutral-600">
                            <div className="flex justify-between">
                              <span>Selected Exam:</span>
                              <span className="font-bold text-neutral-900">
                                {wizardData.exam === "Other" ? (wizardData.language.replace("Custom:", "") || "Custom Exam") : wizardData.exam}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Preparation Stage:</span>
                              <span className="font-bold text-neutral-900">{wizardData.knowledgeLevel}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Target timeline:</span>
                              <span className="font-bold text-neutral-900">{selectedDays} Days</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Hours Commitment:</span>
                              <span className="font-bold text-neutral-900">{wizardData.dailyAvailability} / Day</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 font-bold text-xs space-y-3">
                          <span className="block text-[10px] text-indigo-600 uppercase tracking-wider">Prioritized Topics ({wizardData.subjects.length})</span>
                          <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
                            {wizardData.subjects.length > 0 ? (
                              wizardData.subjects.map((sub) => (
                                <span key={sub} className="px-2 py-1 bg-white border border-neutral-200 text-neutral-700 text-[10px] rounded">
                                  {sub}
                                </span>
                              ))
                            ) : (
                              <span className="text-neutral-400 font-medium text-[10px]">None chosen</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Action Footer Row */}
          <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-between shrink-0 select-none">
            {onboardingStep > 1 && !savingProfile ? (
              <button
                onClick={() => setOnboardingStep((p) => p - 1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors border-0 bg-transparent cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Step
              </button>
            ) : (
              <div />
            )}

            {onboardingStep < 7 ? (
              <button
                onClick={() => setOnboardingStep((p) => p + 1)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 border-0"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            ) : (
              !savingProfile && (
                <button
                  onClick={handleFinishOnboarding}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 border-0"
                >
                  <span>Generate My Plan & Enter Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>

        {/* Right Setup Summary Column Layout */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white border border-[#E9ECF8] rounded-[24px] shadow-[0_12px_40px_rgba(109,74,255,0.02)] p-6 space-y-5">
            <span className="text-xs font-extrabold text-neutral-900 border-b border-neutral-100 pb-3 block">Your Setup Summary</span>
            
            <div className="space-y-4">
              {[
                { label: "Target Exam", val: wizardData.exam === "Other" ? (wizardData.language.replace("Custom:", "") || "Custom Exam") : wizardData.exam, icon: GraduationCap },
                { label: "Preparation Stage", val: wizardData.knowledgeLevel, icon: Shield },
                { label: "Goal Timeline", val: `${selectedDays} Days`, icon: Calendar },
                { label: "Daily Study Time", val: `${wizardData.dailyAvailability} / Day`, icon: Clock },
                { label: "Expectations", val: wizardData.learningStyles.length > 0 ? `${wizardData.learningStyles.length} Selected` : "Not selected", icon: Sparkles },
                { label: "Weak Subjects", val: wizardData.subjects.length > 0 ? `${wizardData.subjects.length} Subjects` : "Not selected", icon: Brain }
              ].map((summaryPt, idx) => {
                const PtIcon = summaryPt.icon;
                const hasVal = summaryPt.val && !summaryPt.val.includes("Not selected");
                return (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      hasVal ? "bg-indigo-50 text-indigo-600" : "bg-neutral-100 text-neutral-400"
                    )}>
                      <PtIcon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-neutral-400 font-semibold">{summaryPt.label}</span>
                      <span className={cn(
                        "block text-xs font-bold",
                        hasVal ? "text-neutral-800" : "text-neutral-400 font-medium"
                      )}>
                        {summaryPt.val || "Not selected"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex gap-3 items-start select-none">
              <Sparkles className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h5 className="text-[11px] font-bold text-neutral-800">Why this is important?</h5>
                <p className="text-[10px] text-neutral-500 font-medium leading-relaxed">
                  Your answers help our AI create a personalized study plan, recommend resources, schedule mocks and track your progress effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Underneath Bottom Benefit Section (full horizontal boxes matching image) */}
      <div className="mt-8 bg-white border border-[#E9ECF8] rounded-[24px] shadow-[0_12px_40px_rgba(109,74,255,0.01)] p-6 space-y-4 shrink-0">
        <span className="text-xs font-extrabold text-neutral-800">What you&apos;ll get after setup</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { title: "Personalized Study Plan", desc: "Weekly & Monthly Plan", icon: Calendar, color: "bg-indigo-50 text-indigo-600" },
            { title: "Smart Recommendations", desc: "AI suggested resources", icon: Sparkles, color: "bg-amber-50 text-amber-600" },
            { title: "Mock Test Scheduler", desc: "Based on your timeline", icon: Clock, color: "bg-emerald-50 text-emerald-600" },
            { title: "Progress Tracking", desc: "Detailed performance insights", icon: Compass, color: "bg-blue-50 text-blue-600" },
            { title: "AI Tutor Support", desc: "24/7 Doubt Solving", icon: Brain, color: "bg-purple-50 text-purple-600" }
          ].map((feat, idx) => {
            const FIcon = feat.icon;
            return (
              <div key={idx} className="flex items-center gap-3 p-3 bg-[#FAFBFF] rounded-xl border border-neutral-200/60 hover:bg-neutral-50 transition-colors">
                <div className={cn("p-2 rounded-lg shrink-0", feat.color)}>
                  <FIcon className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-[11px] font-black text-neutral-800 leading-snug">{feat.title}</h5>
                  <span className="text-[9px] text-neutral-400 font-semibold block">{feat.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

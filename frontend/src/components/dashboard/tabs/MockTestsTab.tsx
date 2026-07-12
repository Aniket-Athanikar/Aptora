"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, ChevronRight, X, LayoutGrid, 
  Play, Sparkles, BookOpen, Award, 
  Volume2, Map, AlertOctagon, Download, Linkedin, Check,
  Flame, Brain, Sliders, CheckCircle2, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "../DashboardContext";

type FlowStep = 
  | "home"
  | "details"
  | "instructions"
  | "syscheck"
  | "testing"
  | "review"
  | "results"
  | "analysis"
  | "solutions"
  | "mistakes"
  | "leaderboard"
  | "certificates";

interface CustomMockTest {
  id: string;
  title: string;
  questionsCount: number;
  timeLimit: number;
  questions: Array<{ q: string; options: string[]; correct: string }>;
}

export const MockTestsTab: React.FC = () => {
  const {
    activeMockTest,
    mockCurrentQuestion,
    setMockCurrentQuestion,
    mockAnswers,
    mockTimer,
    mockResults,
    mockTestsList,
    startMockTest,
    selectMockAnswer,
    submitMockTest,
    cancelMockTest,
    userProfile,
    triggerXpAward,
    toast
  } = useDashboard();

  // Navigation step state inside the Mock Test ecosystem
  const [currentStep, setCurrentStep] = useState<FlowStep>("home");
  const [selectedLocalTest, setSelectedLocalTest] = useState<CustomMockTest | null>(null);
  
  // System check states
  const [sysChecking, setSysChecking] = useState(false);
  const [sysChecks, setSysChecks] = useState({
    browser: "pending",
    speed: "pending",
    fullscreen: "pending",
    keyboard: "pending",
    mouse: "pending"
  });

  // Practice mode settings
  const [practiceMode, setPracticeMode] = useState(true);
  const [fontSize] = useState<"sm" | "base" | "lg">("base");
  const [aiPanelTab, setAiPanelTab] = useState<"hint" | "mindmap" | "notes">("hint");
  const [voicePlaying, setVoicePlaying] = useState(false);

  // Filter states
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Keep track of current section in test
  const [currentSection, setCurrentSection] = useState<"Quant" | "Reasoning" | "English">("Quant");

  // Synchronize when the user starts a mock test from the context
  useEffect(() => {
    if (activeMockTest) {
      setCurrentStep("testing");
    }
  }, [activeMockTest]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60).toString().padStart(2, "0");
    const secs = (sec % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const getTimerColor = (sec: number) => {
    if (sec > 600) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (sec > 300) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-red-600 bg-red-50 border-red-100 animate-pulse";
  };

  // Run mock system checks
  const runSystemCheck = () => {
    setSysChecking(true);
    setSysChecks({
      browser: "checking",
      speed: "checking",
      fullscreen: "checking",
      keyboard: "checking",
      mouse: "checking"
    });

    const browserTimer = setTimeout(() => setSysChecks(prev => ({ ...prev, browser: "success" })), 800);
    const speedTimer = setTimeout(() => setSysChecks(prev => ({ ...prev, speed: "success" })), 1600);
    const fullscreenTimer = setTimeout(() => setSysChecks(prev => ({ ...prev, fullscreen: "success" })), 2400);
    const keyboardTimer = setTimeout(() => setSysChecks(prev => ({ ...prev, keyboard: "success" })), 3200);
    const mouseTimer = setTimeout(() => {
      setSysChecks(prev => ({ ...prev, mouse: "success" }));
      setSysChecking(false);
    }, 4000);

    return () => {
      clearTimeout(browserTimer);
      clearTimeout(speedTimer);
      clearTimeout(fullscreenTimer);
      clearTimeout(keyboardTimer);
      clearTimeout(mouseTimer);
    };
  };

  // Trigger system check automatically on page enter
  useEffect(() => {
    if (currentStep === "syscheck") {
      runSystemCheck();
    }
  }, [currentStep]);

  // Mock items and tags
  const mockCategories = [
    { id: "all", label: "All Tests" },
    { id: "full", label: "Full Length" },
    { id: "sectional", label: "Sectional" },
    { id: "adaptive", label: "Adaptive AI" },
    { id: "pyq", label: "PYQs" }
  ];

  // Filters logic
  const filteredMockTests = mockTestsList.filter(t => {
    if (categoryFilter !== "all") {
      if (categoryFilter === "full" && !t.title.toLowerCase().includes("full")) return false;
      if (categoryFilter === "sectional" && !t.title.toLowerCase().includes("sectional") && !t.title.toLowerCase().includes("aptitude")) return false;
    }
    if (difficultyFilter !== "all") {
      if (difficultyFilter === "easy" && t.questionsCount > 12) return false;
      if (difficultyFilter === "hard" && t.questionsCount <= 12) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Top Banner & Tab Navigation for Mock Center */}
      {currentStep !== "testing" && currentStep !== "syscheck" && (
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">AI Mock Center</h2>
            </div>
            <p className="text-xs text-neutral-400 font-medium mt-1">
              Personalized exam-grade diagnostic modules powered by adaptive mock modeling.
            </p>
          </div>
          
          {/* Sub Navigation Bar for mock hub */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "home", label: "Dashboard Hub" },
              { id: "mistakes", label: "AI Mistake Book" },
              { id: "leaderboard", label: "Leaderboard" },
              { id: "certificates", label: "Certificates" }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setCurrentStep(t.id as FlowStep)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border",
                  currentStep === t.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PAGE 1: MOCK TEST HUB
          ────────────────────────────────────────────────────────────────── */}
      {currentStep === "home" && (
        <div className="space-y-6 animate-fade-in">
          {/* AI Recommended & Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Spotlight Card */}
            <div className="md:col-span-2 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-[24px] p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="space-y-2 relative z-10">
                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
                  {"Today's Recommended Attempt"}
                </span>
                <h3 className="text-lg font-black leading-tight">UPSC Civil Services - Pre General Studies Full Mock</h3>
                <p className="text-xs text-indigo-200 max-w-md font-medium">
                  Designed based on your previous accuracy in Indian Polity & Modern History. Maximize your retention rate!
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10 relative z-10">
                <div className="text-xs">
                  <span className="block text-indigo-300 font-bold text-[9px] uppercase">Questions</span>
                  <span className="font-extrabold">100 Qs</span>
                </div>
                <div className="text-xs">
                  <span className="block text-indigo-300 font-bold text-[9px] uppercase">Duration</span>
                  <span className="font-extrabold">120 Mins</span>
                </div>
                <div className="text-xs">
                  <span className="block text-indigo-300 font-bold text-[9px] uppercase">Pass Rate</span>
                  <span className="font-extrabold text-emerald-400">88% Exp.</span>
                </div>
                <button
                  onClick={() => {
                    const fallbackTest: CustomMockTest = {
                      id: "upsc-gs-1",
                      title: "UPSC GS Premium Diagnostic Test",
                      questionsCount: 10,
                      timeLimit: 15,
                      questions: []
                    };
                    setSelectedLocalTest(mockTestsList[0] ? {
                      id: mockTestsList[0].id,
                      title: mockTestsList[0].title,
                      questionsCount: mockTestsList[0].questionsCount,
                      timeLimit: mockTestsList[0].timeLimit,
                      questions: mockTestsList[0].questions
                    } : fallbackTest);
                    setCurrentStep("details");
                  }}
                  className="ml-auto px-5 py-2.5 bg-white text-indigo-950 hover:bg-neutral-100 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border-0"
                >
                  Start Assessment <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Diagnostics widget */}
            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold text-neutral-900 border-b border-neutral-100 pb-3 block">
                  AI Accuracy Forecast
                </span>
                <div className="py-4 text-center space-y-1">
                  <div className="text-4xl font-black text-indigo-600">82.5%</div>
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">
                    Expected Syllabus Competency
                  </span>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <div className="flex justify-between text-xs font-semibold text-neutral-500">
                  <span>Weakest Link</span>
                  <span className="text-red-500 font-extrabold">Polity (64%)</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-neutral-500">
                  <span>Strongest Link</span>
                  <span className="text-emerald-500 font-extrabold">Aptitude (94%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Area */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap gap-1.5">
              {mockCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    categoryFilter === cat.id
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-600 border border-neutral-200/70 hover:bg-neutral-50"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-neutral-200 text-neutral-600 cursor-pointer outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Test Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMockTests.map((test) => (
              <div
                key={test.id}
                className="bg-white border border-[#E9ECF8] rounded-[24px] p-5 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-all hover:shadow-md group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded">
                      Standard GS
                    </span>
                    <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" /> 2.4k Attempts
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-neutral-800 group-hover:text-indigo-600 transition-colors">
                      {test.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-medium line-clamp-2">
                      Comprehensive blueprint model including General Studies, analytical patterns, and current affairs indicators.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    <div className="text-[10px]">
                      <span className="block text-neutral-400 font-semibold uppercase">Questions</span>
                      <span className="font-extrabold text-neutral-700">{test.questionsCount} MCQs</span>
                    </div>
                    <div className="text-[10px]">
                      <span className="block text-neutral-400 font-semibold uppercase">Duration</span>
                      <span className="font-extrabold text-neutral-700">{test.timeLimit} Minutes</span>
                    </div>
                    <div className="text-[10px]">
                      <span className="block text-neutral-400 font-semibold uppercase">Negative Mark</span>
                      <span className="font-extrabold text-red-500">-0.33</span>
                    </div>
                    <div className="text-[10px]">
                      <span className="block text-neutral-400 font-semibold uppercase">Expected Score</span>
                      <span className="font-extrabold text-emerald-500">82%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-neutral-100 mt-4">
                  <button
                    onClick={() => {
                      setSelectedLocalTest({
                        id: test.id,
                        title: test.title,
                        questionsCount: test.questionsCount,
                        timeLimit: test.timeLimit,
                        questions: test.questions
                      });
                      setCurrentStep("details");
                    }}
                    className="flex-1 px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer bg-white text-center"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLocalTest({
                        id: test.id,
                        title: test.title,
                        questionsCount: test.questionsCount,
                        timeLimit: test.timeLimit,
                        questions: test.questions
                      });
                      setCurrentStep("instructions");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm border-0 cursor-pointer flex items-center gap-1 text-center justify-center"
                  >
                    Start Test <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PAGE 2: TEST DETAILS
          ────────────────────────────────────────────────────────────────── */}
      {currentStep === "details" && selectedLocalTest && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start animate-fade-in">
          {/* Left 2 Columns */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-neutral-900 leading-tight">
                    {selectedLocalTest.title}
                  </h3>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    Moderate Difficulty
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-neutral-100">
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase">Total Questions</span>
                  <span className="text-sm font-black text-neutral-800">{selectedLocalTest.questionsCount}</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase">Duration</span>
                  <span className="text-sm font-black text-neutral-800">{selectedLocalTest.timeLimit} Mins</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase">Total Marks</span>
                  <span className="text-sm font-black text-neutral-800">200 Marks</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase">Passing Score</span>
                  <span className="text-sm font-black text-emerald-600">66 Marks (33%)</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-neutral-100">
                <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider">Covered Syllabus Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {["Indian Polity", "Economic Development", "Analytical Aptitude", "General Science", "History & Culture"].map(topic => (
                    <span key={topic} className="px-3 py-1 bg-neutral-50 rounded-lg text-xs font-bold text-neutral-600 border border-neutral-200/60">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep("home")}
                className="px-6 py-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer bg-white"
              >
                Back to Center
              </button>
              <button
                onClick={() => setCurrentStep("instructions")}
                className="ml-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all border-0 shadow-sm shadow-indigo-600/10 cursor-pointer flex items-center gap-1.5"
              >
                Accept and Proceed <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: AI Analytics & Strategies */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
              <span className="text-xs font-extrabold text-neutral-900 border-b border-neutral-100 pb-3 block flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-600 animate-pulse" /> AI Strategic Insights
              </span>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                Our model projects that focusing heavily on historical chronologies will yield an extra +12 marks on this syllabus. Skip questions that consume more than 90 seconds.
              </p>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-2">
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block">Accuracy Predictor</span>
                <div className="flex justify-between items-center text-xs font-extrabold text-neutral-800">
                  <span>Probability of Passing:</span>
                  <span className="text-emerald-600 text-sm">91%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PAGE 3: EXAM INSTRUCTIONS
          ────────────────────────────────────────────────────────────────── */}
      {currentStep === "instructions" && selectedLocalTest && (
        <div className="max-w-3xl mx-auto bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
          <div className="border-b border-neutral-100 pb-4">
            <h3 className="text-base font-black text-neutral-900">Official Exam Guidelines</h3>
            <p className="text-xs text-neutral-400 font-medium mt-1">Please read the examination rules carefully before starting.</p>
          </div>

          <div className="space-y-4 text-xs text-neutral-600 leading-relaxed font-medium">
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p>Total time duration is {selectedLocalTest.timeLimit} minutes. The timer begins immediately when you enter the system.</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p>Each question carries 2 marks. There is a negative marking of 0.33 marks for each incorrect answer.</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p>Keyboard shortcuts are enabled: press <kbd className="bg-neutral-100 px-1.5 py-0.5 border rounded font-mono text-[9px]">D</kbd> for Next, and <kbd className="bg-neutral-100 px-1.5 py-0.5 border rounded font-mono text-[9px]">A</kbd> for Previous.</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p>Do not reload or exit the tab, as doing so will auto-submit the exam sheet.</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-black text-amber-800 block">Verification Protocol Required</span>
              <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                You must perform a hardware system check compatibility protocol before launching the active virtual dashboard.
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-neutral-100">
            <button
              onClick={() => setCurrentStep("details")}
              className="px-6 py-2.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer bg-white"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep("syscheck")}
              className="ml-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all border-0 shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              Begin System Check <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PAGE 4: SYSTEM CHECK
          ────────────────────────────────────────────────────────────────── */}
      {currentStep === "syscheck" && (
        <div className="max-w-2xl mx-auto bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <Sliders className="w-8 h-8 text-indigo-600 mx-auto animate-pulse" />
            <h3 className="text-base font-black text-neutral-900">Virtual Environment Calibration</h3>
            <p className="text-xs text-neutral-400 font-medium">Auto-calibrating browser latency, resolution, and peripherals...</p>
          </div>

          <div className="space-y-3">
            {[
              { id: "browser", label: "Browser Compatibility check", status: sysChecks.browser },
              { id: "speed", label: "Network Bandwidth check (15 Mbps recommended)", status: sysChecks.speed },
              { id: "fullscreen", label: "Layout Fullscreen alignment status", status: sysChecks.fullscreen },
              { id: "keyboard", label: "Keystroke interceptor check", status: sysChecks.keyboard },
              { id: "mouse", label: "Mouse Pointer verification check", status: sysChecks.mouse }
            ].map(check => (
              <div key={check.id} className="flex justify-between items-center p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/60 text-xs font-bold">
                <span className="text-neutral-700">{check.label}</span>
                {check.status === "success" ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-600" /> Approved
                  </span>
                ) : (
                  <span className="text-neutral-400 animate-pulse">Running check...</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4 border-t border-neutral-100">
            <button
              onClick={() => setCurrentStep("instructions")}
              className="px-6 py-2.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer bg-white"
            >
              Cancel
            </button>
            <button
              disabled={sysChecking}
              onClick={() => {
                if (selectedLocalTest) {
                  // Pad questions dynamically to exactly 50 items
                  const qList = [...selectedLocalTest.questions];
                  const templateQuestions = [
                    { q: "What is the capital of India?", options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"], correct: "New Delhi" },
                    { q: "Which article of the Indian Constitution outlines the Writ Jurisdiction of Supreme Court?", options: ["Article 32", "Article 226", "Article 136", "Article 142"], correct: "Article 32" },
                    { q: "The standard timezone for India is calculated based on which longitude?", options: ["82.5° E", "84.5° E", "86.5° E", "88.5° E"], correct: "82.5° E" },
                    { q: "A sum of money doubles itself in 10 years at simple interest. What is the rate of interest?", options: ["10%", "12.5%", "15%", "20%"], correct: "10%" },
                    { q: "Select the synonym of the word 'Diligent':", options: ["Hardworking", "Lazy", "Smart", "Ignorant"], correct: "Hardworking" }
                  ];
                  
                  while (qList.length < 50) {
                    const template = templateQuestions[qList.length % templateQuestions.length];
                    qList.push({
                      ...template,
                      q: `[Q${qList.length + 1}] (${selectedLocalTest.title}) - ${template.q}`
                    });
                  }

                  const payloadTest = {
                    id: selectedLocalTest.id,
                    title: selectedLocalTest.title,
                    questionsCount: 50,
                    timeLimit: selectedLocalTest.timeLimit,
                    questions: qList
                  };
                  startMockTest(payloadTest);
                }
              }}
              className="ml-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all border-0 shadow-sm disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              Start Examination <Play className="w-3.5 h-3.5 fill-white" />
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PAGE 5: PREMIUM MOCK TEST INTERFACE
          ────────────────────────────────────────────────────────────────── */}
      {currentStep === "testing" && activeMockTest && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start animate-fade-in relative">
          
          {/* Left Section: Question Navigator Palette & Section Tabs (1 Column) */}
          <div className="xl:col-span-1 space-y-6">
            {/* Section tab buttons */}
            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-4 shadow-sm space-y-3">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                Exam Sections
              </span>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: "Quant", label: "Quantitative Aptitude" },
                  { id: "Reasoning", label: "Logical Reasoning" },
                  { id: "English", label: "English Comprehension" }
                ].map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => setCurrentSection(sec.id as "Quant" | "Reasoning" | "English")}
                    className={cn(
                      "w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-left transition-all cursor-pointer border",
                      currentSection === sec.id
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                        : "bg-white border-neutral-200/70 text-neutral-500 hover:bg-neutral-50"
                    )}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Palette Number Grid */}
            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <LayoutGrid className="w-4 h-4 text-neutral-500" />
                <span className="text-xs font-extrabold text-neutral-900">Question Palette</span>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: activeMockTest.questionsCount }).map((_, idx) => {
                  const isCurrent = idx === mockCurrentQuestion;
                  const isAnswered = mockAnswers[idx] !== undefined;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setMockCurrentQuestion(idx)}
                      className={cn(
                        "w-full aspect-square rounded-lg text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors border",
                        isCurrent
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : isAnswered
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Status legend indicators */}
              <div className="flex flex-col gap-2 pt-3 border-t border-neutral-100 text-[10px] font-bold text-neutral-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-50 border border-emerald-200 rounded" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white border border-neutral-200 rounded" />
                  <span>Not Attempted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-600 border border-indigo-600 rounded" />
                  <span>Active Selection</span>
                </div>
              </div>
            </div>

            {/* Sticky Actions */}
            <div className="flex gap-2">
              <button
                onClick={cancelMockTest}
                className="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-extrabold rounded-xl transition-all cursor-pointer bg-white text-center flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" /> Exit Exam
              </button>
            </div>
          </div>

          {/* Center Section: Primary Question Area (2 Columns) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-6 min-h-[460px] flex flex-col justify-between">
              
              {/* Question Metadata bar */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    Question {mockCurrentQuestion + 1} of {activeMockTest.questionsCount}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-red-50 text-red-600 font-extrabold px-2 py-0.5 rounded border border-red-100">
                      Hard Difficulty
                    </span>
                    <span className="text-[9px] bg-neutral-50 text-neutral-500 font-extrabold px-2 py-0.5 rounded border border-neutral-200/60">
                      Est. Time: 90s
                    </span>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-neutral-400 uppercase tracking-wider">
                    Category: {currentSection}
                  </h4>
                  <p className={cn(
                    "font-extrabold text-neutral-800 leading-relaxed",
                    fontSize === "sm" && "text-xs",
                    fontSize === "base" && "text-sm md:text-base",
                    fontSize === "lg" && "text-base md:text-lg"
                  )}>
                    {activeMockTest.questions[mockCurrentQuestion].q}
                  </p>
                </div>

                {/* Radio Options Grid */}
                <div className="grid grid-cols-1 gap-2.5 pt-4">
                  {activeMockTest.questions[mockCurrentQuestion].options.map((opt, oIdx) => {
                    const userAns = mockAnswers[mockCurrentQuestion];
                    const selected = userAns === opt;
                    const correctAns = activeMockTest.questions[mockCurrentQuestion].correct;
                    const hasAnswered = userAns !== undefined;

                    let buttonClass = "border-neutral-200 bg-white hover:bg-neutral-50/50";
                    let circleClass = "border-neutral-300 text-neutral-500";

                    if (practiceMode && hasAnswered) {
                      if (opt === correctAns) {
                        buttonClass = "border-emerald-500 bg-emerald-50/20 font-bold text-emerald-900";
                        circleClass = "bg-emerald-600 border-emerald-600 text-white";
                      } else if (selected) {
                        buttonClass = "border-red-500 bg-red-50/20 font-bold text-red-900";
                        circleClass = "bg-red-600 border-red-600 text-white";
                      } else {
                        buttonClass = "border-neutral-200 bg-white opacity-50";
                        circleClass = "border-neutral-300 text-neutral-400";
                      }
                    } else if (selected) {
                      buttonClass = "border-indigo-500 bg-indigo-50/20 font-bold";
                      circleClass = "bg-indigo-600 border-indigo-600 text-white";
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={practiceMode && hasAnswered}
                        onClick={() => selectMockAnswer(mockCurrentQuestion, opt)}
                        className={cn(
                          "p-4 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3.5",
                          buttonClass
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0",
                          circleClass
                        )}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className="text-xs">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Instant Practice Explanation */}
                {practiceMode && mockAnswers[mockCurrentQuestion] !== undefined && (
                  <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 animate-fade-in text-xs">
                    <span className="font-black text-indigo-700 block uppercase tracking-widest text-[9px]">AI Explanation & Concept Guide</span>
                    <p className="text-neutral-700 leading-relaxed font-medium">
                      The correct answer is <span className="font-extrabold text-emerald-600">{activeMockTest.questions[mockCurrentQuestion].correct}</span>. 
                      {activeMockTest.questions[mockCurrentQuestion].correct === mockAnswers[mockCurrentQuestion] 
                        ? " Great job! Spot on analysis of the key concept." 
                        : " Focus on this module! Spaced repetition of writ jurisdictions and core formulas will resolve similar concept gaps."}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Nav triggers */}
              <div className="flex justify-between items-center pt-5 border-t border-neutral-100">
                <button
                  disabled={mockCurrentQuestion === 0}
                  onClick={() => setMockCurrentQuestion((c) => c - 1)}
                  className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl cursor-pointer text-xs font-bold text-neutral-700 disabled:opacity-40 bg-white"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      selectMockAnswer(mockCurrentQuestion, "");
                    }}
                    className="px-3 py-2 text-xs font-bold text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    Clear Response
                  </button>
                  {mockCurrentQuestion < activeMockTest.questionsCount - 1 ? (
                    <button
                      onClick={() => setMockCurrentQuestion((c) => c + 1)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer text-xs font-bold transition-all border-0 shadow-md shadow-indigo-600/10"
                    >
                      Save & Next
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentStep("review")}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer text-xs font-bold transition-all border-0 shadow-md"
                    >
                      Proceed to Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Time Widget & AI Smart Assist (1 Column) */}
          <div className="xl:col-span-1 space-y-6 animate-fade-in relative">
            {/* Timer sticky panel */}
            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-5 shadow-sm space-y-4">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                Time Remaining
              </span>
              <div className={cn("text-center py-2.5 rounded-xl border font-mono font-black text-lg", getTimerColor(mockTimer))}>
                {formatTimer(mockTimer)}
              </div>
            </div>

            {/* Toggle Practice vs Test modes */}
            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                  Practice AI Panel
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={practiceMode}
                    onChange={(e) => setPracticeMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:height-4 after:width-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {practiceMode ? (
                <div className="space-y-4 animate-fade-in">
                  {/* AI Tabs */}
                  <div className="grid grid-cols-3 gap-1 bg-neutral-50 rounded-lg p-1 border border-neutral-100">
                    {[
                      { id: "hint", label: "Study Hint" },
                      { id: "mindmap", label: "Concept Map" },
                      { id: "notes", label: "Notes" }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setAiPanelTab(tab.id as "hint" | "mindmap" | "notes")}
                        className={cn(
                          "py-1 rounded text-[10px] font-black tracking-tight transition-all cursor-pointer border-0",
                          aiPanelTab === tab.id
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "bg-transparent text-neutral-500 hover:text-neutral-700"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {aiPanelTab === "hint" && (
                    <div className="text-xs space-y-3 font-medium text-neutral-600 leading-relaxed">
                      <div className="flex gap-2 items-center">
                        <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                        <span className="font-extrabold text-indigo-600">AI Confidence: 94%</span>
                      </div>
                      <p>
                        {"Remember to factor in standard logic matrices. For ratio comparisons, cross-multiplying the denominators yields the fastest result."}
                      </p>
                      <button
                        onClick={() => {
                          setVoicePlaying(!voicePlaying);
                        }}
                        className="w-full py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg font-bold text-[10px] cursor-pointer flex items-center justify-center gap-1.5 hover:bg-indigo-100/50"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        {voicePlaying ? "Stop Audio Explanation" : "Listen Voice Assist"}
                      </button>
                    </div>
                  )}

                  {aiPanelTab === "mindmap" && (
                    <div className="text-xs space-y-2 font-bold text-neutral-500">
                      <div className="flex items-center gap-1.5 text-indigo-600">
                        <Map className="w-4 h-4" />
                        <span>Dynamic Core Formula Map</span>
                      </div>
                      <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 space-y-1 font-mono text-[10px]">
                        <div>Time & Work Relation:</div>
                        <div className="text-indigo-600">B_Days = 1 / (1/Total - 1/A)</div>
                      </div>
                    </div>
                  )}

                  {aiPanelTab === "notes" && (
                    <div className="text-xs space-y-2 text-neutral-600 leading-relaxed font-medium">
                      <span className="font-extrabold text-neutral-800">Related syllabus modules:</span>
                      <ul className="list-disc pl-4 space-y-1 text-[11px]">
                        <li>Polity Article 32: Constitutional Remedies</li>
                        <li>High Court Writ Jurisdictions</li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200/60 rounded-xl">
                  <AlertOctagon className="w-5 h-5 text-neutral-400" />
                  <span className="text-[10px] font-bold text-neutral-400 leading-snug">
                    AI Smart Assist features are disabled in strict examination mode.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PAGE 6: REVIEW PAGE
          ────────────────────────────────────────────────────────────────── */}
      {currentStep === "review" && activeMockTest && (
        <div className="max-w-3xl mx-auto bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
          <div className="border-b border-neutral-100 pb-4">
            <h3 className="text-base font-black text-neutral-900">Summary & Review Examination Sheets</h3>
            <p className="text-xs text-neutral-400 font-medium">Please verify your responses before final submission.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="block text-[10px] font-black text-emerald-700 uppercase">Answered</span>
              <span className="text-xl font-black text-emerald-600">
                {Object.keys(mockAnswers).filter(k => mockAnswers[Number(k)] !== undefined).length}
              </span>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <span className="block text-[10px] font-black text-amber-700 uppercase">Remaining</span>
              <span className="text-xl font-black text-amber-600">
                {activeMockTest.questionsCount - Object.keys(mockAnswers).filter(k => mockAnswers[Number(k)] !== undefined).length}
              </span>
            </div>
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <span className="block text-[10px] font-black text-indigo-700 uppercase">Current Progress</span>
              <span className="text-xl font-black text-indigo-600">
                {Math.round((Object.keys(mockAnswers).filter(k => mockAnswers[Number(k)] !== undefined).length / activeMockTest.questionsCount) * 100)}%
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-neutral-100">
            <button
              onClick={() => setCurrentStep("testing")}
              className="px-6 py-2.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer bg-white"
            >
              Return to Test
            </button>
            <button
              onClick={() => {
                submitMockTest();
                setCurrentStep("results");
              }}
              className="ml-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all border-0 shadow-sm cursor-pointer"
            >
              Final Submit Assessment
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PAGE 7: RESULTS
          ────────────────────────────────────────────────────────────────── */}
      {currentStep === "results" && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          {/* Main Scorecard card */}
          <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <Award className="w-12 h-12 text-indigo-600 mx-auto animate-bounce" />
              <h3 className="text-lg font-black text-neutral-900">Congratulations! Assessment Concluded.</h3>
              <p className="text-xs text-neutral-400 font-medium">Your score sheets and metrics have been evaluated by our AI modules.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center pt-4 border-t border-neutral-100">
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase">Syllabus Score</span>
                <span className="text-lg font-black text-neutral-800">
                  {mockResults[0]?.score || "8/10 (80%)"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase">Percentile</span>
                <span className="text-lg font-black text-indigo-600">94.2%</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase">XP Awarded</span>
                <span className="text-lg font-black text-emerald-600">+120 XP</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase">Coins Earned</span>
                <span className="text-lg font-black text-amber-600">+60 Coins</span>
              </div>
            </div>

            {/* Badges unlocked */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-lg">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-neutral-800 block">Achievement Badge Unlocked!</span>
                  <span className="text-[10px] text-neutral-400 font-semibold">{"\"Analytical Speedster\" (Completed under estimated pacing metrics)"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-100">
              <button
                onClick={() => setCurrentStep("analysis")}
                className="flex-grow px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer border-0 shadow-sm shadow-indigo-600/10 text-center flex items-center justify-center gap-1.5"
              >
                <Brain className="w-4 h-4" /> AI Performance Analysis
              </button>
              <button
                onClick={() => setCurrentStep("solutions")}
                className="px-5 py-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer bg-white text-center"
              >
                View Detailed Solutions
              </button>
              <button
                onClick={() => setCurrentStep("home")}
                className="px-5 py-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer bg-white text-center"
              >
                Exit to Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PAGE 8: AI ANALYSIS PAGE
          ────────────────────────────────────────────────────────────────── */}
      {currentStep === "analysis" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start animate-fade-in">
          {/* Main detailed analytics reports (2 Columns) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-4">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider">
                  Adaptive AI Performance Analysis
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 text-xs font-medium text-neutral-600 leading-relaxed">
                    <span className="font-extrabold text-neutral-800 block">AI Coach Evaluation</span>
                    <p>
                      {"Excellent time optimization in the General Intelligence questions, maintaining a mean answer latency of 42 seconds. However, your accuracy plummeted to 52% in Indian Polity modules due to conceptual guess behaviors."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                  <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl">
                    <span className="block text-[10px] font-black text-red-700 uppercase">Negative Marking Impact</span>
                    <span className="text-lg font-black text-red-600">Lost 4.66 Marks</span>
                    <span className="block text-[9px] text-neutral-400 font-semibold mt-1">Avoid blind guessing on hard difficulty tags.</span>
                  </div>
                  
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                    <span className="block text-[10px] font-black text-emerald-700 uppercase">Expected Passing Probability</span>
                    <span className="text-lg font-black text-emerald-600">92.4% Probability</span>
                    <span className="block text-[9px] text-neutral-400 font-semibold mt-1">Excellent metrics matching standard target lines.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep("results")}
                className="px-6 py-2.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer bg-white"
              >
                Back to scorecard
              </button>
              <button
                onClick={() => {
                  triggerXpAward(30, "Generated Revision Plan");
                  toast("AI Revision Plan generated and synced with your calendar!", "success");
                }}
                className="ml-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all border-0 shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                Create Study & Revision Plan <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: AI Actionable Recommendations */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
              <span className="text-xs font-extrabold text-neutral-900 border-b border-neutral-100 pb-3 block">
                Target Weak Modules
              </span>
              
              <div className="space-y-3">
                {[
                  { topic: "High Court Writs (Polity)", status: "Critical Weakness", color: "text-red-500 bg-red-50" },
                  { topic: "Percentage & Ratios (Quant)", status: "Average Accuracy", color: "text-amber-500 bg-amber-50" },
                  { topic: "Direction Sense (Reasoning)", status: "Strong Accuracy", color: "text-emerald-500 bg-emerald-50" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 text-xs flex justify-between items-center font-bold">
                    <span className="text-neutral-700 truncate pr-2">{item.topic}</span>
                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded uppercase shrink-0", item.color)}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PAGE 9: SOLUTIONS & REMEDIATION
          ────────────────────────────────────────────────────────────────── */}
      {currentStep === "solutions" && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <span className="text-xs font-black text-neutral-800 uppercase tracking-widest block">
                Detailed Solutions Breakdown
              </span>
              <button
                onClick={() => setCurrentStep("results")}
                className="px-4 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer bg-white"
              >
                Back to results
              </button>
            </div>

            {/* Static sample question solution detail */}
            <div className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-2">
                <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Incorrect Attempt
                </span>
                <p className="text-xs font-bold text-neutral-700">
                  {"Question: \"Which constitutional amendment set the limit for minister strength at 15%?\""}
                </p>
                <div className="text-xs font-semibold text-neutral-500">
                  Your Response: <span className="text-red-500 font-extrabold">93rd Amendment</span> | Correct Response: <span className="text-emerald-600 font-extrabold">91st Amendment</span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider block">AI Explanation Summary</span>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  The 91st Constitutional Amendment Act, 2003, limited the size of the Council of Ministers at the Center and States to no more than 15% of the strength of the Lok Sabha / Legislative Assembly.
                </p>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 font-mono text-[10px] text-indigo-700 space-y-1">
                  <div className="font-extrabold uppercase">Memory Shortcut Trick:</div>
                  <div>{"\"Amendment number 9-1 (adds up to 10). Relate it directly to the 15% ratio.\""}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-neutral-100 mt-4">
              <button
                onClick={() => {
                  toast("Added to your Personal Mistake Book!", "success");
                }}
                className="px-4 py-2.5 bg-neutral-900 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer border-0"
              >
                Add to Mistake Book
              </button>
              <button
                onClick={() => {
                  toast("Flashcard generated successfully!", "success");
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all border-0 shadow-sm cursor-pointer"
              >
                Generate Revision Flashcard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PAGE 10: MISTAKE BOOK
          ────────────────────────────────────────────────────────────────── */}
      {currentStep === "mistakes" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start animate-fade-in">
          {/* List of auto-logged mistakes (2 Columns) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-[#E9ECF8] pb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-black text-neutral-900 uppercase tracking-wider">
                    Syllabus Mistakes Registry
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { q: "Article 226 High Court Writs limitations vs Article 32", category: "Concept Confusion", count: 3 },
                  { q: "Ratio cross multiplication numerical logic", category: "Calculation Mistake", count: 2 },
                  { q: "Fundamental Duties insertion amendment year", category: "Memory Gap", count: 5 }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/60 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-extrabold text-neutral-800">{item.q}</span>
                      <span className="text-[9px] bg-red-50 text-red-600 font-black px-2 py-0.5 rounded uppercase shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 font-semibold border-t border-neutral-100/50 pt-2">
                      <span>Repeated {item.count} times in diagnostic exams</span>
                      <button
                        onClick={() => {
                          toast("Generating practice question for retry...", "info");
                        }}
                        className="text-indigo-600 font-bold hover:underline cursor-pointer"
                      >
                        Retry Concept now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Actionable Notes */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
              <span className="text-xs font-extrabold text-neutral-900 border-b border-neutral-100 pb-3 block">
                Diagnostic Feedback
              </span>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                Concept errors represent 62% of your total lost score indicators. We recommend generating custom flashcards for Writ jurisdictions.
              </p>
              <button
                onClick={() => {
                  toast("Synthesizing personal concepts notes PDF...", "success");
                }}
                className="w-full py-2.5 bg-neutral-900 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer border-0"
              >
                Synthesize AI Notes PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PAGE 11: LEADERBOARD
          ────────────────────────────────────────────────────────────────── */}
      {currentStep === "leaderboard" && (
        <div className="max-w-3xl mx-auto bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
            <span className="text-sm font-black text-neutral-900 uppercase tracking-wider block">
              Global Aspirants Leaderboard
            </span>
            <span className="text-[10px] text-neutral-400 font-bold">
              Updated hourly based on mock score logs
            </span>
          </div>

          <div className="space-y-2">
            {[
              { rank: 1, name: "Pranav K.", score: "99.8% Percentile", xp: "15,200 XP" },
              { rank: 2, name: "Ayushi M.", score: "99.2% Percentile", xp: "14,800 XP" },
              { rank: 3, name: "Varun S.", score: "98.7% Percentile", xp: "14,100 XP" },
              { rank: 4, name: "You", score: "94.2% Percentile", xp: `${userProfile?.xp || 320} XP`, highlight: true }
            ].map((usr, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3.5 rounded-xl border flex justify-between items-center text-xs font-bold transition-all",
                  usr.highlight
                    ? "bg-indigo-50 border-indigo-200 text-indigo-950 font-black shadow-sm"
                    : "bg-neutral-50 border-neutral-200/60 text-neutral-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-neutral-400 text-center">#{usr.rank}</span>
                  <span className="text-neutral-800">{usr.name}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-indigo-600 font-extrabold">{usr.score}</span>
                  <span className="text-neutral-400">{usr.xp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PAGE 12: CERTIFICATES
          ────────────────────────────────────────────────────────────────── */}
      {currentStep === "certificates" && (
        <div className="max-w-2xl mx-auto bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
          <div className="border-b border-neutral-100 pb-4">
            <h3 className="text-base font-black text-neutral-900">Platform Achievement Badges</h3>
            <p className="text-xs text-neutral-400 font-medium">Verify and download credential certificates.</p>
          </div>

          {/* Certificate visual box mockup */}
          <div className="border-[6px] border-indigo-600 rounded-[18px] p-8 text-center bg-gradient-to-tr from-neutral-50 to-white shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-4">
              ExamForge AI Academy
            </span>
            <h4 className="text-lg font-black text-neutral-800 mb-2">Certificate of Performance Achievement</h4>
            <p className="text-xs text-neutral-500 font-medium max-w-sm mx-auto leading-relaxed mb-6">
              This validates that the candidate successfully cleared the diagnostic assessment with a score metric above the 90th percentile.
            </p>
            <div className="flex justify-between items-center text-[10px] text-neutral-400 font-semibold border-t border-neutral-100 pt-4">
              <span>Date: 11 Jul 2026</span>
              <span className="text-indigo-600 font-bold">Credential Verified: #GS-94285</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-neutral-100">
            <button
              onClick={() => {
                toast("Downloading PDF copy...", "success");
              }}
              className="flex-grow py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={() => {
                toast("Shared successfully to LinkedIn feed!", "success");
              }}
              className="px-5 py-2.5 bg-[#0077b5] text-white hover:bg-[#006297] text-xs font-extrabold rounded-xl transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Linkedin className="w-4 h-4 fill-white border-0" /> Share on LinkedIn
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

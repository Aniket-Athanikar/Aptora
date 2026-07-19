"use client";

import React from "react";
import { useStudySession } from "../hooks/useStudySession";
import { Play, Pause, RotateCcw, Coffee, BookOpen } from "lucide-react";

interface FocusTimerProps {
  defaultSubject?: string;
  defaultTaskId?: string;
}

export function FocusTimer({ defaultSubject, defaultTaskId }: FocusTimerProps) {
  const {
    secondsLeft,
    isRunning,
    mode,
    activeTaskSubject,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerDuration,
  } = useStudySession();

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const totalSeconds = mode === "focus" ? 25 * 60 : 5 * 60;
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  // Circular progress math (Radius=60, Circumference = 2 * PI * r = 377)
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="premium-card premium-card-hover rounded-3xl p-6 flex flex-col items-center justify-between min-h-[340px] text-center relative overflow-hidden group">
      {/* Background glass glows */}
      <div className={`absolute -right-16 -top-16 w-36 h-36 rounded-full blur-3xl opacity-10 transition-all duration-700 ${mode === "focus" ? "bg-indigo-600" : "bg-emerald-600"}`} />
      <div className={`absolute -left-16 -bottom-16 w-36 h-36 rounded-full blur-3xl opacity-10 transition-all duration-700 ${mode === "focus" ? "bg-violet-600" : "bg-teal-600"}`} />

      <div className="w-full flex items-center justify-between border-b border-gray-50 pb-4 mb-2 z-10">
        <div className="flex items-center gap-2">
          <BookOpen className={`w-4 h-4 transition-all ${mode === "focus" ? "text-indigo-600 animate-pulse" : "text-emerald-500 animate-pulse"}`} />
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">
            {mode === "focus" ? "Focus Interval" : "Short Recess"}
          </span>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${
          mode === "focus" ? "text-indigo-600 bg-indigo-50/50 border-indigo-100/50" : "text-emerald-600 bg-emerald-50/50 border-emerald-100/50"
        }`}>
          {activeTaskSubject || defaultSubject || "General study"}
        </span>
      </div>

      {/* Circular Progress Ring */}
      <div className="relative flex items-center justify-center my-6 z-10">
        <svg className="w-36 h-36 transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="text-gray-50"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke={mode === "focus" ? "url(#focusGradient)" : "url(#breakGradient)"}
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>

        {/* Central Timer String */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-gray-900 tracking-tighter font-mono leading-none">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            {isRunning ? "Running" : "Paused"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 z-10">
        <button
          onClick={() => setTimerDuration(25)}
          className={`text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border transition-all ${
            mode === "focus"
              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100"
              : "bg-gray-50 border-gray-150 text-gray-500 hover:text-indigo-600 hover:bg-white"
          }`}
        >
          25m Focus
        </button>
        <button
          onClick={() => setTimerDuration(5)}
          className={`text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border transition-all ${
            mode === "break"
              ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-100"
              : "bg-gray-50 border-gray-150 text-gray-500 hover:text-emerald-600 hover:bg-white"
          }`}
        >
          5m Break
        </button>
      </div>

      <div className="flex items-center gap-3.5 mt-6 z-10">
        <button
          onClick={resetTimer}
          className="p-3 text-gray-400 hover:text-gray-600 bg-gray-50 border border-gray-150 hover:bg-white rounded-2xl transition-all hover:scale-105"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        {isRunning ? (
          <button
            onClick={pauseTimer}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl flex items-center gap-2 text-xs font-bold shadow-md hover:scale-105 transition-all"
          >
            <Pause className="w-4 h-4" /> Pause Interval
          </button>
        ) : (
          <button
            onClick={() => startTimer(defaultSubject, defaultTaskId)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl flex items-center gap-2 text-xs font-bold shadow-md hover:scale-105 transition-all"
          >
            <Play className="w-4 h-4" /> Begin Focus
          </button>
        )}
      </div>
    </div>
  );
}

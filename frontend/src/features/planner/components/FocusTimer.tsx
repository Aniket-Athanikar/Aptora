"use client";

import React, { useState } from "react";
import { useFocusTimer2 } from "../hooks/useFocusTimer2";
import { FocusSettingsModal } from "./FocusSettingsModal";
import { FocusReEngagementModal } from "./FocusReEngagementModal";
import {
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Settings,
  Volume2,
  VolumeX,
  Sparkles,
  Coffee,
  CheckCircle,
  HelpCircle,
  Flame,
  ArrowRight,
  Headphones,
} from "lucide-react";

interface FocusTimerProps {
  defaultSubject?: string;
  defaultTaskId?: string;
}

export function FocusTimer({ defaultSubject, defaultTaskId }: FocusTimerProps) {
  const {
    activeSession,
    secondsLeft,
    isRunning,
    mode,
    progressPercent,
    preferences,
    awayModalState,
    setAwayModalState,
    completionCelebration,
    setCompletionCelebration,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerDuration,
    repeatSession,
    updatePreferences,
  } = useFocusTimer2(defaultSubject, defaultTaskId);

  const [showSettings, setShowSettings] = useState(false);
  const [showShortcutsTooltip, setShowShortcutsTooltip] = useState(false);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  // SVG Circular Math (Radius=60, Circumference=377)
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="premium-card premium-card-hover rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-between min-h-0 sm:min-h-[360px] text-center relative overflow-hidden group border border-slate-200/90 shadow-lg">
      {/* Background glass glows */}
      <div
        className={`absolute -right-16 -top-16 w-40 h-40 rounded-full blur-3xl opacity-15 transition-all duration-700 pointer-events-none ${
          mode === "focus" ? "bg-indigo-600" : "bg-emerald-600"
        }`}
      />
      <div
        className={`absolute -left-16 -bottom-16 w-40 h-40 rounded-full blur-3xl opacity-15 transition-all duration-700 pointer-events-none ${
          mode === "focus" ? "bg-violet-600" : "bg-teal-600"
        }`}
      />

      {/* Header Bar */}
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-2 z-10">
        <div className="flex items-center gap-2">
          <BookOpen
            className={`w-4 h-4 transition-all ${
              mode === "focus" ? "text-indigo-600 animate-pulse" : "text-emerald-500 animate-pulse"
            }`}
          />
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
            {mode === "focus" ? "Focus Interval 2.0" : "Short Recess"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${
              mode === "focus"
                ? "text-indigo-600 bg-indigo-50/60 border-indigo-100/60"
                : "text-emerald-600 bg-emerald-50/60 border-emerald-100/60"
            }`}
          >
            {activeSession.subject || defaultSubject || "General study"}
          </span>

          {/* Quick Settings Gear */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Focus Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Completion Celebration Overlay */}
      {completionCelebration ? (
        <div className="my-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-emerald-50 border border-indigo-200 z-20 w-full animate-in zoom-in-95 duration-200 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-base flex items-center justify-center gap-1.5">
              🎉 Focus Session Completed!
            </h4>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              {Math.round(activeSession.plannedSeconds / 60)} minutes completed on <span className="font-extrabold text-indigo-700">{activeSession.subject}</span>.
            </p>
            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full mt-2">
              <Volume2 className="w-3 h-3 text-emerald-600" /> Completion Chime & Haptic Fired
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={repeatSession}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              Focus Again
            </button>
            <button
              onClick={() => setCompletionCelebration(false)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        /* Circular Progress Ring */
        <div className="relative flex items-center justify-center my-4 sm:my-6 z-10">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="text-slate-100"
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
              stroke={mode === "focus" ? "url(#focusGradient2)" : "url(#breakGradient2)"}
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="focusGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="breakGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Timer String */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-900 tracking-tighter font-mono leading-none">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
              {isRunning ? (mode === "focus" ? "Focusing" : "Break") : "Paused"}
            </span>
          </div>
        </div>
      )}

      {/* Preset Duration Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 z-10">
        {[15, 25, 45, 60].map((mins) => (
          <button
            key={mins}
            onClick={() => setTimerDuration(mins, "focus")}
            className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border transition-all cursor-pointer ${
              activeSession.plannedSeconds === mins * 60 && mode === "focus"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
            }`}
          >
            {mins}m
          </button>
        ))}
        <button
          onClick={() => setTimerDuration(5, "break")}
          className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border transition-all cursor-pointer ${
            mode === "break"
              ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
              : "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          5m Break
        </button>
      </div>

      {/* Controls Bar */}
      <div className="w-full flex items-center justify-between mt-5 pt-3 border-t border-slate-100 z-10">
        <div className="flex items-center gap-1">
          {/* Reset button */}
          <button
            onClick={resetTimer}
            className="p-2.5 text-slate-400 hover:text-slate-700 bg-slate-50 border border-slate-200 hover:bg-white rounded-xl transition-all cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Quick Mute Toggle */}
          <button
            onClick={() => updatePreferences({ soundEnabled: !preferences.soundEnabled })}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              preferences.soundEnabled
                ? "bg-indigo-50 border-indigo-100 text-indigo-600"
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}
            title={preferences.soundEnabled ? "Mute Sound (M)" : "Unmute Sound (M)"}
          >
            {preferences.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Keyboard Shortcuts Hint */}
          <div className="relative">
            <button
              onClick={() => setShowShortcutsTooltip(!showShortcutsTooltip)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
              title="Keyboard Shortcuts"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {showShortcutsTooltip && (
              <div className="absolute left-0 bottom-full mb-2 w-48 p-3 rounded-2xl bg-slate-900 text-white text-[10px] space-y-1 z-50 shadow-xl border border-slate-700">
                <p className="font-bold border-b border-slate-700 pb-1 text-indigo-400">Shortcuts</p>
                <p><kbd className="bg-slate-800 px-1 rounded">Space</kbd> Start / Pause</p>
                <p><kbd className="bg-slate-800 px-1 rounded">R</kbd> Resume</p>
                <p><kbd className="bg-slate-800 px-1 rounded">M</kbd> Toggle Sound</p>
                <p><kbd className="bg-slate-800 px-1 rounded">Esc</kbd> Pause</p>
              </div>
            )}
          </div>
        </div>

        {/* Start / Pause Main Action */}
        {isRunning ? (
          <button
            onClick={pauseTimer}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl flex items-center gap-1.5 text-xs font-black shadow-sm hover:scale-103 transition-all cursor-pointer"
          >
            <Pause className="w-4 h-4" /> Pause
          </button>
        ) : (
          <button
            onClick={() => startTimer(defaultSubject, defaultTaskId)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl flex items-center gap-1.5 text-xs font-black shadow-md hover:scale-103 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4" /> {activeSession.elapsedSeconds > 0 ? "Resume" : "Begin Focus"}
          </button>
        )}
      </div>

      {/* Settings Modal */}
      <FocusSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
      />

      {/* Re-Engagement / Welcome Back Modal */}
      <FocusReEngagementModal
        isOpen={awayModalState.isOpen}
        type={awayModalState.type}
        awaySeconds={awayModalState.awaySeconds}
        onContinue={() => setAwayModalState((prev) => ({ ...prev, isOpen: false }))}
        onPause={() => {
          pauseTimer();
          setAwayModalState((prev) => ({ ...prev, isOpen: false }));
        }}
        onEndSession={() => {
          resetTimer();
          setAwayModalState((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}

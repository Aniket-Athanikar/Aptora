"use client";

import React, { useState } from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { Clock, Play, Pause, RotateCcw, Sparkles } from "lucide-react";

export function StudyTimer() {
  const { studyTimer, startTimer, pauseTimer, resetTimer, activeGoal } = useGoalEngine();
  const [selectedSub, setSelectedSub] = useState("");

  const subjects = activeGoal?.weaknesses?.map((w) => w.subject) || [];

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs.toString().padStart(2, "0"),
      mins.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0")
    ].join(":");
  };

  return (
    <div className="glass bg-white/70 backdrop-blur-xl border border-white/45 p-6 rounded-3xl space-y-5 relative shadow-xl">
      {/* Background soft glow when active */}
      {studyTimer.isActive && (
        <span className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-100/40 rounded-full blur-3xl animate-pulse pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex justify-between items-center pb-1">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="w-4.5 h-4.5 text-[var(--primary)]" /> Focus Study Timer
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Log focused revision sessions instantly.</p>
        </div>

        {studyTimer.isActive && (
          <span className="text-[9px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Focusing
          </span>
        )}
      </div>

      {/* Medium Grid Layout Structure */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-white/85 border border-slate-100/80 rounded-2xl shadow-sm">
        {/* Left Side: Subject Selector / Info */}
        <div className="flex flex-col space-y-1.5">
          {studyTimer.subject ? (
            <div className="flex flex-col space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Current Subject</span>
              <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary-soft)] px-3 py-1.5 rounded-xl border border-[var(--primary)]/10 flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" /> {studyTimer.subject}
              </span>
            </div>
          ) : (
            <div className="flex flex-col space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Choose Subject</label>
              <select
                value={selectedSub}
                onChange={(e) => setSelectedSub(e.target.value)}
                disabled={studyTimer.isActive}
                className="w-full max-w-[200px] border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 text-xs font-extrabold focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 focus:outline-none transition-all cursor-pointer"
              >
                <option value="">General Study</option>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Center: Digital Clock Display */}
        <div className="flex justify-center">
          <div className="font-mono text-3xl font-black text-slate-850 tracking-wider tabular-nums leading-none">
            {formatTime(studyTimer.seconds)}
          </div>
        </div>

        {/* Right Side: Controls */}
        <div className="flex items-center gap-2">
          {studyTimer.isActive ? (
            <button
              onClick={pauseTimer}
              className="p-3 bg-amber-500 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20 text-white rounded-full transition-all cursor-pointer active:scale-95 shadow-sm shrink-0"
              title="Pause Study Session"
            >
              <Pause className="w-4.5 h-4.5 fill-white text-white" />
            </button>
          ) : (
            <button
              onClick={() => startTimer(selectedSub || "General Study")}
              className="p-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:shadow-lg hover:shadow-indigo-500/20 text-white rounded-full transition-all cursor-pointer active:scale-95 shadow-sm shrink-0"
              title="Start Study Session"
            >
              <Play className="w-4.5 h-4.5 fill-white text-white translate-x-0.5" />
            </button>
          )}

          <button
            onClick={resetTimer}
            disabled={studyTimer.seconds === 0}
            className="px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] hover:shadow-lg hover:shadow-indigo-500/10 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:hover:bg-[var(--primary)] disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 shadow-sm"
            title="Save and log this study session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Save & Log</span>
          </button>
        </div>
      </div>
    </div>
  );
}

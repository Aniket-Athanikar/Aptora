"use client";

import React, { useState } from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { Clock, Play, Pause, RotateCcw, AlertCircle, Sparkles } from "lucide-react";

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
    <div className="glass-panel p-6 space-y-4 relative overflow-hidden">
      {/* Background soft glow when active */}
      {studyTimer.isActive && (
        <span className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-100 rounded-full blur-2xl animate-soft-pulse" />
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
            <Clock className="w-4.5 h-4.5 text-indigo-600" /> Focus Study Timer
          </h3>
          <p className="text-xs text-gray-400">Log focused revision sessions instantly.</p>
        </div>
        
        {studyTimer.isActive && (
          <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Focusing
          </span>
        )}
      </div>

      <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
        {/* Timer display */}
        <p className="text-3xl font-black text-gray-800 tracking-wider">
          {formatTime(studyTimer.seconds)}
        </p>

        {/* Selected Subject indicator */}
        {studyTimer.subject ? (
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> {studyTimer.subject}
          </span>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <label className="font-semibold text-gray-500">Subject:</label>
            <select
              value={selectedSub}
              onChange={(e) => setSelectedSub(e.target.value)}
              disabled={studyTimer.isActive}
              className="border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 font-bold focus:outline-none"
            >
              <option value="">General Study</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {studyTimer.isActive ? (
            <button
              onClick={pauseTimer}
              className="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors"
              title="Pause Study Session"
            >
              <Pause className="w-5 h-5 fill-white" />
            </button>
          ) : (
            <button
              onClick={() => startTimer(selectedSub || "General Study")}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all shadow-sm"
              title="Start Study Session"
            >
              <Play className="w-5 h-5 fill-white translate-x-0.5" />
            </button>
          )}

          <button
            onClick={resetTimer}
            disabled={studyTimer.seconds === 0}
            className="p-3 border border-gray-200 hover:bg-white text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent rounded-full"
            title="Log and Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

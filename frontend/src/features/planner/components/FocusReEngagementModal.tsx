"use client";

import React from "react";
import { Sparkles, Clock, Play, Pause, XCircle } from "lucide-react";

interface FocusReEngagementModalProps {
  isOpen: boolean;
  type: "welcome_back" | "long_absence";
  awaySeconds: number;
  onContinue: () => void;
  onPause: () => void;
  onEndSession: () => void;
}

export function FocusReEngagementModal({
  isOpen,
  type,
  awaySeconds,
  onContinue,
  onPause,
  onEndSession,
}: FocusReEngagementModalProps) {
  if (!isOpen) return null;

  const awayMinutes = Math.max(1, Math.round(awaySeconds / 60));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
          {type === "welcome_back" ? (
            <Sparkles className="w-6 h-6 animate-pulse text-indigo-600" />
          ) : (
            <Clock className="w-6 h-6 text-amber-500" />
          )}
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900">
            {type === "welcome_back" ? "Welcome Back 👋" : "You've Been Away"}
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">
            {type === "welcome_back"
              ? `You were away for ${awayMinutes} ${awayMinutes === 1 ? "minute" : "minutes"}. Your focus session is still running.`
              : `You were away for ${awayMinutes} minutes. Would you like to continue this study session?`}
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onContinue}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Play className="w-4 h-4" /> Continue Focus Session
          </button>
          {type === "long_absence" && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onPause}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" /> Pause Session
              </button>
              <button
                onClick={onEndSession}
                className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" /> End Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

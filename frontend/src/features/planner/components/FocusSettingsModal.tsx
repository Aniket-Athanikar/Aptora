"use client";

import React from "react";
import { FocusPreferences, SoundPreset, AmbienceType, FeedbackMode } from "../types/focus2";
import { SoundManager } from "../services/soundManager";
import { NotificationService } from "../services/notificationService";
import {
  Volume2,
  VolumeX,
  Vibrate,
  Bell,
  Sparkles,
  Clock,
  Moon,
  X,
  Play,
  CheckCircle,
} from "lucide-react";

interface FocusSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: FocusPreferences;
  onUpdatePreferences: (updates: Partial<FocusPreferences>) => void;
}

const SOUND_PRESETS: SoundPreset[] = ["Minimal", "Calm", "Focus", "Nature", "Classic", "Silent"];
const AMBIENCE_OPTIONS: AmbienceType[] = ["None", "Rain", "White Noise", "Brown Noise", "Soft Ambient"];
const FEEDBACK_MODES: FeedbackMode[] = ["All Feedback", "Milestones Only", "Completion Only", "Off"];

export function FocusSettingsModal({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
}: FocusSettingsModalProps) {
  if (!isOpen) return null;

  const notifState = NotificationService.getPermissionState();

  const handleRequestNotifications = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      onUpdatePreferences({ notificationsEnabled: true });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Focus Feedback & Settings</h3>
              <p className="text-xs text-slate-400 font-semibold">Customize sounds, haptics, and notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Toggles Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Sounds */}
          <button
            onClick={() => onUpdatePreferences({ soundEnabled: !preferences.soundEnabled })}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              preferences.soundEnabled
                ? "bg-indigo-50/60 border-indigo-200 text-indigo-900"
                : "bg-slate-50/60 border-slate-200 text-slate-400"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {preferences.soundEnabled ? <Volume2 className="w-4.5 h-4.5 text-indigo-600" /> : <VolumeX className="w-4.5 h-4.5 text-slate-400" />}
              <div>
                <p className="text-xs font-black">Audio Sounds</p>
                <p className="text-[10px] text-slate-500 font-semibold">{preferences.soundEnabled ? "ON" : "OFF"}</p>
              </div>
            </div>
          </button>

          {/* Haptics */}
          <button
            onClick={() => onUpdatePreferences({ hapticEnabled: !preferences.hapticEnabled })}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              preferences.hapticEnabled
                ? "bg-purple-50/60 border-purple-200 text-purple-900"
                : "bg-slate-50/60 border-slate-200 text-slate-400"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Vibrate className={`w-4.5 h-4.5 ${preferences.hapticEnabled ? "text-purple-600" : "text-slate-400"}`} />
              <div>
                <p className="text-xs font-black">Haptic Vibration</p>
                <p className="text-[10px] text-slate-500 font-semibold">{preferences.hapticEnabled ? "ON" : "OFF"}</p>
              </div>
            </div>
          </button>

          {/* Notifications */}
          <button
            onClick={() => {
              if (notifState !== "granted") handleRequestNotifications();
              else onUpdatePreferences({ notificationsEnabled: !preferences.notificationsEnabled });
            }}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              preferences.notificationsEnabled && notifState === "granted"
                ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                : "bg-slate-50/60 border-slate-200 text-slate-400"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className={`w-4.5 h-4.5 ${preferences.notificationsEnabled && notifState === "granted" ? "text-emerald-600" : "text-slate-400"}`} />
              <div>
                <p className="text-xs font-black">Notifications</p>
                <p className="text-[10px] text-slate-500 font-semibold">
                  {notifState !== "granted" ? "Grant Permission" : preferences.notificationsEnabled ? "ON" : "OFF"}
                </p>
              </div>
            </div>
          </button>

          {/* Do Not Disturb */}
          <button
            onClick={() => onUpdatePreferences({ doNotDisturb: !preferences.doNotDisturb })}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              preferences.doNotDisturb
                ? "bg-amber-50/60 border-amber-200 text-amber-900"
                : "bg-slate-50/60 border-slate-200 text-slate-400"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Moon className={`w-4.5 h-4.5 ${preferences.doNotDisturb ? "text-amber-600" : "text-slate-400"}`} />
              <div>
                <p className="text-xs font-black">Do Not Disturb</p>
                <p className="text-[10px] text-slate-500 font-semibold">{preferences.doNotDisturb ? "ACTIVE" : "OFF"}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Volume & Sound Preview */}
        <div className="space-y-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-indigo-600" /> Sound Volume ({Math.round(preferences.volume * 100)}%)
            </span>
            <button
              onClick={() => SoundManager.previewSound(preferences.soundPreset, preferences.volume)}
              className="text-[10px] text-indigo-600 hover:text-indigo-700 font-black flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-indigo-100 shadow-2xs cursor-pointer"
            >
              <Play className="w-3 h-3 fill-indigo-600" /> Test Sound
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={preferences.volume}
            onChange={(e) => onUpdatePreferences({ volume: parseFloat(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Sound Personality Presets */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-800">Sound Profile</label>
          <div className="grid grid-cols-3 gap-2">
            {SOUND_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  onUpdatePreferences({ soundPreset: preset });
                  SoundManager.previewSound(preset, preferences.volume);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  preferences.soundPreset === preset
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Ambience Audio Background */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-800">Focus Ambience (Optional Audio)</label>
          <div className="grid grid-cols-3 gap-2">
            {AMBIENCE_OPTIONS.map((amb) => (
              <button
                key={amb}
                onClick={() => onUpdatePreferences({ ambience: amb })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  preferences.ambience === amb
                    ? "bg-purple-600 border-purple-600 text-white shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                }`}
              >
                {amb}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Mode */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-800">Haptic & Alert Filtering</label>
          <div className="grid grid-cols-2 gap-2">
            {FEEDBACK_MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => onUpdatePreferences({ feedbackMode: mode })}
                className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                  preferences.feedbackMode === mode
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Close */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-sm cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}

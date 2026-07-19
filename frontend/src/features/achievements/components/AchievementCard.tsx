import React from "react";
import { Lock, Award, Target, BookOpen, Rocket, Flame, Zap, Crown, Brain, GraduationCap, Trophy, Medal } from "lucide-react";
import { Achievement } from "../achievementEngine";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, BookOpen, Rocket, Flame, Zap, Crown, Brain, GraduationCap, Trophy, Medal, Award
};

interface AchievementCardProps {
  achievement: Achievement;
  onShowUnlockModal?: (ach: Achievement) => void;
}

export function AchievementCard({ achievement, onShowUnlockModal }: AchievementCardProps) {
  const { title, description, icon, unlocked, unlockedAt, progress } = achievement;

  const IconComponent = ICON_MAP[icon] || Award;

  return (
    <div
      onClick={() => unlocked && onShowUnlockModal?.(achievement)}
      className={`bg-white border rounded-2xl p-4.5 transition-all duration-300 flex items-center gap-4 relative overflow-hidden group select-none ${
        unlocked
          ? "border-emerald-150 bg-emerald-50/10 hover:shadow-md hover:scale-[1.02] cursor-pointer"
          : "border-gray-150 bg-gray-50/50 opacity-75"
      }`}
    >
      {/* Icon frame */}
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:rotate-6 ${
          unlocked
            ? "bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100"
            : "bg-gray-100 text-gray-400 border border-gray-150"
        }`}
      >
        {unlocked ? <IconComponent className="w-6 h-6 text-emerald-650" /> : <Lock className="w-5 h-5 text-gray-400" />}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="text-xs font-black text-gray-800 truncate flex items-center gap-1.5">
          {title} 

          {unlocked && (
            <span className="text-[8px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">
              Unlocked
            </span>
          )}
        </h4>
        <p className="text-xs text-gray-500 leading-normal">{description}</p>

        {/* Progress or Unlock Date */}
        {unlocked ? (
          <p className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wide">
            Unlocked: {unlockedAt || "Just now"}
          </p>
        ) : (
          <div className="space-y-1 pt-1.5">
            <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-wider">
              <span>Goal Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200/60 h-1 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

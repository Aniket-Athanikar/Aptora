import React from "react";

interface AIScoreProps {
  score: number;
}

export function AIScore({ score }: AIScoreProps) {
  // SVG details for circular progress
  const size = 120;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getEvaluation = (val: number) => {
    if (val >= 90) return { label: "Elite Calibration 👑", color: "text-indigo-650" };
    if (val >= 80) return { label: "Excellent Progress 🚀", color: "text-indigo-600" };
    if (val >= 60) return { label: "Good Consistency 📈", color: "text-violet-600" };
    return { label: "Requires Re-calibration ⚠️", color: "text-amber-600" };
  };

  const evalInfo = getEvaluation(score);

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4 flex flex-col items-center justify-center text-center shadow-xs">
      <div className="w-full text-left pb-2 border-b border-gray-100">
        <h3 className="text-sm font-black text-gray-900">Daily AI Score</h3>
        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Focus, consistency, and syllabus cobertura</p>
      </div>

      <div className="relative w-36 h-36 flex items-center justify-center pt-2">
        <svg className="w-full h-full transform -rotate-90" width={size} height={size}>
          {/* Base circle background */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="url(#scoreGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          {/* Definitions */}
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Text values inside gauge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-800">{score}</span>
          <span className="text-[10px] text-slate-400 font-black">/ 100</span>
        </div>
      </div>

      <div className="pt-1.5 space-y-1">
        <h4 className={`text-xs font-black uppercase tracking-wider ${evalInfo.color}`}>
          {evalInfo.label}
        </h4>
        <p className="text-[10px] text-gray-450 leading-relaxed max-w-[180px]">
          Score derived from streak days, study hours completed, and revisions.
        </p>
      </div>
    </div>
  );
}

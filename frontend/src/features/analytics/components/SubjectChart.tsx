import React, { useState, useMemo } from "react";
import { SubjectProgressData } from "@/features/progress/store/progressStore";

interface SubjectChartProps {
  subjects?: SubjectProgressData[];
}

interface SubjectData {
  subject: string;
  percentage: number;
  color: string;
}

const colorPalette = ["#6366F1", "#8B5CF6", "#F59E0B", "#10B981", "#EC4899", "#3B82F6", "#64748B"];

export function SubjectChart({ subjects }: SubjectChartProps) {
  const data: SubjectData[] = useMemo(() => {
    if (subjects && subjects.length > 0) {
      const total = subjects.reduce((acc, s) => acc + s.completedTasks, 0) || 1;
      return subjects.slice(0, 5).map((s, idx) => ({
        subject: s.subject,
        percentage: Math.max(5, Math.round((s.completedTasks / total) * 100)),
        color: colorPalette[idx % colorPalette.length],
      }));
    }
    return [
      { subject: "History", percentage: 30, color: "#6366F1" },
      { subject: "Polity", percentage: 25, color: "#8B5CF6" },
      { subject: "Economy", percentage: 20, color: "#F59E0B" },
      { subject: "Geography", percentage: 15, color: "#3B82F6" },
      { subject: "Others", percentage: 10, color: "#64748B" },
    ];
  }, [subjects]);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const radius = 50;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4 shadow-xs">
      <div>
        <h3 className="text-sm font-black text-gray-900">Subject Distribution</h3>
        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Real-time study task distribution per subject area</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />
            {data.map((item, idx) => {
              const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
              const strokeDasharray = `${circumference} ${circumference}`;
              const rotation = (accumulatedPercent / 100) * 360;
              accumulatedPercent += item.percentage;

              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={item.subject}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${rotation} 60 60)`}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-black text-gray-800">
              {hoveredIdx !== null ? `${data[hoveredIdx].percentage}%` : "100%"}
            </span>
            <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-wider">
              {hoveredIdx !== null ? data[hoveredIdx].subject : "Total Study"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {data.map((item, idx) => (
            <div
              key={item.subject}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                hoveredIdx === idx ? "bg-slate-50 border-slate-200" : "border-transparent"
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-bold text-gray-700 w-24 truncate">{item.subject}</span>
              <span className="text-xs font-black text-gray-900">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

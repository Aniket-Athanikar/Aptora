import React, { useState } from "react";

interface SubjectData {
  subject: string;
  percentage: number;
  color: string;
}

export function SubjectChart() {
  const data: SubjectData[] = [
    { subject: "History", percentage: 30, color: "#6366F1" }, // Indigo
    { subject: "Polity", percentage: 25, color: "#8B5CF6" }, // Violet
    { subject: "Economy", percentage: 20, color: "#F59E0B" }, // Amber
    { subject: "Geography", percentage: 15, color: "#3B82F6" }, // Blue
    { subject: "Others", percentage: 10, color: "#64748B" }, // Slate
  ];

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Math variables for Donut Chart
  const radius = 50;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-black text-gray-900">Subject Distribution</h3>
        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Study time investment per subject area</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
        {/* SVG Donut */}
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

        {/* Legend */}
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
              <span className="text-xs font-bold text-gray-700 w-24">{item.subject}</span>
              <span className="text-xs font-black text-gray-900">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

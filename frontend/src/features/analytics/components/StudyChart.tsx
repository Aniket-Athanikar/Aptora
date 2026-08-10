import React, { useState } from "react";

interface DayActivity {
  day: string;
  hours: number;
}

export function StudyChart() {
  const data: DayActivity[] = [
    { day: "Mon", hours: 4 },
    { day: "Tue", hours: 5 },
    { day: "Wed", hours: 3 },
    { day: "Thu", hours: 6 },
    { day: "Fri", hours: 4 },
    { day: "Sat", hours: 2 },
    { day: "Sun", hours: 5 },
  ];

  const maxHours = 8;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-black text-gray-900">Weekly Study Chart</h3>
        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Hours focused on learning each day</p>
      </div>

      <div className="relative pt-6">
        {/* Render responsive SVG Chart */}
        <div className="h-48 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
              <line
                key={i}
                x1="40"
                y1={20 + r * 140}
                x2="480"
                y2={20 + r * 140}
                stroke="#F1F5F9"
                strokeWidth="1.5"
              />
            ))}

            {/* Bars */}
            {data.map((item, idx) => {
              const colWidth = 440 / data.length;
              const barWidth = 32;
              const xPos = 40 + idx * colWidth + (colWidth - barWidth) / 2;
              const barHeight = (item.hours / maxHours) * 140;
              const yPos = 160 - barHeight;

              return (
                <g
                  key={item.day}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="cursor-pointer"
                >
                  {/* Glowing background on hover */}
                  <rect
                    x={xPos - 6}
                    y={15}
                    width={barWidth + 12}
                    height={155}
                    fill="transparent"
                    rx={8}
                    className="hover:fill-slate-50/50 transition-colors duration-200"
                  />

                  {/* Actual Bar */}
                  <rect
                    x={xPos}
                    y={yPos}
                    width={barWidth}
                    height={barHeight}
                    fill={hoveredIdx === idx ? "url(#hoverGrad)" : "url(#barGrad)"}
                    rx={6}
                    className="transition-all duration-300"
                  />

                  {/* Text labels */}
                  <text
                    x={xPos + barWidth / 2}
                    y="185"
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="10"
                    fontWeight="800"
                  >
                    {item.day}
                  </text>
                </g>
              );
            })}

            {/* Definitions for Gradients */}
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <linearGradient id="hoverGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#a7f3d0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Dynamic HTML Tooltip */}
          {hoveredIdx !== null && (
            <div
              className="absolute bg-slate-900 border border-slate-800 text-white rounded-xl p-2 text-[10px] font-black pointer-events-none transition-opacity shadow-2xl z-20"
              style={{
                left: `${40 + hoveredIdx * (440 / data.length) + 15}px`,
                top: "20px"
              }}
            >
              <p className="text-emerald-400 font-extrabold uppercase text-[8px] tracking-wider">{data[hoveredIdx].day}</p>
              <p className="text-xs font-black">{data[hoveredIdx].hours} Hours</p>
              <p className="text-slate-400 font-semibold mt-0.5">Target: 6.0h</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

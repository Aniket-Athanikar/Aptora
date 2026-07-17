import React, { useState } from "react";

interface ProgressPoint {
  week: string;
  percent: number;
}

export function ProgressChart() {
  const data: ProgressPoint[] = [
    { week: "Week 1", percent: 20 },
    { week: "Week 2", percent: 35 },
    { week: "Week 3", percent: 50 },
    { week: "Week 4", percent: 72 },
  ];

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Generate SVG Path
  const width = 450;
  const height = 150;
  const paddingLeft = 40;
  const paddingRight = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((item, idx) => {
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = height - paddingBottom - (item.percent / 100) * chartHeight;
    return { x, y, ...item };
  });

  // Build path string
  const pathD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    // Bezier curve approximation
    const prev = points[idx - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, "");

  // Area path string for gradient fill
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : "";

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-black text-gray-900">Monthly Progress</h3>
        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Incremental syllabus coverage trend line</p>
      </div>

      <div className="relative pt-4">
        <div className="w-full relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Grid Line */}
            {[0, 0.5, 1].map((r, i) => (
              <line
                key={i}
                x1={paddingLeft}
                y1={paddingTop + r * chartHeight}
                x2={width - paddingRight}
                y2={paddingTop + r * chartHeight}
                stroke="#F8FAFC"
                strokeWidth="1"
              />
            ))}

            {/* Filled Area Gradient */}
            <path
              d={areaD}
              fill="url(#areaGrad)"
              className="opacity-70 transition-all duration-300"
            />

            {/* Glowing Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#6366F1"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Interactive Circles */}
            {points.map((p, idx) => (
              <g
                key={p.week}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIdx === idx ? 8 : 5}
                  fill={hoveredIdx === idx ? "#4F46E5" : "#6366F1"}
                  stroke="white"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />

                {/* Text Label */}
                <text
                  x={p.x}
                  y={height - 10}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9"
                  fontWeight="800"
                >
                  {p.week}
                </text>
              </g>
            ))}

            {/* Definitions */}
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C7D2FE" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#EEF2FF" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating Tooltip */}
          {hoveredIdx !== null && (
            <div
              className="absolute bg-slate-900 border border-slate-800 text-white rounded-xl p-2 text-[10px] font-black pointer-events-none transition-opacity shadow-2xl z-20"
              style={{
                left: `${points[hoveredIdx].x - 30}px`,
                top: `${points[hoveredIdx].y - 45}px`
              }}
            >
              <p className="text-indigo-400 font-extrabold uppercase text-[8px] tracking-wider">{data[hoveredIdx].week}</p>
              <p className="text-xs font-black">{data[hoveredIdx].percent}% Cover</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

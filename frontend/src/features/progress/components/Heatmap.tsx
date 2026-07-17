import React from "react";
import { ActivityHistoryItem } from "../store/progressStore";

interface HeatmapProps {
  activityHistory: ActivityHistoryItem[];
}

export function Heatmap({ activityHistory }: HeatmapProps) {
  // Map colors based on status
  const getColorClass = (status: "completed" | "partial" | "missed" | undefined, hours: number) => {
    if (hours === 0 || !status) return "bg-gray-100 hover:bg-gray-200 border-gray-200/50";
    switch (status) {
      case "completed":
        return "bg-emerald-500 hover:bg-emerald-600 border-emerald-600/20 shadow-sm shadow-emerald-500/10";
      case "partial":
        return "bg-amber-400 hover:bg-amber-500 border-amber-500/20";
      case "missed":
        return "bg-rose-500 hover:bg-rose-600 border-rose-600/20 shadow-sm shadow-rose-500/10";
    }
  };

  // Group by weeks for rendering
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Let's render the last 28 days in a clean 4-week grid or let's render the full 30 items
  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-black text-gray-900">Study Heatmap</h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Visualize your daily study consistency</p>
        </div>
        <div className="flex gap-3 text-[10px] font-bold text-gray-500 items-center">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-gray-100 border border-gray-200" /> Rest</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400" /> Partial</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Completed</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Missed</span>
        </div>
      </div>

      <div className="flex flex-col space-y-2 overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-[500px] justify-between py-2">
          {activityHistory.slice(-28).map((item) => {
            const date = new Date(item.date);
            const dayLabel = daysOfWeek[date.getDay()];
            const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            return (
              <div
                key={item.date}
                className="flex flex-col items-center flex-1 group relative cursor-help"
              >
                <div className={`w-full aspect-square rounded-lg border transition-all duration-200 ${getColorClass(item.status, item.hours)}`} />
                <span className="text-[9px] font-bold text-gray-400 mt-1.5">{dayLabel}</span>
                <span className="text-[8px] text-gray-300 font-semibold">{date.getDate()}</span>

                {/* Floating tooltip */}
                <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[9px] font-black rounded-lg py-1.5 px-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 shadow-xl border border-slate-800">
                  <div className="text-[8px] text-indigo-400 uppercase tracking-widest">{formattedDate}</div>
                  <div className="mt-0.5 font-bold">Hours Studied: {item.hours}h</div>
                  <div>Tasks Completed: {item.tasksCompleted}</div>
                  <div className="capitalize mt-0.5 text-[8px] text-slate-400">Status: {item.status}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

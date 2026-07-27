"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ActivityHistoryItem, useProgressStore } from "../store/progressStore";
import { Check, X, Calendar, Edit2, AlertCircle } from "lucide-react";

interface HeatmapProps {
  activityHistory: ActivityHistoryItem[];
}

export function Heatmap({ activityHistory }: HeatmapProps) {
  const { updateDailyActivity } = useProgressStore();
  const [editingDay, setEditingDay] = useState<ActivityHistoryItem | null>(null);
  const [editHours, setEditHours] = useState<number>(0);
  const [editTasks, setEditTasks] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<"completed" | "partial" | "missed">("partial");

  // Map colors based on status and hour density
  const getColorClass = (status: "completed" | "partial" | "missed" | undefined, hours: number) => {
    if (!status || hours === 0) return "bg-slate-100 hover:bg-slate-200 border-slate-200/40 dark:bg-slate-800 dark:border-slate-700/30";
    switch (status) {
      case "completed":
        return "bg-emerald-500 hover:bg-emerald-600 border-emerald-600/20 shadow-sm shadow-emerald-500/10";
      case "partial":
        return "bg-amber-400 hover:bg-amber-500 border-amber-500/20";
      case "missed":
        return "bg-rose-500 hover:bg-rose-600 border-rose-600/20 shadow-sm shadow-rose-500/10";
    }
  };

  const daysOfWeekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Sort chronological
  const sortedHistory = [...activityHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Pad the start to align with the correct day of the week (Sunday is row 0)
  const paddedHistory: (ActivityHistoryItem | null)[] = [];
  if (sortedHistory.length > 0) {
    const firstDate = new Date(sortedHistory[0].date);
    const firstDayOfWeek = firstDate.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      paddedHistory.push(null);
    }
  }
  paddedHistory.push(...sortedHistory);

  // Group into weeks of 7 days
  const weeks: (ActivityHistoryItem | null)[][] = [];
  for (let i = 0; i < paddedHistory.length; i += 7) {
    weeks.push(paddedHistory.slice(i, i + 7));
  }

  // Generate Month Labels on top
  const monthLabels: { label: string; index: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIdx) => {
    const firstDay = week.find((day) => day !== null);
    if (firstDay) {
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        monthLabels.push({
          label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month],
          index: weekIdx,
        });
        lastMonth = month;
      }
    }
  });

  const handleCellClick = (item: ActivityHistoryItem) => {
    setEditingDay(item);
    setEditHours(item.hours);
    setEditTasks(item.tasksCompleted);
    setEditStatus(item.status || "partial");
  };

  const saveActivityUpdate = () => {
    if (editingDay) {
      updateDailyActivity(editingDay.date, editHours, editTasks, editStatus);
      setEditingDay(null);
    }
  };

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-6 space-y-6 relative z-10 shadow-xs">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-black text-gray-900">Study Consistency Grid</h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Real-time interactive study heatmap (last 12 months). Click any cell to log or edit your hours.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-[10px] font-bold text-gray-500 items-center">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200" /> Rest
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Partial
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Missed
          </span>
        </div>
      </div>

      {/* Contribution Grid */}
      <div className="overflow-x-auto pb-2 scrollbar-thin select-none">
        <div className="min-w-[760px] flex flex-col space-y-1.5 pr-2">
          
          {/* Month labels bar */}
          <div className="relative h-4 text-[9px] font-bold text-gray-400 ml-8">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${m.index * 13.6}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex">
            {/* Days of week labels on side */}
            <div className="flex flex-col justify-between pr-2 text-[9px] font-bold text-gray-400 w-6 pt-1 pb-1">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Grid Container */}
            <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1">
              {paddedHistory.map((item, idx) => {
                if (!item) {
                  return <div key={`empty-${idx}`} className="w-2.5 h-2.5 rounded-xs bg-transparent" />;
                }

                const date = new Date(item.date);
                const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

                return (
                  <div key={item.date} className="relative group flex items-center justify-center">
                    <button
                      onClick={() => handleCellClick(item)}
                      className={`w-2.5 h-2.5 rounded-xs border transition-all duration-200 ${getColorClass(
                        item.status,
                        item.hours
                      )}`}
                    />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-slate-950 text-white text-[9px] rounded-xl p-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl border border-slate-800/80 whitespace-nowrap">
                      <div className="font-extrabold text-indigo-400">{formattedDate}</div>
                      <div className="mt-0.5 font-bold">Hours: {item.hours}h</div>
                      <div>Tasks Completed: {item.tasksCompleted}</div>
                      <div className="capitalize text-[8px] text-slate-400 mt-1">Click to edit</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Activity Modal */}
      <AnimatePresence>
        {editingDay && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-5"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#6D4AFF]" />
                  <h4 className="text-sm font-black text-slate-900">Log Daily Study Session</h4>
                </div>
                <button
                  onClick={() => setEditingDay(null)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-650"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <p className="text-[10px] font-black text-indigo-650 uppercase tracking-widest">Selected Date</p>
                <p className="text-xs font-extrabold text-slate-800">
                  {new Date(editingDay.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Hours Studied</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={editHours}
                    onChange={(e) => {
                      const h = parseFloat(e.target.value) || 0;
                      setEditHours(h);
                      if (h > 4) setEditStatus("completed");
                      else if (h > 0) setEditStatus("partial");
                      else setEditStatus("missed");
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-[#6D4AFF] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tasks Completed</label>
                  <input
                    type="number"
                    min="0"
                    value={editTasks}
                    onChange={(e) => setEditTasks(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-[#6D4AFF] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Day Status</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(["completed", "partial", "missed"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditStatus(st)}
                        className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer text-center ${
                          editStatus === st
                            ? st === "completed"
                              ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-extrabold"
                              : st === "partial"
                              ? "bg-amber-50 border-amber-500 text-amber-700 font-extrabold"
                              : "bg-rose-50 border-rose-500 text-rose-700 font-extrabold"
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setEditingDay(null)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={saveActivityUpdate}
                  className="flex-1 py-2.5 bg-[#6D4AFF] hover:bg-[#5A36EE] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

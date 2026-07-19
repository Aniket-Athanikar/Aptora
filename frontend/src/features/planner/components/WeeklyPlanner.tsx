"use client";

import React, { useMemo } from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { plannerEngine } from "../services/plannerEngine";
import { CalendarDays, BookOpen } from "lucide-react";

export function WeeklyPlanner() {
  const { activeGoal } = useGoalEngine();

  const weeklySchedule = useMemo(() => {
    if (!activeGoal) return [];
    return plannerEngine.generateWeeklyPlan(activeGoal);
  }, [activeGoal]);

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
        <CalendarDays className="w-5 h-5 text-indigo-600 animate-pulse" />
        <div>
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Weekly Schedule</h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Your study mapping cycle.</p>
        </div>
      </div>

      {weeklySchedule.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-400">
          No goal configured yet. Launch calibration to generate.
        </div>
      ) : (
        <div className="space-y-3">
          {weeklySchedule.map((item) => (
            <div key={item.day} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-gray-400 w-16 uppercase tracking-wider">{item.day}</span>
                <span className="text-xs font-bold text-gray-800 truncate max-w-[200px]">{item.subject}</span>
              </div>
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-md">
                {item.duration}h
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { CheckSquare, Square, Clock, BookOpen, PenTool, CheckCircle } from "lucide-react";

export function DailyPlanner() {
  const { dailyMissions, toggleMission, activeGoal } = useGoalEngine();

  if (!activeGoal) return null;

  const totalTime = dailyMissions.reduce((acc, cur) => acc + cur.durationMinutes, 0);
  const completedTime = dailyMissions
    .filter((m) => m.completed)
    .reduce((acc, cur) => acc + cur.durationMinutes, 0);

  const completedCount = dailyMissions.filter((m) => m.completed).length;

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-indigo-600" /> Today&apos;s AI Study Planner
          </h3>
          <p className="text-xs text-gray-400">Targeting weaknesses & preferred formats.</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-gray-800">
            {completedCount}/{dailyMissions.length} Complete
          </span>
          <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">
            {completedTime} / {totalTime} minutes logged
          </p>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-300"
          style={{ width: `${dailyMissions.length > 0 ? (completedCount / dailyMissions.length) * 100 : 0}%` }}
        />
      </div>

      {/* Missions checklist */}
      <div className="space-y-2.5">
        {dailyMissions.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleMission(item.id)}
            className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all group ${
              item.completed 
                ? "bg-gray-50 border-gray-100 text-gray-400 line-through" 
                : "bg-white border-gray-200/80 hover:border-indigo-300 text-gray-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {item.completed ? (
                <CheckSquare className="w-5 h-5 text-indigo-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-300 group-hover:text-indigo-400" />
              )}
              <div>
                <span className="text-xs font-bold block">{item.title}</span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 font-bold uppercase">
                  {item.type === "study" && <BookOpen className="w-3 h-3 text-indigo-500" />}
                  {item.type === "practice" && <PenTool className="w-3 h-3 text-amber-500" />}
                  {item.type === "revision" && <Clock className="w-3 h-3 text-emerald-500" />}
                  {item.durationMinutes} Minutes allocation
                </span>
              </div>
            </div>

            {item.subject && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                item.completed ? "bg-gray-100 text-gray-400" : "bg-indigo-50 text-indigo-600"
              }`}>
                {item.subject}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

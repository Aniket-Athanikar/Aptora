"use client";

import React from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { CheckSquare, Square, Clock, BookOpen, PenTool, CheckCircle, Flame } from "lucide-react";
import { motion } from "framer-motion";

export function DailyPlanner() {
  const { dailyMissions, toggleMission, activeGoal } = useGoalEngine();

  if (!activeGoal) return null;

  const totalTime = dailyMissions.reduce((acc, cur) => acc + cur.durationMinutes, 0);
  const completedTime = dailyMissions
    .filter((m) => m.completed)
    .reduce((acc, cur) => acc + cur.durationMinutes, 0);

  const completedCount = dailyMissions.filter((m) => m.completed).length;
  const progressRatio = dailyMissions.length > 0 ? (completedCount / dailyMissions.length) * 100 : 0;

  return (
    <div className="p-6 glass border border-white/20 rounded-3xl space-y-6 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-100/50 pb-3">
        <div>
          <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-indigo-650" /> Today&apos;s Study Planner
          </h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
            Targeting weaknesses & study formats.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-slate-700 bg-slate-150/40 px-2.5 py-1 rounded-xl uppercase tracking-wider">
            {completedCount}/{dailyMissions.length} Complete
          </span>
          <p className="text-[10px] text-indigo-600 font-bold mt-1">
            {completedTime} / {totalTime} mins logged
          </p>
        </div>
      </div>

      {/* Progress Bar with glowing indicator */}
      <div className="w-full bg-slate-100/60 h-2 rounded-full overflow-hidden relative">
        <motion.div
          className="bg-indigo-600 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressRatio}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Missions checklist */}
      <div className="space-y-3">
        {dailyMissions.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleMission(item.id)}
            className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all group cursor-pointer ${
              item.completed
                ? "bg-slate-50/20 border-slate-100/20 text-slate-400 line-through opacity-85"
                : "bg-white/40 border-white/20 hover:border-indigo-350 hover:shadow-xs text-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0 transition-transform group-hover:scale-108">
                {item.completed ? (
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
                )}
              </div>
              <div>
                <span className="text-xs font-black tracking-tight block">{item.title}</span>
                <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-1 font-black uppercase tracking-wider">
                  {item.type === "study" && <BookOpen className="w-3.5 h-3.5 text-indigo-500" />}
                  {item.type === "practice" && <PenTool className="w-3.5 h-3.5 text-amber-500" />}
                  {item.type === "revision" && <Clock className="w-3.5 h-3.5 text-emerald-500" />}
                  <span>{item.durationMinutes} Minutes Session</span>
                </span>
              </div>
            </div>

            {item.subject && (
              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 ${
                item.completed ? "bg-slate-100 text-slate-400" : "bg-indigo-50 text-indigo-650"
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

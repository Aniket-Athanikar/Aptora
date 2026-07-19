"use client";

import React, { useState } from "react";
import { GoalData } from "@/types/goal.types";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { motion } from "framer-motion";
import { Edit2, Trash2, Share2, Award, Clock } from "lucide-react";

interface GoalCardProps {
  goal: GoalData;
  onEdit: () => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const { deleteGoal } = useGoalEngine();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`My ExamForge Goal: Cracking the ${goal.targetExam} on ${goal.timeline.examDate}!`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Remaining days percentage progress
  const totalDays = Math.max(1, goal.timeline.remainingDays + 60); // Mock total duration
  const daysPercentage = Math.round((goal.timeline.remainingDays / totalDays) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 relative overflow-hidden flex flex-col justify-between min-h-[300px] border-l-4 border-l-indigo-200"
    >
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/30 rounded-full blur-3xl -z-10" />

      {/* Hero Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl shadow-sm">
            {goal.profile.avatar ? (
              <img src={goal.profile.avatar} alt="Avatar" className="w-10 h-10 object-cover" />
            ) : (
              "🎯"
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {goal.examCategory}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mt-1">{goal.targetExam}</h2>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">Success Target for {goal.profile.fullName}</p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 bg-gray-100/60 p-1 rounded-xl">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-white transition-all"
            title="Edit Success Parameters"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={deleteGoal}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white transition-all"
            title="Delete Goal Profile"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-indigo-500" /> Rem. Days
          </span>
          <p className="text-lg font-black text-gray-900 mt-1">{goal.timeline.remainingDays} Days</p>
        </div>

        <div className="text-center">
          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-center gap-1">
            <Award className="w-3 h-3 text-amber-500" /> Success Rate
          </span>
          <p className="text-lg font-black text-indigo-600 mt-1">{goal.timeline.successPrediction}%</p>
        </div>

        <div className="text-center relative">
          <span className="text-[10px] uppercase font-bold text-gray-400">Daily Study</span>
          <p className="text-lg font-black text-gray-900 mt-1">{goal.timeline.dailyStudyHours} Hrs</p>
        </div>
      </div>

      {/* Sharing Panel Toast */}
      <div className="mt-4 flex justify-between items-center text-xs">
        <span className="text-gray-400">Syllabus Covered: <strong className="text-gray-700">{goal.profile.syllabusPercent}%</strong></span>
        <button
          onClick={handleShare}
          className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
        >
          <Share2 className="w-3.5 h-3.5" /> {copied ? "Copied Link!" : "Share Goal"}
        </button>
      </div>
    </motion.div>
  );
}

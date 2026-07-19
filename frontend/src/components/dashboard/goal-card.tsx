"use client";

import React, { useState } from "react";
import { GoalData } from "@/types/goal.types";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { motion } from "framer-motion";
import { Edit2, Trash2, Pin, Star, Archive, Share2, Award, Clock, Calendar, CheckCircle, Target } from "lucide-react";

interface GoalCardProps {
  goal: GoalData;
  onEdit: () => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const { deleteGoal, completeWizard } = useGoalEngine();
  const [copied, setCopied] = useState(false);

  const toggleFavorite = () => {
    const updated = { ...goal, isFavorite: !goal.isFavorite };
    completeWizard(updated, `Toggled Favorite status to ${updated.isFavorite}`);
  };

  const togglePin = () => {
    const updated = { ...goal, isPinned: !goal.isPinned };
    completeWizard(updated, `Toggled Pin status to ${updated.isPinned}`);
  };

  const toggleArchive = () => {
    const updated = { ...goal, isArchived: !goal.isArchived };
    completeWizard(updated, `Toggled Archive status to ${updated.isArchived}`);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`My ExamForge Goal: Cracking the ${goal.targetExam} on ${goal.timeline.examDate}!`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Remaining days percentage progress
  const totalDays = Math.max(1, goal.timeline.remainingDays + 60);
  const daysPercentage = Math.round((goal.timeline.remainingDays / totalDays) * 100);
  const syllabus = goal.profile.syllabusPercent || 0;

  // SVG parameters for circular progress
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (syllabus / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative p-6 min-h-[320px] rounded-3xl premium-card premium-card-hover flex flex-col justify-between overflow-hidden ${
        goal.isPinned
          ? "ring-2 ring-indigo-500/10 shadow-indigo-100/50"
          : ""
      }`}
    >
      {/* Decorative gradient corner mesh */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -z-10 transition-colors ${
        goal.isPinned ? "bg-indigo-100/40" : "bg-slate-50"
      }`} />

      {/* Header Info */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-4">
          <div className="relative shrink-0 w-14 h-14 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 flex items-center justify-center shadow-xs overflow-hidden">
            {goal.profile.avatar ? (
              <img src={goal.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Target className="w-6 h-6 text-indigo-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {goal.examCategory || "General Exam"}
              </span>
              {goal.isFavorite && (
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 filter drop-shadow-xs" />
              )}
            </div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight mt-1">{goal.targetExam}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Success roadmap for {goal.profile.fullName}
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={togglePin}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              goal.isPinned ? "bg-white text-indigo-600 shadow-xs scale-105" : "text-slate-400 hover:text-slate-700"
            }`}
            title="Pin Goal"
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFavorite}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              goal.isFavorite ? "bg-white text-amber-500 shadow-xs scale-105" : "text-slate-400 hover:text-slate-700"
            }`}
            title="Favorite Goal"
          >
            <Star className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleArchive}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              goal.isArchived ? "bg-white text-slate-700 shadow-xs scale-105" : "text-slate-400 hover:text-slate-750"
            }`}
            title="Archive Goal"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-200/80 mx-0.5" />
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all cursor-pointer"
            title="Edit Parameters"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={deleteGoal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-650 hover:bg-white transition-all cursor-pointer"
            title="Delete Goal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary Box */}
      <div className="my-4.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100/50 flex items-start gap-2.5">
        <span className="text-indigo-500 text-sm mt-0.5">“</span>
        <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
          {goal.summary || "Your success blueprint has been configured. Complete daily planning goals to build performance."}
        </p>
      </div>

      {/* Center Metrics (Visual Grid) */}
      <div className="grid grid-cols-3 gap-3 border-y border-slate-100 py-3.5 my-1">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-500" /> Rem. Days
          </span>
          <span className="text-base font-black text-slate-800 mt-1">{goal.timeline.remainingDays} Days</span>
        </div>

        <div className="flex flex-col items-center justify-center text-center border-x border-slate-100">
          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-500 animate-bounce" /> Success Predictor
          </span>
          <span className="text-base font-black text-indigo-600 mt-1">{goal.timeline.successPrediction}%</span>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-500" /> Daily Target
          </span>
          <span className="text-base font-black text-slate-800 mt-1">{goal.timeline.dailyStudyHours} Hrs</span>
        </div>
      </div>

      {/* Footer Info & Progress Circular indicator */}
      <div className="mt-4 flex justify-between items-center text-xs">
        <div className="flex items-center gap-3">
          {/* SVG Progress Circle */}
          <div className="relative w-12 h-12 shrink-0">
            <svg className="w-full h-full transform -rotate-95">
              <circle cx="24" cy="24" r={radius} className="text-slate-100" strokeWidth="3" fill="transparent" stroke="currentColor" />
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="text-indigo-600 transition-all duration-500"
                strokeWidth="3.5"
                fill="transparent"
                stroke="currentColor"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-700">
              {syllabus}%
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Syllabus Status</span>
            <span className="text-[11px] font-black text-slate-700">{syllabus}% Completed</span>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="text-indigo-600 hover:text-indigo-700 text-xs font-extrabold flex items-center gap-1 cursor-pointer bg-indigo-50/50 px-3.5 py-2 rounded-xl hover:bg-indigo-50 border border-indigo-100/50 transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? "Link Copied!" : "Share Goal"}</span>
        </button>
      </div>
    </motion.div>
  );
}

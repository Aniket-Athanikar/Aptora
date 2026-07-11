"use client";

import React from "react";
import { TrendingUp, BarChart2, Star, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { useDashboard } from "../DashboardContext";

export const AnalyticsTab: React.FC = () => {
  const { userProfile, wizardData } = useDashboard();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start select-none">
      {/* Primary Column (Left 2 Columns) */}
      <div className="xl:col-span-2 space-y-8">
        
        {/* Tab Header */}
        <div className="border-b border-[#E9ECF8] pb-4">
          <h2 className="text-2xl font-black text-neutral-900">Performance Analytics</h2>
          <p className="text-xs text-neutral-400 font-medium mt-1">Detailed breakdown of study progress, mock test accuracy, and subject diagnostics.</p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: "Target Score", val: `${wizardData.targetScore}%`, desc: "Required for passing", icon: Target, color: "text-indigo-600 bg-indigo-50" },
            { label: "Average Mock Score", val: "84%", desc: "Based on last 5 mocks", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
            { label: "XP Levels", val: `${userProfile?.xp || 320} XP`, desc: "Rank cohort: 92nd percentile", icon: Star, color: "text-amber-600 bg-amber-50" },
            { label: "Completed Topics", val: "18 / 45", desc: "40% Syllabus progression", icon: CheckCircle2, color: "text-pink-600 bg-pink-50" }
          ].map((kpi, idx) => {
            const IconComp = kpi.icon;
            return (
              <div key={idx} className="bg-white border border-[#E9ECF8] rounded-[24px] p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">{kpi.label}</span>
                  <div className={`p-2 rounded-xl ${kpi.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-2xl font-black text-neutral-900">{kpi.val}</span>
                  <span className="block text-[10px] text-neutral-400 font-semibold">{kpi.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Analytics - Accuracy */}
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <h3 className="font-extrabold text-neutral-900 text-base">Topic Accuracy Benchmark</h3>
            <BarChart2 className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="space-y-5">
            {[
              { label: "Quantitative Aptitude", accuracy: 82, color: "bg-indigo-600" },
              { label: "Reasoning Ability", accuracy: 91, color: "bg-purple-600" },
              { label: "English Vocabulary", accuracy: 76, color: "bg-pink-600" },
              { label: "General Awareness", accuracy: 68, color: "bg-amber-500" }
            ].map((sub, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-neutral-800">
                  <span>{sub.label}</span>
                  <span>{sub.accuracy}% Accuracy</span>
                </div>
                <div className="w-full bg-neutral-50 h-3 rounded-full overflow-hidden border border-neutral-100">
                  <div className={`h-full ${sub.color}`} style={{ width: `${sub.accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auxiliary Column (Right Column) */}
      <div className="xl:col-span-1 space-y-8 pt-0 xl:pt-[4.5rem]">
        {/* Weekly study hours distribution */}
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <h3 className="text-xs font-extrabold text-neutral-900">Weekly Tracking</h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Goal Reached!</span>
          </div>

          <div className="grid grid-cols-7 gap-2 items-end h-40 pt-2">
            {[
              { day: "M", hrs: 4.2 },
              { day: "T", hrs: 3.5 },
              { day: "W", hrs: 5.0 },
              { day: "T", hrs: 2.1 },
              { day: "F", hrs: 4.8 },
              { day: "S", hrs: 6.2 },
              { day: "S", hrs: 1.5 }
            ].map((d, idx) => {
              const maxHrs = 8;
              const heightPct = Math.round((d.hrs / maxHrs) * 100);
              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end font-bold">
                  <span className="text-[8px] text-neutral-400">{d.hrs}h</span>
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-500 to-purple-600 rounded-t-sm transition-all" 
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[9px] text-neutral-500">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak Subjects Highlight */}
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-extrabold text-neutral-900">Focus Areas</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {wizardData.subjects.length > 0 ? (
              wizardData.subjects.map((sub, idx) => (
                <div key={idx} className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                  <span className="block text-[10px] uppercase font-bold text-red-500 mb-1">Needs Improvement</span>
                  <span className="block text-xs font-extrabold text-neutral-800">{sub}</span>
                </div>
              ))
            ) : (
              <div className="p-3 bg-[#FAFBFF] border border-neutral-200/50 rounded-xl">
                <span className="block text-xs font-extrabold text-neutral-800 text-center">No weak subjects identified yet.</span>
              </div>
            )}
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl mt-4">
              <span className="block text-[10px] uppercase font-bold text-emerald-500 mb-1">Strongest Area</span>
              <span className="block text-xs font-extrabold text-neutral-800">Reasoning Ability</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

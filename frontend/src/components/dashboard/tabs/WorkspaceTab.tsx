"use client";

import React from "react";
import { 
  Sparkles, 
  Flame, 
  Check, 
  TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "../DashboardContext";

export const WorkspaceTab: React.FC = () => {
  const {
    userProfile,
    wizardData,
    dailyTasks,
    toggleDailyTask,
    activeGoalFocus,
    setActiveGoalFocus,
    toast
  } = useDashboard();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
      {/* Primary Column (Left 2 Columns) */}
      <div className="xl:col-span-2 space-y-8">
        
        {/* Banner Card Greeting */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-neutral-950 rounded-[28px] p-6 md:p-8 relative overflow-hidden border border-indigo-950/40 text-white shadow-xl shadow-indigo-950/15">
          <div className="absolute top-0 right-0 w-[45%] h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-indigo-600/10 filter blur-[40px] pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider bg-indigo-950/50 w-fit px-3 py-1 rounded-full border border-indigo-800/40">
              <Sparkles className="w-3.5 h-3.5 fill-indigo-500/10" />
              <span>Personalized Study Arena</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">{userProfile?.name || "Learner"}</span>!
              </h1>
              <p className="text-xs md:text-sm text-neutral-300 max-w-lg font-medium leading-relaxed">
                Your ExamForge AI study plan is active for the <span className="text-indigo-400 font-bold">{wizardData.exam}</span>. Let&apos;s tackle today&apos;s core requirements!
              </p>
            </div>

            {/* Quick Metrics Bar inside Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3.5 gap-4 pt-4 border-t border-indigo-900/50">
              <div className="space-y-1">
                <span className="block text-[10px] text-indigo-300/80 font-bold uppercase tracking-wider">Target Exam</span>
                <span className="block text-sm font-black">{wizardData.exam}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] text-indigo-300/80 font-bold uppercase tracking-wider">Current Streak</span>
                <span className="block text-sm font-black flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {userProfile?.streak || 4} Days
                </span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] text-indigo-300/80 font-bold uppercase tracking-wider">Target Rating</span>
                <span className="block text-sm font-black text-emerald-400">
                  {wizardData.targetScore}% Accuracy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Recommendations Checklist */}
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-neutral-900 text-base">Priority AI Recommendations</h3>
            </div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Real-time Analysis</span>
          </div>

          <div className="space-y-4">
            {[
              { title: "Review Quadratic Equation Roots", tag: "Math / Quant", color: "bg-indigo-50 border-indigo-200/50 text-indigo-600", desc: "You have completed 3 tests with lower scores here." },
              { title: "Revise English Grammatical Regulations", tag: "Verbal / English", color: "bg-purple-50 border-purple-200/50 text-purple-600", desc: "Spacing interval recommendation based on your syllabus outline." },
              { title: "Attempt General Studies Mini-Mock Series", tag: "GS / General Study", color: "bg-amber-50 border-amber-200/50 text-amber-600", desc: "Strengthen memory recall by attempting 10 targeted analytical questions." }
            ].map((rec, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl bg-neutral-50/50 border border-neutral-100 hover:bg-neutral-50 transition-colors">
                <div className="space-y-2 flex-grow">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-bold text-xs text-neutral-800">{rec.title}</span>
                    <span className={cn("px-2 py-0.5 rounded border text-[9px] font-bold", rec.color)}>
                      {rec.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed">{rec.desc}</p>
                </div>
                <button
                  onClick={() => toast(`Loading module for ${rec.title}...`, "success")}
                  className="px-3.5 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg text-[10px] font-bold text-neutral-700 cursor-pointer shadow-sm shrink-0 self-center"
                >
                  Start Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Habits Tracker (CRUD List) */}
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-indigo-600 stroke-[3]" />
              <h3 className="font-extrabold text-neutral-900 text-base">Daily Habits Checklist</h3>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              +{dailyTasks.filter((t) => !t.completed).length * 10} XP Remaining
            </span>
          </div>

          <div className="space-y-3.5">
            {dailyTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleDailyTask(task.id)}
                className={cn(
                  "p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:bg-neutral-50/50",
                  task.completed ? "border-emerald-200 bg-emerald-50/10 text-neutral-400" : "border-neutral-200 bg-white"
                )}
              >
                <div className="flex items-center gap-3.5 pr-4">
                  <div className={cn(
                    "w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors",
                    task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-neutral-300 bg-white"
                  )}>
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className={cn(
                    "text-xs font-bold leading-normal",
                    task.completed ? "line-through text-neutral-400 font-semibold" : "text-neutral-800"
                  )}>
                    {task.label}
                  </span>
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0",
                  task.completed ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                )}>
                  +{task.xpReward} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auxiliary Column (Right Column) */}
      <div className="xl:col-span-1 space-y-8">
        
        {/* Personalized Setup Selection Data Card */}
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-extrabold text-neutral-900">Personalized Goal Sheet</span>
            </div>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Active Plan</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3 bg-[#FAFBFF] rounded-xl border border-neutral-200/50">
              <span className="block text-[9px] uppercase font-bold text-neutral-400">Target Exam</span>
              <span className="block text-xs font-extrabold text-neutral-800 truncate">
                {wizardData.exam === "Other" ? (wizardData.language.replace("Custom:", "") || "Custom Exam") : wizardData.exam}
              </span>
            </div>
            <div className="p-3 bg-[#FAFBFF] rounded-xl border border-neutral-200/50">
              <span className="block text-[9px] uppercase font-bold text-neutral-400">Prep Stage</span>
              <span className="block text-xs font-extrabold text-neutral-800">{wizardData.knowledgeLevel}</span>
            </div>
            <div className="p-3 bg-[#FAFBFF] rounded-xl border border-neutral-200/50">
              <span className="block text-[9px] uppercase font-bold text-neutral-400">Daily Study</span>
              <span className="block text-xs font-extrabold text-neutral-800">{wizardData.dailyAvailability} / Day</span>
            </div>
            <div className="p-3 bg-[#FAFBFF] rounded-xl border border-neutral-200/50">
              <span className="block text-[9px] uppercase font-bold text-neutral-400">Goal Timeline</span>
              <span className="block text-xs font-extrabold text-neutral-800">{wizardData.targetDays === -1 ? "Custom" : `${wizardData.targetDays} Days`}</span>
            </div>
          </div>

          {wizardData.subjects.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <span className="block text-[9px] uppercase font-bold text-neutral-400">Weak Subjects (Focus Areas)</span>
              <div className="flex flex-wrap gap-1.5">
                {wizardData.subjects.map((sub) => (
                  <span key={sub} className="px-2 py-1 bg-indigo-50/50 border border-indigo-100 text-indigo-700 text-[10px] rounded font-bold">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Focus Section */}
        {wizardData.goals && wizardData.goals.length > 0 && (
          <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
            <span className="text-xs font-extrabold text-neutral-900 border-b border-neutral-100 pb-3 block">Current Focus Goals</span>
            <div className="flex flex-wrap gap-2">
              {wizardData.goals.map((g) => {
                const active = activeGoalFocus === g;
                return (
                  <button
                    key={g}
                    onClick={() => setActiveGoalFocus(g)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border font-bold text-xs cursor-pointer transition-all",
                      active
                        ? "border-[#6D4AFF] bg-[#6D4AFF]/5 text-[#6D4AFF]"
                        : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Syllabus Progress gauges */}
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <span className="text-xs font-extrabold text-neutral-900">Syllabus Progress</span>
            <span className="text-[10px] font-black text-indigo-600">32% Completed</span>
          </div>

          <div className="space-y-4">
            {[
              { title: "Quantitative Aptitude", pct: 45, color: "bg-indigo-600" },
              { title: "Reasoning & Analytical", pct: 60, color: "bg-purple-600" },
              { title: "English Language", pct: 25, color: "bg-pink-600" },
              { title: "General Awareness", pct: 15, color: "bg-amber-500" }
            ].map((subj, idx) => (
              <div key={idx} className="space-y-1.5 font-bold">
                <div className="flex justify-between text-[11px] text-neutral-700">
                  <span>{subj.title}</span>
                  <span>{subj.pct}%</span>
                </div>
                <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                  <div className={cn("h-full", subj.color)} style={{ width: `${subj.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Focus Outline */}
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
          <span className="text-xs font-extrabold text-neutral-900 border-b border-neutral-100 pb-3 block">Weekly Target Outline</span>
          <div className="space-y-3.5">
            {[
              { day: "Mon - Tue", label: "Solve algebra drills & formulas sheets", completed: true },
              { day: "Wed - Thu", label: "Attempt verbal cloze passage test", completed: false },
              { day: "Fri - Sat", label: "GS Constitution structure review", completed: false },
              { day: "Sunday", label: "Attempt full mock test prep session", completed: false }
            ].map((wk, idx) => (
              <div key={idx} className="flex gap-3 items-start text-xs font-semibold">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0">{wk.day}</span>
                <p className={cn("text-neutral-700 leading-normal", wk.completed && "line-through text-neutral-400")}>{wk.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

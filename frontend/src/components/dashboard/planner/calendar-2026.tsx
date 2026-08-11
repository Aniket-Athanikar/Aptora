"use client";

import React, { useState, useEffect } from "react";
import { GoalData } from "@/types/goal.types";
import { useToast } from "@/lib/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles,
  Trash2, Edit3, X, Clock, BookOpen, AlertCircle, Compass
} from "lucide-react";

interface Calendar2026Props {
  goal?: GoalData | null;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface StudySession {
  hours: number;
  subject: string;
  notes: string;
  timestamp: string;
}

export function Calendar2026({ goal }: Calendar2026Props) {
  const { toast } = useToast();
  const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());

  const [studyDays, setStudyDays] = useState<number[]>([]);
  const [sessionDetails, setSessionDetails] = useState<Record<number, StudySession>>({});

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editHours, setEditHours] = useState<number>(4);
  const [editSubject, setEditSubject] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Hydrate CRUD state from local storage on mount
  useEffect(() => {
    if (!goal || typeof window === "undefined") return;
    const storageKey = `examforge_calendar_sessions_${goal.id}_${currentMonthIdx}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessionDetails(parsed.details || {});
        setStudyDays(parsed.days || []);
      } catch (e) {
        console.error("Failed to parse calendar sessions:", e);
      }
    } else {
      const defaultSubjects = goal.weaknesses.map((w) => w.subject);
      const seedDetails: Record<number, StudySession> = {};
      const seedDays: number[] = [];

      [4, 8, 12, 18, 22].forEach((day) => {
        const sub = defaultSubjects[day % defaultSubjects.length] || "General Revision";
        seedDays.push(day);
        seedDetails[day] = {
          hours: Math.round(5 + (day % 4)),
          subject: sub,
          notes: `Completed targeted syllabus sprint for ${sub} focusing on core gaps.`,
          timestamp: new Date().toISOString()
        };
      });

      setSessionDetails(seedDetails);
      setStudyDays(seedDays);
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, JSON.stringify({ details: seedDetails, days: seedDays }));
      }
    }
  }, [goal, currentMonthIdx]);

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200/80 rounded-[32px] shadow-xs text-center space-y-4 max-w-md mx-auto my-12">
        <div className="w-12 h-12 bg-indigo-50 text-[#6D4AFF] rounded-2xl flex items-center justify-center animate-pulse">
          <CalendarIcon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-900">Calibrating Planner</h4>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Please run the Calibration Wizard or update your Active Goal to unlock the success calendar.
          </p>
        </div>
      </div>
    );
  }

  const currentMonth = MONTHS[currentMonthIdx];
  const examDateObj = new Date(goal.timeline.examDate);
  const isExamMonth = examDateObj.getFullYear() === 2026 && examDateObj.getMonth() === currentMonthIdx;
  const examDay = isExamMonth ? examDateObj.getDate() : null;

  const saveSessions = (updatedDetails: Record<number, StudySession>, updatedDays: number[]) => {
    const storageKey = `examforge_calendar_sessions_${goal.id}_${currentMonthIdx}`;
    setSessionDetails(updatedDetails);
    setStudyDays(updatedDays);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify({ details: updatedDetails, days: updatedDays }));
    }
  };

  const getMonthConfig = (idx: number) => {
    switch (idx) {
      case 0: return { offset: 4, days: 31 };
      case 1: return { offset: 0, days: 28 };
      case 2: return { offset: 0, days: 31 };
      case 3: return { offset: 3, days: 30 };
      case 4: return { offset: 5, days: 31 };
      case 5: return { offset: 1, days: 30 };
      case 6: return { offset: 3, days: 31 };
      case 7: return { offset: 6, days: 31 };
      case 8: return { offset: 2, days: 30 };
      case 9: return { offset: 4, days: 31 };
      case 10: return { offset: 0, days: 30 };
      case 11: return { offset: 2, days: 31 };
      default: return { offset: 0, days: 30 };
    }
  };

  const { offset, days } = getMonthConfig(currentMonthIdx);
  const gridCells = Array.from({ length: offset + days }, (_, i) => i);

  const handleCellClick = (date: number) => {
    setSelectedDate(date);
    setValidationError(null);
    const existing = sessionDetails[date];
    if (existing) {
      setEditHours(existing.hours);
      setEditSubject(existing.subject);
      setEditNotes(existing.notes);
      setIsEditing(false);
    } else {
      setEditHours(goal.timeline.dailyStudyHours || 6);
      setEditSubject(goal.weaknesses[0]?.subject || "General Revision");
      setEditNotes("");
      setIsEditing(true);
    }
  };

  // Validation & Save (Create/Update CRUD)
  const handleSaveSession = () => {
    if (!editSubject.trim()) {
      setValidationError("Please select a subject module.");
      return;
    }
    if (editHours <= 0 || editHours > 18) {
      setValidationError("Study hours must be between 1 and 18 hours.");
      return;
    }
    if (selectedDate === null) return;

    const updatedDetails = {
      ...sessionDetails,
      [selectedDate]: {
        hours: editHours,
        subject: editSubject,
        notes: editNotes.trim(),
        timestamp: new Date().toISOString()
      }
    };
    const updatedDays = studyDays.includes(selectedDate) ? studyDays : [...studyDays, selectedDate];
    saveSessions(updatedDetails, updatedDays);
    setIsEditing(false);
    setSelectedDate(null);
    toast(`Logged ${editHours}h study block for ${editSubject}!`, "success");
  };

  // Delete (CRUD)
  const handleDeleteSession = () => {
    if (selectedDate === null) return;
    const updatedDays = studyDays.filter((d) => d !== selectedDate);
    const updatedDetails = { ...sessionDetails };
    delete updatedDetails[selectedDate];
    saveSessions(updatedDetails, updatedDays);
    setSelectedDate(null);
    toast("Study session removed from calendar.", "info");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto pb-10">
      
      {/* LEFT: Calendar view (2/3 width) */}
      <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
        
        {/* Header Controls */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-wrap gap-3">
          <div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
              <CalendarIcon className="w-4.5 h-4.5 text-emerald-600" /> Success Calendar 2026
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Interactive daily study block scheduler. Click cells to log or edit sessions.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonthIdx((prev) => (prev > 0 ? prev - 1 : 11))}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black text-slate-900 min-w-[100px] text-center uppercase tracking-wide">
              {currentMonth} 2026
            </span>
            <button
              onClick={() => setCurrentMonthIdx((prev) => (prev < 11 ? prev + 1 : 0))}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
          {DAYS_OF_WEEK.map((d) => (
            <span key={d} className="py-1">{d}</span>
          ))}

          {gridCells.map((val) => {
            const isDateCell = val >= offset;
            const date = val - offset + 1;
            const isStudied = isDateCell && studyDays.includes(date);
            const isToday = isDateCell && new Date().getDate() === date && new Date().getMonth() === currentMonthIdx;
            const isExam = isDateCell && examDay === date;

            return (
              <button
                key={val}
                disabled={!isDateCell}
                onClick={() => handleCellClick(date)}
                className={`p-2 rounded-2xl relative flex flex-col items-center justify-center h-12 border transition-all select-none ${
                  !isDateCell
                    ? "border-transparent text-transparent bg-transparent cursor-default"
                    : isExam
                    ? "bg-rose-500 border-rose-500 text-white font-extrabold cursor-pointer hover:scale-105"
                    : isToday
                    ? "border-emerald-600 text-emerald-600 bg-emerald-50 font-black cursor-pointer hover:scale-105 shadow-3xs"
                    : isStudied
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-extrabold cursor-pointer hover:bg-emerald-100/50 hover:scale-105"
                    : "border-slate-100 text-slate-600 hover:bg-slate-50 cursor-pointer hover:scale-105"
                }`}
              >
                {isDateCell ? (
                  <>
                    <span className="text-xs">{date}</span>
                    {isStudied && !isExam && (
                      <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    {isExam && (
                      <span className="absolute -top-1.5 right-0 text-[7px] bg-white text-rose-600 font-black border border-rose-100 px-1 rounded-md shadow-xs">EXAM</span>
                    )}
                  </>
                ) : (
                  ""
                )}
              </button>
            );
          })}
        </div>

        {/* Current Month Statistics */}
        <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" /> Consistency streak: {studyDays.length} Days logged in {currentMonth}
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">On Target</span>
        </div>

      </div>

      {/* RIGHT: Cockpit & Syllabus Priorities (1/3 width) */}
      <div className="space-y-6">
        
        {/* Cockpit Calibration Card - Crisp Light Gradient */}
        <div className="bg-gradient-to-br from-white via-emerald-50/60 to-amber-50/40 text-slate-900 rounded-3xl p-6 shadow-xs relative overflow-hidden border border-emerald-100/90 space-y-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest border-b border-emerald-100/60 pb-2 flex items-center gap-1.5">
            <Compass className="w-4 h-4" /> Cockpit Calibration
          </h3>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-[9px] text-slate-400 block font-black uppercase tracking-wider">Exam Target</span>
              <p className="font-black text-slate-900 mt-0.5">{goal.targetExam}</p>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-black uppercase tracking-wider">Target Date</span>
              <p className="font-black text-slate-900 mt-0.5">{goal.timeline.examDate} ({goal.timeline.remainingDays} Days Left)</p>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-black uppercase tracking-wider">Daily Hours Target</span>
              <p className="font-black text-emerald-700 mt-0.5">{goal.timeline.dailyStudyHours} Hours Study Slot</p>
            </div>
          </div>
        </div>

        {/* Wizard Syllabus Priority List */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Wizard Priority Gaps</h3>
          <p className="text-[9px] text-slate-400 font-semibold pl-0.5">Syllabus priorities calibrated during onboarding.</p>

          <div className="space-y-2.5">
            {goal.weaknesses.map((w) => (
              <div 
                key={w.subject}
                className="flex items-center justify-between p-3 bg-slate-50/60 border border-slate-200/50 rounded-2xl"
              >
                <div>
                  <h4 className="text-xs font-black text-slate-800 leading-tight">{w.subject}</h4>
                  <span className="text-[8px] text-slate-400 font-bold block mt-0.5">Confidence: {w.confidence}/5</span>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  w.priority === "High"
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : w.priority === "Medium"
                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}>
                  {w.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CRUD Session Log Overlay Modal */}
      <AnimatePresence>
        {selectedDate !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-white border border-slate-200 p-6 rounded-[32px] shadow-2xl space-y-5"
            >
              
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Log for {currentMonth} {selectedDate}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {isEditing ? (
                <div className="space-y-4">
                  {/* Duration Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between pl-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Study Duration</label>
                      <span className="text-[10px] font-black text-emerald-700">{editHours} Hours</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="16"
                      value={editHours}
                      onChange={(e) => setEditHours(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  {/* Subject Module Select */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Subject Module</label>
                    <select
                      value={editSubject}
                      onChange={(e) => {
                        setEditSubject(e.target.value);
                        setValidationError(null);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
                    >
                      {goal.weaknesses.map((w) => (
                        <option key={w.subject} value={w.subject}>{w.subject}</option>
                      ))}
                      <option value="General Revision">General Revision</option>
                      <option value="Custom Sprints">Custom Sprints</option>
                    </select>
                  </div>

                  {/* Outcomes & Notes */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Study Outcomes & Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="e.g., Solved formulas, compiled chapter notes..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-emerald-500 focus:bg-white resize-none transition-all"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={handleSaveSession}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-emerald-600/10"
                    >
                      Save Log
                    </button>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Read Only Session Overview */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-emerald-50/40 border border-emerald-100/50 p-3.5 rounded-2xl">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest block">Duration Logged</span>
                        <span className="text-xs font-black text-slate-800">{sessionDetails[selectedDate]?.hours} Hours Study Block</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-teal-50/40 border border-teal-100/50 p-3.5 rounded-2xl">
                      <BookOpen className="w-4 h-4 text-teal-600 shrink-0" />
                      <div>
                        <span className="text-[9px] text-teal-500 font-black uppercase tracking-widest block">Subject Module</span>
                        <span className="text-xs font-black text-slate-800">{sessionDetails[selectedDate]?.subject}</span>
                      </div>
                    </div>

                    {sessionDetails[selectedDate]?.notes && (
                      <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl">
                        <span className="text-[9px] text-slate-400 font-black uppercase block mb-1 tracking-widest">Outcomes & Comments</span>
                        <p className="text-[11px] font-bold text-slate-600 leading-relaxed">{sessionDetails[selectedDate]?.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Modal Actions */}
                  <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={handleDeleteSession}
                      className="px-4.5 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete
                    </button>
                  </div>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

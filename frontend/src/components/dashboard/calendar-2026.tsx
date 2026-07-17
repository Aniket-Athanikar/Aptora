"use client";

import React, { useState } from "react";
import { GoalData } from "@/types/goal.types";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Clock,
  BookOpen,
  Star
} from "lucide-react";

interface Calendar2026Props {
  goal: GoalData;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar2026({ goal }: Calendar2026Props) {
  const [currentMonthIdx, setCurrentMonthIdx] = useState(6); // July

  const [studyDays, setStudyDays] = useState<number[]>([2, 5, 6, 9, 10, 11, 14, 15, 16, 20, 21, 23, 24, 27, 28]);
  const [sessionDetails, setSessionDetails] = useState<Record<number, { hours: number; subject: string; notes: string }>>({
    2: { hours: 6, subject: "Algorithms", notes: "Completed dynamic programming exercises" },
    5: { hours: 4, subject: "DBMS", notes: "Reviewed ACID properties and transaction isolation levels" },
    6: { hours: 5, subject: "System Design", notes: "Designed a rate limiter using token bucket algorithm" },
    9: { hours: 8, subject: "GATE Engineering Math", notes: "Solved linear algebra and calculus questions" },
    10: { hours: 6, subject: "Operating Systems", notes: "Studied process scheduling algorithms" },
    11: { hours: 5, subject: "Computer Networks", notes: "Parsed TCP/IP headers and congestion control states" },
    14: { hours: 7, subject: "Algorithms", notes: "Solved graph traversal and shortest path challenges" },
    15: { hours: 5, subject: "DBMS", notes: "Analyzed query execution plans and index scans" },
    16: { hours: 4, subject: "Operating Systems", notes: "Practiced memory paging scenarios" },
    20: { hours: 6, subject: "Computer Networks", notes: "Wrote study notes on DNS and HTTP protocols" },
    21: { hours: 5, subject: "System Design", notes: "Read key-value store architecture designs" },
    23: { hours: 8, subject: "GATE CS PYQs", notes: "Completed full-length mock paper 1" },
    24: { hours: 7, subject: "Algorithms", notes: "Worked on string matching and suffix trees" },
    27: { hours: 6, subject: "DBMS", notes: "Reviewed concurrency control protocols" },
    28: { hours: 5, subject: "Operating Systems", notes: "Learned deadlock detection techniques" }
  });

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editHours, setEditHours] = useState<number>(4);
  const [editSubject, setEditSubject] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");

  const currentMonth = MONTHS[currentMonthIdx];
  const examDay = currentMonthIdx === 9 ? 4 : null; // UPSC target preset is Oct 4, 2026

  const getMonthConfig = (idx: number) => {
    switch (idx) {
      case 0: return { offset: 4, days: 31 }; // Jan 2026 starts Thursday
      case 1: return { offset: 0, days: 28 }; // Feb starts Sunday
      case 2: return { offset: 0, days: 31 }; // Mar starts Sunday
      case 3: return { offset: 3, days: 30 }; // Apr starts Wednesday
      case 4: return { offset: 5, days: 31 }; // May starts Friday
      case 5: return { offset: 1, days: 30 }; // Jun starts Monday
      case 6: return { offset: 3, days: 31 }; // Jul starts Wednesday
      case 7: return { offset: 6, days: 31 }; // Aug starts Saturday
      case 8: return { offset: 2, days: 30 }; // Sep starts Tuesday
      case 9: return { offset: 4, days: 31 }; // Oct starts Thursday
      case 10: return { offset: 0, days: 30 }; // Nov starts Sunday
      case 11: return { offset: 2, days: 31 }; // Dec starts Tuesday
      default: return { offset: 0, days: 30 };
    }
  };

  const { offset, days } = getMonthConfig(currentMonthIdx);
  const gridCells = Array.from({ length: offset + days }, (_, i) => i);

  const handleCellClick = (date: number) => {
    setSelectedDate(date);
    const existing = sessionDetails[date];
    if (existing) {
      setEditHours(existing.hours);
      setEditSubject(existing.subject);
      setEditNotes(existing.notes);
      setIsEditing(false);
    } else {
      setEditHours(4);
      setEditSubject("");
      setEditNotes("");
      setIsEditing(true);
    }
  };

  return (
    <div className="glass border border-white/20 p-6 space-y-4 rounded-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-indigo-600 animate-pulse-subtle" /> Success Calendar 2026
          </h3>
          <p className="text-xs text-gray-400">Click any date cell to log, view, edit or delete study sessions.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonthIdx((prev) => (prev > 0 ? prev - 1 : 11))}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-gray-800 min-w-[90px] text-center">
            {currentMonth} 2026
          </span>
          <button
            onClick={() => setCurrentMonthIdx((prev) => (prev < 11 ? prev + 1 : 0))}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {DAYS_OF_WEEK.map((d) => (
          <span key={d} className="font-bold text-gray-400 py-1">{d}</span>
        ))}

        {gridCells.map((val) => {
          const isDateCell = val >= offset;
          const date = val - offset + 1;
          const isStudied = isDateCell && studyDays.includes(date);
          const isToday = isDateCell && currentMonthIdx === 6 && date === 14;
          const isExam = isDateCell && examDay === date;

          return (
            <button
              key={val}
              disabled={!isDateCell}
              onClick={() => handleCellClick(date)}
              className={`p-2 rounded-xl relative flex flex-col items-center justify-center h-10 border transition-all ${
                !isDateCell
                  ? "border-transparent text-transparent bg-transparent cursor-default"
                  : isExam
                    ? "bg-red-500 border-red-500 text-white font-extrabold cursor-pointer hover:scale-105"
                    : isToday
                      ? "border-indigo-600 text-indigo-700 bg-indigo-50 font-black cursor-pointer hover:scale-105"
                      : isStudied
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold cursor-pointer hover:bg-emerald-100/50 hover:scale-105"
                        : "border-gray-50 text-gray-600 hover:bg-gray-50 cursor-pointer hover:scale-105"
              }`}
            >
              {isDateCell ? (
                <>
                  <span className="text-[11px]">{date}</span>
                  {isStudied && !isExam && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-subtle" />
                  )}
                  {isExam && (
                    <span className="absolute -top-1 right-0 text-[8px] bg-white text-red-600 font-extrabold px-1 rounded-md shadow-xs">EXAM</span>
                  )}
                </>
              ) : (
                ""
              )}
            </button>
          );
        })}
      </div>

      {currentMonthIdx === 6 && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between shadow-2xs">
          <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> consistency streak: {studyDays.length} Days logged
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">On Target</span>
        </div>
      )}

      {/* CRUD Event Editor Popover/Modal */}
      {selectedDate !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-md glass p-6 rounded-3xl border border-white/20 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100/50 pb-3">
              <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-indigo-650" /> Session for {currentMonth} {selectedDate}, 2026
              </h4>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1 rounded-full hover:bg-slate-100/50 text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Study Hours ({editHours} hrs)</label>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={editHours}
                    onChange={(e) => setEditHours(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                    <span>1 Hour</span>
                    <span>8 Hours</span>
                    <span>16 Hours</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Subject</label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    placeholder="e.g. Algorithms, DBMS, Chemistry"
                    className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs bg-white focus:outline-none focus:border-indigo-600 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Study Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add brief details about what you studied..."
                    rows={3}
                    className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs bg-white focus:outline-none focus:border-indigo-600 font-semibold resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (!editSubject.trim()) return;
                      setSessionDetails(prev => ({
                        ...prev,
                        [selectedDate]: { hours: editHours, subject: editSubject, notes: editNotes }
                      }));
                      if (!studyDays.includes(selectedDate)) {
                        setStudyDays(prev => [...prev, selectedDate]);
                      }
                      setIsEditing(false);
                    }}
                    disabled={!editSubject.trim()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" /> Save Session
                  </button>
                  <button
                    onClick={() => {
                      if (sessionDetails[selectedDate]) {
                        setIsEditing(false);
                      } else {
                        setSelectedDate(null);
                      }
                    }}
                    className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs cursor-pointer transition-all font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-indigo-50/50 border border-indigo-100/50 p-3.5 rounded-2xl shadow-3xs">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-[9px] text-indigo-400 font-bold uppercase block tracking-wider">Duration</span>
                      <span className="text-xs font-extrabold text-slate-800">{sessionDetails[selectedDate]?.hours} Hours Study Block</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100/50 p-3.5 rounded-2xl shadow-3xs">
                    <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase block tracking-wider">Subject / Module</span>
                      <span className="text-xs font-extrabold text-slate-800">{sessionDetails[selectedDate]?.subject}</span>
                    </div>
                  </div>

                  {sessionDetails[selectedDate]?.notes && (
                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1.5 tracking-wider font-black">Details & Outcomes</span>
                      <p className="text-xs font-medium text-gray-700 leading-relaxed">{sessionDetails[selectedDate]?.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100/50">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Edit3 className="w-4 h-4 text-gray-500" /> Edit Details
                  </button>
                  <button
                    onClick={() => {
                      setStudyDays(prev => prev.filter(d => d !== selectedDate));
                      const copy = { ...sessionDetails };
                      delete copy[selectedDate];
                      setSessionDetails(copy);
                      setSelectedDate(null);
                    }}
                    className="px-4 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all font-bold"
                    title="Delete Study Log"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

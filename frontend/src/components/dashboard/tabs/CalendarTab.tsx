"use client";

import React from "react";
import { Calendar, ChevronLeft, ChevronRight, X, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "../DashboardContext";

export const CalendarTab: React.FC = () => {
  const {
    currentYear,
    currentMonth,
    studyLogs,
    handlePrevMonth,
    handleNextMonth,
    handleDayClick,
    selectedCalendarDate,
    calendarHours,
    setCalendarHours,
    calendarNotes,
    setCalendarNotes,
    isCalendarModalOpen,
    setIsCalendarModalOpen,
    saveStudyLog,
    deleteStudyLog
  } = useDashboard();

  // Helper calendar calculations
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const blankDays: (null | number)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    blankDays.push(null);
  }
  const monthDays: number[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    monthDays.push(i);
  }
  const calendarDays = [...blankDays, ...monthDays];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start select-none">
      {/* Primary Column (Left 2 Columns) */}
      <div className="xl:col-span-2 space-y-8">
        <div className="border-b border-[#E9ECF8] pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-neutral-900">Study Planner & Calendar</h2>
            <p className="text-xs text-neutral-400 font-medium mt-1">Select any date to log study durations, notes, and view streak metrics.</p>
          </div>
        </div>

        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl cursor-pointer bg-white"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-600" />
            </button>
            <span className="font-extrabold text-neutral-800 text-sm px-4 py-2 border border-neutral-200 bg-white rounded-xl shadow-sm">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl cursor-pointer bg-white"
            >
              <ChevronRight className="w-4 h-4 text-neutral-600" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2.5 mb-4 text-center text-[10px] font-black text-neutral-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2.5 min-h-[300px]">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`blank-${idx}`} className="bg-neutral-50/20 border border-neutral-50 rounded-2xl" />;
              }
              const dateKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
              const logged = studyLogs[dateKey];
              
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "p-4 border rounded-2xl flex flex-col justify-between items-start transition-all cursor-pointer min-h-[90px] relative text-left group hover:scale-[1.03]",
                    logged 
                      ? "border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/50" 
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50"
                  )}
                >
                  <span className="text-xs font-bold text-neutral-800">{day}</span>
                  {logged ? (
                    <div className="w-full space-y-1">
                      <span className="block text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit">
                        {logged.hours}h logged
                      </span>
                      {logged.notes && (
                        <span className="block text-[9px] text-neutral-400 truncate w-full font-medium">
                          {logged.notes}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[9px] text-neutral-300 group-hover:text-neutral-400 font-semibold transition-colors">Log study</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Auxiliary Column (Right Column) */}
      <div className="xl:col-span-1 space-y-8 pt-0 xl:pt-[4.5rem]">
        
        {/* Today's Agenda */}
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-extrabold text-neutral-900">Today&apos;s Agenda</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { time: "09:00 AM", title: "Quantitative Aptitude Basics", type: "Study Session" },
              { time: "11:30 AM", title: "General Awareness Quiz", type: "Mock Test" },
              { time: "04:00 PM", title: "English Vocabulary Review", type: "Revision" }
            ].map((agenda, idx) => (
              <div key={idx} className="flex gap-3 items-start relative pb-4 border-l border-indigo-100 ml-2 pl-4 last:border-0 last:pb-0">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white bg-indigo-500 shadow-sm" />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400">{agenda.time}</span>
                  <p className="text-xs font-extrabold text-neutral-800">{agenda.title}</p>
                  <span className="inline-block text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {agenda.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-extrabold text-neutral-900">Upcoming Deadlines</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
              <span className="block text-[10px] uppercase font-bold text-amber-600 mb-1">Due in 3 Days</span>
              <span className="block text-xs font-extrabold text-neutral-800">Complete Weekly Mock Test #4</span>
            </div>
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl mt-4">
              <span className="block text-[10px] uppercase font-bold text-blue-600 mb-1">Due Next Week</span>
              <span className="block text-xs font-extrabold text-neutral-800">Finish Reasoning Syllabus</span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Modal Sheet for Calendar logging */}
      {isCalendarModalOpen && selectedCalendarDate && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9ECF8] rounded-[24px] shadow-2xl p-6 md:p-8 max-w-md w-full space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-neutral-900 text-base">Study Session Log</h3>
              </div>
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 font-bold text-xs text-neutral-600 flex justify-between">
                <span>Selected Date:</span>
                <span className="font-extrabold text-neutral-900">{selectedCalendarDate}</span>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-700 mb-1.5">Hours Studied</label>
                <input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={calendarHours}
                  onChange={(e) => setCalendarHours(parseFloat(e.target.value) || 2)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 text-sm font-semibold bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-700 mb-1.5">Topics Covered / Short Notes</label>
                <textarea
                  value={calendarNotes}
                  onChange={(e) => setCalendarNotes(e.target.value)}
                  placeholder="e.g. Completed geometry questions session #2"
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 text-xs font-semibold bg-white resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-neutral-100">
              {studyLogs[selectedCalendarDate] && (
                <button
                  onClick={deleteStudyLog}
                  className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl cursor-pointer bg-white"
                >
                  Delete Log
                </button>
              )}
              <button
                onClick={saveStudyLog}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer border-0 shadow-md shadow-indigo-600/10"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { GoalData } from "@/types/goal.types";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from "lucide-react";

interface Calendar2026Props {
  goal: GoalData;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar2026({ goal }: Calendar2026Props) {
  // Hardcoded 2026 calendar view focusing on July 2026
  const [currentMonthIdx, setCurrentMonthIdx] = useState(6); // July
  const currentMonth = MONTHS[currentMonthIdx];

  // Mock calendar study session allocations
  const activeStudyDays = [2, 5, 6, 9, 10, 11, 14, 15, 16, 20, 21, 23, 24, 27, 28];
  const examDay = currentMonthIdx === 9 ? 4 : null; // UPSC target preset is Oct 4, 2026

  // Return offset and total days for 2026 calendar months
  // July 2026 starts on Wednesday (offset 3), has 31 days
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

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-indigo-600" /> Success Calendar 2026
          </h3>
          <p className="text-xs text-gray-400">Green days represent logged target sessions.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonthIdx((prev) => (prev > 0 ? prev - 1 : 11))}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-gray-800 min-w-[90px] text-center">
            {currentMonth} 2026
          </span>
          <button
            onClick={() => setCurrentMonthIdx((prev) => (prev < 11 ? prev + 1 : 0))}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
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
          const isStudied = isDateCell && activeStudyDays.includes(date);
          const isToday = isDateCell && currentMonthIdx === 6 && date === 14; // Current simulated date is July 14, 2026
          const isExam = isDateCell && examDay === date;

          return (
            <div
              key={val}
              className={`p-2 rounded-xl relative flex flex-col items-center justify-center h-10 border transition-all ${
                !isDateCell 
                  ? "border-transparent text-transparent" 
                  : isExam
                    ? "bg-red-500 border-red-500 text-white font-extrabold"
                    : isToday
                      ? "border-indigo-600 text-indigo-700 bg-indigo-50 font-black"
                      : isStudied
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold"
                        : "border-gray-50 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {isDateCell ? (
                <>
                  <span className="text-[11px]">{date}</span>
                  {isStudied && !isExam && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                  {isExam && (
                    <span className="absolute -top-1 right-0 text-[8px] bg-white text-red-600 font-extrabold px-1 rounded-md shadow-xs">EXAM</span>
                  )}
                </>
              ) : (
                ""
              )}
            </div>
          );
        })}
      </div>

      {currentMonthIdx === 6 && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
          <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> consistency streak: 5 Days
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">On Target</span>
        </div>
      )}
    </div>
  );
}

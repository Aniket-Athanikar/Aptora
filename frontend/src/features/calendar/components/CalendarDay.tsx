"use client";

import React from "react";
import { CalendarEvent } from "../store/calendarStore";

interface CalendarDayProps {
  dayNum: number;
  dateStr: string;
  isCurrentMonth: boolean;
  status: "completed" | "planned" | "missed" | "exam" | "none";
  events: CalendarEvent[];
  onClick?: () => void;
}

export function CalendarDay({ dayNum, dateStr, isCurrentMonth, status, events, onClick }: CalendarDayProps) {
  const getStatusColor = () => {
    if (!isCurrentMonth) return "text-gray-300 bg-transparent opacity-40";

    // Custom color highlights from events
    const primaryEvent = events[0];
    if (primaryEvent && primaryEvent.color) {
      const ec = primaryEvent.color;
      if (ec === "red") return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100/50";
      if (ec === "amber") return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50";
      if (ec === "emerald") return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50";
      if (ec === "blue") return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/50";
      if (ec === "violet") return "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100/50";
      if (ec === "gray") return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100/50";
      return "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/50";
    }

    switch (status) {
      case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50";
      case "missed": return "bg-red-50 text-red-700 border-red-100 hover:bg-red-100/50";
      case "planned": return "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/50";
      case "exam": return "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100/50";
      default: return "bg-white text-gray-700 border-gray-150 hover:bg-gray-50";
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={!isCurrentMonth}
      className={`aspect-square rounded-2xl border p-2 flex flex-col justify-between transition-all select-none relative ${getStatusColor()}`}
    >
      <span className="text-[10px] font-black">{dayNum}</span>

      {/* Event/Activity indicator dots */}
      <div className="flex gap-1 mt-auto">
        {events.map((e) => (
          <span
            key={e.id}
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              e.type === "exam" ? "bg-blue-500" : e.type === "mock" ? "bg-violet-500" : "bg-gray-400"
            }`}
            title={e.title}
          />
        ))}
      </div>
    </button>
  );
}

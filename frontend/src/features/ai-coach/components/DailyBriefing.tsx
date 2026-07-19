import React from "react";
import { CalendarRange, Clock, CheckCircle2, Heart } from "lucide-react";

interface DailyBriefingProps {
  userName: string;
  tasks: { title: string; completed: boolean }[];
  durationMinutes: number;
}

export function DailyBriefing({ userName, tasks, durationMinutes }: DailyBriefingProps) {
  const displayTasks = tasks.length > 0
    ? tasks
    : [
        { title: "History Chapter 5 Focus Revisions", completed: false },
        { title: "Solve UPSC PYQs MCQ Practice Set", completed: false },
        { title: "Current Affairs Revision Slot", completed: false }
      ];

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const timeText = hours > 0
    ? `${hours} Hour${hours > 1 ? "s" : ""} ${minutes > 0 ? `${minutes} Min` : ""}`
    : `${durationMinutes} Mins`;

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4 shadow-xs">
      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-1">
            Good Morning {userName} ☀️
          </h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Your personalized agenda for today</p>
        </div>
        <span className="text-[10px] bg-slate-50 text-slate-500 font-black px-2.5 py-1 rounded-xl border border-gray-150 uppercase tracking-wider">
          Daily Briefing
        </span>
      </div>

      <div className="space-y-4">
        {/* Mission list */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">{"Today's Mission"}</label>
          <div className="space-y-2">
            {displayTasks.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-gray-100 bg-gray-50/20 hover:bg-white hover:border-indigo-100 transition-all duration-200"
              >
                <CheckCircle2 className={`w-4 h-4 ${t.completed ? "text-indigo-600 fill-indigo-50" : "text-gray-300"}`} />
                <span className={`text-xs font-bold ${t.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>
                  {t.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Duration & Quote */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/40 flex items-center gap-3">
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Estimated Time</p>
              <p className="text-xs font-black text-gray-800 mt-0.5">{timeText || "4 Hours 30 Minutes"}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/40 flex items-center gap-3">
            <div className="bg-rose-50 text-rose-500 p-2.5 rounded-xl">
              <Heart className="w-4 h-4 fill-rose-50" />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Daily Motivation</p>
              <p className="text-xs font-black text-slate-700 mt-0.5 italic">{"\"Small steps create big results.\""}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { CheckCircle2, Clock, CalendarDays, TrendingUp } from "lucide-react";

export function ProgressTimeline() {
  const events = [
    {
      time: "Today",
      title: "Completed Today's Schedule",
      desc: "Successfully achieved 5 tasks, logged 6.2 hours of study focus.",
      icon: CheckCircle2,
      color: "text-emerald-500 bg-emerald-50 border-emerald-100",
    },
    {
      time: "Yesterday",
      title: "Intense Study Block completed",
      desc: "Studied 6 hours across Polity and Current Affairs with 90% focus score.",
      icon: Clock,
      color: "text-indigo-500 bg-indigo-50 border-indigo-100",
    },
    {
      time: "Last Week",
      title: "Completed Weekly Targets",
      desc: "Crossed 38 hours of learning time, unlocking the 7-Day Warrior achievement.",
      icon: CalendarDays,
      color: "text-violet-500 bg-violet-50 border-violet-100",
    },
    {
      time: "Last Month",
      title: "Calibrated Goal Acceleration",
      desc: "+25% efficiency improvement compared to target schedules, syllabus cover increased by 18%.",
      icon: TrendingUp,
      color: "text-pink-500 bg-pink-50 border-pink-100",
    },
  ];

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-black text-gray-900">Progress History Timeline</h3>
        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Chronological record of study achievements</p>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
        {events.map((ev, index) => {
          const Icon = ev.icon;
          return (
            <div key={index} className="relative group">
              {/* Timeline marker */}
              <div className={`absolute -left-6 top-1 w-6 h-6 rounded-full border flex items-center justify-center -translate-x-1/2 transition-transform group-hover:scale-110 ${ev.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">
                  {ev.time}
                </span>
                <h4 className="text-xs font-black text-gray-800">{ev.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{ev.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

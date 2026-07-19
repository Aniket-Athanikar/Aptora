"use client";

import React, { useState, useMemo } from "react";
import { useCalendarStore, CalendarEvent } from "../store/calendarStore";
import { usePlannerStore } from "../../planner/store/plannerStore";
import { CalendarDay } from "./CalendarDay";
import { EventCard } from "./EventCard";
import { Calendar, ChevronLeft, ChevronRight, Plus, CheckCircle, Circle, Clock, Info, X, Search, Filter, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function StudyCalendar() {
  const { events, addEvent, removeEvent } = useCalendarStore();
  const { tasks, updateTaskStatus } = usePlannerStore();

  const [currentDate, setCurrentDate] = useState(new Date("2026-07-15"));
  const [selectedDate, setSelectedDate] = useState<string>("2026-07-15");
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("2026-07-15");
  const [newEventType, setNewEventType] = useState<"exam" | "mock" | "personal">("mock");
  const [newEventColor, setNewEventColor] = useState<"indigo" | "violet" | "emerald" | "red" | "amber" | "blue" | "gray">("indigo");
  const [filterType, setFilterType] = useState<"all" | "exam" | "mock" | "personal">("all");
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");
  const [searchQuery, setSearchQuery] = useState("");

  const monthYearLabel = useMemo(() => {
    return currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  }, [currentDate]);

  // Compute days grid (Month View)
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const grid = [];

    // Trailing days of previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevTotalDays - i;
      const monthStr = (month === 0 ? 12 : month).toString().padStart(2, "0");
      const yearVal = month === 0 ? year - 1 : year;
      const dateStr = `${yearVal}-${monthStr}-${dayNum.toString().padStart(2, "0")}`;
      grid.push({ dayNum, dateStr, isCurrentMonth: false });
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      const monthStr = (month + 1).toString().padStart(2, "0");
      const dateStr = `${year}-${monthStr}-${i.toString().padStart(2, "0")}`;
      grid.push({ dayNum: i, dateStr, isCurrentMonth: true });
    }

    return grid;
  }, [currentDate]);

  // Map dates to statuses
  const getDateStatus = (dateStr: string): "completed" | "planned" | "missed" | "exam" | "none" => {
    const hasExam = events.some((e) => e.date === dateStr && e.type === "exam");
    if (hasExam) return "exam";

    const dayTasks = tasks.filter((t) => t.date === dateStr);
    if (dayTasks.length === 0) return "none";

    const allCompleted = dayTasks.every((t) => t.status === "completed");
    const hasMissed = dayTasks.some((t) => t.status === "missed");

    if (allCompleted) return "completed";
    if (hasMissed) return "missed";
    return "planned";
  };

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 15));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 15));
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    addEvent({
      id: `event_${Date.now()}`,
      title: newEventTitle,
      date: newEventDate,
      type: newEventType,
      color: newEventColor,
    });

    setNewEventTitle("");
    setShowAddEvent(false);
  };

  // Filtered milestones list with Search Query matching (Google Calendar-like search)
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesType = filterType === "all" || e.type === filterType;
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [events, filterType, searchQuery]);

  // Tasks for the selected date
  const selectedDateTasks = useMemo(() => {
    return tasks.filter((t) => t.date === selectedDate);
  }, [tasks, selectedDate]);

  return (
    <div className="space-y-5 relative overflow-hidden">
      {/* Top background glow */}
      <div className="absolute top-10 left-1/3 w-72 h-72 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none -z-10" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-150 rounded-3xl p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
            <Calendar className="w-5 h-5 text-indigo-650" /> Target Study Calendar
          </h1>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Visualize exam dates, study sprints, and check off milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggles (Month vs Agenda) */}
          <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-xl text-xs font-bold mr-1">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "month" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "agenda" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Agenda
            </button>
          </div>

          <button
            onClick={() => setShowAddEvent(true)}
            className="bg-indigo-650 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Milestone
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Area: Calendar Month or Agenda list */}
        <div className="lg:col-span-2 bg-white border border-slate-150 rounded-3xl p-5 shadow-sm flex flex-col justify-between min-h-[460px]">
          <div>
            {/* Nav month trigger */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">{monthYearLabel}</h3>

              <div className="flex gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded-lg text-slate-500 hover:text-indigo-600 transition-all cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded-lg text-slate-500 hover:text-indigo-600 transition-all cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {viewMode === "month" ? (
              <>
                {/* Week Day Titles */}
                <div className="grid grid-cols-7 gap-1.5 mb-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* Days Grid Container */}
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((day, idx) => {
                    const dayEvents = events.filter((e) => e.date === day.dateStr);
                    const isSelected = selectedDate === day.dateStr;
                    return (
                      <div key={idx} className={isSelected ? "ring-2 ring-indigo-500 ring-offset-2 rounded-2xl scale-[0.98] transition-all" : ""}>
                        <CalendarDay
                          dayNum={day.dayNum}
                          dateStr={day.dateStr}
                          isCurrentMonth={day.isCurrentMonth}
                          status={getDateStatus(day.dateStr)}
                          events={dayEvents}
                          onClick={() => {
                            setSelectedDate(day.dateStr);
                            setNewEventDate(day.dateStr);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              // Agenda View (Search & Event listings in google calendar structure)
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {filteredEvents.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-xs font-semibold">
                    No matching agenda milestones found.
                  </div>
                ) : (
                  filteredEvents.map((e) => (
                    <div key={e.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${
                          e.color === "red" ? "bg-red-500" :
                          e.color === "amber" ? "bg-amber-500" :
                          e.color === "emerald" ? "bg-emerald-500" :
                          e.color === "blue" ? "bg-blue-500" :
                          e.color === "violet" ? "bg-violet-500" :
                          e.color === "gray" ? "bg-gray-500" : "bg-indigo-500"
                        }`} />
                        <div>
                          <p className="text-slate-800 text-xs font-extrabold">{e.title}</p>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                            {e.type} &bull; {e.date}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeEvent(e.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Legend indicators */}
          <div className="flex flex-wrap items-center gap-4 mt-8 border-t border-slate-100 pt-4 text-[9px] font-black uppercase tracking-wider text-slate-450">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-150" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-150" /> Planned Blocks</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-50 border border-red-150" /> Missed Days</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-50 border border-blue-150" /> official exams</span>
          </div>
        </div>

        {/* Right Side: Milestones List & Agenda Detail */}
        <div className="space-y-5">
          {/* Milestone search filter */}
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider">Milestones Search</h3>
              <Search className="w-4 h-4 text-slate-400" />
            </div>

            {/* Input query search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search milestones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none transition-all font-semibold pl-8"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Event Category pills */}
            <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-3">
              {(["all", "exam", "mock", "personal"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    filterType === t
                      ? "bg-indigo-50/80 border-indigo-150 text-indigo-650"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-650"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Event cards lists */}
            <div className="max-h-[170px] overflow-y-auto space-y-2 pr-1">
              <AnimatePresence mode="popLayout">
                {filteredEvents.length === 0 ? (
                  <p className="text-[9px] text-slate-400 py-4 text-center font-black uppercase tracking-widest">No milestones</p>
                ) : (
                  filteredEvents.slice(0, 5).map((e) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.15 }}
                    >
                      <EventCard event={e} onRemove={removeEvent} />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Agenda tasks */}
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Info className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Agenda: {selectedDate}</h3>
            </div>

            <div className="space-y-3.5">
              {selectedDateTasks.length === 0 ? (
                <p className="text-[10px] text-slate-400 py-6 text-center font-bold uppercase tracking-wide">No tasks scheduled.</p>
              ) : (
                selectedDateTasks.map((t) => (
                  <div key={t.id} className="flex items-start justify-between p-3 rounded-2xl border border-slate-100 hover:border-indigo-150 transition-colors bg-slate-50/40">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => updateTaskStatus(t.id, t.status === "completed" ? "pending" : "completed")}
                        className={`mt-0.5 cursor-pointer ${t.status === "completed" ? "text-indigo-650" : "text-slate-350 hover:text-indigo-500"}`}
                      >
                        {t.status === "completed" ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </button>
                      <div>
                        <p className={`text-[11px] font-black text-slate-700 ${t.status === "completed" ? "line-through text-slate-400" : ""}`}>{t.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {t.duration} min</span>
                          <span>{t.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                      t.status === "completed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>{t.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <form
            onSubmit={handleAddEventSubmit}
            className="modal-content max-w-sm w-full p-6 bg-white border border-slate-150 rounded-3xl space-y-4 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowAddEvent(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4.5 h-4.5 text-indigo-650" /> Create Milestone
            </h3>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Milestone Name</label>
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="e.g. UPSC Prelims Mock"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl p-2.5 text-xs outline-none transition-all font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Date</label>
              <input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl p-2.5 text-xs outline-none transition-all font-semibold text-slate-600"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Milestone Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["exam", "mock", "personal"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewEventType(t)}
                    className={`px-2 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl border text-center transition-all cursor-pointer ${
                      newEventType === t
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Color Indicator</label>
              <div className="flex gap-2 flex-wrap pt-1">
                {(["indigo", "violet", "emerald", "red", "amber", "blue", "gray"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewEventColor(c)}
                    className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                      c === "red" ? "bg-red-500" :
                      c === "amber" ? "bg-amber-500" :
                      c === "emerald" ? "bg-emerald-500" :
                      c === "blue" ? "bg-blue-500" :
                      c === "violet" ? "bg-violet-500" :
                      c === "gray" ? "bg-gray-500" : "bg-indigo-500"
                    } ${newEventColor === c ? "ring-2 ring-indigo-600 ring-offset-2 scale-110 shadow-sm" : "opacity-80 hover:opacity-100"}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddEvent(false)}
                className="flex-1 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

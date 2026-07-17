"use client";

import React, { useState } from "react";
import { CalendarEvent, useCalendarStore } from "../store/calendarStore";
import { Calendar, Trash2, Award, Zap, Edit3 } from "lucide-react";

interface EventCardProps {
  event: CalendarEvent;
  onRemove?: (id: string) => void;
}

const colors = ["indigo", "violet", "emerald", "red", "amber", "blue", "gray"] as const;

export function EventCard({ event, onRemove }: EventCardProps) {
  const updateEvent = useCalendarStore((state) => state.updateEvent);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState(event.title);
  const [editDate, setEditDate] = useState(event.date);
  const [editType, setEditType] = useState(event.type);
  const [editColor, setEditColor] = useState(event.color || "indigo");

  const getTypeStyles = (t: string) => {
    switch (t) {
      case "exam": return "bg-blue-50 text-blue-600 border-blue-100";
      case "mock": return "bg-violet-50 text-violet-600 border-violet-100";
      default: return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  const getColorClasses = (c?: string) => {
    switch (c) {
      case "red": return "border-red-150 bg-red-50/10";
      case "amber": return "border-amber-150 bg-amber-50/10";
      case "emerald": return "border-emerald-150 bg-emerald-50/10";
      case "blue": return "border-blue-150 bg-blue-50/10";
      case "violet": return "border-violet-150 bg-violet-50/10";
      case "gray": return "border-gray-150 bg-gray-50/10";
      default: return "border-indigo-150 bg-indigo-50/5";
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEvent(event.id, {
      title: editTitle,
      date: editDate,
      type: editType,
      color: editColor,
    });
    setShowEditModal(false);
  };

  return (
    <div className={`border rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 group transition-all ${getColorClasses(event.color)}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-xl border shrink-0 ${getTypeStyles(event.type)}`}>
          {event.type === "exam" ? <Award className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-black text-gray-800 truncate">{event.title}</h4>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{event.date}</p>
        </div>
      </div>

      <div className="hidden group-hover:flex items-center gap-1">
        <button
          onClick={() => setShowEditModal(true)}
          className="p-1 hover:bg-white rounded text-gray-400 hover:text-indigo-600 transition-colors border border-transparent hover:border-gray-100"
          title="Edit event"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        {onRemove && (
          <button
            onClick={() => onRemove(event.id)}
            className="p-1 hover:bg-white text-gray-400 hover:text-red-600 rounded-lg transition-all border border-transparent hover:border-gray-100"
            title="Delete event"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <form onSubmit={handleEditSubmit} className="bg-white border border-gray-150 p-6 rounded-3xl w-80 space-y-4 shadow-2xl text-left">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Edit Milestone</h3>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400">Milestone Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-2 text-xs outline-none focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400">Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-2 text-xs outline-none focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400">Category</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as "exam" | "mock" | "personal")}
                className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-2 text-xs outline-none focus:bg-white font-semibold text-gray-700"
              >
                <option value="exam">Official Exam Date</option>
                <option value="mock">Mock Test</option>
                <option value="personal">Personal Study Deadline</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400">Color Palette</label>
              <div className="flex gap-1.5 flex-wrap pt-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditColor(c)}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      c === "red" ? "bg-red-500" :
                      c === "amber" ? "bg-amber-500" :
                      c === "emerald" ? "bg-emerald-500" :
                      c === "blue" ? "bg-blue-500" :
                      c === "violet" ? "bg-violet-500" :
                      c === "gray" ? "bg-gray-500" : "bg-indigo-500"
                    } ${editColor === c ? "ring-2 ring-indigo-600 ring-offset-1 scale-110" : ""}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-150 hover:bg-gray-50 rounded-2xl text-[10px] font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

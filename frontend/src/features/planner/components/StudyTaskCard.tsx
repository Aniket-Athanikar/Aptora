"use client";

import React, { useState } from "react";
import { StudyTask } from "../types/planner";
import { usePlannerStore } from "../store/plannerStore";
import { CheckCircle2, Circle, Edit3, Calendar, Trash2, Clock, Sparkles } from "lucide-react";

interface StudyTaskCardProps {
  task: StudyTask;
  onStatusChange: (taskId: string, status: "pending" | "completed" | "missed") => void;
  onReschedule?: (taskId: string, newDate: string, newSlot: string) => void;
}

const colors = ["indigo", "violet", "emerald", "red", "amber", "blue", "gray"] as const;

export function StudyTaskCard({ task, onStatusChange, onReschedule }: StudyTaskCardProps) {
  const updateTask = usePlannerStore((state) => state.updateTask);
  const deleteTask = usePlannerStore((state) => state.deleteTask);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editSubject, setEditSubject] = useState(task.subject);
  const [editDuration, setEditDuration] = useState(task.duration);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editSlot, setEditSlot] = useState(task.timeSlot);
  const [editColor, setEditColor] = useState(task.color || "indigo");

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "High": return "bg-red-50 text-red-600 border-red-100";
      case "Medium": return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  const getColorClasses = (c?: string) => {
    switch (c) {
      case "red": return "border-red-200 bg-red-50/20";
      case "amber": return "border-amber-200 bg-amber-50/20";
      case "emerald": return "border-emerald-200 bg-emerald-50/20";
      case "blue": return "border-blue-200 bg-blue-50/20";
      case "violet": return "border-violet-200 bg-violet-50/20";
      case "gray": return "border-gray-200 bg-gray-50/20";
      default: return "border-indigo-200 bg-indigo-50/10";
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTask(task.id, {
      title: editTitle,
      subject: editSubject,
      duration: editDuration,
      priority: editPriority,
      timeSlot: editSlot,
      color: editColor,
    });
    setShowEditModal(false);
  };

  return (
    <div className={`border rounded-3xl p-5 shadow-xs flex flex-col gap-4 relative group transition-all ${getColorClasses(task.color)}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onStatusChange(task.id, task.status === "completed" ? "pending" : "completed")}
          className={`shrink-0 mt-0.5 transition-all ${task.status === "completed" ? "text-indigo-600" : "text-gray-300 hover:text-indigo-500"}`}
        >
          {task.status === "completed" ? (
            <CheckCircle2 className="w-5 h-5 fill-indigo-50" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4 className={`text-xs font-black text-gray-800 tracking-tight ${task.status === "completed" ? "line-through text-gray-400" : ""}`}>
            {task.title}
          </h4>
          <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{task.subject}</p>
        </div>

        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-semibold">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {task.duration} min
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {task.timeSlot}
          </span>
        </div>

        <div className="hidden group-hover:flex items-center gap-1.5">
          <button
            onClick={() => setShowEditModal(true)}
            className="p-1 hover:bg-white rounded text-gray-400 hover:text-indigo-600 transition-colors border border-transparent hover:border-gray-100"
            title="Edit Task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1 hover:bg-white rounded text-gray-400 hover:text-red-500 transition-colors border border-transparent hover:border-gray-100"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <form onSubmit={handleEditSubmit} className="bg-white border border-gray-150 p-6 rounded-3xl w-80 space-y-4 shadow-2xl text-left">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Edit Task</h3>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-2 text-xs outline-none focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400">Subject</label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-2 text-xs outline-none focus:bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400">Duration (min)</label>
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-2 text-xs outline-none focus:bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400">Time Slot</label>
                <input
                  type="text"
                  value={editSlot}
                  onChange={(e) => setEditSlot(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-2 text-xs outline-none focus:bg-white"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400">Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as "Low" | "Medium" | "High")}
                className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-2 text-xs outline-none focus:bg-white font-semibold text-gray-700"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
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

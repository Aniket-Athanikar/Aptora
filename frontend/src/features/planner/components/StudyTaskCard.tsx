"use client";

import React, { useState } from "react";
import { StudyTask } from "../types/planner";
import { usePlannerStore } from "../store/plannerStore";
import { CheckCircle2, Circle, Edit3, Calendar, Trash2, Clock, Play, Sparkles, AlertCircle } from "lucide-react";
import { triggerHaptic } from "../services/hapticFeedback";
import { SoundManager } from "../services/soundManager";
import { DEFAULT_PREFERENCES } from "../hooks/useFocusTimer2";

interface StudyTaskCardProps {
  task: StudyTask;
  onStatusChange: (taskId: string, status: "pending" | "completed" | "missed") => void;
  onReschedule?: (taskId: string, newDate: string, newSlot: string) => void;
  onStartFocus?: (subject: string, taskId: string) => void;
}

const colors = ["indigo", "violet", "emerald", "red", "amber", "blue", "gray"] as const;

export function StudyTaskCard({ task, onStatusChange, onReschedule, onStartFocus }: StudyTaskCardProps) {
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
      case "High": return "bg-red-50 text-red-600 border-red-200/80";
      case "Medium": return "bg-amber-50 text-amber-600 border-amber-200/80";
      default: return "bg-slate-50 text-slate-500 border-slate-200/80";
    }
  };

  const getColorClasses = (c?: string) => {
    switch (c) {
      case "red": return "border-red-200/80 bg-red-50/20 hover:border-red-300";
      case "amber": return "border-amber-200/80 bg-amber-50/20 hover:border-amber-300";
      case "emerald": return "border-emerald-200/80 bg-emerald-50/20 hover:border-emerald-300";
      case "blue": return "border-blue-200/80 bg-blue-50/20 hover:border-blue-300";
      case "violet": return "border-violet-200/80 bg-violet-50/20 hover:border-violet-300";
      case "gray": return "border-slate-200/80 bg-slate-50/20 hover:border-slate-300";
      default: return "border-indigo-200/80 bg-indigo-50/15 hover:border-indigo-300";
    }
  };

  const handleToggleStatus = () => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    if (nextStatus === "completed") {
      triggerHaptic("GOAL_COMPLETED", DEFAULT_PREFERENCES);
      SoundManager.playEventSound("GOAL_COMPLETED", DEFAULT_PREFERENCES);
    }
    onStatusChange(task.id, nextStatus);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
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

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  return (
    <div className={`border rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-3 relative group transition-all duration-300 ${getColorClasses(task.color)}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleStatus}
          className={`shrink-0 mt-0.5 transition-all cursor-pointer ${
            task.status === "completed" ? "text-emerald-600 scale-110" : "text-slate-300 hover:text-indigo-600"
          }`}
          title={task.status === "completed" ? "Mark as Pending" : "Mark as Complete"}
        >
          {task.status === "completed" ? (
            <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4 className={`text-xs font-extrabold text-slate-800 tracking-tight leading-snug ${task.status === "completed" ? "line-through text-slate-400" : ""}`}>
            {task.title}
          </h4>
          <p className="text-[10px] text-slate-500 font-bold mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
            {task.subject}
          </p>
        </div>

        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100/80 pt-2.5 mt-1">
        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {task.duration}m
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {task.timeSlot}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Start Focus Button */}
          {onStartFocus && task.status !== "completed" && (
            <button
              onClick={() => onStartFocus(task.subject, task.id)}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              title="Start Focus Session for this task"
            >
              <Play className="w-3 h-3 fill-white" /> Focus
            </button>
          )}

          {/* Edit Task Button */}
          <button
            onClick={() => setShowEditModal(true)}
            className="p-1.5 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
            title="Edit Task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Task Button */}
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-white rounded-xl text-slate-400 hover:text-rose-600 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <form onSubmit={handleEditSubmit} className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-indigo-600" /> Edit Study Task
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                âœ•
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Task Title</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Subject</label>
              <input
                type="text"
                required
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Duration (min)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={editDuration}
                  onChange={(e) => setEditDuration(parseInt(e.target.value) || 25)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Time Slot</label>
                <input
                  type="text"
                  value={editSlot}
                  onChange={(e) => setEditSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as "Low" | "Medium" | "High")}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold outline-none focus:border-indigo-600 focus:bg-white text-slate-700 transition-all"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Card Color Palette</label>
              <div className="flex gap-2 flex-wrap pt-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditColor(c)}
                    className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                      c === "red" ? "bg-red-500" :
                      c === "amber" ? "bg-amber-500" :
                      c === "emerald" ? "bg-emerald-500" :
                      c === "blue" ? "bg-blue-500" :
                      c === "violet" ? "bg-violet-500" :
                      c === "gray" ? "bg-slate-500" : "bg-indigo-500"
                    } ${editColor === c ? "ring-2 ring-indigo-600 ring-offset-2 scale-110" : "opacity-80 hover:opacity-100"}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-extrabold transition-all shadow-xs cursor-pointer"
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

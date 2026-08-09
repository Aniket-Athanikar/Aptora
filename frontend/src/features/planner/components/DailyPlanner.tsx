"use client";

import React, { useState } from "react";
import { StudyTask } from "../types/planner";
import { StudyTaskCard } from "./StudyTaskCard";
import { usePlannerStore } from "../store/plannerStore";
import { ListTodo, Plus } from "lucide-react";

interface DailyPlannerProps {
  tasks: StudyTask[];
  onStatusChange: (taskId: string, status: "pending" | "completed" | "missed") => void;
  onReschedule: (taskId: string, newDate: string, newSlot: string) => void;
}

const colors = ["indigo", "violet", "emerald", "red", "amber", "blue", "gray"] as const;

export function DailyPlanner({ tasks, onStatusChange, onReschedule }: DailyPlannerProps) {
  const addTask = usePlannerStore((state) => state.addTask);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newDuration, setNewDuration] = useState(45);
  const [newPriority, setNewPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [newSlot, setNewSlot] = useState("09:00 AM");
  const [newColor, setNewColor] = useState<typeof colors[number]>("indigo");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const todayStr = new Date().toISOString().split("T")[0];
    addTask({
      title: newTitle,
      subject: newSubject || "General study",
      duration: newDuration,
      priority: newPriority,
      timeSlot: newSlot,
      status: "pending",
      date: todayStr,
      color: newColor,
    });

    setNewTitle("");
    setNewSubject("");
    setShowAddModal(false);
  };

  return (
    <div className="glass border border-white/20 rounded-3xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-indigo-600 animate-pulse" />
          <div>
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Today&apos;s Focus Activities</h3>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Tasks automatically aligned to syllabus weaknesses.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 hover:bg-gray-50 border border-gray-150 rounded-xl text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider cursor-pointer"
          title="Create Custom Task"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-400">
          No tasks scheduled for today. Take a break!
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <StudyTaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onReschedule={onReschedule}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleSubmit} className="glass border border-white/20 p-6 rounded-3xl w-80 space-y-4 shadow-2xl text-left backdrop-blur-xl">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Create Custom Task</h3>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Solve 20 Geography MCQs"
                className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-2.5 text-xs outline-none focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400">Subject</label>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Geography"
                className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-2.5 text-xs outline-none focus:bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400">Duration (min)</label>
                <input
                  type="number"
                  value={newDuration}
                  onChange={(e) => setNewDuration(parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-2.5 text-xs outline-none focus:bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400">Time Slot</label>
                <input
                  type="text"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  placeholder="e.g. 09:00 AM"
                  className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-2.5 text-xs outline-none focus:bg-white"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as "Low" | "Medium" | "High")}
                className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-2.5 text-xs outline-none focus:bg-white font-semibold text-gray-700"
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
                    onClick={() => setNewColor(c)}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      c === "red" ? "bg-red-500" :
                      c === "amber" ? "bg-amber-500" :
                      c === "emerald" ? "bg-emerald-500" :
                      c === "blue" ? "bg-blue-500" :
                      c === "violet" ? "bg-violet-500" :
                      c === "gray" ? "bg-gray-500" : "bg-indigo-500"
                    } ${newColor === c ? "ring-2 ring-indigo-600 ring-offset-1 scale-110" : ""}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-150 hover:bg-gray-50 rounded-2xl text-[10px] font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-bold"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

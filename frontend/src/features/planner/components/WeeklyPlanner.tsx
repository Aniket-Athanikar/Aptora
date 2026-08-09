"use client";

import React, { useState, useMemo } from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { plannerEngine } from "../services/plannerEngine";
import { CalendarDays, BookOpen, Plus, Edit3, Trash2, CheckCircle2, Clock } from "lucide-react";

interface WeeklyItem {
  id?: string;
  day: string; // "Monday", "Tuesday", etc.
  subject: string;
  duration: number; // hours
}

export function WeeklyPlanner() {
  const { activeGoal } = useGoalEngine();
  const [customItems, setCustomItems] = useState<WeeklyItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WeeklyItem | null>(null);

  const [newDay, setNewDay] = useState("Monday");
  const [newSubject, setNewSubject] = useState("");
  const [newDuration, setNewDuration] = useState(2);

  // Auto-generated schedule merged with custom CRUD items
  const weeklySchedule = useMemo(() => {
    let base: WeeklyItem[] = [];
    if (activeGoal) {
      base = plannerEngine.generateWeeklyPlan(activeGoal).map((item, idx) => ({
        id: `auto_${idx}_${item.day}`,
        ...item,
      }));
    }

    if (customItems.length === 0) return base;

    // Override or append custom items
    const merged = [...base];
    customItems.forEach((cItem) => {
      const idx = merged.findIndex((m) => m.day.toLowerCase() === cItem.day.toLowerCase());
      if (idx !== -1) {
        merged[idx] = cItem;
      } else {
        merged.push(cItem);
      }
    });

    return merged;
  }, [activeGoal, customItems]);

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const item: WeeklyItem = {
      id: editingItem?.id || `custom_${Date.now()}`,
      day: newDay,
      subject: newSubject,
      duration: newDuration,
    };

    setCustomItems((prev) => {
      const filtered = prev.filter((p) => p.id !== item.id && p.day !== item.day);
      return [...filtered, item];
    });

    setNewSubject("");
    setEditingItem(null);
    setShowAddModal(false);
  };

  const handleDeleteItem = (id?: string, day?: string) => {
    if (confirm(`Remove custom target for ${day}?`)) {
      setCustomItems((prev) => prev.filter((p) => p.id !== id && p.day !== day));
    }
  };

  const handleEditClick = (item: WeeklyItem) => {
    setEditingItem(item);
    setNewDay(item.day);
    setNewSubject(item.subject);
    setNewDuration(item.duration);
    setShowAddModal(true);
  };

  return (
    <div className="glass border border-white/20 rounded-3xl p-5 sm:p-6 space-y-6 shadow-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <CalendarDays className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Weekly Study Schedule</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Automated subject mapping & custom day targets.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setNewSubject("");
            setShowAddModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-3.5 py-2 rounded-2xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Target
        </button>
      </div>

      {/* Schedule Items */}
      {weeklySchedule.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400 font-semibold bg-slate-50/50 rounded-2xl border border-slate-100">
          No goal configured yet. Launch calibration to generate weekly schedule.
        </div>
      ) : (
        <div className="space-y-2.5">
          {weeklySchedule.map((item) => (
            <div
              key={item.id || item.day}
              className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 hover:border-indigo-200 hover:bg-white transition-all duration-200 shadow-2xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-2.5 py-1 rounded-xl w-20 text-center uppercase tracking-wider shrink-0">
                  {item.day}
                </span>
                <span className="text-xs font-black text-slate-800 truncate">{item.subject}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {item.duration}h
                </span>

                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Edit Target"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.day)}
                    className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                    title="Reset Target"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Add / Edit Day Target Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <form onSubmit={handleSaveItem} className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-indigo-600" /> {editingItem ? "Edit Day Target" : "Add Day Target"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                âœ•
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Day of Week</label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold outline-none focus:border-indigo-600 focus:bg-white text-slate-700 transition-all"
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Target Subject Area</label>
              <input
                type="text"
                required
                placeholder="e.g., General Studies - Polity"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Target Study Hours</label>
              <input
                type="number"
                min="1"
                max="16"
                value={newDuration}
                onChange={(e) => setNewDuration(parseInt(e.target.value) || 2)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-extrabold transition-all shadow-xs cursor-pointer"
              >
                Save Schedule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

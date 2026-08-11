"use client";

import React, { useState } from "react";
import { Star, ChevronRight, Plus, Trash2, Edit2, X, Check, BookOpen } from "lucide-react";
import Link from "next/link";
import { useProgressStore, SubjectProgressData } from "../store/progressStore";

interface SubjectProgressProps {
  subjects: SubjectProgressData[];
  limit?: number;
  showLink?: boolean;
}

export function SubjectProgress({ subjects, limit, showLink = false }: SubjectProgressProps) {
  const { addSubject, updateSubject, deleteSubject } = useProgressStore();
  const displaySubjects = limit ? subjects.slice(0, limit) : subjects;

  // CRUD States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectProgressData | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    completedTasks: 0,
    totalTasks: 100,
    confidence: 3,
  });

  const renderStars = (count: number, onStarClick?: (rating: number) => void) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        onClick={() => onStarClick && onStarClick(i + 1)}
        className={`w-3.5 h-3.5 ${onStarClick ? "cursor-pointer transition-transform hover:scale-125" : ""} ${
          i < count ? "text-amber-400 fill-amber-400" : "text-gray-200"
        }`}
      />
    ));
  };

  const getStatusColor = (status: "Good" | "Needs Review" | "Weak") => {
    switch (status) {
      case "Good":
        return "bg-emerald-50 text-emerald-700 border border-emerald-250";
      case "Needs Review":
        return "bg-amber-50 text-amber-700 border border-amber-250";
      case "Weak":
        return "bg-rose-50 text-rose-700 border border-rose-250";
    }
  };

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({
      subject: "",
      completedTasks: 0,
      totalTasks: 100,
      confidence: 3,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: SubjectProgressData) => {
    setEditingSubject(sub);
    setFormData({
      subject: sub.subject,
      completedTasks: sub.completedTasks,
      totalTasks: sub.totalTasks,
      confidence: sub.confidence,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteSubject(name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) return;

    if (editingSubject) {
      // Update
      updateSubject(editingSubject.subject, {
        subject: formData.subject,
        completedTasks: Number(formData.completedTasks),
        totalTasks: Number(formData.totalTasks),
        confidence: formData.confidence,
      });
    } else {
      // Create
      const percent = Math.min(100, Math.round((formData.completedTasks / formData.totalTasks) * 100));
      let revisionStatus: "Good" | "Needs Review" | "Weak" = "Good";
      if (formData.confidence <= 2) revisionStatus = "Weak";
      else if (formData.confidence <= 3) revisionStatus = "Needs Review";

      addSubject({
        subject: formData.subject,
        completedTasks: Number(formData.completedTasks),
        totalTasks: Number(formData.totalTasks),
        confidence: formData.confidence,
        completionPercentage: percent,
        revisionStatus,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-5 shadow-sm">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Subject Coverage & Confidence</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Track, edit, and adjust confidence calibrations per syllabus area</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-750 text-white font-black text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>

          {showLink && (
            <Link
              href="/dashboard/progress/subjects"
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5 group"
            >
              All Subjects <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displaySubjects.map((sub) => (
          <div
            key={sub.subject}
            className="group relative p-5 rounded-2xl border border-slate-150 bg-slate-50/40 hover:bg-white hover:border-emerald-300/80 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            {/* Quick Hover Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleOpenEdit(sub)}
                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                title="Edit Subject progress"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => handleDelete(sub.subject, e)}
                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                title="Delete Subject"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <div className="flex justify-between items-start pr-12">
              <div>
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{sub.subject}</span>
                </h4>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase">Confidence</span>
                  <div className="flex">
                    {renderStars(sub.confidence, (rating) => {
                      updateSubject(sub.subject, { confidence: rating });
                    })}
                  </div>
                </div>
              </div>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${getStatusColor(sub.revisionStatus)}`}>
                {sub.revisionStatus}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Completion</span>
                <span>{sub.completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 border border-slate-200/60 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    sub.completionPercentage > 75
                      ? "bg-emerald-600"
                      : sub.completionPercentage > 50
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${sub.completionPercentage}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-400 font-semibold mt-1">
                {sub.completedTasks} of {sub.totalTasks} syllabus subtopics completed
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CRUD Modal dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white border border-slate-200/80 w-full max-w-md rounded-3xl p-6 shadow-xl z-10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                {editingSubject ? "Edit Subject Progress" : "Add New Subject"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Subject Name</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Science & Technology"
                  required
                  disabled={!!editingSubject}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4.5 py-3.5 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Completed Tasks</label>
                  <input
                    type="number"
                    min={0}
                    max={formData.totalTasks}
                    value={formData.completedTasks}
                    onChange={(e) => setFormData({ ...formData, completedTasks: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Tasks</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.totalTasks}
                    onChange={(e) => setFormData({ ...formData, totalTasks: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Initial Confidence (1-5)</label>
                <div className="flex gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, confidence: star })}
                      className={`w-9 h-9 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        formData.confidence >= star
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-755 font-black text-xs py-3 rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer text-center"
                >
                  {editingSubject ? "Save Changes" : "Create Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

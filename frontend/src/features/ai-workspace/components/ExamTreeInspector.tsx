"use client";

import React, { useState } from "react";
import { useWorkspace } from "../workspaceContext";
import {
  FolderTree,
  Layers,
  Plus,
  Trash2,
  Edit,
  Database,
  Cpu,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  X,
  Scan,
  FileCode,
  FileCheck,
  Bot
} from "lucide-react";
import { motion } from "framer-motion";
import { ResourceUploadModal } from "@/components/resources/ResourceUploadModal";
import { ResourceUploadButton } from "@/components/resources/ResourceUploadButton";

export function ExamTreeInspector() {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    createWorkspace,
    deleteWorkspace,
    addSubjectToWorkspace,
    deleteSubjectFromWorkspace,
    addResourceToSubject,
    deleteResource
  } = useWorkspace();

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "ws-upsc": true,
    "subj-polity": true
  });

  const [createWSModal, setCreateWSModal] = useState(false);
  const [newWSTitle, setNewWSTitle] = useState("");
  const [newWSExam, setNewWSExam] = useState("");
  const [newWSDesc, setNewWSDesc] = useState("");

  const [addSubjectModal, setAddSubjectModal] = useState(false);
  const [newSubjName, setNewSubjName] = useState("");
  const [newSubjCategory, setNewSubjCategory] = useState<"Prelims" | "Mains" | "Interview" | "General">("Prelims");

  const [addResourceModal, setAddResourceModal] = useState(false);
  const [newResTitle, setNewResTitle] = useState("");
  const [newResType, setNewResType] = useState<"Book" | "PDF" | "Note" | "PYQ">("Book");
  const [targetSubjId, setTargetSubjId] = useState("");
  const [deletingWorkspaceId, setDeletingWorkspaceId] = useState<string | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeWS = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const handleCreateWS = () => {
    if (!newWSTitle.trim() || !newWSExam.trim()) return;
    createWorkspace(newWSTitle, newWSExam, newWSDesc);
    setCreateWSModal(false);
    setNewWSTitle("");
    setNewWSExam("");
    setNewWSDesc("");
  };

  const handleAddSubject = () => {
    if (!newSubjName.trim()) return;
    addSubjectToWorkspace(activeWorkspaceId, {
      name: newSubjName,
      category: newSubjCategory,
      resourceCount: 0,
      iconName: "BookOpen",
      color: "from-emerald-500 to-teal-600"
    });
    setAddSubjectModal(false);
    setNewSubjName("");
  };

  const handleAddResource = () => {
    if (!newResTitle.trim() || !targetSubjId) return;
    addResourceToSubject({
      subjectId: targetSubjId,
      title: newResTitle,
      type: newResType,
      pages: 120,
      size: "15.0 MB",
      uploadDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      chapters: ["Chapter 1: Intro", "Chapter 2: Main Principles"],
      chunksCount: 150,
      vectorStatus: "Indexed"
    });
    setAddResourceModal(false);
    setNewResTitle("");
  };

  if (!activeWS) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200/90 rounded-[32px] space-y-4 max-w-6xl mx-auto shadow-xs">
        <FolderTree className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-sm font-black text-slate-900">No Active Workspaces</h3>
        <p className="text-xs text-slate-500 font-bold max-w-xs mx-auto">Create a goal workspace to start inspecting your study subjects and indexed files.</p>
        <button
          onClick={() => setCreateWSModal(true)}
          className="h-10 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-750 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          + Create Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* WORKSPACES SELECTOR TABS & TREE VIEW */}
      <div className="bg-white border border-slate-200/90 rounded-[32px] p-6 shadow-xs space-y-6 relative overflow-hidden">
        {/* Soft Radial Ambient Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="flex items-center justify-between border-b border-slate-150 pb-4 relative z-10 flex-wrap gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspaceId(ws.id)}
                className={`px-4.5 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${activeWorkspaceId === ws.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200 border border-emerald-500"
                  : "bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/70"
                  }`}
              >
                {ws.title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            <button
              onClick={() => setCreateWSModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-black rounded-2xl border border-emerald-500 transition-all cursor-pointer shadow-2xs shrink-0"
            >
              + New Workspace
            </button>
            <button
              onClick={() => setAddSubjectModal(true)}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-xs font-black rounded-2xl border border-emerald-250 transition-all cursor-pointer shadow-2xs shrink-0"
            >
              + Add Subject
            </button>
            {workspaces.length > 1 && (
              deletingWorkspaceId === activeWS.id ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-2xl text-[10px] shadow-2xs">
                  <span className="font-bold text-rose-700">Delete Workspace?</span>
                  <button onClick={() => { deleteWorkspace(activeWS.id); setDeletingWorkspaceId(null); }} className="font-black text-rose-600 hover:text-rose-800">Yes</button>
                  <button onClick={() => setDeletingWorkspaceId(null)} className="font-black text-slate-500 hover:text-slate-700">No</button>
                </div>
              ) : (
                <button
                  onClick={() => setDeletingWorkspaceId(activeWS.id)}
                  className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer hover:bg-rose-50 transition-colors border border-slate-200/80 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>

        {/* Dynamic Tree Hierarchy Visualization */}
        <div className="space-y-4 font-sans relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl shadow-2xs gap-3">
            <div className="flex items-center gap-2.5 text-xs font-black text-slate-900 min-w-0">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs shrink-0">
                <FolderTree className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-black truncate">{activeWS.title} ({activeWS.examName})</span>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-250 self-start sm:self-auto shrink-0">
              {activeWS.subjects.length} Subjects Active
            </span>
          </div>

          {/* Subjects Sub-tree */}
          <div className="pl-3 sm:pl-4 space-y-3.5 border-l-2 border-slate-200 ml-3 sm:ml-4.5">
            {activeWS.subjects.map((subj) => {
              const isExpanded = expandedNodes[subj.id];
              const subjResources = activeWS.resources.filter((r) => r.subjectId === subj.id);

              return (
                <div key={subj.id} className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white/95 hover:bg-emerald-50/30 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all shadow-2xs gap-3">
                    <button
                      onClick={() => toggleNode(subj.id)}
                      className="flex items-center gap-2.5 text-xs font-black text-slate-800 hover:text-emerald-700 cursor-pointer min-w-0 w-full sm:w-auto justify-between sm:justify-start"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-emerald-600 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-3xs shrink-0">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-black truncate">{subj.name}</span>
                      </div>
                      {subj.subCategory && (
                        <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-extrabold shrink-0">
                          {subj.subCategory}
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                      <span className="text-[10.5px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">{subjResources.length} Resources</span>
                      <button
                        onClick={() => {
                          setTargetSubjId(subj.id);
                          setAddResourceModal(true);
                        }}
                        className="text-[10.5px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-3xs"
                      >
                        + Resource
                      </button>
                      {deletingSubjectId === subj.id ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl text-[9px] shrink-0">
                          <span className="font-bold text-rose-700">Delete?</span>
                          <button onClick={() => { deleteSubjectFromWorkspace(activeWS.id, subj.id); setDeletingSubjectId(null); }} className="font-black text-rose-600 hover:text-rose-800">Yes</button>
                          <button onClick={() => setDeletingSubjectId(null)} className="font-black text-slate-500 hover:text-slate-700">No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingSubjectId(subj.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Resources Sub-tree */}
                  {isExpanded && (
                    <div className="pl-4 sm:pl-6 space-y-2 border-l-2 border-slate-150 ml-3 sm:ml-4">
                      {subjResources.map((res) => (
                        <div
                          key={res.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50/60 border border-slate-200 hover:border-emerald-300 rounded-2xl text-xs transition-all shadow-3xs gap-2.5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                            <span className="text-[9px] font-black uppercase bg-emerald-100/80 text-emerald-800 px-2.5 py-0.5 rounded-md shrink-0 border border-emerald-200/60">
                              {res.type}
                            </span>
                            <span className="font-black text-slate-800 truncate">{res.title}</span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md">
                              <Database className="w-3 h-3 text-emerald-600" />
                              {res.chunksCount} Chunks
                            </span>
                            {deletingResourceId === res.id ? (
                              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl text-[9px] shrink-0">
                                <span className="font-bold text-rose-700">Delete?</span>
                                <button onClick={() => { deleteResource(activeWS.id, res.id); setDeletingResourceId(null); }} className="font-black text-rose-600 hover:text-rose-800">Yes</button>
                                <button onClick={() => setDeletingResourceId(null)} className="font-black text-slate-500 hover:text-slate-700">No</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingResourceId(res.id)}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {subjResources.length === 0 && (
                        <p className="text-[11px] text-slate-400 font-semibold italic pl-2.5 py-1.5">No resources uploaded under {subj.name} yet.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CREATE WORKSPACE MODAL */}
      {createWSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-[28px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">Create New Goal Workspace</h3>
              <button onClick={() => setCreateWSModal(false)} className="p-1 rounded-lg hover:bg-slate-100 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-750">Workspace Title</label>
                <input
                  type="text"
                  value={newWSTitle}
                  onChange={(e) => setNewWSTitle(e.target.value)}
                  placeholder="e.g. Workspace 4 (GATE CS)"
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-755">Exam Name</label>
                <input
                  type="text"
                  value={newWSExam}
                  onChange={(e) => setNewWSExam(e.target.value)}
                  placeholder="e.g. GATE Computer Science"
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-760">Description</label>
                <textarea
                  value={newWSDesc}
                  onChange={(e) => setNewWSDesc(e.target.value)}
                  placeholder="Brief description..."
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl h-20 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setCreateWSModal(false)} className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs transition">Cancel</button>
              <button onClick={handleCreateWS} className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition">Create Workspace</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SUBJECT MODAL */}
      {addSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-[28px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">Add Subject to {activeWS.title}</h3>
              <button onClick={() => setAddSubjectModal(false)} className="p-1 rounded-lg hover:bg-slate-100 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Subject Name</label>
                <input
                  type="text"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="e.g. International Relations"
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Exam Category</label>
                <select
                  value={newSubjCategory}
                  onChange={(e) => setNewSubjCategory(e.target.value as "Prelims" | "Mains" | "Interview" | "General")}
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                >
                  <option value="Prelims">Prelims</option>
                  <option value="Mains">Mains</option>
                  <option value="Interview">Interview</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setAddSubjectModal(false)} className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs transition">Cancel</button>
              <button onClick={handleAddSubject} className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition">Add Subject</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD RESOURCE MODAL */}
      {addResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-[28px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">Add Resource</h3>
              <button onClick={() => setAddResourceModal(false)} className="p-1 rounded-lg hover:bg-slate-100 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Resource Title</label>
                <input
                  type="text"
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  placeholder="e.g. Modern India Handout Notes"
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Resource Type</label>
                <select
                  value={newResType}
                  onChange={(e) => setNewResType(e.target.value as "Book" | "PDF" | "Note" | "PYQ")}
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                >
                  <option value="Book">Book</option>
                  <option value="PDF">PDF</option>
                  <option value="Note">Note</option>
                  <option value="PYQ">PYQ</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setAddResourceModal(false)} className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs transition">Cancel</button>
              <button onClick={handleAddResource} className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition">Add Resource</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
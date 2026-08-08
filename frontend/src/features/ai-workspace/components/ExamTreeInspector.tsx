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
      color: "from-purple-500 to-indigo-600"
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Controls Banner */}
      {/* <div className="bg-white border border-purple-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-purple-700 bg-purple-100/80 border border-purple-200 px-3 py-1 rounded-full w-fit">
            <FolderTree className="w-3.5 h-3.5" />
            Goal Workspaces
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-2">Exam Data & Feature Tree</h2>
          <p className="text-xs text-slate-500 font-bold mt-0.5">
            Explore and edit exam goal workspaces, subjects, resources
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ResourceUploadButton variant="gradient" size="md" />
          <button
            onClick={() => setCreateWSModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black rounded-2xl transition-all shadow-md shadow-purple-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Workspace
          </button>
        </div>
      </div> */}

      {/* 7-STAGE AI PROCESSING PIPELINE DIAGRAM */}
      {/* <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-purple-600" />
          <span>4. AI Processing Pipeline (7 Stages)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          {[
            { step: "1", title: "Upload Resource", icon: Scan, color: "bg-blue-50 text-blue-600 border-blue-200" },
            { step: "2", title: "OCR Extraction", icon: FileCode, color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
            { step: "3", title: "Text Cleaning", icon: FileCheck, color: "bg-purple-50 text-purple-600 border-purple-200" },
            { step: "4", title: "Smart Chunking", icon: Layers, color: "bg-pink-50 text-pink-600 border-pink-200" },
            { step: "5", title: "Topic Detection", icon: Sparkles, color: "bg-amber-50 text-amber-600 border-amber-200" },
            { step: "6", title: "Embeddings", icon: Database, color: "bg-teal-50 text-teal-600 border-teal-200" },
            { step: "7", title: "Qdrant Vector DB", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 border-emerald-200" }
          ].map(({ step, title, icon: Icon, color }) => (
            <div key={step} className={`p-3 rounded-2xl border ${color} flex flex-col items-center justify-center space-y-1.5`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-black">{step}. {title}</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* WORKSPACES SELECTOR TABS & TREE VIEW */}
      <div className="bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/20 border border-purple-200/70 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden">
        {/* Soft Radial Ambient Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="flex items-center justify-between border-b border-purple-100/80 pb-4 relative z-10">
          {/* <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspaceId(ws.id)}
                className={`px-4 py-2 text-xs font-black rounded-2xl transition-all shrink-0 cursor-pointer ${activeWorkspaceId === ws.id
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200 ring-2 ring-purple-200"
                  : "bg-white/90 text-slate-700 hover:bg-purple-50 hover:text-purple-900 border border-purple-100/80 shadow-2xs"
                  }`}
              >
                {ws.title}
              </button>
            ))}
          </div> */}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddSubjectModal(true)}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100/80 text-purple-700 text-xs font-black rounded-2xl border border-purple-200/80 transition-all cursor-pointer shadow-2xs"
            >
              + Add Subject
            </button>
            {workspaces.length > 1 && (
              deletingWorkspaceId === activeWS.id ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl text-[10px]">
                  <span className="font-bold text-rose-700">Delete?</span>
                  <button onClick={() => { deleteWorkspace(activeWS.id); setDeletingWorkspaceId(null); }} className="font-bold text-rose-600 hover:text-rose-800">Yes</button>
                  <button onClick={() => setDeletingWorkspaceId(null)} className="font-bold text-slate-500 hover:text-slate-700">No</button>
                </div>
              ) : (
                <button
                  onClick={() => setDeletingWorkspaceId(activeWS.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>

        {/* Dynamic Tree Hierarchy Visualization */}
        <div className="space-y-3 font-sans relative z-10">
          <div className="flex items-center justify-between p-4 bg-white/90 border border-purple-200/80 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2.5 text-xs font-black text-slate-900">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-2xs">
                <FolderTree className="w-4 h-4" />
              </div>
              <span>{activeWS.title} ({activeWS.examName})</span>
            </div>
            <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              {activeWS.subjects.length} Subjects Active
            </span>
          </div>

          {/* Subjects Sub-tree */}
          <div className="pl-4 space-y-3 border-l-2 border-purple-200/60 ml-4">
            {activeWS.subjects.map((subj) => {
              const isExpanded = expandedNodes[subj.id];
              const subjResources = activeWS.resources.filter((r) => r.subjectId === subj.id);

              return (
                <div key={subj.id} className="space-y-2">
                  <div className="flex items-center justify-between p-3.5 bg-white/80 hover:bg-purple-50/40 border border-slate-200 hover:border-purple-300 rounded-2xl transition-all shadow-2xs">
                    <button
                      onClick={() => toggleNode(subj.id)}
                      className="flex items-center gap-2.5 text-xs font-black text-slate-800 hover:text-purple-700 cursor-pointer"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-purple-600" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <div className="p-1.5 rounded-lg bg-purple-100/70 text-purple-700">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <span>{subj.name}</span>
                      {subj.subCategory && (
                        <span className="text-[9px] bg-slate-50 border border-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md font-extrabold">
                          {subj.subCategory}
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-450">{subjResources.length} Resources</span>
                      <button
                        onClick={() => {
                          setTargetSubjId(subj.id);
                          setAddResourceModal(true);
                        }}
                        className="text-[10px] font-black text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                      >
                        + Resource
                      </button>
                      {deletingSubjectId === subj.id ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg text-[9px] shrink-0">
                          <span className="font-bold text-rose-700">Delete?</span>
                          <button onClick={() => { deleteSubjectFromWorkspace(activeWS.id, subj.id); setDeletingSubjectId(null); }} className="font-bold text-rose-600 hover:text-rose-800">Yes</button>
                          <button onClick={() => setDeletingSubjectId(null)} className="font-bold text-slate-500 hover:text-slate-700">No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingSubjectId(subj.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Resources Sub-tree */}
                  {isExpanded && (
                    <div className="pl-6 space-y-2 border-l-2 border-purple-200/40 ml-4">
                      {subjResources.map((res) => (
                        <div
                          key={res.id}
                          className="flex items-center justify-between p-3 bg-white/90 border border-purple-100 hover:border-purple-300 rounded-2xl text-xs transition-all shadow-2xs hover:shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[9px] font-black uppercase bg-purple-100/80 text-purple-800 px-2 py-0.5 rounded-md shrink-0 border border-purple-200/60">
                              {res.type}
                            </span>
                            <span className="font-black text-slate-800 truncate">{res.title}</span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                              <Database className="w-3 h-3 text-emerald-600" />
                              {res.chunksCount} Chunks
                            </span>
                            {deletingResourceId === res.id ? (
                              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg text-[9px] shrink-0">
                                <span className="font-bold text-rose-700">Delete?</span>
                                <button onClick={() => { deleteResource(activeWS.id, res.id); setDeletingResourceId(null); }} className="font-bold text-rose-600 hover:text-rose-800">Yes</button>
                                <button onClick={() => setDeletingResourceId(null)} className="font-bold text-slate-500 hover:text-slate-700">No</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingResourceId(res.id)}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {subjResources.length === 0 && (
                        <p className="text-[11px] text-slate-400 font-semibold italic pl-2 py-1">No resources uploaded under {subj.name} yet.</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">Create New Goal Workspace</h3>
              <button onClick={() => setCreateWSModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Workspace Title</label>
                <input
                  type="text"
                  value={newWSTitle}
                  onChange={(e) => setNewWSTitle(e.target.value)}
                  placeholder="e.g. Workspace 4 (GATE CS)"
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Exam Name</label>
                <input
                  type="text"
                  value={newWSExam}
                  onChange={(e) => setNewWSExam(e.target.value)}
                  placeholder="e.g. GATE Computer Science"
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  value={newWSDesc}
                  onChange={(e) => setNewWSDesc(e.target.value)}
                  placeholder="Brief description..."
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl h-20"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setCreateWSModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs">Cancel</button>
              <button onClick={handleCreateWS} className="flex-1 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SUBJECT MODAL */}
      {addSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">Add Subject to {activeWS.title}</h3>
              <button onClick={() => setAddSubjectModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Subject Name</label>
                <input
                  type="text"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="e.g. International Relations"
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Exam Category</label>
                <select
                  value={newSubjCategory}
                  onChange={(e) => setNewSubjCategory(e.target.value as "Prelims" | "Mains" | "Interview" | "General")}
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Prelims">Prelims</option>
                  <option value="Mains">Mains</option>
                  <option value="Interview">Interview</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setAddSubjectModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs">Cancel</button>
              <button onClick={handleAddSubject} className="flex-1 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs">Add Subject</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD RESOURCE MODAL */}
      {addResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">Add Resource</h3>
              <button onClick={() => setAddResourceModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Resource Title</label>
                <input
                  type="text"
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  placeholder="e.g. Modern India Handout Notes"
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Resource Type</label>
                <select
                  value={newResType}
                  onChange={(e) => setNewResType(e.target.value as "Book" | "PDF" | "Note" | "PYQ")}
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Book">Book</option>
                  <option value="PDF">PDF</option>
                  <option value="Note">Note</option>
                  <option value="PYQ">PYQ</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setAddResourceModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs">Cancel</button>
              <button onClick={handleAddResource} className="flex-1 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs">Add Resource</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
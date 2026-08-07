"use client";

import React, { useState, useMemo } from "react";
import { useWorkspace } from "../workspaceContext";
import {
  FolderTree,
  Layers,
  Plus,
  Trash2,
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
  Search,
  Maximize2,
  Minimize2,
  ExternalLink,
  Tag,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/ToastContext";
import { ResourceUploadButton } from "@/components/resources/ResourceUploadButton";

export function ExamTreeInspector() {
  const { toast } = useToast();
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    createWorkspace,
    deleteWorkspace,
    addSubjectToWorkspace,
    deleteSubjectFromWorkspace,
    addResourceToSubject,
    deleteResource,
    selectSubject,
    selectResource,
    setFlowStep,
  } = useWorkspace();

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [treeSearch, setTreeSearch] = useState("");

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

  const activeWS = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0],
    [workspaces, activeWorkspaceId]
  );

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    if (!activeWS) return;
    const map: Record<string, boolean> = {};
    activeWS.subjects.forEach((s) => {
      map[s.id] = true;
    });
    setExpandedNodes(map);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const handleCreateWS = () => {
    if (!newWSTitle.trim() || !newWSExam.trim()) {
      toast("Please enter workspace title and exam name.", "error");
      return;
    }
    createWorkspace(newWSTitle.trim(), newWSExam.trim(), newWSDesc.trim());
    setCreateWSModal(false);
    setNewWSTitle("");
    setNewWSExam("");
    setNewWSDesc("");
    toast("New goal workspace created successfully.", "success");
  };

  const handleAddSubject = () => {
    if (!newSubjName.trim()) {
      toast("Please enter subject name.", "error");
      return;
    }
    addSubjectToWorkspace(activeWorkspaceId, {
      name: newSubjName.trim(),
      category: newSubjCategory,
      resourceCount: 0,
      iconName: "BookOpen",
      color: "from-purple-500 to-indigo-600",
    });
    setAddSubjectModal(false);
    setNewSubjName("");
    toast(`Subject '${newSubjName.trim()}' added to workspace.`, "success");
  };

  const handleAddResource = () => {
    if (!newResTitle.trim() || !targetSubjId) {
      toast("Please enter resource title and select target subject.", "error");
      return;
    }
    addResourceToSubject({
      subjectId: targetSubjId,
      title: newResTitle.trim(),
      type: newResType,
      pages: 120,
      size: "15.0 MB",
      uploadDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      chapters: ["Chapter 1: Foundations", "Chapter 2: Advanced Applications"],
      chunksCount: 150,
      vectorStatus: "Indexed",
    });
    setAddResourceModal(false);
    setNewResTitle("");
    toast(`Resource '${newResTitle.trim()}' added.`, "success");
  };

  const handleJumpToStudySubject = (subjectId: string) => {
    selectSubject(subjectId);
    setFlowStep(2);
    toast("Switched workspace focus to selected subject.", "info");
  };

  const handleJumpToResourcePreview = (subjectId: string, resourceId: string) => {
    selectSubject(subjectId);
    selectResource(resourceId);
    setFlowStep(4);
    toast("Opening document preview chunks...", "info");
  };

  // Filter subjects and resources by search query
  const filteredSubjects = useMemo(() => {
    if (!activeWS) return [];
    if (!treeSearch.trim()) return activeWS.subjects;
    const q = treeSearch.toLowerCase();
    return activeWS.subjects.filter((s) => {
      const matchSubject = s.name.toLowerCase().includes(q) || (s.category && s.category.toLowerCase().includes(q));
      const matchResources = activeWS.resources.some(
        (r) => r.subjectId === s.id && (r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q))
      );
      return matchSubject || matchResources;
    });
  }, [activeWS, treeSearch]);

  if (!activeWS) {
    return (
      <div className="p-12 text-center text-slate-400 font-bold bg-white rounded-3xl border border-slate-200">
        No active goal workspace found. Please create one to inspect.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Controls Banner */}
      <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full w-fit border border-purple-100">
            <FolderTree className="w-3.5 h-3.5" />
            Goal Workspaces Tree
          </div>
          <h2 className="text-xl font-black text-slate-800 mt-2">Exam Data & Feature Hierarchy</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-semibold">
            Inspect, organize, and jump directly into study workflows for subjects and document vectors
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <ResourceUploadButton workspaceId={activeWorkspaceId} variant="gradient" size="md" />
          <button
            onClick={() => setCreateWSModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-2xl transition-all shadow-md shadow-purple-100 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Workspace</span>
          </button>
        </div>
      </div>

      {/* 7-STAGE RAG AI PROCESSING PIPELINE DIAGRAM */}
      {/* <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>ExamForge RAG Ingestion Pipeline (7 Stages)</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">Automated Vector Pipeline</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
          {[
            { step: "1", title: "Upload PDF", icon: Scan, color: "bg-blue-50 text-blue-700 border-blue-200" },
            { step: "2", title: "OCR Extraction", icon: FileCode, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
            { step: "3", title: "Text Cleaning", icon: FileCheck, color: "bg-purple-50 text-purple-700 border-purple-200" },
            { step: "4", title: "Smart Chunking", icon: Layers, color: "bg-pink-50 text-pink-700 border-pink-200" },
            { step: "5", title: "Topic Tags", icon: Sparkles, color: "bg-amber-50 text-amber-700 border-amber-200" },
            { step: "6", title: "Embeddings", icon: Database, color: "bg-teal-50 text-teal-700 border-teal-200" },
            { step: "7", title: "Vector DB", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
          ].map(({ step, title, icon: Icon, color }) => (
            <div key={step} className={`p-3 rounded-2xl border ${color} flex flex-col items-center justify-center space-y-1.5 shadow-sm`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-black">{step}. {title}</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* WORKSPACES SELECTOR TABS & TREE VIEW */}
      <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Workspace Switcher & Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspaceId(ws.id)}
                className={`px-4 py-2 text-xs font-black rounded-2xl transition-all shrink-0 cursor-pointer ${activeWorkspaceId === ws.id
                  ? "bg-purple-600 text-white shadow-md shadow-purple-100 scale-[1.02]"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
              >
                {ws.title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setAddSubjectModal(true)}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-black rounded-xl border border-purple-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>

            {workspaces.length > 1 && (
              deletingWorkspaceId === activeWS.id ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl text-[10px]">
                  <span className="font-bold text-rose-700">Delete workspace?</span>
                  <button
                    onClick={() => {
                      deleteWorkspace(activeWS.id);
                      setDeletingWorkspaceId(null);
                      toast("Workspace deleted.", "info");
                    }}
                    className="font-black text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setDeletingWorkspaceId(null)}
                    className="font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeletingWorkspaceId(activeWS.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Workspace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>

        {/* Tree Search & Collapse Controls Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={treeSearch}
              onChange={(e) => setTreeSearch(e.target.value)}
              placeholder="Search tree nodes by subject, title, category..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-400 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 text-[10px] font-black text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Expand All</span>
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 text-[10px] font-black text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <Minimize2 className="w-3 h-3" />
              <span>Collapse All</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tree Hierarchy Visualization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-purple-50/60 border border-purple-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2.5 text-xs font-black text-slate-800">
              <FolderTree className="w-4.5 h-4.5 text-purple-600" />
              <span>{activeWS.title}</span>
              <span className="text-[10px] font-black text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md border border-purple-200">
                {activeWS.examName}
              </span>
            </div>
            <span className="text-[10px] font-black text-slate-400">
              {activeWS.subjects.length} Subject Node{activeWS.subjects.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Subjects Sub-tree */}
          <div className="pl-4 space-y-2.5 border-l-2 border-purple-100 ml-3">
            {filteredSubjects.map((subj) => {
              const isExpanded = expandedNodes[subj.id] ?? true;
              const subjResources = activeWS.resources.filter((r) => r.subjectId === subj.id);

              return (
                <div key={subj.id} className="space-y-2">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-purple-50/40 border border-slate-200 rounded-2xl transition-all group">
                    <button
                      onClick={() => toggleNode(subj.id)}
                      className="flex items-center gap-2 text-xs font-black text-slate-800 hover:text-purple-600 transition-colors cursor-pointer min-w-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-purple-600 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="truncate">{subj.name}</span>
                      {subj.category && (
                        <span className="text-[9px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-bold shrink-0">
                          {subj.category}
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-black text-slate-400">
                        {subjResources.length} Resource{subjResources.length === 1 ? "" : "s"}
                      </span>

                      {/* Direct jump to study context button */}
                      <button
                        onClick={() => handleJumpToStudySubject(subj.id)}
                        className="px-2.5 py-1 text-[10px] font-black text-purple-700 bg-purple-100/70 hover:bg-purple-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title="Jump to AI Study flow for this subject"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Study</span>
                      </button>

                      <button
                        onClick={() => {
                          setTargetSubjId(subj.id);
                          setAddResourceModal(true);
                        }}
                        className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 hover:border-purple-300 px-2 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        + Material
                      </button>

                      {deletingSubjectId === subj.id ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg text-[9px]">
                          <span className="font-bold text-rose-700">Delete?</span>
                          <button
                            onClick={() => {
                              deleteSubjectFromWorkspace(activeWS.id, subj.id);
                              setDeletingSubjectId(null);
                              toast(`Subject deleted.`, "info");
                            }}
                            className="font-black text-rose-600 hover:text-rose-800 cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeletingSubjectId(null)}
                            className="font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingSubjectId(subj.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Resources Sub-tree */}
                  {isExpanded && (
                    <div className="pl-6 space-y-2 border-l-2 border-slate-200 ml-4">
                      {subjResources.map((res) => (
                        <div
                          key={res.id}
                          className="flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-purple-300 rounded-xl text-xs transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="text-[9px] font-black uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md shrink-0">
                              {res.type}
                            </span>
                            <span
                              onClick={() => handleJumpToResourcePreview(subj.id, res.id)}
                              className="font-bold text-slate-800 truncate cursor-pointer hover:text-purple-700 transition-colors"
                              title="Click to preview resource text chunks"
                            >
                              {res.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] text-slate-400 font-extrabold">
                              {res.chunksCount || 120} Vector Chunks (Qdrant)
                            </span>

                            <button
                              onClick={() => handleJumpToResourcePreview(subj.id, res.id)}
                              className="p-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                              title="Preview Document Chunks"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            {deletingResourceId === res.id ? (
                              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg text-[9px]">
                                <span className="font-bold text-rose-700">Delete?</span>
                                <button
                                  onClick={() => {
                                    deleteResource(activeWS.id, res.id);
                                    setDeletingResourceId(null);
                                    toast("Resource deleted.", "info");
                                  }}
                                  className="font-black text-rose-600 hover:text-rose-800 cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeletingResourceId(null)}
                                  className="font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingResourceId(res.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete Resource"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {subjResources.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic pl-2 font-bold">
                          No study resources uploaded under {subj.name} yet.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredSubjects.length === 0 && (
              <div className="py-12 text-center text-xs font-bold text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                No tree nodes match your search query.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE WORKSPACE MODAL */}
      {createWSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">Create Goal Workspace</h3>
              <button onClick={() => setCreateWSModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Workspace Title</label>
                <input
                  type="text"
                  value={newWSTitle}
                  onChange={(e) => setNewWSTitle(e.target.value)}
                  placeholder="e.g. Workspace 4 (GATE CS)"
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-400 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Exam Name</label>
                <input
                  type="text"
                  value={newWSExam}
                  onChange={(e) => setNewWSExam(e.target.value)}
                  placeholder="e.g. GATE Computer Science"
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-400 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  value={newWSDesc}
                  onChange={(e) => setNewWSDesc(e.target.value)}
                  placeholder="Brief description of exam goals..."
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl h-20 outline-none focus:border-purple-400 font-semibold"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setCreateWSModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs cursor-pointer">
                Cancel
              </button>
              <button onClick={handleCreateWS} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-md shadow-purple-100">
                Create Workspace
              </button>
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
              <button onClick={() => setAddSubjectModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Subject Name</label>
                <input
                  type="text"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="e.g. International Relations"
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-400 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Exam Category</label>
                <select
                  value={newSubjCategory}
                  onChange={(e) => setNewSubjCategory(e.target.value as "Prelims" | "Mains" | "Interview" | "General")}
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-400 font-semibold cursor-pointer"
                >
                  <option value="Prelims">Prelims</option>
                  <option value="Mains">Mains</option>
                  <option value="Interview">Interview</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setAddSubjectModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs cursor-pointer">
                Cancel
              </button>
              <button onClick={handleAddSubject} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-md shadow-purple-100">
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD RESOURCE MODAL */}
      {addResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">Add Material Resource</h3>
              <button onClick={() => setAddResourceModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Resource Title</label>
                <input
                  type="text"
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  placeholder="e.g. Constitutional Law Notes"
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-400 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Resource Type</label>
                <select
                  value={newResType}
                  onChange={(e) => setNewResType(e.target.value as "Book" | "PDF" | "Note" | "PYQ")}
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-400 font-semibold cursor-pointer"
                >
                  <option value="Book">Book</option>
                  <option value="PDF">PDF</option>
                  <option value="Note">Note</option>
                  <option value="PYQ">PYQ</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setAddResourceModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs cursor-pointer">
                Cancel
              </button>
              <button onClick={handleAddResource} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-md shadow-purple-100">
                Add Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

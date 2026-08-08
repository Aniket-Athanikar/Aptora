"use client";

import React, { useEffect, useRef, useState } from "react";
import { useWorkspace } from "../workspaceContext";
import {
  Sparkles,
  ArrowLeft,
  Search,
  BookOpen,
  FileText,
  FileCheck,
  HelpCircle,
  ChevronRight,
  Bot,
  Send,
  Eye,
  RotateCcw,
  CheckCircle2,
  Book,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Layers,
  Sparkle,
  HelpCircle as HelpIcon,
  MessageSquare,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { backendService, type Resource } from "@/services/backend.service";
import { ResourceUploadButton } from "@/components/resources/ResourceUploadButton";
import { ChatMessage } from "./ChatMessage";
import { ConversationSidebar } from "./ConversationSidebar";
import { ChunkViewerModal } from "./ChunkViewerModal";

const getSubjectTheme = (colorStr: string) => {
  const s = colorStr.toLowerCase();
  if (s.includes("purple") || s.includes("violet")) {
    return {
      hoverBg: "hover:bg-purple-50/40",
      hoverBorder: "hover:border-purple-300",
      hoverText: "group-hover:text-purple-700",
      badgeBg: "bg-purple-50 text-purple-650",
      iconBg: "bg-purple-50 text-purple-600",
    };
  }
  if (s.includes("pink")) {
    return {
      hoverBg: "hover:bg-pink-50/40",
      hoverBorder: "hover:border-pink-300",
      hoverText: "group-hover:text-pink-700",
      badgeBg: "bg-pink-50 text-pink-650",
      iconBg: "bg-pink-50 text-pink-600",
    };
  }
  if (s.includes("blue") || s.includes("sky")) {
    return {
      hoverBg: "hover:bg-blue-50/40",
      hoverBorder: "hover:border-blue-300",
      hoverText: "group-hover:text-blue-700",
      badgeBg: "bg-blue-50 text-blue-650",
      iconBg: "bg-blue-50 text-blue-600",
    };
  }
  if (s.includes("emerald") || s.includes("green") || s.includes("teal")) {
    return {
      hoverBg: "hover:bg-emerald-50/40",
      hoverBorder: "hover:border-emerald-300",
      hoverText: "group-hover:text-emerald-700",
      badgeBg: "bg-emerald-50 text-emerald-650",
      iconBg: "bg-emerald-50 text-emerald-600",
    };
  }
  if (s.includes("rose") || s.includes("red")) {
    return {
      hoverBg: "hover:bg-rose-50/40",
      hoverBorder: "hover:border-rose-300",
      hoverText: "group-hover:text-rose-700",
      badgeBg: "bg-rose-50 text-rose-650",
      iconBg: "bg-rose-50 text-rose-600",
    };
  }
  if (s.includes("amber") || s.includes("orange") || s.includes("yellow")) {
    return {
      hoverBg: "hover:bg-amber-50/40",
      hoverBorder: "hover:border-amber-300",
      hoverText: "group-hover:text-amber-700",
      badgeBg: "bg-amber-50 text-amber-650",
      iconBg: "bg-amber-50 text-amber-600",
    };
  }
  return {
    hoverBg: "hover:bg-indigo-50/40",
    hoverBorder: "hover:border-indigo-300",
    hoverText: "group-hover:text-indigo-700",
    badgeBg: "bg-indigo-50 text-indigo-650",
    iconBg: "bg-indigo-50 text-indigo-600",
  };
};

export function AIChatStepFlow() {
  return <AiStudyHome />;
}

const FLOW_STEPS = [
  { step: 1, label: "Subject", icon: BookOpen },
  { step: 2, label: "Format", icon: Layers },
  { step: 3, label: "Resource", icon: Search },
  { step: 4, label: "Preview", icon: FileText },
  { step: 5, label: "AI Study", icon: Sparkles },
] as const;

function FlowStepProgressBar({ currentStep, onStepClick }: { currentStep: number; onStepClick?: (step: 1 | 2 | 3 | 4 | 5) => void }) {
  // Line progress percentage calculation centered on node centers (0% to 100%)
  const progressPercent = ((currentStep - 1) / (FLOW_STEPS.length - 1)) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-md border border-purple-200/80 rounded-full px-6 sm:px-10 py-3 shadow-md shadow-purple-950/5 mb-7">
      <div className="relative flex items-center justify-between">
        {/* Background Subtle Line */}
        <div className="absolute left-4 right-4 top-4 h-1 bg-purple-100/80 rounded-full z-0" />

        {/* Active Animated Gradient Progress Line */}
        <div
          className="absolute left-4 top-4 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 rounded-full z-0 transition-all duration-500 ease-out shadow-xs"
          style={{ width: `calc(${progressPercent}% * 0.95)` }}
        />

        {FLOW_STEPS.map(({ step, label, icon: Icon }) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isClickable = onStepClick && step <= currentStep;

          return (
            <button
              key={step}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(step as 1 | 2 | 3 | 4 | 5)}
              className={`relative z-10 flex flex-col items-center gap-1.5 outline-none group ${!isClickable ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                }`}
            >
              {/* Circular Badge Icon Node */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs transition-all duration-300 font-black ${isCurrent
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white ring-4 ring-purple-100/90 shadow-md scale-110"
                  : isCompleted
                    ? "bg-emerald-500 text-white shadow-xs font-black"
                    : "bg-purple-50/60 text-slate-400 border border-purple-200/80 hover:border-purple-400 hover:text-purple-700"
                  }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>

              {/* Step Label */}
              <span
                className={`text-[10px] font-black tracking-widest uppercase transition-colors ${isCurrent
                  ? "text-purple-950 font-black"
                  : isCompleted
                    ? "text-slate-800"
                    : "text-slate-400"
                  }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AiStudyHome() {
  const { activeWorkspace, activeWorkspaceId, flowStep, setFlowStep, selectedSubjectId, selectedResourceType, selectedResourceId, selectSubject, selectResourceType, selectResource, refreshResources } = useWorkspace();
  const [subjectSearch, setSubjectSearch] = useState("");
  const subjects = (activeWorkspace?.subjects ?? []).filter((subject) =>
    subject.name.toLowerCase().includes(subjectSearch.trim().toLowerCase())
  );
  const selectedSubject = activeWorkspace?.subjects.find((subject) => subject.id === selectedSubjectId);

  if (flowStep === 2 && selectedSubject) {
    const subjectResources = activeWorkspace?.resources.filter((resource) => resource.subjectId === selectedSubject.id) ?? [];
    const resourceTypes = [
      { label: "Books", type: "Book", icon: BookOpen, tone: "text-purple-600 bg-purple-50" },
      { label: "Notes", type: "Note", icon: FileCheck, tone: "text-amber-600 bg-amber-50" },
      { label: "PYQs", type: "PYQ", icon: HelpCircle, tone: "text-blue-600 bg-blue-50" },
      { label: "Syllabus", type: "Syllabus", icon: Layers, tone: "text-emerald-600 bg-emerald-50" },
    ] as const;

    return (
      <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm">
        <FlowStepProgressBar currentStep={2} onStepClick={setFlowStep} />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
          <button onClick={() => setFlowStep(1)} className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-black text-slate-700 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all cursor-pointer shadow-2xs group">
            <ArrowLeft className="w-4 h-4 text-purple-600 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Subjects</span>
          </button>
          <div className="flex flex-col items-center text-center p-6 bg-white border border-purple-100 rounded-3xl shadow-sm space-y-3">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedSubject.color} text-white flex items-center justify-center shadow-lg`}><BookOpen className="w-8 h-8" /></div>
            <div><h2 className="text-2xl font-black text-slate-800">{selectedSubject.name}</h2><p className="text-xs text-slate-400 mt-1">Explore study material in different formats</p></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {resourceTypes.map(({ label, type, icon: Icon, tone }) => {
              const count = subjectResources.filter((resource) => resource.type === type).length;
              return <div key={type} className="p-5 bg-white border border-slate-200 hover:border-purple-300 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition-all">
                <div className={`w-12 h-12 rounded-xl ${tone} flex items-center justify-center mb-3`}><Icon className="w-6 h-6" /></div>
                <button onClick={() => selectResourceType(type)} className="text-sm font-black text-slate-800 hover:text-purple-600">{label}</button><span className="text-[10px] text-slate-400 font-extrabold mt-0.5">{count} Resources</span>
                <div className="mt-3"><ResourceUploadButton workspaceId={activeWorkspaceId} subjectId={selectedSubject.id} resourceType={backendResourceType[type]} variant="outline" size="sm" label="Upload" onSuccess={() => void refreshResources()} /></div>
              </div>;
            })}
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setFlowStep(5)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-purple-200 transition-all duration-200 cursor-pointer group hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (flowStep === 3 && selectedSubject && selectedResourceType) {
    return <ResourceListStage subjectId={selectedSubject.id} subjectName={selectedSubject.name} resourceType={selectedResourceType} onBack={() => setFlowStep(2)} onSelect={selectResource} />;
  }

  if (flowStep === 4 && selectedResourceId) {
    return <ResourcePreviewStage resourceId={selectedResourceId} onBack={() => setFlowStep(3)} onStudy={() => setFlowStep(5)} />;
  }

  if (flowStep === 5 && selectedSubject) {
    return <KnowledgeStudyWorkspace resourceId={selectedResourceId || ""} subjectName={selectedSubject.name} resourceType={selectedResourceType || "Book"} onBack={() => setFlowStep(selectedResourceId ? 4 : 2)} />;
  }

  return (
    <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm">
      <FlowStepProgressBar currentStep={1} onStepClick={setFlowStep} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[11px] font-black uppercase tracking-wider"><Bot className="w-3.5 h-3.5" /><span>AI Study Assistant</span></div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI Study</h2>
          <p className="text-xs text-slate-500">Select a subject to start learning with AI</p>
        </div>
        <div className="max-w-md mx-auto relative"><Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" /><input value={subjectSearch} onChange={(event) => setSubjectSearch(event.target.value)} placeholder="Search subjects" className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 shadow-sm transition-all" /></div>
        {subjects.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {subjects.map((subject) => {
              const theme = getSubjectTheme(subject.color);
              return (
                <button
                  key={subject.id}
                  onClick={() => selectSubject(subject.id)}
                  className={`group relative flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-3xl ${theme.hoverBg} ${theme.hoverBorder} hover:shadow-lg hover:shadow-purple-100/35 transition-all duration-350 text-center cursor-pointer`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-3.5`}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className={`text-xs font-black text-slate-800 ${theme.hoverText} transition-colors`}>
                    {subject.name}
                  </h3>
                  <span className="text-[10px] font-extrabold text-slate-400 mt-1.5">
                    {subject.resourceCount} Resources
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-14 bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-xs text-slate-400">No subjects available.</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-xs font-bold text-purple-650 hover:text-purple-750 cursor-pointer">
              Retry
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

type ResourceTypeFilter = "Book" | "PDF" | "Note" | "PYQ" | "Syllabus";
const backendResourceType: Record<ResourceTypeFilter, string> = { Book: "book", PDF: "pdf", Note: "notes", PYQ: "pyq", Syllabus: "syllabus" };

function ResourceListStage({ subjectId, subjectName, resourceType, onBack, onSelect }: { subjectId: string; subjectName: string; resourceType: ResourceTypeFilter; onBack: () => void; onSelect: (id: string) => void }) {
  const { activeWorkspaceId } = useWorkspace();
  const [query, setQuery] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    const workspaceId = Number(activeWorkspaceId);
    if (!Number.isInteger(workspaceId) || workspaceId <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ subject_id: subjectId, resource_type: backendResourceType[resourceType], keyword: query, limit: "100" });
      setResources((await backendService.workspace.search(workspaceId, params)).items);
    } catch (caught) {
      setResources([]);
      setError(caught instanceof Error ? caught.message : "Unable to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 250);
    return () => window.clearTimeout(timer);
  }, [activeWorkspaceId, subjectId, resourceType, query]);

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === "completed" || s === "indexed" || s === "ready") {
      return "text-emerald-700 bg-emerald-50 border border-emerald-100";
    }
    if (s === "failed" || s === "error") {
      return "text-rose-700 bg-rose-50 border border-rose-100";
    }
    if (s === "processing") {
      return "text-amber-700 bg-amber-50 border border-amber-100 animate-pulse";
    }
    return "text-blue-700 bg-blue-50 border border-blue-100";
  };

  return (
    <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm space-y-5">
      <FlowStepProgressBar currentStep={3} />
      <button onClick={onBack} className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-black text-slate-700 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all cursor-pointer shadow-2xs group">
        <ArrowLeft className="w-4 h-4 text-purple-600 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Resource</span>
      </button>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{subjectName} · {resourceType}s</h2>
          <p className="text-xs text-slate-450 mt-1">Resources from your workspace library</p>
        </div>
        <button
          disabled={!selectedId}
          onClick={() => selectedId && onSelect(selectedId)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:from-slate-300 disabled:to-slate-300 text-white text-xs font-black shadow-lg shadow-purple-200 disabled:shadow-none transition-all duration-200 cursor-pointer disabled:cursor-not-allowed group hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search resources..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading resources…</div>
      ) : error ? (
        <div className="py-16 text-center text-xs text-rose-500">
          {error}
          <button onClick={() => void load()} className="block mx-auto mt-3 text-purple-650 font-bold hover:underline">Retry</button>
        </div>
      ) : resources.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resources.map((resource) => {
            const isSelected = selectedId === String(resource.id);
            const statusClass = getStatusStyle(resource.status);
            return (
              <button
                key={resource.id}
                onClick={() => setSelectedId(String(resource.id))}
                className={`w-full text-left flex items-start justify-between gap-4 p-4.5 bg-white border rounded-3xl shadow-sm transition-all duration-200 cursor-pointer ${isSelected
                  ? "border-purple-500 ring-4 ring-purple-50/70"
                  : "border-slate-200 hover:border-purple-300"
                  }`}
              >
                <div className="flex gap-3 items-start min-w-0">
                  <div className={`p-3 rounded-2xl shrink-0 ${isSelected ? "bg-purple-50 text-purple-600" : "bg-slate-50 text-slate-400"
                    }`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-slate-800 truncate leading-snug group-hover:text-purple-600 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-[10px] text-slate-450 mt-1.5 font-bold tracking-tight">
                      {resource.resource_type} · {new Date(resource.created_at).toLocaleDateString()} {resource.total_pages ? `· ${resource.total_pages} pages` : ""}
                    </p>
                  </div>
                </div>

                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${statusClass} shrink-0 mt-0.5`}>
                  {resource.status}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
          <p className="text-xs text-slate-400">No resources uploaded yet.</p>
        </div>
      )}
    </div>
  );
}

function ResourcePreviewStage({ resourceId, onBack, onStudy }: { resourceId: string; onBack: () => void; onStudy: () => void }) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [preview, setPreview] = useState<{ resource_id: number; title: string; chunks: Array<{ index: number; content: string }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChunkModalOpen, setIsChunkModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await backendService.documents.get(Number(resourceId));
      setResource(resData);
      try {
        const previewData = await backendService.documents.preview(Number(resourceId));
        setPreview(previewData);
      } catch (err) {
        console.error("Failed to load preview chunks:", err);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load resource.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [resourceId]);

  return (
    <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm space-y-5">
      <FlowStepProgressBar currentStep={4} />
      <button onClick={onBack} className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-black text-slate-700 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all cursor-pointer shadow-2xs group">
        <ArrowLeft className="w-4 h-4 text-purple-600 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Resources</span>
      </button>
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading resource…</div>
      ) : error || !resource ? (
        <div className="py-16 text-center text-xs text-rose-500">
          {error || "Nothing found."}
          <button onClick={() => void load()} className="block mx-auto mt-3 text-purple-650 font-bold">Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          {/* Highlighted Book Template Card */}
          <aside className="bg-white border border-purple-100/60 rounded-3xl p-5 space-y-5 shadow-sm">
            {/* Visual Book Cover Representation */}
            <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-[#6D4AFF] via-purple-600 to-indigo-650 p-4 text-white flex flex-col justify-between shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="p-2.5 rounded-xl bg-white/15 w-fit border border-white/10">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-black uppercase tracking-widest bg-white/25 px-1.5 py-0.5 rounded">
                  {resource.resource_type}
                </span>
                <h3 className="text-sm font-black mt-2 line-clamp-2 text-white leading-snug drop-shadow-sm">
                  {resource.title}
                </h3>
              </div>
            </div>

            {/* Metadata Table Format Points */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <td className="px-3.5 py-2.5 text-slate-450 font-bold">Format</td>
                    <td className="px-3.5 py-2.5 font-black text-slate-800">{resource.resource_type}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-3.5 py-2.5 text-slate-450 font-bold">Size</td>
                    <td className="px-3.5 py-2.5 font-black text-slate-800">{resource.file_size ? `${(resource.file_size / (1024 * 1024)).toFixed(1)} MB` : "N/A"}</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <td className="px-3.5 py-2.5 text-slate-450 font-bold">Pages</td>
                    <td className="px-3.5 py-2.5 font-black text-purple-700">{resource.total_pages ? `${resource.total_pages} pages` : "Page count unavailable"}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-3.5 py-2.5 text-slate-450 font-bold">Uploaded</td>
                    <td className="px-3.5 py-2.5 font-black text-slate-800">{new Date(resource.created_at).toLocaleDateString()}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="px-3.5 py-2.5 text-slate-450 font-bold">Status</td>
                    <td className="px-3.5 py-2.5">
                      <span className="inline-block text-[9px] font-black uppercase text-emerald-700 bg-emerald-55/60 border border-emerald-100 px-2 py-0.5 rounded-md">
                        {resource.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => setIsChunkModalOpen(true)}
                className="w-full py-2.5 bg-purple-50 hover:bg-purple-100/70 border border-purple-200/80 text-purple-700 text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Chunks</span>
              </button>
              <button
                onClick={onStudy}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-purple-100"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Ask AI</span>
              </button>
            </div>
          </aside>

          {/* Document Chunks Panel */}
          <section data-lenis-prevent className="bg-white border border-purple-100/60 rounded-3xl p-6 text-xs text-slate-700 overflow-y-auto max-h-[520px] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Document Chunks ({preview?.chunks.length ?? 0})</span>
              </h3>
              {/* {preview && preview.chunks.length > 0 && (
                <button
                  onClick={() => setIsChunkModalOpen(true)}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Full Reader
                </button>
              )} */}
            </div>
            {preview && preview.chunks.length > 0 ? (
              <div className="space-y-3.5">
                {preview.chunks.map((chunk) => (
                  <div
                    key={chunk.index}
                    onClick={() => setIsChunkModalOpen(true)}
                    className="p-4 bg-slate-50/60 border border-slate-150/40 rounded-2xl space-y-2 hover:bg-purple-50/20 hover:border-purple-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black uppercase tracking-wider text-purple-650 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100/60">
                        Chunk #{chunk.index + 1}
                      </div>
                      <span className="text-[9px] text-purple-600 font-black group-hover:underline flex items-center gap-1">
                        <Eye className="w-3 h-3" /> View
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap text-slate-600 font-semibold">{chunk.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-12">No preview text chunks available.</p>
            )}
          </section>

          {/* Connected ChunkViewerModal */}
          <ChunkViewerModal
            isOpen={isChunkModalOpen}
            onClose={() => setIsChunkModalOpen(false)}
            documentTitle={resource.title}
            chunks={preview?.chunks || []}
            totalPages={resource.total_pages || 1}
          />
        </div>
      )}
    </div>
  );
}

type KnowledgeMessage = { role: "user" | "assistant"; content: string; confidence?: string; sources?: Array<{ resource_id?: number; document_title: string; subject: string; chapter?: string; page_number?: number; score: number }> };

const AI_THINKING_STAGES = [
  { label: "Searching Books", detail: "Querying vector database index..." },
  { label: "Searching Notes & PYQs", detail: "Checking subject note chunks..." },
  { label: "Retrieving Embeddings", detail: "Fetching high-dimension vectors..." },
  { label: "Ranking Relevance", detail: "Scoring semantic match similarity..." },
  { label: "Constructing Context", detail: "Building grounded prompt window..." },
  { label: "Generating Response", detail: "Synthesizing exam-focused answer..." }
];
const PROMPT_SUGGESTIONS = ["Explain this topic", "Generate revision notes", "Generate flashcards", "Generate MCQs", "Predict exam questions", "Teach like a beginner", "Explain with examples"];

function AiThinkingPipeline({ active }: { active: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setCurrentStep(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < AI_THINKING_STAGES.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  const progressPercent = Math.round(((currentStep + 1) / AI_THINKING_STAGES.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mr-auto max-w-[95%] sm:max-w-xl rounded-3xl border border-purple-200/80 bg-gradient-to-br from-white via-purple-50/50 to-indigo-50/40 p-5 shadow-lg shadow-purple-100/40 space-y-4 my-3 backdrop-blur-md relative overflow-hidden"
    >
      {/* Background Soft Glow & Shimmer */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-200"
            >
              <Sparkles className="w-4.5 h-4.5" />
            </motion.div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-purple-700 uppercase tracking-widest bg-purple-100/80 border border-purple-200 px-2 py-0.5 rounded-full">
                AI Pipeline
              </span>
              <span className="text-[10px] font-extrabold text-slate-400">
                Step {currentStep + 1} of {AI_THINKING_STAGES.length}
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900 mt-0.5">
              {AI_THINKING_STAGES[currentStep].label}
            </h4>
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-black text-purple-700 tabular-nums">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Animated Glowing Progress Bar */}
      <div className="w-full bg-purple-100/70 h-2 rounded-full overflow-hidden p-0.5 relative">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 rounded-full relative"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
        </motion.div>
      </div>

      {/* Pipeline Stage Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {AI_THINKING_STAGES.map((stage, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-2.5 text-[10px] font-bold px-3 py-2 rounded-2xl border transition-all duration-300 ${isCurrent
                ? "bg-white border-purple-400 text-purple-950 shadow-md shadow-purple-100/60 ring-2 ring-purple-100"
                : isDone
                  ? "bg-purple-50/70 border-purple-200/60 text-purple-800"
                  : "bg-white/60 border-slate-200/60 text-slate-400"
                }`}
            >
              <div className="shrink-0 flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : isCurrent ? (
                  <motion.span
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block ring-4 ring-purple-200"
                  />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className={`truncate ${isCurrent ? "font-black" : ""}`}>{stage.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function StudyAnswer({ content }: { content: string }) {
  const sections = content.split(/^##\s+/m).filter(Boolean);
  if (sections.length < 2) return <p className="whitespace-pre-wrap font-medium leading-relaxed">{content}</p>;
  return (
    <div className="space-y-3.5">
      {sections.map((section, index) => {
        const [heading, ...body] = section.split("\n");
        return (
          <section key={`${heading}-${index}`} className="rounded-2xl border border-purple-200/80 bg-purple-50/30 p-4 shadow-2xs">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-purple-800 flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-3 bg-purple-600 rounded-full inline-block" />
              {heading}
            </h4>
            <p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-800 text-xs font-medium">
              {body.join("\n").trim()}
            </p>
          </section>
        );
      })}
    </div>
  );
}

function KnowledgeStudyWorkspace({ resourceId, subjectName, resourceType, onBack }: { resourceId: string; subjectName: string; resourceType: ResourceTypeFilter; onBack: () => void }) {
  const { activeWorkspace, activeWorkspaceId, selectedSubjectId, activeConversationId, setActiveConversationId, beginNewStudySession } = useWorkspace();
  const [sessionId, setSessionId] = useState(activeConversationId);
  const [messages, setMessages] = useState<KnowledgeMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewSessionConfirm, setShowNewSessionConfirm] = useState(false);
  const [scope, setScope] = useState<"subject" | "resource" | "selected">(resourceId ? "resource" : "subject");
  const [selectedResources, setSelectedResources] = useState<string[]>(resourceId ? [resourceId] : []);
  const [sessionStartedAt] = useState(() => Date.now());
  const [sessionDuration, setSessionDuration] = useState("0s");
  const [historyOpen, setHistoryOpen] = useState(true);
  const [contextOpen, setContextOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const workspaceId = Number(activeWorkspaceId);

  // Auto-scroll to bottom when new messages arrive or loading state updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  const hasWorkspace = Number.isInteger(workspaceId) && workspaceId > 0;
  const hasSubject = Boolean(selectedSubjectId);
  const subjectResources = activeWorkspace?.resources.filter((resource) => resource.subjectId === selectedSubjectId) ?? [];
  const resourcesIncluded = scope === "subject" ? subjectResources.length : scope === "resource" ? 1 : selectedResources.length;
  const lastQuestion = [...messages].reverse().find((message) => message.role === "user")?.content;

  // Real-time active conversation duration timer
  useEffect(() => {
    const updateDuration = () => {
      const elapsedSec = Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000));
      const mins = Math.floor(elapsedSec / 60);
      const secs = elapsedSec % 60;
      setSessionDuration(mins > 0 ? `${mins}m ${secs}s` : `${secs}s`);
    };
    updateDuration();
    const interval = window.setInterval(updateDuration, 1000);
    return () => window.clearInterval(interval);
  }, [sessionStartedAt]);
  useEffect(() => { setSessionId(activeConversationId); }, [activeConversationId]);
  const loadHistory = async () => {
    if (!sessionId) return;
    try { const conversation = await backendService.ai.conversation(sessionId); setMessages(conversation.messages.map((message) => ({ role: message.role, content: message.content, confidence: message.confidence || undefined, sources: message.sources || undefined }))); } catch { setMessages([]); }
  };
  useEffect(() => { void loadHistory(); }, [sessionId]);
  useEffect(() => {
    if (sessionId) return;
    const workspaceId = Number(activeWorkspaceId);
    if (!Number.isInteger(workspaceId) || workspaceId <= 0) return;
    backendService.ai.createConversation({ workspace_id: workspaceId, subject_id: selectedSubjectId ? Number(selectedSubjectId) : undefined })
      .then((conversation) => { setSessionId(conversation.session_id); setActiveConversationId(conversation.session_id); })
      .catch(() => setError("Unable to start a study session."));
  }, [activeWorkspaceId, selectedSubjectId, sessionId, setActiveConversationId]);
  const ask = async (prompt = question) => {
    if (!prompt.trim() || !hasWorkspace || !hasSubject) return;
    setLoading(true); setError(null); setQuestion("");
    try {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const conversation = await backendService.ai.createConversation({ workspace_id: workspaceId, subject_id: Number(selectedSubjectId) });
        activeSessionId = conversation.session_id;
        setSessionId(activeSessionId);
        setActiveConversationId(activeSessionId);
      }
      setMessages((current) => [...current, { role: "user", content: prompt }]);
      const response = await backendService.ai.knowledge({ session_id: activeSessionId, workspace_id: workspaceId, subject_id: Number(selectedSubjectId), question: prompt });
      setMessages((current) => [...current, { role: "assistant", content: response.answer, confidence: response.confidence, sources: response.sources }]);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to contact AI service."); }
    finally { setLoading(false); }
  };
  const composerDisabled = loading || !question.trim() || !hasWorkspace || !hasSubject;
  const composerReason = loading ? "A response is already being generated." : !hasWorkspace ? "No backend workspace is available." : !hasSubject ? "Select a subject before asking AI." : !question.trim() ? "Enter a question to enable Ask AI." : "Ready to send.";
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.log("[AI Chat composer]", { workspace: hasWorkspace, subject: hasSubject, document: Boolean(resourceId), scope, session: Boolean(sessionId), input: Boolean(question.trim()), loading, authenticated: "validated by the backend request", disabled: composerDisabled, reason: composerReason });
  }, [composerDisabled, composerReason, hasSubject, hasWorkspace, loading, question, resourceId, scope, sessionId]);
  const handleConfirmNewStudySession = () => {
    setMessages([]);
    setQuestion("");
    setError(null);
    setShowNewSessionConfirm(false);
    beginNewStudySession();
  };
  const startNewStudySession = () => {
    if (messages.length > 0) {
      setShowNewSessionConfirm(true);
      return;
    }
    handleConfirmNewStudySession();
  };
  const clearConversation = async () => {
    await backendService.ai.clearHistory(sessionId);
    setMessages([]);
    setQuestion("");
    setError(null);
    setSessionId(crypto.randomUUID());
  };
  return (
    <div className="relative w-full h-[calc(100vh-11rem)] min-h-[620px] max-h-[900px] overflow-hidden rounded-[32px] border border-purple-200/90 bg-white shadow-xl shadow-purple-950/5 flex">
      <div className={`hidden md:block shrink-0 overflow-hidden transition-[width] duration-200 ${historyOpen ? "w-[270px]" : "w-0"}`}>
        <ConversationSidebar className="stage-five-history" />
      </div>
      {historyOpen && <button aria-label="Close chat history" onClick={() => setHistoryOpen(false)} className="hidden md:flex absolute left-[252px] top-3.5 z-20 h-7 w-7 items-center justify-center rounded-xl border border-purple-200/80 bg-white text-purple-900 hover:text-purple-700 shadow-xs cursor-pointer"><PanelLeftClose className="w-3.5 h-3.5" /></button>}
      {!historyOpen && <button aria-label="Open chat history" onClick={() => setHistoryOpen(true)} className="hidden md:flex absolute left-3 top-3.5 z-20 h-8 w-8 items-center justify-center rounded-xl border border-purple-200/80 bg-white text-purple-900 hover:text-purple-700 shadow-xs cursor-pointer"><PanelLeftOpen className="w-4 h-4" /></button>}
      {historyOpen && <div className="md:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs" onClick={() => setHistoryOpen(false)}><div className="h-full w-[290px] bg-white shadow-xl" onClick={(event) => event.stopPropagation()}><ConversationSidebar className="stage-five-history" /><button aria-label="Close chat history" onClick={() => setHistoryOpen(false)} className="absolute left-[254px] top-3.5 rounded-xl bg-white p-2 text-slate-700 shadow-xs"><X className="w-4 h-4" /></button></div></div>}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Workspace Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 bg-gradient-to-r from-purple-50 via-indigo-50/30 to-white px-5 py-3.5 sm:px-6">
          <div>
            <button onClick={onBack} className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-black text-purple-950 bg-white hover:bg-purple-50/80 border border-purple-200/80 hover:border-purple-300 rounded-2xl transition-all cursor-pointer shadow-2xs group">
              <ArrowLeft className="w-3.5 h-3.5 text-purple-600 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Preview</span>
            </button>
            <h2 className="text-sm font-black text-slate-900 mt-2 flex items-center gap-2 tracking-tight">
              <button aria-label="Open chat history" onClick={() => setHistoryOpen(true)} className="md:hidden rounded-xl p-1.5 text-slate-500 hover:bg-purple-50"><Menu className="w-4 h-4" /></button>
              <span>ExamForge AI</span>
              <span className="text-[10px] font-black uppercase text-purple-950 bg-purple-100/90 px-2.5 py-0.5 rounded-full border border-purple-200/80">
                {subjectName} · {resourceType}
              </span>
            </h2>
            <p className="text-[10.5px] text-slate-500 mt-1 font-bold">
              Workspace: {activeWorkspace?.title || `GATE #${activeWorkspaceId}`} · Subject #{selectedSubjectId} · Resource #{resourceId}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={startNewStudySession} className="px-4 py-2 text-xs font-black rounded-2xl bg-purple-100/90 text-purple-950 border border-purple-200/80 hover:bg-purple-600 hover:text-white cursor-pointer transition-all shadow-2xs">
              New Chat
            </button>
            <button onClick={() => setContextOpen((open) => !open)} className={`px-3.5 py-2 text-xs font-black rounded-2xl border transition-all cursor-pointer ${contextOpen ? "border-purple-300 bg-purple-100 text-purple-950" : "border-purple-200/80 bg-white text-slate-700 hover:bg-purple-50"}`}>
              <SlidersHorizontal className="inline w-3.5 h-3.5 mr-1.5 text-purple-600" />Context
            </button>
            <button onClick={() => void clearConversation()} className="hidden sm:block px-3.5 py-2 text-xs font-black rounded-2xl border border-purple-200/80 bg-white text-slate-700 hover:bg-purple-50 cursor-pointer">Clear</button>
          </div>
        </div>

        {/* Modern 2-Column Study Workspace Layout */}
        <div className="flex min-h-0 flex-1 gap-0">
          {/* Left Column: Messages viewport & Input Composer */}
          <div className="min-w-0 flex flex-1 flex-col">
            <div className="bg-gradient-to-b from-white via-purple-50/10 to-white p-4 sm:p-6 flex min-h-0 flex-1 flex-col justify-between">
              <div data-lenis-prevent className="flex-1 overflow-y-auto space-y-4 pr-1.5 scroll-smooth">
                {messages.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-purple-200 mx-auto mb-4">
                      <Bot className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">ExamForge-AI Agent Online</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-semibold leading-relaxed">
                      Select a suggestion or type your own prompt below. The study advisor will reference your indexed resource documents.
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const mappedMessage = {
                      id: `${message.role}-${index}`,
                      sender: message.role === "user" ? ("user" as const) : ("ai" as const),
                      text: message.content,
                      timestamp: new Date().toISOString(),
                      confidence: message.confidence,
                      sources: message.sources
                    };
                    return <ChatMessage key={mappedMessage.id} message={mappedMessage} />;
                  })
                )}
                <AiThinkingPipeline active={loading} />
                <div ref={chatBottomRef} />
              </div>

              {/* Input Composer Form */}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void ask();
                }}
                className="mt-4 pt-4 border-t border-purple-100 flex gap-2.5"
              >
                <input
                  ref={inputRef}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setQuestion("");
                    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                      event.preventDefault();
                      void ask();
                    }
                  }}
                  disabled={loading || !hasWorkspace || !hasSubject}
                  placeholder="Ask about this study material…"
                  className="flex-1 px-4 py-3 bg-purple-50/30 border border-purple-200/80 rounded-2xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={composerDisabled}
                  title={composerReason}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-2xl text-xs font-black shadow-md shadow-purple-200 disabled:shadow-none transition-all cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Ask AI</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {error && (
                <div className="text-[10.5px] text-rose-700 text-center mt-3 bg-rose-50 border border-rose-200 p-2.5 rounded-2xl font-bold shadow-2xs">
                  AI generation service is temporarily unavailable. Please verify the OpenAI API configuration and retry.{" "}
                  <button
                    onClick={() => void ask(messages.filter((m) => m.role === "user").at(-1)?.content || "")}
                    className="font-black underline text-rose-700 hover:text-rose-900 ml-1 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Context & AI Study Memory */}
          {contextOpen && <div className="absolute inset-y-0 right-0 z-30 w-full sm:static sm:w-[300px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-xl sm:shadow-none space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-xs font-black text-slate-800">AI Context</h3><button aria-label="Close context" onClick={() => setContextOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X className="w-4 h-4" /></button></div>
            {/* AI Context Card */}
            <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm space-y-3.5">
              <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest border-b border-slate-50 pb-2">
                AI Context View
              </h4>
              <div className="flex flex-col gap-3">
                <div className="text-xs">
                  <p className="font-black text-slate-800 leading-snug">
                    {scope === "subject" ? "Entire Subject" : scope === "resource" ? "Current Resource" : "Selected Resources"}
                  </p>
                  <p className="text-[10px] text-slate-450 font-bold mt-1">
                    {resourcesIncluded} resource{resourcesIncluded === 1 ? "" : "s"} included in active prompt context
                  </p>
                </div>
                <select
                  value={scope}
                  onChange={(event) => setScope(event.target.value as typeof scope)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2.5 text-xs font-black text-slate-700 outline-none transition-colors cursor-pointer"
                >
                  <option value="subject">Entire Subject</option>
                  <option value="resource">Current Resource</option>
                  <option value="selected">Selected Resources</option>
                </select>
              </div>
              {scope === "selected" && (
                <div className="mt-3.5 border-t border-slate-50 pt-3 flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                  {subjectResources.map((resource) => (
                    <label key={resource.id} className="flex items-center gap-2 rounded-xl bg-slate-50/60 border border-slate-150/40 px-3 py-2 text-[10px] text-slate-650 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={selectedResources.includes(resource.id)}
                        onChange={() =>
                          setSelectedResources((current) =>
                            current.includes(resource.id)
                              ? current.filter((id) => id !== resource.id)
                              : [...current, resource.id]
                          )
                        }
                        className="rounded border-slate-200 text-purple-600 focus:ring-purple-100 cursor-pointer"
                      />
                      <span className="truncate font-bold">{resource.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* AI Study Memory Card */}
            {sessionId && (
              <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm space-y-4">
                <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest border-b border-slate-50 pb-2">
                  AI Study Card
                </h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden text-[10px]">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <td className="px-3.5 py-2.5 text-slate-450 font-bold">Subject</td>
                        <td className="px-3.5 py-2.5 font-black text-slate-800 truncate max-w-[120px]" title={subjectName}>
                          {subjectName}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="px-3.5 py-2.5 text-slate-450 font-bold">Format</td>
                        <td className="px-3.5 py-2.5 font-black text-slate-800">{resourceType}</td>
                      </tr>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <td className="px-3.5 py-2.5 text-slate-450 font-bold">Scope</td>
                        <td className="px-3.5 py-2.5 font-black text-purple-700">
                          {scope === "subject" ? "Subject" : scope === "resource" ? "Resource" : "Selected"}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="px-3.5 py-2.5 text-slate-450 font-bold">Included</td>
                        <td className="px-3.5 py-2.5 font-black text-slate-800">
                          {resourcesIncluded} resources
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <td className="px-3.5 py-2.5 text-slate-450 font-bold">Last Question</td>
                        <td className="px-3.5 py-2.5 font-black text-slate-800 truncate max-w-[120px]" title={lastQuestion || "—"}>
                          {lastQuestion || "—"}
                        </td>
                      </tr>
                      <tr className="">
                        <td className="px-3.5 py-2.5 text-slate-450 font-bold">Duration</td>
                        <td className="px-3.5 py-2.5 font-black text-slate-800">{sessionDuration}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick Prompt Suggestions */}
            {messages.length === 0 && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-purple-200/80 rounded-3xl p-5 shadow-sm space-y-3"
              >
                <h4 className="text-[10px] font-black text-purple-800 uppercase tracking-widest border-b border-purple-100 pb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Study Templates
                </h4>
                <div className="flex flex-col gap-2">
                  {PROMPT_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setQuestion(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="w-full text-left rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-800 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-900 transition-all cursor-pointer shadow-xs"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.section>
            )}
          </div>}
        </div>

        {/* Reset Confirmation Overlay Modal */}
        {showNewSessionConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-slate-800">Start New Study Session?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Your current conversation history will be closed. Your uploaded resources remain fully available.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmNewStudySession}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Yes, start new
                </button>
                <button
                  onClick={() => setShowNewSessionConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-655 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
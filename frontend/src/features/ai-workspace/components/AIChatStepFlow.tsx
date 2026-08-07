"use client";

import React, { useEffect, useRef, useState } from "react";
import { useWorkspace } from "../workspaceContext";
import {
  type LucideIcon,
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
  Layers,
  Trash2,
  Edit3,
  Download,
  RefreshCw,
  X,
  Check,
  AlertTriangle,
  BookMarked
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/ToastContext";
import { backendService, type Resource } from "@/services/backend.service";
import { ResourceUploadButton } from "@/components/resources/ResourceUploadButton";
import { ChatMessage } from "./ChatMessage";
import { ChunkViewerModal } from "./ChunkViewerModal";

type StepType = 1 | 2 | 3 | 4 | 5;
type ResourceTypeFilter = "Book" | "PDF" | "Note" | "PYQ" | "Syllabus";
const backendResourceType: Record<ResourceTypeFilter, string> = {
  Book: "book",
  PDF: "pdf",
  Note: "notes",
  PYQ: "pyq",
  Syllabus: "syllabus",
};

const getSubjectTheme = (colorStr: string) => {
  const s = colorStr.toLowerCase();
  if (s.includes("purple") || s.includes("violet")) {
    return {
      hoverBg: "hover:bg-purple-50/40",
      hoverBorder: "hover:border-purple-300",
      hoverText: "group-hover:text-purple-700",
      badgeBg: "bg-purple-50 text-purple-650",
      iconBg: "bg-purple-50 text-purple-600",
      gradient: "from-purple-600 via-indigo-650 to-purple-800",
    };
  }
  if (s.includes("pink")) {
    return {
      hoverBg: "hover:bg-pink-50/40",
      hoverBorder: "hover:border-pink-300",
      hoverText: "group-hover:text-pink-700",
      badgeBg: "bg-pink-50 text-pink-650",
      iconBg: "bg-pink-50 text-pink-600",
      gradient: "from-pink-500 via-rose-600 to-pink-700",
    };
  }
  if (s.includes("blue") || s.includes("sky")) {
    return {
      hoverBg: "hover:bg-blue-50/40",
      hoverBorder: "hover:border-blue-300",
      hoverText: "group-hover:text-blue-700",
      badgeBg: "bg-blue-50 text-blue-650",
      iconBg: "bg-blue-50 text-blue-600",
      gradient: "from-blue-600 via-indigo-600 to-sky-700",
    };
  }
  if (s.includes("emerald") || s.includes("green") || s.includes("teal")) {
    return {
      hoverBg: "hover:bg-emerald-50/40",
      hoverBorder: "hover:border-emerald-300",
      hoverText: "group-hover:text-emerald-700",
      badgeBg: "bg-emerald-50 text-emerald-650",
      iconBg: "bg-emerald-50 text-emerald-600",
      gradient: "from-emerald-600 via-teal-600 to-emerald-800",
    };
  }
  if (s.includes("rose") || s.includes("red")) {
    return {
      hoverBg: "hover:bg-rose-50/40",
      hoverBorder: "hover:border-rose-300",
      hoverText: "group-hover:text-rose-700",
      badgeBg: "bg-rose-50 text-rose-650",
      iconBg: "bg-rose-50 text-rose-600",
      gradient: "from-rose-600 via-pink-600 to-red-700",
    };
  }
  if (s.includes("amber") || s.includes("orange") || s.includes("yellow")) {
    return {
      hoverBg: "hover:bg-amber-50/40",
      hoverBorder: "hover:border-amber-300",
      hoverText: "group-hover:text-amber-700",
      badgeBg: "bg-amber-50 text-amber-650",
      iconBg: "bg-amber-50 text-amber-600",
      gradient: "from-amber-500 via-orange-600 to-amber-700",
    };
  }
  return {
    hoverBg: "hover:bg-indigo-50/40",
    hoverBorder: "hover:border-indigo-300",
    hoverText: "group-hover:text-indigo-700",
    badgeBg: "bg-indigo-50 text-indigo-650",
    iconBg: "bg-indigo-50 text-indigo-600",
    gradient: "from-indigo-600 via-purple-600 to-indigo-800",
  };
};

/** Top Stepper Header Bar for visual navigation & progress tracking */
function FlowStepper({
  currentStep,
  onStepClick,
  canJumpTo,
}: {
  currentStep: StepType;
  onStepClick: (step: StepType) => void;
  canJumpTo: (step: StepType) => boolean;
}) {
  const steps: Array<{ num: StepType; label: string; icon: LucideIcon }> = [
    { num: 1, label: "Subject", icon: BookOpen },
    { num: 2, label: "Category", icon: Layers },
    { num: 3, label: "Resources", icon: FileText },
    { num: 4, label: "Preview", icon: Search },
    { num: 5, label: "AI Study", icon: Sparkles },
  ];

  return (
    <div className="w-full bg-white border border-purple-100/70 rounded-3xl p-3 sm:p-4 shadow-sm mb-5">
      <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          const isClickable = canJumpTo(step.num);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.num}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.num)}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 ${isActive
                  ? "bg-purple-600 text-white shadow-md shadow-purple-200 scale-[1.02]"
                  : isCompleted
                    ? "bg-purple-50 text-purple-700 hover:bg-purple-100/70"
                    : isClickable
                      ? "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      : "bg-slate-50/50 text-slate-350 cursor-not-allowed"
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-xl flex items-center justify-center text-[10px] ${isActive
                    ? "bg-white/20 text-white"
                    : isCompleted
                      ? "bg-purple-200/60 text-purple-800"
                      : "bg-slate-200/60 text-slate-500"
                    }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="hidden md:inline">{step.label}</span>
                <span className="inline md:hidden">Step {step.num}</span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[12px] max-w-[40px] rounded-full transition-colors ${currentStep > step.num ? "bg-purple-300" : "bg-slate-150"
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function AIChatStepFlow() {
  const {
    flowStep,
    setFlowStep,
    selectedSubjectId,
    selectedResourceType,
    selectedResourceId,
  } = useWorkspace();

  const canJumpTo = (step: StepType): boolean => {
    if (step === 1) return true;
    if (step === 2) return Boolean(selectedSubjectId);
    if (step === 3) return Boolean(selectedSubjectId && selectedResourceType);
    if (step === 4) return Boolean(selectedResourceId);
    if (step === 5) return Boolean(selectedSubjectId);
    return false;
  };

  return (
    <div className="w-full">
      <FlowStepper currentStep={flowStep as StepType} onStepClick={setFlowStep} canJumpTo={canJumpTo} />
      <AnimatePresence mode="wait">
        <motion.div
          key={flowStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          <AiStudyHome />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AiStudyHome() {
  const {
    activeWorkspace,
    activeWorkspaceId,
    flowStep,
    setFlowStep,
    selectedSubjectId,
    selectedResourceType,
    selectedResourceId,
    selectSubject,
    selectResourceType,
    selectResource,
    refreshResources,
  } = useWorkspace();

  const [subjectSearch, setSubjectSearch] = useState("");
  const subjects = (activeWorkspace?.subjects ?? []).filter((subject) =>
    subject.name.toLowerCase().includes(subjectSearch.trim().toLowerCase())
  );
  const selectedSubject = activeWorkspace?.subjects.find((subject) => subject.id === selectedSubjectId);

  // STEP 2: Resource Types & Category Selection
  if (flowStep === 2 && selectedSubject) {
    const subjectResources =
      activeWorkspace?.resources.filter((resource) => resource.subjectId === selectedSubject.id) ?? [];
    const resourceTypes = [
      { label: "Books", type: "Book", icon: BookOpen, tone: "text-purple-600 bg-purple-50 border-purple-100" },
      { label: "Notes", type: "Note", icon: FileCheck, tone: "text-amber-600 bg-amber-50 border-amber-100" },
      { label: "PYQs", type: "PYQ", icon: HelpCircle, tone: "text-blue-600 bg-blue-50 border-blue-100" },
      { label: "Syllabus", type: "Syllabus", icon: Layers, tone: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    ] as const;

    return (
      <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm">
        <div className="space-y-6 max-w-4xl mx-auto">
          <button
            onClick={() => setFlowStep(1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Subjects
          </button>

          <div className="flex flex-col items-center text-center p-6 bg-white border border-purple-100 rounded-3xl shadow-sm space-y-3">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedSubject.color} text-white flex items-center justify-center shadow-lg`}
            >
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">{selectedSubject.name}</h2>
              <p className="text-xs text-slate-400 mt-1">Explore and index study material formats for ExamForge AI</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {resourceTypes.map(({ label, type, icon: Icon, tone }) => {
              const count = subjectResources.filter((resource) => resource.type === type).length;
              return (
                <div
                  key={type}
                  className="p-5 bg-white border border-slate-200 hover:border-purple-300 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl border ${tone} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => selectResourceType(type)}
                    className="text-sm font-black text-slate-800 hover:text-purple-600 transition-colors cursor-pointer"
                  >
                    {label}
                  </button>
                  <span className="text-[10px] text-slate-400 font-extrabold mt-0.5">{count} Resources</span>
                  <div className="mt-3">
                    <ResourceUploadButton
                      workspaceId={activeWorkspaceId}
                      subjectId={selectedSubject.id}
                      resourceType={backendResourceType[type]}
                      variant="outline"
                      size="sm"
                      label="Upload"
                      onSuccess={() => void refreshResources()}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200/60">
            <span className="text-xs font-bold text-slate-400">
              Total {subjectResources.length} indexed resource documents
            </span>
            <button
              onClick={() => setFlowStep(5)}
              className="rounded-2xl bg-purple-600 px-6 py-2.5 text-xs font-black text-white shadow-md shadow-purple-100 transition hover:bg-purple-700 cursor-pointer flex items-center gap-1.5"
            >
              <span>Skip to AI Study</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: Filter & Select Resources
  if (flowStep === 3 && selectedSubject && selectedResourceType) {
    return (
      <ResourceListStage
        subjectId={selectedSubject.id}
        subjectName={selectedSubject.name}
        resourceType={selectedResourceType}
        onBack={() => setFlowStep(2)}
        onSelect={selectResource}
      />
    );
  }

  // STEP 4: Deep-Dive Preview & Text Chunks
  if (flowStep === 4 && selectedResourceId) {
    return (
      <ResourcePreviewStage
        resourceId={selectedResourceId}
        onBack={() => setFlowStep(3)}
        onStudy={() => setFlowStep(5)}
      />
    );
  }

  // STEP 5: Interactive RAG AI Study Workspace
  if (flowStep === 5 && selectedSubject) {
    return (
      <KnowledgeStudyWorkspace
        resourceId={selectedResourceId || ""}
        subjectName={selectedSubject.name}
        resourceType={selectedResourceType || "Book"}
        onBack={() => setFlowStep(selectedResourceId ? 4 : 2)}
      />
    );
  }

  // STEP 1: Select Subject
  return (
    <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm">
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[11px] font-black uppercase tracking-wider">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Study Assistant</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Select Subject for AI Study</h2>
          <p className="text-xs text-slate-500">Pick a subject to explore indexed study resources and ask AI</p>
        </div>

        <div className="max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            value={subjectSearch}
            onChange={(event) => setSubjectSearch(event.target.value)}
            placeholder="Search subjects by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 shadow-sm transition-all"
          />
        </div>

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
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-3.5`}
                  >
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
          <div className="text-center py-14 bg-white border border-dashed border-slate-200 rounded-3xl space-y-3">
            <BookMarked className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-400">No matching subjects founds</p>
            <button
              onClick={() => setSubjectSearch("")}
              className="text-xs font-black text-purple-650 hover:text-purple-750 cursor-pointer underline"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceListStage({
  subjectId,
  subjectName,
  resourceType,
  onBack,
  onSelect,
}: {
  subjectId: string;
  subjectName: string;
  resourceType: ResourceTypeFilter;
  onBack: () => void;
  onSelect: (id: string) => void;
}) {
  const { activeWorkspaceId } = useWorkspace();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = async () => {
    const workspaceId = Number(activeWorkspaceId);
    if (!Number.isInteger(workspaceId) || workspaceId <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        subject_id: subjectId,
        resource_type: backendResourceType[resourceType],
        keyword: query,
        limit: "100",
      });
      setResources((await backendService.workspace.search(workspaceId, params)).items);
    } catch (caught) {
      setResources([]);
      setError(caught instanceof Error ? caught.message : "Unable to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [activeWorkspaceId, subjectId, resourceType, query]);

  const handleDeleteResource = async (id: number) => {
    try {
      await backendService.documents.remove(id);
      toast("Resource removed successfully.", "success");
      setDeleteId(null);
      if (selectedId === String(id)) setSelectedId(null);
      void load();
    } catch {
      toast("Could not remove resource.", "error");
    }
  };

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
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Resource Categories
      </button>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            {subjectName} · {resourceType}s
          </h2>
          <p className="text-xs text-slate-450 mt-1">Select a material to inspect preview chunks or start AI study</p>
        </div>
        <button
          disabled={!selectedId}
          onClick={() => selectedId && onSelect(selectedId)}
          className="rounded-2xl bg-purple-600 hover:bg-purple-700 text-white disabled:bg-slate-200 px-5 py-2.5 text-xs font-black transition-all cursor-pointer shadow-md shadow-purple-100 disabled:shadow-none flex items-center gap-1.5"
        >
          <span>Next to Preview</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${resourceType.toLowerCase()}s by title...`}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading resources…</div>
      ) : error ? (
        <div className="py-16 text-center text-xs text-rose-500">
          {error}
          <button onClick={() => void load()} className="block mx-auto mt-3 text-purple-650 font-bold hover:underline cursor-pointer">
            Retry
          </button>
        </div>
      ) : resources.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resources.map((resource) => {
            const isSelected = selectedId === String(resource.id);
            const statusClass = getStatusStyle(resource.status);
            return (
              <div
                key={resource.id}
                onClick={() => setSelectedId(String(resource.id))}
                className={`w-full text-left flex items-start justify-between gap-4 p-4.5 bg-white border rounded-3xl shadow-sm transition-all duration-200 cursor-pointer relative ${isSelected ? "border-purple-500 ring-4 ring-purple-50/70" : "border-slate-200 hover:border-purple-300"
                  }`}
              >
                <div className="flex gap-3 items-start min-w-0 flex-1">
                  <div
                    className={`p-3 rounded-2xl shrink-0 ${isSelected ? "bg-purple-50 text-purple-600" : "bg-slate-50 text-slate-400"
                      }`}
                  >
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-slate-800 truncate leading-snug hover:text-purple-600 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-[10px] text-slate-450 mt-1.5 font-bold tracking-tight">
                      {resource.resource_type} · {new Date(resource.created_at).toLocaleDateString()}{" "}
                      {resource.total_pages ? `· ${resource.total_pages} pages` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${statusClass}`}>
                    {resource.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(resource.id);
                    }}
                    title="Delete resource"
                    className="p-1 text-slate-350 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-3xl space-y-3">
          <p className="text-xs text-slate-400">No {resourceType.toLowerCase()} resources uploaded yet.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Delete Resource?</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Are you sure you want to delete this resource and its embeddings? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDeleteResource(deleteId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Delete Resource
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResourcePreviewStage({
  resourceId,
  onBack,
  onStudy,
}: {
  resourceId: string;
  onBack: () => void;
  onStudy: () => void;
}) {
  const { toast } = useToast();
  const { activeWorkspace } = useWorkspace();
  const [resource, setResource] = useState<Resource | null>(null);
  const [preview, setPreview] = useState<{
    resource_id: number;
    title: string;
    chunks: Array<{ index: number; content: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chunkQuery, setChunkQuery] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [isPdfReaderOpen, setIsPdfReaderOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    const numId = Number(resourceId);
    const isValidDocId = Number.isInteger(numId) && numId > 0;

    if (!isValidDocId) {
      const localRes = activeWorkspace?.resources.find((r) => r.id === resourceId);
      const title = localRes ? localRes.title : "Indian Polity by M. Laxmikanth";
      const totalPages = localRes ? localRes.pages : 245;

      const fallbackResource: Resource = {
        id: 1,
        workspace_id: 1,
        subject_id: 1,
        title,
        original_filename: title,
        resource_type: localRes?.type || "Book",
        file_size: 28 * 1024 * 1024,
        total_pages: totalPages,
        chunks_count: localRes?.chunksCount || 412,
        status: "COMPLETED",
        created_at: new Date().toISOString(),
      };
      setResource(fallbackResource);
      setEditTitle(title);
      setPreview({
        resource_id: 1,
        title,
        chunks: [
          { index: 0, content: "UNIT I: Human Geography Nature and Scope\nYou have already studied 'Geography as a Discipline' in Chapter I of the book, Fundamentals of Physical Geography (NCERT, 2006). Do you recall the contents?" },
          { index: 1, content: "Chapter 1: Indian Polity - Salient Features of the Constitution\nArticle 32 provides the right to Constitutional Remedies. Dr. Ambedkar called it the heart and soul of the Constitution." },
          { index: 2, content: "Writ of Habeas Corpus: Literally means 'To have the body of'. Issued to produce a detained person before the court." },
          { index: 3, content: "Writ of Mandamus: Literally means 'We Command'. Directs a public official to perform a mandatory duty." },
        ],
      });
      setLoading(false);
      return;
    }

    try {
      const resData = await backendService.documents.get(numId);
      setResource(resData);
      setEditTitle(resData.title);
      try {
        const previewData = await backendService.documents.preview(numId);
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

  useEffect(() => {
    void load();
  }, [resourceId]);

  const handleRename = async () => {
    if (!editTitle.trim() || !resource) return;
    try {
      const updated = await backendService.documents.rename(resource.id, editTitle.trim());
      setResource(updated);
      setIsEditingTitle(false);
      toast("Resource title updated successfully.", "success");
    } catch {
      toast("Could not rename resource.", "error");
    }
  };

  const handleReprocess = async () => {
    if (!resource) return;
    try {
      await backendService.documents.reprocess(resource.id);
      toast("Reprocessing started.", "info");
      void load();
    } catch {
      toast("Reprocessing failed.", "error");
    }
  };

  const filteredChunks = (preview?.chunks || []).filter((c) =>
    c.content.toLowerCase().includes(chunkQuery.trim().toLowerCase())
  );

  return (
    <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Resources
      </button>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading resource preview…</div>
      ) : error || !resource ? (
        <div className="py-16 text-center text-xs text-rose-500">
          {error || "Nothing found."}
          <button onClick={() => void load()} className="block mx-auto mt-3 text-purple-650 font-bold hover:underline cursor-pointer">
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          {/* Left Metadata & Controls Card */}
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
                {isEditingTitle ? (
                  <div className="mt-2 flex gap-1 items-center">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-xs bg-white text-slate-900 px-2 py-1 rounded font-bold outline-none flex-1"
                    />
                    <button onClick={handleRename} className="p-1 bg-emerald-500 text-white rounded cursor-pointer">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setIsEditingTitle(false)} className="p-1 bg-rose-500 text-white rounded cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <h3 className="text-sm font-black line-clamp-2 text-white leading-snug drop-shadow-sm">
                      {resource.title}
                    </h3>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <td className="px-3.5 py-2.5 text-slate-450 font-bold">Format</td>
                    <td className="px-3.5 py-2.5 font-black text-slate-800">{resource.resource_type}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-3.5 py-2.5 text-slate-450 font-bold">Size</td>
                    <td className="px-3.5 py-2.5 font-black text-slate-800">
                      {resource.file_size ? `${(resource.file_size / (1024 * 1024)).toFixed(1)} MB` : "N/A"}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <td className="px-3.5 py-2.5 text-slate-450 font-bold">Pages</td>
                    <td className="px-3.5 py-2.5 font-black text-purple-700">
                      {resource.total_pages ? `${resource.total_pages} pages` : "N/A"}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-3.5 py-2.5 text-slate-450 font-bold">Uploaded</td>
                    <td className="px-3.5 py-2.5 font-black text-slate-800">
                      {new Date(resource.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="px-3.5 py-2.5 text-slate-450 font-bold">Status</td>
                    <td className="px-3.5 py-2.5">
                      <span className="inline-block text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                        {resource.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Reprocess & Sync Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={onStudy}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-purple-100"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Ask AI</span>
              </button>
              <button
                onClick={handleReprocess}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-650 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-index</span>
              </button>
            </div>
          </aside>

          {/* Right Document Chunks Viewer */}
          <section data-lenis-prevent className="bg-white border border-purple-100/60 rounded-3xl p-6 text-xs text-slate-700 space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Document Text Chunks ({filteredChunks.length})</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPdfReaderOpen(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm shadow-purple-100 flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open PDF Reader</span>
                </button>

                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    value={chunkQuery}
                    onChange={(e) => setChunkQuery(e.target.value)}
                    placeholder="Filter chunk text..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold outline-none focus:border-purple-300"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[460px] space-y-3.5 pr-1">
              {filteredChunks.length > 0 ? (
                filteredChunks.map((chunk) => (
                  <div
                    key={chunk.index}
                    onClick={() => setIsPdfReaderOpen(true)}
                    className="p-4 bg-slate-50/60 border border-slate-150/40 rounded-2xl space-y-2 hover:bg-purple-50/15 hover:border-purple-200/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black uppercase tracking-wider text-purple-650 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100/60">
                        Chunk #{chunk.index + 1}
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold group-hover:text-purple-600 transition-colors">
                        Click to Inspect in Reader →
                      </span>
                    </div>
                    <p className="leading-relaxed text-slate-600 font-semibold line-clamp-4 text-xs">{chunk.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-12 font-bold">No document text chunks match your filter</p>
              )}
            </div>
          </section>

          {/* Centered PDF Reader Pop-up Modal */}
          <ChunkViewerModal
            isOpen={isPdfReaderOpen}
            onClose={() => setIsPdfReaderOpen(false)}
            documentTitle={resource.title}
            chunks={preview?.chunks || []}
            totalPages={resource.total_pages || 120}
          />
        </div>
      )}
    </div>
  );
}

type KnowledgeMessage = {
  role: "user" | "assistant";
  content: string;
  confidence?: string;
  sources?: Array<{ resource_id?: number; document_title: string; subject: string; chapter?: string; page_number?: number; score: number }>;
};

const AI_THINKING_STAGES = [
  "Searching Books",
  "Searching Notes",
  "Searching PYQs",
  "Searching Syllabus",
  "Retrieving Embeddings",
  "Ranking Results",
  "Building Context",
  "Thinking",
  "Generating Response",
];
const PROMPT_SUGGESTIONS = [
  "Explain this topic simply",
  "Generate revision summary",
  "Create key flashcards",
  "Predict exam questions",
  "List core formulas",
  "Explain with practical examples",
];

function AiThinkingPipeline({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mr-auto max-w-[90%] rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50/60 p-4 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          className="h-6 w-6 rounded-lg bg-purple-600 text-white flex items-center justify-center"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </motion.div>
        <div>
          <p className="text-xs font-black text-slate-800">ExamForge AI Reasoning</p>
          <p className="text-[10px] text-slate-500 font-semibold">Retrieving vectors & context</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {AI_THINKING_STAGES.map((stage) => (
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0.25 }}
            className="flex items-center gap-2 text-[10px] font-bold text-purple-700"
          >
            <motion.span
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-purple-500"
            />
            {stage}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function KnowledgeStudyWorkspace({
  resourceId,
  subjectName,
  resourceType,
  onBack,
}: {
  resourceId: string;
  subjectName: string;
  resourceType: ResourceTypeFilter;
  onBack: () => void;
}) {
  const { toast } = useToast();
  const {
    activeWorkspace,
    activeWorkspaceId,
    selectedSubjectId,
    activeConversationId,
    setActiveConversationId,
    beginNewStudySession,
    activeConversation,
  } = useWorkspace();

  const [sessionId, setSessionId] = useState(activeConversationId);
  const [messages, setMessages] = useState<KnowledgeMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewSessionConfirm, setShowNewSessionConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [scope, setScope] = useState<"subject" | "resource" | "selected">(resourceId ? "resource" : "subject");
  const [selectedResources, setSelectedResources] = useState<string[]>(resourceId ? [resourceId] : []);
  const [sessionStartedAt] = useState(() => Date.now());
  const [sessionDuration, setSessionDuration] = useState("0m");
  const inputRef = useRef<HTMLInputElement>(null);

  const workspaceId = Number(activeWorkspaceId);
  const hasWorkspace = Number.isInteger(workspaceId) && workspaceId > 0;
  const hasSubject = Boolean(selectedSubjectId);
  const activeSubject = activeWorkspace?.subjects.find((subject) => subject.id === selectedSubjectId);
  const subjectResources = (activeWorkspace?.resources || []).filter((resource) => resource.subjectId === selectedSubjectId);
  const resourcesIncluded =
    scope === "subject" ? subjectResources.length : scope === "resource" ? 1 : selectedResources.length;
  const lastQuestion = [...messages].reverse().find((message) => message.role === "user")?.content;

  useEffect(() => {
    const updateDuration = () => setSessionDuration(`${Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 60000))}m`);
    updateDuration();
    const interval = window.setInterval(updateDuration, 60_000);
    return () => window.clearTimeout(interval);
  }, [sessionStartedAt]);

  const loadHistory = async () => {
    if (!sessionId) return;
    if (sessionId.startsWith("conv-")) {
      if (activeConversation?.messages) {
        setMessages(
          activeConversation.messages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
            confidence: m.confidence,
            sources: m.sources,
          }))
        );
      }
      return;
    }
    try {
      const conversation = await backendService.ai.conversation(sessionId);
      setMessages(
        conversation.messages.map((message) => ({
          role: message.role,
          content: message.content,
          confidence: message.confidence || undefined,
          sources: message.sources || undefined,
        }))
      );
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) return;
    if (!hasWorkspace) return;
    backendService.ai
      .createConversation({
        workspace_id: workspaceId,
        subject_id: selectedSubjectId ? Number(selectedSubjectId) : undefined,
      })
      .then((conversation) => {
        setSessionId(conversation.session_id);
        setActiveConversationId(conversation.session_id);
      })
      .catch(() => setError("Unable to start a study session."));
  }, [activeWorkspaceId, selectedSubjectId, sessionId, setActiveConversationId, hasWorkspace, workspaceId]);

  const ask = async (prompt = question) => {
    if (!prompt.trim() || !hasWorkspace || !hasSubject) return;
    setLoading(true);
    setError(null);
    setQuestion("");
    try {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const conversation = await backendService.ai.createConversation({
          workspace_id: workspaceId,
          subject_id: Number(selectedSubjectId),
        });
        activeSessionId = conversation.session_id;
        setSessionId(activeSessionId);
        setActiveConversationId(activeSessionId);
      }
      setMessages((current) => [...current, { role: "user", content: prompt }]);
      const response = await backendService.ai.knowledge({
        session_id: activeSessionId,
        workspace_id: workspaceId,
        subject_id: Number(selectedSubjectId),
        question: prompt,
      });
      setMessages((current) => [
        ...current,
        { role: "assistant", content: response.answer, confidence: response.confidence, sources: response.sources },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to contact AI service.");
    } finally {
      setLoading(false);
    }
  };

  const exportMarkdown = () => {
    if (messages.length === 0) return;
    const md = messages
      .map((m) => `### ${m.role === "user" ? "Question" : "AI Answer"}\n\n${m.content}\n`)
      .join("\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study_session_${subjectName.replace(/[^a-z0-9]/gi, "_")}.md`;
    a.click();
    toast("Chat history saved as Markdown.", "success");
  };

  const handleConfirmNewStudySession = () => {
    setMessages([]);
    setQuestion("");
    setError(null);
    setShowNewSessionConfirm(false);
    beginNewStudySession();
  };

  const clearConversation = async () => {
    if (sessionId) {
      try {
        await backendService.ai.clearHistory(sessionId);
      } catch {
        // Fallback clear
      }
    }
    setMessages([]);
    setQuestion("");
    setError(null);
    setShowClearConfirm(false);
    setSessionId(crypto.randomUUID());
    toast("Conversation history cleared.", "info");
  };

  const composerDisabled = loading || !question.trim() || !hasWorkspace || !hasSubject;
  const composerReason = loading ? "Generating AI response..." : !hasWorkspace ? "No workspace available" : !hasSubject ? "Select a subject first" : !question.trim() ? "Type a prompt to ask AI" : "Ask AI";

  return (
    <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm flex flex-col gap-5">
      {/* Top Workspace Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-purple-100/60 rounded-3xl p-4.5 shadow-sm">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Material
          </button>
          <h2 className="text-lg font-black text-slate-800 mt-2.5 flex items-center gap-2">
            <span>AI Study Workspace</span>
            <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100/40">
              {subjectName} · {resourceType}
            </span>
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">
            Workspace: {activeWorkspace?.title || `GATE #${activeWorkspaceId}`} · Subject #{selectedSubjectId}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <button
            onClick={exportMarkdown}
            disabled={messages.length === 0}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MD</span>
          </button>
          <button
            onClick={() => setShowNewSessionConfirm(true)}
            className="px-3.5 py-2 text-xs font-black rounded-xl bg-purple-50 text-purple-700 border border-purple-100/40 hover:bg-purple-100/50 cursor-pointer transition-all"
          >
            New Session
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-150 text-slate-600 hover:bg-slate-100 hover:text-slate-800 cursor-pointer transition-all"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Main 2-Column Study Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Viewport & Input Composer */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm min-h-[480px] flex flex-col justify-between">
            <div data-lenis-prevent className="flex-1 overflow-y-auto max-h-[400px] space-y-4 pr-1.5 scroll-smooth">
              {messages.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <Bot className="w-12 h-12 text-purple-400/80 mx-auto animate-pulse" />
                  <h4 className="text-xs font-black text-slate-700">ExamForge AI Ready</h4>
                  <p className="text-[10px] text-slate-400 max-w-sm mx-auto font-semibold leading-relaxed">
                    Select a suggestion from the right panel or type your custom study question below The AI will reference your indexed resource documents
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
                    sources: message.sources,
                  };
                  return <ChatMessage key={mappedMessage.id} message={mappedMessage} />;
                })
              )}
              <AiThinkingPipeline active={loading} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void ask();
              }}
              className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-purple-300 focus-within:border-purple-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-100/70 rounded-2xl px-3.5 py-1.5 transition-all shadow-sm">
                <Sparkles className="w-4 h-4 text-purple-500 shrink-0 animate-pulse" />
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
                  placeholder="Ask about this study material (Ctrl+Enter to send)..."
                  className="w-full bg-transparent text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none py-1.5"
                />
                {question.trim() && (
                  <button
                    type="button"
                    onClick={() => setQuestion("")}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0 cursor-pointer"
                    title="Clear input (Esc)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={composerDisabled}
                title={composerReason}
                className="group relative px-5 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 text-white rounded-2xl text-xs font-black shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300/60 disabled:shadow-none transition-all duration-200 cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 shrink-0 active:scale-95 disabled:active:scale-100"
              >
                <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                <span className="tracking-wide">Ask AI</span>
              </button>
            </form>

            {error && (
              <div className="text-[10px] text-rose-600 text-center mt-3 bg-rose-50 border border-rose-100/50 p-2 rounded-xl">
                {error}{" "}
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

        {/* Right Panel: Settings, Memory & Prompt Templates */}
        <div className="lg:col-span-4 space-y-4">
          {/* AI Context Settings */}
          <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm space-y-3.5">
            <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest border-b border-slate-50 pb-2">
              RAG Context Settings
            </h4>
            <div className="flex flex-col gap-3">
              <div className="text-xs">
                <p className="font-black text-slate-800 leading-snug">
                  {scope === "subject" ? "Entire Subject" : scope === "resource" ? "Current Resource" : "Selected Resources"}
                </p>
                <p className="text-[10px] text-slate-450 font-bold mt-1">
                  {resourcesIncluded} resource{resourcesIncluded === 1 ? "" : "s"} included in RAG search scope
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
                {subjectResources.map((res) => (
                  <label
                    key={res.id}
                    className="flex items-center gap-2 rounded-xl bg-slate-50/60 border border-slate-150/40 px-3 py-2 text-[10px] text-slate-650 cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedResources.includes(res.id)}
                      onChange={() =>
                        setSelectedResources((current) =>
                          current.includes(res.id)
                            ? current.filter((id) => id !== res.id)
                            : [...current, res.id]
                        )
                      }
                      className="rounded border-slate-200 text-purple-600 focus:ring-purple-100 cursor-pointer"
                    />
                    <span className="truncate font-bold">{res.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* AI Study Memory Summary */}
          {sessionId && (
            <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest border-b border-slate-50 pb-2">
                Study Session Stats
              </h4>
              <div className="border border-slate-100 rounded-2xl overflow-hidden text-[10px]">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <td className="px-3.5 py-2 text-slate-450 font-bold">Subject</td>
                      <td className="px-3.5 py-2 font-black text-slate-800 truncate max-w-[110px]" title={subjectName}>
                        {subjectName}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-3.5 py-2 text-slate-450 font-bold">Format</td>
                      <td className="px-3.5 py-2 font-black text-slate-800">{resourceType}</td>
                    </tr>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <td className="px-3.5 py-2 text-slate-450 font-bold">Scope</td>
                      <td className="px-3.5 py-2 font-black text-purple-700">
                        {scope === "subject" ? "Subject" : scope === "resource" ? "Resource" : "Selected"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-3.5 py-2 text-slate-450 font-bold">Last Prompt</td>
                      <td className="px-3.5 py-2 font-black text-slate-800 truncate max-w-[110px]" title={lastQuestion || "—"}>
                        {lastQuestion || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3.5 py-2 text-slate-450 font-bold">Duration</td>
                      <td className="px-3.5 py-2 font-black text-slate-800">{sessionDuration}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Prompt Suggestions */}
          <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest border-b border-slate-50 pb-2">
              Study Prompt Templates
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
                  className="w-full text-left rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-[10px] font-bold text-slate-750 hover:bg-purple-50/30 hover:border-purple-300 hover:text-purple-700 transition-all cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showNewSessionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-slate-800">Start New Study Session?</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Your active chat view will reset for a fresh study session.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmNewStudySession}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Yes, Start New
              </button>
              <button
                onClick={() => setShowNewSessionConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-slate-800">Clear Conversation History?</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              This will remove all messages from the current study session history.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => void clearConversation()}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Clear History
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  X,
  Check,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { backendService, type Resource, type LibraryBookItem } from "@/services/backend.service";
import { OriginalPdfViewerModal } from "../../ai-sources/components/OriginalPdfViewerModal";
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
      hoverBg: "hover:bg-emerald-50/40",
      hoverBorder: "hover:border-emerald-300",
      hoverText: "group-hover:text-emerald-700",
      badgeBg: "bg-emerald-50 text-emerald-800",
      iconBg: "bg-emerald-50 text-emerald-600",
    };
  }
  if (s.includes("emerald") || s.includes("green") || s.includes("teal")) {
    return {
      hoverBg: "hover:bg-emerald-50/40",
      hoverBorder: "hover:border-emerald-300",
      hoverText: "group-hover:text-emerald-700",
      badgeBg: "bg-emerald-50 text-emerald-800",
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
    hoverBg: "hover:bg-emerald-50/40",
    hoverBorder: "hover:border-emerald-300",
    hoverText: "group-hover:text-emerald-700",
    badgeBg: "bg-emerald-50 text-emerald-800",
    iconBg: "bg-emerald-50 text-emerald-600",
  };
};

export function AIChatStepFlow() {
  const [chunkViewerData, setChunkViewerData] = useState<{
    isOpen: boolean;
    title: string;
    chunks: Array<{ index: number; content: string; page_number?: number; chapter?: string; score?: number }>;
  }>({
    isOpen: false,
    title: "Document Chunks",
    chunks: [],
  });

  return (
    <>
      <AiStudyHome setChunkViewerData={setChunkViewerData} />
      <ChunkViewerModal
        isOpen={chunkViewerData.isOpen}
        onClose={() => setChunkViewerData((prev) => ({ ...prev, isOpen: false }))}
        documentTitle={chunkViewerData.title}
        chunks={chunkViewerData.chunks}
      />
    </>
  );
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
    <div className="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-md border border-emerald-200/80 rounded-full px-6 sm:px-10 py-3 shadow-md shadow-emerald-950/5 mb-7">
      <div className="relative flex items-center justify-between">
        {/* Background Subtle Line */}
        <div className="absolute left-4 right-4 top-4 h-1.5 bg-emerald-100/80 rounded-full z-0" />

        {/* Active Animated Gradient Progress Line (Matching Landing Page Emerald Gradient) */}
        <div
          className="absolute left-4 top-4 h-1.5 bg-gradient-to-r from-[#084c38] via-[#059669] to-[#10b981] rounded-full z-0 transition-all duration-500 ease-out shadow-2xs"
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
                className={`w-9.5 h-9.5 rounded-2xl flex items-center justify-center text-xs transition-all duration-300 font-black ${isCurrent
                  ? "bg-gradient-to-r from-[#084c38] via-[#059669] to-[#047857] text-white ring-4 ring-emerald-100 shadow-md scale-110 border border-emerald-400/40"
                  : isCompleted
                    ? "bg-[#059669] text-white shadow-2xs font-black border border-emerald-400/40"
                    : "bg-emerald-50/60 text-slate-400 border border-emerald-200/80 hover:border-emerald-400 hover:text-emerald-700"
                  }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4.5 h-4.5" /> : <Icon className="w-4.5 h-4.5" />}
              </div>

              {/* Step Label */}
              <span
                className={`text-[10px] font-black tracking-widest uppercase transition-colors ${isCurrent
                  ? "text-[#084c38] font-black"
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

function AiStudyHome({
  setChunkViewerData,
}: {
  setChunkViewerData: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      title: string;
      chunks: Array<{ index: number; content: string; page_number?: number; chapter?: string; score?: number }>;
    }>
  >;
}) {
  const router = useRouter();
  const { activeWorkspace, activeWorkspaceId, flowStep, setFlowStep, selectedSubjectId, selectedResourceType, selectedResourceId, selectSubject, selectResourceType, selectResource, refreshResources } = useWorkspace();
  const [subjectSearch, setSubjectSearch] = useState("");

  const handleInspectDocumentChunks = async (resourceId: string | number, resourceTitle: string) => {
    try {
      const numId = Number(resourceId);
      if (!numId) return;
      const preview = await backendService.documents.preview(numId);
      setChunkViewerData({
        isOpen: true,
        title: preview.title || resourceTitle || "Document Chunks",
        chunks: preview.chunks || [],
      });
    } catch {
      /* Fallback handling */
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sourceId = params.get("sourceId");
      if (sourceId) {
        selectResource(sourceId);
        setFlowStep(5);
      }
    }
  }, [selectResource, setFlowStep]);

  const getResourceCountForSubject = (subjId: string) => {
    if (!activeWorkspace?.resources) return 0;
    return activeWorkspace.resources.filter(
      (res) => String(res.subjectId) === String(subjId)
    ).length;
  };

  const defaultDiverseSubjects = [
    { id: "subj-history", name: "History & Culture", color: "from-amber-500 to-orange-600", resourceCount: getResourceCountForSubject("subj-history") },
    { id: "subj-geography", name: "Geography & Ecology", color: "from-emerald-500 to-teal-600", resourceCount: getResourceCountForSubject("subj-geography") },
    { id: "subj-polity", name: "Polity & Governance", color: "from-emerald-600 to-teal-700", resourceCount: getResourceCountForSubject("subj-polity") },
    { id: "subj-economy", name: "Economy & Growth", color: "from-emerald-600 to-teal-700", resourceCount: getResourceCountForSubject("subj-economy") },
    { id: "subj-science", name: "Science & Technology", color: "from-teal-600 to-emerald-700", resourceCount: getResourceCountForSubject("subj-science") },
  ];

  const mappedWorkspaceSubjects = (activeWorkspace?.subjects ?? []).map((subject) => ({
    ...subject,
    resourceCount: getResourceCountForSubject(subject.id)
  }));

  const rawSubjects = (mappedWorkspaceSubjects.length > 1)
    ? mappedWorkspaceSubjects
    : [...mappedWorkspaceSubjects, ...defaultDiverseSubjects];

  const subjects = rawSubjects.filter((subject) =>
    subject.name.toLowerCase().includes(subjectSearch.trim().toLowerCase())
  );
  const selectedSubject = rawSubjects.find((subject) => subject.id === selectedSubjectId);

  if (flowStep === 2 && selectedSubject) {
    const rawSubjectResources = activeWorkspace?.resources.filter((resource) => resource.subjectId === selectedSubject.id) ?? [];
    const subjectResources = rawSubjectResources.length > 0 ? rawSubjectResources : (activeWorkspace?.resources ?? []);
    const resourceTypes = [
      { label: "Books", type: "Book", icon: BookOpen, tone: "text-emerald-700 bg-emerald-50" },
      { label: "Notes", type: "Note", icon: FileCheck, tone: "text-amber-700 bg-amber-50" },
      { label: "PYQs", type: "PYQ", icon: HelpCircle, tone: "text-emerald-700 bg-emerald-50" },
      { label: "Syllabus", type: "Syllabus", icon: Layers, tone: "text-teal-700 bg-teal-50" },
    ] as const;

    return (
      <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-slate-200/80 min-h-[650px] shadow-sm space-y-6">
        <FlowStepProgressBar currentStep={2} onStepClick={setFlowStep} />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
          {/* Back to Subjects */}
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => setFlowStep(1)} className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-black text-slate-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all cursor-pointer shadow-2xs group">
              <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Subjects</span>
            </button>
            {/* <span className="text-xs font-black text-slate-400">Step 2 of 5 · Select Material Type</span> */}
          </div>

          <div className="flex items-center gap-3.5 border-b border-slate-200 pb-5">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedSubject.color} text-white flex items-center justify-center shadow-md shrink-0`}>
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">{selectedSubject.name}</h2>
                <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">Selected Subject</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Select a material category below to explore indexed sources.</p>
            </div>
          </div>

          {/* Separate Distinct Cards Grid for Resource Types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {resourceTypes.map(({ label, type, icon: Icon, tone }) => {
              const count = subjectResources.filter((resource) => resource.type === type).length;
              return (
                <div
                  key={type}
                  className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200/90 rounded-3xl hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${tone} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {count} Items
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {label}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {type === "Book" ? "Official textbooks & reference books" : type === "Note" ? "Summaries & revision notes" : type === "PYQ" ? "Previous year questions & solutions" : "Official exam syllabus outline"}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <button
                      onClick={() => selectResourceType(type)}
                      className="w-full h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Explore {label}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex justify-center">
                      <ResourceUploadButton
                        workspaceId={activeWorkspaceId}
                        subjectId={selectedSubject.id}
                        resourceType={backendResourceType[type]}
                        variant="outline"
                        size="sm"
                        label={`Upload ${type}`}
                        onSuccess={() => void refreshResources()}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action for Direct AI Chat with Subject */}
          <div className="pt-6 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => {
                selectResourceType("Book"); // Default category
                selectResource(""); // Clear specific resource to chat with entire subject/category
                setFlowStep(5);
              }}
              className="h-11 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 w-full sm:w-auto"
            >
              <MessageSquare className="w-4 h-4 text-emerald-255 animate-pulse" />
              <span>Start AI Subject Chat</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (flowStep === 3 && selectedSubject && selectedResourceType) {
    return <ResourceListStage subjectId={selectedSubject.id} subjectName={selectedSubject.name} resourceType={selectedResourceType} onBack={() => setFlowStep(2)} onSelect={selectResource} onInspectChunks={handleInspectDocumentChunks} />;
  }

  if (flowStep === 4 && selectedResourceId) {
    return <ResourcePreviewStage resourceId={selectedResourceId} onBack={() => setFlowStep(3)} onStudy={() => setFlowStep(5)} />;
  }

  if (flowStep === 5) {
    return (
      <div className="w-full space-y-6">
        <FlowStepProgressBar currentStep={5} onStepClick={setFlowStep} />
        <KnowledgeStudyWorkspace
          resourceId={selectedResourceId || ""}
          subjectName={selectedSubject?.name || "Selected AI Source"}
          resourceType={selectedResourceType || "Book"}
          onBack={() => {
            if (selectedResourceId && selectedSubject && selectedResourceType) {
              setFlowStep(4);
            } else {
              setFlowStep(1);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-slate-200/80 min-h-[650px] shadow-sm space-y-6">
      <FlowStepProgressBar currentStep={1} onStepClick={setFlowStep} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">AI Study Assistant</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">Select a subject to start learning with indexed books and official exam sources.</p>
          </div>
          <button
            onClick={() => router.push("/ai-study/sources")}
            className="h-10 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer shrink-0 w-fit"
          >
            <Bot className="w-4 h-4 text-white animate-pulse" />
            <span>AI Library</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            value={subjectSearch}
            onChange={(event) => setSubjectSearch(event.target.value)}
            placeholder="Search subjects by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 shadow-sm transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Separate Distinct Subject Cards - Matched with Step 2 Layout */}
        {subjects.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {subjects.map((subject) => {
              const theme = getSubjectTheme(subject.color);
              return (
                <div
                  key={subject.id}
                  className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200/90 rounded-3xl hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subject.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                      <BookOpen className="w-6 h-6" />
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {subject.resourceCount} Sources
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Official syllabus subject with indexed textbooks & study material
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => selectSubject(subject.id)}
                      className="w-full h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Explore {subject.name}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-14 bg-white border border-dashed border-slate-200 rounded-3xl space-y-3">
            <p className="text-xs font-bold text-slate-400">No subjects available for this workspace.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 transition cursor-pointer">
              Refresh Subjects
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

type ResourceTypeFilter = "Book" | "PDF" | "Note" | "PYQ" | "Syllabus";
const backendResourceType: Record<ResourceTypeFilter, string> = { Book: "book", PDF: "pdf", Note: "notes", PYQ: "pyq", Syllabus: "syllabus" };

function ResourceListStage({ subjectId, subjectName, resourceType, onBack, onSelect, onInspectChunks }: { subjectId: string; subjectName: string; resourceType: ResourceTypeFilter; onBack: () => void; onSelect: (id: string) => void; onInspectChunks: (id: string | number, title: string) => void }) {
  const { activeWorkspaceId, setFlowStep, selectResource } = useWorkspace();
  const [query, setQuery] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pdfViewerBook, setPdfViewerBook] = useState<LibraryBookItem | null>(null);

  const load = async () => {
    const workspaceId = Number(activeWorkspaceId);
    if (!Number.isInteger(workspaceId) || workspaceId <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const isFallbackSubject = subjectId.startsWith("subj-");
      const params = new URLSearchParams({ resource_type: backendResourceType[resourceType], keyword: query, limit: "100" });
      if (!isFallbackSubject) {
        params.append("subject_id", subjectId);
      }
      let items = (await backendService.workspace.search(workspaceId, params)).items;

      // If empty and not already fallbacked, query all workspace resources for this type
      if (items.length === 0 && !isFallbackSubject) {
        const fallbackParams = new URLSearchParams({ resource_type: backendResourceType[resourceType], keyword: query, limit: "100" });
        items = (await backendService.workspace.search(workspaceId, fallbackParams)).items;
      }
      setResources(items);
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

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-slate-200/80 min-h-[650px] shadow-sm space-y-6">
      <FlowStepProgressBar currentStep={3} onStepClick={setFlowStep} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button onClick={onBack} className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-black text-slate-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all cursor-pointer shadow-2xs group">
          <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Material Types</span>
        </button>
        {/* <span className="text-xs font-black text-slate-400">Step 3 of 5 · Select Book/Source</span> */}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-black text-slate-900">Select {resourceType} for AI Study</h2>
            <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">{subjectName}</span>
            <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">{resourceType}</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Choose an indexed document from your library to begin interactive chatting.</p>
        </div>
        <button
          disabled={!selectedId}
          onClick={() => selectedId && onSelect(selectedId)}
          className="h-10 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 disabled:bg-slate-300 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0 w-fit"
        >
          <span>Proceed to Preview</span>
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-md mx-auto relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${resourceType.toLowerCase()}s by title...`}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 shadow-sm transition-all text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {/* Content Rendering Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading indexed resources...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-white border border-dashed border-rose-200 rounded-3xl space-y-3">
          <p className="text-xs font-bold text-rose-500">{error}</p>
          <button onClick={() => void load()} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 transition cursor-pointer">
            Retry
          </button>
        </div>
      ) : resources.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((resource) => {
            const isSelected = selectedId === String(resource.id);
            const isCompleted = resource.status.toUpperCase() === "COMPLETED" || resource.status.toUpperCase() === "READY";
            return (
              <div
                key={resource.id}
                onClick={() => setSelectedId(String(resource.id))}
                className={`group relative flex flex-col justify-between p-5 bg-white border rounded-3xl transition-all duration-300 cursor-pointer space-y-4 ${isSelected
                  ? "border-emerald-500 ring-2 ring-emerald-300/40 bg-gradient-to-b from-emerald-50/30 to-white shadow-md"
                  : "border-slate-200/90 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${isSelected ? "bg-emerald-600 text-white border-emerald-500 shadow-sm" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    }`}>
                    <BookOpen className="w-5.5 h-5.5" />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPdfViewerBook({
                          id: resource.id,
                          title: resource.title,
                          original_filename: resource.original_filename || `${resource.title}.pdf`,
                          resource_type: resource.resource_type,
                          status: resource.status,
                          total_pages: resource.total_pages || 0,
                          chunks_count: resource.chunks_count || 0,
                          file_size: resource.file_size || 0,
                          workspace_id: resource.workspace_id,
                          subject_id: resource.subject_id,
                          subject: subjectName,
                          ai_ready: isCompleted,
                          is_selected: isSelected,
                          created_at: resource.created_at,
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-colors"
                      title="View original PDF document"
                    >
                      <FileText className="w-3 h-3 text-emerald-600" />
                      <span>View PDF</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectChunks(resource.id, resource.title);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-colors cursor-pointer"
                      title="View document chunks"
                    >
                      <Database className="w-3 h-3 text-emerald-600" />
                      <span>Chunks ({resource.chunks_count || 0})</span>
                    </button>

                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        AI Ready
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {resource.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 truncate">
                    {resource.original_filename || resource.title}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 mt-1 flex items-center gap-2">
                    {resource.total_pages ? <span>{resource.total_pages} Pages</span> : null}
                    {resource.total_pages && resource.file_size ? <span>•</span> : null}
                    {resource.file_size ? <span>{formatFileSize(resource.file_size)}</span> : null}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(String(resource.id));
                    }}
                    className={`w-full h-10 rounded-2xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${isSelected
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100/50"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/90"
                      }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Chunks</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl space-y-3">
          <p className="text-xs font-bold text-slate-400">No {resourceType.toLowerCase()}s found for this subject.</p>
        </div>
      )}

      {/* PDF Viewer Modal */}
      <OriginalPdfViewerModal
        book={pdfViewerBook}
        isOpen={Boolean(pdfViewerBook)}
        onClose={() => setPdfViewerBook(null)}
      />
    </div>
  );
}

function ResourcePreviewStage({ resourceId, onBack, onStudy }: { resourceId: string; onBack: () => void; onStudy: () => void }) {
  const { setFlowStep } = useWorkspace();
  const [resource, setResource] = useState<Resource | null>(null);
  const [preview, setPreview] = useState<{ resource_id: number; title: string; chunks: Array<{ index: number; content: string }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chunkSearch, setChunkSearch] = useState("");
  const [pdfViewerBook, setPdfViewerBook] = useState<LibraryBookItem | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleCopyChunk = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredChunks = (preview?.chunks || []).filter((c) =>
    c.content.toLowerCase().includes(chunkSearch.trim().toLowerCase())
  );

  return (
    <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-slate-200/80 min-h-[650px] shadow-sm space-y-6">
      <FlowStepProgressBar currentStep={4} onStepClick={setFlowStep} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button onClick={onBack} className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-black text-slate-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all cursor-pointer shadow-2xs group">
          <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Resources List</span>
        </button>
        {/* <span className="text-xs font-black text-slate-400">Step 4 of 5 · Preview & Inspect Source</span> */}
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading resource preview...</p>
        </div>
      ) : error || !resource ? (
        <div className="py-16 text-center bg-white border border-dashed border-rose-200 rounded-3xl space-y-3">
          <p className="text-xs font-bold text-rose-500">{error || "Resource not found."}</p>
          <button onClick={() => void load()} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 transition cursor-pointer">
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">{resource.title}</h2>
                <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">{resource.resource_type}</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{resource.original_filename}</span>
                {resource.total_pages ? <span>• {resource.total_pages} Pages</span> : null}
                {resource.file_size ? <span>• {formatFileSize(resource.file_size)}</span> : null}
                {preview?.chunks.length ? <span className="text-emerald-700 font-bold">• {preview.chunks.length} Extracted Chunks</span> : null}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() =>
                  setPdfViewerBook({
                    id: resource.id,
                    title: resource.title,
                    original_filename: resource.original_filename || `${resource.title}.pdf`,
                    resource_type: resource.resource_type,
                    status: resource.status,
                    total_pages: resource.total_pages || 0,
                    chunks_count: preview?.chunks.length || resource.chunks_count || 0,
                    file_size: resource.file_size || 0,
                    workspace_id: resource.workspace_id,
                    subject_id: resource.subject_id,
                    ai_ready: true,
                    is_selected: true,
                    created_at: resource.created_at,
                  })
                }
                className="h-10 px-4 bg-slate-100 hover:bg-emerald-50 border border-slate-250 text-slate-800 text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>View Original PDF</span>
              </button>
              <button
                onClick={onStudy}
                className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                <span>Start AI Study Session</span>
              </button>
            </div>
          </div>

          {/* 2-Column Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
            {/* Left Card: Visual Book Cover & Document Metadata */}
            <aside className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-5 shadow-xs">
              <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="p-2.5 rounded-2xl bg-white/20 w-fit border border-white/15">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/25 px-2 py-0.5 rounded-md">
                    {resource.resource_type}
                  </span>
                  <h3 className="text-base font-black line-clamp-2 text-white leading-snug drop-shadow-xs">
                    {resource.title}
                  </h3>
                </div>
              </div>

              {/* Detailed Metadata Table */}
              <div className="border border-slate-150 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <td className="px-3.5 py-2.5 text-slate-500 font-bold">Category</td>
                      <td className="px-3.5 py-2.5 font-black text-slate-900">{resource.resource_type}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-3.5 py-2.5 text-slate-500 font-bold">File Size</td>
                      <td className="px-3.5 py-2.5 font-mono font-black text-slate-800">{resource.file_size ? formatFileSize(resource.file_size) : "N/A"}</td>
                    </tr>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <td className="px-3.5 py-2.5 text-slate-500 font-bold">Total Pages</td>
                      <td className="px-3.5 py-2.5 font-black text-emerald-700">{resource.total_pages ? `${resource.total_pages} pages` : "N/A"}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-3.5 py-2.5 text-slate-500 font-bold">Extracted Chunks</td>
                      <td className="px-3.5 py-2.5 font-black text-slate-800">{preview?.chunks.length ?? 0} Chunks</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-3.5 py-2.5 text-slate-500 font-bold">Status</td>
                      <td className="px-3.5 py-2.5">
                        <span className="inline-block text-[9.5px] font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                          AI Ready
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Left Column Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() =>
                    setPdfViewerBook({
                      id: resource.id,
                      title: resource.title,
                      original_filename: resource.original_filename || `${resource.title}.pdf`,
                      resource_type: resource.resource_type,
                      status: resource.status,
                      total_pages: resource.total_pages || 0,
                      chunks_count: preview?.chunks.length || resource.chunks_count || 0,
                      file_size: resource.file_size || 0,
                      workspace_id: resource.workspace_id,
                      subject_id: resource.subject_id,
                      ai_ready: true,
                      is_selected: true,
                      created_at: resource.created_at,
                    })
                  }
                  className="w-full py-2.5 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 hover:text-emerald-700 text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View Original PDF</span>
                </button>

                <button
                  onClick={onStudy}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span>Start AI Chat Session</span>
                </button>
              </div>
            </aside>

            {/* Right Panel: Extracted Chunks OCR Preview */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-6 text-xs text-slate-700 overflow-hidden space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 pb-3">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Extracted Document Chunks ({filteredChunks.length})</span>
                </h3>

                {/* Chunk Search Bar */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={chunkSearch}
                    onChange={(e) => setChunkSearch(e.target.value)}
                    placeholder="Search chunk text..."
                    className="w-full h-8 pl-9 pr-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Chunks List */}
              {filteredChunks.length > 0 ? (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredChunks.map((chunk) => (
                    <div
                      key={chunk.index}
                      className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2 hover:bg-emerald-50/30 hover:border-emerald-200 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                          Chunk #{chunk.index + 1}
                        </span>
                        <button
                          onClick={() => handleCopyChunk(chunk.content, chunk.index)}
                          className="flex items-center gap-1 text-[11px] font-black text-slate-500 hover:text-emerald-700 cursor-pointer"
                        >
                          {copiedIndex === chunk.index ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap text-slate-700 font-semibold max-h-36 overflow-y-auto pr-1">
                        {chunk.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs font-bold">
                  No matching document chunks found.
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      <OriginalPdfViewerModal
        book={pdfViewerBook}
        isOpen={Boolean(pdfViewerBook)}
        onClose={() => setPdfViewerBook(null)}
      />
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
  const activeStage = AI_THINKING_STAGES[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 14 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mr-auto max-w-[95%] sm:max-w-xl rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-white via-emerald-50/40 to-indigo-50/30 p-5 sm:p-6 shadow-xl shadow-emerald-500/10 space-y-4 my-4 backdrop-blur-xl relative overflow-hidden"
    >
      {/* Background Soft Ambient Glow & Mesh Shimmer */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 border border-emerald-300/30"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9.5px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-100/90 border border-emerald-300/60 px-2.5 py-0.5 rounded-full shadow-2xs">
                AI Pipeline
              </span>
              <span className="text-[10.5px] font-black text-slate-500">
                Step {currentStep + 1} of {AI_THINKING_STAGES.length}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-1 truncate">
              {activeStage.label}
            </h4>
            <p className="text-[11px] font-semibold text-slate-500 truncate">
              {activeStage.detail}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-base font-black text-emerald-700 tabular-nums">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Animated Glowing Multi-Color Progress Bar */}
      <div className="w-full bg-emerald-100/80 h-2.5 rounded-full overflow-hidden p-0.5 relative border border-emerald-200/50 shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 rounded-full relative"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-white/40 animate-pulse rounded-full" />
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
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`flex items-center gap-2.5 text-[10.5px] px-3.5 py-2.5 rounded-2xl border transition-all duration-300 ${
                isCurrent
                  ? "bg-white border-emerald-400 text-slate-900 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-200"
                  : isDone
                  ? "bg-emerald-50/80 border-emerald-200/80 text-emerald-900"
                  : "bg-white/60 border-slate-200/60 text-slate-400"
              }`}
            >
              <div className="shrink-0 flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <motion.span
                    animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block ring-4 ring-emerald-200"
                  />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className={`truncate font-black ${isCurrent ? "text-emerald-950" : ""}`}>
                  {stage.label}
                </p>
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
          <section key={`${heading}-${index}`} className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-4 shadow-2xs">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-3 bg-emerald-600 rounded-full inline-block" />
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
  const router = useRouter();
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
  const hasWorkspace = true;
  const hasSubject = true;
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
    if (!prompt.trim()) return;
    setLoading(true); setError(null); setQuestion("");
    try {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const conversation = await backendService.ai.createConversation({ workspace_id: workspaceId || 1, subject_id: selectedSubjectId ? Number(selectedSubjectId) : undefined });
        activeSessionId = conversation.session_id;
        setSessionId(activeSessionId);
        setActiveConversationId(activeSessionId);
      }
      setMessages((current) => [...current, { role: "user", content: prompt }]);
      const response = await backendService.ai.knowledge({ session_id: activeSessionId, workspace_id: workspaceId || 1, subject_id: selectedSubjectId ? Number(selectedSubjectId) : undefined, question: prompt });
      setMessages((current) => [...current, { role: "assistant", content: response.answer, confidence: response.confidence, sources: response.sources }]);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to contact AI service."); }
    finally { setLoading(false); }
  };
  const composerDisabled = loading || !question.trim();
  const composerReason = loading ? "A response is already being generated." : !question.trim() ? "Enter a question to enable Ask AI." : "Ready to send.";

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
    <div className="relative w-full h-[calc(100vh-11rem)] min-h-[620px] max-h-[900px] overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-xl flex">
      <div className={`hidden md:block shrink-0 overflow-hidden transition-[width] duration-200 ${historyOpen ? "w-[270px]" : "w-0"}`}>
        <ConversationSidebar className="stage-five-history" />
      </div>
      {historyOpen && <button aria-label="Close chat history" onClick={() => setHistoryOpen(false)} className="hidden md:flex absolute left-[252px] top-3.5 z-20 h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-emerald-700 shadow-xs cursor-pointer"><PanelLeftClose className="w-3.5 h-3.5" /></button>}
      {!historyOpen && <button aria-label="Open chat history" onClick={() => setHistoryOpen(true)} className="hidden md:flex absolute left-3 top-3.5 z-20 h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-emerald-700 shadow-xs cursor-pointer"><PanelLeftOpen className="w-4 h-4" /></button>}
      {historyOpen && <div className="md:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs" onClick={() => setHistoryOpen(false)}><div className="h-full w-[290px] bg-white shadow-xl" onClick={(event) => event.stopPropagation()}><ConversationSidebar className="stage-five-history" /><button aria-label="Close chat history" onClick={() => setHistoryOpen(false)} className="absolute left-[254px] top-3.5 rounded-xl bg-white p-2 text-slate-700 shadow-xs"><X className="w-4 h-4" /></button></div></div>}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Workspace Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 px-5 py-3.5 sm:px-6 backdrop-blur-xs">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={onBack} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-[#084c38] bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 rounded-2xl transition-all cursor-pointer shadow-2xs group">
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Steps</span>
              </button>
              <button onClick={() => router.push("/ai-study/sources")} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-2xl transition-all cursor-pointer shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Library</span>
              </button>
            </div>
            <h2 className="text-sm font-black text-slate-900 mt-2 flex items-center gap-2 tracking-tight">
              <button aria-label="Open chat history" onClick={() => setHistoryOpen(true)} className="md:hidden rounded-xl p-1.5 text-slate-500 hover:bg-emerald-50"><Menu className="w-4 h-4" /></button>
              <span>Aptora Chat</span>
              <span className="text-[10px] font-black uppercase text-[#084c38] bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                {subjectName} · {resourceType}
              </span>
            </h2>
            <p className="text-[10.5px] text-slate-500 mt-1 font-bold">
              Active Source #{resourceId || "Indexed"} · Session Duration: <span className="text-[#059669] font-mono font-black">{sessionDuration}</span>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={startNewStudySession} className="px-4 py-2 text-xs font-black rounded-2xl bg-gradient-to-r from-[#084c38] to-[#059669] hover:from-[#063b2b] hover:to-[#047857] text-white cursor-pointer transition-all shadow-md shadow-[#084c38]/20">
              New Chat
            </button>
            <button onClick={() => setContextOpen((open) => !open)} className={`px-3.5 py-2 text-xs font-black rounded-2xl border transition-all cursor-pointer ${contextOpen ? "border-emerald-300 bg-emerald-100 text-[#084c38]" : "border-emerald-200 bg-white text-slate-700 hover:bg-emerald-50"}`}>
              <SlidersHorizontal className="inline w-3.5 h-3.5 mr-1.5 text-emerald-600" />Context
            </button>
            <button onClick={() => void clearConversation()} className="hidden sm:block px-3.5 py-2 text-xs font-black rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 cursor-pointer">Clear</button>
          </div>
        </div>

        {/* Modern 2-Column Study Workspace Layout */}
        <div className="flex min-h-0 flex-1 gap-0">
          {/* Left Column: Messages viewport & Input Composer */}
          <div className="min-w-0 flex flex-1 flex-col">
            <div className="bg-gradient-to-b from-white via-emerald-50/10 to-white p-4 sm:p-6 flex min-h-0 flex-1 flex-col justify-between">
              <div data-lenis-prevent className="flex-1 overflow-y-auto space-y-4 pr-1.5 scroll-smooth">
                {messages.length === 0 ? (
                  <div className="py-12 text-center space-y-5">
                    <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#084c38] to-[#059669] text-white flex items-center justify-center shadow-lg shadow-[#084c38]/20 mx-auto border border-emerald-400/30">
                      <Bot className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 tracking-tight">Aptora Study Chat</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-semibold leading-relaxed">
                        Grounded directly on your selected AI Library book. Pick a quick prompt below or type your question.
                      </p>
                    </div>
                    {/* Prompt Suggestion Chips */}
                    <div className="flex items-center justify-center gap-2 flex-wrap max-w-lg mx-auto pt-2">
                      {PROMPT_SUGGESTIONS.map((promptText) => (
                        <button
                          key={promptText}
                          onClick={() => void ask(promptText)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-[#084c38] text-xs font-extrabold transition-all hover:scale-103 cursor-pointer shadow-2xs"
                        >
                          ✨ {promptText}
                        </button>
                      ))}
                    </div>
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

              {/* Prompt Suggestions Bar above Composer */}
              {messages.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
                  {PROMPT_SUGGESTIONS.slice(0, 4).map((promptText) => (
                    <button
                      key={promptText}
                      onClick={() => void ask(promptText)}
                      className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-900 text-[11px] font-extrabold whitespace-nowrap cursor-pointer shrink-0 transition-colors"
                    >
                      ✨ {promptText}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Composer Form */}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void ask();
                }}
                className="mt-3 pt-3 border-t border-slate-200/80 flex gap-2.5"
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
                  disabled={loading}
                  placeholder="Ask any question about this AI study resource…"
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 focus:bg-white transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={composerDisabled}
                  title={composerReason}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-600/20 disabled:shadow-none transition-all cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
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
            <div className="bg-white border border-emerald-100/80 rounded-3xl p-5 shadow-sm space-y-3.5">
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
                        className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-100 cursor-pointer"
                      />
                      <span className="truncate font-bold">{resource.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* AI Study Memory Card */}
            {sessionId && (
              <div className="bg-white border border-emerald-100/80 rounded-3xl p-5 shadow-sm space-y-4">
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
                        <td className="px-3.5 py-2.5 font-black text-emerald-700">
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
                className="bg-white border border-emerald-200/80 rounded-3xl p-5 shadow-sm space-y-3"
              >
                <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest border-b border-emerald-100 pb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Study Templates
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
                      className="w-full text-left rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-800 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-900 transition-all cursor-pointer shadow-xs"
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
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
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
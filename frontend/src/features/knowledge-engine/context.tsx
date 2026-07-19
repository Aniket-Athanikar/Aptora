"use client";


import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

import type {
  KnowledgeEngineState,
  BookMetadata,
  ProcessingJob,
  Chapter,
  Formula,
  Flashcard,
  AnyQuestion,
  MindMap,
  BookAnalytics,
  BookVersion,
  HistoryLog,
  LibraryFilters,
  KnowledgeTabId,
  DownloadFormat,
  DownloadRecord,
  PipelineStage,
  PipelineLog,
  ImageEnhancements,
  QualityScore,
  ValidationIssue,
  UIState,
} from "./types";
import { knowledgeReducer, buildInitialState, buildJobFromFile, logHelper, INITIAL_FILTERS, INITIAL_UI, INITIAL_PREFERENCES, type Action } from "./reducer";
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from "./storage";
import { nextId, pickCoverColor, formatBytes, formatRelativeTime, validateFile, copyToClipboard } from "./utils";
import {
  buildSampleChapters,
  buildSampleFormulas,
  buildSampleFlashcards,
  buildSampleQuestions,
  buildSampleMindMap,
  buildSampleAnalytics,
  PIPELINE_STAGE_DEFS,
} from "./data";

// ---------------------------------------------------------------------------
// TOAST CONTEXT (lightweight inline impl)
// ---------------------------------------------------------------------------

type ToastTone = "success" | "error" | "info" | "warning";
interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
  detail?: string;
}

interface ToastApi {
  toasts: Toast[];
  push: (message: string, opts?: { tone?: ToastTone; detail?: string }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within KnowledgeEngineProvider");
  return ctx;
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message: string, opts?: { tone?: ToastTone; detail?: string }) => {
    const id = nextId("toast");
    setToasts((prev) => [...prev, { id, message, tone: opts?.tone || "info", detail: opts?.detail }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              className={`pointer-events-auto rounded-2xl px-4 py-3 min-w-[280px] max-w-md shadow-lg border backdrop-blur-xl ${t.tone === "success"
                  ? "bg-emerald-50/95 border-emerald-200 text-emerald-900"
                  : t.tone === "error"
                    ? "bg-red-50/95 border-red-200 text-red-900"
                    : t.tone === "warning"
                      ? "bg-amber-50/95 border-amber-200 text-amber-900"
                      : "bg-white/95 border-slate-200 text-slate-900"
                }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  {t.tone === "success" && <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {t.tone === "error" && <Lucide.XCircle className="w-4 h-4 text-red-600" />}
                  {t.tone === "warning" && <Lucide.AlertTriangle className="w-4 h-4 text-amber-600" />}
                  {t.tone === "info" && <Lucide.Info className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-extrabold tracking-tight">{t.message}</div>
                  {t.detail && <div className="text-[11px] opacity-80 mt-0.5">{t.detail}</div>}
                </div>
                <button onClick={() => dismiss(t.id)} className="opacity-50 hover:opacity-100">
                  <Lucide.X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// ENGINE CONTEXT
// ---------------------------------------------------------------------------

interface EngineApi {
  state: KnowledgeEngineState;
  dispatch: React.Dispatch<Action>;
  toast: ToastApi;

  // Navigation
  setTab: (tab: KnowledgeTabId) => void;
  setActiveBook: (bookId: string | null) => void;
  setSelectedExam: (exam: string) => void;
  toggleRightSidebar: () => void;

  // Book CRUD
  createBookFromFile: (file: { name: string; size: number; type?: string; ext?: string }, options?: { examName?: string; autoStart?: boolean; enhancements?: Partial<ImageEnhancements>; coverColor?: string }) => { book: BookMetadata; job: ProcessingJob | null; issues: ValidationIssue[] };
  deleteBook: (bookId: string) => void;
  duplicateBook: (bookId: string) => void;
  cloneBook: (bookId: string) => void;
  archiveBook: (bookId: string, archived: boolean) => void;
  publishBook: (bookId: string, published: boolean) => void;
  featureBook: (bookId: string, featured: boolean) => void;
  pinBook: (bookId: string, pinned: boolean) => void;
  favoriteBook: (bookId: string, favorite: boolean) => void;
  moveBook: (bookId: string, folder: string) => void;
  updateBook: (bookId: string, patch: Partial<BookMetadata>) => void;

  // Bulk
  toggleBulkMode: () => void;
  setBulkSelected: (ids: string[]) => void;
  bulkDelete: () => void;
  bulkMove: (folder: string) => void;
  bulkPublish: (published: boolean) => void;
  bulkArchive: (archived: boolean) => void;
  bulkFeature: (featured: boolean) => void;

  // Filters
  setFilters: (patch: Partial<LibraryFilters>) => void;
  resetFilters: () => void;
  setView: (view: LibraryFilters["view"]) => void;
  setSort: (sortBy: LibraryFilters["sortBy"], sortDir?: LibraryFilters["sortDir"]) => void;

  // Compare
  toggleCompareMode: () => void;
  setCompareBooks: (ids: string[]) => void;
  toggleCompareBook: (bookId: string) => void;

  // Folders / Tags
  addFolder: (folder: string) => void;
  removeFolder: (folder: string) => void;
  addTag: (tag: string) => void;

  // History
  log: (category: HistoryLog["category"], action: string, detail: string, bookId?: string, bookTitle?: string) => void;
  clearHistory: () => void;

  // Pipeline
  startPipeline: (job: ProcessingJob) => void;
  cancelPipeline: (jobId: string) => void;
  retryPipeline: (jobId: string) => void;

  // Knowledge CRUD
  addChapter: (bookId: string, chapter: Chapter) => void;
  updateChapter: (bookId: string, chapterId: string, patch: Partial<Chapter>) => void;
  deleteChapter: (bookId: string, chapterId: string) => void;
  addFormula: (bookId: string, formula: Formula) => void;
  deleteFormula: (bookId: string, formulaId: string) => void;
  addFlashcard: (bookId: string, flashcard: Flashcard) => void;
  updateFlashcard: (bookId: string, flashcardId: string, patch: Partial<Flashcard>) => void;
  deleteFlashcard: (bookId: string, flashcardId: string) => void;
  addQuestion: (bookId: string, question: AnyQuestion) => void;
  deleteQuestion: (bookId: string, questionId: string) => void;

  // Versions
  addVersion: (bookId: string, version: BookVersion) => void;
  restoreVersion: (bookId: string, versionId: string) => void;

  // Downloads
  recordDownload: (bookId: string, format: DownloadFormat) => DownloadRecord;
  updateDownload: (recordId: string, patch: Partial<DownloadRecord>) => void;

  // Preferences
  setPreferences: (patch: Partial<KnowledgeEngineState["preferences"]>) => void;

  // Full reset
  resetAll: () => void;
}

const EngineContext = createContext<EngineApi | null>(null);

export function useKnowledgeEngine(): EngineApi {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error("useKnowledgeEngine must be used within KnowledgeEngineProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// PROVIDER
// ---------------------------------------------------------------------------

function EngineInnerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(knowledgeReducer, undefined, () => {
    // Try to load persisted state
    const persisted = loadFromStorage<KnowledgeEngineState | null>(STORAGE_KEYS.state, null);
    if (persisted && persisted.initialized) {
      return persisted;
    }
    return buildInitialState();
  });

  // Toast
  const [toastState, setToastState] = useState<Toast[]>([]);
  const toast = useMemo<ToastApi>(() => ({
    toasts: toastState,
    push: (message, opts) => {
      const id = nextId("toast");
      setToastState((prev) => [...prev, { id, message, tone: opts?.tone || "info", detail: opts?.detail }]);
      setTimeout(() => {
        setToastState((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    dismiss: (id) => setToastState((prev) => prev.filter((t) => t.id !== id)),
  }), [toastState]);

  // Persist to local storage whenever state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.state, state);
  }, [state]);

  // Track running job timers for cancellation
  const jobTimers = useRef<Map<string, ReturnType<typeof setTimeout>[]>>(new Map());

  // ------- Navigation -------
  const setTab = useCallback((tab: KnowledgeTabId) => dispatch({ type: "SET_TAB", tab }), []);
  const setActiveBook = useCallback((bookId: string | null) => dispatch({ type: "SET_ACTIVE_BOOK", bookId }), []);
  const setSelectedExam = useCallback((exam: string) => dispatch({ type: "SET_SELECTED_EXAM", exam }), []);
  const toggleRightSidebar = useCallback(() => dispatch({ type: "TOGGLE_RIGHT_SIDEBAR" }), []);

  // ------- History -------
  const log = useCallback((category: HistoryLog["category"], action: string, detail: string, bookId?: string, bookTitle?: string) => {
    dispatch({ type: "ADD_HISTORY", log: logHelper(category, action, detail, bookId, bookTitle) });
  }, []);
  const clearHistory = useCallback(() => dispatch({ type: "CLEAR_HISTORY" }), []);

  // ------- Book CRUD -------
  const createBookFromFile = useCallback((file: { name: string; size: number; type?: string; ext?: string }, options?: { examName?: string; autoStart?: boolean; enhancements?: Partial<ImageEnhancements>; coverColor?: string }) => {
    const ext = file.ext || file.name.split(".").pop()?.toLowerCase() || "pdf";
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
    const bookId = nextId("book");
    const issues = validateFile({ name: file.name, size: file.size, type: file.type });

    const examName = options?.examName || state.ui.selectedExam || "GATE";
    const book: BookMetadata = {
      id: bookId,
      title: baseName,
      author: "OCR Extracted Author",
      publisher: "Syllabus Telemetry Press",
      edition: "1st Edition",
      publicationYear: new Date().getFullYear().toString(),
      language: "English",
      description: "Auto-imported from developer upload. AI processing generates full study materials.",
      examCategory: "engineering",
      examName,
      subjects: ["General Syllabus"],
      difficulty: "intermediate",
      tags: ["#ai-import"],
      contentType: "textbook",
      status: "queued",
      visibility: "private",
      premium: "free",
      isFeatured: false,
      isTrending: false,
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      pageCount: Math.max(1, Math.round((file.size / (1024 * 1024)) * 12)),
      sizeBytes: file.size,
      qualityScore: 0,
      ocrConfidence: 0,
      readingTimeMinutes: Math.max(1, Math.round((file.size / (1024 * 1024)) * 36)),
      versionId: "v_1",
      versionNumber: 1,
      coverColor: options?.coverColor || pickCoverColor(file.name),
      fileExt: ext,
      originalFileName: file.name,
      folder: "Syllabus",
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Build initial empty content
    const chapters: Chapter[] = buildSampleChapters(bookId);
    const formulas: Formula[] = buildSampleFormulas(bookId, chapters.map((c) => c.id));
    const flashcards: Flashcard[] = buildSampleFlashcards(bookId, chapters);
    const questions: AnyQuestion[] = buildSampleQuestions(bookId, chapters);
    const mindmap: MindMap = buildSampleMindMap(bookId, chapters);
    const analytics: BookAnalytics = buildSampleAnalytics(bookId, chapters, questions);
    const versions: BookVersion[] = [
      { id: `${bookId}_v1`, versionNumber: 1, createdAt: new Date().toISOString(), createdBy: "developer@examforge.ai", changeSummary: "Initial upload.", sizeBytes: book.sizeBytes, pageCount: book.pageCount, qualityScore: 0, ocrConfidence: 0, isCurrent: true },
    ];

    dispatch({ type: "ADD_BOOK", book, chapters, formulas, flashcards, questions, mindmap, analytics, versions });
    log("upload", "Book Created", `Queued "${book.title}" for AI processing (${formatBytes(file.size)}).`, bookId, book.title);

    let job: ProcessingJob | null = null;
    const shouldStart = options?.autoStart !== false && state.preferences.autoProcessUploads;
    if (shouldStart) {
      job = buildJobFromFile({ fileName: file.name, fileExt: ext, sizeBytes: file.size, pageEstimate: book.pageCount, bookId });
      if (options?.enhancements) {
        job.enhancements = { ...job.enhancements, ...options.enhancements };
      }
      dispatch({ type: "ADD_JOB", job });
      log("ocr", "Pipeline Started", `Running 26-stage AI pipeline for "${book.title}".`, bookId, book.title);
    }

    return { book, job, issues };
  }, [state.ui.selectedExam, state.preferences.autoProcessUploads, log]);

  const deleteBook = useCallback((bookId: string) => {
    const book = state.books.find((b) => b.id === bookId);
    if (!book) return;
    dispatch({ type: "DELETE_BOOK", bookId });
    log("delete", "Book Deleted", `Removed "${book.title}" from library.`, bookId, book.title);
    toast.push("Book deleted", { tone: "warning", detail: book.title });
  }, [state.books, log, toast]);

  const duplicateBook = useCallback((bookId: string) => {
    const book = state.books.find((b) => b.id === bookId);
    if (!book) return;
    dispatch({ type: "DUPLICATE_BOOK", bookId });
    log("edit", "Book Duplicated", `Created copy of "${book.title}".`, bookId, book.title);
    toast.push("Book duplicated", { tone: "success" });
  }, [state.books, log, toast]);

  const cloneBook = useCallback((bookId: string) => {
    const book = state.books.find((b) => b.id === bookId);
    if (!book) return;
    dispatch({ type: "CLONE_BOOK", bookId });
    log("edit", "Book Cloned", `Branched "${book.title}" for experiments.`, bookId, book.title);
    toast.push("Branch created", { tone: "info", detail: book.title });
  }, [state.books, log, toast]);

  const archiveBook = useCallback((bookId: string, archived: boolean) => {
    const book = state.books.find((b) => b.id === bookId);
    if (!book) return;
    dispatch({ type: "ARCHIVE_BOOK", bookId, archived });
    log("edit", "Book Archived", `${archived ? "Archived" : "Restored"} "${book.title}".`, bookId, book.title);
    toast.push(archived ? "Book archived" : "Book restored", { tone: archived ? "warning" : "success" });
  }, [state.books, log, toast]);

  const publishBook = useCallback((bookId: string, published: boolean) => {
    const book = state.books.find((b) => b.id === bookId);
    if (!book) return;
    dispatch({ type: "PUBLISH_BOOK", bookId, published });
    log(published ? "publish" : "edit", published ? "Book Published" : "Book Unpublished", `"${book.title}" is now ${published ? "live in student library" : "a private draft"}.`, bookId, book.title);
    toast.push(published ? "Book published" : "Book unpublished", { tone: published ? "success" : "info" });
  }, [state.books, log, toast]);

  const featureBook = useCallback((bookId: string, featured: boolean) => {
    const book = state.books.find((b) => b.id === bookId);
    if (!book) return;
    dispatch({ type: "FEATURE_BOOK", bookId, featured });
    log("edit", "Book Feature Toggle", `${featured ? "Featured" : "Unfeatured"} "${book.title}".`, bookId, book.title);
  }, [state.books, log]);

  const pinBook = useCallback((bookId: string, pinned: boolean) => {
    dispatch({ type: "PIN_BOOK", bookId, pinned });
  }, []);

  const favoriteBook = useCallback((bookId: string, favorite: boolean) => {
    dispatch({ type: "FAVORITE_BOOK", bookId, favorite });
  }, []);

  const moveBook = useCallback((bookId: string, folder: string) => {
    dispatch({ type: "MOVE_BOOK", bookId, folder });
    log("edit", "Book Moved", `Relocated book to folder "${folder}".`, bookId);
  }, [log]);

  const updateBook = useCallback((bookId: string, patch: Partial<BookMetadata>) => {
    dispatch({ type: "UPDATE_BOOK", bookId, patch });
  }, []);

  // ------- Bulk -------
  const toggleBulkMode = useCallback(() => dispatch({ type: "TOGGLE_BULK_MODE" }), []);
  const setBulkSelected = useCallback((ids: string[]) => dispatch({ type: "SET_BULK_SELECTED", ids }), []);
  const bulkDelete = useCallback(() => {
    const ids = state.ui.bulkSelectedIds;
    if (!ids.length) return;
    dispatch({ type: "BULK_DELETE", bookIds: ids });
    log("delete", "Bulk Delete", `Removed ${ids.length} books from library.`);
    toast.push(`Deleted ${ids.length} books`, { tone: "warning" });
  }, [state.ui.bulkSelectedIds, log, toast]);
  const bulkMove = useCallback((folder: string) => {
    const ids = state.ui.bulkSelectedIds;
    if (!ids.length) return;
    dispatch({ type: "BULK_UPDATE", bookIds: ids, patch: { folder } });
    log("edit", "Bulk Move", `Moved ${ids.length} books to "${folder}".`);
    toast.push(`Moved ${ids.length} books`, { tone: "success" });
  }, [state.ui.bulkSelectedIds, log, toast]);
  const bulkPublish = useCallback((published: boolean) => {
    const ids = state.ui.bulkSelectedIds;
    if (!ids.length) return;
    dispatch({ type: "BULK_UPDATE", bookIds: ids, patch: { status: published ? "ready" : "draft", visibility: published ? "public" : "private" } });
    log(published ? "publish" : "edit", "Bulk Publish Toggle", `${published ? "Published" : "Unpublished"} ${ids.length} books.`);
    toast.push(`${published ? "Published" : "Unpublished"} ${ids.length} books`, { tone: "success" });
  }, [state.ui.bulkSelectedIds, log, toast]);
  const bulkArchive = useCallback((archived: boolean) => {
    const ids = state.ui.bulkSelectedIds;
    if (!ids.length) return;
    dispatch({ type: "BULK_UPDATE", bookIds: ids, patch: { isArchived: archived } });
    log("edit", "Bulk Archive Toggle", `${archived ? "Archived" : "Restored"} ${ids.length} books.`);
    toast.push(`${archived ? "Archived" : "Restored"} ${ids.length} books`, { tone: "success" });
  }, [state.ui.bulkSelectedIds, log, toast]);
  const bulkFeature = useCallback((featured: boolean) => {
    const ids = state.ui.bulkSelectedIds;
    if (!ids.length) return;
    dispatch({ type: "BULK_UPDATE", bookIds: ids, patch: { isFeatured: featured } });
    toast.push(`${featured ? "Featured" : "Unfeatured"} ${ids.length} books`, { tone: "success" });
  }, [state.ui.bulkSelectedIds, toast]);

  // ------- Filters -------
  const setFilters = useCallback((patch: Partial<LibraryFilters>) => dispatch({ type: "SET_FILTER", filter: patch }), []);
  const resetFilters = useCallback(() => dispatch({ type: "RESET_FILTERS" }), []);
  const setView = useCallback((view: LibraryFilters["view"]) => dispatch({ type: "SET_VIEW", view }), []);
  const setSort = useCallback((sortBy: LibraryFilters["sortBy"], sortDir?: LibraryFilters["sortDir"]) => dispatch({ type: "SET_SORT", sortBy, sortDir }), []);

  // ------- Compare -------
  const toggleCompareMode = useCallback(() => dispatch({ type: "TOGGLE_COMPARE_MODE" }), []);
  const setCompareBooks = useCallback((ids: string[]) => dispatch({ type: "SET_COMPARE_BOOKS", ids }), []);
  const toggleCompareBook = useCallback((bookId: string) => {
    const prev = state.ui.compareBookIds;
    if (prev.includes(bookId)) {
      dispatch({ type: "SET_COMPARE_BOOKS", ids: prev.filter((id) => id !== bookId) });
    } else if (prev.length >= 2) {
      dispatch({ type: "SET_COMPARE_BOOKS", ids: [prev[1], bookId] });
    } else {
      dispatch({ type: "SET_COMPARE_BOOKS", ids: [...prev, bookId] });
    }
  }, [state.ui.compareBookIds]);

  // ------- Folders / Tags -------
  const addFolder = useCallback((folder: string) => {
    if (!folder.trim()) return;
    dispatch({ type: "ADD_FOLDER", folder: folder.trim() });
    toast.push(`Folder "${folder}" created`, { tone: "success" });
  }, [toast]);
  const removeFolder = useCallback((folder: string) => {
    dispatch({ type: "REMOVE_FOLDER", folder });
    toast.push(`Folder "${folder}" removed`, { tone: "warning" });
  }, [toast]);
  const addTag = useCallback((tag: string) => {
    if (!tag.trim()) return;
    dispatch({ type: "ADD_TAG", tag: tag.startsWith("#") ? tag : `#${tag}` });
  }, []);

  // ------- Pipeline -------
  const cancelJob = useCallback((jobId: string) => {
    const timers = jobTimers.current.get(jobId);
    if (timers) {
      timers.forEach(clearTimeout);
      jobTimers.current.delete(jobId);
    }
    dispatch({ type: "UPDATE_JOB", jobId, patch: { status: "failed" } });
    const job = state.jobs.find((j) => j.id === jobId);
    if (job) {
      const book = state.books.find((b) => b.id === job.bookId);
      log("ocr", "Pipeline Cancelled", `Cancelled processing for "${book?.title || job.fileName}".`, job.bookId, book?.title);
      toast.push("Pipeline cancelled", { tone: "warning" });
    }
  }, [state.jobs, state.books, log, toast]);

  const startPipeline = useCallback((job: ProcessingJob) => {
    dispatch({ type: "UPDATE_JOB", jobId: job.id, patch: { status: "processing" } });

    const timers: ReturnType<typeof setTimeout>[] = [];
    const baseDelay = 700; // ms per stage

    PIPELINE_STAGE_DEFS.forEach((stage, idx) => {
      const cumulativeDelay = PIPELINE_STAGE_DEFS.slice(0, idx + 1).reduce((s, x) => s + x.baseMs, 0) * 0.4;

      const startTimer = setTimeout(() => {
        dispatch({ type: "UPDATE_JOB_STAGE", jobId: job.id, stageKey: stage.key, patch: { status: "active", startedAt: Date.now() } });
        dispatch({ type: "ADD_JOB_LOG", jobId: job.id, log: { id: nextId("log"), timestamp: Date.now(), level: "info", stage: stage.key, message: `▶ ${stage.label}: ${stage.description}` } });
      }, cumulativeDelay * 0.6);

      const completeTimer = setTimeout(() => {
        dispatch({ type: "UPDATE_JOB_STAGE", jobId: job.id, stageKey: stage.key, patch: { status: "complete", completedAt: Date.now(), progress: 100 } });
        const level: PipelineLog["level"] = stage.key === "ocr_extract" || stage.key === "done" ? "success" : "info";
        dispatch({ type: "ADD_JOB_LOG", jobId: job.id, log: { id: nextId("log"), timestamp: Date.now(), level, stage: stage.key, message: `✓ ${stage.label} complete.` } });
        const progress = Math.round(((idx + 1) / PIPELINE_STAGE_DEFS.length) * 100);
        dispatch({ type: "UPDATE_JOB", jobId: job.id, patch: { overallProgress: progress } });
      }, cumulativeDelay);

      timers.push(startTimer, completeTimer);
    });

    const finishTimer = setTimeout(() => {
      const overall = Math.round(94 + Math.random() * 5);
      const ocrConfidence = Math.round(92 + Math.random() * 7);
      const qualityScore = Math.round(88 + Math.random() * 10);
      dispatch({ type: "UPDATE_JOB", jobId: job.id, patch: { status: "ready", overallProgress: 100, completedAt: new Date().toISOString(), qualityScore: { overall, resolution: 96, ocrConfidence, contrast: qualityScore, sharpness: qualityScore - 2, noise: 100 - qualityScore + 4, skew: 100 } } });
      dispatch({ type: "ADD_JOB_LOG", jobId: job.id, log: { id: nextId("log"), timestamp: Date.now(), level: "success", message: "Pipeline finished. Asset published to library." } });
      // Mark the book as ready and update quality metrics
      const jobData = state.jobs.find((j) => j.id === job.id);
      const bookId = jobData?.bookId || job.bookId;
      dispatch({ type: "UPDATE_BOOK", bookId, patch: { status: "ready", qualityScore: overall, ocrConfidence, pageCount: jobData?.pageEstimate || 100, isFeatured: false, isTrending: true } });
      const book = state.books.find((b) => b.id === bookId);
      log("ocr", "Pipeline Complete", `"${book?.title || job.fileName}" published to library (OCR ${ocrConfidence}%, Quality ${overall}%).`, bookId, book?.title);
      toast.push("Pipeline finished", { tone: "success", detail: `${book?.title || job.fileName} is live in the library.` });
      jobTimers.current.delete(job.id);
    }, PIPELINE_STAGE_DEFS.reduce((s, x) => s + x.baseMs, 0) * 0.4 + 600);
    timers.push(finishTimer);

    jobTimers.current.set(job.id, timers);
  }, [state.jobs, state.books, log, toast]);

  const retryPipeline = useCallback((jobId: string) => {
    const oldJob = state.jobs.find((j) => j.id === jobId);
    if (!oldJob) return;
    cancelJob(jobId);
    const newJob: ProcessingJob = { ...oldJob, id: nextId("job"), status: "queued", overallProgress: 0, retryCount: oldJob.retryCount + 1, stages: oldJob.stages.map((s) => ({ ...s, status: "pending", progress: 0, startedAt: undefined, completedAt: undefined })), logs: [{ id: nextId("log"), timestamp: Date.now(), level: "info", message: `Retry #${oldJob.retryCount + 1} initiated.` }] };
    dispatch({ type: "ADD_JOB", job: newJob });
    log("ocr", "Pipeline Retry", `Re-running pipeline for "${oldJob.fileName}" (attempt ${newJob.retryCount}).`, oldJob.bookId);
    toast.push("Retrying pipeline", { tone: "info" });
    setTimeout(() => startPipeline(newJob), 400);
  }, [state.jobs, cancelJob, startPipeline, log, toast]);

  // ------- Knowledge CRUD -------
  const addChapter = useCallback((bookId: string, chapter: Chapter) => {
    dispatch({ type: "ADD_CHAPTER", bookId, chapter });
    log("ai", "Chapter Added", `New chapter "${chapter.title}" created.`, bookId);
    toast.push("Chapter added", { tone: "success", detail: chapter.title });
  }, [log, toast]);
  const updateChapter = useCallback((bookId: string, chapterId: string, patch: Partial<Chapter>) => {
    dispatch({ type: "UPDATE_CHAPTER", bookId, chapterId, patch });
  }, []);
  const deleteChapter = useCallback((bookId: string, chapterId: string) => {
    dispatch({ type: "DELETE_CHAPTER", bookId, chapterId });
    log("ai", "Chapter Removed", `Chapter deleted.`, bookId);
    toast.push("Chapter removed", { tone: "warning" });
  }, [log, toast]);
  const addFormula = useCallback((bookId: string, formula: Formula) => {
    dispatch({ type: "ADD_FORMULA", bookId, formula });
    toast.push("Formula added", { tone: "success" });
  }, [toast]);
  const deleteFormula = useCallback((bookId: string, formulaId: string) => {
    dispatch({ type: "DELETE_FORMULA", bookId, formulaId });
    toast.push("Formula removed", { tone: "warning" });
  }, [toast]);
  const addFlashcard = useCallback((bookId: string, flashcard: Flashcard) => {
    dispatch({ type: "ADD_FLASHCARD", bookId, flashcard });
    toast.push("Flashcard added", { tone: "success" });
  }, [toast]);
  const updateFlashcard = useCallback((bookId: string, flashcardId: string, patch: Partial<Flashcard>) => {
    dispatch({ type: "UPDATE_FLASHCARD", bookId, flashcardId, patch });
  }, []);
  const deleteFlashcard = useCallback((bookId: string, flashcardId: string) => {
    dispatch({ type: "DELETE_FLASHCARD", bookId, flashcardId });
    toast.push("Flashcard removed", { tone: "warning" });
  }, [toast]);
  const addQuestion = useCallback((bookId: string, question: AnyQuestion) => {
    dispatch({ type: "ADD_QUESTION", bookId, question });
    toast.push("Question added", { tone: "success" });
  }, [toast]);
  const deleteQuestion = useCallback((bookId: string, questionId: string) => {
    dispatch({ type: "DELETE_QUESTION", bookId, questionId });
    toast.push("Question removed", { tone: "warning" });
  }, [toast]);

  // ------- Versions -------
  const addVersion = useCallback((bookId: string, version: BookVersion) => {
    dispatch({ type: "ADD_VERSION", bookId, version });
    log("ai", "New Version", `Version ${version.versionNumber} added: ${version.changeSummary}`, bookId);
  }, [log]);
  const restoreVersion = useCallback((bookId: string, versionId: string) => {
    dispatch({ type: "RESTORE_VERSION", bookId, versionId });
    const version = state.versions.find((v) => v.id === versionId);
    log("ai", "Version Restored", `Restored version ${version?.versionNumber} (${version?.changeSummary}).`, bookId);
    toast.push("Version restored", { tone: "success" });
  }, [state.versions, log, toast]);

  // ------- Downloads -------
  const recordDownload = useCallback((bookId: string, format: DownloadFormat): DownloadRecord => {
    const record: DownloadRecord = {
      id: nextId("dl"),
      bookId,
      format,
      requestedAt: new Date().toISOString(),
      status: "ready",
      fileName: `${format}.${format === "json_export" ? "json" : format === "markdown_export" ? "md" : format.includes("zip") ? "zip" : "pdf"}`,
    };
    dispatch({ type: "ADD_DOWNLOAD", record });
    log("ai", "Download Generated", `Compiled ${format} package.`, bookId);
    return record;
  }, [log]);
  const updateDownload = useCallback((recordId: string, patch: Partial<DownloadRecord>) => {
    dispatch({ type: "UPDATE_DOWNLOAD", recordId, patch });
  }, []);

  // ------- Preferences -------
  const setPreferences = useCallback((patch: Partial<KnowledgeEngineState["preferences"]>) => dispatch({ type: "SET_PREFERENCES", preferences: patch }), []);

  // ------- Reset -------
  const resetAll = useCallback(() => {
    const fresh = buildInitialState();
    dispatch({ type: "INIT", state: fresh });
    toast.push("Engine reset", { tone: "info", detail: "Sample library restored." });
  }, [toast]);

  // Auto-start any queued jobs
  useEffect(() => {
    const queuedJob = state.jobs.find((j) => j.status === "queued");
    if (queuedJob) {
      startPipeline(queuedJob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.jobs.find((j) => j.status === "queued")?.id]);

  const api: EngineApi = useMemo(() => ({
    state,
    dispatch,
    toast,
    setTab,
    setActiveBook,
    setSelectedExam,
    toggleRightSidebar,
    createBookFromFile,
    deleteBook,
    duplicateBook,
    cloneBook,
    archiveBook,
    publishBook,
    featureBook,
    pinBook,
    favoriteBook,
    moveBook,
    updateBook,
    toggleBulkMode,
    setBulkSelected,
    bulkDelete,
    bulkMove,
    bulkPublish,
    bulkArchive,
    bulkFeature,
    setFilters,
    resetFilters,
    setView,
    setSort,
    toggleCompareMode,
    setCompareBooks,
    toggleCompareBook,
    addFolder,
    removeFolder,
    addTag,
    log,
    clearHistory,
    startPipeline,
    cancelPipeline: cancelJob,
    retryPipeline,
    addChapter,
    updateChapter,
    deleteChapter,
    addFormula,
    deleteFormula,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    addQuestion,
    deleteQuestion,
    addVersion,
    restoreVersion,
    recordDownload,
    updateDownload,
    setPreferences,
    resetAll,
  }), [state, toast, setTab, setActiveBook, setSelectedExam, toggleRightSidebar, createBookFromFile, deleteBook, duplicateBook, cloneBook, archiveBook, publishBook, featureBook, pinBook, favoriteBook, moveBook, updateBook, toggleBulkMode, setBulkSelected, bulkDelete, bulkMove, bulkPublish, bulkArchive, bulkFeature, setFilters, resetFilters, setView, setSort, toggleCompareMode, setCompareBooks, toggleCompareBook, addFolder, removeFolder, addTag, log, clearHistory, startPipeline, cancelJob, retryPipeline, addChapter, updateChapter, deleteChapter, addFormula, deleteFormula, addFlashcard, updateFlashcard, deleteFlashcard, addQuestion, deleteQuestion, addVersion, restoreVersion, recordDownload, updateDownload, setPreferences, resetAll]);

  return <EngineContext.Provider value={api}>{children}</EngineContext.Provider>;
}

export function KnowledgeEngineProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <EngineInnerProvider>{children}</EngineInnerProvider>
    </ToastProvider>
  );
}

// Re-export the toast hook from the engine module
export { useToast as useEngineToast };

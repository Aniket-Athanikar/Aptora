/**
 * Knowledge Engine Reducer — single source of truth for all state mutations.
 *
 * Pure functions; each action returns a new state shape. Side effects (local
 * storage writes, notifications) are handled in the hook layer.
 */

import type {
  KnowledgeEngineState,
  BookMetadata,
  ProcessingJob,
  BookVersion,
  Chapter,
  Formula,
  Flashcard,
  AnyQuestion,
  BookAnalytics,
  MindMap,
  DownloadRecord,
  HistoryLog,
  LibraryFilters,
  UIState,
  UserPreferences,
  ImageEnhancements,
  PipelineStage,
  PipelineLog,
  QualityScore,
  BookStatus,
  KnowledgeTabId,
  LibraryViewMode,
  ValidationIssue,
  DownloadFormat,
} from "./types";

import {
  DEFAULT_FOLDERS,
  DEFAULT_TAGS,
  buildSampleBooks,
  buildSampleChapters,
  buildSampleFormulas,
  buildSampleFlashcards,
  buildSampleQuestions,
  buildSampleMindMap,
  buildSampleAnalytics,
  buildSampleVersions,
  buildDefaultStages,
} from "./data";
import { nextId, pickCoverColor, statusToTone } from "./utils";

// ---------------------------------------------------------------------------
// INITIAL STATE
// ---------------------------------------------------------------------------

export const INITIAL_FILTERS: LibraryFilters = {
  search: "",
  folder: "All Books",
  exam: "all",
  status: "all",
  difficulty: "all",
  premium: "all",
  favoritesOnly: false,
  pinnedOnly: false,
  sortBy: "updated",
  sortDir: "desc",
  view: "grid",
};

export const INITIAL_UI: UIState = {
  activeTab: "dashboard",
  activeBookId: null,
  selectedExam: "GATE",
  sidebarOpen: false,
  rightSidebarOpen: true,
  compareMode: false,
  compareBookIds: [],
  bulkMode: false,
  bulkSelectedIds: [],
  fullscreenBookId: null,
  showWizard: false,
};

export const INITIAL_PREFERENCES: UserPreferences = {
  defaultExam: "GATE",
  preferredDifficulty: "intermediate",
  autoProcessUploads: true,
  defaultQaTypes: ["mcq", "truefalse", "short"],
  defaultNotesTemplate: "Detailed Notes",
  themeAccent: "indigo",
  showRightSidebar: true,
  showLineNumbers: true,
  highContrast: false,
  motionReduced: false,
};

export function buildInitialState(): KnowledgeEngineState {
  const sampleBooks = buildSampleBooks();
  const chapters: Record<string, Chapter[]> = {};
  const formulas: Record<string, Formula[]> = {};
  const flashcards: Record<string, Flashcard[]> = {};
  const questions: Record<string, AnyQuestion[]> = {};
  const mindmaps: Record<string, MindMap> = {};
  const analytics: Record<string, BookAnalytics> = {};
  const versions: BookVersion[] = [];

  for (const book of sampleBooks) {
    const ch = buildSampleChapters(book.id);
    chapters[book.id] = ch;
    formulas[book.id] = buildSampleFormulas(book.id, ch.map((c) => c.id));
    flashcards[book.id] = buildSampleFlashcards(book.id, ch);
    const q = buildSampleQuestions(book.id, ch);
    questions[book.id] = q;
    mindmaps[book.id] = buildSampleMindMap(book.id, ch);
    analytics[book.id] = buildSampleAnalytics(book.id, ch, q);
    versions.push(...buildSampleVersions(book.id));
  }

  const history: HistoryLog[] = [
    { id: nextId("log"), timestamp: new Date().toISOString(), category: "system", action: "Engine Initialized", detail: "Knowledge Factory system diagnostics loaded successfully.", actor: "system" },
  ];

  return {
    initialized: true,
    books: sampleBooks,
    versions,
    jobs: [],
    chapters,
    formulas,
    mindmaps,
    flashcards,
    questions,
    analytics,
    downloads: [],
    history,
    filters: INITIAL_FILTERS,
    ui: { ...INITIAL_UI, activeBookId: sampleBooks[0]?.id || null },
    preferences: INITIAL_PREFERENCES,
    folders: [...DEFAULT_FOLDERS],
    tags: [...DEFAULT_TAGS],
  };
}

// ---------------------------------------------------------------------------
// ACTIONS
// ---------------------------------------------------------------------------

export type Action =
  | { type: "INIT"; state: KnowledgeEngineState }
  | { type: "SET_TAB"; tab: KnowledgeTabId }
  | { type: "SET_ACTIVE_BOOK"; bookId: string | null }
  | { type: "SET_SELECTED_EXAM"; exam: string }
  | { type: "SET_FILTER"; filter: Partial<LibraryFilters> }
  | { type: "RESET_FILTERS" }
  | { type: "SET_VIEW"; view: LibraryViewMode }
  | { type: "SET_SORT"; sortBy: LibraryFilters["sortBy"]; sortDir?: LibraryFilters["sortDir"] }
  | { type: "TOGGLE_BULK_MODE" }
  | { type: "SET_BULK_SELECTED"; ids: string[] }
  | { type: "TOGGLE_COMPARE_MODE" }
  | { type: "SET_COMPARE_BOOKS"; ids: string[] }
  | { type: "SET_PREFERENCES"; preferences: Partial<UserPreferences> }
  | { type: "TOGGLE_RIGHT_SIDEBAR" }
  | { type: "TOGGLE_FULLSCREEN_BOOK"; bookId: string | null }
  | { type: "ADD_BOOK"; book: BookMetadata; chapters: Chapter[]; formulas: Formula[]; flashcards: Flashcard[]; questions: AnyQuestion[]; mindmap: MindMap; analytics: BookAnalytics; versions: BookVersion[] }
  | { type: "UPDATE_BOOK"; bookId: string; patch: Partial<BookMetadata> }
  | { type: "DELETE_BOOK"; bookId: string }
  | { type: "DUPLICATE_BOOK"; bookId: string }
  | { type: "CLONE_BOOK"; bookId: string }
  | { type: "ARCHIVE_BOOK"; bookId: string; archived: boolean }
  | { type: "PUBLISH_BOOK"; bookId: string; published: boolean }
  | { type: "FEATURE_BOOK"; bookId: string; featured: boolean }
  | { type: "PIN_BOOK"; bookId: string; pinned: boolean }
  | { type: "FAVORITE_BOOK"; bookId: string; favorite: boolean }
  | { type: "MOVE_BOOK"; bookId: string; folder: string }
  | { type: "BULK_UPDATE"; bookIds: string[]; patch: Partial<BookMetadata> }
  | { type: "BULK_DELETE"; bookIds: string[] }
  | { type: "ADD_JOB"; job: ProcessingJob }
  | { type: "UPDATE_JOB"; jobId: string; patch: Partial<ProcessingJob> }
  | { type: "UPDATE_JOB_STAGE"; jobId: string; stageKey: string; patch: Partial<PipelineStage> }
  | { type: "ADD_JOB_LOG"; jobId: string; log: PipelineLog }
  | { type: "REMOVE_JOB"; jobId: string }
  | { type: "ADD_DOWNLOAD"; record: DownloadRecord }
  | { type: "UPDATE_DOWNLOAD"; recordId: string; patch: Partial<DownloadRecord> }
  | { type: "ADD_HISTORY"; log: HistoryLog }
  | { type: "CLEAR_HISTORY" }
  | { type: "UPDATE_CHAPTER"; bookId: string; chapterId: string; patch: Partial<Chapter> }
  | { type: "ADD_CHAPTER"; bookId: string; chapter: Chapter }
  | { type: "DELETE_CHAPTER"; bookId: string; chapterId: string }
  | { type: "ADD_FORMULA"; bookId: string; formula: Formula }
  | { type: "DELETE_FORMULA"; bookId: string; formulaId: string }
  | { type: "ADD_FLASHCARD"; bookId: string; flashcard: Flashcard }
  | { type: "DELETE_FLASHCARD"; bookId: string; flashcardId: string }
  | { type: "UPDATE_FLASHCARD"; bookId: string; flashcardId: string; patch: Partial<Flashcard> }
  | { type: "ADD_QUESTION"; bookId: string; question: AnyQuestion }
  | { type: "DELETE_QUESTION"; bookId: string; questionId: string }
  | { type: "ADD_TAG"; tag: string }
  | { type: "ADD_FOLDER"; folder: string }
  | { type: "REMOVE_FOLDER"; folder: string }
  | { type: "ADD_VERSION"; bookId: string; version: BookVersion }
  | { type: "RESTORE_VERSION"; bookId: string; versionId: string }
  | { type: "SET_VALIDATION_ISSUES"; bookId: string; issues: ValidationIssue[] }
  | { type: "SET_WIZARD"; show: boolean }
  | { type: "TOAST"; message: string; tone?: "success" | "error" | "info" | "warning" };

// ---------------------------------------------------------------------------
// REDUCER
// ---------------------------------------------------------------------------

export function knowledgeReducer(state: KnowledgeEngineState, action: Action): KnowledgeEngineState {
  switch (action.type) {
    case "INIT":
      return action.state;

    case "SET_TAB":
      return { ...state, ui: { ...state.ui, activeTab: action.tab } };

    case "SET_ACTIVE_BOOK":
      return { ...state, ui: { ...state.ui, activeBookId: action.bookId } };

    case "SET_SELECTED_EXAM":
      return { ...state, ui: { ...state.ui, selectedExam: action.exam } };

    case "SET_FILTER":
      return { ...state, filters: { ...state.filters, ...action.filter } };

    case "RESET_FILTERS":
      return { ...state, filters: INITIAL_FILTERS };

    case "SET_VIEW":
      return { ...state, filters: { ...state.filters, view: action.view } };

    case "SET_SORT":
      return { ...state, filters: { ...state.filters, sortBy: action.sortBy, sortDir: action.sortDir || state.filters.sortDir } };

    case "TOGGLE_BULK_MODE":
      return { ...state, ui: { ...state.ui, bulkMode: !state.ui.bulkMode, bulkSelectedIds: [] } };

    case "SET_BULK_SELECTED":
      return { ...state, ui: { ...state.ui, bulkSelectedIds: action.ids } };

    case "TOGGLE_COMPARE_MODE":
      return { ...state, ui: { ...state.ui, compareMode: !state.ui.compareMode, compareBookIds: [] } };

    case "SET_COMPARE_BOOKS":
      return { ...state, ui: { ...state.ui, compareBookIds: action.ids } };

    case "SET_PREFERENCES":
      return { ...state, preferences: { ...state.preferences, ...action.preferences } };

    case "TOGGLE_RIGHT_SIDEBAR":
      return { ...state, ui: { ...state.ui, rightSidebarOpen: !state.ui.rightSidebarOpen } };

    case "TOGGLE_FULLSCREEN_BOOK":
      return { ...state, ui: { ...state.ui, fullscreenBookId: action.bookId } };

    case "ADD_BOOK":
      return {
        ...state,
        books: [action.book, ...state.books],
        chapters: { ...state.chapters, [action.book.id]: action.chapters },
        formulas: { ...state.formulas, [action.book.id]: action.formulas },
        flashcards: { ...state.flashcards, [action.book.id]: action.flashcards },
        questions: { ...state.questions, [action.book.id]: action.questions },
        mindmaps: { ...state.mindmaps, [action.book.id]: action.mindmap },
        analytics: { ...state.analytics, [action.book.id]: action.analytics },
        versions: [...state.versions, ...action.versions],
        ui: { ...state.ui, activeBookId: action.book.id },
      };

    case "UPDATE_BOOK":
      return {
        ...state,
        books: state.books.map((b) => (b.id === action.bookId ? { ...b, ...action.patch, updatedAt: new Date().toISOString() } : b)),
      };

    case "DELETE_BOOK": {
      const newChapters = { ...state.chapters };
      const newFormulas = { ...state.formulas };
      const newFlashcards = { ...state.flashcards };
      const newQuestions = { ...state.questions };
      const newMindmaps = { ...state.mindmaps };
      const newAnalytics = { ...state.analytics };
      delete newChapters[action.bookId];
      delete newFormulas[action.bookId];
      delete newFlashcards[action.bookId];
      delete newQuestions[action.bookId];
      delete newMindmaps[action.bookId];
      delete newAnalytics[action.bookId];
      return {
        ...state,
        books: state.books.filter((b) => b.id !== action.bookId),
        versions: state.versions.filter((v) => !v.id.startsWith(action.bookId + "_")),
        chapters: newChapters,
        formulas: newFormulas,
        flashcards: newFlashcards,
        questions: newQuestions,
        mindmaps: newMindmaps,
        analytics: newAnalytics,
        ui: { ...state.ui, activeBookId: state.ui.activeBookId === action.bookId ? state.books.find((b) => b.id !== action.bookId)?.id || null : state.ui.activeBookId },
      };
    }

    case "DUPLICATE_BOOK": {
      const original = state.books.find((b) => b.id === action.bookId);
      if (!original) return state;
      const newId = nextId("book");
      const dup: BookMetadata = {
        ...original,
        id: newId,
        title: `${original.title} (Copy)`,
        isPinned: false,
        isFavorite: false,
        coverColor: pickCoverColor(newId),
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        versionNumber: 1,
      };
      const dupVersions: BookVersion[] = [
        { id: nextId("v"), versionNumber: 1, createdAt: new Date().toISOString(), createdBy: "duplicate", changeSummary: `Cloned from ${original.title}`, sizeBytes: original.sizeBytes, pageCount: original.pageCount, qualityScore: original.qualityScore, ocrConfidence: original.ocrConfidence, isCurrent: true },
      ];
      return {
        ...state,
        books: [dup, ...state.books],
        chapters: { ...state.chapters, [newId]: state.chapters[action.bookId]?.map((c) => ({ ...c, id: nextId("ch") })) || [] },
        formulas: { ...state.formulas, [newId]: state.formulas[action.bookId]?.map((f) => ({ ...f, id: nextId("f") })) || [] },
        flashcards: { ...state.flashcards, [newId]: state.flashcards[action.bookId]?.map((f) => ({ ...f, id: nextId("fc") })) || [] },
        questions: { ...state.questions, [newId]: state.questions[action.bookId]?.map((q) => ({ ...q, id: nextId("q") } as AnyQuestion)) || [] },
        mindmaps: { ...state.mindmaps, [newId]: state.mindmaps[action.bookId] ? { ...state.mindmaps[action.bookId], id: newId, bookId: newId } : state.mindmaps[newId] },
        analytics: { ...state.analytics, [newId]: state.analytics[action.bookId] ? { ...state.analytics[action.bookId], bookId: newId } : state.analytics[newId] },
        versions: [...state.versions, ...dupVersions],
        ui: { ...state.ui, activeBookId: newId },
      };
    }

    case "CLONE_BOOK": {
      // Clone = Deep duplicate (separate AI / metadata IDs), used for branching experiments
      return knowledgeReducer(state, { type: "DUPLICATE_BOOK", bookId: action.bookId });
    }

    case "ARCHIVE_BOOK":
      return { ...state, books: state.books.map((b) => b.id === action.bookId ? { ...b, isArchived: action.archived, status: action.archived ? "archived" as BookStatus : b.status, updatedAt: new Date().toISOString() } : b) };

    case "PUBLISH_BOOK":
      return { ...state, books: state.books.map((b) => b.id === action.bookId ? { ...b, status: action.published ? "ready" as BookStatus : "draft" as BookStatus, visibility: action.published ? "public" : "private", publishedAt: action.published ? new Date().toISOString() : undefined, updatedAt: new Date().toISOString() } : b) };

    case "FEATURE_BOOK":
      return { ...state, books: state.books.map((b) => b.id === action.bookId ? { ...b, isFeatured: action.featured, updatedAt: new Date().toISOString() } : b) };

    case "PIN_BOOK":
      return { ...state, books: state.books.map((b) => b.id === action.bookId ? { ...b, isPinned: action.pinned, updatedAt: new Date().toISOString() } : b) };

    case "FAVORITE_BOOK":
      return { ...state, books: state.books.map((b) => b.id === action.bookId ? { ...b, isFavorite: action.favorite, updatedAt: new Date().toISOString() } : b) };

    case "MOVE_BOOK":
      return { ...state, books: state.books.map((b) => b.id === action.bookId ? { ...b, folder: action.folder, updatedAt: new Date().toISOString() } : b) };

    case "BULK_UPDATE":
      return {
        ...state,
        books: state.books.map((b) => action.bookIds.includes(b.id) ? { ...b, ...action.patch, updatedAt: new Date().toISOString() } : b),
      };

    case "BULK_DELETE": {
      const newChapters = { ...state.chapters };
      const newFormulas = { ...state.formulas };
      const newFlashcards = { ...state.flashcards };
      const newQuestions = { ...state.questions };
      const newMindmaps = { ...state.mindmaps };
      const newAnalytics = { ...state.analytics };
      action.bookIds.forEach((id) => {
        delete newChapters[id];
        delete newFormulas[id];
        delete newFlashcards[id];
        delete newQuestions[id];
        delete newMindmaps[id];
        delete newAnalytics[id];
      });
      return {
        ...state,
        books: state.books.filter((b) => !action.bookIds.includes(b.id)),
        versions: state.versions.filter((v) => !action.bookIds.some((id) => v.id.startsWith(id + "_"))),
        chapters: newChapters,
        formulas: newFormulas,
        flashcards: newFlashcards,
        questions: newQuestions,
        mindmaps: newMindmaps,
        analytics: newAnalytics,
        ui: { ...state.ui, bulkMode: false, bulkSelectedIds: [], activeBookId: action.bookIds.includes(state.ui.activeBookId || "") ? state.books.find((b) => !action.bookIds.includes(b.id))?.id || null : state.ui.activeBookId },
      };
    }

    case "ADD_JOB":
      return { ...state, jobs: [action.job, ...state.jobs] };

    case "UPDATE_JOB":
      return { ...state, jobs: state.jobs.map((j) => (j.id === action.jobId ? { ...j, ...action.patch } : j)) };

    case "UPDATE_JOB_STAGE": {
      return {
        ...state,
        jobs: state.jobs.map((j) => {
          if (j.id !== action.jobId) return j;
          return {
            ...j,
            stages: j.stages.map((s) => (s.key === action.stageKey ? { ...s, ...action.patch } : s)),
          };
        }),
      };
    }

    case "ADD_JOB_LOG":
      return {
        ...state,
        jobs: state.jobs.map((j) => (j.id === action.jobId ? { ...j, logs: [...j.logs, action.log] } : j)),
      };

    case "REMOVE_JOB":
      return { ...state, jobs: state.jobs.filter((j) => j.id !== action.jobId) };

    case "ADD_DOWNLOAD":
      return { ...state, downloads: [action.record, ...state.downloads].slice(0, 50) };

    case "UPDATE_DOWNLOAD":
      return { ...state, downloads: state.downloads.map((d) => (d.id === action.recordId ? { ...d, ...action.patch } : d)) };

    case "ADD_HISTORY":
      return { ...state, history: [action.log, ...state.history].slice(0, 200) };

    case "CLEAR_HISTORY":
      return { ...state, history: [] };

    case "UPDATE_CHAPTER":
      return { ...state, chapters: { ...state.chapters, [action.bookId]: (state.chapters[action.bookId] || []).map((c) => c.id === action.chapterId ? { ...c, ...action.patch } : c) } };

    case "ADD_CHAPTER":
      return { ...state, chapters: { ...state.chapters, [action.bookId]: [...(state.chapters[action.bookId] || []), action.chapter] } };

    case "DELETE_CHAPTER":
      return { ...state, chapters: { ...state.chapters, [action.bookId]: (state.chapters[action.bookId] || []).filter((c) => c.id !== action.chapterId) } };

    case "ADD_FORMULA":
      return { ...state, formulas: { ...state.formulas, [action.bookId]: [...(state.formulas[action.bookId] || []), action.formula] } };

    case "DELETE_FORMULA":
      return { ...state, formulas: { ...state.formulas, [action.bookId]: (state.formulas[action.bookId] || []).filter((f) => f.id !== action.formulaId) } };

    case "ADD_FLASHCARD":
      return { ...state, flashcards: { ...state.flashcards, [action.bookId]: [...(state.flashcards[action.bookId] || []), action.flashcard] } };

    case "DELETE_FLASHCARD":
      return { ...state, flashcards: { ...state.flashcards, [action.bookId]: (state.flashcards[action.bookId] || []).filter((f) => f.id !== action.flashcardId) } };

    case "UPDATE_FLASHCARD":
      return { ...state, flashcards: { ...state.flashcards, [action.bookId]: (state.flashcards[action.bookId] || []).map((f) => f.id === action.flashcardId ? { ...f, ...action.patch } : f) } };

    case "ADD_QUESTION":
      return { ...state, questions: { ...state.questions, [action.bookId]: [...(state.questions[action.bookId] || []), action.question] } };

    case "DELETE_QUESTION":
      return { ...state, questions: { ...state.questions, [action.bookId]: (state.questions[action.bookId] || []).filter((q) => q.id !== action.questionId) } };

    case "ADD_TAG":
      if (state.tags.includes(action.tag)) return state;
      return { ...state, tags: [...state.tags, action.tag] };

    case "ADD_FOLDER":
      if (state.folders.includes(action.folder)) return state;
      return { ...state, folders: [...state.folders, action.folder] };

    case "REMOVE_FOLDER":
      return { ...state, folders: state.folders.filter((f) => f !== action.folder && f !== "All Books") };

    case "ADD_VERSION":
      return { ...state, versions: [...state.versions, action.version] };

    case "RESTORE_VERSION": {
      const version = state.versions.find((v) => v.id === action.versionId);
      if (!version) return state;
      return {
        ...state,
        versions: state.versions.map((v) => (v.bookId?.startsWith(action.bookId) || v.id.startsWith(action.bookId + "_")) ? { ...v, isCurrent: v.id === action.versionId } : v),
        books: state.books.map((b) => b.id === action.bookId ? { ...b, versionNumber: version.versionNumber, versionId: version.id, pageCount: version.pageCount, sizeBytes: version.sizeBytes, qualityScore: version.qualityScore, ocrConfidence: version.ocrConfidence, updatedAt: new Date().toISOString() } : b),
      };
    }

    case "SET_VALIDATION_ISSUES":
      return state; // noop (validation is transient UI state)

    case "SET_WIZARD":
      return { ...state, ui: { ...state.ui, showWizard: action.show } };

    case "TOAST":
      return state; // Toast is handled outside the reducer (singleton)

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

export function buildJobFromFile(opts: { fileName: string; fileExt: string; sizeBytes: number; pageEstimate: number; bookId: string; ocrEngine?: ProcessingJob["ocrEngine"]; aiModel?: ProcessingJob["aiModel"]; }): ProcessingJob {
  const id = nextId("job");
  const now = Date.now();
  const stages = buildDefaultStages();
  return {
    id,
    bookId: opts.bookId,
    fileName: opts.fileName,
    fileExt: opts.fileExt,
    sizeBytes: opts.sizeBytes,
    pageEstimate: opts.pageEstimate,
    status: "queued",
    overallProgress: 0,
    startedAt: new Date(now).toISOString(),
    stages,
    enhancements: { brightness: 100, contrast: 100, sharpness: 100, noise: 0, saturation: 100, rotation: 0, skew: 0, blur: 1, qeledBoost: 50 },
    qualityScore: { overall: 0, resolution: 0, ocrConfidence: 0, contrast: 0, sharpness: 0, noise: 0, skew: 0 },
    logs: [{ id: nextId("log"), timestamp: now, level: "info", message: `Job initialized for "${opts.fileName}".` }],
    warnings: [],
    errors: [],
    ocrEngine: opts.ocrEngine || "mock",
    aiModel: opts.aiModel || "mock",
    retryCount: 0,
  };
}

export function logHelper(category: HistoryLog["category"], action: string, detail: string, bookId?: string, bookTitle?: string): HistoryLog {
  return {
    id: nextId("log"),
    timestamp: new Date().toISOString(),
    category,
    action,
    detail,
    bookId,
    bookTitle,
    actor: "developer",
  };
}

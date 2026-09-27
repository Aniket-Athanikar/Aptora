/**
 * Aptora — Knowledge Engine
 * Type definitions for the Book Processing + OCR + AI Knowledge Engine module.
 *
 * This module is the SINGLE entry point for all study material that flows
 * into Aptora. Uploaded books become AI Notes, Flashcards, MCQs, Mind
 * Maps, Revision Sheets, Analytics, and Downloadable PDFs.
 */

// ---------------------------------------------------------------------------
// BOOK / ASSET
// ---------------------------------------------------------------------------

export type BookStatus = "draft" | "queued" | "processing" | "ready" | "failed" | "archived";
export type BookVisibility = "public" | "private" | "unlisted";
export type BookPremium = "free" | "premium" | "enterprise";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type ContentType = "textbook" | "notes" | "paper" | "guide" | "manual" | "reference";

export interface BookVersion {
  id: string;
  bookId?: string;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  changeSummary: string;
  sizeBytes: number;
  pageCount: number;
  qualityScore: number;
  ocrConfidence: number;
  parentVersionId?: string;
  isCurrent: boolean;
}

export interface BookMetadata {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  publisher: string;
  edition: string;
  publicationYear: string;
  language: string;
  isbn?: string;
  description?: string;
  examCategory: string;
  examName: string;
  examCode?: string;
  subjects: string[];
  difficulty: DifficultyLevel;
  tags: string[];
  contentType: ContentType;
  // status flags
  status: BookStatus;
  visibility: BookVisibility;
  premium: BookPremium;
  isFeatured: boolean;
  isTrending: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  // counts
  pageCount: number;
  sizeBytes: number;
  // ai metrics
  qualityScore: number;
  ocrConfidence: number;
  readingTimeMinutes: number;
  // versioning
  versionId: string;
  versionNumber: number;
  // files
  coverColor: string;
  fileExt: string;
  originalFileName: string;
  // folders
  folder: string;
  // timestamps
  uploadedAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// ---------------------------------------------------------------------------
// OCR / IMAGE QUALITY
// ---------------------------------------------------------------------------

export interface ImageEnhancements {
  brightness: number;
  contrast: number;
  sharpness: number;
  noise: number;
  saturation: number;
  rotation: number;
  skew: number;
  blur: number;
  qeledBoost: number;
}

export interface QualityScore {
  overall: number;
  resolution: number;
  ocrConfidence: number;
  contrast: number;
  sharpness: number;
  noise: number;
  skew: number;
}

export type PipelineStageKey =
  | "upload_validation"
  | "image_analysis"
  | "deskew"
  | "denoise"
  | "rotate"
  | "brightness"
  | "contrast"
  | "sharpen"
  | "qeled_boost"
  | "ocr_extract"
  | "layout_parse"
  | "table_extract"
  | "formula_detect"
  | "diagram_detect"
  | "heading_detect"
  | "chapter_segment"
  | "topic_cluster"
  | "question_detect"
  | "answer_detect"
  | "summary_gen"
  | "notes_gen"
  | "flashcard_gen"
  | "mcq_gen"
  | "mindmap_gen"
  | "analytics_gen"
  | "done";

export interface PipelineStage {
  key: PipelineStageKey;
  label: string;
  description: string;
  icon: string;
  status: "pending" | "active" | "complete" | "failed";
  startedAt?: number;
  completedAt?: number;
  progress: number;
  metrics?: Record<string, number | string>;
}

export interface ProcessingJob {
  id: string;
  bookId: string;
  fileName: string;
  fileExt: string;
  sizeBytes: number;
  pageEstimate: number;
  status: BookStatus;
  overallProgress: number;
  startedAt: string;
  estimatedFinishAt?: string;
  completedAt?: string;
  stages: PipelineStage[];
  enhancements: ImageEnhancements;
  qualityScore: QualityScore;
  logs: PipelineLog[];
  warnings: string[];
  errors: string[];
  ocrEngine: "tesseract" | "paddleocr" | "azure" | "google" | "mock";
  aiModel: "gpt-4o" | "claude" | "gemini" | "mock";
  retryCount: number;
}

export interface PipelineLog {
  id: string;
  timestamp: number;
  level: "info" | "warn" | "error" | "debug" | "success";
  stage?: string;
  message: string;
}

// ---------------------------------------------------------------------------
// KNOWLEDGE
// ---------------------------------------------------------------------------

export interface Chapter {
  id: string;
  index: number;
  title: string;
  summary: string;
  topics: string[];
  notes: string;
  learningObjectives: string[];
  weightage: number;
  pageStart: number;
  pageEnd: number;
  estimatedReadingMinutes: number;
  difficulty: DifficultyLevel;
  keyPoints: string[];
  definitions: { term: string; meaning: string }[];
  importantFacts: string[];
  memoryTricks: string[];
}

export interface Formula {
  id: string;
  title: string;
  equation: string;
  description: string;
  chapterId: string;
  tags: string[];
  difficulty: DifficultyLevel;
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  parentId?: string;
  x: number;
  y: number;
  level: number;
  color: string;
}

export interface MindMap {
  id: string;
  bookId: string;
  rootLabel: string;
  nodes: MindMapNode[];
}

// ---------------------------------------------------------------------------
// QUESTIONS
// ---------------------------------------------------------------------------

export type QuestionType = "mcq" | "truefalse" | "fillblank" | "short" | "long" | "interview" | "case" | "scenario" | "pyq";
export type QuestionDifficulty = DifficultyLevel;

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  answer?: string;
  explanation?: string;
  chapterId: string;
  topic: string;
  difficulty: QuestionDifficulty;
  weightage: number;
  pyqYear?: number;
  pyqSource?: string;
  tags: string[];
  createdAt: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq";
  options: string[];
  answerIndex: number;
  selectedAnswer?: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "truefalse";
  correctValue: boolean;
  userAnswer?: boolean;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: "fillblank";
  blanks: string[];
  userAnswer?: string[];
}

export interface ShortQuestion extends BaseQuestion {
  type: "short";
  expectedKeywords: string[];
  sampleAnswerPoints: string[];
  userAnswer?: string;
  evaluationScore?: number;
}

export interface LongQuestion extends BaseQuestion {
  type: "long";
  expectedStructure: string[];
  marks: number;
  userAnswer?: string;
  evaluationScore?: number;
}

export interface InterviewQuestion extends BaseQuestion {
  type: "interview";
  followUps: string[];
  panelTips: string[];
}

export interface CaseStudyQuestion extends BaseQuestion {
  type: "case";
  caseStudy: string;
  subQuestions: string[];
}

export interface ScenarioQuestion extends BaseQuestion {
  type: "scenario";
  scenario: string;
  decisionPoints: string[];
}

export interface PYQQuestion extends BaseQuestion {
  type: "pyq";
  year: number;
  source: string;
  marks: number;
  frequency: number;
}

export type AnyQuestion =
  | MCQQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | ShortQuestion
  | LongQuestion
  | InterviewQuestion
  | CaseStudyQuestion
  | ScenarioQuestion
  | PYQQuestion;

export type FlashcardLevel = "easy" | "good" | "hard" | "unrated";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  chapterId: string;
  topic: string;
  level: FlashcardLevel;
  reviewCount: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  tags: string[];
}

// ---------------------------------------------------------------------------
// ANALYTICS
// ---------------------------------------------------------------------------

export interface BookAnalytics {
  bookId: string;
  totalPages: number;
  totalChapters: number;
  totalTopics: number;
  totalQuestions: number;
  totalFlashcards: number;
  totalFormulas: number;
  estimatedReadingMinutes: number;
  estimatedRevisionMinutes: number;
  topicDistribution: { topic: string; weightage: number; pages: number; questions: number }[];
  chapterWeightage: { chapterId: string; title: string; weightage: number; questions: number; pyqFrequency: number }[];
  difficultyScore: number;
  examReadiness: number;
  confidencePrediction: number;
  learningCurve: { day: number; mastery: number; retention: number }[];
  pyqFrequency: { year: number; count: number }[];
  questionDifficultyBreakdown: { easy: number; medium: number; hard: number };
  studyTimeRecommendation: { daily: number; weekly: number; total: number };
}

// ---------------------------------------------------------------------------
// VALIDATION
// ---------------------------------------------------------------------------

export type ValidationCode =
  | "DUPLICATE_FILE"
  | "CORRUPTED_PDF"
  | "WRONG_FORMAT"
  | "LARGE_FILE_WARNING"
  | "MISSING_METADATA"
  | "BLANK_PAGES"
  | "LOW_RESOLUTION"
  | "OCR_CONFIDENCE_WARNING"
  | "IMAGE_QUALITY_WARNING"
  | "MISSING_COVER"
  | "LANGUAGE_DETECTION"
  | "ENCRYPTED_PDF"
  | "UNSUPPORTED_EXTENSION"
  | "STORAGE_LIMIT"
  | "OUTDATED_VERSION";

export type ValidationSeverity = "info" | "warning" | "error" | "critical";

export interface ValidationIssue {
  code: ValidationCode;
  severity: ValidationSeverity;
  message: string;
  suggestion?: string;
}

// ---------------------------------------------------------------------------
// DOWNLOADS
// ---------------------------------------------------------------------------

export type DownloadFormat =
  | "original_pdf"
  | "ocr_pdf"
  | "ai_notes_pdf"
  | "one_page_notes_pdf"
  | "revision_pdf"
  | "formula_pdf"
  | "mindmap_pdf"
  | "flashcards_pdf"
  | "analytics_report_pdf"
  | "question_bank_pdf"
  | "zip_package"
  | "json_export"
  | "markdown_export";

export interface DownloadRecord {
  id: string;
  bookId: string;
  format: DownloadFormat;
  requestedAt: string;
  completedAt?: string;
  status: "queued" | "building" | "ready" | "failed";
  fileName: string;
  sizeBytes?: number;
}

// ---------------------------------------------------------------------------
// HISTORY
// ---------------------------------------------------------------------------

export interface HistoryLog {
  id: string;
  timestamp: string;
  category: "upload" | "ocr" | "ai" | "edit" | "delete" | "publish" | "system";
  action: string;
  detail: string;
  bookId?: string;
  bookTitle?: string;
  actor?: string;
}

// ---------------------------------------------------------------------------
// UI / FILTERS / PREFERENCES
// ---------------------------------------------------------------------------

export type KnowledgeTabId =
  | "dashboard"
  | "exams"
  | "upload"
  | "quality"
  | "pipeline"
  | "library"
  | "knowledge"
  | "qa"
  | "analytics"
  | "downloads"
  | "versions";

export type LibraryViewMode = "grid" | "list" | "table";
export type LibrarySortBy = "title" | "updated" | "created" | "score" | "pages" | "size";

export interface LibraryFilters {
  search: string;
  folder: string;
  exam: string;
  status: BookStatus | "all";
  difficulty: DifficultyLevel | "all";
  premium: BookPremium | "all";
  favoritesOnly: boolean;
  pinnedOnly: boolean;
  sortBy: LibrarySortBy;
  sortDir: "asc" | "desc";
  view: LibraryViewMode;
}

export interface UIState {
  activeTab: KnowledgeTabId;
  activeBookId: string | null;
  selectedExam: string;
  sidebarOpen: boolean;
  rightSidebarOpen: boolean;
  compareMode: boolean;
  compareBookIds: string[];
  bulkMode: boolean;
  bulkSelectedIds: string[];
  fullscreenBookId: string | null;
  showWizard: boolean;
}

export interface UserPreferences {
  defaultExam: string;
  preferredDifficulty: DifficultyLevel;
  autoProcessUploads: boolean;
  defaultQaTypes: QuestionType[];
  defaultNotesTemplate: string;
  themeAccent: "indigo" | "violet" | "amber" | "rose" | "emerald" | "sky";
  showRightSidebar: boolean;
  showLineNumbers: boolean;
  highContrast: boolean;
  motionReduced: boolean;
}

// ---------------------------------------------------------------------------
// COMBINED ENGINE STATE
// ---------------------------------------------------------------------------

export interface KnowledgeEngineState {
  initialized: boolean;
  books: BookMetadata[];
  versions: BookVersion[];
  jobs: ProcessingJob[];
  chapters: Record<string, Chapter[]>;
  formulas: Record<string, Formula[]>;
  mindmaps: Record<string, MindMap>;
  flashcards: Record<string, Flashcard[]>;
  questions: Record<string, AnyQuestion[]>;
  analytics: Record<string, BookAnalytics>;
  downloads: DownloadRecord[];
  history: HistoryLog[];
  filters: LibraryFilters;
  ui: UIState;
  preferences: UserPreferences;
  folders: string[];
  tags: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  liked?: boolean;
  disliked?: boolean;
  bookmarked?: boolean;
  notesSaved?: boolean;
  flashcardsCount?: number;
  mindMapUrl?: string;
  imageUrl?: string;
  files?: Array<{ name: string; type: string; size: number; url?: string }>;
  sourceInfo?: {
    bookTitle: string;
    chapter: string;
    pages: string;
  };
  requestId?: string;
  latency?: number;
  tokens?: { input: number; output: number; total: number };
  configuredBudgets?: { context: number; history: number; output: number };
  actualBudgets?: { context: number; history: number };
}

export interface BookMetadata {
  id: string;
  name: string;
  coverColor: string;
  pages: number;
  language: string;
  ocrStatus: "idle" | "uploading" | "ocr" | "understanding" | "chapters" | "notes" | "graph" | "completed";
  ocrProgress: number;
  aiStatus: string;
  conceptCount: number;
  readingTime: string;
  confidence: number;
  chapters: string[];
  author?: string;
  uploadedDate?: string;
  size?: string;
  resourceType?: "Book" | "PDF" | "Note" | "PYQ" | "Syllabus";
  subjectId?: string;
}

export interface ResourceChunk {
  id: string;
  chunkIndex: number;
  text: string;
  pageNumber: number;
  topic: string;
  chapter: string;
  vectorId?: string;
}

export interface ResourceItem {
  id: string;
  subjectId: string;
  title: string;
  type: "Book" | "PDF" | "Note" | "PYQ" | "Syllabus";
  author?: string;
  pages: number;
  size: string;
  uploadDate: string;
  fileUrl?: string;
  coverColor?: string;
  chapters: string[];
  chunksCount: number;
  vectorStatus: "Indexed" | "Processing" | "Pending";
}

export interface SubjectNode {
  id: string;
  name: string;
  category: "Prelims" | "Mains" | "Interview" | "General";
  subCategory?: string; // GS Paper I, CSAT, GS I, GS II, etc.
  resourceCount: number;
  iconName: string;
  color: string;
  description?: string;
}

export interface GoalWorkspace {
  id: string;
  title: string; // e.g., "Workspace 1 (UPSC CSE)"
  examName: string; // e.g., "UPSC CSE", "JEE Main", "NEET"
  description: string;
  isDefault?: boolean;
  subjects: SubjectNode[];
  resources: ResourceItem[];
}

export interface Conversation {
  id: string;
  title: string;
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  group: "recent" | "pinned" | "books" | "today" | "uploads";
  color?: string; // Color identifier for active highlights
  bookId?: string;
  subjectId?: string;
  resourceId?: string;
  lastMessageAt: string;
  messages: ChatMessage[];
}

export interface WorkspaceState {
  conversations: Conversation[];
  activeConversationId: string;
  isStreaming: boolean;
  thinkingStage: "thinking" | "reading" | "analyzing" | "notes" | "knowledge" | "done" | null;
  uploads: BookMetadata[];
  activeBookId: string | null;
  studyGoal: {
    todayGoal: string;
    streak: number;
    studyTimeMinutes: number;
    examCountdownDays: number;
    weeklyProgress: number; // percentage
  };
  promptHistory: string[];
  settings?: {
    libraryZoom: number;
    themeColor: string;
  };
}
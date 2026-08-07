"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ChatMessage,
  BookMetadata,
  Conversation,
  WorkspaceState,
  GoalWorkspace,
  SubjectNode,
  ResourceItem
} from "./types";
import { backendService, type Resource as BackendResource, type SubjectDocuments } from "@/services/backend.service";

interface WorkspaceContextProps {
  conversations: Conversation[];
  activeConversationId: string;
  isStreaming: boolean;
  thinkingStage: "thinking" | "reading" | "analyzing" | "notes" | "knowledge" | "done" | null;
  uploads: BookMetadata[];
  activeBookId: string | null;
  studyGoal: WorkspaceState["studyGoal"];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeConversation: Conversation | undefined;
  activeBook: BookMetadata | undefined;

  // Workspaces Data Structure (Exam Tree & CRUD)
  workspaces: GoalWorkspace[];
  activeWorkspaceId: string;
  activeWorkspace: GoalWorkspace | undefined;
  setActiveWorkspaceId: (id: string) => void;
  createWorkspace: (title: string, examName: string, description: string) => void;
  updateWorkspace: (id: string, updates: Partial<GoalWorkspace>) => void;
  deleteWorkspace: (id: string) => void;
  addSubjectToWorkspace: (workspaceId: string, subject: Omit<SubjectNode, "id">) => void;
  deleteSubjectFromWorkspace: (workspaceId: string, subjectId: string) => void;
  addResourceToSubject: (resource: Omit<ResourceItem, "id">) => void;
  deleteResource: (workspaceId: string, resourceId: string) => void;

  // 5-Step AI Flow State Navigation
  flowStep: 1 | 2 | 3 | 4 | 5;
  selectedSubjectId: string | null;
  selectedResourceType: "Book" | "PDF" | "Note" | "PYQ" | "Syllabus" | null;
  selectedResourceId: string | null;

  setFlowStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  selectSubject: (subjectId: string) => void;
  selectResourceType: (type: "Book" | "PDF" | "Note" | "PYQ" | "Syllabus") => void;
  selectResource: (resourceId: string) => void;
  resetFlow: () => void;
  beginNewStudySession: () => void;
  startChatWithResource: (resourceId: string) => void;

  // Actions
  setActiveConversationId: (id: string) => void;
  createNewChat: (title?: string, bookId?: string, resourceId?: string) => string;
  sendMessage: (text: string, files?: Array<{ name: string; type: string; size: number }>) => Promise<void>;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  togglePinConversation: (id: string) => void;
  toggleFavoriteConversation: (id: string) => void;
  toggleArchiveConversation: (id: string) => void;
  setConversationColor: (id: string, color: string) => void;

  // File Upload
  uploadFile: (file: File) => Promise<void>;
  refreshResources: () => Promise<void>;

  // AI Actions
  triggerQuickAction: (actionType: string) => void;
  regenerateLastMessage: () => void;
  toggleMessageBookmark: (messageId: string) => void;
  toggleMessageLike: (messageId: string, type: "like" | "dislike") => void;

  // Zoom & Theme Settings
  libraryZoom: number;
  setLibraryZoom: (zoom: number) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

// Initial Goal Workspaces Hierarchy (UPSC CSE, JEE, NEET)
const INITIAL_WORKSPACES: GoalWorkspace[] = [
  {
    id: "ws-upsc",
    title: "Workspace 1 (UPSC CSE)",
    examName: "UPSC CSE",
    description: "Civil Services Examination preparation workspace covering Prelims, Mains, and Interview.",
    isDefault: true,
    subjects: [
      { id: "subj-polity", name: "Polity & Governance", category: "Prelims", subCategory: "GS Paper I", resourceCount: 88, iconName: "Building2", color: "from-purple-500 to-indigo-600", description: "Indian Constitution, Political System & Governance" },
      { id: "subj-history", name: "Modern History", category: "Prelims", subCategory: "GS Paper I", resourceCount: 120, iconName: "Landmark", color: "from-amber-500 to-orange-600", description: "Ancient, Medieval, Modern & World History" },
      { id: "subj-geography", name: "Geography", category: "Prelims", subCategory: "GS Paper I", resourceCount: 112, iconName: "Globe", color: "from-emerald-500 to-teal-600", description: "Physical, Human & Economic Geography" },
      { id: "subj-economy", name: "Economy", category: "Prelims", subCategory: "GS Paper I", resourceCount: 55, iconName: "Coins", color: "from-blue-500 to-cyan-600", description: "Macroeconomics, Budgeting, Banking & Growth" },
      { id: "subj-gsiv", name: "Ethics & Integrity", category: "Mains", subCategory: "GS IV", resourceCount: 40, iconName: "Scale", color: "from-amber-500 to-red-500", description: "Ethics, Integrity, Aptitude & Case Studies" },
    ],
    resources: [
      {
        id: "res-laxmikanth",
        subjectId: "subj-polity",
        title: "Indian Polity by M. Laxmikanth (6th Ed)",
        type: "Book",
        author: "M. Laxmikanth",
        pages: 245,
        size: "28.4 MB",
        uploadDate: "12 May 2024",
        coverColor: "from-purple-600 to-indigo-700",
        chapters: ["1. The Constitution", "1.1 Salient Features", "1.2 Preamble", "1.3 Fundamental Rights", "1.4 Directive Principles", "1.5 Fundamental Duties"],
        chunksCount: 412,
        vectorStatus: "Indexed"
      },
      {
        id: "res-bareact",
        subjectId: "subj-polity",
        title: "Constitution of India - Bare Act",
        type: "Book",
        author: "Government of India",
        pages: 128,
        size: "14.2 MB",
        uploadDate: "20 Apr 2024",
        coverColor: "from-purple-500 to-pink-600",
        chapters: ["Preamble", "Part I: The Union & Its Territory", "Part II: Citizenship", "Part III: Fundamental Rights"],
        chunksCount: 195,
        vectorStatus: "Indexed"
      },
      {
        id: "res-polity-pyq-2023",
        subjectId: "subj-polity",
        title: "UPSC Prelims Polity 10-Year PYQs (2014-2024)",
        type: "PYQ",
        author: "ExamForge PYQ Bank",
        pages: 42,
        size: "4.8 MB",
        uploadDate: "01 Feb 2026",
        coverColor: "from-rose-500 to-purple-600",
        chapters: ["Constitutional Amendments PYQs", "Fundamental Rights PYQs", "Judiciary PYQs"],
        chunksCount: 88,
        vectorStatus: "Indexed"
      }
    ]
  },
  {
    id: "ws-jee",
    title: "Workspace 2 (JEE Advanced)",
    examName: "JEE Advanced",
    description: "Joint Entrance Examination engineering prep workspace.",
    isDefault: false,
    subjects: [
      { id: "subj-jee-physics", name: "Physics Mechanics", category: "General", resourceCount: 65, iconName: "Zap", color: "from-blue-500 to-indigo-600", description: "Mechanics, Electrodynamics & Modern Physics" }
    ],
    resources: [
      {
        id: "res-hc-verma",
        subjectId: "subj-jee-physics",
        title: "Concepts of Physics - Vol 1 (H.C. Verma)",
        type: "Book",
        author: "H.C. Verma",
        pages: 460,
        size: "32.0 MB",
        uploadDate: "02 Jan 2026",
        coverColor: "from-blue-600 to-cyan-600",
        chapters: ["Rest and Motion", "Newton's Laws of Motion", "Work and Energy"],
        chunksCount: 610,
        vectorStatus: "Indexed"
      }
    ]
  }
];

const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    title: "Indian Polity - Fundamental Rights RAG Chat",
    pinned: true,
    favorite: true,
    archived: false,
    group: "pinned",
    color: "purple",
    resourceId: "res-laxmikanth",
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    messages: [
      {
        id: "m1",
        sender: "user",
        text: "Explain Article 21 and key supreme court landmark judgments.",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "m2",
        sender: "ai",
        text: "### Article 21: Protection of Life and Personal Liberty\n\nArticle 21 states that no person shall be deprived of his life or personal liberty except according to procedure established by law.\n\n#### Landmark Supreme Court Judgments:\n1. **A.K. Gopalan Case (1950)**: Narrow interpretation of 'procedure established by law'.\n2. **Maneka Gandhi Case (1978)**: Introduced the concept of 'Due Process of Law' and fundamental dignity.\n3. **K.S. Puttaswamy Case (2017)**: Unanimously declared Right to Privacy as a fundamental right under Article 21.",
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        confidence: "High",
        sources: [
          {
            document_title: "Indian Polity by M. Laxmikanth (6th Ed)",
            subject: "Polity & Governance",
            chapter: "Fundamental Rights",
            page_number: 84,
            score: 0.96
          }
        ],
        liked: true,
        bookmarked: false
      }
    ]
  }
];

const DEFAULT_UPLOADS: BookMetadata[] = [
  {
    id: "res-laxmikanth",
    name: "Indian Polity - Laxmikanth",
    coverColor: "from-purple-600 to-indigo-700",
    pages: 840,
    language: "English",
    ocrStatus: "completed",
    ocrProgress: 100,
    aiStatus: "Indexed",
    conceptCount: 142,
    readingTime: "28 hrs",
    confidence: 99.4,
    chapters: ["Chapter 1: Historical Background", "Chapter 2: Making of the Constitution", "Chapter 3: Salient Features", "Chapter 4: Preamble", "Chapter 5: Fundamental Rights"]
  }
];

function toResourceItem(resource: BackendResource, type: ResourceItem["type"]): ResourceItem {
  const normalizedStatus = resource.status.toUpperCase();
  return {
    id: String(resource.id), subjectId: String(resource.subject_id), title: resource.title,
    type, pages: resource.total_pages ?? 0,
    size: `${(resource.file_size / (1024 * 1024)).toFixed(1)} MB`,
    uploadDate: new Date(resource.created_at).toLocaleDateString(), chapters: [], chunksCount: resource.chunks_count ?? 0,
    vectorStatus: normalizedStatus === "READY" || normalizedStatus === "COMPLETED" ? "Indexed" : normalizedStatus === "PROCESSING" ? "Processing" : "Pending",
  };
}

function flattenDocuments(groups: SubjectDocuments[]): ResourceItem[] {
  return groups.flatMap((group) => [
    ...group.books.map((resource) => toResourceItem(resource, "Book")),
    ...group.notes.map((resource) => toResourceItem(resource, "Note")),
    ...group.pyqs.map((resource) => toResourceItem(resource, "PYQ")),
    ...group.syllabus.map((resource) => toResourceItem(resource, "Syllabus")),
  ]);
}

function toBookMetadata(resource: ResourceItem): BookMetadata {
  const completed = resource.vectorStatus === "Indexed";
  return {
    id: resource.id, name: resource.title, coverColor: "from-purple-600 to-indigo-700",
    pages: resource.pages, language: "English", ocrStatus: completed ? "completed" : "uploading",
    ocrProgress: completed ? 100 : 0, aiStatus: resource.vectorStatus, conceptCount: resource.chunksCount || 120,
    readingTime: "4 hrs", confidence: 99.2, chapters: resource.chapters || [], uploadedDate: resource.uploadDate,
    size: resource.size, resourceType: resource.type, subjectId: resource.subjectId,
  };
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<GoalWorkspace[]>(INITIAL_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("ws-upsc");

  const [conversations, setConversations] = useState<Conversation[]>(DEFAULT_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>("conv-1");
  const [uploads, setUploads] = useState<BookMetadata[]>(DEFAULT_UPLOADS);
  const [activeBookId, setActiveBookId] = useState<string | null>("res-laxmikanth");
  const [isStreaming, setIsStreaming] = useState(false);
  const [thinkingStage, setThinkingStage] = useState<WorkspaceState["thinkingStage"]>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [libraryZoom, setLibraryZoom] = useState(1);
  const [themeColor, setThemeColor] = useState("purple");

  const [flowStep, setFlowStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>("subj-polity");
  const [selectedResourceType, setSelectedResourceType] = useState<"Book" | "PDF" | "Note" | "PYQ" | "Syllabus" | null>("Book");
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>("res-laxmikanth");

  const [studyGoal] = useState<WorkspaceState["studyGoal"]>({
    todayGoal: "Complete Polity Chapter 1 & solve 20 PYQs",
    streak: 14,
    studyTimeMinutes: 180,
    examCountdownDays: 32,
    weeklyProgress: 75
  });

  const loadWorkspaceData = async () => {
    try {
      const workspace = await backendService.workspace.current();
      if (!workspace || !workspace.id) return;

      const [subjects, documentGroups] = await Promise.all([
        backendService.workspace.subjects(workspace.id),
        backendService.workspace.documents(workspace.id),
      ]);

      const resources = flattenDocuments(documentGroups);
      const subjectNodes: SubjectNode[] = subjects.map((subject) => ({
        id: String(subject.id), name: subject.name, category: "General",
        resourceCount: resources.filter((resource) => resource.subjectId === String(subject.id)).length,
        iconName: subject.icon || "BookOpen", color: subject.color || "from-[#6D4AFF] to-indigo-600",
        description: subject.description,
      }));

      if (subjectNodes.length > 0) {
        setWorkspaces([{
          id: String(workspace.id), title: workspace.target_exam, examName: workspace.target_exam,
          description: workspace.exam_category, isDefault: true, subjects: subjectNodes, resources,
        }]);
        setActiveWorkspaceId(String(workspace.id));
        setUploads(resources.map(toBookMetadata));
      }
    } catch {
      // Retain INITIAL_WORKSPACES fallback gracefully if backend API is offline
    }
  };

  useEffect(() => {
    void loadWorkspaceData();
  }, []);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeBook = uploads.find((b) => b.id === (activeBookId || activeConversation?.bookId));

  const refreshResources = async () => {
    try {
      const numWsId = Number(activeWorkspaceId);
      if (!Number.isInteger(numWsId) || numWsId <= 0) return;
      const fetchedDocs = await backendService.workspace.documents(numWsId);
      const flattenedResources = flattenDocuments(fetchedDocs);
      setUploads(flattenedResources.map(toBookMetadata));

      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === activeWorkspaceId ? { ...w, resources: flattenedResources } : w
        )
      );
    } catch {
      /* Retain local state fallback */
    }
  };

  // Workspace CRUD Operations
  const createWorkspace = (title: string, examName: string, description: string) => {
    const newWS: GoalWorkspace = {
      id: `ws-${Date.now()}`,
      title,
      examName,
      description,
      isDefault: false,
      subjects: [
        { id: `subj-1-${Date.now()}`, name: "Core Subject Paper I", category: "General", resourceCount: 0, iconName: "BookOpen", color: "from-purple-500 to-indigo-600" }
      ],
      resources: []
    };
    setWorkspaces((prev) => [...prev, newWS]);
    setActiveWorkspaceId(newWS.id);
  };

  const updateWorkspace = (id: string, updates: Partial<GoalWorkspace>) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const deleteWorkspace = (id: string) => {
    if (workspaces.length <= 1) return;
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    if (activeWorkspaceId === id) {
      const remaining = workspaces.filter((w) => w.id !== id);
      setActiveWorkspaceId(remaining[0].id);
    }
  };

  const addSubjectToWorkspace = (workspaceId: string, subject: Omit<SubjectNode, "id">) => {
    const newSubj: SubjectNode = { ...subject, id: `subj-${Date.now()}` };
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === workspaceId ? { ...w, subjects: [...w.subjects, newSubj] } : w
      )
    );
  };

  const deleteSubjectFromWorkspace = async (workspaceId: string, subjectId: string) => {
    const numId = Number(subjectId);
    if (Number.isInteger(numId) && numId > 0) {
      try {
        await backendService.onboarding.gaps.remove(numId);
      } catch (err) {
        console.error("Failed to delete subject:", err);
      }
    }
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id === workspaceId) {
          return {
            ...w,
            subjects: w.subjects.filter((s) => s.id !== subjectId),
            resources: w.resources.filter((r) => r.subjectId !== subjectId)
          };
        }
        return w;
      })
    );
  };

  const addResourceToSubject = (resource: Omit<ResourceItem, "id">) => {
    const newRes: ResourceItem = { ...resource, id: `res-${Date.now()}` };
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id === activeWorkspaceId) {
          const updatedSubjects = w.subjects.map((s) =>
            s.id === resource.subjectId ? { ...s, resourceCount: s.resourceCount + 1 } : s
          );
          return {
            ...w,
            subjects: updatedSubjects,
            resources: [...w.resources, newRes]
          };
        }
        return w;
      })
    );
  };

  const deleteResource = async (workspaceId: string, resourceId: string) => {
    const numId = Number(resourceId);
    if (Number.isInteger(numId) && numId > 0) {
      try {
        await backendService.documents.remove(numId);
      } catch (err) {
        console.error("Failed to delete resource:", err);
      }
    }
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id === workspaceId) {
          const resToDelete = w.resources.find((r) => r.id === resourceId);
          const updatedSubjects = w.subjects.map((s) =>
            s.id === resToDelete?.subjectId ? { ...s, resourceCount: Math.max(0, s.resourceCount - 1) } : s
          );
          return {
            ...w,
            subjects: updatedSubjects,
            resources: w.resources.filter((r) => r.id !== resourceId)
          };
        }
        return w;
      })
    );
  };

  // 5-Step Flow State Handlers
  const selectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setFlowStep(2);
  };

  const selectResourceType = (type: "Book" | "PDF" | "Note" | "PYQ" | "Syllabus") => {
    setSelectedResourceType(type);
    setFlowStep(3);
  };

  const selectResource = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    setFlowStep(4);
  };

  const resetFlow = () => {
    setFlowStep(1);
    setSelectedSubjectId(null);
    setSelectedResourceType(null);
    setSelectedResourceId(null);
  };

  const beginNewStudySession = () => {
    setActiveConversationId("");
    setActiveBookId(null);
    setIsStreaming(false);
    setThinkingStage(null);
    setSearchQuery("");
    resetFlow();
  };

  const startChatWithResource = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    setFlowStep(5);
  };

  // Chat Management Handlers
  const createNewChat = (title?: string, bookId?: string, resourceId?: string) => {
    const id = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id,
      title: title || "New Study Session",
      pinned: false,
      favorite: false,
      archived: false,
      group: "today",
      bookId,
      resourceId,
      lastMessageAt: new Date().toISOString(),
      messages: []
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(id);
    return id;
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) setActiveConversationId(remaining[0].id);
    }
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)));
  };

  const togglePinConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const toggleFavoriteConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c))
    );
  };

  const toggleArchiveConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c))
    );
  };

  const setConversationColor = (id: string, color: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, color } : c))
    );
  };

  const streamResponse = async (textQuery: string, convId: string) => {
    setIsStreaming(true);
    const stages: WorkspaceState["thinkingStage"][] = ["thinking", "reading", "analyzing", "notes", "knowledge"];

    for (const stage of stages) {
      setThinkingStage(stage);
      await new Promise((r) => setTimeout(r, 550));
    }
    setThinkingStage(null);

    const activeRes = activeWorkspace?.resources.find((r) => r.id === selectedResourceId);
    const resourceTitle = activeRes ? activeRes.title : "Indian Polity by M. Laxmikanth";

    let fullResponse = `Here is the comprehensive breakdown and analysis for your query:\n\n1. **Core Examination Principles**: Structured according to syllabus directives.\n2. **High-Yield Recall Summaries**: Key constitutional articles, legal precedents, and structural frameworks.\n3. **Active Recall & PYQ Analysis**: Practice recent exam trends to master conceptual application.`;

    const queryLower = textQuery.toLowerCase();
    if (queryLower.includes("salient features") || queryLower.includes("constitution") || queryLower.includes("article")) {
      fullResponse = `Here are the salient features of the Indian Constitution:\n\n1. **Lengthiest written constitution in the world**.\n2. **Federal in structure but unitary in spirit**.\n3. **Parliamentary form of Government**.\n4. **Fundamental Rights and Directive Principles of State Policy**.\n5. **Independent Judiciary**.\n6. **Single Citizenship**.\n7. **Secular State**.\n8. **Universal Adult Franchise**.\n9. **Emergency Provisions**.`;
    } else if (queryLower.includes("notes") || queryLower.includes("summarize")) {
      fullResponse = `### Structured Notes: ${resourceTitle}\n\n* **Core Focus**: Fundamental Principles & Provisions\n* **Key Articles**: Articles 12–35 (Part III)\n* **Judicial Review**: Article 13 empowers courts to strike down unconstitutional laws.\n\n> Source referenced from **${resourceTitle}**, Chapter 1.`;
    }

    const newAiMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "ai",
      text: "",
      timestamp: new Date().toISOString(),
      confidence: "High",
      sources: [
        {
          document_title: resourceTitle,
          subject: "Polity & Governance",
          chapter: "Fundamental Rights",
          page_number: 84,
          score: 0.96
        }
      ]
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, newAiMessage] } : c))
    );

    let currentText = "";
    const words = fullResponse.split(" ");
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? "" : " ") + words[i];
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            const updated = c.messages.map((m) => (m.id === newAiMessage.id ? { ...m, text: currentText } : m));
            return { ...c, messages: updated };
          }
          return c;
        })
      );
      await new Promise((r) => setTimeout(r, 22));
    }
    setIsStreaming(false);
  };

  const sendMessage = async (text: string, files?: Array<{ name: string; type: string; size: number }>) => {
    if (!text.trim() && (!files || files.length === 0)) return;

    let targetConvId = activeConversationId;
    if (!targetConvId || conversations.length === 0) {
      targetConvId = createNewChat();
    }

    const newUserMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
      files
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConvId
          ? { ...c, lastMessageAt: new Date().toISOString(), messages: [...c.messages, newUserMessage] }
          : c
      )
    );

    await streamResponse(text, targetConvId);
  };

  const uploadFile = async (file: File) => {
    const bookId = `book-${Date.now()}`;
    const newBook: BookMetadata = {
      id: bookId,
      name: file.name.replace(/\.[^/.]+$/, ""),
      coverColor: "from-purple-600 to-indigo-700",
      pages: Math.floor(Math.random() * 200) + 50,
      language: "English",
      ocrStatus: "uploading",
      ocrProgress: 10,
      aiStatus: "Analyzing Layout...",
      conceptCount: 0,
      readingTime: "Calculating...",
      confidence: 0,
      chapters: []
    };

    setUploads((prev) => [newBook, ...prev]);
    setActiveBookId(bookId);

    const statuses: Array<BookMetadata["ocrStatus"]> = ["uploading", "ocr", "understanding", "chapters", "notes", "graph", "completed"];
    const progressValues = [15, 35, 55, 75, 88, 95, 100];
    const aiStatuses = [
      "Uploading PDF binary...",
      "Running OCR engine...",
      "Analyzing layout & hierarchy...",
      "Extracting chapters...",
      "Generating summary notes...",
      "Creating Knowledge Graph...",
      "Indexed"
    ];

    for (let i = 0; i < statuses.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      setUploads((prev) =>
        prev.map((b) =>
          b.id === bookId
            ? {
                ...b,
                ocrStatus: statuses[i],
                ocrProgress: progressValues[i],
                aiStatus: aiStatuses[i],
                ...(statuses[i] === "completed"
                  ? {
                      conceptCount: 45,
                      readingTime: "4 hrs",
                      confidence: 99.1,
                      chapters: ["Chapter 1: Foundations", "Chapter 2: Frameworks"]
                    }
                  : {})
              }
            : b
        )
      );
    }
  };

  const triggerQuickAction = (actionType: string) => {
    let prompt = "";
    switch (actionType) {
      case "explain":
        prompt = "Explain the salient features and key concepts of this resource.";
        break;
      case "notes":
        prompt = "Generate comprehensive notes for this chapter.";
        break;
      case "questions":
        prompt = "Show important PYQs and practice questions with detailed explanations.";
        break;
      case "summarize":
        prompt = "Summarize this chapter into a high-yield revision list.";
        break;
      case "flashcards":
        prompt = "Create 5 interactive flashcards for active recall study.";
        break;
      default:
        prompt = `Perform study tool action: ${actionType}`;
    }
    sendMessage(prompt);
  };

  const regenerateLastMessage = () => {
    const active = conversations.find((c) => c.id === activeConversationId);
    if (!active || active.messages.length < 2) return;
    const msgs = [...active.messages];
    let lastUserIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].sender === "user") {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx !== -1) {
      const text = msgs[lastUserIdx].text;
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? { ...c, messages: c.messages.slice(0, lastUserIdx + 1) } : c))
      );
      streamResponse(text, activeConversationId);
    }
  };

  const toggleMessageBookmark = (messageId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            messages: c.messages.map((m) => (m.id === messageId ? { ...m, bookmarked: !m.bookmarked } : m))
          };
        }
        return c;
      })
    );
  };

  const toggleMessageLike = (messageId: string, type: "like" | "dislike") => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id === messageId) {
                return type === "like"
                  ? { ...m, liked: !m.liked, disliked: false }
                  : { ...m, disliked: !m.disliked, liked: false };
              }
              return m;
            })
          };
        }
        return c;
      })
    );
  };

  return (
    <WorkspaceContext.Provider
      value={{
        conversations,
        activeConversationId,
        isStreaming,
        thinkingStage,
        uploads,
        activeBookId,
        studyGoal,
        searchQuery,
        setSearchQuery,
        activeConversation,
        activeBook,
        workspaces,
        activeWorkspaceId,
        activeWorkspace,
        setActiveWorkspaceId,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        addSubjectToWorkspace,
        deleteSubjectFromWorkspace,
        addResourceToSubject,
        deleteResource,
        flowStep,
        selectedSubjectId,
        selectedResourceType,
        selectedResourceId,
        setFlowStep,
        selectSubject,
        selectResourceType,
        selectResource,
        resetFlow,
        beginNewStudySession,
        startChatWithResource,
        setActiveConversationId,
        createNewChat,
        sendMessage,
        deleteConversation,
        renameConversation,
        togglePinConversation,
        toggleFavoriteConversation,
        toggleArchiveConversation,
        setConversationColor,
        uploadFile,
        refreshResources,
        triggerQuickAction,
        regenerateLastMessage,
        toggleMessageBookmark,
        toggleMessageLike,
        libraryZoom,
        setLibraryZoom,
        themeColor,
        setThemeColor
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}

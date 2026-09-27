import { apiClient } from "./api-client";

/** Complete typed surface for the routes implemented by the Aptora backend. */
export const backendService = {
  workspace: {
    current: () => apiClient.get<Workspace>("/workspace"),
    create: (payload: WorkspaceInput) => apiClient.post<Workspace>("/workspace", payload),
    update: (payload: WorkspaceInput) => apiClient.put<Workspace>("/workspace", payload),
    remove: () => apiClient.delete<{ success: boolean; message: string }>("/workspace"),
    info: (id: number) => apiClient.get<WorkspaceInfo>(`/workspace/${id}`),
    subjects: (id: number) => apiClient.get<WorkspaceSubject[]>(`/workspace/${id}/subjects`),
    statistics: (id: number) => apiClient.get<WorkspaceStatistics>(`/workspace/${id}/statistics`),
    documents: (id: number) => apiClient.get<SubjectDocuments[]>(`/workspace/${id}/documents`),
    recent: (id: number, limit = 10) => apiClient.get<Resource[]>(`/workspace/${id}/recent?limit=${limit}`),
    library: (id: number, subjectId: number) => apiClient.get<SubjectDocuments>(`/workspace/${id}/subject/${subjectId}`),
    search: (id: number, params: URLSearchParams) => apiClient.get<LibrarySearch>(`/workspace/${id}/library/search?${params}`),
    studyPlan: (id: number) => apiClient.get<StudyPlan>(`/workspace/${id}/study-plan`),
  },
  onboarding: {
    get: () => apiClient.get<OnboardingProfile>("/profile/"),
    create: (payload: OnboardingProfileInput) => apiClient.post<OnboardingProfile>("/profile/", payload),
    update: (payload: OnboardingProfileInput) => apiClient.put<OnboardingProfile>("/profile/", payload),
    remove: () => apiClient.delete("/profile/"),
    timeline: crud("/timeline/"), lifestyle: crud("/lifestyle/"),
    studySlots: collection("/study-slots/", "study_slots"),
    learningModes: collection("/learning-modes/", "learning_modes"),
    gaps: collection("/gap-analysis/", "subjects"),
  },
  documents: {
    upload: (
      workspaceId: number,
      subjectId: number,
      resourceType: string,
      file: File,
      title?: string,
      description?: string,
      onProgress?: (percent: number) => void
    ) => {
      const form = new FormData();
      form.set("workspace_id", String(workspaceId));
      form.set("subject_id", String(subjectId));
      form.set("resource_type", resourceType);
      if (title) form.set("title", title);
      if (description) form.set("description", description);
      form.set("file", file);

      if (onProgress) {
        return apiClient.uploadWithProgress<Resource>("/documents/upload", form, onProgress);
      }
      return apiClient.upload<Resource>("/documents/upload", form);
    },
    rename: (id: number, title: string, description?: string) => {
      const form = new FormData();
      form.set("title", title);
      if (description) form.set("description", description);
      return apiClient.patch<Resource>(`/documents/${id}`, form);
    },
    reprocess: (id: number) => apiClient.post<Resource>(`/documents/${id}/reprocess`),
    get: (id: number) => apiClient.get<Resource>(`/documents/${id}`),
    status: (id: number) => apiClient.get<{ resource_id: number; status: string }>(`/documents/${id}/status`),
    preview: (id: number) => apiClient.get<{ resource_id: number; title: string; chunks: Array<{ index: number; content: string }> }>(`/documents/${id}/preview`),
    getPdfUrl: (id: number) => {
      const apiRoot = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/v1\/?$/, "");
      return `${apiRoot}/documents/${id}/file`;
    },
    getNotePdfUrl: (id: number) => {
      const apiRoot = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/v1\/?$/, "");
      return `${apiRoot}/api/v1/documents/${id}/download-pdf`;
    },
    remove: (id: number) => apiClient.delete(`/documents/${id}`),
  },
  ai: {
    chat: (workspace_id: number, question: string) => apiClient.post<ChatResponse>("/chat", { workspace_id, question }),
    knowledge: (payload: KnowledgeRequest) => apiClient.post<KnowledgeResponse>("/knowledge/chat", payload),
    history: (sessionId: string) => apiClient.get(`/knowledge/chat/${sessionId}/history`),
    clearHistory: (sessionId: string) => apiClient.delete(`/knowledge/chat/${sessionId}`),
    conversations: (params?: { q?: string; limit?: number; offset?: number }) => {
      const q = new URLSearchParams();
      if (params?.q) q.set("q", params.q);
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.offset) q.set("offset", String(params.offset));
      return apiClient.get<KnowledgeConversation[]>(`/knowledge/conversations?${q.toString()}`);
    },
    conversation: (sessionId: string) => apiClient.get<KnowledgeConversationDetail>(`/knowledge/conversations/${sessionId}`),
    createConversation: (payload: { workspace_id: number; subject_id?: number }) => apiClient.post<KnowledgeConversation>('/knowledge/conversations', payload),
    renameConversation: (sessionId: string, title: string) => apiClient.patch<KnowledgeConversation>(`/knowledge/conversations/${sessionId}`, { title }),
    deleteConversation: (sessionId: string) => apiClient.delete<void>(`/knowledge/conversations/${sessionId}`),
    toggleConversationPin: (sessionId: string) => apiClient.post<KnowledgeConversation>(`/knowledge/conversations/${sessionId}/pin`),
    exportConversation: (sessionId: string) => apiClient.post<ChatExport>(`/knowledge/conversations/${sessionId}/export`),
    getExportStatus: (exportId: string) => apiClient.get<ChatExport>(`/knowledge/exports/${exportId}`),
    getExportDownloadUrl: (exportId: string) => {
      const apiRoot = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/v1\/?$/, "");
      return `${apiRoot}/knowledge/exports/${exportId}/download`;
    },
    listExports: (params?: { q?: string; sort_by?: string; limit?: number; offset?: number }) => {
      const q = new URLSearchParams();
      if (params?.q) q.set("q", params.q);
      if (params?.sort_by) q.set("sort_by", params.sort_by);
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.offset) q.set("offset", String(params.offset));
      return apiClient.get<ChatExport[]>(`/knowledge/exports?${q.toString()}`);
    },
    deleteExport: (exportId: string) => apiClient.delete<void>(`/knowledge/exports/${exportId}`),
    saveAsNote: (sessionId: string) => apiClient.post<{ success: boolean; resource_id: number; title: string; message: string }>(`/knowledge/conversations/${sessionId}/save-note`),
    summary: (workspace_id: number) => apiClient.post<{ success: boolean; summary: string }>("/summary", { workspace_id }),
    flashcards: (workspace_id: number, flashcard_count = 10) => apiClient.post("/flashcards", { workspace_id, flashcard_count }),
    questions: (workspace_id: number, question_type = "mcq", question_count = 10) => apiClient.post("/questions", { workspace_id, question_type, question_count }),
    mcq: (workspace_id: number, topic?: string, count = 5, difficulty = "medium") => apiClient.post("/mcq/generate", { workspace_id, topic, count, difficulty }),
    predictions: (workspace_id: number, prediction_count = 10) => apiClient.post("/predictions", { workspace_id, prediction_count }),
    conceptMap: (workspace_id: number, concept: string) => apiClient.post("/concept/map", { workspace_id, concept }),
  },
  sources: {
    getBooks: (params?: { workspace_id?: number; subject_id?: number; search?: string; resource_type?: string; status?: string; selected?: boolean; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.workspace_id) q.set("workspace_id", String(params.workspace_id));
      if (params?.subject_id) q.set("subject_id", String(params.subject_id));
      if (params?.search) q.set("search", params.search);
      if (params?.resource_type) q.set("resource_type", params.resource_type);
      if (params?.status) q.set("status", params.status);
      if (params?.selected) q.set("selected", "true");
      if (params?.page) q.set("page", String(params.page));
      if (params?.limit) q.set("limit", String(params.limit));
      return apiClient.get<LibraryBooksResponse>(`/library/books?${q.toString()}`);
    },
    getBook: (id: number) => apiClient.get<LibraryBookItem>(`/library/books/${id}`),
    getSelectedSources: (workspaceId?: number) => apiClient.get<AiStudySourceItem[]>(`/ai-study/sources${workspaceId ? `?workspace_id=${workspaceId}` : ""}`),
    selectSource: (resourceId: number) => apiClient.post<AiStudySourceItem>("/ai-study/sources", { resource_id: resourceId }),
    removeSource: (resourceId: number) => apiClient.delete<{ success: boolean; message: string }>(`/ai-study/sources/${resourceId}`),
  },
};

function crud(path: string) { return { get: () => apiClient.get(path), create: (p: unknown) => apiClient.post(path, p), update: (p: unknown) => apiClient.put(path, p), remove: () => apiClient.delete(path) }; }
function collection(path: string, key: string) { return { get: () => apiClient.get(path), replace: (values: unknown[]) => apiClient.put(path, { [key]: values }), remove: (id: number) => apiClient.delete(`${path}${id}`) }; }
export type WorkspaceInput = { target_exam: string; exam_category: string };
export type Workspace = WorkspaceInput & { id: number; user_id: number; created_at: string; updated_at: string };
export type WorkspaceSubject = { id: number; workspace_id: number; name: string; description?: string; display_order?: number; icon?: string; color?: string };
export type WorkspaceInfo = Workspace & { exam_name: string; description: string; progress: number };
export type WorkspaceStatistics = { subjects: number; documents: number; books: number; notes: number; pyqs: number; syllabus: number; chunks: number; embeddings: number };
export type Resource = { id: number; workspace_id: number; subject_id: number; resource_type: string; title: string; description?: string; status: string; original_filename: string; stored_filename?: string; file_size: number; total_pages?: number; created_at: string; updated_at?: string; chunks_count: number };
export type SubjectDocuments = { subject_id: number; subject_name?: string; subject?: string; books: Resource[]; notes: Resource[]; pyqs: Resource[]; syllabus: Resource[] };
export type LibrarySearch = { total: number; limit: number; offset: number; items: Resource[] };
export type OnboardingProfileInput = { avatar?: string | null; full_name: string; age: number; education: string; stream: string; city: string; occupation: string; syllabus_percent: number; current_confidence: number };
export type OnboardingProfile = OnboardingProfileInput & { id: number; workspace_id: number; created_at: string; updated_at: string };
export type StudyPlan = { success: boolean; workspace_id: number; target_exam: string; subjects: string[]; study_plan: string };
export type ChatResponse = { success: boolean; answer: string };
export type KnowledgeRequest = { session_id: string; workspace_id: number; subject_id?: number; question: string; limit?: number };
export type KnowledgeResponse = { success: boolean; session_id: string; answer: string; confidence: "high" | "medium" | "low" | "none"; sources: Array<{ resource_id?: number; document_title: string; subject: string; score: number }>; history_length: number };
export type KnowledgeConversation = { session_id: string; workspace_id: number; subject_id?: number | null; title: string; created_at: string; updated_at: string; last_message_at?: string | null; pinned: boolean; last_message?: string | null; message_count?: number };
export type KnowledgeConversationDetail = KnowledgeConversation & { messages: Array<{ role: "user" | "assistant"; content: string; sources?: Array<{ resource_id?: number; document_title: string; subject: string; chapter?: string; page_number?: number; score: number }> | null; confidence?: string | null; created_at: string }> };
export type LibraryBookItem = { id: number; title: string; description?: string; original_filename: string; resource_type: string; status: string; total_pages?: number; chunks_count: number; file_size: number; workspace_id: number; subject_id: number; subject?: string; exam?: string; ai_ready: boolean; is_selected: boolean; created_at: string };
export type LibraryBooksResponse = { total: number; page: number; limit: number; items: LibraryBookItem[] };
export type AiStudySourceItem = { id: number; user_id: number; workspace_id: number; resource_id: number; is_active: boolean; selected_at: string; resource?: LibraryBookItem };
export type ChatExport = { id: string; conversation_id: string; user_id: number; status: "pending" | "processing" | "completed" | "failed"; file_name?: string; file_size?: number; created_at: string; completed_at?: string; error_message?: string };



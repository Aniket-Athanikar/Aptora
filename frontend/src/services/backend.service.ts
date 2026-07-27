import { apiClient } from "./api-client";

/** Complete typed surface for the routes implemented by the ExamForge backend. */
export const backendService = {
  workspace: {
    current: () => apiClient.get<Workspace>("/workspace"),
    create: (payload: WorkspaceInput) => apiClient.post<Workspace>("/workspace", payload),
    update: (payload: WorkspaceInput) => apiClient.put<Workspace>("/workspace", payload),
    remove: () => apiClient.delete<{ success: boolean; message: string }>("/workspace"),
    info: (id: number) => apiClient.get<WorkspaceInfo>(`/workspace/${id}`),
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
    upload: (workspaceId: number, subjectId: number, resourceType: "book" | "notes" | "pyq" | "syllabus", file: File) => {
      const form = new FormData(); form.set("workspace_id", String(workspaceId)); form.set("subject_id", String(subjectId)); form.set("resource_type", resourceType); form.set("file", file);
      return apiClient.upload<Resource>("/documents/upload", form);
    },
    get: (id: number) => apiClient.get<Resource>(`/documents/${id}`),
    status: (id: number) => apiClient.get<{ resource_id: number; status: string }>(`/documents/${id}/status`),
    remove: (id: number) => apiClient.delete(`/documents/${id}`),
  },
  ai: {
    chat: (workspace_id: number, question: string) => apiClient.post<ChatResponse>("/chat", { workspace_id, question }),
    knowledge: (payload: KnowledgeRequest) => apiClient.post<KnowledgeResponse>("/knowledge/chat", payload),
    history: (sessionId: string) => apiClient.get(`/knowledge/chat/${sessionId}/history`),
    clearHistory: (sessionId: string) => apiClient.delete(`/knowledge/chat/${sessionId}`),
    summary: (workspace_id: number) => apiClient.post<{ success: boolean; summary: string }>("/summary", { workspace_id }),
    flashcards: (workspace_id: number, flashcard_count = 10) => apiClient.post("/flashcards", { workspace_id, flashcard_count }),
    questions: (workspace_id: number, question_type = "mcq", question_count = 10) => apiClient.post("/questions", { workspace_id, question_type, question_count }),
    mcq: (workspace_id: number, topic?: string, count = 5, difficulty = "medium") => apiClient.post("/mcq/generate", { workspace_id, topic, count, difficulty }),
    predictions: (workspace_id: number, prediction_count = 10) => apiClient.post("/predictions", { workspace_id, prediction_count }),
    conceptMap: (workspace_id: number, concept: string) => apiClient.post("/concept/map", { workspace_id, concept }),
  },
};

function crud(path: string) { return { get: () => apiClient.get(path), create: (p: unknown) => apiClient.post(path, p), update: (p: unknown) => apiClient.put(path, p), remove: () => apiClient.delete(path) }; }
function collection(path: string, key: string) { return { get: () => apiClient.get(path), replace: (values: unknown[]) => apiClient.put(path, { [key]: values }), remove: (id: number) => apiClient.delete(`${path}${id}`) }; }
export type WorkspaceInput = { target_exam: string; exam_category: string };
export type Workspace = WorkspaceInput & { id: number; user_id: number; created_at: string; updated_at: string };
export type WorkspaceInfo = Workspace & { exam_name: string; description: string; progress: number };
export type WorkspaceStatistics = { subjects: number; documents: number; books: number; notes: number; pyqs: number; syllabus: number; chunks: number; embeddings: number };
export type Resource = { id: number; workspace_id: number; subject_id: number; resource_type: string; title: string; status: string; original_filename: string; file_size: number; created_at: string };
export type SubjectDocuments = { subject_id: number; subject_name?: string; subject?: string; books: Resource[]; notes: Resource[]; pyqs: Resource[]; syllabus: Resource[] };
export type LibrarySearch = { total: number; limit: number; offset: number; items: Resource[] };
export type OnboardingProfileInput = { avatar?: string | null; full_name: string; age: number; education: string; stream: string; city: string; occupation: string; syllabus_percent: number; current_confidence: number };
export type OnboardingProfile = OnboardingProfileInput & { id: number; workspace_id: number; created_at: string; updated_at: string };
export type StudyPlan = { success: boolean; workspace_id: number; target_exam: string; subjects: string[]; study_plan: string };
export type ChatResponse = { success: boolean; answer: string };
export type KnowledgeRequest = { session_id: string; workspace_id: number; question: string; limit?: number };
export type KnowledgeResponse = { success: boolean; session_id: string; answer: string; confidence: "high" | "medium" | "low" | "none"; sources: Array<{ resource_id?: number; document_title: string; subject: string; score: number }>; history_length: number };

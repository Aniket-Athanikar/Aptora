import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  Exam,
  ExamDetails,
  ExamCreateInput,
  ExamUpdateInput,
  ExamAttempt,
  ExamResult,
  Question,
  QuestionCreateInput,
  ExamSubmitInput,
} from '@/types/exam';

export const examService = {
  async getExams(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<Exam>>> {
    return apiClient.get<PaginatedResponse<Exam>>('/exams', params);
  },

  async getExam(id: string): Promise<ApiResponse<ExamDetails>> {
    return apiClient.get<ExamDetails>(`/exams/${id}`);
  },

  async createExam(data: ExamCreateInput): Promise<ApiResponse<Exam>> {
    return apiClient.post<Exam>('/exams', data);
  },

  async updateExam(data: ExamUpdateInput): Promise<ApiResponse<Exam>> {
    return apiClient.patch<Exam>(`/exams/${data.id}`, data);
  },

  async deleteExam(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/exams/${id}`);
  },

  async publishExam(id: string): Promise<ApiResponse<Exam>> {
    return apiClient.post<Exam>(`/exams/${id}/publish`);
  },

  async archiveExam(id: string): Promise<ApiResponse<Exam>> {
    return apiClient.post<Exam>(`/exams/${id}/archive`);
  },

  // Questions
  async getQuestions(examId: string): Promise<ApiResponse<Question[]>> {
    return apiClient.get<Question[]>(`/exams/${examId}/questions`);
  },

  async createQuestion(data: QuestionCreateInput): Promise<ApiResponse<Question>> {
    return apiClient.post<Question>(`/exams/${data.examId}/questions`, data);
  },

  async updateQuestion(
    examId: string,
    questionId: string,
    data: Partial<QuestionCreateInput>
  ): Promise<ApiResponse<Question>> {
    return apiClient.patch<Question>(`/exams/${examId}/questions/${questionId}`, data);
  },

  async deleteQuestion(examId: string, questionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/exams/${examId}/questions/${questionId}`);
  },

  async reorderQuestions(examId: string, questionIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/exams/${examId}/questions/reorder`, { questionIds });
  },

  // Attempts
  async startAttempt(examId: string): Promise<ApiResponse<ExamAttempt>> {
    return apiClient.post<ExamAttempt>(`/exams/${examId}/attempts`);
  },

  async submitAttempt(data: ExamSubmitInput): Promise<ApiResponse<ExamResult>> {
    return apiClient.post<ExamResult>(`/exams/attempts/${data.attemptId}/submit`, data);
  },

  async getAttempt(attemptId: string): Promise<ApiResponse<ExamAttempt>> {
    return apiClient.get<ExamAttempt>(`/exams/attempts/${attemptId}`);
  },

  async getMyAttempts(examId: string): Promise<ApiResponse<ExamAttempt[]>> {
    return apiClient.get<ExamAttempt[]>(`/exams/${examId}/attempts/my`);
  },

  async getResults(examId: string): Promise<ApiResponse<ExamResult[]>> {
    return apiClient.get<ExamResult[]>(`/exams/${examId}/results`);
  },

  async getResult(resultId: string): Promise<ApiResponse<ExamResult>> {
    return apiClient.get<ExamResult>(`/exams/results/${resultId}`);
  },
};

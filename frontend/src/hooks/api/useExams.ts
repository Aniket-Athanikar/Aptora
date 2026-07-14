import { useState, useCallback } from 'react';
import { examService } from '@/services/exam.service';
import type { Exam, ExamDetails, ExamCreateInput, ExamUpdateInput, ExamAttempt, ExamResult, QuestionCreateInput } from '@/types/exam';
import type { PaginatedResponse } from '@/types/api';
import { AppError } from '@/lib/errors';

export function useExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<ExamDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [pagination, setPagination] = useState<{ page: number; pageSize: number; total: number } | null>(null);

  const fetchExams = useCallback(async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    status?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await examService.getExams(params);
      setExams(response.data.data);
      setPagination(response.data.pagination);
      return response;
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError('Failed to fetch exams');
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExam = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await examService.getExam(id);
      setCurrentExam(response.data);
      return response;
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError('Failed to fetch exam');
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createExam = useCallback(async (data: ExamCreateInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await examService.createExam(data);
      return response;
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError('Failed to create exam');
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateExam = useCallback(async (data: ExamUpdateInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await examService.updateExam(data);
      setCurrentExam((prev) => prev ? { ...prev, ...response.data } : null);
      return response;
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError('Failed to update exam');
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteExam = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await examService.deleteExam(id);
      setExams((prev) => prev.filter((exam) => exam.id !== id));
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError('Failed to delete exam');
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    exams,
    currentExam,
    isLoading,
    error,
    pagination,
    fetchExams,
    fetchExam,
    createExam,
    updateExam,
    deleteExam,
    clearError: () => setError(null),
  };
}

export function useExamAttempt(examId: string) {
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const startAttempt = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await examService.startAttempt(examId);
      setAttempt(response.data);
      return response;
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError('Failed to start attempt');
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [examId]);

  const submitAttempt = useCallback(async (answers: { questionId: string; answer: string | string[] }[]) => {
    if (!attempt) throw new Error('No active attempt');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await examService.submitAttempt({
        attemptId: attempt.id,
        answers,
      });
      setResult(response.data);
      setAttempt(null);
      return response;
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError('Failed to submit attempt');
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [attempt]);

  return {
    attempt,
    result,
    isLoading,
    error,
    startAttempt,
    submitAttempt,
    clearError: () => setError(null),
  };
}

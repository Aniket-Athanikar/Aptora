import { useState, useCallback } from 'react';
import type { ApiResponse } from '@/types/api';
import { AppError } from '@/lib/errors';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: AppError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: () => Promise<ApiResponse<T> | null>;
  reset: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options?: { immediate?: boolean }
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: options?.immediate ?? false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiCall();
      setState({ data: response.data, isLoading: false, error: null });
      return response;
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError('An error occurred');
      setState({ data: null, isLoading: false, error });
      return null;
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

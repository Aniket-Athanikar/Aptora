import { useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth';
import type { LoginInput, RegisterInput, ForgotPasswordInput, ChangePasswordInput } from '@/types/auth';
import { AppError } from '@/lib/errors';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setUser, setToken, setLoading, login: storeLogin, logout: storeLogout } = useAuthStore();
  const [error, setError] = useState<AppError | null>(null);

  const handleError = (err: unknown) => {
    if (err instanceof AppError) {
      setError(err);
    } else if (err instanceof Error) {
      setError(new AppError(err.message));
    } else {
      setError(new AppError('An unexpected error occurred'));
    }
  };

  const login = useCallback(async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = (await authService.login(data)) as { data: { user: Parameters<typeof storeLogin>[0]; token: string } };
      storeLogin(response.data.user, response.data.token);
      return response;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeLogin, setLoading]);

  const register = useCallback(async (data: RegisterInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = (await authService.signup({
        name: data.name,
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword
      })) as { data: { user: Parameters<typeof storeLogin>[0]; token: string } };
      storeLogin(response.data.user, response.data.token);
      return response;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeLogin, setLoading]);

  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout errors
    } finally {
      storeLogout();
      setLoading(false);
    }
  }, [storeLogout, setLoading]);

  const forgotPassword = useCallback(async (data: ForgotPasswordInput) => {
    setLoading(true);
    setError(null);
    
    try {
      return await authService.forgotPassword(data.email);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const changePassword = useCallback(async (data: ChangePasswordInput) => {
    setLoading(true);
    setError(null);
    
    try {
      return await authService.changePassword(data);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    changePassword,
    clearError: () => setError(null),
  };
}

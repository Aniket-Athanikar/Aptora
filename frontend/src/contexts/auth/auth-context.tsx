'use client';

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import { useAuthStore, type AuthState } from '@/store/auth';
import { userService } from '@/services/user.service';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthState['user'];
  login: AuthState['login'];
  logout: AuthState['logout'];
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();

  const refreshUser = async () => {
    try {
      const response = await userService.getProfile();
      login(response.data, useAuthStore.getState().token || '');
    } catch (error) {
      // If refresh fails, logout
      logout();
    }
  };

  // Fetch user on mount if token exists
  useEffect(() => {
    if (isAuthenticated && !user) {
      refreshUser();
    }
  }, [isAuthenticated, user]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/auth.service";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // The server session is the source of truth after a refresh.
  useEffect(() => {
    authService.me()
      .then((result) => {
        const value = result as { success?: boolean; data?: { name?: string; email?: string } | null };
        const sessionUser = value.data;
        setUser(value.success && sessionUser?.email
          ? { name: sessionUser.name || sessionUser.email.split("@")[0], email: sessionUser.email }
          : null);
      })
      .catch(() => setUser(null));
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Could not sync logout state to backend server:", e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

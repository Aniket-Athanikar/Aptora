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

  // Restore user session immediately from localStorage on mount, then verify with backend
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserStr = localStorage.getItem("aptora_user");
      let initialUser: User | null = null;
      if (storedUserStr) {
        try {
          initialUser = JSON.parse(storedUserStr);
          setUser(initialUser);
        } catch (e) {
          console.error("Error parsing stored aptora_user:", e);
        }
      }

      const token = localStorage.getItem("access_token");
      if (token) {
        authService
          .me()
          .then((result) => {
            const value = result as { success?: boolean; name?: string; email?: string; avatar?: string };
            if (value && value.success && value.email) {
              const updatedUser: User = {
                name: value.name || value.email.split("@")[0],
                email: value.email,
                avatar: value.avatar || initialUser?.avatar || "",
              };
              setUser(updatedUser);
              localStorage.setItem("aptora_user", JSON.stringify(updatedUser));
            }
          })
          .catch((err) => {
            console.warn("Backend auth validation check skipped/offline, preserving cached local user session:", err);
          });
      }
    }
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("aptora_user", JSON.stringify(userData));
      if (!localStorage.getItem("access_token")) {
        localStorage.setItem("access_token", "active_session_token");
      }
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Could not sync logout state to backend server:", e);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("aptora_user");
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

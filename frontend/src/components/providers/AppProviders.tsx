"use client";

import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/ToastContext";

/**
 * AppProviders — Wraps all context providers in a single component
 * for cleaner root layout composition.
 */
export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}

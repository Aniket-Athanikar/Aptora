"use client";

import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/ToastContext";
import { ProfileProvider } from "@/contexts";

/**
 * AppProviders — Wraps all context providers in a single component
 * for cleaner root layout composition.
 */
export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

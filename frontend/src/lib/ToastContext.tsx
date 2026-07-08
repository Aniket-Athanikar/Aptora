"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "info" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Portalled Toast overlay list */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto w-full bg-white/80 backdrop-blur-xl border border-neutral-200/80 rounded-2xl p-4 shadow-xl flex items-start gap-3.5 selection:bg-transparent"
            >
              {/* Type Icons */}
              <div className="flex-shrink-0 mt-0.5">
                {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {t.type === "info" && <Info className="w-5 h-5 text-[#6D4AFF]" />}
                {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-500" />}
              </div>

              {/* Message */}
              <p className="flex-1 text-xs font-bold text-neutral-800 leading-relaxed pt-0.5">
                {t.message}
              </p>

              {/* Close Button */}
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-neutral-400 hover:text-neutral-700 transition-colors p-0.5 rounded-lg hover:bg-neutral-100/50"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

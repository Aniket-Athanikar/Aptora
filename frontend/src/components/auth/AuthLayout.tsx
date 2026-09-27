"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const panelVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  };

  return (
    <main className="relative min-h-screen bg-[#FAF9F6] text-slate-900 font-sans flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Clean top subtle accent bar matching landing page branding */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#084c38] z-50" />

      {/* Auth Container Card */}
      <div className="relative z-10 w-full max-w-[440px]">
        <AnimatePresence mode="wait">
          <motion.div
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer copyright matching landing page */}
      <div className="mt-8 text-center text-xs text-slate-400 font-medium">
        © {new Date().getFullYear()} Aptora. All rights reserved.
      </div>
    </main>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const panelVariants = {
    initial: { opacity: 0, y: 16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -16, scale: 0.98 },
  };

  return (
    <main className="relative min-h-screen bg-[#FAF9F6] text-slate-900 font-sans flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-grid-pattern">
      {/* Top Accent Gradient Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400 z-50" />

      {/* Background Animated Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-emerald-200/40 via-emerald-400/20 to-teal-300/30 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Auth Container Card */}
      <div className="relative z-10 w-full max-w-[460px]">
        <AnimatePresence mode="wait">
          <motion.div
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden glow-emerald backdrop-blur-md"
          >
            {/* Top Bar inside Card */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
            
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-xs text-slate-500 font-bold relative z-10">
        © {year} Aptora. All rights reserved.
      </div>
    </main>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const ThreeHero = dynamic(() => import("../three/ThreeHero"), {
  ssr: false,
});

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const panelVariants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -15, scale: 0.98 },
  };

  return (
    <main className="relative min-h-screen bg-[var(--background)] text-neutral-900 overflow-hidden font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* 3D Motion Background Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-45">
        <ThreeHero />
      </div>

      {/* Premium Clean Background Pattern (Dot Pattern & Soft Ambient Glows) */}
      <div className="absolute inset-0 bg-dot z-0 opacity-80" />
      <div className="absolute inset-0 bg-noise z-0 pointer-events-none" />
      <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] bg-[var(--primary)]/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] bg-[var(--accent)]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[460px]">
        <AnimatePresence mode="wait">
          <motion.div
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

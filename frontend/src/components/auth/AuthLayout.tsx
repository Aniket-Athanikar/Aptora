"use client";

import React from "react";
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
    <main className="relative min-h-screen bg-[var(--background)] text-neutral-900 overflow-hidden font-sans flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* 3D Motion Background Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <ThreeHero />
      </div>

      {/* Premium Clean Background Pattern & Glowing Ambient Mesh */}
      <div className="absolute inset-0 bg-dot z-0 opacity-80" />
      <div className="absolute inset-0 bg-noise z-0 pointer-events-none" />
      <div className="absolute top-[10%] left-[20%] w-[450px] h-[450px] bg-[#6D4AFF]/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[10%] right-[20%] w-[450px] h-[450px] bg-[#EC4899]/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#6D4AFF]/5 via-[#A855F7]/5 to-transparent rounded-full filter blur-[140px] pointer-events-none" />

      {/* Single Auth Template Card Container */}
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

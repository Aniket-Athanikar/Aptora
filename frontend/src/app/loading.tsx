"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AptoraLogo } from "@/components/ui/AptoraLogo";

export default function GlobalLoading() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FAF9F6]/90 backdrop-blur-xl"
      suppressHydrationWarning
    >
      {/* Background Animated Orbs */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-emerald-400/20 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] rounded-full bg-teal-400/20 blur-[130px] pointer-events-none animate-pulse" />

      {/* Unique Centered Card Box */}
      <div className="relative flex flex-col items-center gap-6 p-8 sm:p-10 bg-white border-2 border-emerald-500/20 rounded-3xl shadow-2xl shadow-emerald-950/10 max-w-sm w-full mx-auto overflow-hidden glow-emerald backdrop-blur-md">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />

        {/* Unique Concentric Glowing Circles & Spinning Orb Rings */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Outer Pulsing Glow Aura Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-400/20 animate-ping opacity-75" />

          {/* Ring 1 - Fast Clockwise Spinning Emerald Border */}
          {mounted ? (
            <motion.div
              className="absolute inset-0 rounded-full border-[3px] border-emerald-500/15 border-t-[#084c38] border-r-[#059669]"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            />
          ) : (
            <div className="absolute inset-0 rounded-full border-[3px] border-emerald-500/15 border-t-[#084c38] border-r-[#059669]" />
          )}

          {/* Ring 2 - Reverse Counter-Clockwise Teal Border */}
          {mounted ? (
            <motion.div
              className="absolute w-20 h-20 rounded-full border-[3px] border-teal-500/15 border-b-teal-500 border-l-emerald-400"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
            />
          ) : (
            <div className="absolute w-20 h-20 rounded-full border-[3px] border-teal-500/15 border-b-teal-500 border-l-emerald-400" />
          )}

          {/* Core Emblem Circle */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={mounted ? { scale: [0.9, 1.05, 0.9] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#084c38] via-[#059669] to-teal-500 flex items-center justify-center shadow-lg shadow-[#084c38]/30"
          >
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </motion.div>

          {/* Floating Orbiting Dots */}
          {mounted ? (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50 absolute -top-1" />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50 absolute -top-1" />
            </div>
          )}
        </div>

        {/* Centered Brand Emblem & Animated Status */}
        <div className="flex flex-col items-center text-center space-y-3 w-full">
          <AptoraLogo size="lg" />

          <p className="text-xs text-slate-500 font-bold tracking-wide animate-pulse pt-1">
            Preparing your study workspace...
          </p>
        </div>
      </div>
    </div>
  );
}
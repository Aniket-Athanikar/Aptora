"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { BrainCircuit, ShieldCheck, Sparkles } from "lucide-react";
import GlassCard from "../ui/GlassCard";

// High-Performance 3D Tilt Wrapper optimized for floating micro-cards
function InteractiveFloatCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Tighter spring config for smaller, snappier floating cards
  const springConfig = { damping: 15, stiffness: 250, mass: 0.4 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  // Aggressive tilt bounds to make small cards feel hyper-responsive
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [25, -25]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-25, 25]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative cursor-pointer group ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function FloatingCards() {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 perspective-[1200px]">

      {/* Card 1: AI Coach */}
      <motion.div
        initial={{ opacity: 0, x: -40, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.21, 1.02, 0.43, 1.01] }}
        className="absolute top-[15%] left-[5%] xl:-left-[12%] hidden lg:block pointer-events-auto"
      >
        {/* Infinite Levitation Wrapper */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <InteractiveFloatCard>
            <GlassCard className="relative flex items-center gap-4 p-4 pr-6 bg-white/70 backdrop-blur-2xl border-white/80 rounded-2xl shadow-[0_20px_40px_-15px_rgba(109,74,255,0.15)] hover:shadow-[0_20px_40px_-15px_rgba(109,74,255,0.3)] transition-shadow duration-500 overflow-hidden">

              {/* Animated Background Glow */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Icon with Z-Depth and Pulse */}
              <div
                style={{ transform: "translateZ(30px)" }}
                className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 flex items-center justify-center text-purple-600 border border-purple-500/20 group-hover:scale-110 transition-transform duration-500 shadow-sm"
              >
                <BrainCircuit className="w-6 h-6" />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-xl bg-purple-400/20"
                />
              </div>

              {/* Text with Z-Depth */}
              <div style={{ transform: "translateZ(20px)" }} className="flex flex-col gap-0.5">
                <h4 className="font-extrabold text-sm text-neutral-900 tracking-tight flex items-center gap-1.5">
                  AI Coach Ready
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </h4>
                <p className="text-[11px] text-neutral-500 font-bold tracking-wide">Personalized study plan</p>
              </div>
            </GlassCard>
          </InteractiveFloatCard>
        </motion.div>
      </motion.div>

      {/* Card 2: Accuracy Shield */}
      <motion.div
        initial={{ opacity: 0, x: 40, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1, duration: 0.8, ease: [0.21, 1.02, 0.43, 1.01] }}
        className="absolute bottom-[25%] right-[5%] xl:-right-[10%] hidden lg:block pointer-events-auto"
      >
        {/* Infinite Levitation Wrapper (Opposite phase for asynchronous floating) */}
        <motion.div
          animate={{ y: [8, -8, 8] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <InteractiveFloatCard>
            <GlassCard className="relative flex items-center gap-4 p-4 pr-6 bg-white/70 backdrop-blur-2xl border-white/80 rounded-2xl shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] transition-shadow duration-500 overflow-hidden">

              {/* Animated Background Glow */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Icon with Z-Depth and Pulse */}
              <div
                style={{ transform: "translateZ(30px)" }}
                className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 flex items-center justify-center text-emerald-600 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500 shadow-sm"
              >
                <ShieldCheck className="w-6 h-6" />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute inset-0 rounded-xl bg-emerald-400/20"
                />
              </div>

              {/* Text with Z-Depth */}
              <div style={{ transform: "translateZ(20px)" }} className="flex flex-col gap-0.5">
                <h4 className="font-extrabold text-sm text-neutral-900 tracking-tight">
                  98% Accuracy
                </h4>
                <p className="text-[11px] text-neutral-500 font-bold tracking-wide">Verified explanations</p>
              </div>
            </GlassCard>
          </InteractiveFloatCard>
        </motion.div>
      </motion.div>

    </div>
  );
}
"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { UploadCloud, FileText, BrainCircuit, Trophy, ArrowRight } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeading from "@/components/ui/SectionHeading";
import GlowButton from "@/components/ui/GlowButton";

// 3D Tilt Wrapper Component for Deep Logic Hover Mechanics
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for tracking mouse coordinates relative to card center
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs to avoid jarring snapping when moving the mouse
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  // Map coordinates to degrees of rotation (Max 15deg tilt)
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    // Calculate normalized mouse position from -0.5 to 0.5
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

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
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative w-full cursor-pointer group ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function HowItWorks() {
  const steps = [
    {
      step: "Step 1",
      title: "Select Exam Materials",
      description: "Select your exam books, notes, PYQs in PDF or image format.",
      icon: UploadCloud,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100 group-hover:bg-emerald-100/50",
    },
    {
      step: "Step 2",
      title: "AI Processing (OCR)",
      description: "Our AI extracts text, cleans, and understands the content deeply.",
      icon: FileText,
      color: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10 group-hover:bg-emerald-500/10",
    },
    {
      step: "Step 3",
      title: "AI Creates Content",
      description: "AI generates notes, MCQs, flashcards, and important questions.",
      icon: BrainCircuit,
      color: "text-teal-600 bg-teal-50 border-teal-100 group-hover:bg-teal-100/50",
    },
    {
      step: "Step 4",
      title: "You Get Exam Ready",
      description: "Daily practice, mock tests, analytics, and your personal AI tutor.",
      icon: Trophy,
      color: "text-emerald-750 bg-emerald-50 border-emerald-200/50 group-hover:bg-emerald-100",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 border-t border-[#ECECEC] bg-transparent relative overflow-hidden perspective-[1200px]">
      {/* 3D Floating Mesh Geometric Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-30 select-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full border border-dashed border-emerald-500/20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full border border-dashed border-teal-500/10"
        />
      </div>

      <div className="layout-container max-w-[1320px] px-4 mx-auto relative z-10">
        {/* Header */}
        <SectionHeading
          badge="Workflow"
          title="How ExamForge"
          gradientTitle="AI Works?"
          description="Simple step process to transform your preparation."
        />

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch relative mt-12">
          {steps.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.15, duration: 0.7, ease: [0.21, 1.02, 0.43, 1.01] }}
              className="relative flex"
            >
              <TiltCard className="flex">
                <GlassCard className="flex flex-col items-center text-center p-8 bg-[var(--surface)]/60 backdrop-blur-md border-[#ECECEC]/80 rounded-[32px] relative w-full justify-between gap-6 shadow-sm hover:shadow-2xl hover:border-emerald-500/40 transition-shadow duration-500 bg-gradient-to-b from-[var(--surface)] to-[var(--background)]/50">

                  {/* Connecting arrow for larger screens */}
                  {idx < 3 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-6 -translate-y-1/2 z-20 text-emerald-500/40 group-hover:text-emerald-600 transition-colors duration-300">
                      <motion.div
                        animate={{ x: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </div>
                  )}

                  {/* Step Badge */}
                  <span style={{ transform: "translateZ(30px)" }} className="inline-flex px-3 py-1 text-[10px] font-bold tracking-wider text-neutral-500 uppercase bg-neutral-100/80 border border-[#ECECEC] rounded-full shadow-inner transition-colors group-hover:bg-[var(--surface)] group-hover:text-emerald-600">
                    {item.step}
                  </span>

                  {/* Icon wrapper with Depth Effects */}
                  <div
                    style={{ transform: "translateZ(50px)" }}
                    className={`w-16 h-16 rounded-[22px] border flex items-center justify-center ${item.color} shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-md`}
                  >
                    <item.icon className="w-7 h-7 transform transition-transform group-hover:rotate-6 duration-300" />
                  </div>

                  {/* Text Container with Layered transform depth */}
                  <div style={{ transform: "translateZ(40px)" }} className="flex flex-col gap-2.5">
                    <h3 className="font-black text-neutral-900 text-lg tracking-tight leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-neutral-500 text-xs font-semibold leading-relaxed px-1">
                      {item.description}
                    </p>
                  </div>
                </GlassCard>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Explore Detailed Guide CTA Button */}
        <div className="flex justify-center mt-12">
          <Link href="/how-it-works">
            <GlowButton variant="gradient" className="px-8 py-3.5 text-xs font-black" magnetic={false}>
              See How It Works In Detail
            </GlowButton>
          </Link>
        </div>
      </div>
    </section>
  );
}

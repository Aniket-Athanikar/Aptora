"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import {
  Key,
  Target,
  UploadCloud,
  Languages,
  Cpu,
  BookOpen,
  Brain,
  ClipboardList,
  Zap,
  Clock,
  MessageCircle,
  BarChart3
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeading from "@/components/ui/SectionHeading";
import GlowButton from "@/components/ui/GlowButton";

// 3D Tilt Wrapper Component for Deep Logic Hover Mechanics
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
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
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative cursor-pointer group ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function Features() {
  const list = [
    {
      title: "Secure Authentication",
      description: "Dual OTP validation with CSRF verification and silent auto-pull interception.",
      icon: Key,
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(109,74,255,0.25)] hover:border-[#6D4AFF]/40",
      iconColor: "text-[#6D4AFF] bg-[#6D4AFF]/5 border-[#6D4AFF]/20 group-hover:bg-[#6D4AFF]/10",
    },
    {
      title: "Exam Selection & Mapping",
      description: "Custom syllabus weighting and topic mapping for UPSC, SSC, Banking, and GATE.",
      icon: Target,
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.25)] hover:border-emerald-500/40",
      iconColor: "text-emerald-500 bg-emerald-500/5 border-emerald-500/20 group-hover:bg-emerald-500/10",
    },
    // {
    //   title: "Smart Book Selection",
    //   description: "Select exam books for PDF, image, ZIP, or directory structures with version control.",
    //   icon: UploadCloud,
    //   glow: "hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.25)] hover:border-amber-500/40",
    //   iconColor: "text-amber-500 bg-amber-500/5 border-amber-500/20 group-hover:bg-amber-500/10",
    // },
    {
      title: "Deep OCR Engine",
      description: "Deskewing and table extraction for high-fidelity English text documents.",
      icon: Languages,
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.25)] hover:border-[#4F46E5]/40",
      iconColor: "text-[#4F46E5] bg-[#4F46E5]/5 border-[#4F46E5]/20 group-hover:bg-[#4F46E5]/10",
    },
    {
      title: "Knowledge Base Processing",
      description: "Semantic chunking and high-performance vector indexing stored in Qdrant DB.",
      icon: Cpu,
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.25)] hover:border-[#A855F7]/40",
      iconColor: "text-[#A855F7] bg-[#A855F7]/5 border-[#A855F7]/20 group-hover:bg-[#A855F7]/10",
    },
    {
      title: "AI Study Material",
      description: "Generate summaries, long/short notes, mindmaps, formula sheets, and flashcards.",
      icon: BookOpen,
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.25)] hover:border-pink-500/40",
      iconColor: "text-pink-500 bg-pink-500/5 border-pink-500/20 group-hover:bg-pink-500/10",
    },
    {
      title: "Smart Question Generator",
      description: "Creates custom MCQs, fill-in-the-blanks, true/false, and assertion-reasoning.",
      icon: Brain,
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(14,165,233,0.25)] hover:border-sky-500/40",
      iconColor: "text-sky-500 bg-sky-500/5 border-sky-500/20 group-hover:bg-sky-500/10",
    },
    {
      title: "Daily Practice Generator",
      description: "Personalized practice questions generated every morning based on recent mistakes.",
      icon: ClipboardList,
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.25)] hover:border-emerald-500/40",
      iconColor: "text-emerald-500 bg-emerald-500/5 border-emerald-500/20 group-hover:bg-emerald-500/10",
    },
    {
      title: "AI Question Prediction",
      description: "Matches books and PYQs to forecast upcoming high-probability exam topics.",
      icon: Zap,
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(234,179,8,0.25)] hover:border-yellow-500/40",
      iconColor: "text-yellow-500 bg-yellow-500/5 border-yellow-500/20 group-hover:bg-yellow-500/10",
    },
    {
      title: "Mock Test Engine",
      description: "Simulates test timers, negative marking rules, percentiles, and live leaderboards.",
      icon: Clock,
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.25)] hover:border-indigo-500/40",
      iconColor: "text-indigo-500 bg-indigo-500/5 border-indigo-500/20 group-hover:bg-indigo-500/10",
    },
    {
      title: "AI Coach & Tutor",
      description: "Grounded chat over your uploaded books with page-level document citations.",
      icon: MessageCircle,
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.25)] hover:border-purple-500/40",
      iconColor: "text-purple-500 bg-purple-500/5 border-purple-500/20 group-hover:bg-purple-500/10",
    },
    {
      title: "Progress Analytics",
      description: "Streak calendar tracking, strengths heatmap, levels XP, and readiness index.",
      icon: BarChart3,
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.25)] hover:border-rose-500/40",
      iconColor: "text-rose-500 bg-rose-500/5 border-rose-500/20 group-hover:bg-rose-500/10",
    }
  ];

  // Duplicating the array to create a seamless infinite loop for the marquee
  const carouselItems = [...list, ...list];

  return (
    <section id="features" className="py-20 bg-transparent relative overflow-hidden border-t border-[#ECECEC] perspective-[1200px]">

      {/* Ambient Animated Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40 select-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-[#6D4AFF]/5 to-transparent rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-tr from-[#A855F7]/5 to-transparent rounded-full blur-[100px]"
        />
      </div>

      <div className="layout-container max-w-[1320px] px-4 mx-auto relative z-10 mb-12">
        <SectionHeading
          badge="Product Features"
          title="Features to Boost Your"
          gradientTitle="Preparation"
          description="Everything you need in one intelligent platform to maximize your scores."
        />
      </div>

      {/* Auto-Carousel Marquee Wrapper */}
      <div className="relative w-full flex overflow-hidden group">

        {/* Left and Right Gradient Masks for a clean fade-out effect */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-40 bg-gradient-to-r from-[var(--background)] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-40 bg-gradient-to-l from-[var(--background)] to-transparent z-20 pointer-events-none" />

        {/* Scrolling Track */}
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 50, // Comfortable reading speed for 12 items
            repeat: Infinity
          }}
          className="flex gap-6 md:gap-8 px-4 md:px-8 w-max"
        >
          {carouselItems.map((item, idx) => (
            <div key={idx} className="w-[300px] md:w-[400px] flex-shrink-0 py-10">
              <TiltCard className="h-full">
                <GlassCard
                  className={`flex flex-col items-start p-8 h-full bg-[var(--surface)]/70 backdrop-blur-xl border-white/20 rounded-[32px] gap-6 transition-all duration-500 shadow-sm ${item.glow}`}
                >
                  {/* Icon Wrapper with Z-Depth */}
                  <div
                    style={{ transform: "translateZ(50px)" }}
                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${item.iconColor}`}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>

                  {/* Content Container with Z-Depth */}
                  <div style={{ transform: "translateZ(40px)" }} className="flex flex-col gap-3">
                    <h3 className="font-extrabold text-neutral-900 text-xl leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-neutral-500 text-sm font-semibold leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Hidden Decorative Glow on Hover */}
                  <div
                    style={{ transform: "translateZ(20px)" }}
                    className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px] pointer-events-none"
                  />
                </GlassCard>
              </TiltCard>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Explore All Features CTA Button */}
      <div className="flex justify-center mt-10 relative z-10">
        <Link href="/features">
          <GlowButton variant="gradient" className="px-8 py-3.5 text-xs font-black" magnetic={false}>
            Explore All Features
          </GlowButton>
        </Link>
      </div>
    </section>
  );
}

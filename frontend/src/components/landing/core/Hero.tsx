"use client";

import { Play, CheckCircle, Star, ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import GlowButton from "@/components/ui/GlowButton";
import FloatingCards from "../sections/FloatingCards";
import GlassCard from "@/components/ui/GlassCard";
import Image from "next/image";
import dynamic from "next/dynamic";

const HeroBackground = dynamic(() => import("./HeroBackground"), {
  ssr: false,
});

export default function Hero() {
  const checkmarks = [
    "Instead of students reading 15 books...",
    "Student select exam books.",
    "AI reads everything.",
    "AI teaches.",
    "AI creates notes.",
    "AI creates MCQs.",
    "AI predicts questions.",
    "AI tracks progress.",
    "AI becomes personal teacher.",
  ];

  return (
    <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden flex items-center">
      {/* Dynamic Animated particle & neural background */}
      <HeroBackground />

      <div className="layout-container max-w-[1320px] px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center relative z-10 w-full mx-auto">
        {/* Left: Text & Pitch */}
        <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-6 text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="highlight-pill self-start text-[11px] sm:text-xs"
          >
            <span>AI Powered Exam Preparation Platform</span>
            <ArrowRight className="w-3 h-3" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1] sm:leading-[1.05]"
          >
            <span className="text-slate-900">Your Personal </span>
            <br className="hidden sm:inline" />
            <span className="gradient-text-animated filter drop-shadow-xs">AI Exam Coach</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed max-w-lg"
          >
            Select <span className="inline-block px-2 py-0.5 rounded-lg bg-indigo-50/80 text-[#6D4AFF] border border-indigo-200/60 font-black shadow-2xs">Books</span> +{" "}
            <span className="inline-block px-2 py-0.5 rounded-lg bg-purple-50/80 text-purple-600 border border-purple-200/60 font-black shadow-2xs">Previous Year Papers</span> →{" "}
            <span className="font-extrabold text-slate-900">AI Creates</span>{" "}
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 text-indigo-700 border border-indigo-200/80 font-black shadow-2xs">Personalized Material</span>,{" "}
            Daily Training, Mock Tests, Weakness Analysis, and Predicts{" "}
            <span className="inline-block px-2 py-0.5 rounded-lg bg-pink-50/80 text-pink-600 border border-pink-200/60 font-black shadow-2xs">Important Topics</span>!
          </motion.p>

          {/* Checkmarks Grid for Mobile Optimization */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-1"
          >
            {checkmarks.map((text, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-700">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                <span className="truncate sm:whitespace-normal">{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center"
          >
            <Link href="/login" className="w-full sm:w-auto">
              <GlowButton variant="gradient" className="w-full sm:w-auto justify-center px-8 py-3.5 text-sm" magnetic={false}>
                Start Free Now
              </GlowButton>
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center justify-center gap-2 text-neutral-600 hover:text-[#6D4AFF] font-bold text-sm px-5 py-3 sm:py-3.5 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-[#6D4AFF] fill-[#6D4AFF]" />
              </div>
              Watch Demo
            </Link>
          </motion.div>

          {/* Ratings & Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-[#ECECEC] mt-1 max-w-md"
          >
            {/* Avatars */}
            <div className="flex -space-x-2.5 sm:-space-x-3">
              {[
                { name: "John", color: "bg-blue-100 text-blue-600 border-blue-200" },
                { name: "Sarah", color: "bg-purple-100 text-purple-600 border-purple-200" },
                { name: "Alex", color: "bg-orange-100 text-orange-600 border-orange-200" },
                { name: "Emily", color: "bg-teal-100 text-teal-600 border-teal-200" },
              ].map((av, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold ${av.color}`}
                >
                  {av.name[0]}
                </div>
              ))}
            </div>
            {/* Stars & Text */}
            <div className="flex flex-col">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 mt-0.5">
                4.8/5 from <span className="text-accent">10,000+</span> Students
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right: Floating AI Avatar Coach Card with Glow and 3D Parallax */}
        <div className="lg:col-span-6 relative flex items-center justify-center mt-4 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative w-full max-w-[340px] sm:max-w-[460px] mx-auto z-20"
          >
            {/* Pulsing light rings */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#6D4AFF]/20 via-[#A855F7]/25 to-[#4F46E5]/20 rounded-full blur-3xl opacity-80 animate-pulse pointer-events-none" />

            <GlassCard className="relative p-4 sm:p-6 bg-[var(--surface)]/70 border border-white/20 rounded-[24px] sm:rounded-[32px] shadow-2xl flex flex-col gap-4 sm:gap-6 items-center text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#6D4AFF]/10 to-[#8B5CF6]/5 rounded-full blur-xl pointer-events-none" />

              <div className="relative w-48 h-48 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-white shadow-xl glow-avatar transform hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                <img
                  src="/ai-avatar.png"
                  alt="AI Exam Coach Avatar"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-1 sm:gap-1.5 z-10">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#6D4AFF] tracking-widest uppercase">System Online</span>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight">Meet Your AI Coach</h3>
                <p className="text-[11px] sm:text-xs text-neutral-500 font-semibold px-2 sm:px-4">
                  &ldquo;Ready to analyze your syllabus, generate mock tests, and double your preparation speed.&rdquo;
                </p>
              </div>

              <div className="w-full flex items-center justify-between border-t border-[#ECECEC] pt-3 sm:pt-4 mt-1 sm:mt-2">
                <div className="flex flex-col items-start">
                  <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase tracking-wider">AI Accuracy</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-600">99.8% Certified</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-100 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D4AFF] animate-ping" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#6D4AFF] uppercase">Active</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
          <FloatingCards />
        </div>
      </div>
      {/* Animated Scroll Down indicator at the bottom center of Hero */}
      <div className="hidden sm:flex absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-1.5 cursor-pointer">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          onClick={() => {
            const el = document.getElementById("how-it-works");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/70 backdrop-blur-md border border-[#ECECEC] flex items-center justify-center shadow-lg hover:shadow-xl hover:border-[#6D4AFF]/30 hover:text-[#6D4AFF] text-neutral-500 transition-all"
        >
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { Play, CheckCircle, Star, ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import GlowButton from "../ui/GlowButton";
import FloatingCards from "./FloatingCards";
import dynamic from "next/dynamic";
import GlassCard from "../ui/GlassCard";
import Image from "next/image";

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
    <section className="relative pt-32 pb-20 overflow-hidden flex items-center">
      {/* Dynamic Animated particle & neural background */}
      <HeroBackground />

      <div className="layout-container max-w-[1320px] grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10 w-full">
        {/* Left: Text & Pitch */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="highlight-pill"
          >
            <span>AI Powered Exam Preparation Platform</span>
            <ArrowRight className="w-3 h-3" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.05]"
          >
            Your Personal <br />
            <span className="gradient-text-animated">AI Exam Coach</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-lg"
          >
            Select <span className="text-accent">Books</span> +{" "}
            <span className="text-accent">Previous Year Papers</span> → AI Creates
            <span className="underline-accent"> Personalized Study Material</span>,
            Daily Training, Mock Tests, Weakness Analysis, and Predicts{" "}
            <span className="text-accent-mid">Important Topics</span>!
          </motion.p>

          {/* Checkmarks */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-3 my-2"
          >
            {checkmarks.map((text, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <Link href="/login">
              <GlowButton variant="gradient" className="px-8 py-3.5 text-sm" magnetic={false}>
                Start Free Now
              </GlowButton>
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center gap-2 text-neutral-600 hover:text-[#6D4AFF] font-bold text-sm px-5 py-3.5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 flex items-center justify-center">
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
            className="flex items-center gap-4 pt-4 border-t border-[#ECECEC] mt-2 max-w-md"
          >
            {/* Avatars */}
            <div className="flex -space-x-3">
              {[
                { name: "John", color: "bg-blue-100 text-blue-600 border-blue-200" },
                { name: "Sarah", color: "bg-purple-100 text-purple-600 border-purple-200" },
                { name: "Alex", color: "bg-orange-100 text-orange-600 border-orange-200" },
                { name: "Emily", color: "bg-teal-100 text-teal-600 border-teal-200" },
              ].map((av, idx) => (
                <div
                  key={idx}
                  className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold ${av.color}`}
                >
                  {av.name[0]}
                </div>
              ))}
            </div>
            {/* Stars & Text */}
            <div className="flex flex-col">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-600 mt-1">
                4.8/5 from <span className="text-accent">10,000+</span> Students
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right: Floating AI Avatar Coach Card with Glow and 3D Parallax */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative w-full max-w-[460px] mx-auto z-20"
          >
            {/* Pulsing light rings */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#6D4AFF]/20 via-[#A855F7]/25 to-[#4F46E5]/20 rounded-full blur-3xl opacity-80 animate-pulse pointer-events-none" />

            <GlassCard className="relative p-6 bg-[var(--surface)]/70 border border-white/20 rounded-[32px] shadow-2xl flex flex-col gap-6 items-center text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#6D4AFF]/10 to-[#8B5CF6]/5 rounded-full blur-xl pointer-events-none" />

              <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-white shadow-xl glow-avatar transform hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                <img
                  src="/ai-avatar.png"
                  alt="AI Exam Coach Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-1.5 z-10">
                <span className="text-[10px] font-bold text-[#6D4AFF] tracking-widest uppercase">System Online</span>
                <h3 className="text-2xl font-black text-neutral-900 leading-tight">Meet Your AI Coach</h3>
                <p className="text-xs text-neutral-500 font-semibold px-4">
                  &ldquo;Ready to analyze your syllabus, generate mock tests, and double your preparation speed.&rdquo;
                </p>
              </div>

              <div className="w-full flex items-center justify-between border-t border-[#ECECEC] pt-4 mt-2">
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">AI Accuracy</span>
                  <span className="text-sm font-black text-emerald-600">99.8% Certified</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D4AFF] animate-ping" />
                  <span className="text-[10px] font-bold text-[#6D4AFF] uppercase">Active</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
          <FloatingCards />
        </div>
      </div>
      {/* Animated Scroll Down indicator at the bottom center of Hero */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 cursor-pointer">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          onClick={() => {
            const el = document.getElementById("how-it-works");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-[#ECECEC] flex items-center justify-center shadow-lg hover:shadow-xl hover:border-[#6D4AFF]/30 hover:text-[#6D4AFF] text-neutral-500 transition-all"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>
    </section>
  );
}

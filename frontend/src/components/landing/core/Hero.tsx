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

      <div className="layout-container max-w-[1320px] px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start relative z-10 w-full mx-auto">
        {/* Left: Text & Pitch */}
        <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-6 text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-start text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-1.5 shadow-xs"
          >
            <span>AI-Powered Exam Preparation Platform</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-650" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-slate-950 leading-[1.15] sm:leading-[1.1]"
          >
            <span className="inline-block bg-gradient-to-r from-slate-950 to-slate-700 bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">Master Any Exam with</span>
            <br />
            <span className="gradient-text-animated-emerald filter drop-shadow-[0_2px_10px_rgba(16,185,129,0.15)] pb-1">Personalized AI Study Partner</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed max-w-lg"
          >
            Select <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-black shadow-2xs">Books</span> +{" "}
            <span className="inline-block px-2 py-0.5 rounded-lg bg-amber-50/80 text-amber-700 border border-amber-200/60 font-black shadow-2xs">Previous Year Papers</span> →{" "}
            <span className="font-extrabold text-slate-900">AI Creates</span>{" "}
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-emerald-50 via-amber-50 to-teal-55 text-emerald-800 border border-emerald-200/80 font-black shadow-2xs">Personalized Material</span>,{" "}
            Daily Training, Mock Tests, Weakness Analysis, and Predicts{" "}
            <span className="inline-block px-2 py-0.5 rounded-lg bg-teal-50/80 text-teal-700 border border-teal-200/60 font-black shadow-2xs">Important Topics</span>!
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
              <GlowButton
                variant="gradient"
                className="w-full sm:w-auto justify-center px-8 py-3.5 text-sm from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20 hover:shadow-emerald-500/40"
                magnetic={false}
              >
                Start Free Now
              </GlowButton>
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center justify-center gap-2 text-neutral-600 hover:text-emerald-700 font-bold text-sm px-5 py-3 sm:py-3.5 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50/50 border border-emerald-100/10 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
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
            <div className="flex flex-col bg-slate-900/[0.03] border border-slate-900/[0.06] px-3.5 py-2 rounded-2xl backdrop-blur-xs">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B] fill-[#F59E0B] drop-shadow-[0_0_4px_rgba(245,158,11,0.35)]" />
                    </motion.div>
                  ))}
                </div>
                <span className="text-[11px] sm:text-xs font-black text-slate-800 ml-1">4.8/5 Rating</span>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-600 mt-0.5">
                Trusted by <span className="text-[#6d4aff] font-black">10,000+</span> Students
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right: Floating AI Avatar Coach Card with Glow and 3D Parallax */}
        <div className="lg:col-span-6 relative flex items-center justify-center mt-4 lg:mt-0 lg:pt-14 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative w-full max-w-[340px] sm:max-w-[460px] lg:max-w-[560px] xl:max-w-[680px] mx-auto z-20"
          >
            {/* Pulsing light rings */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-amber-500/25 to-teal-500/20 rounded-full blur-3xl opacity-80 animate-pulse pointer-events-none" />

            <div className="relative flex flex-col gap-6 items-center w-full">
              <div className="relative w-full h-[340px] sm:h-[460px] rounded-[32px] overflow-hidden border-2 border-white/50 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 bg-white/20 backdrop-blur-md">
                <img
                  src="/ai-avatar.png"
                  alt="AI Study Partner Avatar"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />

                {/* Floating overlay status badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md border border-neutral-100 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Active Online</span>
                </div>

                <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-neutral-900/80 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-xl shadow-sm text-[10px] font-bold">
                  <span>Accuracy:</span>
                  <span className="text-emerald-400">99.8%</span>
                </div>
              </div>
            </div>
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
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/70 backdrop-blur-md border border-[#ECECEC] flex items-center justify-center shadow-lg hover:shadow-xl hover:border-emerald-500/30 hover:text-emerald-650 text-slate-500 transition-all"
        >
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>
      </div>
    </section>
  );
}
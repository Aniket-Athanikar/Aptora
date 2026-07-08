"use client";

import { motion } from "framer-motion";
import { Sparkles, Play, Bot, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/lib/ToastContext";

export default function CTA() {
  const { toast } = useToast();
  return (
    <section className="py-16 md:py-20 bg-transparent relative border-t border-[#ECECEC] overflow-hidden">
      {/* Reduced max-width to 1024px for a sleeker, medium-sized banner */}
      <div className="layout-container max-w-[1024px] px-4 mx-auto">

        {/* Compact Gradient Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] rounded-3xl p-8 md:p-12 text-white text-center flex flex-col items-center justify-center gap-5 overflow-hidden shadow-xl"
        >
          {/* Background Image texture */}
          <div className="absolute inset-0 z-0 opacity-25">
            <Image
              src="/cta-bg.png"
              alt="CTA Background texture"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Ambient circles */}
          <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[60px] z-0" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[60px] z-0" />

          {/* Floating AI Avatar Vector/Icon (Scaled down) */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute left-4 md:left-12 top-8 md:top-10 opacity-15 md:opacity-20 pointer-events-none"
          >
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <Bot className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </motion.div>

          {/* Floating Book Icon (Scaled down) */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
            className="absolute right-4 md:right-12 top-6 md:top-8 opacity-15 md:opacity-20 pointer-events-none"
          >
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </motion.div>

          {/* Floating Student Icon (Scaled down) */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute left-8 md:left-16 bottom-6 md:bottom-8 opacity-15 md:opacity-20 pointer-events-none"
          >
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </motion.div>

          {/* Core Content */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider z-10 shadow-sm">
            <Sparkles className="w-3 h-3" /> Start Learning Today
          </span>

          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight max-w-xl mt-1 z-10">
            Ready to Transform <br />Your Preparation?
          </h2>

          <p className="text-xs md:text-sm text-purple-50 font-medium max-w-md leading-relaxed z-10">
            Join 10,000+ students who are already achieving their dreams with ExamForge AI. Get personalized plans and mock tests in seconds.
          </p>

          <div className="flex flex-wrap gap-3 items-center justify-center mt-3 z-10">
            <Link href="/login" onClick={() => toast("Redirecting to login portal...", "info")}>
              <button className="bg-white hover:bg-neutral-50 text-neutral-900 text-sm font-bold px-6 py-3 rounded-full cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                Start Free Now
              </button>
            </Link>
            <Link href="/how-it-works" onClick={() => toast("Opening platform video tour...", "info")} className="inline-flex items-center gap-2 text-white hover:text-purple-50 text-sm font-bold px-5 py-3 cursor-pointer transition-colors bg-white/10 hover:bg-white/15 border border-white/10 rounded-full">
              <Play className="w-3.5 h-3.5 text-white fill-white" /> Watch Demo
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
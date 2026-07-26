"use client";

import { motion } from "framer-motion";
import { Sparkles, Play, Bot, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/ToastContext";

export default function CTA() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-16 md:py-20 bg-transparent relative border-t border-slate-100 overflow-hidden">
      <div className="layout-container max-w-[1024px] px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-[#6D4AFF] via-[#8B5CF6] to-[#4F46E5] rounded-[32px] p-8 md:p-14 text-white text-center flex flex-col items-center justify-center gap-6 overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Animated Ambient Glowing Orbs */}
          <div className="absolute -top-[40%] -left-[20%] w-[60%] h-[80%] bg-white/10 rounded-full blur-[90px] animate-pulse pointer-events-none" />
          <div className="absolute -bottom-[40%] -right-[20%] w-[60%] h-[80%] bg-[#A855F7]/20 rounded-full blur-[90px] animate-pulse pointer-events-none" />

          {/* Interactive CSS Perspective Grid */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none z-0"
            style={{ perspective: "200px" }}
          >
            <div 
              className="w-full h-[200%] origin-top"
              style={{ 
                transform: "rotateX(60deg)",
                backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }}
            />
          </div>

          {/* Floating Icons with 3D Bobbing */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute left-6 md:left-14 top-10 opacity-20 pointer-events-none"
          >
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
            className="absolute right-6 md:right-14 top-8 opacity-20 pointer-events-none"
          >
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1 }}
            className="absolute left-10 md:left-20 bottom-10 opacity-20 pointer-events-none"
          >
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
          </motion.div>

          {/* Core Content */}
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-black rounded-full uppercase tracking-wider z-10 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Start Learning Today
          </span>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-xl mt-1 z-10">
            Ready to Transform <br />Your Preparation?
          </h2>

          <p className="text-xs md:text-sm text-purple-100 font-bold max-w-md leading-relaxed z-10 opacity-90">
            Join 10,000+ students who are already achieving their dreams with ExamForge-AI. Get personalized plans and mock tests in seconds.
          </p>

          <div className="flex flex-wrap gap-4 items-center justify-center mt-3 z-10">
            {mounted ? (
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                onClick={() => {
                  if (isAuthenticated) {
                    toast("Launching your study dashboard...", "success");
                  } else {
                    toast("Redirecting to login portal...", "info");
                  }
                }}
              >
                <button className="bg-white hover:bg-slate-50 text-neutral-900 text-sm font-black px-7 py-3.5 rounded-full cursor-pointer shadow-lg hover:shadow-xl hover:scale-103 transition-all duration-300">
                  Start Free Now
                </button>
              </Link>
            ) : (
              <button className="bg-white hover:bg-slate-50 text-neutral-900 text-sm font-black px-7 py-3.5 rounded-full cursor-pointer shadow-lg hover:shadow-xl hover:scale-103 transition-all duration-300">
                Start Free Now
              </button>
            )}
            <Link 
              href="/how-it-works" 
              onClick={() => toast("Opening platform video tour...", "info")} 
              className="inline-flex items-center gap-2 text-white hover:text-purple-50 text-sm font-black px-6 py-3.5 cursor-pointer transition-all bg-white/10 hover:bg-white/15 border border-white/15 rounded-full hover:scale-103 shadow-md"
            >
              <Play className="w-3.5 h-3.5 text-white fill-white" /> Watch Demo
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

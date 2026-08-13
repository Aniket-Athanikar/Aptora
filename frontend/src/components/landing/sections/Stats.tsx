"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Users, FileText, BookOpen, Trophy, Sparkles } from "lucide-react";

export default function Stats() {
  const stats = [
    { value: 10000, suffix: "+", label: "Active Students", icon: Users },
    { value: 1000000, suffix: "+", label: "AI Questions", icon: FileText },
    { value: 50000, suffix: "+", label: "Syllabus Books", icon: BookOpen },
    { value: 95, suffix: "%", label: "Success Rate", icon: Trophy },
    { value: 10, suffix: "+", label: "Major Exams", icon: Sparkles },
  ];

  return (
    <section className="py-10 px-4">
      <div className="layout-container max-w-[1024px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-600 rounded-[32px] p-8 md:p-12 text-white overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Animated Ambient Glowing Orbs */}
          <div className="absolute -top-[40%] -left-[20%] w-[60%] h-[80%] bg-white/10 rounded-full blur-[90px] animate-pulse pointer-events-none" />
          <div className="absolute -bottom-[40%] -right-[20%] w-[60%] h-[80%] bg-teal-500/25 rounded-full blur-[90px] animate-pulse pointer-events-none" />

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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 relative z-10">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.6 }}
                  className="flex flex-col items-center text-center gap-2 group cursor-pointer"
                >
                  {/* Floating Micro Icon */}
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-md group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                      <AnimatedCounter end={item.value} suffix={item.suffix} />
                    </h3>
                    <p className="text-[10px] sm:text-xs font-bold text-emerald-100 uppercase tracking-widest">
                      {item.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

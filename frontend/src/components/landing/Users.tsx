"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { User, ShieldCheck, Briefcase, School } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import SectionHeading from "../ui/SectionHeading";

// High-Performance 3D Tilt Wrapper for horizontal cards
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 180, mass: 0.5 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  // Moderate tilt angles for horizontal cards to maintain readability
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
      className={`relative w-full cursor-pointer group ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function Users() {
  const users = [
    {
      title: "Students",
      description: "School, College & University Students",
      icon: User,
      color: "bg-blue-500/5 text-blue-600 border-blue-500/20 group-hover:bg-blue-500/10",
      glow: "hover:shadow-[0_15px_35px_-10px_rgba(59,130,246,0.2)] hover:border-blue-500/40",
    },
    {
      title: "Job Aspirants",
      description: "Government Job Aspirants",
      icon: ShieldCheck,
      color: "bg-emerald-500/5 text-emerald-600 border-emerald-500/20 group-hover:bg-emerald-500/10",
      glow: "hover:shadow-[0_15px_35px_-10px_rgba(16,185,129,0.2)] hover:border-emerald-500/40",
    },
    {
      title: "Professionals",
      description: "Upskill & Crack Competitive Exams",
      icon: Briefcase,
      color: "bg-purple-500/5 text-purple-600 border-purple-500/20 group-hover:bg-purple-500/10",
      glow: "hover:shadow-[0_15px_35px_-10px_rgba(168,85,247,0.2)] hover:border-purple-500/40",
    },
    {
      title: "Institutes",
      description: "Deliver Better Results with AI Power",
      icon: School,
      color: "bg-orange-500/5 text-orange-600 border-orange-500/20 group-hover:bg-orange-500/10",
      glow: "hover:shadow-[0_15px_35px_-10px_rgba(249,115,22,0.2)] hover:border-orange-500/40",
    },
  ];

  // Premium easing curve
  const customEase = [0.21, 1.02, 0.43, 1.01];

  return (
    <section className="py-20 bg-[#faf9ff] border-t border-[#ECECEC] relative overflow-hidden perspective-[1200px]">

      {/* Subtle Ambient Background Mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-40 select-none overflow-hidden">
        <div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-gradient-to-br from-[#6D4AFF]/5 to-transparent rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-[80px]" />
      </div>

      <div className="layout-container max-w-[1320px] px-4 mx-auto relative z-10">
        {/* Heading */}
        <SectionHeading
          badge="Target Audience"
          title="Who is ExamForge"
          gradientTitle="AI For?"
          description="Perfect for every aspirant at every stage of their learning journey."
        />

        {/* Audience Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {users.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: customEase }}
              className="flex"
            >
              <TiltCard className="flex w-full">
                <GlassCard
                  className={`flex items-center gap-5 p-5 pr-6 bg-white/70 backdrop-blur-xl border-[#ECECEC] rounded-[24px] w-full transition-all duration-500 shadow-sm overflow-hidden ${item.glow}`}
                >

                  {/* Decorative corner glow inside the card */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-bl from-current to-transparent opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 rounded-full blur-xl pointer-events-none" />

                  {/* Z-Depth Parallax Icon */}
                  <div
                    style={{ transform: "translateZ(40px)" }}
                    className={`w-14 h-14 rounded-[18px] border flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md ${item.color}`}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>

                  {/* Z-Depth Parallax Text Block */}
                  <div style={{ transform: "translateZ(25px)" }} className="flex flex-col justify-center">
                    <h3 className="font-extrabold text-neutral-900 text-[15px] leading-tight group-hover:text-neutral-950 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-semibold mt-1 leading-snug">
                      {item.description}
                    </p>
                  </div>

                </GlassCard>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
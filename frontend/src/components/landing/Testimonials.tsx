"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { Star, Quote } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import SectionHeading from "../ui/SectionHeading";
import GlowButton from "../ui/GlowButton";

// 3D Tilt Wrapper Component for Deep Logic Hover Mechanics
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [10, -10]); // Slightly softer tilt for reading
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-10, 10]);

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

export default function Testimonials() {
  const feedback = [
    {
      name: "Rahul Kumar",
      badge: "SSC CGL 2025 Ranker",
      review: "ExamForge AI changed my preparation completely. The AI notes and daily practice helped me crack SSC CGL in my first attempt!",
      stars: 5,
      avatar: "R",
    },
    {
      name: "Priya Sharma",
      badge: "UPSC Aspirant",
      review: "The AI tutor is like having a personal teacher 24x7. I love how it explains everything from my own textbooks and uploads.",
      stars: 5,
      avatar: "P",
    },
    {
      name: "Amit Verma",
      badge: "Bank PO Aspirant",
      review: "Best platform for practice and mock tests. The analytics helped me identify my weak areas and improve my score by 20%.",
      stars: 5,
      avatar: "A",
    },
  ];

  // Quadrupled to ensure the marquee has enough length to never show a blank gap during the 50% loop reset
  const extendedFeedback = [...feedback, ...feedback, ...feedback, ...feedback];

  return (
    <section id="testimonials" className="py-20 bg-transparent relative border-t border-[#ECECEC] overflow-hidden perspective-[1200px]">

      {/* Ambient Animated Background Rings */}
      <div className="absolute inset-0 pointer-events-none opacity-30 select-none overflow-hidden flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute w-[800px] h-[800px] rounded-full border border-dashed border-[#6D4AFF]/15"
        />
      </div>

      <div className="layout-container max-w-[1320px] px-4 mx-auto relative z-10 mb-12">
        <SectionHeading
          badge="Testimonials"
          title="What Students Say About"
          gradientTitle="Us"
          description="Real stories from real toppers who cracked their dream exams."
        />
      </div>

      {/* Framer Motion Auto-Carousel Wrapper */}
      <div className="relative w-full flex overflow-hidden group py-8">

        {/* Left and Right Gradient Masks for the vignette fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-r from-[var(--background)] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-l from-[var(--background)] to-transparent z-20 pointer-events-none" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 60, // Slower speed for comfortable reading of text
            repeat: Infinity
          }}
          className="flex gap-6 md:gap-8 px-4 md:px-8 w-max hover:[animation-play-state:paused]"
        >
          {extendedFeedback.map((item, idx) => (
            <div key={idx} className="w-[320px] sm:w-[380px] flex-shrink-0">
              <TiltCard className="h-full">
                <GlassCard
                  className="relative flex flex-col justify-between p-8 bg-[var(--surface)]/70 backdrop-blur-xl border-white/20 rounded-[32px] min-h-[240px] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(109,74,255,0.15)] hover:border-[#6D4AFF]/30 transition-all duration-500 overflow-hidden"
                >
                  {/* Decorative Background Quote Icon */}
                  <Quote className="absolute top-6 right-6 w-16 h-16 text-[#6D4AFF]/5 -z-10 transform -scale-x-100" />

                  <div style={{ transform: "translateZ(30px)" }}>
                    {/* Stars */}
                    <div className="flex gap-1 mb-5">
                      {[...Array(item.stars)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B] drop-shadow-sm" />
                      ))}
                    </div>
                    {/* Review Text */}
                    <p className="text-sm text-neutral-600 font-semibold leading-relaxed">
                      &ldquo;{item.review}&rdquo;
                    </p>
                  </div>

                  {/* Profile Section with high Z-Depth */}
                  <div
                    style={{ transform: "translateZ(50px)" }}
                    className="flex items-center gap-4 mt-8 pt-5 border-t border-[#ECECEC]/60"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6D4AFF] to-[#8B5CF6] text-white font-black flex items-center justify-center text-lg shadow-lg shadow-[#6D4AFF]/20">
                      {item.avatar}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-neutral-900 text-sm leading-tight group-hover:text-[#6D4AFF] transition-colors duration-300">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-neutral-500 font-bold mt-1 block uppercase tracking-wider">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </TiltCard>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Success Stories CTA Button */}
      <div className="flex justify-center mt-12 relative z-10">
        <Link href="/success-stories">
          <GlowButton variant="gradient" className="px-8 py-3.5 text-xs font-black" magnetic={false}>
            Explore More Success Stories
          </GlowButton>
        </Link>
      </div>
    </section>
  );
}

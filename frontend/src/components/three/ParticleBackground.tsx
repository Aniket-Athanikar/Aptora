"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ThreeHero = dynamic(() => import("./ThreeHero"), {
  ssr: false,
});

export default function ParticleBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Light Theme Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.4]" />
      <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern opacity-[0.5]" />
      <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient" />

      {/* Interactive WebGL Neural Network canvas */}
      <div className="absolute inset-0 w-full h-full opacity-60 z-0 pointer-events-none">
        <ThreeHero />
      </div>

      {/* Floating purple energy blobs */}
      <div className="absolute top-[20%] left-[10%] w-[35rem] h-[35rem] rounded-full bg-gradient-to-br from-[#6D4AFF]/10 to-[#8B5CF6]/5 blur-[120px] animate-soft-pulse" />
      <div className="absolute bottom-[10%] right-[15%] w-[40rem] h-[40rem] rounded-full bg-gradient-to-br from-[#4F46E5]/10 to-[#A855F7]/5 blur-[160px] animate-soft-pulse [animation-delay:3s]" />

      {/* Soft Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] stroke-[#6D4AFF]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6D4AFF" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        <path d="M-100,200 C300,400 600,100 1600,500" fill="none" strokeWidth="2" stroke="url(#line-grad)" />
        <path d="M-50,600 C400,300 800,800 1500,400" fill="none" strokeWidth="1.5" stroke="url(#line-grad)" />
      </svg>

      {/* Noise layer overlay */}
      <div className="absolute inset-0 bg-noise mix-blend-overlay pointer-events-none" />
    </div>
  );
}

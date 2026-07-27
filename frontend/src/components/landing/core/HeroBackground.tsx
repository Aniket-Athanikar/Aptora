import React from "react";
import ParticleBackground from "@/components/three/ParticleBackground";

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <ParticleBackground />
      {/* Dynamic ambient highlight */}
      <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[70%] h-[30%] bg-gradient-to-b from-[#8B5CF6]/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}

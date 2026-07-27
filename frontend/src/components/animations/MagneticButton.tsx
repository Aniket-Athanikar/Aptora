"use client";

import { useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Spring physics for natural elastic movement
  const springConfig = { damping: 15, stiffness: 180, mass: 0.15 };
  
  const mX = useSpring(position.x, springConfig);
  const mY = useSpring(position.y, springConfig);

  // Transform coordinates to 3D perspective rotation angles
  const rotateX = useTransform(mY, [-30, 30], [8, -8]);
  const rotateY = useTransform(mX, [-30, 30], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Vector distance from center
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    
    // Magnetic pull: move 38% towards cursor coordinates
    setPosition({ x: x * 0.38, y: y * 0.38 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div style={{ perspective: 600 }} className="inline-block">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          x: mX,
          y: mY,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative transition-shadow duration-300 active:scale-95"
      >
        <div style={{ transform: "translateZ(10px)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

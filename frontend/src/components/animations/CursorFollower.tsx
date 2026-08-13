"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorFollower() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Position for both dot and ring
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Ring spring config (lags behind for organic feel)
  const ringConfig = { damping: 30, stiffness: 220, mass: 0.6 };
  const ringX = useSpring(mouseX, ringConfig);
  const ringY = useSpring(mouseY, ringConfig);

  // Core dot spring config (faster, tighter follow)
  const dotConfig = { damping: 45, stiffness: 400, mass: 0.2 };
  const dotX = useSpring(mouseX, dotConfig);
  const dotY = useSpring(mouseY, dotConfig);

  useEffect(() => {
    setMounted(true);

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseEnterPointer = () => setIsHovered(true);
    const handleMouseLeavePointer = () => setIsHovered(false);

    // Track active interactions
    window.addEventListener("mousemove", moveCursor);

    // Dynamic hover listeners for cursor-pointer elements
    const attachListeners = () => {
      const elements = document.querySelectorAll(".cursor-pointer, button, a, [role='button']");
      elements.forEach((el) => {
        el.addEventListener("mouseenter", handleMouseEnterPointer);
        el.addEventListener("mouseleave", handleMouseLeavePointer);
      });
    };

    // Run initial hook attachment
    attachListeners();

    // Re-bind when DOM changes
    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      observer.disconnect();
      const elements = document.querySelectorAll(".cursor-pointer, button, a, [role='button']");
      elements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnterPointer);
        el.removeEventListener("mouseleave", handleMouseLeavePointer);
      });
    };
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <>
      {/* Outer Glow Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border pointer-events-none z-[9999] hidden lg:block"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: isHovered 
            ? "color-mix(in srgb, var(--primary) 8%, transparent)" 
            : "color-mix(in srgb, var(--primary) 2%, transparent)",
          scale: isHovered ? 1.55 : 1,
          borderColor: isHovered 
            ? "var(--primary)" 
            : "color-mix(in srgb, var(--primary) 40%, transparent)",
          boxShadow: isHovered 
            ? "0 0 15px color-mix(in srgb, var(--primary) 35%, transparent)" 
            : "none",
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.2 }}
      />
      {/* Inner Core Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[9999] hidden lg:block"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          scale: isHovered ? 0.6 : 1,
          backgroundColor: "var(--primary)",
        }}
      />
    </>
  );
}

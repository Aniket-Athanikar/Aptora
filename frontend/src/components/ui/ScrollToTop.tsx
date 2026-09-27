"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPopped, setIsPopped] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    setIsPopped(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setTimeout(() => setIsPopped(false), 600);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 40 }}
          animate={{
            scale: [0, 1.25, 0.92, 1.08, 1],
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 350, damping: 18 },
          }}
          exit={{
            scale: [1, 1.35, 0],
            opacity: 0,
            filter: "blur(6px)",
            transition: { duration: 0.25 },
          }}
          className="fixed bottom-7 right-7 z-[9999]"
        >
          {/* Ambient Outer Bubble Aura Ring */}
          <div className="absolute -inset-2 rounded-full bg-[#084c38]/20 blur-md animate-pulse pointer-events-none" />

          {/* Interactive Bubble Button */}
          <motion.button
            whileHover={{
              scale: 1.18,
              y: -5,
              rotate: [0, -4, 4, 0],
              transition: { type: "spring", stiffness: 400, damping: 12 },
            }}
            whileTap={{ scale: 0.82 }}
            onClick={scrollToTop}
            className="relative w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#063b2b] via-[#084c38] to-[#0a634a] border-2 border-white/50 text-white shadow-xl shadow-[#084c38]/35 cursor-pointer overflow-hidden group select-none"
            aria-label="Scroll to top"
          >
            {/* Liquid Bubble Glass Reflection Highlight */}
            <div className="absolute top-1.5 left-2.5 w-4 h-2.5 rounded-full bg-white/45 blur-[0.5px] pointer-events-none transform -rotate-25" />

            {/* Micro Pop Particles burst effect on click */}
            <AnimatePresence>
              {isPopped && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                      animate={{
                        scale: [0, 1.2, 0],
                        x: (i % 2 === 0 ? 1 : -1) * (18 + i * 6),
                        y: (i < 3 ? -1 : 1) * (18 + i * 4),
                        opacity: [1, 0.8, 0],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute w-2 h-2 rounded-full bg-[#ecfdf5] border border-white/80 pointer-events-none"
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Central Arrow Icon */}
            <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1 text-white stroke-[2.5] relative z-10 drop-shadow-xs" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


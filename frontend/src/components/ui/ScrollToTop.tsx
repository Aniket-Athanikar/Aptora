"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[9999] w-12 h-12 rounded-full flex items-center justify-center bg-white/95 border border-slate-150 shadow-[0_8px_30px_rgba(109,74,255,0.22)] hover:border-[#6D4AFF]/50 text-slate-650 hover:text-[#6D4AFF] transition-all cursor-pointer group"
          aria-label="Scroll to top"
        >
          {/* Centered Circular progress path */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-slate-100 fill-none"
              strokeWidth="2.5"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-[#6D4AFF] fill-none transition-all duration-75"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Central Arrow Icon */}
          <ArrowUp className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5 text-[#6D4AFF]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

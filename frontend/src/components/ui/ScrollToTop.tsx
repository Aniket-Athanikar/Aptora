"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { type: "spring", stiffness: 260, damping: 20 }
          }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          whileHover={{ 
            scale: 1.12, 
            y: -6,
            boxShadow: "0 12px 35px rgba(16, 185, 129, 0.45)"
          }}
          whileTap={{ scale: 0.92, y: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[9999] w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 border border-emerald-400/30 text-white shadow-[0_8px_25px_rgba(16,185,129,0.3)] hover:border-emerald-400 transition-all cursor-pointer group"
          aria-label="Scroll to top"
        >
          {/* Central Arrow Icon */}
          <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1 text-white stroke-[2.5]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import GlowButton from "../ui/GlowButton";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Exams", href: "#exams" },
    { name: "Pricing", href: "#pricing" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-[999] transition-all duration-500",
        scrolled
          ? "py-3 bg-white/80 backdrop-blur-xl border-b border-[#ECECEC] shadow-sm"
          : "py-5 bg-transparent border-transparent"
      )}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto flex items-center justify-between">

        {/* Logo - Restored Animation & Increased Size */}
        <Link
          href="#"
          onClick={() => setActiveLink("#")}
          className="flex items-center gap-3 font-black text-xl tracking-tight text-neutral-900 group"
        >
          <img
            src="/favicon.ico"
            alt="ExamForge AI Logo"
            className="w-12 h-12 md:w-14 md:h-14 rounded-full animate-spin-slow glow-avatar object-cover border-2 border-[#ECECEC]"
          />
          <span className="font-extrabold tracking-wider text-neutral-950 uppercase text-xl mt-1">
            EXAM FORGE<span className="text-[#6D4AFF]"> AI</span>
          </span>
        </Link>

        {/* Center Nav Links with Interactive Stick Line */}
        <nav className="hidden lg:flex items-center gap-8 mt-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setActiveLink(link.href)}
              className={cn(
                "relative text-sm font-bold transition-colors py-2",
                activeLink === link.href
                  ? "text-[#6D4AFF]"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              {link.name}

              {/* Active Click-to-Select Stick Line */}
              {activeLink === link.href && (
                <motion.div
                  layoutId="active-nav-stick"
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#6D4AFF] rounded-full shadow-[0_2px_10px_1px_rgba(109,74,255,0.5)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-4 mt-1">
          <Link href="/login" className="text-sm font-bold text-neutral-600 hover:text-[#6D4AFF] cursor-pointer transition-colors px-4 py-2">
            Login
          </Link>
          <Link href="/login">
            <GlowButton variant="gradient" className="text-xs px-6 py-3 font-bold" magnetic={false}>
              Get Started
            </GlowButton>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-neutral-600 hover:text-[#6D4AFF] transition-colors mt-1"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-[#ECECEC] p-6 shadow-2xl flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  setActiveLink(link.href);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "relative text-base font-bold transition-all px-4 py-3 rounded-xl",
                  activeLink === link.href
                    ? "bg-[#6D4AFF]/5 text-[#6D4AFF]"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                {link.name}
                {/* Mobile Active Stick Line */}
                {activeLink === link.href && (
                  <motion.div
                    layoutId="mobile-active-nav-stick"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-1/2 bg-[#6D4AFF] rounded-r-full shadow-[2px_0_10px_1px_rgba(109,74,255,0.5)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <hr className="border-[#ECECEC]" />

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3.5 font-bold text-neutral-700 border border-[#ECECEC] rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all block"
            >
              Login
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3.5 font-bold bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white rounded-xl shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all block"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Restored & Bolder Glowing Bottom Border Line */}
      <div className="absolute bottom-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-[#6D4AFF] to-transparent shadow-[0_0_20px_3px_rgba(109,74,255,0.85)] z-50" />
    </header>
  );
}
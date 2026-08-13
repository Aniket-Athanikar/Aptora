"use client";

import { motion } from "framer-motion";
import { ChevronRight, Home as HomeIcon } from "lucide-react";
import Link from "next/link";
import { Navbar, Footer } from "@/components/landing";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  breadcrumb?: { label: string; href: string }[];
}

export default function PageLayout({ children, title, description, breadcrumb }: PageLayoutProps) {
  return (
    <div className="relative min-h-screen bg-[var(--background)] text-slate-900 overflow-x-hidden font-sans">
      {/* Premium Clean Background Pattern (Dot Pattern & Interactive Ambient Glows) */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />
      
      {/* Drifting Ambient Glow Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -50, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-emerald-400/5 rounded-full filter blur-[130px]" 
        />
        <motion.div 
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[15%] right-[5%] w-[550px] h-[550px] bg-teal-400/5 rounded-full filter blur-[130px]" 
        />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Page Hero Banner */}
      <section className="relative z-10 pt-36 pb-12 overflow-hidden">
        <div className="max-w-[1320px] px-6 mx-auto">
          {/* Breadcrumb - Sleek Glass Pill */}
          {breadcrumb && breadcrumb.length > 0 && (
            <motion.nav
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)]/60 border border-white/20 backdrop-blur-md text-[11px] font-bold text-slate-500 mb-8 shadow-xs"
            >
              <Link href="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              {breadcrumb.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  {idx === breadcrumb.length - 1 ? (
                    <span className="text-slate-800 font-extrabold">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-emerald-600 transition-colors">{crumb.label}</Link>
                  )}
                </span>
              ))}
            </motion.nav>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 100 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight"
          >
            {title}
          </motion.h1>

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-base md:text-lg text-slate-500 font-bold max-w-2xl leading-relaxed"
            >
              {description}
            </motion.p>
          )}

          {/* Decorative glowing gradient line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="relative mt-8 h-1 w-36 bg-gradient-to-r from-emerald-500 via-amber-400 to-teal-500 rounded-full origin-left shadow-[0_1px_8px_rgba(16,185,129,0.4)]"
          />
        </div>
      </section>

      {/* Page Content */}
      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="relative z-10 pb-28 max-w-[1320px] px-6 mx-auto"
      >
        {children}
      </motion.main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

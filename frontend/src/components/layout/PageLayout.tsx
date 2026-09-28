"use client";

import { motion } from "framer-motion";
import { ChevronRight, Home as HomeIcon, Sparkles } from "lucide-react";
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
    <div className="relative min-h-screen bg-[#FAF9F6] text-slate-900 overflow-x-hidden font-sans selection:bg-[#d1fae5] selection:text-[#084c38] bg-grid-pattern">
      {/* Top Accent Gradient Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400 z-[60]" />

      {/* Background Animated Gradient Mesh Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-emerald-200/40 via-emerald-400/20 to-teal-300/30 rounded-full blur-[130px] pointer-events-none animate-mesh-float z-0" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none animate-pulse-glow z-0" />

      {/* Navbar */}
      <Navbar />

      {/* Page Hero Banner */}
      <section className="relative z-10 pt-32 pb-12 overflow-hidden">
        <div className="max-w-[1240px] px-6 mx-auto">
          {/* Breadcrumb Pill */}
          {breadcrumb && breadcrumb.length > 0 && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-600 mb-6 shadow-2xs backdrop-blur-sm"
            >
              <Link href="/" className="hover:text-[#084c38] transition-colors flex items-center gap-1">
                <HomeIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Home</span>
              </Link>
              {breadcrumb.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  {idx === breadcrumb.length - 1 ? (
                    <span className="text-[#084c38] font-black">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-[#084c38] transition-colors">{crumb.label}</Link>
                  )}
                </span>
              ))}
            </motion.nav>
          )}

          {/* Title with Gradient Text */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight font-display"
          >
            {title}
          </motion.h1>

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-base md:text-lg text-slate-600 font-medium max-w-2xl leading-relaxed"
            >
              {description}
            </motion.p>
          )}

          {/* Gradient Accent Bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="relative mt-6 h-1.5 w-28 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400 rounded-full origin-left shadow-2xs"
          />
        </div>
      </section>

      {/* Page Content */}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative z-10 pb-24 max-w-[1240px] px-6 mx-auto"
        suppressHydrationWarning
      >
        {children}
      </motion.main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

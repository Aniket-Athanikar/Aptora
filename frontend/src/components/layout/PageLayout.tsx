"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  breadcrumb?: { label: string; href: string }[];
}

export default function PageLayout({ children, title, description, breadcrumb }: PageLayoutProps) {
  return (
    <div className="relative min-h-screen bg-white text-neutral-900 overflow-x-hidden font-sans">
      {/* Premium Clean Background Pattern (Dot Pattern & Soft Ambient Glows) */}
      <div className="absolute inset-0 bg-dot-pattern bg-radial-gradient z-0 opacity-80" />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-[#6D4AFF]/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[25%] right-[10%] w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full filter blur-[120px]" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Page Hero Banner */}
      <section className="relative z-10 pt-36 pb-16 overflow-hidden">
        <div className="layout-container max-w-[1320px] px-4 mx-auto">
          {/* Breadcrumb */}
          {breadcrumb && breadcrumb.length > 0 && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 mb-6"
            >
              <Link href="/" className="hover:text-[#6D4AFF] transition-colors">Home</Link>
              {breadcrumb.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3" />
                  {idx === breadcrumb.length - 1 ? (
                    <span className="text-neutral-700">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-[#6D4AFF] transition-colors">{crumb.label}</Link>
                  )}
                </span>
              ))}
            </motion.nav>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-4xl md:text-5xl font-black text-neutral-900 leading-tight"
          >
            {title}
          </motion.h1>

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-4 text-base md:text-lg text-neutral-500 font-semibold max-w-2xl"
            >
              {description}
            </motion.p>
          )}

          {/* Decorative gradient line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 h-[3px] w-32 bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] rounded-full origin-left"
          />
        </div>
      </section>

      {/* Page Content */}
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative z-10 pb-24"
      >
        {children}
      </motion.main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

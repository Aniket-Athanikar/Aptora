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
    <div className="relative min-h-screen bg-[#FAF9F6] text-slate-900 overflow-x-hidden font-sans selection:bg-[#d1fae5] selection:text-[#084c38]">
      {/* Navbar */}
      <Navbar />

      {/* Page Hero Banner */}
      <section className="relative z-10 pt-32 pb-10 overflow-hidden">
        <div className="max-w-[1240px] px-6 mx-auto">
          {/* Breadcrumb */}
          {breadcrumb && breadcrumb.length > 0 && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-500 mb-6 shadow-2xs"
            >
              <Link href="/" className="hover:text-[#084c38] transition-colors flex items-center gap-1">
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              {breadcrumb.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  {idx === breadcrumb.length - 1 ? (
                    <span className="text-slate-900 font-bold">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-[#084c38] transition-colors">{crumb.label}</Link>
                  )}
                </span>
              ))}
            </motion.nav>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight"
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

          {/* Deep emerald accent line matching Aptora design language */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="relative mt-6 h-1 w-24 bg-[#084c38] rounded-full origin-left"
          />
        </div>
      </section>

      {/* Page Content */}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative z-10 pb-24 max-w-[1240px] px-6 mx-auto"
      >
        {children}
      </motion.main>

      {/* Footer */}
      <Footer />
    </div>
  );
}


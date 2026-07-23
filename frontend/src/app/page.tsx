"use client";

import SmoothScroll from "@/components/animations/SmoothScroll";
import CursorFollower from "@/components/animations/CursorFollower";
import ScrollToTop from "@/components/ui/ScrollToTop";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Stats from "@/components/landing/Stats";
import Exams from "@/components/landing/Exams";
import Users from "@/components/landing/Users";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <main className="relative min-h-screen bg-[var(--background)] text-slate-900 overflow-hidden font-sans selection:bg-indigo-500/15 selection:text-indigo-700">
        <CursorFollower />
        <ScrollToTop />

        {/* Ambient glow highlights — soft, premium */}
        <div className="fixed inset-0 -z-10 pointer-events-none bg-mesh opacity-70" />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-grid opacity-30" />

        <Navbar />

        <div className="relative z-10 flex flex-col w-full">
          <Hero />
          <HowItWorks />
          <Features />
          <div className="layout-container max-w-[1024px] mx-auto px-6 opacity-40">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          </div>
          <Stats />
          <Exams />
          <Users />
          <Pricing />
          <Testimonials />
          <CTA />
          <Footer />
        </div>
      </main>
    </SmoothScroll>
  );
}

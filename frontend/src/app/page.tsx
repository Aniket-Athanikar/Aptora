"use client";

import CursorFollower from "@/components/animations/CursorFollower";
import SmoothScroll from "@/components/animations/SmoothScroll";
import { ScrollToTop } from "@/components/ui";
import {
  CTA,
  Exams,
  Features,
  Footer,
  Hero,
  HowItWorks,
  Navbar,
  Pricing,
  Stats,
  Testimonials,
  Users,
} from "@/components/landing";

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

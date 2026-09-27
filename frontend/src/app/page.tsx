"use client";

import {
  Navbar,
  Hero,
  TrustProof,
  HowItWorks,
  ProductShowcase,
  AIPersonalization,
  Exams,
  FeatureShowcase,
  AIAutomation,
  Users,
  Testimonials,
  Pricing,
  FAQ,
  CTA,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#FAF9F6] text-slate-900 font-sans selection:bg-emerald-500/15 selection:text-emerald-800">
      <Navbar />

      <div className="relative z-10 flex flex-col w-full">
        <Hero />
        <TrustProof />
        <HowItWorks />
        <ProductShowcase />
        <AIPersonalization />
        <Exams />
        <FeatureShowcase />
        <AIAutomation />
        <Users />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}

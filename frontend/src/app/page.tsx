"use client";

import SmoothScroll from "@/components/animations/SmoothScroll";
import CursorFollower from "@/components/animations/CursorFollower";
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
import ParticleBackground from "@/components/three/ParticleBackground";

export default function Home() {
  return (
    <SmoothScroll>
      {/* 
        Global wrapper with custom text selection highlighting matching the brand theme.
        Set base background to the off-white #faf9ff to blend seamlessly with the components.
      */}
      <main className="relative min-h-screen bg-[#faf9ff] text-neutral-900 overflow-hidden font-sans selection:bg-[#6D4AFF]/20 selection:text-[#6D4AFF]">

        {/* Customized Cursor Follower ring */}
        <CursorFollower />

        {/* Global Particles, Grid Layouts and Mesh Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <ParticleBackground />
        </div>

        {/* Fixed Header */}
        <Navbar />

        {/* 
          Page Content Wrapper
          Z-10 ensures the physical components sit above the fixed particle background.
        */}
        <div className="relative z-10 flex flex-col w-full">
          {/* Hero Area */}
          <Hero />

          {/* How It Works (4 Steps) */}
          <HowItWorks />

          {/* Powerful Features Auto-Carousel */}
          <Features />

          {/* Gradient Stats Section */}
          <Stats />

          {/* Exams Coverage Grid */}
          <Exams />

          {/* Target Users Segmentation */}
          <Users />

          {/* Price Package Plans */}
          <Pricing />

          {/* Student Testimonials Auto-Carousel */}
          <Testimonials />

          {/* Call To Action Banner */}
          <CTA />
        </div>

        {/* Footer info links */}
        <Footer />

      </main>
    </SmoothScroll>
  );
}
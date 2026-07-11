"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  Phone,
  Loader2
} from "lucide-react";
import { useToast } from "@/lib/ToastContext";

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast("Please enter a valid email address.", "error");
      return;
    }
    setIsSubscribing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        toast(data.message || "Subscribed successfully!", "success");
        setEmail("");
      } else {
        toast("Failed to subscribe. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Could not connect to the server.", "error");
    } finally {
      setIsSubscribing(false);
    }
  };

  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const socialIcons = [
    { icon: Facebook, href: "https://www.facebook.com/examforge" },
    { icon: Twitter, href: "https://twitter.com/examforge" },
    { icon: Instagram, href: "https://www.instagram.com/s.o.n.u03" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/mrunal-chaudhari03" },
    { icon: Youtube, href: "https://www.youtube.com/@examforge" },
    { icon: Phone, href: "https://wa.me/919970751798" },
  ];

  return (
    <footer className="text-neutral-700 py-16 border-t border-neutral-200 relative z-10 overflow-hidden bg-white">
      {/* Brand Ambient background glows - Matching Navbar Purple Accent */}
      <div className="absolute top-0 left-[25%] w-[50%] h-[120px] bg-gradient-to-b from-[#6D4AFF]/5 via-[#A855F7]/5 to-transparent blur-[80px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] z-0 pointer-events-none" />

      {/* Glowing Top Border Line - Matching Navbar brand colors */}
      <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-[#6D4AFF] via-[#A855F7] via-[#4F46E5] to-transparent shadow-[0_0_20px_4px_rgba(109,74,255,0.25)] z-50 pointer-events-none" />

      <div className="layout-container max-w-[1320px] px-4 mx-auto relative z-10">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 pb-12 border-b border-neutral-200">

          {/* Col 1: Logo & Info */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Logo - Matching Navbar Logo structure and accent */}
            <Link href="/" className="flex items-center gap-3 font-black text-2xl md:text-3xl tracking-tight text-neutral-900 group transition-all duration-300 hover:scale-105 w-fit">
              <Image
                src="/favicon.ico"
                alt="ExamForge AI Logo"
                width={56}
                height={56}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-neutral-100 shadow-sm"
              />
              <span className="font-black tracking-tight text-neutral-900 uppercase text-2xl md:text-3xl mt-1">
                EXAM FORGE<span className="text-[#6D4AFF]"> AI</span>
              </span>
            </Link>

            <p className="text-neutral-500 text-sm font-semibold leading-relaxed max-w-sm">
              AI-powered platform to help students prepare smarter, not harder. Upload, learn, practice, and achieve your dreams.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              {socialIcons.map((soc, idx) => (
                <motion.a
                  key={idx}
                  href={soc.href}
                  whileHover={{ scale: 1.15, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-200 hover:bg-gradient-to-r hover:from-[#6D4AFF] hover:to-[#8B5CF6] hover:border-transparent hover:text-white flex items-center justify-center text-neutral-500 transition-all duration-300 hover:shadow-md cursor-pointer"
                >
                  <soc.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="flex flex-col gap-5">
            <h4 className="text-neutral-900 text-sm font-black tracking-widest uppercase">Product</h4>
            <nav className="flex flex-col gap-3 text-sm font-bold text-neutral-500">
              <Link href="/features" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">Features</Link>
              <Link href="/how-it-works" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">How It Works</Link>
              <Link href="/pricing" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">Pricing</Link>
              <Link href="/exams" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">Exams</Link>
              <Link href="/blog" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">Blog</Link>
            </nav>
          </div>

          {/* Col 3: Company */}
          <div className="flex flex-col gap-5">
            <h4 className="text-neutral-900 text-sm font-black tracking-widest uppercase">Company</h4>
            <nav className="flex flex-col gap-3 text-sm font-bold text-neutral-500">
              <Link href="/about" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">About Us</Link>
              <Link href="/contact" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">Contact Us</Link>
              <Link href="/careers" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">Careers</Link>
              <Link href="/privacy-policy" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">Terms of Service</Link>
            </nav>
          </div>

          {/* Col 4: Support */}
          <div className="flex flex-col gap-5">
            <h4 className="text-neutral-900 text-sm font-black tracking-widest uppercase">Support</h4>
            <nav className="flex flex-col gap-3 text-sm font-bold text-neutral-500">
              <Link href="/help" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">Help Center</Link>
              <Link href="/faqs" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">FAQs</Link>
              <Link href="/feedback" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">Feedback</Link>
              <Link href="/report-bug" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">Report a Bug</Link>
              <Link href="/success-stories" className="hover:text-[#6D4AFF] transition-all duration-300 hover:translate-x-1.5 inline-block">Success Stories</Link>
            </nav>
          </div>

          {/* Col 5: Newsletter */}
          <div className="flex flex-col gap-5">
            <h4 className="text-neutral-900 text-sm font-black tracking-widest uppercase">Newsletter</h4>
            <p className="text-neutral-500 text-sm font-semibold leading-relaxed">
              Subscribe to get the latest study hacks and product updates.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center mt-2 group">
              <input
                type="email"
                required
                value={email || ""}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agentforge29@gmail.com"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#6D4AFF] focus:bg-white transition-all pr-12 font-bold"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="absolute right-1.5 w-9 h-9 rounded-lg bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white flex items-center justify-center hover:from-[#6D4AFF] hover:to-[#8B5CF6] hover:scale-105 hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubscribing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-neutral-500 text-[11px] font-bold uppercase tracking-wider">
          <p>© {year || 2026} Exam Forge AI. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="/security" className="hover:text-[#6D4AFF] transition-colors">Security</Link>
            <span>•</span>
            <Link href="/sitemap" className="hover:text-[#6D4AFF] transition-colors">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
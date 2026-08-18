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
import { getWhatsAppLink } from "@/lib/utils";

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
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
    <footer className="text-neutral-700 py-16 border-t border-white/20 relative z-10 overflow-hidden glass rounded-none backdrop-blur-3xl">
      {/* Brand Ambient background glows - Matching Navbar Emerald Accent */}
      <div className="absolute top-0 left-[25%] w-[50%] h-[120px] bg-gradient-to-b from-amber-500/5 via-emerald-500/5 to-transparent blur-[80px] rounded-full pointer-events-none z-0" />

      {/* 3D perspective wireframe pattern simulating Three.js grid floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-80 overflow-hidden opacity-20 pointer-events-none z-0"
        style={{ perspective: "250px" }}
      >
        <div
          className="w-full h-[250%] origin-bottom"
          style={{
            transform: "rotateX(-55deg)",
            backgroundImage: "linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#efeae2]/10 to-transparent" />
      </div>

      {/* Glowing Top Border Line - Matching Navbar brand colors */}
      <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-transparent via-emerald-500 via-amber-400 via-teal-500 to-transparent shadow-[0_0_25px_6px_rgba(16,185,129,0.5)] z-50 pointer-events-none" />

      <div className="w-full px-4 sm:px-8 md:px-12 relative z-10">

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-12 pb-8 sm:pb-12 border-b border-neutral-200/50">

          {/* Col 1: Logo & Info */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Logo - Matching Navbar Logo structure and accent */}
            <Link href="/" className="flex items-center gap-3 font-black text-2xl md:text-3xl tracking-tight text-neutral-900 group transition-all duration-300 hover:scale-105 w-fit">
              <div className="relative shrink-0" style={{ perspective: 1000 }}>
                <motion.div
                  whileHover={{ rotateY: 180, scale: 1.05 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-150 shadow-md flex items-center justify-center bg-white"
                >
                  <Image
                    src="/favicon.ico"
                    alt="ExamForge AI Vision Logo"
                    width={56}
                    height={56}
                    className="w-full h-full rounded-full object-cover"
                  />
                </motion.div>
              </div>
              <motion.span
                whileHover={{ rotateX: 12, rotateY: -12, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                className="font-black tracking-tight text-neutral-900 text-2xl md:text-3xl mt-1 flex items-center gap-1 select-none"
                style={{
                  transformStyle: "preserve-3d",
                  textShadow: "0px 1px 0px #0c7a3dff, 0px 2px 0px #cbd5e1, 0px 3px 0px #94a3b8, 0px 4px 6px rgba(0,0,0,0.15)",
                }}
              >
                ExamForge-
                <span
                  className="bg-gradient-to-r from-emerald-600 via-teal-605 to-emerald-800 bg-clip-text text-transparent inline-block"
                  style={{
                    filter: "drop-shadow(0px 1px 0px rgba(4, 122, 83, 0.4)) drop-shadow(0px 3px 6px rgba(0,0,0,0.1))",
                    transform: "translateZ(15px)",
                  }}
                >
                  AI
                </span>
                📚
              </motion.span>
            </Link>

            <p className="text-neutral-500 text-sm font-semibold leading-relaxed max-w-sm">
              AI-powered platform to help students prepare smarter, not harder. Select book, learn, practice, and achieve your dreams.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              {socialIcons.map((soc, idx) => (
                <motion.a
                  key={idx}
                  href={mounted && soc.href.startsWith("https://wa.me/") ? getWhatsAppLink(soc.href.split("/").pop() || "") : soc.href}
                  whileHover={{ scale: 1.15, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-200 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-500 hover:border-transparent hover:text-white flex items-center justify-center text-neutral-500 transition-all duration-300 hover:shadow-md cursor-pointer"
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
              <Link href="/features" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">Features</Link>
              <Link href="/how-it-works" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">How It Works</Link>
              <Link href="/pricing" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">Pricing</Link>
              <Link href="/exams" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">Exams</Link>
              <Link href="/blog" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">Blog</Link>
            </nav>
          </div>

          {/* Col 3: Company */}
          <div className="flex flex-col gap-5">
            <h4 className="text-neutral-900 text-sm font-black tracking-widest uppercase">Company</h4>
            <nav className="flex flex-col gap-3 text-sm font-bold text-neutral-500">
              <Link href="/about" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">About Us</Link>
              <Link href="/contact" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">Contact Us</Link>
              <Link href="/careers" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">Careers</Link>
              <Link href="/privacy-policy" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">Terms of Service</Link>
            </nav>
          </div>

          {/* Col 4: Support */}
          <div className="flex flex-col gap-5">
            <h4 className="text-neutral-900 text-sm font-black tracking-widest uppercase">Support</h4>
            <nav className="flex flex-col gap-3 text-sm font-bold text-neutral-500">
              <Link href="/help" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">Help Center</Link>
              <Link href="/faqs" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">FAQs</Link>
              <Link href="/feedback" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">Feedback</Link>
              <Link href="/report-bug" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">Report a Bug</Link>
              <Link href="/success-stories" className="hover:text-emerald-700 transition-all duration-300 hover:translate-x-1.5 inline-block">Success Stories</Link>
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
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all pr-12 font-bold"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="absolute right-1.5 w-9 h-9 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white flex items-center justify-center hover:from-emerald-700 hover:to-teal-600 hover:scale-105 hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
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
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-neutral-200/30 text-neutral-500 text-[11px] font-bold uppercase tracking-wider">
          <p>© {year || 2026} ExamForge-AI. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 sm:mt-0 justify-center">
            <Link href="/privacy-policy" className="hover:text-emerald-700 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms-of-service" className="hover:text-emerald-700 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/security" className="hover:text-emerald-700 transition-colors">Security</Link>
            <span>•</span>
            <Link href="/sitemap" className="hover:text-emerald-700 transition-colors">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
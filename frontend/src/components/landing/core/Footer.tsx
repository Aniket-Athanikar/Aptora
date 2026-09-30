"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  Phone,
  Loader2,
  Sparkles,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { useToast } from "@/lib/ToastContext";
import { AptoraLogo } from "@/components/ui/AptoraLogo";
import { resolveApiUrl } from "@/lib/api-url";

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast("Please enter a valid email address.", "error");
      return;
    }
    setIsSubscribing(true);
    try {
      const res = await fetch(resolveApiUrl("/newsletter/subscribe"), {
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

  const socialIcons = [
    { icon: Facebook, href: "https://www.facebook.com/Aptora", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/Aptora", label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/s.o.n.u03", label: "Instagram" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/mrunal-chaudhari03", label: "LinkedIn" },
    { icon: Youtube, href: "https://www.youtube.com/@Aptora", label: "YouTube" },
    { icon: Phone, href: "https://wa.me/919970751798", label: "WhatsApp Support" },
  ];

  return (
    <footer className="bg-white text-slate-700 py-16 md:py-20 border-t-2 border-emerald-500/20 relative z-10 overflow-hidden">
      {/* Top Animated Gradient Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400 z-50 pointer-events-none" />

      {/* Background Ambient Orbs */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-14 border-b border-slate-200/80">

          {/* Col 1: Logo & Info */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <AptoraLogo size="md" />

            <p className="text-slate-600 text-sm font-normal leading-relaxed max-w-sm">
              AI-powered exam preparation platform helping students prepare smarter, not harder. Turn study material into practice tests, AI notes, and high-yielding analytics.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 mt-1">
              {socialIcons.map((soc, idx) => (
                <motion.a
                  key={idx}
                  href={soc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={soc.label}
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 hover:bg-[#084c38] hover:border-transparent hover:text-white flex items-center justify-center text-slate-600 transition-all duration-200 shadow-2xs cursor-pointer hover:shadow-md"
                >
                  <soc.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="flex flex-col gap-4">
            <h4 className="text-slate-900 text-xs font-black tracking-widest uppercase font-display flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Product
            </h4>
            <nav className="flex flex-col gap-2.5 text-xs font-bold text-slate-600">
              <Link href="/features" className="hover:text-[#084c38] transition-colors">Features</Link>
              <Link href="/how-it-works" className="hover:text-[#084c38] transition-colors">How It Works</Link>
              <Link href="/pricing" className="hover:text-[#084c38] transition-colors">Pricing</Link>
              <Link href="/exams" className="hover:text-[#084c38] transition-colors">Exams</Link>
              <Link href="/blog" className="hover:text-[#084c38] transition-colors">Blog</Link>
            </nav>
          </div>

          {/* Col 3: Company */}
          <div className="flex flex-col gap-4">
            <h4 className="text-slate-900 text-xs font-black tracking-widest uppercase font-display flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Company
            </h4>
            <nav className="flex flex-col gap-2.5 text-xs font-bold text-slate-600">
              <Link href="/about" className="hover:text-[#084c38] transition-colors">About Us</Link>
              <Link href="/contact" className="hover:text-[#084c38] transition-colors">Contact Us</Link>
              <Link href="/careers" className="hover:text-[#084c38] transition-colors">Careers</Link>
              <Link href="/privacy-policy" className="hover:text-[#084c38] transition-colors">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-[#084c38] transition-colors">Terms of Service</Link>
            </nav>
          </div>

          {/* Col 4: Support */}
          <div className="flex flex-col gap-4">
            <h4 className="text-slate-900 text-xs font-black tracking-widest uppercase font-display flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Support
            </h4>
            <nav className="flex flex-col gap-2.5 text-xs font-bold text-slate-600">
              <Link href="/help" className="hover:text-[#084c38] transition-colors">Help Center</Link>
              <Link href="/faqs" className="hover:text-[#084c38] transition-colors">FAQs</Link>
              <Link href="/feedback" className="hover:text-[#084c38] transition-colors">Feedback</Link>
              <Link href="/report-bug" className="hover:text-[#084c38] transition-colors">Report a Bug</Link>
              <Link href="/success-stories" className="hover:text-[#084c38] transition-colors">Success Stories</Link>
            </nav>
          </div>

          {/* Col 5: Newsletter */}
          <div className="flex flex-col gap-4">
            <h4 className="text-slate-900 text-xs font-black tracking-widest uppercase font-display flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Newsletter
            </h4>
            <p className="text-slate-600 text-xs font-medium leading-relaxed">
              Subscribe to get the latest study strategies and Aptora feature updates.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center mt-0.5">
              <input
                type="email"
                required
                value={email || ""}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#084c38] focus:bg-white transition-all pr-10 font-medium shadow-2xs"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                aria-label="Subscribe to newsletter"
                className="absolute right-1 w-7 h-7 rounded-lg bg-gradient-to-r from-[#084c38] to-[#059669] hover:from-[#063b2b] hover:to-[#047857] text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 shadow-2xs hover:scale-105 active:scale-95"
              >
                {isSubscribing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar with System Operational Status Tag */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-slate-600 text-xs font-bold gap-4">
          <p>© {year || 2026} Aptora. All rights reserved.</p>

          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#084c38] text-[11px] font-black">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ALL SYSTEMS OPERATIONAL</span>
          </div> */}

          <div className="flex items-center gap-4">
            <Link href="/security" className="hover:text-[#084c38] transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Security</span>
            </Link>
            <span>•</span>
            <Link href="/sitemap" className="hover:text-[#084c38] transition-colors">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
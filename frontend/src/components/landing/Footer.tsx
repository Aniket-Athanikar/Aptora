"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight
} from "lucide-react";

export default function Footer() {
  const socialIcons = [
    { icon: Facebook, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Linkedin, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  return (
    <footer className="bg-neutral-950 text-neutral-400 py-16 border-t border-neutral-900 relative z-10">

      {/* Restored & Bolder Glowing Top Border Line */}
      <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-[#6D4AFF] to-transparent shadow-[0_0_20px_3px_rgba(109,74,255,0.85)] z-50" />

      <div className="layout-container max-w-[1320px] px-4 mx-auto">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-neutral-800">

          {/* Col 1: Logo & Info */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Logo - Restored Animation & Increased Size (Matching Navbar) */}
            <Link href="#" className="flex items-center gap-3 font-black text-xl tracking-tight text-white group">
              <img
                src="/favicon.ico"
                alt="ExamForge AI Logo"
                className="w-12 h-12 md:w-14 md:h-14 rounded-full animate-spin-slow glow-avatar object-cover border-2 border-neutral-800"
              />
              <span className="font-black tracking-wider text-white uppercase text-xl mt-1">
                EXAM FORGE<span className="text-[#6D4AFF]"> AI</span>
              </span>
            </Link>

            <p className="text-neutral-400 text-sm font-semibold leading-relaxed max-w-sm">
              AI-powered platform to help students prepare smarter, not harder. Upload, learn, practice, and achieve your dreams.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              {socialIcons.map((soc, idx) => (
                <a
                  key={idx}
                  href={soc.href}
                  className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-[#6D4AFF] hover:border-[#6D4AFF] hover:text-white flex items-center justify-center text-neutral-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#6D4AFF]/20"
                >
                  <soc.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white text-xs font-black tracking-widest uppercase">Product</h4>
            <nav className="flex flex-col gap-3 text-sm font-semibold text-neutral-500">
              <Link href="#" className="hover:text-white transition-colors">Features</Link>
              <Link href="#" className="hover:text-white transition-colors">How It Works</Link>
              <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="#" className="hover:text-white transition-colors">Exams</Link>
              <Link href="#" className="hover:text-white transition-colors">Blog</Link>
            </nav>
          </div>

          {/* Col 3: Company */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white text-xs font-black tracking-widest uppercase">Company</h4>
            <nav className="flex flex-col gap-3 text-sm font-semibold text-neutral-500">
              <Link href="#" className="hover:text-white transition-colors">About Us</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact Us</Link>
              <Link href="#" className="hover:text-white transition-colors">Careers</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </nav>
          </div>

          {/* Col 4: Newsletter */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white text-xs font-black tracking-widest uppercase">Newsletter</h4>
            <p className="text-neutral-500 text-sm font-semibold leading-relaxed">
              Subscribe to get the latest study hacks and product updates.
            </p>
            <form className="relative flex items-center mt-2 group">
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#6D4AFF] focus:bg-neutral-900 transition-all pr-12"
              />
              <button
                type="submit"
                className="absolute right-1.5 w-9 h-9 rounded-lg bg-[#6D4AFF] text-white flex items-center justify-center hover:bg-[#8B5CF6] hover:scale-105 hover:shadow-md transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-neutral-600 text-[11px] font-bold uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Exam Forge AI. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-neutral-400 transition-colors">Security</Link>
            <span>•</span>
            <Link href="#" className="hover:text-neutral-400 transition-colors">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
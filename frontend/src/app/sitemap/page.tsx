"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Search, ArrowUpRight, Shield, Cpu, Info, HelpCircle } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const sitemapSections = [
  {
    title: "Product Core",
    icon: Cpu,
    desc: "Explore AI features and preparation plans",
    color: "from-blue-500/10 to-indigo-500/10 text-indigo-600",
    links: [
      { name: "Home Landing", href: "/", desc: "Main gateway & product pitch" },
      { name: "Features", href: "/features", desc: "AI notes, quizzes, and mock tests" },
      { name: "How It Works", href: "/how-it-works", desc: "OCR uploading to study material flow" },
      { name: "Pricing Tiers", href: "/pricing", desc: "Basic, Premium, and Elite plans" },
      { name: "Exams Covered", href: "/exams", desc: "SSC, UPSC, Banking, Engineering list" },
      { name: "Official Blog", href: "/blog", desc: "Aspirant articles and tips" },
    ],
  },
  {
    title: "Company",
    icon: Info,
    desc: "Our mission, vision, and team info",
    color: "from-purple-500/10 to-pink-500/10 text-purple-600",
    links: [
      { name: "About Us", href: "/about", desc: "Platform background & team stats" },
      { name: "Careers", href: "/careers", desc: "Open positions & company culture" },
      { name: "Contact Us", href: "/contact", desc: "Email, WhatsApp, phone, and office details" },
      { name: "Social Media Hub", href: "/social-media", desc: "Handles and subscriber counts" },
      { name: "Success Stories", href: "/success-stories", desc: "Aspirant testimonials and exam results" },
    ],
  },
  {
    title: "Support Hub",
    icon: HelpCircle,
    desc: "Get helper articles and submit reviews",
    color: "from-amber-500/10 to-orange-500/10 text-amber-600",
    links: [
      { name: "Help Center", href: "/help", desc: "Filing uploads, account troubleshooting" },
      { name: "Frequently Asked Qs", href: "/faqs", desc: "Real interactive Accordion FAQs" },
      { name: "Submit Feedback", href: "/feedback", desc: "Star ratings & experience reviews" },
      { name: "Report a Bug", href: "/report-bug", desc: "Upload issues, form validation" },
    ],
  },
  {
    title: "Legal & Authentication",
    icon: Shield,
    desc: "Rules, data processing, and login",
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600",
    links: [
      { name: "Privacy Policy", href: "/privacy-policy", desc: "Information we collect & storage rules" },
      { name: "Terms of Service", href: "/terms-of-service", desc: "User accounts & platform guidelines" },
      { name: "Security Overview", href: "/security", desc: "Encryption and infrastructure safety" },
      { name: "Login & Signup Portal", href: "/login", desc: "Access the multi-step dashboard auth" },
    ],
  },
];

export default function SitemapPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = sitemapSections
    .map((sec) => {
      const filteredLinks = sec.links.filter(
        (lnk) =>
          lnk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lnk.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lnk.href.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...sec, links: filteredLinks };
    })
    .filter((sec) => sec.links.length > 0);

  return (
    <PageLayout
      title="Sitemap Directory"
      description="Easily navigate through all functional routes and portals of ExamForge AI."
      breadcrumb={[{ label: "Sitemap", href: "/sitemap" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto space-y-16">
        
        {/* Search Bar section */}
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search pages (e.g. Pricing, Security, Support)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/70 backdrop-blur-md border border-neutral-200 rounded-2xl pl-12 pr-4 py-4 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF] transition-all font-semibold shadow-sm"
          />
        </div>

        {/* Sitemap Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {filteredSections.map((section, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-8 shadow-sm flex flex-col gap-6"
            >
              {/* Section Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-neutral-100">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900">{section.title}</h3>
                  <p className="text-xs text-neutral-500 font-semibold">{section.desc}</p>
                </div>
              </div>

              {/* Links List */}
              <ul className="flex flex-col gap-4">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      className="group flex items-start justify-between p-3.5 rounded-2xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all duration-300"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-neutral-800 group-hover:text-[#6D4AFF] transition-colors">
                          <Link2 className="w-3.5 h-3.5 opacity-60" />
                          {link.name}
                        </div>
                        <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
                          {link.desc}
                        </p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-500 opacity-0 group-hover:opacity-100 group-hover:text-[#6D4AFF] group-hover:bg-[#6D4AFF]/10 transition-all duration-300">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Global Stats Footer Note */}
        {filteredSections.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <p className="text-neutral-500 font-black text-lg">No sitemap routes matched your search.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm font-black text-[#6D4AFF] hover:underline"
            >
              Clear Search Query
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
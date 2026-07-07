"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Rocket,
  UserCircle,
  CreditCard,
  ScanLine,
  ClipboardCheck,
  Wrench,
  Headphones,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

const topics = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "New to ExamForge? Start here",
    color: "#6D4AFF",
  },
  {
    icon: UserCircle,
    title: "Account & Profile",
    description: "Manage your account settings and security",
    color: "#4F46E5",
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    description: "Billing, subscriptions, and refunds",
    color: "#22C55E",
  },
  {
    icon: ScanLine,
    title: "Selecting & OCR",
    description: "Select content and use OCR to process handwritten notes",
    color: "#F59E0B",
  },
  {
    icon: ClipboardCheck,
    title: "Tests & Practice",
    description: "Mock tests, daily practice, and analytics",
    color: "#8B5CF6",
  },
  {
    icon: Wrench,
    title: "Technical Support",
    description: "Fix bugs and technical issues",
    color: "#EC4899",
  },
  {
    icon: Headphones,
    title: "Contact Support",
    description: "Reach our team for direct help",
    color: "#06B6D4",
  },
  {
    icon: Sparkles,
    title: "AI Features",
    description: "Learn about AI-powered tools",
    color: "#A855F7",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function HelpCenterPage() {
  const [query, setQuery] = useState("");

  const filtered = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageLayout
      title="Help Center"
      description="Find answers, guides, and resources to get the most out of ExamForge AI."
      breadcrumb={[{ label: "Help Center", href: "/help" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search for articles, topics or questions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-2xl pl-14 pr-6 py-4 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/20 transition-all shadow-lg"
            />
          </div>
        </motion.div>

        {/* Popular Topics Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-[#6D4AFF]/5 text-[#6D4AFF] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-[#6D4AFF]/10 mb-4">
            Browse Topics
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
            Popular Topics
          </h2>
          <p className="mt-3 text-neutral-500 font-semibold max-w-xl mx-auto">
            Explore our most visited help categories to find quick answers
          </p>
        </motion.div>

        {/* Topic Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filtered.map((topic) => (
            <motion.div
              key={topic.title}
              variants={itemVariants}
              className="group cursor-pointer bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-7 shadow-lg hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle gradient hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[24px]"
                style={{
                  background: `linear-gradient(135deg, ${topic.color}08, ${topic.color}04)`,
                }}
              />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${topic.color}0D`, border: `1px solid ${topic.color}1A` }}
                >
                  <topic.icon className="w-7 h-7" style={{ color: topic.color }} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-neutral-900 mb-1.5 group-hover:text-[#6D4AFF] transition-colors">
                  {topic.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                  {topic.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#6D4AFF] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No results */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 font-semibold text-lg">
              No topics found for &quot;{query}&quot;
            </p>
            <p className="text-neutral-400 text-sm mt-1">
              Try different keywords or browse all categories
            </p>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}

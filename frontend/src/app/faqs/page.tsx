"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  MessageCircleQuestion,
  Search,
  X,
  Sparkles,
  BookOpen,
  CreditCard,
  ShieldCheck,
  Zap,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { LANDING_FAQS, FAQItem } from "@/components/landing/sections/FAQ";
import Link from "next/link";

const categories = ["All", "General", "AI & Prep Engine", "Billing & Plans", "Security"];

const categoryIcons: Record<string, React.ReactNode> = {
  All: <Sparkles className="w-3.5 h-3.5" />,
  General: <BookOpen className="w-3.5 h-3.5" />,
  "AI & Prep Engine": <Zap className="w-3.5 h-3.5" />,
  "Billing & Plans": <CreditCard className="w-3.5 h-3.5" />,
  Security: <ShieldCheck className="w-3.5 h-3.5" />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFaqs = useMemo(() => {
    return LANDING_FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === "All" || faq.category === selectedCategory;
      const matchesSearch =
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageLayout
      title="Frequently Asked Questions"
      description="Everything you need to know about Aptora's AI-powered exam preparation platform. Can't find what you're looking for? Reach out to our 24/7 support team."
      breadcrumb={[{ label: "FAQs", href: "/faqs" }]}
    >
      <div className="max-w-[1100px] mx-auto">
        
        {/* Search & Category Filter Section */}
        <div className="mb-12 space-y-6">
          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto rounded-3xl bg-white border-2 border-emerald-500/20 shadow-xl overflow-hidden glow-emerald">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-[#084c38]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions or keywords (e.g. mock tests, syllabus, cancellation)..."
              className="w-full pl-12 pr-10 py-4 rounded-3xl bg-white text-slate-900 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#084c38]/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setOpenIndex(0);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#084c38] to-[#059669] text-white shadow-md shadow-[#084c38]/20 scale-105"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {categoryIcons[cat]}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 max-w-3xl mx-auto"
          >
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`relative rounded-3xl bg-white border-2 transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "border-emerald-500/40 shadow-xl ring-2 ring-[#084c38]/10"
                      : "border-emerald-500/20 hover:border-emerald-300 shadow-md"
                  }`}
                >
                  {/* Top Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
                  {/* Question Header */}
                  <button
                    onClick={() => toggle(index)}
                    className="w-full flex items-center justify-between gap-4 p-6 text-left cursor-pointer group"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                          isOpen
                            ? "bg-[#084c38] text-white"
                            : "bg-[#ecfdf5] text-[#084c38] border border-[#d1fae5] group-hover:bg-[#084c38] group-hover:text-white"
                        }`}
                      >
                        <MessageCircleQuestion className="w-5 h-5" />
                      </div>
                      <div>
                        <h3
                          className={`text-base font-bold transition-colors duration-300 ${
                            isOpen ? "text-[#084c38]" : "text-slate-900 group-hover:text-[#084c38]"
                          }`}
                        >
                          {faq.q}
                        </h3>
                        {faq.category && (
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {faq.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen
                          ? "bg-[#084c38] text-white rotate-180"
                          : "bg-slate-100 text-slate-400 group-hover:text-slate-700"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Answer */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" as const }}
                        className="overflow-hidden border-t border-slate-100"
                      >
                        <div className="px-6 pb-6 pt-4 pl-20">
                          <p className="text-sm text-slate-600 font-normal leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 max-w-xl mx-auto px-6">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No matching questions found</h3>
            <p className="text-slate-500 text-sm mb-6">
              We couldn&apos;t find any answers matching &quot;{searchQuery}&quot;. Try adjusting your search term or category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="px-5 py-2.5 rounded-xl bg-[#ecfdf5] text-[#084c38] font-bold text-xs hover:bg-[#d1fae5] transition-colors border border-[#d1fae5]"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Still Have Questions Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16 max-w-2xl mx-auto"
        >
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ecfdf5] rounded-bl-full -z-0 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] border border-[#d1fae5] flex items-center justify-center mx-auto mb-4 text-[#084c38]">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                Still have questions?
              </h3>
              <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
                Can&apos;t find the answer you&apos;re looking for? Our student support team is here to help 24/7.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-[#084c38] hover:bg-[#059669] text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-[#084c38]/20 transition-all text-xs"
                >
                  Contact Support
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-6 py-3 rounded-xl transition-all text-xs"
                >
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </PageLayout>
  );
}

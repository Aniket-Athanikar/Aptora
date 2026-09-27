"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import Link from "next/link";

export interface FAQItem {
  q: string;
  a: string;
  category?: string;
}

export const LANDING_FAQS: FAQItem[] = [
  {
    q: "What is Aptora?",
    a: "Aptora is an AI-powered personalized exam preparation platform built for competitive exam candidates in India (UPSC, SSC, Banking, Railway, State PSC). It combines adaptive daily study scheduling, AI note summarization, smart mock tests, and real-time accuracy analytics into a single preparation space.",
    category: "General",
  },
  {
    q: "Which exams does Aptora support?",
    a: "Aptora currently provides specialized preparation engines for UPSC Civil Services, SSC CGL & CHSL, Banking (IBPS PO/Clerk, SBI PO), Railway (RRB NTPC & Group D), and State Public Service Commissions (State PSCs).",
    category: "General",
  },
  {
    q: "How does AI personalization work?",
    a: "Aptora analyzes your target exam date, total daily study hours, current baseline knowledge, and ongoing mock test accuracy. The AI dynamically allocates daily study blocks, schedules timely revisions before memory decays, and queues targeted practice sets for weak topics.",
    category: "AI & Prep Engine",
  },
  {
    q: "Can I create my own custom study plan?",
    a: "Yes. While Aptora provides automated syllabus-mapped study plans, you can customize your daily time blocks, adjust subject priorities, add custom textbooks, or set specific target dates at any time.",
    category: "AI & Prep Engine",
  },
  {
    q: "Does Aptora include full-length mock tests?",
    a: "Yes. Aptora includes comprehensive full-length and sectional mock tests designed around official exam blueprints and previous year question (PYQ) standards. Every question includes detailed step-by-step solutions.",
    category: "AI & Prep Engine",
  },
  {
    q: "Can I upload handwritten notes or PDFs?",
    a: "Yes! Aptora's advanced OCR engine can process both handwritten and printed materials. Upload photos or scans of your notes to digitize them, generate smart summaries, create flashcards, and build targeted practice quizzes.",
    category: "AI & Prep Engine",
  },
  {
    q: "Can I use Aptora on mobile devices?",
    a: "Yes. Aptora is fully responsive and optimized for desktop, tablet, and mobile browsers, allowing you to review flashcards, solve daily quizzes, or track your schedule on the go.",
    category: "General",
  },
  {
    q: "Can I cancel or upgrade my subscription?",
    a: "Yes. You can upgrade, downgrade, or cancel your subscription at any time directly from your Account Settings with no hidden fees or cancellation penalties.",
    category: "Billing & Plans",
  },
  {
    q: "Do you offer a money-back guarantee?",
    a: "Yes! We offer a 30-day money-back guarantee on all paid plans. If you are not satisfied with Aptora, simply reach out to our support team within 30 days for a full refund — no questions asked.",
    category: "Billing & Plans",
  },
  {
    q: "Is my study data and uploaded material safe?",
    a: "Absolutely. We enforce enterprise-grade AES-256 encryption for data at rest and in transit. Your uploaded study materials and personal test performance remain 100% private and are never shared with third parties.",
    category: "Security",
  },
  {
    q: "Is Aptora suitable for beginners starting from scratch?",
    a: "Absolutely. Beginners benefit from Aptora's structured step-by-step syllabus roadmaps, foundational note summaries, and guided topic progression tailored to baseline skill levels.",
    category: "General",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faqs" className="py-24 md:py-32 bg-white relative overflow-hidden border-b border-slate-200/80">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#084c38]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-[#10b981]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ecfdf5] border border-[#d1fae5] text-[#084c38] text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-slate-600 text-base leading-relaxed">
            Find quick answers to common questions about Aptora&apos;s AI exam preparation platform
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {LANDING_FAQS.slice(0, 8).map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`border rounded-2xl transition-all duration-300 bg-[#FAF9F6]/80 overflow-hidden ${isOpen
                    ? "border-[#084c38]/40 bg-white shadow-md shadow-[#084c38]/5"
                    : "border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-xs"
                  }`}
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-base font-display cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <span className="group-hover:text-[#084c38] transition-colors">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen
                        ? "bg-[#084c38] text-white rotate-180 shadow-xs"
                        : "bg-slate-100 text-slate-500 group-hover:bg-[#ecfdf5] group-hover:text-[#084c38]"
                      }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100">
                        <p className="pt-4 font-normal">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* View All FAQs Link */}
        <div className="text-center mt-12">
          <Link
            href="/faqs"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#084c38] hover:text-[#059669] transition-colors underline underline-offset-4 decoration-2"
          >
            <span>View all FAQs & help topics &rarr;</span>
          </Link>
        </div>

      </div>
    </section>
  );
}

export default FAQ;

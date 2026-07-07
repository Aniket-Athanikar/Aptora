"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircleQuestion } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

const faqs = [
  {
    question: "What is ExamForge AI?",
    answer:
      "ExamForge AI is an AI-powered platform for exam preparation that helps students select smart notes, generate MCQs, build flashcards, and take mock tests — all from their own study material. Select any content and let AI transform it into effective learning tools.",
  },
  {
    question: "Which exams does ExamForge support?",
    answer:
      "ExamForge supports a wide range of competitive exams including SSC, UPSC, Banking (IBPS, SBI), Engineering (MBA, GATE), Teaching (CTET, TET), State PSC, and many more. Our AI adapts to any exam pattern and syllabus.",
  },
  {
    question: "Can I upload handwritten notes?",
    answer:
      "Yes! Our advanced OCR technology can process both handwritten and printed materials. Simply select a photo or scan of your notes, and ExamForge will digitize, organize, and generate study resources from them automatically.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Absolutely. We use enterprise-grade encryption (AES-256) for all data at rest and in transit. Your study materials and personal information are protected by strict privacy policies, and we never share your data with third parties.",
  },
  {
    question: "How are questions generated?",
    answer:
      "Our AI analyzes your selected content using advanced Natural Language Processing (NLP) to understand context, key concepts, and relationships. It then generates contextually relevant multiple-choice questions, fill-in-the-blanks, and short-answer questions with varying difficulty levels.",
  },
  {
    question: "Can I download notes and tests?",
    answer:
      "Yes, PDF export is available for notes, flashcards, and test papers. You can download them for offline study or print them out. Premium users also get access to beautifully formatted exports with custom branding.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept UPI, Credit/Debit cards (Visa, Mastercard, RuPay), Net Banking from all major banks, and popular digital wallets like Paytm, PhonePe, and Google Pay. All transactions are secured with SSL encryption.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied with ExamForge AI for any reason, simply contact our support team within 30 days of purchase for a full refund — no questions asked.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageLayout
      title="Frequently Asked Questions"
      description="Everything you need to know about ExamForge AI. Can't find what you're looking for? Contact our support team."
      breadcrumb={[{ label: "FAQs", href: "/faqs" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-14"
        >
          <span className="inline-block bg-[#6D4AFF]/5 text-[#6D4AFF] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-[#6D4AFF]/10 mb-4">
            Got Questions?
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
            We&apos;ve Got Answers
          </h2>
          <p className="mt-3 text-neutral-500 font-semibold max-w-xl mx-auto">
            Browse through our most commonly asked questions below
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto space-y-4"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`bg-white/70 backdrop-blur-xl border rounded-[20px] shadow-md transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-[#6D4AFF]/30 shadow-lg shadow-purple-500/5"
                    : "border-[#ECECEC] hover:border-[#6D4AFF]/20 hover:shadow-lg"
                }`}
              >
                {/* Question Button */}
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                        isOpen
                          ? "bg-[#6D4AFF] text-white"
                          : "bg-[#6D4AFF]/5 text-[#6D4AFF] border border-[#6D4AFF]/10"
                      }`}
                    >
                      <MessageCircleQuestion className="w-5 h-5" />
                    </div>
                    <h3
                      className={`text-base font-bold transition-colors duration-300 ${
                        isOpen ? "text-[#6D4AFF]" : "text-neutral-900 group-hover:text-[#6D4AFF]"
                      }`}
                    >
                      {faq.question}
                    </h3>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" as const }}
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      isOpen
                        ? "bg-[#6D4AFF] text-white"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" as const }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pl-20">
                        <p className="text-sm text-neutral-600 font-medium leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-10 shadow-lg max-w-2xl mx-auto">
            <HelpCircle className="w-12 h-12 text-[#6D4AFF] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-neutral-500 font-medium text-sm mb-6">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <a
              href="/help"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all"
            >
              Visit Help Center
            </a>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  ChevronUp,
  Link2,
  X,
  Check,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

interface Subtopic {
  id: string;
  title: string;
  content: string;
}

interface Topic {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
  subtopics: Subtopic[];
}

const topics: Topic[] = [
  {
    id: "getting-started",
    icon: Rocket,
    title: "Getting Started",
    description: "New to Aptora? Start here",
    color: "#059669",
    subtopics: [
      {
        id: "what-is-Aptora",
        title: "What is Aptora?",
        content: "Aptora is an AI-powered study companion designed to elevate your exam preparation. By leveraging advanced OCR to digitize handwritten notes, generating personalized mock tests, and analyzing your strengths/weaknesses with the AI Coach, Aptora helps you study smarter and score higher.",
      },
      {
        id: "how-to-register",
        title: "How to create an account",
        content: "Getting started is easy. Click 'Sign Up' in the top right corner of the homepage. You can sign up using your email and a strong password, or sign in directly with your Google or GitHub account. Once signed up, check your email for a verification link to activate your profile.",
      },
      {
        id: "system-requirements",
        title: "System requirements",
        content: "Aptora runs smoothly in any modern web browser on desktop, tablet, or mobile. For the best experience, we recommend using the latest version of Google Chrome, Mozilla Firefox, Apple Safari, or Microsoft Edge. A working camera or document scanner is recommended if you wish to upload handwritten notes for OCR processing.",
      },
    ],
  },
  {
    id: "account-profile",
    icon: UserCircle,
    title: "Account & Profile",
    description: "Manage your account settings and security",
    color: "#4F46E5",
    subtopics: [
      {
        id: "change-password",
        title: "Change or reset your password",
        content: "If you want to update your password, go to your Profile Settings page, scroll down to the 'Security' section, and enter your current password followed by your new password. If you forgot your password, click the 'Forgot Password' link on the login screen to receive a reset link via email.",
      },
      {
        id: "profile-customization",
        title: "Customizing your avatar and profile",
        content: "Personalize your profile by navigating to Settings > Profile. Here, you can change your display name, upload an avatar, select your target exam types (e.g., SAT, MCAT, AP Exams), and set your daily study goals to customize the AI Coach's recommendations.",
      },
      {
        id: "delete-account",
        title: "How to delete your account",
        content: "We're sorry to see you go! If you wish to delete your account permanently, navigate to Settings > Danger Zone, and click 'Delete Account'. Please note that this action is irreversible and all your uploaded documents, generated tests, and progress analytics will be permanently deleted.",
      },
    ],
  },
  {
    id: "payments-billing",
    icon: CreditCard,
    title: "Payments & Billing",
    description: "Billing, subscriptions, and refunds",
    color: "#22C55E",
    subtopics: [
      {
        id: "pricing-plans",
        title: "Aptora Pricing Plans",
        content: "Aptora offers three tiers: Free, Pro ($15/month), and Scholar ($29/month). The Pro plan includes unlimited OCR scans, priority AI response times, and full mock test customization. The Scholar plan adds 1-on-1 AI Coach guidance and advanced analytics reporting. Check our pricing page for more details.",
      },
      {
        id: "update-payment-method",
        title: "Update credit card or billing details",
        content: "To update your credit card or view billing history, go to Settings > Billing. Here, you can securely update your active payment method, download past invoices, or switch between monthly and annual billing cycles.",
      },
      {
        id: "refund-policy",
        title: "Refund policy & processing times",
        content: "We offer a 14-day money-back guarantee for all new subscriptions. If you are unsatisfied with Aptora, you can request a full refund within 14 days of your purchase by contacting billing@Aptora.com. Approved refunds take 5-10 business days to reflect in your account.",
      },
    ],
  },
  {
    id: "selecting-ocr",
    icon: ScanLine,
    title: "Selecting & OCR",
    description: "Select content and use OCR to process handwritten notes",
    color: "#F59E0B",
    subtopics: [
      {
        id: "ocr-basics",
        title: "Introduction to Handwritten Notes OCR",
        content: "Our OCR (Optical Character Recognition) tool allows you to upload photos or scans of your handwritten lecture notes and convert them into clean, editable digital text. Simply upload an image file (PNG, JPG, or PDF) to the Knowledge Engine, and our AI will transcribe it in seconds.",
      },
      {
        id: "supported-languages",
        title: "Supported OCR Languages",
        content: "Aptora OCR supports transcribing notes in English, Spanish, French, German, Portuguese, Italian, Chinese, Japanese, and Korean. We are constantly expanding our multi-language model to support more regional dialects and scientific notation styles.",
      },
      {
        id: "improve-ocr-accuracy",
        title: "Tips for improving OCR accuracy",
        content: "For the best transcription results: 1) Ensure the room has good lighting when taking photos. 2) Hold the camera parallel to the paper. 3) Avoid shadow overlays and heavy folds in the paper. 4) Ensure handwriting is relatively legible without heavy overlapping text.",
      },
    ],
  },
  {
    id: "tests-practice",
    icon: ClipboardCheck,
    title: "Tests & Practice",
    description: "Mock tests, daily practice, and analytics",
    color: "#8B5CF6",
    subtopics: [
      {
        id: "create-practice-test",
        title: "How to generate mock tests",
        content: "Navigate to the 'Practice' tab, choose the study notes or topics you want to test yourself on, select the number of questions and question format (Multiple Choice, Short Answer, or True/False), and click 'Generate Test'. The AI will create a customized test based entirely on your study materials.",
      },
      {
        id: "practice-history",
        title: "Viewing past practice analytics",
        content: "Check your progress over time by visiting the 'Dashboard'. Here you can view your average scores, areas of difficulty flagged by our AI, total study hours logged, and a visual heatmap showing your weekly consistency.",
      },
      {
        id: "sharing-tests",
        title: "Sharing tests with study groups",
        content: "You can collaborate with peers by clicking the 'Share' icon on any generated mock test. This creates a unique URL that you can send to classmates. They can take the test and see how their scores compare anonymously.",
      },
    ],
  },
  {
    id: "technical-support",
    icon: Wrench,
    title: "Technical Support",
    description: "Fix bugs and technical issues",
    color: "#EC4899",
    subtopics: [
      {
        id: "common-errors",
        title: "Resolving common load and sync errors",
        content: "If the dashboard or documents fail to load, ensure you have a stable internet connection. If the issue persists, try logging out and logging back in to refresh your authentication tokens, or check our status page to see if we are undergoing scheduled maintenance.",
      },
      {
        id: "report-a-bug",
        title: "How to report bugs",
        content: "Found a bug? You can report it directly through the 'Report a Bug' page accessible from the sidebar. Please include a description of the bug, steps to reproduce it, and optionally attach a screenshot to help our engineering team resolve it faster.",
      },
      {
        id: "clear-cache",
        title: "Clearing site data and cache",
        content: "If you experience visual glitches or unresponsive buttons, try clearing your browser cache. In Chrome, press Ctrl+Shift+Del (Windows) or Cmd+Shift+Del (Mac), select 'Cached images and files', and click 'Clear data'. Then reload Aptora.",
      },
    ],
  },
  {
    id: "contact-support",
    icon: Headphones,
    title: "Contact Support",
    description: "Reach our team for direct help",
    color: "#06B6D4",
    subtopics: [
      {
        id: "support-hours",
        title: "Support hours & response times",
        content: "Our customer success team is available Monday through Friday, 9 AM to 6 PM EST. Pro and Scholar users receive priority support with typical response times under 2 hours. Free users receive support within 24-48 hours.",
      },
      {
        id: "submit-ticket",
        title: "How to submit a support ticket",
        content: "You can submit a ticket by navigating to the 'Contact Support' page, filling out the contact form with your query type, subject, and message details. You will receive an automated email confirmation with your ticket ID once submitted.",
      },
      {
        id: "phone-support",
        title: "Is there phone support?",
        content: "To keep our pricing plans affordable, we do not offer direct phone support. However, our dedicated live chat and email support systems are fully staffed by human experts who can resolve any issue efficiently.",
      },
    ],
  },
  {
    id: "ai-features",
    icon: Sparkles,
    title: "AI Features",
    description: "Learn about AI-powered tools",
    color: "#A855F7",
    subtopics: [
      {
        id: "ai-study-coach",
        title: "Using the AI Study Coach",
        content: "The AI Study Coach acts as a personal tutor that understands your curriculum. You can chat with it to clarify difficult topics, ask for real-world examples, or request memory techniques (like mnemonics or active recall prompts) tailored to your learning style.",
      },
      {
        id: "automated-summaries",
        title: "Generating automatic study summaries",
        content: "When you upload notes, click 'Summarize' to receive a high-level breakdown. The AI extracts key terminology, formulas, core concepts, and provides a quick-review guide to save you time before examinations.",
      },
      {
        id: "personalized-quizzes",
        title: "Personalized quiz generation",
        content: "Based on your historic performance, the AI detects concepts you frequently get wrong and automatically injects them into future study quizzes. This ensures you target your weak points and review them until mastered.",
      },
    ],
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
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [activeSubtopicId, setActiveSubtopicId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Parse URL hash on load and when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;

      // Find if hash matches a main topic ID
      const matchingTopic = topics.find((t) => t.id === hash);
      if (matchingTopic) {
        setSelectedTopicId(matchingTopic.id);
        setTimeout(() => {
          const el = document.getElementById("subtopics-section");
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
        return;
      }

      // Find if hash matches a subtopic ID
      for (const topic of topics) {
        const matchingSub = topic.subtopics.find((s) => s.id === hash);
        if (matchingSub) {
          setSelectedTopicId(topic.id);
          setActiveSubtopicId(matchingSub.id);
          setTimeout(() => {
            const el = document.getElementById(`subtopics-section`);
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
            const subEl = document.getElementById(`subtopic-${matchingSub.id}`);
            subEl?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 150);
          break;
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTopicClick = (topicId: string) => {
    setSelectedTopicId(topicId);
    setActiveSubtopicId(null);
    window.location.hash = topicId;
  };

  const handleSubtopicClick = (subtopicId: string) => {
    const nextSubtopicId = activeSubtopicId === subtopicId ? null : subtopicId;
    setActiveSubtopicId(nextSubtopicId);
    if (nextSubtopicId) {
      window.location.hash = subtopicId;
    } else {
      window.location.hash = selectedTopicId || "";
    }
  };

  const copyShareLink = (e: React.MouseEvent, subtopicId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#${subtopicId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(subtopicId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filtered = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      t.subtopics.some(
        (sub) =>
          sub.title.toLowerCase().includes(query.toLowerCase()) ||
          sub.content.toLowerCase().includes(query.toLowerCase())
      )
  );

  const activeTopic = topics.find((t) => t.id === selectedTopicId);

  return (
    <PageLayout
      title="Help Center"
      description="Find answers, guides, and resources to get the most out of Aptora AI."
      breadcrumb={[{ label: "Help Center", href: "/help" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto pb-24">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
            <input
              type="text"
              placeholder="Search for articles, topics or questions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/90 backdrop-blur-md border-2 border-emerald-500/20 rounded-2xl pl-14 pr-6 py-4 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 transition-all shadow-xl"
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
          <span className="inline-block bg-emerald-100/70 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200/50 mb-4">
            Browse Topics
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
            Popular Topics
          </h2>
          <p className="mt-3 text-neutral-600 font-semibold max-w-xl mx-auto">
            Explore our most visited help categories to find quick answers
          </p>
        </motion.div>

        {/* Topic Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {filtered.map((topic) => {
            const isSelected = selectedTopicId === topic.id;
            return (
              <motion.div
                key={topic.id}
                variants={itemVariants}
                onClick={() => handleTopicClick(topic.id)}
                className={`group cursor-pointer relative border-2 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-7 hover:-translate-y-1.5 transition-all duration-300 ${
                  isSelected ? "border-emerald-500 shadow-emerald-500/10" : "border-emerald-500/20 hover:border-emerald-500/40"
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
                <div className="pt-1">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-5 shadow-md shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-110">
                    <topic.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-black text-neutral-900 mb-1.5 group-hover:text-emerald-600 transition-colors">
                    {topic.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-neutral-600 font-semibold leading-relaxed">
                    {topic.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="mt-4 flex items-center gap-1 text-xs font-black text-emerald-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Selected Topic's Subtopics Section */}
        <AnimatePresence mode="wait">
          {activeTopic && (
            <motion.div
              key={activeTopic.id}
              id="subtopics-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="relative border-2 border-emerald-500/20 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-8 md:p-10 max-w-4xl mx-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-6 mb-8 pt-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <activeTopic.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-neutral-900">{activeTopic.title}</h3>
                    <p className="text-sm text-neutral-600 font-semibold mt-0.5">{activeTopic.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedTopicId(null);
                    window.location.hash = "";
                  }}
                  className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Subtopics Accordion List */}
              <div className="space-y-4">
                {activeTopic.subtopics.map((sub) => {
                  const isExpanded = activeSubtopicId === sub.id;
                  const isCopied = copiedId === sub.id;
                  return (
                    <div
                      key={sub.id}
                      id={`subtopic-${sub.id}`}
                      className={`border rounded-2xl transition-all duration-300 ${
                        isExpanded ? "border-emerald-500/30 bg-emerald-50/10" : "border-neutral-200/60 bg-white"
                      }`}
                    >
                      <div
                        onClick={() => handleSubtopicClick(sub.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSubtopicClick(sub.id);
                          }
                        }}
                        className="w-full flex items-center justify-between p-5 text-left font-bold text-neutral-900 hover:text-emerald-600 transition-colors gap-4 cursor-pointer select-none focus:outline-none"
                      >
                        <span className="text-base md:text-lg">{sub.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Share button */}
                          <button
                            onClick={(e) => copyShareLink(e, sub.id)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors relative"
                            title="Copy link to this question"
                          >
                            {isCopied ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Link2 className="w-4 h-4" />
                            )}
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-neutral-500" />
                          )}
                        </div>
                      </div>

                      {/* Content panel */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pt-1 text-sm md:text-base text-neutral-600 font-medium leading-relaxed border-t border-neutral-100/60 mt-1">
                              {sub.content}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

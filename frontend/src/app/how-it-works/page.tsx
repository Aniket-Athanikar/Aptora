"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Cpu,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Languages,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  Database,
  Terminal,
  Clock,
  Play,
  FileCode,
  ShieldCheck,
  Layers,
  ArrowLeftRight
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";

const stages = [
  {
    id: "stage-1",
    num: "Stage 01",
    title: "Select Exam Book",
    subtitle: "Select materials & configure goals",
    icon: Upload,
    color: "from-blue-500 to-indigo-600",
    shadowColor: "shadow-blue-500/10",
    input: "Raw textbooks, PDFs, scanned lecture notes, previous year papers (PYQs), ZIP folders.",
    output: "A structured, version-controlled library mapped to a specific exam target.",
    details: "Your files are uploaded and organized in your personal document vault. You configure target subjects (SSC, UPSC, GATE, Banking, custom exams) to match preparation guidelines.",
    bullets: [
      "Support book selection for multiple formats",
      "Automatic folder structures and ZIP extractions",
      "Document versioning to track edits and updates",
      "Custom syllabus mapping parameters"
    ]
  },
  {
    id: "stage-2",
    num: "Stage 02",
    title: "Deep processing & OCR Pipeline",
    subtitle: "Noise removal & vector chunk indexing",
    icon: Cpu,
    color: "from-indigo-600 to-purple-600",
    shadowColor: "shadow-purple-500/10",
    input: "Clean digital texts or low-quality skewed scans and images.",
    output: "Semantic text segments and embedding vectors stored inside Qdrant DB.",
    details: "Low-quality scans undergo noise cleaning, deskewing, and column sorting. Clean layouts are parsed into semantic chunks and stored in Qdrant DB to prevent hallucinations.",
    bullets: [
      "High-accuracy English language parser",
      "Table grid detection and mathematical layouts parsing",
      "Semantic-aware text paragraph chunk boundaries",
      "Qdrant high-speed vector cluster indexing"
    ]
  },
  {
    id: "stage-3",
    num: "Stage 03",
    title: "AI Study & Asset Generation",
    subtitle: "Revision notes & smart question banks",
    icon: Sparkles,
    color: "from-purple-600 to-pink-600",
    shadowColor: "shadow-pink-500/10",
    input: "Vector embeddings mapping your core syllabus database.",
    output: "Markdown notes, mindmaps, formula sheets, flashcard decks, and quizzes.",
    details: "The generative engine builds revision materials directly from your sources. Choose summaries, high-yield one-liners, mindmaps, flashcards, or custom quiz decks.",
    bullets: [
      "Revision summaries and detailed subject notes",
      "Markdown mindmaps and formula sheets",
      "Multiple question styles (MCQs, Fill-in-blanks, Assertion-Reason)",
      "Spaced repetition schedules embedded in flashcards"
    ]
  },
  {
    id: "stage-4",
    num: "Stage 04",
    title: "Active Practice & AI Tutoring",
    subtitle: "Grounded doubt solving & test simulation",
    icon: Brain,
    color: "from-pink-600 to-rose-600",
    shadowColor: "shadow-rose-500/10",
    input: "Interactive daily questions, customized mock exams, and user prompts.",
    output: "Instant doubt explanations, page-level citations, and quiz scores.",
    details: "Practice daily with fresh morning quizzes targeting your mistakes, simulate full mock exams with negative marking, and get grounded explanations with page citations.",
    bullets: [
      "Fresh daily practice quizzes generated every morning",
      "Grounded chatbot doubt-solver with PDF citations",
      "Mock exams with timer simulations and negative marking",
      "Class percentiles and live leaderboard rankings"
    ]
  },
  {
    id: "stage-5",
    num: "Stage 05",
    title: "Progress Mastery & Analytics",
    subtitle: "Readiness tracking & study gamification",
    icon: TrendingUp,
    color: "from-rose-600 to-emerald-600",
    shadowColor: "shadow-emerald-500/10",
    input: "Aggregated performance history, read durations, and streak counts.",
    output: "Mastery index ratings, strength metrics maps, levels XP, and coin rewards.",
    details: "Study metrics are parsed into master charts. Monitor streak calendars, track concept coverage, check your exam-readiness index, and earn virtual coins and XP.",
    bullets: [
      "Dynamic subject accuracy and read duration logs",
      "Concept coverage progression heatmaps",
      "Streak calendar consistency badges",
      "Earn coins & level XP to unlock profile rewards"
    ]
  }
];

export default function HowItWorksPage() {
  const [activeStage, setActiveStage] = useState("stage-1");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  const currentStage = stages.find(s => s.id === activeStage)!;
  const ActiveIcon = currentStage.icon;

  return (
    <PageLayout
      title="How Aptora Works"
      description="Follow the journey from importing raw files to generating custom mock exams and tracking concept mastery."
      breadcrumb={[{ label: "How It Works", href: "/how-it-works" }]}
    >
      <div className="relative min-h-screen">
        {/* Decorative backdrop gradients */}
        <div className="absolute top-[200px] right-[5%] w-[400px] h-[400px] bg-purple-500/5 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[300px] left-[5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none" />

        <div className="layout-container max-w-[1240px] px-4 mx-auto relative z-10">

          {/* Section Heading */}
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-100 mb-4"
            >
              The AI Learning Engine Pipeline
            </motion.span>
            <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">
              Understanding the Multi-Stage Journey
            </h2>
            <p className="text-sm text-neutral-500 max-w-xl mx-auto mt-2 font-medium">
              Explore our core pipelines. We process raw documents, index semantic vectors, generate summaries and quizzes, and simulate mock tests.
            </p>
          </div>

          {/* Interactive Steps Roadmap Selector */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-10 max-w-4xl mx-auto">
            {stages.map((stage) => {
              const StageIcon = stage.icon;
              const isActive = stage.id === activeStage;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(stage.id)}
                  className={`px-5 py-3 rounded-full text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm ${
                    isActive
                      ? "bg-gradient-to-r from-[#084c38] via-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 border-transparent"
                      : "bg-white border border-emerald-500/20 text-neutral-700 hover:bg-emerald-50/50"
                  }`}
                >
                  <StageIcon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-emerald-600"}`} />
                  <span>{stage.title.split(" & ")[0].split(" &")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Expanded Interactive Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-20">

            {/* Left 2 Cols: Stage Info */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStage.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-6 md:p-8 space-y-6"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
                  <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4 pt-1">
                    <div>
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                        {currentStage.num}
                      </span>
                      <h3 className="text-xl font-black text-neutral-900 mt-0.5">
                        {currentStage.title}
                      </h3>
                      <p className="text-xs text-neutral-500 font-semibold">
                        {currentStage.subtitle}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                      <ActiveIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                    {currentStage.details}
                  </p>

                  {/* Flow pipeline indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-2xl p-4 flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <ArrowLeftRight className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider block">Input data</span>
                        <p className="text-[11px] text-neutral-700 font-bold leading-relaxed">{currentStage.input}</p>
                      </div>
                    </div>

                    <div className="bg-teal-50/50 border border-teal-200/50 rounded-2xl p-4 flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-teal-700" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-teal-800 uppercase tracking-wider block">Generated output</span>
                        <p className="text-[11px] text-neutral-700 font-bold leading-relaxed">{currentStage.output}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress Flow Timeline */}
              <div className="relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-6 md:p-8">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
                <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest mb-6 flex items-center gap-2 pt-1">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  System Sequence Timeline
                </h3>
                <div className="space-y-6 relative pl-4 border-l-2 border-emerald-500/20">
                  {stages.map((st, sIdx) => (
                    <button
                      key={st.id}
                      onClick={() => setActiveStage(st.id)}
                      className={`w-full text-left relative transition-all group ${
                        st.id === activeStage ? "scale-[1.01]" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      {/* Timeline indicator node */}
                      <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full transition-colors ring-4 ${
                        st.id === activeStage ? "bg-emerald-500 ring-emerald-100" : "bg-neutral-300 ring-neutral-100"
                      }`} />

                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-black uppercase tracking-wider ${
                          st.id === activeStage ? "text-emerald-700" : "text-neutral-500"
                        }`}>
                          {st.num} • {st.title}
                        </h4>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-[10px] text-neutral-500 font-semibold mt-0.5 truncate max-w-xl">
                        {st.subtitle}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Stage Details List */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStage.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <div className="relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-6">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
                    <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest mb-4 flex items-center gap-2 pt-1">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      Core Capabilities
                    </h3>
                    <ul className="space-y-3.5">
                      {currentStage.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-[11px] text-neutral-700 font-bold leading-relaxed">
                          <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-700 font-black">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Ready CTA Card */}
              <div className="relative border-2 border-emerald-500/30 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-[#084c38] via-emerald-900 to-teal-950 p-6 text-white text-center md:text-left">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-400 to-teal-300" />
                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-200 mb-2 pt-1">
                  Accelerate Preparation
                </h4>
                <p className="text-[11px] font-bold leading-relaxed text-emerald-100 mb-5">
                  Begin your multi-stage study loop with our grounded AI preparation pipeline today.
                </p>
                <div className="flex flex-col gap-2">
                  <Link href="/login">
                    <GlowButton variant="outline" className="w-full bg-white text-emerald-950 border-transparent hover:bg-emerald-50 text-[10px] font-black py-3 rounded-xl transition-all shadow-md" magnetic={false}>
                      Register Free Account
                    </GlowButton>
                  </Link>
                  <Link href="/features" className="text-[10px] font-black text-emerald-200 hover:text-white transition-colors flex items-center justify-center gap-1 mt-2">
                    Review Specifications
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </PageLayout>
  );
}

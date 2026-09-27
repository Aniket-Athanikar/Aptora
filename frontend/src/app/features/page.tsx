"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    Brain,
    Target,
    ClipboardList,
    BarChart3,
    MessageCircle,
    Layers,
    Calendar,
    ArrowRight,
    UploadCloud,
    Languages,
    Key,
    Cpu,
    Zap,
    Sparkles,
    Check,
    Clock,
    BookOpenCheck,
    ChevronRight
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";

const categories = [
    {
        id: "pipeline",
        label: "Core AI Pipeline",
        description: "From raw textbooks to structured vector databases in seconds.",
        color: "from-[#084c38] to-[#063b2b]",
        bgColor: "bg-[#ecfdf5]",
        accentColor: "#084c38",
        modules: [
            {
                id: "auth",
                slug: "secure-authentication",
                num: "Module 01",
                title: "Secure Authentication",
                icon: Key,
                badge: "Security",
                description: "Dual OTP validation with CSRF protection, dynamic password strength metrics, and silent dev interception.",
                features: [
                    "Dual OTP verification via email & SMS",
                    "Geometric pulsing node graphs in HTML verify emails",
                    "Auto-pull verification codes in dev environment",
                    "Full CSRF protection & session encryption"
                ]
            },
            {
                id: "selection",
                slug: "exam-selector-mapping",
                num: "Module 02",
                title: "Exam Selector & Mapping",
                icon: Target,
                badge: "Personalization",
                description: "Select target exams like SSC, UPSC, GATE, Banking, Railways, State PSC, or define custom exams.",
                features: [
                    "Multi-exam preparation profile dashboard",
                    "Custom exam creation engine with custom syllabus inputs",
                    "Dynamic topic weighting based on historical exam patterns",
                    "Automatic mapping of chapters to exam syllabi"
                ]
            },
            // {
            //     id: "upload",
            //     slug: "smart-book-upload",
            //     num: "Module 03",
            //     title: "Smart Book Selected",
            //     icon: UploadCloud,
            //     badge: "Storage",
            //     description: "Select Exam Book support for PDF, images, ZIP, or directory structures with fully versioned libraries.",
            //     features: [
            //         "Select exam book widget",
            //         "Automatic extraction of nested ZIP archives",
            //         "Document version control & history logging",
            //         "Secure cloud bucket file storage with instant sync"
            //     ]
            // },
            {
                id: "ocr",
                slug: "deep-ocr-engine",
                num: "Module 03",
                title: "Deep OCR Engine",
                icon: Languages,
                badge: "AI Extraction",
                description: "Processes low-quality scans and old textbooks in English.",
                features: [
                    "Low-quality print deskew & noise filtering",
                    "Advanced table, chart, and multi-column layout parsing",
                    "High-fidelity English layout parsing",
                    "Post-OCR automated spell and syntax corrections"
                ]
            },
            {
                id: "knowledge",
                slug: "knowledge-base-processing",
                num: "Module 04",
                title: "Knowledge Base Processing",
                icon: Cpu,
                badge: "RAG Setup",
                description: "Extracts topics, chapters, and keywords, chunking them into semantic segments stored in Qdrant Vector DB.",
                features: [
                    "Semantic-aware text chunking & vector embedding",
                    "Qdrant high-speed indexing & cluster distribution",
                    "Automated topic, sub-topic, and chapter hierarchy map",
                    "Metadata classification (difficulty level, keyword tags)"
                ]
            }
        ]
    },
    {
        id: "learning",
        label: "AI Study & Generation",
        description: "Generate structured study notes and consult your grounded personal tutor.",
        color: "from-emerald-600 to-teal-650",
        bgColor: "bg-emerald-50/50",
        accentColor: "#059669",
        modules: [
            {
                id: "material",
                slug: "ai-study-material-generator",
                num: "Module 06",
                title: "AI Study Material Generator",
                icon: BookOpen,
                badge: "Revision Assets",
                description: "Generates long notes, summaries, mind maps, formula sheets, and spaced repetition flashcards.",
                features: [
                    "Summaries & comprehensive study notes generation",
                    "Mindmap outlines & automated flowchart markdown",
                    "Dynamic formula sheets & high-yield one-liners",
                    "Smart flashcards exportable to spaced-repetition engines"
                ]
            },
            {
                id: "generator",
                slug: "smart-question-generator",
                num: "Module 07",
                title: "Smart Question Generator",
                icon: Brain,
                badge: "Evaluation",
                description: "Creates MCQs, fill-in-the-blanks, true/false, assertion-reason, and case studies with step-by-step logic.",
                features: [
                    "MCQ, Fill-in-the-blanks, and True/False questions",
                    "Complex assertion-reasoning & subjective case studies",
                    "Step-by-step answers & custom memory mnemonics",
                    "Exam-frequency probability star ratings per question"
                ]
            },
            {
                id: "tutor",
                slug: "ai-coach-grounded-tutor",
                num: "Module 11",
                title: "AI Coach & Grounded Tutor",
                icon: MessageCircle,
                badge: "Chat Assistant",
                description: "Interactive chat grounded strictly in your uploaded library. Ask questions and get citations linking back to original sources.",
                features: [
                    "NotebookLM-style grounded chatbot interface",
                    "Exact page-level document citation & side-by-side viewer",
                    "Contextual explanation with multi-language code explanation",
                    "Automated study plans formulated by the AI tutor"
                ]
            },
            {
                id: "prediction",
                slug: "ai-question-prediction-engine",
                num: "Module 09",
                title: "AI Question Prediction Engine",
                icon: Zap,
                badge: "Prediction",
                description: "Matches your uploaded books against previous year papers (PYQs) to forecast high-probability topics.",
                features: [
                    "Automated trend mapping between books and PYQs",
                    "Forecast lists of top 100 high-probability questions",
                    "Subject & chapter frequency trends visualizer",
                    "Predictive confidence scoring for upcoming exam cycle"
                ]
            }
        ]
    },
    {
        id: "practice",
        label: "Practice & Tracking",
        description: "Evaluate your readiness with simulated exams and gamified tracking.",
        color: "from-emerald-600 to-teal-600",
        bgColor: "bg-emerald-50/50",
        accentColor: "#10B981",
        modules: [
            {
                id: "practice_mod",
                slug: "daily-practice-generator",
                num: "Module 08",
                title: "Daily Practice Generator",
                icon: ClipboardList,
                badge: "Routine",
                description: "A fresh set of 100 personalized practice questions generated every morning targeting your recent mistakes.",
                features: [
                    "Fresh practice questions generated every morning",
                    "Adaptive review prioritizing subjects with high error rates",
                    "Spaced-repetition scheduling for missed concepts",
                    "Exam countdown & urgency-based revisions"
                ]
            },
            {
                id: "mock",
                slug: "mock-test-engine",
                num: "Module 10",
                title: "Mock Test Engine",
                icon: Clock,
                badge: "Simulation",
                description: "Simulate true exam conditions with real timers, negative marking rules, percentiles, and live leaderboards.",
                features: [
                    "Custom timer constraints & auto-submit mechanism",
                    "Configurable negative marking rules per test",
                    "Dynamic class percentile & live leaderboard rank",
                    "Speed, accuracy, and section-wise time diagnostics"
                ]
            },
            {
                id: "analytics",
                slug: "gamified-progress-analytics",
                num: "Module 12",
                title: "Gamified Progress Analytics",
                icon: BarChart3,
                badge: "Analytics",
                description: "Visualize confidence levels, read times, solved questions, streaks, and earn study coins & level XP.",
                features: [
                    "Interactive weekly and monthly progress charts",
                    "Read time tracking & concept coverage progression bars",
                    "XP system, levels, and virtual coin rewards",
                    "Overall exam-readiness metrics & strengths map"
                ]
            }
        ]
    }
];

export default function FeaturesPage() {
    const [activeCategory, setActiveCategory] = useState("pipeline");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" as const },
        },
    };

    return (
        <PageLayout
            title="AI Exam Intelligence Platform"
            description="Explore our complete end-to-end features designed to turn textbooks into personal tutors. Click any module to view technical details in depth."
            breadcrumb={[{ label: "Features", href: "/features" }]}
        >
            <div className="relative">
                {/* Background elements */}
                <div className="absolute top-[300px] left-[5%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full filter blur-[120px] pointer-events-none" />
                <div className="absolute top-[600px] right-[5%] w-[400px] h-[400px] bg-purple-500/5 rounded-full filter blur-[120px] pointer-events-none" />

                <div className="layout-container max-w-[1240px] px-4 mx-auto relative z-10">

                    {/* Section Header */}
                    <div className="text-center mb-10 mt-6">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-block bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-100 mb-4"
                        >
                            Feature Guide & Specifications
                        </motion.span>
                        <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">
                            Powering Smarter Exam Preparation
                        </h2>
                        <p className="text-sm text-neutral-500 max-w-xl mx-auto mt-2 font-medium">
                            Aptora bridges the gap between raw textbooks and target exam success. Review the complete technical pipeline of modules below.
                        </p>
                    </div>

                    {/* Category Selector Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-12 max-w-3xl mx-auto">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-3 rounded-full text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm ${
                                    activeCategory === cat.id
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-500/20"
                                        : "bg-white border border-[#ECECEC] text-neutral-600 hover:bg-neutral-50"
                                }`}
                            >
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Category Feature Modules */}
                    <div className="mb-20">
                        <AnimatePresence mode="wait">
                            {categories.map((cat) => {
                                if (cat.id !== activeCategory) return null;
                                return (
                                    <motion.div
                                        key={cat.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div className="text-center md:text-left mb-6">
                                            <h3 className="text-lg font-black text-neutral-800 tracking-tight flex items-center justify-center md:justify-start gap-2">
                                                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${cat.color}`} />
                                                {cat.label}
                                            </h3>
                                            <p className="text-xs text-neutral-500 font-semibold mt-1">
                                                {cat.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {cat.modules.map((mod) => {
                                                const Icon = mod.icon;
                                                return (
                                                    <Link href={`/features/${mod.slug}`} key={mod.id} className="block group">
                                                        <GlassCard
                                                            className="p-6 h-full flex flex-col justify-between hover:shadow-lg border-[#ECECEC] hover:border-emerald-500/50 transition-all duration-300 bg-white/70 group-hover:-translate-y-1 relative overflow-hidden"
                                                        >
                                                            <div>
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                                                        {mod.num}
                                                                    </span>
                                                                    <span className="inline-block bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-100">
                                                                        {mod.badge}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-3 mb-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-50/80 transition-colors duration-300 shrink-0">
                                                                        <Icon className="w-5 h-5 text-emerald-600" />
                                                                    </div>
                                                                    <h4 className="text-sm font-black text-neutral-900 group-hover:text-emerald-600 transition-colors">
                                                                        {mod.title}
                                                                    </h4>
                                                                </div>

                                                                <p className="text-xs text-neutral-500 font-semibold leading-relaxed mb-4">
                                                                    {mod.description}
                                                                </p>
                                                            </div>

                                                            <div className="border-t border-[#ECECEC] pt-4 mt-auto">
                                                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-2">
                                                                    Capabilities
                                                                </span>
                                                                <ul className="space-y-2 mb-4">
                                                                    {mod.features.slice(0, 2).map((feat, fIdx) => (
                                                                        <li key={fIdx} className="flex items-start gap-2 text-[10px] text-neutral-600 font-bold">
                                                                            <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                                                            <span className="truncate">{feat}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>

                                                                <div className="flex items-center text-[10px] font-black text-emerald-600 gap-1 group-hover:underline">
                                                                    View Module Details
                                                                    <ChevronRight className="w-3 h-3" />
                                                                </div>
                                                            </div>
                                                        </GlassCard>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Final Call To Action */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center justify-center text-center mt-16 bg-gradient-to-r from-neutral-50 to-neutral-100/50 border border-[#ECECEC] p-10 rounded-[32px] max-w-4xl mx-auto"
                    >
                        <BookOpenCheck className="w-10 h-10 text-emerald-600 mb-4" />
                        <h3 className="text-lg font-black text-neutral-900 tracking-tight">
                            Ready to Transform Your Study Material?
                        </h3>
                        <p className="text-xs text-neutral-500 max-w-md mx-auto mt-2 font-medium mb-6">
                            Unlock grounded AI notes, dynamic question generating engines, previous year paper prediction indices, and custom revision modules today.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link href="/login">
                                <GlowButton variant="gradient" className="px-6 text-xs font-black py-3.5 rounded-xl hover:scale-[1.02]">
                                    Get Started Now
                                </GlowButton>
                            </Link>
                            <Link href="/how-it-works" className="group text-xs font-black text-neutral-600 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                                See How It Works
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </div>
        </PageLayout>
    );
}

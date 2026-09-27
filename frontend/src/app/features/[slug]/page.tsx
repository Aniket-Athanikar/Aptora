"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Check,
    Cpu,
    Key,
    Target,
    UploadCloud,
    Languages,
    BookOpen,
    Brain,
    MessageCircle,
    Zap,
    ClipboardList,
    Clock,
    BarChart3,
    Sparkles,
    Shield,
    Terminal,
    ArrowRight
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";

const modulesData: Record<string, {
    num: string;
    title: string;
    icon: React.ElementType<{ className?: string }>;
    badge: string;
    category: string;
    color: string;
    description: string;
    longDescription: string;
    specs: string[];
    workflow: string[];
    benefits: string[];
}> = {
    "secure-authentication": {
        num: "Module 01",
        title: "Secure Authentication & Interception",
        icon: Key,
        badge: "Security",
        category: "Core AI Pipeline",
        color: "from-blue-600 to-indigo-600",
        description: "Dual OTP validation with CSRF protection, dynamic password strength metrics, and silent dev interception.",
        longDescription: "Our authentication system uses dual OTP verification across email and SMS with built-in CSRF protection. In development mode, the frontend features silent dev interception, which automatically retrieves and inputs verification codes from the local sandbox backend directly into inputs, speeding up testing cycles without compromising security.",
        specs: [
            "Session Encryption: JWT asymmetric keys with Secure HTTP-Only cookies",
            "OTP Templates: Pulse Three.js styled geometric pulsing node nodes",
            "Interception: Local mock mail/SMS intercept streams in development"
        ],
        workflow: [
            "User signs up or signs in via their mobile number or email address.",
            "FastAPI backend generates a unique secure token and broadcasts dual verification codes.",
            "Development server automatically pulls verification codes to populate client inputs.",
            "Client validates session, sets HTTP-only cookies, and updates the local auth state."
        ],
        benefits: [
            "Protects accounts with two-factor validation without password management overhead.",
            "Frictionless developer flows with auto-verifying inputs during code changes.",
            "CSRF double-submit patterns stop cross-site scripting vulnerabilities."
        ]
    },
    "exam-selector-mapping": {
        num: "Module 02",
        title: "Exam Selector & Mapping Engine",
        icon: Target,
        badge: "Personalization",
        category: "Core AI Pipeline",
        color: "from-blue-600 to-indigo-600",
        description: "Select target competitive exams or define custom syllabi to align topic weights.",
        longDescription: "Aptora automatically updates all study guidelines, questions, and practice sets based on the student's selected exam category. This matches historical patterns for UPSC, SSC, GATE, Banking, Railway, and State PSCs, or maps chapters directly to a custom syllabus.",
        specs: [
            "Supported Exams: UPSC, SSC CGL, Banking, GATE, Railway, state PSCs",
            "Custom Core: Dynamic weights builder per topic based on syllabus PDFs",
            "Relational Mapping: Multi-port Postgres schema maps books to sub-chapters"
        ],
        workflow: [
            "User selects their exam type from the customized onboarding catalog.",
            "System loads the specific structure of subject percentages and negative marking parameters.",
            "AI maps uploaded book paragraphs to syllabus elements.",
            "Dashboard feeds recommendations prioritizing high-weight topics."
        ],
        benefits: [
            "Guarantees that you only study material that matches your target exam.",
            "Creates tailored structures for custom exams not covered by standard guides.",
            "Dynamically shifts topic priorities as target exams approach."
        ]
    },
    "smart-book-upload": {
        num: "Module 03",
        title: "Smart Book Ingestion & Upload",
        icon: UploadCloud,
        badge: "Storage",
        category: "Core AI Pipeline",
        color: "from-blue-600 to-indigo-600",
        description: "Drag-and-drop uploads for PDF, images, ZIP files, and nested directories with library versioning.",
        longDescription: "Upload entire books, lecture slides, notes, or previous year papers. Our smart file parser processes nested folders and directories, unpacking files in the background while keeping your document library organized and versioned.",
        specs: [
            "Supported Formats: PDF, PNG, JPEG, ZIP, nested directory uploads",
            "Storage Architecture: Partitioned object storage buckets with CDN edge delivery",
            "Versioning: Incremental file version trees with soft delete capabilities"
        ],
        workflow: [
            "Drag and drop documents, folders, or ZIP archives into the dashboard.",
            "System extracts nested files and schedules background parsing tasks.",
            "Metadata (file size, page counts, hashes) are analyzed and written to the database.",
            "Files are organized inside the personal Document Library with full version tags."
        ],
        benefits: [
            "Saves time by letting you upload folders directly without zip extraction.",
            "Maintains document history, letting you update textbook additions.",
            "Handles gigabytes of resource books seamlessly in the background."
        ]
    },
    "deep-ocr-engine": {
        num: "Module 04",
        title: "Deep English OCR Engine",
        icon: Languages,
        badge: "AI Extraction",
        category: "Core AI Pipeline",
        color: "from-blue-600 to-indigo-600",
        description: "Processes low-quality scans and old textbooks in English.",
        longDescription: "Designed for competitive exam books which are often poorly scanned or printed on low-quality paper. The engine automatically filters noise, corrects page skew, maps multi-column layouts, extracts mathematical tables, and runs an English spell checker.",
        specs: [
            "Languages: English only",
            "Pre-processing: Advanced contrast deskewing, noise filtering, and table grid parsing",
            "Post-processing: LLM-based OCR typo correction and contextual layout mapping"
        ],
        workflow: [
            "OCR worker picks up newly uploaded image or scan from the Redis queue.",
            "Pre-processor cleans skew angle, removes grain noise, and increases contrast.",
            "Optical character recognition parses text, headers, and multi-column tables.",
            "Contextual LLM refines spelling mistakes and outputs clean markdown documents."
        ],
        benefits: [
            "Converts low-quality physical books and handwritten notes into digital text.",
            "Supports mixed language textbooks (e.g. Hinglish) without failing.",
            "Extracts tables and tabular details into searchable Markdown structures."
        ]
    },
    "knowledge-base-processing": {
        num: "Module 05",
        title: "Knowledge Base & RAG Indexing",
        icon: Cpu,
        badge: "RAG Setup",
        category: "Core AI Pipeline",
        color: "from-blue-600 to-indigo-600",
        description: "Extracts topics, chapters, and keywords, chunking segments into Qdrant Vector DB.",
        longDescription: "Converts text files into an optimized knowledge base. The process slices documents into semantic paragraphs, extracts keywords, tags difficulty levels, generates vectors, and saves them in Qdrant DB to power the AI Grounded Tutor.",
        specs: [
            "Vector Engine: Qdrant Vector DB with cluster indexing distribution",
            "Embeddings Model: Local multilingually-trained transformer embeddings",
            "Chunking Method: Semantic boundary-aware paragraphs with overlay buffers"
        ],
        workflow: [
            "Document text is parsed into clean, overlapping semantic chunks.",
            "Chunks are passed to the embedding engine to compute multi-dimensional vectors.",
            "Topics, chapters, and keywords are automatically extracted for metadata tags.",
            "Vectors and metadata are saved in Qdrant for semantic search lookup."
        ],
        benefits: [
            "Forms the core knowledge base ground truth, stopping LLM hallucinations.",
            "Fast vector queries enable real-time tutor chat replies.",
            "Metadata mapping allows query filtering down to specific chapters."
        ]
    },
    "ai-study-material-generator": {
        num: "Module 06",
        title: "AI Study Material Generator",
        icon: BookOpen,
        badge: "Revision Assets",
        category: "AI Study & Generation",
        color: "from-emerald-600 to-teal-655",
        description: "Generates long notes, summaries, mind maps, formula sheets, and spaced repetition flashcards.",
        longDescription: "Transforms pages of reading material into revision assets. The generator creates structured study summaries, formula sheets, mindmap text definitions, and spaced-repetition flashcards mapped to your target topics.",
        specs: [
            "Export Formats: Markdown summary docs, flashcard JSON decks",
            "Note Types: Revision summaries, formula cards, mindmap bullet lists",
            "Spaced Repetition: SuperMemo-2 algorithm parameters embedded in flashcards"
        ],
        workflow: [
            "Student requests revision assets for specific chapters.",
            "RAG engine fetches the core document segments from the vector database.",
            "LLM summarizes concepts, extracts formulas, and outputs key definitions.",
            "Assets are saved into the student's workspace library."
        ],
        benefits: [
            "Reduces manual note-taking time so you can focus on active recall.",
            "Converts long-form textbooks into quick formula cards.",
            "Flashcards synchronize directly with active revision tools."
        ]
    },
    "smart-question-generator": {
        num: "Module 07",
        title: "Smart Question Generator",
        icon: Brain,
        badge: "Evaluation",
        category: "AI Study & Generation",
        color: "from-emerald-600 to-teal-655",
        description: "Creates MCQs, fill-in-the-blanks, true/false, assertion-reason, and case studies with step-by-step logic.",
        longDescription: "Create custom quizzes from your uploaded study materials. The generator outputs multiple question styles including multiple-choice, fill-in-the-blanks, true/false, assertion-reason, and subjective case studies, each accompanied by step-by-step reasoning, difficulty ratings, and memory tricks.",
        specs: [
            "Question Formats: MCQ, Fill-in-blanks, True/False, Assertion-Reason, subjective",
            "Logic: Step-by-step rationales, memory tricks, probability stars",
            "API: Automated batch generation of up to 200 questions"
        ],
        workflow: [
            "User selects source chapters and specifies the target question style.",
            "AI generates practice questions matching the target exam's styling.",
            "Detailed answers, explanations, and memory mnemonics are appended.",
            "Quizzes are rendered in the dashboard and tracked in performance logs."
        ],
        benefits: [
            "Tests your conceptual understanding, not just rote memorization.",
            "Provides explanations and memory tricks for faster retention.",
            "Provides exam-focused practicing with realistic difficulty scaling."
        ]
    },
    "ai-coach-grounded-tutor": {
        num: "Module 11",
        title: "AI Coach & Grounded Tutor",
        icon: MessageCircle,
        badge: "Chat Assistant",
        category: "AI Study & Generation",
        color: "from-emerald-600 to-teal-655",
        description: "Interactive chat grounded strictly in your uploaded library. Ask questions and get citations linking back to original sources.",
        longDescription: "An AI tutor that knows only what is in your uploaded books and lecture notes. Ask questions, clarify tough concepts, and get instant explanations with page-level citations mapping directly back to your uploaded sources.",
        specs: [
            "Core: Grounded RAG chat engine avoiding web hallucinations",
            "Citations: Precise source page numbers and PDF line references",
            "Tutor Mode: Socratic questioning method for guided learning"
        ],
        workflow: [
            "Student enters a doubt or query into the chat interface.",
            "Vector database fetches relevant textbook paragraphs matching the query.",
            "AI coach formulates the answer using the retrieved sources only.",
            "Answer is rendered alongside exact PDF page-number citations."
        ],
        benefits: [
            "Prevents AI hallucinations, keeping answers grounded in your syllabus.",
            "Verifies facts by linking you back to the exact source pages.",
            "Provides 24/7 personal tutor access for complex subjects."
        ]
    },
    "ai-question-prediction-engine": {
        num: "Module 09",
        title: "AI Question Prediction Engine",
        icon: Zap,
        badge: "Prediction",
        category: "AI Study & Generation",
        color: "from-emerald-600 to-teal-655",
        description: "Matches books and PYQs to forecast upcoming high-probability exam topics.",
        longDescription: "Analyze past exam papers to highlight high-yield study topics. The engine matches your textbooks against previous year papers (PYQs), calculating topic frequency trends to predict high-probability questions for the upcoming exam cycle.",
        specs: [
            "Data Source: Textbooks matched with 10+ years of previous year papers (PYQs)",
            "Predictive Score: Recurrence weightings and topic frequency parameters",
            "Output: Top 100 high-probability question forecasts"
        ],
        workflow: [
            "Student uploads previous year papers (PYQs) and syllabus books.",
            "Pattern matcher analyzes year-over-year recurrence of concepts.",
            "AI calculates probability indices for topics in the upcoming syllabus.",
            "System reports the top chapters and forecast questions to review."
        ],
        benefits: [
            "Focuses your revision time on high-probability questions.",
            "Uncovers hidden trends and recurring concepts in past exams.",
            "Provides confidence ratings for the most important subjects."
        ]
    },
    "daily-practice-generator": {
        num: "Module 08",
        title: "Daily Practice Generator",
        icon: ClipboardList,
        badge: "Routine",
        category: "Practice & Tracking",
        color: "from-emerald-600 to-teal-600",
        description: "A fresh set of 100 personalized practice questions generated every morning targeting your recent mistakes.",
        longDescription: "Stay consistent with daily custom quizzes. Every morning, the generator reviews your past answers, identifies weak concepts and recent mistakes, and builds a fresh, 100-question practice set tailored to your exam timeline.",
        specs: [
            "Daily Routine: Fresh 100 questions generated at 06:00 AM every morning",
            "Targeting Logic: Focuses on subjects with high error rates",
            "Revision loop: Dynamic spacing intervals for active recall"
        ],
        workflow: [
            "Daily task worker tracks user's previous quiz records and mistakes.",
            "AI selects target concepts requiring reinforcement.",
            "A fresh practice deck of 100 customized questions is compiled.",
            "Daily practice is unlocked on the dashboard for the student to solve."
        ],
        benefits: [
            "Builds a consistent study routine with fresh daily challenges.",
            "Fixes knowledge gaps by repeatedly testing weak concepts.",
            "Adapts dynamically to keep pace with your exam schedule."
        ]
    },
    "mock-test-engine": {
        num: "Module 10",
        title: "Mock Test Simulation Engine",
        icon: Clock,
        badge: "Simulation",
        category: "Practice & Tracking",
        color: "from-emerald-600 to-teal-600",
        description: "Simulate true exam conditions with real timers, negative marking rules, percentiles, and live leaderboards.",
        longDescription: "Test your skills under realistic pressure. Our simulation engine creates full-length mock exams that enforce official timers, negative marking rules, percentiles, speed stats, and live leaderboard rankings to replicate the actual exam day experience.",
        specs: [
            "Marking System: Custom positive/negative weight coefficients",
            "UI Mode: Anti-distraction, full-screen lock test overlay interface",
            "Analytics: Speed, accuracy, and time-spent calculations per question"
        ],
        workflow: [
            "User starts a mock exam, activating the fullscreen layout and timer.",
            "Student answers questions with live tracking of time spent per item.",
            "Test auto-submits when the timer reaches zero, applying negative marks.",
            "System calculates your percentile and updates the live leaderboard."
        ],
        benefits: [
            "Prepares you for time constraints under pressure.",
            "Teaches you to manage risk and avoid marks loss from wild guessing.",
            "Compares your performance against other aspirants on the leaderboard."
        ]
    },
    "gamified-progress-analytics": {
        num: "Module 12",
        title: "Gamified Progress Analytics",
        icon: BarChart3,
        badge: "Analytics",
        category: "Practice & Tracking",
        color: "from-emerald-600 to-teal-600",
        description: "Visualize confidence levels, read times, solved questions, streaks, and earn study coins & level XP.",
        longDescription: "Gamify your study schedule. Track your progress with interactive charts, monitor streaks, measure concept coverage, and earn XP and virtual coins to unlock premium avatars and customization themes.",
        specs: [
            "Visualization: Weekly and monthly accuracy charts, concept coverage heatmaps",
            "Gamification Core: Level thresholds, XP values, and virtual coins",
            "Ready Index: Overall exam readiness scores calculated from study history"
        ],
        workflow: [
            "System logs study durations, solved questions, and daily streaks.",
            "Metrics are converted to XP points, leveling up the student's profile.",
            "Analytics engines compute subject mastery and highlight weak spots.",
            "Ready indices and progress charts update on the main profile."
        ],
        benefits: [
            "Keeps motivation high through levels, streaks, and virtual coin rewards.",
            "Highlights exactly where you need to spend more study time.",
            "Provides clear visualization of your path to exam readiness."
        ]
    }
};

export default function FeatureSlugPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const moduleInfo = modulesData[slug];

    if (!moduleInfo) {
        return (
            <PageLayout
                title="Module Not Found"
                description="The requested feature module does not exist."
                breadcrumb={[
                    { label: "Features", href: "/features" },
                    { label: "Not Found", href: "#" }
                ]}
            >
                <div className="layout-container max-w-[600px] px-4 mx-auto text-center py-20 relative z-10">
                    <h3 className="text-xl font-black text-neutral-900 mb-2">Feature Not Found</h3>
                    <p className="text-xs text-neutral-500 mb-6 font-semibold">
                        We could not locate the module with slug &quot;{slug}&quot;. It might have been relocated or renamed.
                    </p>
                    <Link href="/features">
                        <GlowButton variant="gradient" className="px-6 py-3 text-xs font-black">
                            Back to All Features
                        </GlowButton>
                    </Link>
                </div>
            </PageLayout>
        );
    }

    const Icon = moduleInfo.icon;

    return (
        <PageLayout
            title={moduleInfo.title}
            description={`Technical specification and workflow walkthrough for ${moduleInfo.title}.`}
            breadcrumb={[
                { label: "Features", href: "/features" },
                { label: moduleInfo.title, href: `/features/${slug}` }
            ]}
        >
            <div className="layout-container max-w-[1000px] px-4 mx-auto py-10 relative z-10">
                {/* Back button */}
                <button
                    onClick={() => router.push("/features")}
                    className="flex items-center gap-2 text-xs font-black text-neutral-500 hover:text-emerald-600 mb-8 cursor-pointer transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    BACK TO ALL FEATURES
                </button>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left 2 Cols: Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary Header */}
                        <div className="bg-white/80 border border-[#ECECEC] rounded-3xl p-6 md:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                                    {moduleInfo.num}
                                </span>
                                <span className="inline-block bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-100">
                                    {moduleInfo.badge}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                                    <Icon className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-neutral-900 leading-tight">
                                    {moduleInfo.title}
                                </h2>
                            </div>

                            <p className="text-sm text-neutral-700 font-semibold leading-relaxed mb-6">
                                {moduleInfo.description}
                            </p>

                            <hr className="border-[#ECECEC] my-6" />

                            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">
                                Deep Feature Overview
                            </h4>
                            <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                                {moduleInfo.longDescription}
                            </p>
                        </div>

                        {/* Step-by-Step Workflow */}
                        <div className="bg-white/80 border border-[#ECECEC] rounded-3xl p-6 md:p-8 shadow-sm">
                            <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-emerald-600" />
                                how it works step-by-step
                            </h3>
                            <div className="space-y-6 relative pl-4 border-l border-neutral-100">
                                {moduleInfo.workflow.map((step, idx) => (
                                    <div key={idx} className="relative">
                                        {/* Timeline Dot */}
                                        <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                                        <h4 className="text-xs font-black text-emerald-650 mb-1 uppercase tracking-wider">
                                            Step 0{idx + 1}
                                        </h4>
                                        <p className="text-xs text-neutral-600 font-bold leading-relaxed">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Tech Specs & Benefits */}
                    <div className="space-y-6">
                        {/* Tech Specs */}
                        <GlassCard className="p-6 border-[#ECECEC] bg-white/70">
                            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-emerald-600" />
                                Technical Specifications
                            </h3>
                            <ul className="space-y-4">
                                {moduleInfo.specs.map((spec, sIdx) => {
                                    const [label, desc] = spec.split(":");
                                    return (
                                        <li key={sIdx} className="text-[11px] font-bold leading-relaxed text-neutral-600">
                                            <span className="block text-[9px] font-black uppercase text-neutral-400 tracking-wider">
                                                {label}
                                            </span>
                                            {desc}
                                        </li>
                                    );
                                })}
                            </ul>
                        </GlassCard>

                        {/* Core Benefits */}
                        <GlassCard className="p-6 border-[#ECECEC] bg-white/70">
                            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                Key Aspirant Benefits
                            </h3>
                            <ul className="space-y-3">
                                {moduleInfo.benefits.map((benefit, bIdx) => (
                                    <li key={bIdx} className="flex items-start gap-2.5 text-[10px] text-neutral-600 font-bold leading-snug">
                                        <div className="mt-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-500">
                                            <Check className="w-2.5 h-2.5" />
                                        </div>
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>

                        {/* Next Action */}
                        <div className="bg-gradient-to-br from-emerald-600 to-teal-650 rounded-[24px] p-6 text-white shadow-lg shadow-emerald-500/15">
                            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-100 mb-2">
                                Platform Action
                            </h4>
                            <p className="text-[11px] font-bold leading-relaxed text-emerald-50 mb-5">
                                Try this module on your own books and prep files.
                            </p>
                            <Link href="/login">
                                <GlowButton variant="outline" className="w-full bg-white text-emerald-600 border-transparent hover:bg-neutral-50 hover:scale-[1.02] text-[10px] font-black py-3 rounded-xl transition-all">
                                    Get Started
                                </GlowButton>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </PageLayout>
    );
}

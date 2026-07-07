"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";

const features = [
    {
        title: "AI Notes Generator",
        description:
            "AI reads and summarizes your study material into concise notes",
        icon: BookOpen,
    },
    {
        title: "Smart Question Bank",
        description:
            "Thousands of AI-generated questions tailored to your material",
        icon: Brain,
    },
    {
        title: "Daily Practice",
        description: "Consistent daily quizzes to keep you on track",
        icon: Target,
    },
    {
        title: "Mock Tests",
        description:
            "Full-length mock exams that simulate real test conditions",
        icon: ClipboardList,
    },
    {
        title: "Performance Analytics",
        description:
            "Track your strengths, weaknesses, and progress over time",
        icon: BarChart3,
    },
    {
        title: "AI Tutor",
        description:
            "Ask questions and get instant, accurate AI explanations",
        icon: MessageCircle,
    },
    {
        title: "Flashcards",
        description:
            "Smart flashcards with spaced repetition for memory retention",
        icon: Layers,
    },
    {
        title: "Exam Calendar",
        description: "Never miss an exam date with smart reminders",
        icon: Calendar,
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as const },
    },
};

export default function FeaturesPage() {
    return (
        <PageLayout
            title="Powerful Features for Smarter Preparation"
            description="Everything you need to crack any exam"
            breadcrumb={[{ label: "Features", href: "/features" }]}
        >
            <div className="layout-container max-w-[1320px] px-4 mx-auto">
                {/* Section badge */}
                <div className="text-center mb-14">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block bg-[#6D4AFF]/5 text-[#6D4AFF] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-[#6D4AFF]/10"
                    >
                        What We Offer
                    </motion.span>
                </div>

                {/* Features Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                className="group bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Icon container */}
                                <div className="w-14 h-14 rounded-2xl bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 flex items-center justify-center mb-5 group-hover:bg-[#6D4AFF]/10 transition-colors duration-300">
                                    <Icon className="w-7 h-7 text-[#6D4AFF]" />
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-black text-neutral-900 mb-2">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex justify-center mt-16"
                >
                    <Link
                        href="/how-it-works"
                        className="group bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex items-center gap-2 cursor-pointer"
                    >
                        See How It Works in Detail
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </PageLayout>
    );
}
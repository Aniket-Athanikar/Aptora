"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Landmark,
  Shield,
  Building2,
  Users,
  Cog,
  Siren,
  ArrowRight,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";

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

type Category = "All" | "Government" | "Banking" | "Engineering" | "Teaching" | "State Exams";

const categories: Category[] = [
  "All",
  "Government",
  "Banking",
  "Engineering",
  "Teaching",
  "State Exams",
];

interface Exam {
  name: string;
  subtitle: string;
  papers: string;
  subjects: string;
  icon: typeof BookOpen;
  emoji: string;
  color: string;
  category: Category[];
}

const exams: Exam[] = [
  {
    name: "SSC",
    subtitle: "CGL, CHSL, MTS",
    papers: "150+ Papers",
    subjects: "8 Subjects",
    icon: Landmark,
    emoji: "🏛️",
    color: "#6D4AFF",
    category: ["Government"],
  },
  {
    name: "UPSC",
    subtitle: "CSE, CAPF, CDS",
    papers: "200+ Papers",
    subjects: "12 Subjects",
    icon: GraduationCap,
    emoji: "🎓",
    color: "#4F46E5",
    category: ["Government"],
  },
  {
    name: "State PSC",
    subtitle: "All State Commissions",
    papers: "100+ Papers",
    subjects: "10 Subjects",
    icon: Building2,
    emoji: "🏢",
    color: "#8B5CF6",
    category: ["State Exams", "Government"],
  },
  {
    name: "Defence",
    subtitle: "NDA, CDS, AFCAT",
    papers: "80+ Papers",
    subjects: "6 Subjects",
    icon: Shield,
    emoji: "🛡️",
    color: "#22C55E",
    category: ["Government"],
  },
  {
    name: "Banking",
    subtitle: "IBPS, SBI, RBI",
    papers: "120+ Papers",
    subjects: "5 Subjects",
    icon: Landmark,
    emoji: "🏦",
    color: "#F59E0B",
    category: ["Banking"],
  },
  {
    name: "Teaching",
    subtitle: "CTET, TET, KVS",
    papers: "90+ Papers",
    subjects: "4 Subjects",
    icon: Users,
    emoji: "👨‍🏫",
    color: "#EC4899",
    category: ["Teaching"],
  },
  {
    name: "Engineering",
    subtitle: "GATE, ESE",
    papers: "60+ Papers",
    subjects: "8 Subjects",
    icon: Cog,
    emoji: "⚙️",
    color: "#06B6D4",
    category: ["Engineering"],
  },
  {
    name: "Police",
    subtitle: "SI, Constable",
    papers: "70+ Papers",
    subjects: "5 Subjects",
    icon: Siren,
    emoji: "👮",
    color: "#EF4444",
    category: ["State Exams", "Government"],
  },
];

export default function ExamsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filteredExams =
    activeCategory === "All"
      ? exams
      : exams.filter((exam) => exam.category.includes(activeCategory));

  return (
    <PageLayout
      title="Exams We Cover"
      description="Prepare for all major competitive exams"
      breadcrumb={[{ label: "Exams", href: "/exams" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto">
        {/* Category Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeCategory === category
                  ? "bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/20"
                  : "bg-white/70 backdrop-blur-xl border border-[#ECECEC] text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Exam Cards Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredExams.map((exam) => {
              const Icon = exam.icon;
              return (
                <motion.div
                  key={exam.name}
                  variants={itemVariants}
                  layout
                >
                  <Link
                    href={`/exams/${exam.name.toLowerCase().replace(/ /g, '-')}`}
                    className="group bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-7 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer block"
                  >
                    {/* Emoji + Icon */}
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${exam.color}10`, border: `1px solid ${exam.color}20` }}
                      >
                        <span className="text-2xl">{exam.emoji}</span>
                      </div>
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ backgroundColor: `${exam.color}10` }}
                      >
                        <ArrowRight className="w-4 h-4" style={{ color: exam.color }} />
                      </div>
                    </div>

                    {/* Exam Info */}
                    <h3 className="text-lg font-black text-neutral-900 mb-1">
                      {exam.name}
                    </h3>
                    <p className="text-xs font-semibold text-neutral-400 mb-5">
                      {exam.subtitle}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-xs font-bold text-neutral-600">
                          {exam.papers}
                        </span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-neutral-300" />
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-xs font-bold text-neutral-600">
                          {exam.subjects}
                        </span>
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div
                      className="mt-5 h-1 w-12 rounded-full opacity-40 group-hover:opacity-100 group-hover:w-full transition-all duration-500"
                      style={{ backgroundColor: exam.color }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* View All Exams CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center mt-16"
        >
          <button className="group flex items-center gap-3 bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
            View All Exams
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </PageLayout>
  );
}

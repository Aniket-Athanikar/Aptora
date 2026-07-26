"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Building2, GraduationCap, BookOpen, Briefcase, TrendingUp,
  Fingerprint, Globe2, FileCheck, Flame, Award, Cpu, Target,
  ShieldCheck, Languages, Code, Calculator, School, UserCheck,
  CheckCircle2, ChevronRight, HelpCircle
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeading from "@/components/ui/SectionHeading";
import GlowButton from "@/components/ui/GlowButton";
import { useAuth } from "@/lib/auth-context";

const categories = [
  { id: "all", label: "All Exams" },
  { id: "civil-gov", label: "Civil Services & Government" },
  { id: "tech-business", label: "Technical & Business" },
  { id: "ug-general", label: "Undergraduate & General" }
];

const allExams = [
  {
    name: "UPSC",
    icon: Globe2,
    color: "text-[#6D4AFF]",
    bgColor: "bg-[#6D4AFF]/5",
    borderColor: "border-[#6D4AFF]/10",
    category: "civil-gov",
    toolkit: {
      focus: "Syllabus RAG & PYQs Mapping",
      features: [
        "10+ Years of PYQ Trend Prediction models",
        "Syllabus-aligned PDF chunking indexes",
        "GS Paper topic prediction charts"
      ]
    }
  },
  {
    name: "SSC CGL",
    icon: Award,
    color: "text-[#6D4AFF]",
    bgColor: "bg-[#6D4AFF]/5",
    borderColor: "border-[#6D4AFF]/10",
    category: "civil-gov",
    toolkit: {
      focus: "Speed & Accuracy Optimization",
      features: [
        "Timed Mock Tests with negative marks matching CGL rules",
        "Daily Practice set generator for Quantitative Aptitude",
        "Short-cut trick sheets and math formula generators"
      ]
    }
  },
  {
    name: "Banking",
    icon: Building2,
    color: "text-[#6D4AFF]",
    bgColor: "bg-[#6D4AFF]/5",
    borderColor: "border-[#6D4AFF]/10",
    category: "ug-general",
    toolkit: {
      focus: "Quantitative & Verbal Practice",
      features: [
        "Dynamic banking comprehension passage generators",
        "Short-timed calculations drills generator",
        "Banking awareness GK summaries database"
      ]
    }
  },
  {
    name: "GATE",
    icon: Cpu,
    color: "text-[#6D4AFF]",
    bgColor: "bg-[#6D4AFF]/5",
    borderColor: "border-[#6D4AFF]/10",
    category: "tech-business",
    toolkit: {
      focus: "Formula & Concept Chunking",
      features: [
        "Engineering Mathematics formula sheets generator",
        "Concept-level technical MCQ generators",
        "Numerical answer key validations"
      ]
    }
  },
  {
    name: "CAT",
    icon: Target,
    color: "text-[#6D4AFF]",
    bgColor: "bg-[#6D4AFF]/5",
    borderColor: "border-[#6D4AFF]/10",
    category: "tech-business",
    toolkit: {
      focus: "Logical Reasoning & DILR",
      features: [
        "DILR case study scenario generators",
        "Vocabulary spaced repetition card decks",
        "Section-wise time management diagnostics"
      ]
    }
  },
  {
    name: "Railway",
    icon: FileCheck,
    color: "text-[#6D4AFF]",
    bgColor: "bg-[#6D4AFF]/5",
    borderColor: "border-[#6D4AFF]/10",
    category: "civil-gov",
    toolkit: {
      focus: "General Studies & Mock Sets",
      features: [
        "Science and GK study summaries generator",
        "Mock test timers and negative marking matching RRB standards",
        "One-liner formula and memory mnemonics"
      ]
    }
  },
  {
    name: "State PSC",
    icon: Briefcase,
    color: "text-[#6D4AFF]",
    bgColor: "bg-[#6D4AFF]/5",
    borderColor: "border-[#6D4AFF]/10",
    category: "civil-gov",
    toolkit: {
      focus: "Regional Syllabus & GK Mapping",
      features: [
        "State geography & history notes compiler",
        "Bilingual local language OCR document support",
        "State PSC mock test sets with regional GK weights"
      ]
    }
  },
  {
    name: "Police",
    icon: Fingerprint,
    color: "text-[#6D4AFF]",
    bgColor: "bg-[#6D4AFF]/5",
    borderColor: "border-[#6D4AFF]/10",
    category: "civil-gov",
    toolkit: {
      focus: "General Knowledge & Aptitude",
      features: [
        "Law, Constitution, and GK summary card packs",
        "Daily practice set generator targeting general awareness",
        "High-yield mocks and sample papers in English"
      ]
    }
  },
  {
    name: "Defence",
    icon: GraduationCap,
    color: "text-[#6D4AFF]",
    bgColor: "bg-[#6D4AFF]/5",
    borderColor: "border-[#6D4AFF]/10",
    category: "civil-gov",
    toolkit: {
      focus: "CDS/NDA Syllabus Alignment",
      features: [
        "Comprehensive physics/chemistry formula sheets",
        "English grammar logic flashcard decks",
        "Negative marks mock simulator matching UPSC guidelines"
      ]
    }
  },
  {
    name: "CUET UG",
    icon: TrendingUp,
    color: "text-[#6D4AFF]",
    bgColor: "bg-[#6D4AFF]/5",
    borderColor: "border-[#6D4AFF]/10",
    category: "ug-general",
    toolkit: {
      focus: "NCERT Chapter Highlights",
      features: [
        "NCERT-grounded textbook chapter summary notes",
        "Interactive MCQ quiz templates mapping to domains",
        "Weak subject concept tracking progression bars"
      ]
    }
  },
  {
    name: "IELTS",
    icon: Languages,
    color: "text-[#6D4AFF]",
    bgColor: "bg-[#6D4AFF]/5",
    borderColor: "border-[#6D4AFF]/10",
    category: "ug-general",
    toolkit: {
      focus: "Verbal & Comprehension Practice",
      features: [
        "AI essay writing prompt matching feedback",
        "Reading passage comprehension generators",
        "Vocabulary spaced repetition decks"
      ]
    }
  },
  {
    name: "FRM",
    icon: ShieldCheck,
    color: "text-[#6D4AFF]",
    bgColor: "bg-[#6D4AFF]/5",
    borderColor: "border-[#6D4AFF]/10",
    category: "tech-business",
    toolkit: {
      focus: "Risk Management Formula Sheets",
      features: [
        "Quantitative Risk formula compilation summaries",
        "Assertion-reason style mock scenario cards",
        "Financial market statistics definitions"
      ]
    }
  }
];

export default function Exams() {
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedExamName, setSelectedExamName] = useState("UPSC");

  const filteredExams = allExams.filter(
    (exam) => activeCategory === "all" || exam.category === activeCategory
  );

  const selectedExam = allExams.find(e => e.name === selectedExamName) || allExams[0];
  const SelectedIcon = selectedExam.icon;

  return (
    <section id="exams" className="py-20 bg-transparent relative overflow-hidden border-t border-[#ECECEC]">

      {/* Background decoration elements */}
      <div className="absolute top-[200px] left-[5%] w-[350px] h-[350px] bg-[#6D4AFF]/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[200px] right-[5%] w-[350px] h-[350px] bg-[#A855F7]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="layout-container max-w-[1320px] px-4 mx-auto relative z-10">

        <SectionHeading
          badge="Exams Covered"
          title="Study Tools For Your"
          gradientTitle="Target Exam"
          description="Prepare for major national and international exams with customized AI RAG workflows."
        />

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 mt-6 max-w-3xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                const firstExam = allExams.find(e => cat.id === "all" || e.category === cat.id);
                if (firstExam) setSelectedExamName(firstExam.name);
              }}
              className={`px-4 py-2.5 rounded-full text-xs font-black transition-all duration-300 cursor-pointer shadow-sm ${
                activeCategory === cat.id
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-[var(--surface)] border border-white/20 text-neutral-600 hover:bg-[var(--surface-soft)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Grid: Exams List + Selected Exam AI Toolkit Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">

          {/* Left Panel: Selected Exam AI Toolkit Details */}
          <div className="lg:col-span-5 flex w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedExam.name}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                className="w-full flex h-full"
              >
                <GlassCard className="p-6 md:p-8 flex flex-col justify-between w-full rounded-3xl border-white/20 bg-[var(--surface)] shadow-md relative overflow-hidden">

                  {/* Glowing background decor */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#6D4AFF]/10 to-transparent blur-[30px] rounded-full pointer-events-none" />

                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-3.5 mb-6 border-b border-[#ECECEC] pb-4">
                      <div className={`w-12 h-12 rounded-2xl ${selectedExam.bgColor} ${selectedExam.color} border ${selectedExam.borderColor} flex items-center justify-center shrink-0 shadow-sm`}>
                        <SelectedIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">
                          AI Toolkits Highlights
                        </span>
                        <h4 className="text-xl font-black text-neutral-900 leading-tight">
                          {selectedExam.name}
                        </h4>
                      </div>
                    </div>

                    {/* Toolkit focus */}
                    <div className="mb-6">
                      <span className="text-[9px] font-black text-[#6D4AFF] uppercase tracking-wider block mb-1">
                        Optimization Focus
                      </span>
                      <p className="text-sm text-neutral-800 font-extrabold leading-snug">
                        {selectedExam.toolkit.focus}
                      </p>
                    </div>

                    {/* Features list */}
                    <div>
                      <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-3">
                        Configured Workflows
                      </span>
                      <ul className="space-y-3">
                        {selectedExam.toolkit.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2.5 text-[11px] text-neutral-600 font-bold leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA Action */}
                  <div className="mt-8 pt-4 border-t border-[#ECECEC]">
                    <Link href={isAuthenticated ? `/exams/${selectedExam.name.toLowerCase().replace(/ /g, "-")}` : `/login?exam=${selectedExam.name.toLowerCase()}`}>
                      <GlowButton variant="gradient" className="w-full py-3.5 text-[10px] font-black rounded-xl hover:scale-[1.02]" magnetic={false}>
                        Start Preparing for {selectedExam.name}
                      </GlowButton>
                    </Link>
                  </div>

                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Panel: Available Exams Selection */}
          <div className="lg:col-span-7">
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              <AnimatePresence>
                {filteredExams.map((exam) => {
                  const ExamIcon = exam.icon;
                  const isSelected = exam.name === selectedExamName;
                  return (
                    <motion.button
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={exam.name}
                      onClick={() => setSelectedExamName(exam.name)}
                      className={`p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:-translate-y-1 hover:shadow-md ${
                        isSelected
                          ? "bg-[var(--surface)] border-[#6D4AFF] shadow-[0_8px_20px_-8px_rgba(109,74,255,0.15)] ring-2 ring-[#6D4AFF]/10"
                          : "bg-[var(--surface)]/70 backdrop-blur-xl border-white/20 text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? "bg-[#6D4AFF]/10 border-[#6D4AFF]/20 text-[#6D4AFF]" : "bg-neutral-50 border-neutral-100 text-neutral-500"} border shadow-inner transition-colors duration-300`}>
                        <ExamIcon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-neutral-800 tracking-wider uppercase">
                        {exam.name}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>

        </div>

        {/* Dynamic Explore CTA - Gradient themed to match other page actions */}
        <div className="flex justify-center mt-12">
          <Link href="/exams">
            <GlowButton variant="gradient" className="px-8 py-3.5 text-xs font-black shadow-sm" magnetic={false}>
              Explore All Exams Covered
            </GlowButton>
          </Link>
        </div>

      </div>
    </section>
  );
}

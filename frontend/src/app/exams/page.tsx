"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  GraduationCap,
  BookOpen,
  Briefcase,
  TrendingUp,
  Fingerprint,
  Globe2,
  FileCheck,
  Award,
  Cpu,
  Target,
  ShieldCheck,
  Languages,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import { useAuth } from "@/lib/auth-context";

interface Exam {
  name: string;
  subtitle: string;
  category: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  toolkit: {
    focus: string;
    features: string[];
  };
}

const examsList: Exam[] = [
  { 
    name: "UPSC", 
    subtitle: "Civil Services, CAPF, CDS",
    icon: Globe2, 
    color: "text-purple-500", 
    bgColor: "bg-purple-50/50",
    borderColor: "border-purple-200/50",
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
    subtitle: "CGL, CHSL, Selection Posts",
    icon: Award, 
    color: "text-red-500", 
    bgColor: "bg-red-50/50",
    borderColor: "border-red-200/50",
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
    subtitle: "SBI PO, IBPS Clerk, RBI Grade B",
    icon: Building2, 
    color: "text-blue-500", 
    bgColor: "bg-blue-50/50",
    borderColor: "border-blue-200/50",
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
    subtitle: "Engineering Entrance & PSUs",
    icon: Cpu, 
    color: "text-sky-600", 
    bgColor: "bg-sky-50/50",
    borderColor: "border-sky-200/50",
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
    subtitle: "IIMs & Top Business Schools",
    icon: Target, 
    color: "text-violet-600", 
    bgColor: "bg-violet-50/50",
    borderColor: "border-violet-200/50",
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
    subtitle: "NTPC, Group D, ALP",
    icon: FileCheck, 
    color: "text-cyan-500", 
    bgColor: "bg-cyan-50/50",
    borderColor: "border-cyan-200/50",
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
    subtitle: "State Civil Services, MPSC, UPPSC",
    icon: Briefcase, 
    color: "text-indigo-500", 
    bgColor: "bg-indigo-50/50",
    borderColor: "border-indigo-200/50",
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
    subtitle: "SI, Constable Exams",
    icon: Fingerprint, 
    color: "text-emerald-500", 
    bgColor: "bg-emerald-50/50",
    borderColor: "border-emerald-200/50",
    category: "civil-gov",
    toolkit: {
      focus: "General Knowledge & Aptitude",
      features: [
        "Law, Constitution, and GK summary card packs",
        "Daily practice set generator targeting general awareness",
        "Bilingual test sheets translation (English/Hindi)"
      ]
    }
  },
  { 
    name: "Defence", 
    subtitle: "NDA, CDS, AFCAT",
    icon: GraduationCap, 
    color: "text-rose-500", 
    bgColor: "bg-rose-50/50",
    borderColor: "border-rose-200/50",
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
    subtitle: "Central Universities Entrance Test",
    icon: TrendingUp, 
    color: "text-amber-500", 
    bgColor: "bg-amber-50/50",
    borderColor: "border-amber-200/50",
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
    subtitle: "English Proficiency Test",
    icon: Languages, 
    color: "text-rose-600", 
    bgColor: "bg-rose-50/50",
    borderColor: "border-rose-200/50",
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
    subtitle: "Financial Risk Manager",
    icon: ShieldCheck, 
    color: "text-green-600", 
    bgColor: "bg-green-50/50",
    borderColor: "border-green-200/50",
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

const categories = [
  { id: "all", label: "All Exams" },
  { id: "civil-gov", label: "Civil Services & Government" },
  { id: "tech-business", label: "Technical & Business" },
  { id: "ug-general", label: "Undergraduate & General" }
];

export default function ExamsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { isAuthenticated } = useAuth();

  const filteredExams = examsList.filter(
    (exam) => activeCategory === "all" || exam.category === activeCategory
  );

  return (
    <PageLayout
      title="Exams We Cover"
      description="Prepare for all major competitive exams"
      breadcrumb={[{ label: "Exams", href: "/exams" }]}
    >
      <div className="layout-container max-w-[1240px] px-4 mx-auto py-10 relative z-10">
        
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-start gap-2 mb-12 max-w-4xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition-all duration-300 cursor-pointer shadow-sm ${
                activeCategory === cat.id
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white border border-[#ECECEC] text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Exams Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredExams.map((exam) => {
              const ExamIcon = exam.icon;
              const examSlug = exam.name.toLowerCase().replace(/ /g, "-");
              const targetHref = isAuthenticated 
                ? `/exams/${examSlug}` 
                : `/login?exam=${exam.name.toLowerCase()}`;
              
              return (
                <Link
                  href={targetHref}
                  key={exam.name}
                  className="block group"
                >
                  <GlassCard
                    className="p-6 h-full flex flex-col justify-between hover:shadow-lg border-[#ECECEC] hover:border-[#6D4AFF]/50 transition-all duration-300 bg-white/70 group-hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-5 border-b border-[#ECECEC] pb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${exam.bgColor} ${exam.color} border ${exam.borderColor} flex items-center justify-center shrink-0`}>
                            <ExamIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-neutral-900 group-hover:text-[#6D4AFF] transition-colors">
                              {exam.name}
                            </h4>
                            <p className="text-[10px] font-semibold text-neutral-400">
                              {exam.subtitle}
                            </p>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-[#6D4AFF]/10 group-hover:text-[#6D4AFF] transition-colors shrink-0">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Toolkit focus */}
                      <div className="mb-4">
                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest block mb-1">
                          Optimization Focus
                        </span>
                        <p className="text-xs text-neutral-800 font-extrabold">
                          {exam.toolkit.focus}
                        </p>
                      </div>

                      {/* Capabilities */}
                      <div className="border-t border-[#ECECEC] pt-4 mt-4">
                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest block mb-2.5">
                          AI Study Toolkit
                        </span>
                        <ul className="space-y-2">
                          {exam.toolkit.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2 text-[10px] text-neutral-600 font-bold leading-relaxed">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </motion.div>
        </AnimatePresence>

      </div>
    </PageLayout>
  );
}

"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Award,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Bookmark,
  Users,
  Target,
  FileText,
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
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Exam datasets for rich dynamic details
const examDetailsData: Record<
  string,
  {
    title: string;
    description: string;
    emoji: string;
    color: string;
    papers: string;
    subjects: string;
    duration: string;
    learners: string;
    highlights: string[];
    syllabus: { name: string; topics: string[] }[];
  }
> = {
  ssc: {
    title: "SSC CGL & CHSL Prep Center",
    description: "Master Quantitative Aptitude, English, Reasoning, and General Awareness tailored for Staff Selection Commission exams.",
    emoji: "🏛️",
    color: "#6D4AFF",
    papers: "150+ Mock Tests",
    subjects: "4 Main Subjects",
    duration: "60-120 Mins / Paper",
    learners: "45K+ Aspirants",
    highlights: [
      "Latest 2024 Tier 1 & Tier 2 exam patterns",
      "Topic-wise daily quizzes and sectional analysis",
      "Previous years solved question papers (2018-2023)",
      "Speed-math tricks & formula cheat sheets",
    ],
    syllabus: [
      { name: "Quantitative Aptitude", topics: ["Arithmetic", "Algebra", "Geometry", "Trigonometry", "Data Interpretation"] },
      { name: "English Comprehension", topics: ["Grammar Rules", "Vocabulary & Idioms", "Reading Comprehension", "Cloze Test"] },
      { name: "General Intelligence & Reasoning", topics: ["Syllogism", "Blood Relations", "Coding-Decoding", "Analogy", "Non-Verbal"] },
      { name: "General Awareness", topics: ["History", "Polity", "Geography", "Science", "Current Affairs"] },
    ],
  },
  upsc: {
    title: "UPSC CSE (IAS/IPS) Guidance Portal",
    description: "Deep content analytics and contextual descriptive notes for Prelims, GS Papers, and CSAT preparation.",
    emoji: "🎓",
    color: "#4F46E5",
    papers: "200+ Essay & GS Papers",
    subjects: "12 Subjects",
    duration: "120 Mins / Prelims Paper",
    learners: "20K+ Aspirants",
    highlights: [
      "Structured GS 1-4 syllabus breakups & note generation",
      "Interactive answer writing tips and AI grading suggestions",
      "Comprehensive CSAT mock test papers with solutions",
      "Monthly current affairs capsules and critical analysis",
    ],
    syllabus: [
      { name: "GS Paper 1", topics: ["Indian Culture", "Modern History", "World Geography", "Society & Social Issues"] },
      { name: "GS Paper 2", topics: ["Indian Constitution", "Governance & Polity", "Social Justice", "International Relations"] },
      { name: "GS Paper 3", topics: ["Economy", "Science & Technology", "Environment", "Security & Disaster Management"] },
      { name: "CSAT (Paper 2)", topics: ["Reading Comprehension", "Logical Reasoning", "Basic Numeracy", "Decision Making"] },
    ],
  },
  "state-psc": {
    title: "State PSC Exam Preparation Hub",
    description: "State-specific general knowledge, administration, and historical mock tests tailored to regional commissions.",
    emoji: "🏢",
    color: "#8B5CF6",
    papers: "100+ Full-Length Tests",
    subjects: "10 Core Subjects",
    duration: "120 Mins / Exam",
    learners: "30K+ Aspirants",
    highlights: [
      "Regional geography, history, and government policies coverage",
      "Bilingual preparation material (English & local languages)",
      "Daily state current affairs updates",
      "State-specific budget and economic survey analysis",
    ],
    syllabus: [
      { name: "State Specific GK", topics: ["History of the State", "Geography & Forest Resources", "State Art & Culture", "Local administration"] },
      { name: "General Studies", topics: ["Indian History", "Indian Economy", "General Science", "Environment"] },
    ],
  },
  defence: {
    title: "Defence Services Academy (NDA / CDS)",
    description: "Train for NDA, CDS, and AFCAT written examinations with focused physics, mathematics, and general English modules.",
    emoji: "🛡️",
    color: "#22C55E",
    papers: "80+ Practice Papers",
    subjects: "6 Subject Domains",
    duration: "150 Mins / Exam",
    learners: "15K+ Aspirants",
    highlights: [
      "NDA Mathematics specialized training",
      "General English & basic science quick guides",
      "Mock SSB preparation guidelines & intelligence tests",
      "Previous 10 years CDS question banks",
    ],
    syllabus: [
      { name: "Mathematics", topics: ["Algebra & Matrices", "Trigonometry & Calculus", "Probability & Statistics", "Vector Algebra"] },
      { name: "General Ability Test (GAT)", topics: ["Physics", "Chemistry", "General Science", "History & Civics", "Geography"] },
    ],
  },
  banking: {
    title: "Banking & Insurance Officer Academy",
    description: "Speed & accuracy training for IBPS, SBI PO, and RBI Grade B prelims & mains exams.",
    emoji: "🏦",
    color: "#F59E0B",
    papers: "120+ Speed Mock Exams",
    subjects: "5 Main Modules",
    duration: "60-120 Mins / Paper",
    learners: "50K+ Aspirants",
    highlights: [
      "Sectional timers mimicking real exam conditions",
      "Data Interpretation and logical puzzles specialized tests",
      "Banking & financial awareness monthly summaries",
      "Computer aptitude and keyboard skills exercises",
    ],
    syllabus: [
      { name: "Quantitative Aptitude", topics: ["Data Interpretation", "Simplification & Approximation", "Number Series", "Quadratic Equations"] },
      { name: "Reasoning Ability", topics: ["Puzzles & Seating Arrangement", "Syllogism", "Coding-Decoding", "Input-Output"] },
      { name: "Financial Awareness", topics: ["Banking Terminology", "Economic News", "RBI Policies", "Government Schemes"] },
    ],
  },
  teaching: {
    title: "Teacher Eligibility Test (TET) Academy",
    description: "Pedagogy, child development, and language courses for CTET, State TETs, and KVS recruiter tests.",
    emoji: "👨‍🏫",
    color: "#EC4899",
    papers: "90+ Pedagogy Papers",
    subjects: "4 Core Subjects",
    duration: "150 Mins / Exam",
    learners: "25K+ Aspirants",
    highlights: [
      "Child Development and Pedagogy (CDP) modules",
      "Subject pedagogy (Maths, Science, EVS, Social Studies)",
      "Language pedagogy and language comprehension practice",
      "KVS & NVS previous recruitment exam solutions",
    ],
    syllabus: [
      { name: "Child Development & Pedagogy", topics: ["Concept of Development", "Inclusive Education", "Learning & Pedagogy theories"] },
      { name: "Language 1 & 2", topics: ["Language Comprehension", "Pedagogy of Language Development"] },
    ],
  },
  engineering: {
    title: "GATE & ESE Engineering Prep",
    description: "High-yield engineering mathematics, general aptitude, and branch-specific technical mocks.",
    emoji: "⚙️",
    color: "#06B6D4",
    papers: "60+ Gate Mock Papers",
    subjects: "8 Core Branches",
    duration: "180 Mins / Exam",
    learners: "18K+ Aspirants",
    highlights: [
      "Subject-wise and full-length gate simulators",
      "Detailed virtual calculator training & tips",
      "Engineering mathematics formulas and conceptual notes",
      "Step-by-step video solution references",
    ],
    syllabus: [
      { name: "Engineering Mathematics", topics: ["Linear Algebra", "Calculus & Differential Equations", "Numerical Methods", "Probability"] },
      { name: "General Aptitude", topics: ["Verbal Ability", "Numerical Ability & Spatial Aptitude"] },
    ],
  },
  police: {
    title: "Police Force Recruit Academy",
    description: "Focused preparation for Sub-Inspector (SI) and Constable written tests including physical standard guidelines.",
    emoji: "👮",
    color: "#EF4444",
    papers: "70+ Recruitment Exams",
    subjects: "5 Core Subjects",
    duration: "90-120 Mins / Paper",
    learners: "35K+ Aspirants",
    highlights: [
      "State-specific police laws & code basics",
      "General awareness and mental ability mocks",
      "Bilingual exam paper sets",
      "Physical efficiency test tips & benchmark guidelines",
    ],
    syllabus: [
      { name: "General Studies & GK", topics: ["Indian Constitution", "Human Rights", "General Science", "State Police Rules"] },
      { name: "Mental Ability & Arithmetic", topics: ["Logical Diagrams", "Numerical Ability", "Coding & Analogy", "Space Visualization"] },
    ],
  },
};

export default function ExamDetail() {
  const { id } = useParams() as { id: string };
  const examKey = id ? id.toLowerCase() : "";
  const exam = examDetailsData[examKey];

  if (!exam) {
    return (
      <PageLayout title="Exam Not Found" breadcrumb={[{ label: "Exams", href: "/exams" }]}>
        <div className="layout-container max-w-[600px] px-4 mx-auto text-center py-20 space-y-4">
          <p className="text-lg text-neutral-500 font-bold">
            The exam portal you are looking for does not exist or is currently being compiled.
          </p>
          <Link
            href="/exams"
            className="inline-flex items-center gap-2 text-sm font-black text-white bg-[#6D4AFF] px-6 py-3 rounded-xl hover:bg-[#8B5CF6] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Exams List
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={exam.title}
      description={exam.description}
      breadcrumb={[
        { label: "Exams", href: "/exams" },
        { label: examKey.toUpperCase(), href: `/exams/${examKey}` },
      ]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto space-y-16">
        
        {/* Breadcrumb Back Button */}
        <div>
          <Link
            href="/exams"
            className="inline-flex items-center gap-2 text-xs font-black uppercase text-neutral-400 hover:text-[#6D4AFF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Exams
          </Link>
        </div>

        {/* Quick Stats Banner */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-6 md:p-8 shadow-md"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-400 block uppercase">Available Content</span>
            <span className="text-lg font-black text-neutral-800 flex items-center gap-1.5">
              <FileText className="w-5 h-5 text-[#6D4AFF]" /> {exam.papers}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-400 block uppercase">Curriculum Size</span>
            <span className="text-lg font-black text-neutral-800 flex items-center gap-1.5">
              <BookOpen className="w-5 h-5 text-[#6D4AFF]" /> {exam.subjects}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-400 block uppercase">Aspirant Base</span>
            <span className="text-lg font-black text-neutral-800 flex items-center gap-1.5">
              <Users className="w-5 h-5 text-[#6D4AFF]" /> {exam.learners}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-400 block uppercase">Test Duration</span>
            <span className="text-lg font-black text-neutral-800 flex items-center gap-1.5">
              <Clock className="w-5 h-5 text-[#6D4AFF]" /> {exam.duration}
            </span>
          </div>
        </motion.div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Syllabus Structure */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-8 space-y-8"
          >
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-neutral-900">Official Prep Syllabus</h2>
              <p className="text-neutral-500 font-semibold text-sm">
                Understand the sub-modules and core topics covered under the ExamForge AI compiler.
              </p>
            </div>

            <div className="space-y-5">
              {exam.syllabus.map((syl, sIdx) => (
                <motion.div
                  key={sIdx}
                  variants={itemVariants}
                  className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-6 md:p-8 shadow-sm"
                >
                  <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-[#6D4AFF]" /> {syl.name}
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {syl.topics.map((topic, tIdx) => (
                      <span
                        key={tIdx}
                        className="flex items-center gap-1.5 text-xs font-bold bg-[#6D4AFF]/5 text-[#6D4AFF] px-3.5 py-2 rounded-full border border-[#6D4AFF]/10"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6D4AFF]" />
                        {topic}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Highlights / Start Test CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 space-y-6 lg:sticky lg:top-24"
          >
            {/* Highlights Card */}
            <div className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-8 shadow-md space-y-6">
              <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#6D4AFF]" /> Exam Highlights
              </h3>
              <ul className="space-y-3.5">
                {exam.highlights.map((hl, hlIdx) => (
                  <li key={hlIdx} className="flex gap-2.5 text-sm font-semibold text-neutral-500 leading-relaxed">
                    <Bookmark className="w-4 h-4 text-[#6D4AFF] mt-1 shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preparation CTA Box */}
            <div className="bg-gradient-to-br from-[#6D4AFF] to-[#8B5CF6] text-white p-8 rounded-[24px] shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/10">
                Aspirant Pack
              </span>
              <h3 className="text-2xl font-black mt-4 mb-2">Ready to Start Preparing?</h3>
              <p className="text-purple-100 text-sm font-semibold mb-6">
                Get unlimited access to AI notes, dynamic flashcards, and personalized daily mock tests.
              </p>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-black text-[#6D4AFF] bg-white py-4 rounded-xl hover:bg-neutral-50 hover:shadow-lg transition-all"
              >
                Launch Mock Exam <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </PageLayout>
  );
}

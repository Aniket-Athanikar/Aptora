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

// Exam datasets for all 12 dynamic details keys
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
  "ssc-cgl": {
    title: "SSC CGL & CHSL Prep Center",
    description: "Master Quantitative Aptitude, English, Reasoning, and General Awareness tailored for Staff Selection Commission exams.",
    emoji: "🏛️",
    color: "#EF4444",
    papers: "150+ Mock Tests",
    subjects: "4 Main Subjects",
    duration: "60-120 Mins / Paper",
    learners: "45K+ Aspirants",
    highlights: [
      "Latest Tier 1 & Tier 2 exam patterns",
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
  ssc: {
    title: "SSC CGL & CHSL Prep Center",
    description: "Master Quantitative Aptitude, English, Reasoning, and General Awareness tailored for Staff Selection Commission exams.",
    emoji: "🏛️",
    color: "#EF4444",
    papers: "150+ Mock Tests",
    subjects: "4 Main Subjects",
    duration: "60-120 Mins / Paper",
    learners: "45K+ Aspirants",
    highlights: [
      "Latest Tier 1 & Tier 2 exam patterns",
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
    color: "#A855F7",
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
    color: "#6366F1",
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
    color: "#F43F5E",
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
    color: "#3B82F6",
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
  gate: {
    title: "GATE Engineering Entrance Prep",
    description: "High-yield engineering mathematics, general aptitude, and branch-specific technical mocks.",
    emoji: "⚙️",
    color: "#0284C7",
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
  cat: {
    title: "CAT Management Entrance Hub",
    description: "Preparation for entrance into IIMs and elite business schools with quantitative aptitude and data interpretation.",
    emoji: "🎯",
    color: "#7C3AED",
    papers: "75+ Full Length CAT mocks",
    subjects: "3 Core Sections",
    duration: "120 Mins / Paper",
    learners: "22K+ Aspirants",
    highlights: [
      "High level Quantitative Aptitude exercises",
      "Detailed Data Interpretation & Logical Reasoning (DILR) sets",
      "Verbal Ability & Reading Comprehension (VARC) guides",
      "Live mock percentile estimation maps"
    ],
    syllabus: [
      { name: "VARC", topics: ["Reading Comprehension", "Para Jumbles", "Paragraph Summary", "Odd-one-out"] },
      { name: "DILR", topics: ["Seating Arrangements", "Matrix Grids", "Logical Grouping", "Charts & Graphs", "Set Theory"] },
      { name: "Quantitative Aptitude", topics: ["Arithmetic", "Algebra", "Geometry & Mensuration", "Number Systems", "Modern Maths"] }
    ]
  },
  railway: {
    title: "Railway Recruitment Board (RRB) Prep",
    description: "Prep modules for RRB NTPC, ALP, Group D, and other national railway service examinations.",
    emoji: "🚆",
    color: "#06B6D4",
    papers: "95+ Practice Exams",
    subjects: "4 Main Subjects",
    duration: "90 Mins / Exam",
    learners: "40K+ Aspirants",
    highlights: [
      "General Science & General Awareness compiler notes",
      "Basic mathematics and reasoning shortcuts sheet",
      "Sectional mock tests and speed benchmarks checks",
      "Previous years solved question banks"
    ],
    syllabus: [
      { name: "Mathematics", topics: ["Number System", "Decimals & Fractions", "Ratio & Proportion", "Percentage", "Time & Work"] },
      { name: "General Intelligence & Reasoning", topics: ["Analogies", "Alphabetical & Number Series", "Coding & Decoding", "Mathematical Operations"] },
      { name: "General Awareness", topics: ["Current Events", "Sports & Culture", "General Science", "History & Geography"] }
    ]
  },
  police: {
    title: "Police Recruit Academy (SI & Constable)",
    description: "Focused preparation for Sub-Inspector (SI) and Constable written tests including physical standard guidelines.",
    emoji: "👮",
    color: "#10B981",
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
  "cuet-ug": {
    title: "CUET UG (Undergraduate Admission) Hub",
    description: "Master domain-specific subjects, general test metrics, and language comprehensions for Central Universities entrance.",
    emoji: "📈",
    color: "#F59E0B",
    papers: "110+ Domain Mock sets",
    subjects: "15 Domain Options",
    duration: "45-60 Mins / Subject",
    learners: "28K+ Aspirants",
    highlights: [
      "NCERT-grounded content summaries index",
      "Domain specific MCQ practice tests (Physics, Chemistry, History, etc.)",
      "General Test quant and logical reasoning exercises",
      "Detailed English/Hindi grammar logic guidelines"
    ],
    syllabus: [
      { name: "Language Test", topics: ["Reading Comprehension", "Vocabulary check", "Synonyms & Antonyms", "Literary Aptitude"] },
      { name: "Domain Specific Subjects", topics: ["Physics NCERT topics", "Chemistry NCERT topics", "Mathematics NCERT topics", "History & Polity"] },
      { name: "General Test", topics: ["General Knowledge", "Current Affairs", "General Mental Ability", "Numerical Ability"] }
    ]
  },
  ielts: {
    title: "IELTS Academic & General Portal",
    description: "Comprehensive English language proficiency diagnostics testing Reading, Writing, Listening, and Speaking.",
    emoji: "🗣️",
    color: "#E11D48",
    papers: "50+ Band 8-9 Mock papers",
    subjects: "4 Core Modules",
    duration: "165 Mins / Full Test",
    learners: "12K+ Aspirants",
    highlights: [
      "AI evaluation and feedback on written essays",
      "Realistic academic reading passages with answer keys",
      "Listening audio mock guidelines and transcription sets",
      "Speaking topic suggestions and sample model answers"
    ],
    syllabus: [
      { name: "Reading & Writing", topics: ["Academic Reading passages", "Graph description Writing Task 1", "Opinion Essay Writing Task 2"] },
      { name: "Listening & Speaking", topics: ["Audio comprehension quizzes", "One-on-one speaking topic templates", "Speaking cue-card notes"] }
    ]
  },
  frm: {
    title: "FRM Financial Risk Management Academy",
    description: "Advanced quant, risk models, market calculations, and valuation mocks grounded in GARP curriculum guidelines.",
    emoji: "🛡️",
    color: "#059669",
    papers: "40+ Risk valuation papers",
    subjects: "8 Core Books",
    duration: "240 Mins / Exam",
    learners: "8K+ Aspirants",
    highlights: [
      "Value at Risk (VaR) calculation guidelines",
      "Quantitative risk analysis equations models",
      "Financial markets and valuation simulation tests",
      "Ethics and risk management code practices"
    ],
    syllabus: [
      { name: "FRM Part I Core", topics: ["Foundations of Risk Management", "Quantitative Analysis", "Financial Markets & Products", "Valuation Models"] },
      { name: "FRM Part II Core", topics: ["Market Risk Measurement", "Credit Risk Measurement", "Operational Risk Management", "Investment Risk Management"] }
    ]
  }
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

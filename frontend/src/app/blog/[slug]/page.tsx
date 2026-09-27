"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, Calendar, BookOpen, Share2, MessageSquare, Heart } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";
import Image from "next/image";

interface BlogPost {
  title: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  image: string;
  content: {
    heading: string;
    text: string;
  }[];
}

const blogPostsData: Record<string, BlogPost> = {
  "how-ai-is-changing-the-way-students-prepare-for-exams": {
    title: "How AI is Changing the Way Students Prepare for Exams",
    category: "AI & Education",
    date: "29 May 2024",
    author: "Team Aptora",
    readTime: "6 Min Read",
    image: "/blog-ai-prep.png",
    content: [
      {
        heading: "The Shift to AI-Powered Preparation",
        text: "Traditional learning methods often rely on a one-size-fits-all curriculum. However, every student possesses unique strengths, weaknesses, and speeds of learning. AI is bridging this gap by analyzing individual student responses to mock questions and creating customized preparation pathways.",
      },
      {
        heading: "Intelligent Summaries and Active Recall",
        text: "One of the most tedious parts of preparation is summarizing thousands of pages of textbooks. Modern AI engines can scan dense material, index the most important concepts, and compile them into interactive summaries. When combined with automated flashcards, this keeps active recall levels exceptionally high.",
      },
      {
        heading: "Real-Time Feedback Loops",
        text: "Waiting days for test evaluations is a thing of the past. AI-driven mock tests provide instant category-level breakdowns, pinpointing exactly where a student lost marks and suggesting quick remedial quizzes. This ensures that no time is wasted revising areas where the student is already strong.",
      },
    ],
  },
  "top-10-study-tips-for-ssc-cgl-2024": {
    title: "Top 10 Study Tips for SSC CGL 2024",
    category: "Study Tips",
    date: "25 May 2024",
    author: "Mrunal Chaudhari",
    readTime: "4 Min Read",
    image: "/blog-ssc-tips.png",
    content: [
      {
        heading: "Focus on High-Yield Mathematics Modules",
        text: "SSC CGL Quantitative Aptitude sections reward speed and accuracy. Focus on arithmetic basics, fast-track calculations, and geometry formulas. Solve at least 25 math puzzles daily under timed conditions.",
      },
      {
        heading: "Build a Strict Revision Routine",
        text: "General Awareness can easily slip from memory. Create a structured weekend revision block. Revisit historical timelines, constitution articles, and geographical facts regularly using active recall methods.",
      },
      {
        heading: "Master Speed-Reading & Verbal Mock Sets",
        text: "The English comprehension section checks reading pace. Dedicate 20 minutes daily to reading quality newspapers, and practice at least two comprehension passages to master scanning keywords.",
      },
    ],
  },
  "how-to-use-mock-tests-effectively": {
    title: "How to Use Mock Tests Effectively",
    category: "Exam Strategy",
    date: "22 May 2024",
    author: "Sonu Chaudhari",
    readTime: "5 Min Read",
    image: "/blog-mock-tests.png",
    content: [
      {
        heading: "Simulate Real Exam Environments",
        text: "Do not take mock tests casually on your phone while lounging. Set up a quiet desk space, mute notifications, use a desktop interface, and adhere strictly to the countdown timer. Simulating pressure is key to mental stamina.",
      },
      {
        heading: "The 2-Hour Post-Test Analysis Rule",
        text: "For every 1 hour of test-taking, spend at least 2 hours analyzing the results. Categorize your errors into three buckets: Silly Mistakes, Concept Gaps, and Time Management Issues. Focus your next study blocks on the concept gaps.",
      },
      {
        heading: "Pacing and Section-Skipping Strategy",
        text: "If a math puzzle takes more than 60 seconds to set up, skip it immediately. Learn to identify and secure easy marks first before spending massive time chunks on complex, low-yield problems.",
      },
    ],
  },
  "best-books-for-upsc-preparation": {
    title: "Best Books for UPSC Preparation",
    category: "Resources",
    date: "20 May 2024",
    author: "Team Aptora",
    readTime: "5 Min Read",
    image: "/blog-upsc-books.png",
    content: [
      {
        heading: "Polity & Constitution Standards",
        text: "Laxmikanth's Indian Polity remains the benchmark. However, rather than reading it cover-to-cover passively, test your knowledge using chapter-wise questions and link political events to current affairs databases.",
      },
      {
        heading: "Modern History and Geography Guides",
        text: "Spectrum's Modern History and NCERT class 11-12 books for Geography form the ideal baseline. Focus heavily on maps, geographical boundaries, and historic timelines to secure pre-lims marks.",
      },
      {
        heading: "Economy & Current Affairs Ingestion",
        text: "Mrunal's Economy lectures or Ramesh Singh's Indian Economy provide basic frameworks. Support this by reading monthly magazines or using AI search tools to decode complex economic definitions.",
      },
    ],
  },
};

export default function BlogPostDetail() {
  const { slug } = useParams() as { slug: string };
  const post = blogPostsData[slug];

  if (!post) {
    return (
      <PageLayout title="Article Not Found" breadcrumb={[{ label: "Blog", href: "/blog" }]}>
        <div className="layout-container max-w-[600px] px-4 mx-auto text-center py-20 space-y-4">
          <p className="text-lg text-neutral-500 font-bold">
            The article you are looking for does not exist or has been archived.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-black text-white bg-[#6D4AFF] px-6 py-3 rounded-xl hover:bg-[#8B5CF6] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog Directory
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={post.title}
      description={post.category}
      breadcrumb={[
        { label: "Blog", href: "/blog" },
        { label: post.title.substring(0, 20) + "...", href: `/blog/${slug}` },
      ]}
    >
      <div className="layout-container max-w-[900px] px-4 mx-auto space-y-10">
        {/* Back Link */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-black uppercase text-neutral-400 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Articles
          </Link>
        </div>

        {/* Hero Cover Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-[350px] md:h-[450px] rounded-[32px] overflow-hidden border border-[#ECECEC] shadow-xl"
        >
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </motion.div>

        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-5 shadow-sm">
          <div className="flex items-center gap-6 text-xs text-neutral-500 font-bold">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              {post.readTime}
            </span>
          </div>

          {/* Social Stats Block */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl bg-neutral-100 hover:bg-emerald-50 text-neutral-500 hover:text-emerald-600 transition-all">
              <Heart className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl bg-neutral-100 hover:bg-emerald-50 text-neutral-500 hover:text-emerald-600 transition-all">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl bg-neutral-100 hover:bg-emerald-50 text-neutral-500 hover:text-emerald-600 transition-all">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-10">
          {post.content.map((sec, idx) => (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-xl md:text-2xl font-black text-neutral-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                {sec.heading}
              </h2>
              <p className="text-neutral-600 font-medium leading-relaxed text-base md:text-lg">
                {sec.text}
              </p>
            </motion.section>
          ))}
        </div>

        {/* Premium Upgrade Block */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-650 text-white p-8 md:p-12 rounded-[32px] shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
          <h3 className="text-2xl md:text-3xl font-black mb-3">Prep Smarter with Aptora</h3>
          <p className="text-emerald-50 text-sm font-semibold mb-6 max-w-lg">
            Don&apos;t just read about strategies. Build your customized notes, practice sectional sets, and analyze performance dashboards inside our premium academy.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm font-black text-emerald-600 bg-white px-8 py-3.5 rounded-xl hover:bg-neutral-50 hover:shadow-lg transition-all border-none"
          >
            Explore Pricing Plans
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}

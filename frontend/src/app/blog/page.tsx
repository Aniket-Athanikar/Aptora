"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";
import Image from "next/image";

const featuredPost = {
  title: "How AI is Changing the Way Students Prepare for Exams",
  category: "AI & Education",
  date: "29 May 2024",
  author: "By Team Aptora",
  excerpt:
    "Artificial intelligence is revolutionizing the education landscape. From personalized study plans to AI-generated practice questions, discover how modern tools are helping students achieve better results in less time.",
  slug: "how-ai-is-changing-the-way-students-prepare-for-exams",
  image: "/blog-ai-prep.png",
};

const sidebarPosts = [
  {
    title: "Top 10 Study Tips for SSC CGL 2024",
    category: "Study Tips",
    date: "25 May 2024",
    slug: "top-10-study-tips-for-ssc-cgl-2024",
    image: "/blog-ssc-tips.png",
  },
  {
    title: "How to Use Mock Tests Effectively",
    category: "Exam Strategy",
    date: "22 May 2024",
    slug: "how-to-use-mock-tests-effectively",
    image: "/blog-mock-tests.png",
  },
  {
    title: "Best Books for UPSC Preparation",
    category: "Resources",
    date: "20 May 2024",
    slug: "best-books-for-upsc-preparation",
    image: "/blog-upsc-books.png",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
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

export default function BlogPage() {
  return (
    <PageLayout
      title="Latest from Our Blog"
      description="Tips, strategies and updates for aspirants"
      breadcrumb={[{ label: "Blog", href: "/blog" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto">
        {/* Top bar: Badge + View All */}
        <div className="flex items-center justify-between mb-12">
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-block bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-100"
          >
            Blog & Articles
          </motion.span>

          <motion.button
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5"
          >
            View All Posts
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Blog Layout: Featured + Sidebar */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
        >
          {/* Featured Post — takes 3/5 width */}
          <motion.article
            variants={itemVariants}
            className="lg:col-span-3 group relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md hover:border-emerald-500/40 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400 z-20" />
            <Link href={`/blog/${featuredPost.slug}`} className="block">
              {/* Image banner */}
              <div className="relative h-64 md:h-72 w-full overflow-hidden">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-black text-sm drop-shadow-md">
                    Aptora Blog
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Category */}
                <span className="inline-block bg-emerald-100/70 text-emerald-800 text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full mb-4 border border-emerald-200/50">
                  {featuredPost.category}
                </span>

                <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-3 leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                  {featuredPost.title}
                </h2>

                <p className="text-sm text-neutral-600 font-semibold leading-relaxed mb-6">
                  {featuredPost.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-5 text-xs text-neutral-500 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    {featuredPost.author}
                  </span>
                </div>
              </div>
            </Link>
          </motion.article>

          {/* Sidebar Posts — takes 2/5 width */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {sidebarPosts.map((post) => (
              <motion.article
                key={post.title}
                variants={itemVariants}
                className="group relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400 z-20" />
                <Link href={`/blog/${post.slug}`} className="flex flex-row w-full h-full">
                  {/* Small image container */}
                  <div className="w-28 md:w-32 relative flex-shrink-0 min-h-[110px] overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 112px, 128px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col justify-center flex-1 pt-6">
                    <span className="inline-block w-fit bg-emerald-100/70 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2 border border-emerald-200/50">
                      {post.category}
                    </span>

                    <h3 className="text-sm font-black text-neutral-900 leading-snug mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                      {post.title}
                    </h3>

                    <span className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-bold">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {post.date}
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </motion.div>

        {/* Next Step CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center pt-12"
        >
          <div className="relative border-2 border-emerald-500/30 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-[#084c38] via-emerald-900 to-teal-950 p-8 md:p-12 text-white max-w-[900px] mx-auto group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-400 to-teal-300" />
            <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
            <h3 className="text-2xl md:text-3xl font-black mb-3 text-white pt-2">Learn Smarter. Achieve Faster.</h3>
            <p className="text-emerald-100 text-sm font-semibold mb-6 max-w-lg mx-auto">
              Get full-length mock exams, customized schedules, and personalized notes powered by advanced AI.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-black text-emerald-950 bg-white px-8 py-3.5 rounded-xl hover:bg-emerald-50 hover:scale-[1.02] shadow-xl transition-all border-none"
            >
              Choose Your Study Plan <ArrowRight className="w-4 h-4 text-emerald-800" />
            </Link>
          </div>
        </motion.section>
      </div>
    </PageLayout>
  );
}

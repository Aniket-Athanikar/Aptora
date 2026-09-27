"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Rocket, Eye, BookOpen, BrainCircuit, BarChart3, Users, ArrowRight } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const features = [
  "AI-powered notes generation from any textbook",
  "Smart question generation with difficulty levels",
  "Personalized study analytics & recommendations",
  "Performance analytics to track your growth",
];

const stats = [
  { label: "Happy Students", end: 1, suffix: "M+", icon: Users },
  { label: "Books Processed", end: 10, suffix: "K+", icon: BookOpen },
  { label: "Questions Generated", end: 50, suffix: "M+", icon: BrainCircuit },
  { label: "Success Rate", end: 95, suffix: "%", icon: BarChart3 },
];

export default function AboutPage() {
  return (
    <PageLayout
      title="About Aptora"
      description="Empowering students with AI-driven exam preparation tools"
      breadcrumb={[{ label: "About Us", href: "/about" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto space-y-20">
        {/* Hero Intro */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-8 md:p-12 shadow-lg"
          >
            <p className="text-lg md:text-xl text-neutral-600 font-medium leading-relaxed mb-8">
              Aptora is a next-generation, AI-powered exam preparation platform designed to
              revolutionize how students learn and prepare for competitive exams. We leverage cutting-edge
              artificial intelligence to transform textbooks into smart study material — generating notes,
              practice questions, and personalized analytics that adapt to each learner&apos;s unique needs.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/50"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold text-neutral-700">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Mission & Vision */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="text-center mb-12">
            <span className="inline-block bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-100 mb-4">
              What Drives Us
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900">Our Purpose</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
                <Rocket className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-neutral-900 mb-4">Our Mission</h3>
              <p className="text-neutral-600 font-medium leading-relaxed">
                To make quality education accessible to every student through AI-powered learning.
                We believe every learner deserves personalized, intelligent tools that break down
                barriers to success — regardless of geography, background, or resources.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-2xl font-black text-neutral-900 mb-4">Our Vision</h3>
              <p className="text-neutral-600 font-medium leading-relaxed">
                To be the most trusted AI learning platform for competitive exam success in India
                and beyond. We envision a world where technology amplifies human potential and every
                student can unlock their best performance through smart, adaptive preparation.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Counter Row */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="text-center mb-12">
            <span className="inline-block bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-100 mb-4">
              Our Impact
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900">Numbers That Speak</h2>
            <p className="mt-3 text-neutral-500 font-semibold max-w-xl mx-auto">
              We&apos;re proud of the impact we&apos;ve made in the lives of millions of students
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-6 md:p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm font-bold text-neutral-500">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Next Step CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center pt-8"
        >
          <div className="bg-[#084c38] text-white p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden max-w-[900px] mx-auto">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Ready to prep smarter?</h3>
            <p className="text-emerald-100 text-sm font-medium mb-6 max-w-lg mx-auto">
              Discover the powerful AI notes generators, practice exams, and analytics that make learning fast and adaptive.
            </p>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#084c38] bg-white px-8 py-3.5 rounded-xl hover:bg-slate-100 transition-all shadow-sm"
            >
              Explore AI Features <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.section>

      </div>
    </PageLayout>
  );
}

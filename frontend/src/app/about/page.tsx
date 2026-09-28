"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Rocket, Eye, BookOpen, BrainCircuit, BarChart3, Users, ArrowRight, Sparkles } from "lucide-react";
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
      <div className="layout-container max-w-[1320px] px-4 mx-auto space-y-16">
        {/* Hero Intro */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            variants={itemVariants}
            className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-2xl p-8 md:p-12 overflow-hidden glow-emerald"
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />

            <p className="text-lg md:text-xl text-slate-700 font-medium leading-relaxed mb-8 pt-2 font-sans">
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
                  className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-bold text-slate-800 font-display">{feature}</span>
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
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#084c38] text-xs font-black uppercase tracking-widest mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>WHAT DRIVES US</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-display">Our Purpose</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <motion.div
              variants={itemVariants}
              className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-xl p-8 overflow-hidden hover:border-emerald-400 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#084c38] to-[#059669] text-white flex items-center justify-center mb-6 shadow-md pt-1">
                <Rocket className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 font-display">Our Mission</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                To make quality education accessible to every student through AI-powered learning.
                We believe every learner deserves personalized, intelligent tools that break down
                barriers to success — regardless of geography, background, or resources.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              variants={itemVariants}
              className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-xl p-8 overflow-hidden hover:border-emerald-400 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center mb-6 shadow-md pt-1">
                <Eye className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 font-display">Our Vision</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                To be the most trusted AI learning platform for competitive exam success in India
                and beyond. We envision a world where technology amplifies human potential and every
                student can unlock their best performance through smart, adaptive preparation.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative rounded-3xl bg-white border-2 border-emerald-500/20 shadow-xl p-8 md:p-12 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div key={idx} variants={itemVariants} className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#084c38] flex items-center justify-center mx-auto mb-4 shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-slate-900 font-display mb-1">
                    <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 font-display uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-gradient-to-r from-[#084c38] via-emerald-900 to-teal-900 text-white p-8 md:p-12 shadow-2xl text-center overflow-hidden glow-emerald"
        >
          <h2 className="text-3xl md:text-4xl font-black font-display mb-4">Ready to Start Preparing Smarter?</h2>
          <p className="text-emerald-100 font-medium max-w-xl mx-auto mb-8">
            Join thousands of aspirants who use Aptora to power their daily study routine.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#084c38] font-black hover:bg-emerald-50 transition-all shadow-lg hover:scale-105"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.section>
      </div>
    </PageLayout>
  );
}

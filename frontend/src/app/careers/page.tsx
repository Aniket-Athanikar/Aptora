"use client";

import { motion } from "framer-motion";
import {
  Lightbulb,
  GraduationCap,
  Users,
  Heart,
  MapPin,
  Clock,
  ArrowRight,
  Briefcase,
  Sparkles,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";
import Image from "next/image";

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

const benefits = [
  {
    icon: Lightbulb,
    title: "Innovation & Growth",
    description:
      "Work on cutting-edge AI/ML technologies and shape the future of education technology.",
    color: "#059669",
  },
  {
    icon: GraduationCap,
    title: "Learn and Build",
    description:
      "Access learning budgets, mentorship programs, and opportunities to attend global conferences.",
    color: "#4F46E5",
  },
  {
    icon: Users,
    title: "Collaborative Culture",
    description:
      "Join a diverse, supportive team where every voice matters and collaboration drives success.",
    color: "#A855F7",
  },
  {
    icon: Heart,
    title: "Inclusive Workplace",
    description:
      "We celebrate diversity and provide equal opportunities, flexible work, and comprehensive benefits.",
    color: "#22C55E",
  },
];

const openPositions = [
  {
    role: "SME - Quantitative Aptitude & Reasoning",
    type: "Full-time",
    location: "New Delhi, India",
    remote: true,
    tags: ["Quant Formulas", "Reasoning Shortcuts", "Exam Design"],
  },
  {
    role: "General Studies & GK Content Analyst",
    type: "Full-time",
    location: "New Delhi, India",
    remote: true,
    tags: ["Current Affairs", "Indian Polity & History", "Syllabus Indexing"],
  },
  {
    role: "Competitive Exam Curator (UPSC/SSC/Banking)",
    type: "Contract",
    location: "Bangalore, India",
    remote: true,
    tags: ["PYQ Database Analysis", "Syllabus Calibration", "Study Materials"],
  },
  {
    role: "Student Academic Mentor & Study Coach",
    type: "Full-time",
    location: "Remote, India",
    remote: true,
    tags: ["Student Support", "Study Planning", "Feedback Loop Analysis"],
  },
];

export default function CareersPage() {
  return (
    <PageLayout
      title="Careers at Aptora"
      description="Help us shape the future of education with AI"
      breadcrumb={[{ label: "Careers", href: "/careers" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto space-y-20">
        {/* Hero */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center"
        >
          <motion.div
            variants={itemVariants}
            className="relative border-2 border-emerald-500/20 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400 z-20" />
            {/* Visual Banner */}
            <div className="relative w-full h-[220px] md:h-[320px]">
              <Image
                src="/careers-hero.png"
                alt="Careers visual banner"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/30 to-transparent pointer-events-none" />
            </div>

            <div className="p-8 md:p-14 pt-4 md:pt-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
                Join Our Mission
              </h2>
              <p className="text-lg text-neutral-600 font-semibold max-w-2xl mx-auto leading-relaxed">
                At Aptora, we&apos;re building the future of exam preparation. We&apos;re looking
                for passionate, creative individuals who want to make a real impact on education through
                technology and artificial intelligence.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* Why Join Us */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="text-center mb-12">
            <span className="inline-block bg-emerald-100/70 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200/50 mb-4">
              Why Us
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
              Why Join Aptora?
            </h2>
            <p className="mt-3 text-neutral-600 font-semibold max-w-xl mx-auto">
              More than a workplace — a launchpad for your career and impact
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md hover:border-emerald-500/40 p-7 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-5 shadow-md shadow-emerald-500/20 mt-1">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-neutral-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm font-semibold text-neutral-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Open Positions */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <div className="text-center mb-12">
            <span className="inline-block bg-emerald-100/70 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200/50 mb-4">
              Opportunities
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900">Open Positions</h2>
            <p className="mt-3 text-neutral-600 font-semibold max-w-xl mx-auto">
              Find the role that fits your skills and passion
            </p>
          </div>

          <div className="space-y-5">
            {openPositions.map((position, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-6 md:p-8 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-xl font-black text-neutral-900">{position.role}</h3>
                      {position.remote && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100/70 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200/50">
                          Remote
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-neutral-600 mb-3">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {position.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {position.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {position.tags.map((tag, tagIdx) => (
                        <span
                          key={tagIdx}
                          className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/careers/apply?role=${encodeURIComponent(position.role)}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#084c38] via-emerald-600 to-teal-500 text-white font-black px-6 py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 hover:scale-[1.02] transition-all self-start md:self-center cursor-pointer border-none"
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All CTA */}
          <motion.div variants={itemVariants} className="text-center mt-12">
            <button className="inline-flex items-center gap-2 border-2 border-emerald-500/20 bg-white/90 backdrop-blur-md text-neutral-900 font-black px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:border-emerald-500/40 hover:scale-[1.02] transition-all duration-300">
              View All Openings
              <ArrowRight className="w-4 h-4 text-emerald-600" />
            </button>
          </motion.div>
        </motion.section>
      </div>
    </PageLayout>
  );
}

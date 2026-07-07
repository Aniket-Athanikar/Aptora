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
    color: "#6D4AFF",
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
    role: "Frontend Developer",
    type: "Full-time",
    location: "Bangalore, India",
    remote: true,
    tags: ["React", "Next.js", "TypeScript"],
  },
  {
    role: "Backend Developer",
    type: "Full-time",
    location: "Bangalore, India",
    remote: true,
    tags: ["Node.js", "Python", "PostgreSQL"],
  },
  {
    role: "ML/AI Engineer",
    type: "Full-time",
    location: "Bangalore, India",
    remote: false,
    tags: ["PyTorch", "NLP", "LLMs"],
  },
  {
    role: "UI/UX Designer",
    type: "Contract",
    location: "Bangalore, India",
    remote: false,
    tags: ["Figma", "Design Systems", "Prototyping"],
  },
];

export default function CareersPage() {
  return (
    <PageLayout
      title="Careers at ExamForge AI"
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
            className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] overflow-hidden shadow-lg"
          >
            {/* Visual Banner */}
            <div className="relative w-full h-[220px] md:h-[320px]">
              <Image
                src="/careers-hero.png"
                alt="Careers visual banner"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-transparent pointer-events-none" />
            </div>

            <div className="p-8 md:p-14 pt-4 md:pt-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6D4AFF] to-[#8B5CF6] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
                Join Our Mission
              </h2>
              <p className="text-lg text-neutral-500 font-semibold max-w-2xl mx-auto leading-relaxed">
                At ExamForge AI, we&apos;re building the future of exam preparation. We&apos;re looking
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
            <span className="inline-block bg-[#6D4AFF]/5 text-[#6D4AFF] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-[#6D4AFF]/10 mb-4">
              Why Us
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
              Why Join ExamForge AI?
            </h2>
            <p className="mt-3 text-neutral-500 font-semibold max-w-xl mx-auto">
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
                  className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-7 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border"
                    style={{
                      backgroundColor: `${benefit.color}08`,
                      borderColor: `${benefit.color}18`,
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: benefit.color }} />
                  </div>
                  <h3 className="text-lg font-black text-neutral-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm font-medium text-neutral-500 leading-relaxed">
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
            <span className="inline-block bg-[#6D4AFF]/5 text-[#6D4AFF] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-[#6D4AFF]/10 mb-4">
              Opportunities
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900">Open Positions</h2>
            <p className="mt-3 text-neutral-500 font-semibold max-w-xl mx-auto">
              Find the role that fits your skills and passion
            </p>
          </div>

          <div className="space-y-5">
            {openPositions.map((position, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-6 md:p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="w-5 h-5 text-[#6D4AFF]" />
                      <h3 className="text-xl font-black text-neutral-900">{position.role}</h3>
                      {position.remote && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#22C55E]/10 text-[#22C55E] px-2.5 py-1 rounded-full border border-[#22C55E]/20">
                          Remote
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-neutral-500 mb-3">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {position.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {position.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {position.tags.map((tag, tagIdx) => (
                        <span
                          key={tagIdx}
                          className="text-xs font-bold bg-[#6D4AFF]/5 text-[#6D4AFF] px-3 py-1 rounded-full border border-[#6D4AFF]/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/careers/apply?role=${encodeURIComponent(position.role)}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all self-start md:self-center cursor-pointer"
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
            <button className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-[#ECECEC] text-neutral-900 font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:border-[#6D4AFF]/30 hover:-translate-y-0.5 transition-all duration-300">
              View All Openings
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.section>
      </div>
    </PageLayout>
  );
}

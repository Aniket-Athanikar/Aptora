"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server, RefreshCw, Key, ArrowRight, UserCheck } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
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

const securityPillars = [
  {
    icon: Lock,
    title: "Data Encryption",
    desc: "Your data is safe with us. We use industry-standard AES-256 encryption at rest and TLS 1.3 in transit to keep your files secure.",
  },
  {
    icon: Eye,
    title: "Privacy Controls",
    desc: "We adhere strictly to privacy guidelines, ensuring that only you and authorized services can access your uploaded study material.",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    desc: "Hosted on certified, multi-region cloud servers with robust DDoS protection, automatic backups, and firewall configurations.",
  },
  {
    icon: RefreshCw,
    title: "Continuous Audits",
    desc: "We conduct regular vulnerability scans and automated penetration testing to identify and remediate potential vulnerabilities.",
  },
  {
    icon: Key,
    title: "Access Management",
    desc: "Secure JWT session handling, role-based access controls, and multi-factor authentication policies to prevent unauthorized entry.",
  },
  {
    icon: UserCheck,
    title: "Compliance Ready",
    desc: "Built from the ground up to follow strict compliance standards (SOC 2, ISO 27001 guidelines, and GDPR) for high-grade assurance.",
  },
];

export default function SecurityPage() {
  return (
    <PageLayout
      title="Security Overview"
      description="How we protect your data, privacy, and identity at ExamForge AI."
      breadcrumb={[{ label: "Security", href: "/security" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto space-y-20">

        {/* Intro Banner */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-black text-neutral-900 leading-tight">
              Enterprise-Grade Security Built Into Every Layer
            </h2>
            <p className="text-neutral-500 font-semibold leading-relaxed">
              At ExamForge AI, we understand that your notes, textbooks, and prep history are precious assets.
              Our priority is to protect your information through rigorous security controls, ongoing system scans,
              and state-of-the-art encryption algorithms.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs font-black text-neutral-900 bg-neutral-100 px-4 py-2.5 rounded-xl border border-neutral-200 uppercase tracking-wider">
                <Shield className="w-4 h-4 text-emerald-600" /> AES-256 Protected
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-neutral-900 bg-neutral-100 px-4 py-2.5 rounded-xl border border-neutral-200 uppercase tracking-wider">
                <Lock className="w-4 h-4 text-emerald-600" /> TLS 1.3 Certified
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 bg-gradient-to-br from-emerald-600 to-teal-650 text-white p-8 rounded-[24px] shadow-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
            <Shield className="w-12 h-12 text-white/90 mb-6" />
            <h3 className="text-xl font-black mb-2">Found a Security Issue?</h3>
            <p className="text-emerald-50 text-sm font-semibold mb-6">
              We reward researchers and developers who help keep ExamForge-AI safe. Submit reports directly to our team.
            </p>
            <Link
              href="/report-bug"
              className="inline-flex items-center gap-2 text-sm font-black text-emerald-600 bg-white px-5 py-3 rounded-xl hover:bg-neutral-50 hover:shadow-lg transition-all"
            >
              Report Vulnerability <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.section>

        {/* Security Pillars Grid */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="space-y-12"
        >
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-neutral-900">Security Safeguards</h2>
            <p className="text-neutral-500 font-semibold">
              Deep dive into the operational safety measures defending your credentials and data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityPillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-8 shadow-sm hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300 flex flex-col items-start gap-5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <pillar.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-neutral-900">{pillar.title}</h3>
                  <p className="text-neutral-500 text-sm font-semibold leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Trust Note */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-neutral-50 border border-neutral-200 rounded-[24px] p-8 md:p-12 text-center max-w-[900px] mx-auto space-y-4"
        >
          <h3 className="text-2xl font-black text-neutral-900">Your Privacy, Guaranteed</h3>
          <p className="text-neutral-500 font-semibold max-w-2xl mx-auto leading-relaxed">
            We will never sell or trade your personal files, mock test outputs, or notes with third-party advertising companies.
            All insights generated are strictly for your personalized education metrics.
          </p>
        </motion.section>
      </div>
    </PageLayout>
  );
}

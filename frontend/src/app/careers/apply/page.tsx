"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Upload, CheckCircle2, User, Mail, Link as LinkIcon, MessageSquare, GraduationCap } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";
import Image from "next/image";

function JobApplyForm() {
  const searchParams = useSearchParams();
  const rawRole = searchParams.get("role") || "General Application";
  const roleName = decodeURIComponent(rawRole);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    portfolio: "",
    coverLetter: "",
    targetExam: "",
  });
  const [resumeName, setResumeName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
  };

  return (
    <div className="layout-container max-w-[800px] px-4 mx-auto">
      <div className="mb-6">
        <Link
          href="/careers"
          className="inline-flex items-center gap-2 text-xs font-black uppercase text-neutral-400 hover:text-[#6D4AFF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Careers
        </Link>
      </div>

      {/* Banner */}
      <div className="relative w-full h-[180px] md:h-[240px] rounded-[24px] overflow-hidden border border-[#ECECEC] shadow-md mb-8">
        <Image
          src="/careers-hero.png"
          alt="Careers Application Visual"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-6 md:left-8">
          <span className="text-xs font-black uppercase tracking-widest text-purple-200 block mb-1">
            ExamForge Academy Recruitment
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white">
            Grow Your Tech Career
          </h2>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="apply-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleSubmit}
            className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-8 md:p-12 shadow-lg space-y-6"
          >
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#6D4AFF] bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 px-3 py-1 rounded-full">
                Application Form
              </span>
              <h2 className="text-2xl font-black text-neutral-900 mt-3">Apply for {roleName}</h2>
              <p className="text-sm text-neutral-500 font-semibold mt-1">
                Please complete the form below to submit your job application.
              </p>
            </div>

            <hr className="border-neutral-100" />

            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-600 block">Your Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-neutral-400">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-neutral-800 focus:outline-none focus:border-[#6D4AFF] font-semibold text-sm transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-600 block">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-neutral-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-neutral-800 focus:outline-none focus:border-[#6D4AFF] font-semibold text-sm transition-all"
                />
              </div>
            </div>

            {/* Target Government Exam Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-600 block">Target Government Exam Focus *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-neutral-400 pointer-events-none">
                  <GraduationCap className="w-4.5 h-4.5" />
                </span>
                <select
                  required
                  value={formData.targetExam}
                  onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-12 pr-4 py-3.5 text-neutral-800 focus:outline-none focus:border-[#6D4AFF] font-semibold text-sm transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Target Government Exam Focus...</option>
                  <option value="ssc">Staff Selection Commission (SSC CGL / CHSL)</option>
                  <option value="upsc">Union Public Service Commission (UPSC CSE)</option>
                  <option value="banking">Banking PO & Clerk (IBPS, SBI, RBI)</option>
                  <option value="defence">Defence Services (NDA, CDS, AFCAT)</option>
                  <option value="state-psc">State PSC Recruitment Commissions</option>
                  <option value="teaching">Teacher Eligibility Test (CTET, TET)</option>
                  <option value="engineering">Engineering Services (GATE, ESE)</option>
                  <option value="police">Police Recruitment (SI, Constable)</option>
                  <option value="other">Not Applicable / Other Exams</option>
                </select>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-600 block">Resume / CV *</label>
              <div className="relative group">
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setResumeName(file.name);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full bg-neutral-50/50 border-2 border-dashed border-neutral-200 group-hover:border-[#6D4AFF] rounded-xl py-6 flex flex-col items-center justify-center gap-2 transition-all">
                  <Upload className="w-8 h-8 text-neutral-400 group-hover:text-[#6D4AFF] transition-colors" />
                  <span className="text-xs font-black text-neutral-600 group-hover:text-[#6D4AFF] transition-colors">
                    {resumeName || "Upload PDF or DOCX file"}
                  </span>
                </div>
              </div>
            </div>

            {/* Portfolio */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-600 block">GitHub / Portfolio URL</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-neutral-400">
                  <LinkIcon className="w-4.5 h-4.5" />
                </span>
                <input
                  type="url"
                  placeholder="https://github.com/johndoe"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-neutral-800 focus:outline-none focus:border-[#6D4AFF] font-semibold text-sm transition-all"
                />
              </div>
            </div>

            {/* Cover Letter */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-600 block">Why are you a good fit?</label>
              <div className="relative">
                <span className="absolute top-3.5 left-4 text-neutral-400">
                  <MessageSquare className="w-4.5 h-4.5" />
                </span>
                <textarea
                  placeholder="Tell us about yourself and your experiences..."
                  rows={4}
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-neutral-800 focus:outline-none focus:border-[#6D4AFF] font-semibold text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all cursor-pointer"
            >
              Submit Application <Send className="w-4.5 h-4.5" />
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-8 md:p-12 text-center shadow-lg space-y-6"
          >
            <div className="w-16 h-16 bg-[#22C55E]/10 rounded-full flex items-center justify-center mx-auto text-[#22C55E] border border-[#22C55E]/20 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-neutral-900">Application Submitted!</h3>
              <p className="text-neutral-500 font-semibold max-w-md mx-auto">
                Thank you for applying, {formData.name}. Our recruiting team will review your CV for the{" "}
                <strong>{roleName}</strong> position and reach out to you shortly.
              </p>
            </div>
            <hr className="border-neutral-100" />
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 text-sm font-black text-white bg-[#6D4AFF] px-6 py-3 rounded-xl hover:bg-[#8B5CF6] hover:shadow-lg transition-all"
            >
              Return to Careers
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <PageLayout
      title="Join Our Team"
      description="Apply for open roles and grow your career with us."
      breadcrumb={[
        { label: "Careers", href: "/careers" },
        { label: "Apply", href: "/careers/apply" },
      ]}
    >
      <Suspense fallback={
        <div className="text-center py-20 font-black text-neutral-500 text-lg">
          Loading Application...
        </div>
      }>
        <JobApplyForm />
      </Suspense>
    </PageLayout>
  );
}

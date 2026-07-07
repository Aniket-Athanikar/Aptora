"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2, GraduationCap, BookOpen, Briefcase, TrendingUp,
  Fingerprint, Globe2, FileCheck, Flame, Award, Cpu, Target,
  ShieldCheck, Languages, Code, Calculator, School, UserCheck
} from "lucide-react";
import GlassCard from "../ui/GlassCard";
import SectionHeading from "../ui/SectionHeading";
import GlowButton from "../ui/GlowButton";

export default function Exams() {
  const allExams = [
    { name: "SSC CGL", icon: Award, color: "text-red-500" },
    { name: "SSC CHSL", icon: Flame, color: "text-orange-500" },
    { name: "Banking", icon: Building2, color: "text-blue-500" },
    { name: "Railway", icon: FileCheck, color: "text-cyan-500" },
    { name: "UPSC", icon: Globe2, color: "text-purple-500" },
    { name: "State PSC", icon: Briefcase, color: "text-indigo-500" },
    { name: "Police", icon: Fingerprint, color: "text-emerald-500" },
    { name: "Defence", icon: GraduationCap, color: "text-rose-500" },
    { name: "MCAT", icon: BookOpen, color: "text-teal-500" },
    { name: "CUET UG", icon: TrendingUp, color: "text-amber-500" },
    { name: "GATE", icon: Cpu, color: "text-sky-600" },
    { name: "CAT", icon: Target, color: "text-violet-600" },
    { name: "IISER", icon: School, color: "text-blue-600" },
    { name: "TCS NQT", icon: Code, color: "text-indigo-500" },
    { name: "GMAT", icon: Calculator, color: "text-orange-600" },
    { name: "FRM", icon: ShieldCheck, color: "text-green-600" },
    { name: "IELTS", icon: Languages, color: "text-rose-500" },
    { name: "NIELIT", icon: Cpu, color: "text-cyan-600" },
    { name: "UPTET", icon: UserCheck, color: "text-purple-600" },
    { name: "TET", icon: UserCheck, color: "text-purple-500" }
  ];

  // Split into two rows
  const row1 = allExams.slice(0, 10);
  const row2 = allExams.slice(10, 20);

  const ExamCard = ({ item }: { item: typeof allExams[0] }) => (
    <GlassCard className="min-w-[130px] md:min-w-[150px] mx-3 py-6 px-4 flex flex-col items-center justify-center border-[#ECECEC] hover:border-neutral-200 transition-all duration-300 hover:-translate-y-2 bg-white shadow-sm hover:shadow-xl rounded-2xl">
      <div className={`w-10 h-10 mb-3 flex items-center justify-center ${item.color} bg-neutral-50 rounded-full`}>
        <item.icon className="w-5 h-5" />
      </div>
      <span className="text-[10px] md:text-[11px] font-bold text-neutral-800 tracking-wider uppercase text-center leading-tight">
        {item.name}
      </span>
    </GlassCard>
  );

  return (
    <section id="exams" className="py-20 bg-neutral-50/50 overflow-hidden">
      <div className="layout-container max-w-[1320px] px-4 mx-auto mb-12">
        <SectionHeading
          badge="Exams Covered"
          title="Exams We"
          gradientTitle="Cover"
          description="Prepare for all major government & competitive examinations."
        />
      </div>

      {/* Row 1: Left to Right */}
      <motion.div className="flex mb-8">
        <motion.div
          animate={{ x: [0, -1500] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="flex"
        >
          {[...row1, ...row1, ...row1].map((item, i) => (
            <ExamCard key={`r1-${i}`} item={item} />
          ))}
        </motion.div>
      </motion.div>

      {/* Row 2: Right to Left */}
      <motion.div className="flex">
        <motion.div
          animate={{ x: [-1500, 0] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="flex"
        >
          {[...row2, ...row2, ...row2].map((item, i) => (
            <ExamCard key={`r2-${i}`} item={item} />
          ))}
        </motion.div>
      </motion.div>

      {/* Explore All Exams CTA Button */}
      <div className="flex justify-center mt-12">
        <Link href="/exams">
          <GlowButton variant="gradient" className="px-8 py-3.5 text-xs font-black" magnetic={false}>
            Explore All Covered Exams
          </GlowButton>
        </Link>
      </div>
    </section>
  );
}
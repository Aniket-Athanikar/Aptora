"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Sparkles, Star, CheckCircle2, ChevronLeft, ChevronRight, Pause, Play, TrendingUp } from "lucide-react";

interface TestimonialItem {
  id: number;
  name: string;
  exam: string;
  score: string;
  role: string;
  quote: string;
  avatarBg: string;
  initials: string;
}

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const testimonials: TestimonialItem[] = [
    {
      id: 1,
      name: "Aarav Sharma",
      exam: "UPSC Civil Services",
      score: "AIR 42 Ranker",
      role: "Verified Aspirant",
      quote: "The personalized daily planner transformed how I cover Laxmikanth and Spectrum. Automatically adjusting missed chapters kept my prep completely stress-free.",
      avatarBg: "bg-[#084c38]",
      initials: "AS",
    },
    {
      id: 2,
      name: "Priya Deshmukh",
      exam: "SSC CGL Tier 1 & 2",
      score: "335/390 Score",
      role: "Verified Aspirant",
      quote: "The timed mock test analytics identified my exact weak areas in Quantitative Aptitude. My sectional speed improved by 35% within 3 weeks.",
      avatarBg: "bg-[#059669]",
      initials: "PD",
    },
    {
      id: 3,
      name: "Rohan Verma",
      exam: "SBI PO & IBPS Mains",
      score: "Selected SBI PO",
      role: "Verified Aspirant",
      quote: "Aptora's AI note summaries allowed me to revise financial awareness and reasoning puzzles in half the time. Spaced recall flashcards are top-tier.",
      avatarBg: "bg-blue-700",
      initials: "RV",
    },
    {
      id: 4,
      name: "Ananya Iyer",
      exam: "State PSC (MPSC / BPSC)",
      score: "State Rank 14",
      role: "Verified Aspirant",
      quote: "State GS notes and PYQ analysis helped me score top marks in Geography and State History. The auto-scheduler is a complete game changer.",
      avatarBg: "bg-indigo-700",
      initials: "AI",
    },
    {
      id: 5,
      name: "Karan Malhotra",
      exam: "Railway RRB NTPC",
      score: "CBT-2 Cleared",
      role: "Verified Candidate",
      quote: "CBT simulation mocks feel 100% identical to the actual exam layout. The science PYQ bank saved me hundreds of hours of manual searching.",
      avatarBg: "bg-amber-700",
      initials: "KM",
    },
    {
      id: 6,
      name: "Neha Kulkarni",
      exam: "GATE Computer Science",
      score: "99.2 Percentile",
      role: "Verified Aspirant",
      quote: "Converting 1000-page textbooks into crisp AI summary flashcards allowed me to revise Operating Systems and DBMS in just 2 days before the exam.",
      avatarBg: "bg-purple-700",
      initials: "NK",
    },
    {
      id: 7,
      name: "Vikram Singh",
      exam: "CDS & NDA Examination",
      score: "SSB Recommended",
      role: "Verified Aspirant",
      quote: "Current affairs summaries and daily timed quizzes kept my general knowledge sharp while balancing physical endurance training.",
      avatarBg: "bg-[#047857]",
      initials: "VS",
    },
    {
      id: 8,
      name: "Sneha Gupta",
      exam: "CLAT & Law Entrance",
      score: "AIR 88 Ranker",
      role: "Verified Candidate",
      quote: "Legal reasoning case law summaries and vocabulary flashcards made constitution articles super easy to memorize without cramming.",
      avatarBg: "bg-rose-700",
      initials: "SG",
    },
    {
      id: 9,
      name: "Aditya Patel",
      exam: "CUET UG & PG",
      score: "100 Percentile GT",
      role: "Verified Aspirant",
      quote: "Syllabus weightage breakdown showed me exactly which NCERT chapters carry the highest marks. Solved 1500+ questions seamlessly.",
      avatarBg: "bg-[#063b2b]",
      initials: "AP",
    },
    {
      id: 10,
      name: "Meera Reddy",
      exam: "Working Pro (UPSC Prep)",
      score: "Mains Qualified",
      role: "Verified Professional",
      quote: "Balancing 3 hours of daily study after a 9-to-5 job felt impossible until Aptora's AI engine automated my daily micro-revision blocks.",
      avatarBg: "bg-teal-700",
      initials: "MR",
    },
  ];

  // Auto-play micro carousel interval
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, 4000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, testimonials.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  // Compute 3 visible cards starting from activeIndex for smooth unified medium grid
  const getVisibleTestimonials = () => {
    const list: TestimonialItem[] = [];
    for (let i = 0; i < 3; i++) {
      const idx = (activeIndex + i) % testimonials.length;
      list.push(testimonials[idx]);
    }
    return list;
  };

  return (
    <section className="py-20 md:py-28 bg-white relative z-10 border-t border-slate-200/80 overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header with Carousel Playback Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#084c38] text-xs font-black uppercase tracking-widest mb-4 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>STUDENT EXPERIENCES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
              Real preparation requires the right system
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              See how aspirants across India use Aptora&apos;s AI planning engine to bring structure to their competitive exam journey
            </p>
          </div>

          {/* Micro Carousel Playback & Navigation Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="p-3 rounded-2xl border border-slate-200 bg-[#FAF9F6] text-slate-700 hover:border-emerald-300 hover:text-[#084c38] transition-all cursor-pointer shadow-2xs"
              aria-label={isAutoPlaying ? "Pause Auto Scroll" : "Play Auto Scroll"}
            >
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 bg-[#FAF9F6] border border-slate-200/90 p-1.5 rounded-2xl shadow-2xs">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl hover:bg-white text-slate-700 hover:text-[#084c38] transition-all cursor-pointer"
                aria-label="Previous Student Story"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-slate-700 font-display px-2 min-w-[50px] text-center">
                {activeIndex + 1} / {testimonials.length}
              </span>
              <button
                onClick={handleNext}
                className="p-2.5 rounded-xl hover:bg-white text-slate-700 hover:text-[#084c38] transition-all cursor-pointer"
                aria-label="Next Student Story"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Single Unified Medium Cards Carousel Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <AnimatePresence mode="popLayout">
            {getVisibleTestimonials().map((item, idx) => (
              <motion.div
                key={`${item.id}-${activeIndex}`}
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -16 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -6 }}
                className={`p-7 rounded-3xl flex flex-col justify-between h-full transition-all duration-300 shadow-md ${
                  idx === 0
                    ? "bg-white border-2 border-[#084c38] ring-4 ring-[#084c38]/10 glow-emerald"
                    : "bg-[#FAF9F6] border border-slate-200/90 hover:border-emerald-300 hover:bg-white"
                }`}
              >
                <div>
                  {/* Top Rating & Score Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#084c38] text-xs font-black border border-emerald-200/80 font-display flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-700" />
                      {item.score}
                    </span>
                  </div>

                  {/* Quote Body */}
                  <div className="relative mb-6">
                    <Quote className="w-6 h-6 text-[#084c38] opacity-25 mb-2" />
                    <p className="text-slate-700 text-sm leading-relaxed font-normal italic">
                      &quot;{item.quote}&quot;
                    </p>
                  </div>
                </div>

                {/* Candidate Info Footer */}
                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${item.avatarBg} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs font-display`}>
                      {item.initials}
                    </div>
                    <div className="truncate">
                      <h3 className="text-sm font-black text-slate-900 font-display truncate flex items-center gap-1.5">
                        <span>{item.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </h3>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {item.exam}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#084c38] text-[10px] font-black border border-emerald-200/60 font-display shrink-0">
                    {item.role}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Carousel Micro Slide Dots */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? "w-8 bg-[#084c38]"
                  : "w-2 bg-slate-200 hover:bg-slate-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

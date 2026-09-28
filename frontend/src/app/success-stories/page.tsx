"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  Award,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Rohit Kumar",
    role: "SSC CGL 2023 Ranker",
    quote:
      "Aptora changed my preparation journey. The AI notes and daily practice helped me crack SSC CGL in my first attempt!",
    rating: 5,
    initials: "RK",
  },
  {
    name: "Priya Sharma",
    role: "UPSC CSE 2023 Qualifier",
    quote:
      "The smart question bank and mock tests were game-changers. I could track my progress in real-time and focus on my weak areas effectively.",
    rating: 5,
    initials: "PS",
  },
  {
    name: "Amit Patel",
    role: "Banking PO 2024 Selected",
    quote:
      "Daily practice quizzes and AI analytics helped me identify weak areas. The personalized study plans saved me months of preparation time.",
    rating: 5,
    initials: "AP",
  },
  {
    name: "Sneha Reddy",
    role: "GATE 2024 AIR 47",
    quote:
      "The AI tutor feature saved me hours of searching for explanations. Complex topics were broken down beautifully with step-by-step solutions.",
    rating: 5,
    initials: "SR",
  },
  {
    name: "Vikram Singh",
    role: "State PSC 2023 Ranker",
    quote:
      "Best platform for competitive exam preparation, highly recommended! The exam-specific study material and previous year analysis were invaluable.",
    rating: 5,
    initials: "VS",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

export default function SuccessStoriesPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const goNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const current = testimonials[activeIndex];

  return (
    <PageLayout
      title="Success Stories"
      description="Real people. Real results."
      breadcrumb={[{ label: "Success Stories", href: "/success-stories" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto">
        {/* Section Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-emerald-100/70 text-emerald-800 text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full border border-emerald-200/50">
            <Award className="w-4 h-4 text-emerald-600" />
            Student Testimonials
          </span>
        </motion.div>

        {/* Main Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative border-2 border-emerald-500/20 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-10 md:p-14">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400 z-20" />
            
            <div className="relative z-10 pt-2">
              {/* Big Quote Mark */}
              <div className="mb-6">
                <Quote className="w-14 h-14 text-emerald-500/30 fill-emerald-500/20" />
              </div>

              {/* Animated Testimonial Content */}
              <div className="min-h-[200px] flex flex-col justify-between">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: "easeInOut" as const }}
                  >
                    {/* Quote Text */}
                    <p className="text-xl md:text-2xl font-bold text-neutral-800 leading-relaxed mb-10">
                      &ldquo;{current.quote}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                        <span className="text-white font-black text-sm">
                          {current.initials}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-black text-neutral-900">
                          {current.name}
                        </h4>
                        <p className="text-xs font-semibold text-neutral-500">
                          {current.role}
                        </p>
                      </div>

                      {/* Stars */}
                      <div className="ml-auto flex items-center gap-0.5">
                        {Array.from({ length: current.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {/* Left Arrow */}
            <button
              onClick={goPrev}
              className="w-12 h-12 rounded-2xl bg-white border-2 border-emerald-500/20 flex items-center justify-center shadow-md hover:border-emerald-500/40 hover:scale-105 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5 text-emerald-700" />
            </button>

            {/* Dot Indicators */}
            <div className="flex items-center gap-2.5">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-8 h-3 bg-gradient-to-r from-[#084c38] via-emerald-600 to-teal-500 shadow-sm"
                      : "w-3 h-3 bg-neutral-300 hover:bg-emerald-300"
                  }`}
                />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={goNext}
              className="w-12 h-12 rounded-2xl bg-white border-2 border-emerald-500/20 flex items-center justify-center shadow-md hover:border-emerald-500/40 hover:scale-105 transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5 text-emerald-700" />
            </button>
          </div>
        </motion.div>

        {/* Testimonial Thumbnail Cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {testimonials.map((t, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`group text-left p-5 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden ${
                idx === activeIndex
                  ? "bg-white border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.02]"
                  : "bg-white/80 border-emerald-500/15 hover:border-emerald-500/40 hover:shadow-md"
              }`}
            >
              {idx === activeIndex && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
              )}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black ${
                    idx === activeIndex
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-xs font-black text-neutral-900">{t.name}</p>
                  <p className="text-[10px] font-semibold text-neutral-500">
                    {t.role}
                  </p>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-neutral-600 line-clamp-2 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
            </button>
          ))}
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-8"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center pt-1">
            {[
              { value: "10,000+", label: "Students Trained" },
              { value: "95%", label: "Success Rate" },
              { value: "500+", label: "Selections" },
              { value: "4.9/5", label: "Average Rating" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-2xl md:text-3xl font-black text-neutral-900">
                  {stat.value}
                </div>
                <div className="text-[10px] text-emerald-700 uppercase tracking-widest font-black mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, MessageSquareHeart, Mail } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [questions, setQuestions] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset form after brief delay
    setTimeout(() => {
      setRating(0);
      setLiked("");
      setImprove("");
      setQuestions("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <PageLayout
      title="We Value Your Feedback"
      description="Help us improve Aptora by sharing your thoughts and experience."
      breadcrumb={[{ label: "Feedback", href: "/feedback" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-emerald-100/70 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200/50 mb-4">
            Share Your Thoughts
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
            Your Feedback Matters
          </h2>
          <p className="mt-3 text-neutral-600 font-semibold max-w-xl mx-auto">
            Every piece of feedback helps us build a better learning experience
          </p>
        </motion.div>

        {/* Feedback Form Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto"
        >
          <motion.div
            variants={itemVariants}
            className="relative border-2 border-emerald-500/20 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-8 md:p-10"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400 z-20" />
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 pt-14"
              >
                <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-6 border border-emerald-200/60 shadow-inner">
                  <MessageSquareHeart className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 mb-2">
                  Thank You!
                </h3>
                <p className="text-neutral-600 font-semibold">
                  Your feedback has been submitted successfully.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 pt-2">
                {/* Star Rating */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-black text-neutral-900 mb-4">
                    How would you rate your experience?
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="p-1 transition-transform duration-200 hover:scale-125 cursor-pointer"
                      >
                        <Star
                          className={`w-9 h-9 transition-colors duration-200 ${
                            star <= (hoveredStar || rating)
                              ? "fill-[#F59E0B] text-[#F59E0B]"
                              : "text-neutral-300"
                          }`}
                        />
                      </button>
                    ))}
                    {(hoveredStar > 0 || rating > 0) && (
                      <span className="ml-3 text-sm font-black text-neutral-600">
                        {ratingLabels[hoveredStar || rating]}
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* What did you like */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="liked"
                    className="block text-sm font-black text-neutral-900 mb-2"
                  >
                    What did you like?
                  </label>
                  <input
                    id="liked"
                    type="text"
                    value={liked}
                    onChange={(e) => setLiked(e.target.value)}
                    placeholder="Tell us what you enjoyed most..."
                    className="w-full bg-white border-2 border-emerald-500/20 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
                  />
                </motion.div>

                {/* What can we improve */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="improve"
                    className="block text-sm font-black text-neutral-900 mb-2"
                  >
                    What can we improve?
                  </label>
                  <textarea
                    id="improve"
                    value={improve}
                    onChange={(e) => setImprove(e.target.value)}
                    placeholder="Share your suggestions for improvement..."
                    rows={4}
                    className="w-full bg-white border-2 border-emerald-500/20 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 transition-all resize-none shadow-sm"
                  />
                </motion.div>

                {/* Got any questions */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="questions"
                    className="block text-sm font-black text-neutral-900 mb-2"
                  >
                    Got any questions?
                  </label>
                  <input
                    id="questions"
                    type="text"
                    value={questions}
                    onChange={(e) => setQuestions(e.target.value)}
                    placeholder="Any questions for the team?"
                    className="w-full bg-white border-2 border-emerald-500/20 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#084c38] via-emerald-600 to-teal-500 text-white font-black px-8 py-4 rounded-2xl shadow-md shadow-emerald-500/20 hover:scale-[1.01] transition-all duration-300 cursor-pointer border-none"
                  >
                    <Send className="w-5 h-5" />
                    Submit Feedback
                  </button>
                </motion.div>
              </form>
            )}
          </motion.div>

          {/* Get in Touch Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-center mt-8"
          >
            <a
              href="/help"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-emerald-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Get in Touch with our support team
            </a>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  );
}

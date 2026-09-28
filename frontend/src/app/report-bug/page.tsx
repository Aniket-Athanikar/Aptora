"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Bug, CheckCircle2, AlertCircle, X, FileImage } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import PageLayout from "@/components/layout/PageLayout";

const bugReportSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  steps: z.string().optional(),
});

type BugReportForm = z.infer<typeof bugReportSchema>;

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

export default function ReportBugPage() {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BugReportForm>({
    resolver: zodResolver(bugReportSchema),
    mode: "onChange",
  });

  const onSubmit = (data: BugReportForm) => {
    console.log("Bug Report:", { ...data, screenshot: fileName });
    setSubmitted(true);
    setTimeout(() => {
      reset();
      setFileName(null);
      setSubmitted(false);
    }, 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <PageLayout
      title="Found a Bug? Let Us Know!"
      description="Help us improve by reporting issues you encounter while using Aptora."
      breadcrumb={[{ label: "Report a Bug", href: "/report-bug" }]}
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
            Bug Report
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
            Report an Issue
          </h2>
          <p className="mt-3 text-neutral-600 font-semibold max-w-xl mx-auto">
            Describe the issue in detail so our team can investigate and fix it quickly
          </p>
        </motion.div>

        {/* Bug Report Form Card */}
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
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 mb-2">
                  Report Submitted!
                </h3>
                <p className="text-neutral-600 font-semibold">
                  Thank you for helping us improve. We&apos;ll investigate this issue promptly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                {/* Name */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="name"
                    className="block text-sm font-black text-neutral-900 mb-2"
                  >
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    placeholder="Enter your full name"
                    className={`w-full bg-white border-2 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none transition-all shadow-sm ${
                      errors.name
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-emerald-500/20 focus:border-emerald-500"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name.message}
                    </p>
                  )}
                </motion.div>

                {/* Email */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="email"
                    className="block text-sm font-black text-neutral-900 mb-2"
                  >
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="you@example.com"
                    className={`w-full bg-white border-2 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none transition-all shadow-sm ${
                      errors.email
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-emerald-500/20 focus:border-emerald-500"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email.message}
                    </p>
                  )}
                </motion.div>

                {/* Title */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="title"
                    className="block text-sm font-black text-neutral-900 mb-2"
                  >
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    {...register("title")}
                    placeholder="Describe the issue briefly"
                    className={`w-full bg-white border-2 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none transition-all shadow-sm ${
                      errors.title
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-emerald-500/20 focus:border-emerald-500"
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.title.message}
                    </p>
                  )}
                </motion.div>

                {/* Steps to Reproduce */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="steps"
                    className="block text-sm font-black text-neutral-900 mb-2"
                  >
                    Steps to Reproduce{" "}
                    <span className="text-neutral-400 font-semibold">(optional)</span>
                  </label>
                  <textarea
                    id="steps"
                    {...register("steps")}
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See the error..."
                    rows={5}
                    className="w-full bg-white border-2 border-emerald-500/20 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 transition-all resize-none shadow-sm"
                  />
                </motion.div>

                {/* Upload Screenshot */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-black text-neutral-900 mb-2">
                    Upload Screenshot{" "}
                    <span className="text-neutral-400 font-semibold">(optional)</span>
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                      isDragging
                        ? "border-emerald-500 bg-emerald-50/50"
                        : fileName
                        ? "border-emerald-500/40 bg-emerald-50/30"
                        : "border-emerald-500/20 bg-emerald-50/20 hover:border-emerald-500/40 hover:bg-emerald-50/40"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {fileName ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileImage className="w-10 h-10 text-emerald-600" />
                        <p className="text-sm font-semibold text-neutral-800">
                          {fileName}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileName(null);
                          }}
                          className="text-xs font-black text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                          <Upload className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-neutral-800">
                            Drag & drop or{" "}
                            <span className="text-emerald-600">click to upload</span>
                          </p>
                          <p className="text-xs text-neutral-500 font-medium mt-1">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#084c38] via-emerald-600 to-teal-500 text-white font-black px-8 py-4 rounded-2xl shadow-md shadow-emerald-500/20 hover:scale-[1.01] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none"
                  >
                    <Bug className="w-5 h-5" />
                    Submit Report
                  </button>
                </motion.div>
              </form>
            )}
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  );
}

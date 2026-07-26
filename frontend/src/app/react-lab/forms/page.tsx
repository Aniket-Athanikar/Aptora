"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";

// 1. Define schema using Zod
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  subject: z.string().min(1, "Subject is required"),
  examType: z.enum(["multiple-choice", "true-false", "essay", "custom"]),
  customTypeDescription: z.string().optional(),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(5, "Question must be at least 5 characters long"),
      })
    )
    .min(1, "At least one question is required"),
}).superRefine((data, ctx) => {
  if (data.examType === "custom" && (!data.customTypeDescription || data.customTypeDescription.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Custom description is required when exam type is set to Custom",
      path: ["customTypeDescription"],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

export default function FormsDemo() {
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subject: "",
      examType: "multiple-choice",
      customTypeDescription: "",
      questions: [{ questionText: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const examType = watch("examType");

  const onSubmit = (data: FormValues) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmittedData(data);
      setSubmitting(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white">Enterprise Forms & Schema Validation</h2>
        <p className="text-slate-400 text-sm">
          A showcase of type-safe form state, conditional fields, dynamic lists, and schema validation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Controls */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-7 bg-slate-950/40 border border-slate-800 p-6 rounded-2xl flex flex-col gap-5"
        >
          <h3 className="text-lg font-bold text-white mb-2">Create Study Sheet</h3>

          {/* Title Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Sheet Title</label>
            <input
              type="text"
              {...register("title")}
              placeholder="e.g. Physics 101 Midterm"
              className={`bg-slate-900 border ${
                errors.title ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-indigo-500"
              } rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none`}
            />
            {errors.title && <span className="text-xs text-red-400 font-medium">{errors.title.message}</span>}
          </div>

          {/* Subject Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Subject</label>
            <input
              type="text"
              {...register("subject")}
              placeholder="e.g. Quantum Mechanics"
              className={`bg-slate-900 border ${
                errors.subject ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-indigo-500"
              } rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none`}
            />
            {errors.subject && <span className="text-xs text-red-400 font-medium">{errors.subject.message}</span>}
          </div>

          {/* Exam Type Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Question Format</label>
            <select
              {...register("examType")}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True / False</option>
              <option value="essay">Essay / Free Response</option>
              <option value="custom">Custom Format</option>
            </select>
          </div>

          {/* Conditional Field rendering */}
          {examType === "custom" && (
            <div className="flex flex-col gap-1.5 animate-slide-down">
              <label className="text-xs font-semibold text-slate-300">Custom Format Description</label>
              <input
                type="text"
                {...register("customTypeDescription")}
                placeholder="Describe your custom testing pattern..."
                className={`bg-slate-900 border ${
                  errors.customTypeDescription ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-indigo-500"
                } rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none`}
              />
              {errors.customTypeDescription && (
                <span className="text-xs text-red-400 font-medium">{errors.customTypeDescription.message}</span>
              )}
            </div>
          )}

          {/* Dynamic Lists Section (Field Array) */}
          <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-4 mt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Configure Questions ({fields.length})</label>
              <button
                type="button"
                onClick={() => append({ questionText: "" })}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                + Add Question
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-grow flex flex-col gap-1">
                    <input
                      type="text"
                      {...register(`questions.${index}.questionText`)}
                      placeholder={`Question #${index + 1}`}
                      className={`bg-slate-900 border ${
                        errors.questions?.[index]?.questionText
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-slate-800 focus:border-indigo-500"
                      } rounded-xl px-4 py-2 text-sm text-white focus:outline-none`}
                    />
                    {errors.questions?.[index]?.questionText && (
                      <span className="text-xs text-red-400 font-medium">
                        {errors.questions[index].questionText.message}
                      </span>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="bg-slate-900 border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 p-2.5 rounded-xl transition-all"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
              {errors.questions && !Array.isArray(errors.questions) && (
                <span className="text-xs text-red-400 font-medium">{errors.questions.message}</span>
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-4 border-t border-slate-800/80 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {submitting ? "Validating & Submitting..." : "Submit Form"}
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                setSubmittedData(null);
              }}
              className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors"
            >
              Reset Form
            </button>
          </div>
        </form>

        {/* Live Output */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Form State Debugger */}
          <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white">Live Form State</h3>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono text-xs text-indigo-400 min-h-[140px] flex flex-col gap-1">
              <div>isSubmitting: {submitting ? "true" : "false"}</div>
              <div>errorsCount: {Object.keys(errors).length}</div>
              <div>errors: {JSON.stringify(errors, null, 2)}</div>
            </div>
          </div>

          {/* Form Submission Output */}
          <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white">Parsed Output (JSON)</h3>
            {submittedData ? (
              <pre className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto">
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-500 text-center italic min-h-[100px] flex items-center justify-center">
                Submit the form on the left to see the parsed schema output here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

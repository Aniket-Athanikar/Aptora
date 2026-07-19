"use client";

/**
 * Analytics Dashboard — book metrics, topic distribution, weightage, learning curves.
 */

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";

import { useKnowledgeEngine } from "../../context";
import { GlassCard, SectionHeader, Pill, Button, StatCard, ProgressBar, ProgressRing, EmptyState } from "../common/Primitives";
import { formatMinutes } from "../../utils";

export function AnalyticsDashboard() {
  const engine = useKnowledgeEngine();
  const book = engine.state.books.find((b) => b.id === engine.state.ui.activeBookId) || null;
  const analytics = book ? engine.state.analytics[book.id] : null;
  const chapters = book ? engine.state.chapters[book.id] || [] : [];
  const questions = book ? engine.state.questions[book.id] || [] : [];

  // Aggregate over all books
  const globalStats = useMemo(() => {
    const books = engine.state.books;
    return {
      books: books.length,
      pages: books.reduce((s, b) => s + b.pageCount, 0),
      storage: books.reduce((s, b) => s + b.sizeBytes, 0),
      featured: books.filter((b) => b.isFeatured).length,
      trending: books.filter((b) => b.isTrending).length,
      published: books.filter((b) => b.status === "ready").length,
    };
  }, [engine.state.books]);

  if (!book || !analytics) {
    return (
      <div className="space-y-6">
        {/* GLOBAL ANALYTICS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Books" value={globalStats.books} icon="BookOpen" tone="indigo" />
          <StatCard label="Pages" value={globalStats.pages.toLocaleString()} icon="File" tone="emerald" />
          <StatCard label="Storage" value={formatBytesShort(globalStats.storage)} icon="HardDrive" tone="violet" />
          <StatCard label="Featured" value={globalStats.featured} icon="Star" tone="amber" />
          <StatCard label="Trending" value={globalStats.trending} icon="TrendingUp" tone="rose" />
          <StatCard label="Published" value={globalStats.published} icon="CheckCircle2" tone="emerald" />
        </div>
        <GlassCard padding="md">
          <EmptyState icon="BarChart3" title="No book selected" description="Pick a book from the Library to see its detailed analytics." />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BOOK METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Chapters" value={analytics.totalChapters} icon="BookOpen" tone="indigo" />
        <StatCard label="Topics" value={analytics.totalTopics} icon="Network" tone="emerald" />
        <StatCard label="Questions" value={analytics.totalQuestions} icon="HelpCircle" tone="amber" />
        <StatCard label="Flashcards" value={analytics.totalFlashcards} icon="Layers" tone="rose" />
        <StatCard label="Formulas" value={analytics.totalFormulas} icon="Sigma" tone="violet" />
        <StatCard label="Pages" value={analytics.totalPages} icon="File" tone="sky" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* EXAM READINESS */}
        <GlassCard padding="md" tone="emerald">
          <SectionHeader icon="Target" title="Exam Readiness" subtitle="Predicted success" tone="emerald" />
          <div className="flex flex-col items-center mt-4 space-y-4">
            <ProgressRing value={analytics.examReadiness} size={140} strokeWidth={12} tone="emerald" label={`${analytics.examReadiness}%`} sublabel="Ready" />
            <div className="w-full space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="font-extrabold uppercase tracking-wider text-slate-500">Confidence</span>
                <span className="font-black text-slate-700">{analytics.confidencePrediction}%</span>
              </div>
              <ProgressBar value={analytics.confidencePrediction} tone="emerald" />
              <div className="flex justify-between text-[10px]">
                <span className="font-extrabold uppercase tracking-wider text-slate-500">Difficulty</span>
                <span className="font-black text-slate-700">{analytics.difficultyScore}/100</span>
              </div>
              <ProgressBar value={analytics.difficultyScore} tone="amber" />
            </div>
          </div>
        </GlassCard>

        {/* WEIGHTAGE BY CHAPTER */}
        <GlassCard padding="md" className="lg:col-span-2">
          <SectionHeader icon="BarChart3" title="Chapter Weightage" subtitle="Importance & exam frequency" />
          <div className="mt-4 space-y-2.5">
            {analytics.chapterWeightage
              .sort((a, b) => b.weightage - a.weightage)
              .slice(0, 8)
              .map((c) => {
                const chapter = chapters.find((ch) => ch.id === c.chapterId);
                if (!chapter) return null;
                return (
                  <div key={c.chapterId} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <p className="font-extrabold text-slate-800 truncate flex-1">{chapter.title}</p>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Pill tone="indigo" size="xs">{c.weightage}%</Pill>
                        <Pill tone="amber" size="xs">{c.pyqFrequency} PYQs</Pill>
                        <Pill tone="emerald" size="xs">{c.questions} Qs</Pill>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.weightage * 2}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </GlassCard>

        {/* QUESTION DIFFICULTY */}
        <GlassCard padding="md">
          <SectionHeader icon="PieChart" title="Difficulty Mix" />
          <div className="mt-4 space-y-3">
            {[
              { label: "Easy", val: analytics.questionDifficultyBreakdown.easy, tone: "emerald" as const },
              { label: "Medium", val: analytics.questionDifficultyBreakdown.medium, tone: "amber" as const },
              { label: "Hard", val: analytics.questionDifficultyBreakdown.hard, tone: "rose" as const },
            ].map((d) => (
              <div key={d.label} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-extrabold uppercase tracking-wider text-slate-600">{d.label}</span>
                  <span className="font-black text-slate-800">{d.val}</span>
                </div>
                <ProgressBar value={(d.val / Math.max(1, analytics.totalQuestions)) * 100} tone={d.tone} />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* PYQ FREQUENCY */}
        <GlassCard padding="md" className="lg:col-span-2">
          <SectionHeader icon="Trophy" title="PYQ Frequency" subtitle="Last 8 years" />
          <div className="mt-4 h-44 flex items-end justify-between gap-1.5">
            {analytics.pyqFrequency.map((p) => {
              const max = Math.max(...analytics.pyqFrequency.map((x) => x.count));
              const h = (p.count / max) * 100;
              return (
                <div key={p.year} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-extrabold text-slate-700">{p.count}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-lg min-h-[8px]"
                  />
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{p.year}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* LEARNING CURVE */}
        <GlassCard padding="md" className="lg:col-span-3">
          <SectionHeader icon="TrendingUp" title="Learning Curve" subtitle="Predicted mastery & retention over 14 days" />
          <div className="mt-4 h-56 relative">
            <svg viewBox="0 0 600 200" className="w-full h-full">
              <defs>
                <linearGradient id="curve-grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" x2="600" y1={200 - y * 2} y2={200 - y * 2} stroke="#e2e8f0" strokeDasharray="2 4" />
              ))}
              {/* Mastery line */}
              {(() => {
                const points = analytics.learningCurve.map((d, i) => `${(i / Math.max(1, analytics.learningCurve.length - 1)) * 600},${200 - d.mastery * 2}`);
                return (
                  <>
                    <polygon points={`0,200 ${points.join(" ")} 600,200`} fill="url(#curve-grad)" />
                    <polyline points={points.join(" ")} fill="none" stroke="#6366f1" strokeWidth="2.5" />
                  </>
                );
              })()}
              {/* Retention line */}
              {(() => {
                const points = analytics.learningCurve.map((d, i) => `${(i / Math.max(1, analytics.learningCurve.length - 1)) * 600},${200 - d.retention * 2}`);
                return <polyline points={points.join(" ")} fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="4 4" />;
              })()}
            </svg>
            <div className="absolute top-2 right-2 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-wider">
              <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-indigo-500" /> Mastery</span>
              <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-emerald-500 border-dashed" /> Retention</span>
            </div>
          </div>
        </GlassCard>

        {/* TOPIC DISTRIBUTION */}
        <GlassCard padding="md" className="lg:col-span-3">
          <SectionHeader icon="Network" title="Topic Distribution" subtitle="By weightage" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
            {analytics.topicDistribution.slice(0, 12).map((t) => (
              <div key={t.topic} className="p-2.5 rounded-xl border border-slate-200 bg-white/60 flex items-center gap-2">
                <p className="text-xs font-extrabold text-slate-800 flex-1 truncate">{t.topic}</p>
                <Pill tone="indigo" size="xs">{t.weightage}%</Pill>
                <Pill tone="slate" size="xs">{t.pages}p</Pill>
                <Pill tone="amber" size="xs">{t.questions}Q</Pill>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function formatBytesShort(bytes: number): string {
  if (!bytes) return "0";
  const units = ["B", "KB", "MB", "GB"];
  const exp = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, exp)).toFixed(1)} ${units[exp]}`;
}

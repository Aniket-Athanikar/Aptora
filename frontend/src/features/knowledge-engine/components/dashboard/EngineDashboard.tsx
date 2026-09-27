"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";

import { useKnowledgeEngine } from "../../context";
import { GlassCard, SectionHeader, Pill, Button, StatCard, ProgressBar, ProgressRing, BookCover, EmptyState } from "../common/Primitives";
import { formatBytes, formatRelativeTime, formatMinutes } from "../../utils";
import { statusToTone } from "../../utils";
import type { KnowledgeTabId } from "../../types";

const TABS: { id: KnowledgeTabId; label: string; icon: keyof typeof Lucide; description: string; tone: "indigo" | "amber" | "rose" | "emerald" | "violet" | "sky" }[] = [
  { id: "upload", label: "Select Books", icon: "UploadCloud", description: "Drag & drop books", tone: "indigo" },
  { id: "quality", label: "Image Quality", icon: "SlidersHorizontal", description: "QELED pre-processing", tone: "amber" },
  { id: "pipeline", label: "OCR Pipeline", icon: "Cpu", description: "26-stage AI pipeline", tone: "violet" },
  { id: "library", label: "Library", icon: "BookOpen", description: "Browse all books", tone: "emerald" },
  { id: "knowledge", label: "Knowledge", icon: "FileText", description: "Notes, mindmaps, formulas", tone: "indigo" },
  { id: "qa", label: "Question Engine", icon: "HelpCircle", description: "MCQs, flashcards, quizzes", tone: "amber" },
  { id: "analytics", label: "Analytics", icon: "BarChart3", description: "Insights & weightage", tone: "rose" },
  { id: "downloads", label: "Downloads", icon: "Download", description: "PDFs, ZIPs, exports", tone: "sky" },
  { id: "versions", label: "Versions", icon: "GitBranch", description: "History & restore", tone: "violet" },
];

const TONE_BG: Record<string, string> = {
  indigo: "from-indigo-500 to-violet-500",
  amber: "from-amber-500 to-orange-500",
  rose: "from-rose-500 to-pink-500",
  emerald: "from-emerald-500 to-teal-500",
  violet: "from-violet-500 to-fuchsia-500",
  sky: "from-sky-500 to-cyan-500",
};

export function EngineDashboard() {
  const engine = useKnowledgeEngine();

  const stats = useMemo(() => {
    const books = engine.state.books;
    return {
      totalBooks: books.length,
      published: books.filter((b) => b.status === "ready").length,
      processing: books.filter((b) => b.status === "processing" || b.status === "queued").length,
      pages: books.reduce((s, b) => s + b.pageCount, 0),
      storage: books.reduce((s, b) => s + b.sizeBytes, 0),
      ocrAvg: Math.round(books.reduce((s, b) => s + b.ocrConfidence, 0) / Math.max(1, books.length)),
      qualityAvg: Math.round(books.reduce((s, b) => s + b.qualityScore, 0) / Math.max(1, books.length)),
      questions: books.reduce((s, b) => s + (engine.state.questions[b.id]?.length || 0), 0),
      flashcards: books.reduce((s, b) => s + (engine.state.flashcards[b.id]?.length || 0), 0),
      formulas: books.reduce((s, b) => s + (engine.state.formulas[b.id]?.length || 0), 0),
      chapters: books.reduce((s, b) => s + (engine.state.chapters[b.id]?.length || 0), 0),
      activeJobs: engine.state.jobs.filter((j) => j.status === "processing" || j.status === "queued").length,
      downloads: engine.state.downloads.length,
    };
  }, [engine.state]);

  const recentBooks = useMemo(() => {
    return [...engine.state.books].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 6);
  }, [engine.state.books]);

  return (
    <div className="space-y-6">
      {/* HERO */}
      <GlassCard padding="lg" tone="indigo">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg">
                <Lucide.BrainCircuit className="w-5 h-5" />
              </motion.div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">AI Knowledge Engine</h1>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Console</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-3 max-w-xl leading-relaxed">
              The Aptora Select books, run OCR + AI pipelines, generate study materials, and publish to the student library
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button tone="primary" size="md" icon="Upload" onClick={() => engine.setTab("upload")}>Select Book</Button>
            <Button tone="secondary" size="md" icon="BookOpen" onClick={() => engine.setTab("library")}>View Library</Button>
          </div>
        </div>
      </GlassCard>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Books" value={stats.totalBooks} icon="BookOpen" tone="indigo" />
        <StatCard label="Published" value={stats.published} icon="CheckCircle2" tone="emerald" />
        <StatCard label="Processing" value={stats.processing} icon="Loader" tone="rose" />
        <StatCard label="Pages" value={stats.pages.toLocaleString()} icon="File" tone="violet" />
        <StatCard label="Avg OCR" value={`${stats.ocrAvg}%`} icon="ScanText" tone="indigo" />
        <StatCard label="Avg Quality" value={stats.qualityAvg} icon="Award" tone="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Questions" value={stats.questions} icon="HelpCircle" tone="indigo" />
        <StatCard label="Flashcards" value={stats.flashcards} icon="Layers" tone="amber" />
        <StatCard label="Formulas" value={stats.formulas} icon="Sigma" tone="rose" />
        <StatCard label="Chapters" value={stats.chapters} icon="BookText" tone="emerald" />
      </div>

      {/* SHORTCUTS + RECENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SHORTCUTS */}
        <div className="lg:col-span-2 space-y-3">
          <SectionHeader icon="Zap" title="Engine Modules" subtitle="Jump into any module" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TABS.map((tab) => {
              const Icon = (Lucide as any)[tab.icon];
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ y: -2 }}
                  onClick={() => engine.setTab(tab.id)}
                  className="text-left p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${TONE_BG[tab.tone]} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 mt-3 tracking-tight">{tab.label}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{tab.description}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* RECENT BOOKS */}
        <div className="space-y-3">
          <SectionHeader icon="Clock" title="Recent Books" right={
            <Button tone="ghost" size="sm" onClick={() => engine.setTab("library")}>View All</Button>
          } />
          <div className="space-y-2">
            {recentBooks.map((b) => {
              const status = statusToTone(b.status);
              return (
                <button
                  key={b.id}
                  onClick={() => { engine.setActiveBook(b.id); engine.setTab("knowledge"); }}
                  className="w-full text-left p-2.5 rounded-2xl border border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300 transition flex items-center gap-3"
                >
                  <div className="w-10 h-12 rounded-lg overflow-hidden shrink-0">
                    <div className={`w-full h-full bg-gradient-to-br ${b.coverColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-extrabold text-slate-800 truncate">{b.title}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{b.examName} · {formatRelativeTime(b.updatedAt)}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider border ${status.color}`}>{status.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* PIPELINE STATUS + STORAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard padding="md" tone="indigo">
          <SectionHeader icon="Activity" title="Pipeline Status" subtitle="Active processing jobs" tone="indigo" />
          {stats.activeJobs === 0 ? (
            <div className="py-8 text-center">
              <Lucide.CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">All systems idle</p>
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              {engine.state.jobs.filter((j) => j.status === "processing" || j.status === "queued").slice(0, 3).map((j) => (
                <div key={j.id} className="p-2.5 rounded-xl border border-slate-200 bg-white/60">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold text-slate-800 truncate">{j.fileName}</p>
                    <Pill tone="indigo" size="xs">{j.overallProgress}%</Pill>
                  </div>
                  <ProgressBar value={j.overallProgress} tone="indigo" />
                </div>
              ))}
              <Button tone="primary" size="sm" fullWidth icon="Cpu" onClick={() => engine.setTab("pipeline")}>View Pipeline</Button>
            </div>
          )}
        </GlassCard>

        <GlassCard padding="md" tone="emerald">
          <SectionHeader icon="HardDrive" title="Storage Usage" subtitle="Library + cache" tone="emerald" />
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-center">
              <ProgressRing value={Math.min(100, (stats.storage / (10 * 1024 * 1024 * 1024)) * 100)} size={140} strokeWidth={12} tone="emerald" label={formatBytes(stats.storage)} sublabel="Used" />
            </div>
            <div className="space-y-2">
              {[
                { label: "Books", val: engine.state.books.length, tone: "indigo" as const },
                { label: "Versions", val: engine.state.versions.length, tone: "violet" as const },
                { label: "Downloads", val: stats.downloads, tone: "sky" as const },
                { label: "Jobs", val: engine.state.jobs.length, tone: "rose" as const },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between p-2 rounded-xl bg-white/60">
                  <span className="text-[11px] font-extrabold text-slate-600">{s.label}</span>
                  <Pill tone={s.tone} size="xs">{s.val}</Pill>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* RECENT HISTORY */}
      <GlassCard padding="md">
        <SectionHeader icon="History" title="Recent Activity" subtitle="Engine timeline" right={
          <Button tone="ghost" size="sm" onClick={engine.clearHistory}>Clear All</Button>
        } />
        {engine.state.history.length === 0 ? (
          <EmptyState icon="History" title="No history yet" description="Engine events will appear here as you work." />
        ) : (
          <div className="space-y-2 mt-3 max-h-80 overflow-y-auto pr-1">
            {engine.state.history.slice(0, 12).map((h) => {
              const catTone: any = { upload: "indigo", ocr: "violet", ai: "emerald", edit: "amber", delete: "rose", publish: "sky", system: "slate" };
              return (
                <div key={h.id} className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 bg-white/60 hover:bg-white transition">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 bg-${catTone[h.category]}-500`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Pill tone={catTone[h.category]} size="xs">{h.category.toUpperCase()}</Pill>
                      <p className="text-xs font-extrabold text-slate-800">{h.action}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{h.detail}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider shrink-0">{formatRelativeTime(h.timestamp)}</span>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
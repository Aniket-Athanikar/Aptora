"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";

import { useKnowledgeEngine } from "../../context";
import { GlassCard, SectionHeader, Pill, Button, IconButton, EmptyState, ProgressBar } from "../common/Primitives";
import { buildMockPdf, downloadBlob, downloadJson, downloadMarkdown, formatBytes, formatRelativeTime } from "../../utils";
import type { DownloadFormat, BookMetadata } from "../../types";

interface DownloadDef {
  format: DownloadFormat;
  label: string;
  description: string;
  icon: keyof typeof Lucide;
  tone: "indigo" | "amber" | "rose" | "emerald" | "violet" | "sky";
  ext: string;
  build: (book: BookMetadata, engine: any) => Blob;
}

const DOWNLOADS: DownloadDef[] = [
  { format: "original_pdf", label: "Original PDF", description: "Source PDF as uploaded", icon: "FileText", tone: "indigo", ext: "pdf", build: (b) => buildMockPdf(b.title, `Original PDF for ${b.title} by ${b.author}.`) },
  { format: "ocr_pdf", label: "OCR PDF", description: "OCR-cleaned searchable PDF", icon: "ScanText", tone: "indigo", ext: "pdf", build: (b) => buildMockPdf(b.title + " (OCR)", `OCR-cleaned version with ${b.ocrConfidence}% confidence.`) },
  {
    format: "ai_notes_pdf", label: "AI Notes PDF", description: "All chapter notes compiled", icon: "NotebookPen", tone: "violet", ext: "pdf", build: (b, e) => {
      const chapters = e.state.chapters[b.id] || [];
      return buildMockPdf(b.title + " — AI Notes", chapters.map((c: any) => `${c.title}\n\n${c.notes || ""}`).join("\n\n---\n\n"));
    }
  },
  { format: "one_page_notes_pdf", label: "One-Page Notes", description: "Single page summary", icon: "FileBox", tone: "amber", ext: "pdf", build: (b) => buildMockPdf(b.title + " — One Pager", `Quick reference for ${b.title}.`) },
  {
    format: "revision_pdf", label: "Revision PDF", description: "Last-mile revision guide", icon: "RefreshCw", tone: "rose", ext: "pdf", build: (b, e) => {
      const chapters = e.state.chapters[b.id] || [];
      return buildMockPdf(b.title + " — Revision", chapters.map((c: any) => `${c.title}\n\nQuick Recap: ${c.summary}\n\nKey Points: ${(c.keyPoints || []).join(", ")}`).join("\n\n"));
    }
  },
  {
    format: "formula_pdf", label: "Formula Sheet", description: "LaTeX formula reference", icon: "Sigma", tone: "indigo", ext: "pdf", build: (b, e) => {
      const formulas = e.state.formulas[b.id] || [];
      return buildMockPdf(b.title + " — Formulas", formulas.map((f: any) => `${f.title}\n${f.equation}\n${f.description}`).join("\n\n"));
    }
  },
  { format: "mindmap_pdf", label: "Mind Map", description: "Visual concept graph", icon: "GitBranch", tone: "emerald", ext: "pdf", build: (b) => buildMockPdf(b.title + " — Mind Map", `Mind map for ${b.title}.`) },
  {
    format: "flashcards_pdf", label: "Flashcards", description: "Printable active recall cards", icon: "Layers", tone: "amber", ext: "pdf", build: (b, e) => {
      const cards = e.state.flashcards[b.id] || [];
      return buildMockPdf(b.title + " — Flashcards", cards.map((c: any, i: number) => `Card ${i + 1}\nQ: ${c.front}\nA: ${c.back}`).join("\n\n"));
    }
  },
  {
    format: "question_bank_pdf", label: "Question Bank", description: "All Q&A compiled", icon: "HelpCircle", tone: "violet", ext: "pdf", build: (b, e) => {
      const qs = e.state.questions[b.id] || [];
      return buildMockPdf(b.title + " — Questions", qs.map((q: any, i: number) => `${i + 1}. [${q.type.toUpperCase()}] ${q.question}\nAnswer: ${q.answer}`).join("\n\n"));
    }
  },
  {
    format: "analytics_report_pdf", label: "Analytics Report", description: "Insights & weightage", icon: "TrendingUp", tone: "indigo", ext: "pdf", build: (b, e) => {
      const a = e.state.analytics[b.id];
      if (!a) return buildMockPdf(b.title + " — Analytics", "No analytics available.");
      return buildMockPdf(b.title + " — Analytics", `Total Chapters: ${a.totalChapters}\nTotal Topics: ${a.totalTopics}\nExam Readiness: ${a.examReadiness}%\nDifficulty: ${a.difficultyScore}\nConfidence: ${a.confidencePrediction}%\nReading Time: ${a.estimatedReadingMinutes}m`);
    }
  },
  {
    format: "json_export", label: "JSON Data", description: "Complete data model export", icon: "Braces", tone: "sky", ext: "json", build: (b, e) => new Blob([JSON.stringify({
      book: b,
      chapters: e.state.chapters[b.id] || [],
      formulas: e.state.formulas[b.id] || [],
      flashcards: e.state.flashcards[b.id] || [],
      questions: e.state.questions[b.id] || [],
      analytics: e.state.analytics[b.id] || null,
    }, null, 2)], { type: "application/json" })
  },
  {
    format: "markdown_export", label: "Markdown Notes", description: "All notes as .md", icon: "FileCode", tone: "emerald", ext: "md", build: (b, e) => {
      const chapters = e.state.chapters[b.id] || [];
      return new Blob([chapters.map((c: any) => `# ${c.title}\n\n${c.notes || ""}`).join("\n\n---\n\n")], { type: "text/markdown" });
    }
  },
];

const TONE_CLS: Record<DownloadDef["tone"], string> = {
  indigo: "from-indigo-500 to-violet-500",
  amber: "from-amber-500 to-orange-500",
  rose: "from-rose-500 to-pink-500",
  emerald: "from-emerald-500 to-teal-500",
  violet: "from-violet-500 to-fuchsia-500",
  sky: "from-sky-500 to-cyan-500",
};

export function DownloadCenter() {
  const engine = useKnowledgeEngine();
  const book = engine.state.books.find((b) => b.id === engine.state.ui.activeBookId) || null;
  const [building, setBuilding] = useState<string | null>(null);

  if (!book) {
    return <GlassCard padding="md"><EmptyState icon="Download" title="No book selected" description="Pick a book from the Library to download its AI-generated materials." /></GlassCard>;
  }

  const handleDownload = async (def: DownloadDef) => {
    setBuilding(def.format);
    engine.toast.push(`Building ${def.label}`, { tone: "info" });
    // Simulate build time
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
    const blob = def.build(book, engine);
    const record = engine.recordDownload(book.id, def.format);
    engine.updateDownload(record.id, { status: "ready", sizeBytes: blob.size, completedAt: new Date().toISOString() });
    downloadBlob(blob, `${book.title.replace(/[^a-z0-9]+/gi, "_")}_${def.format}.${def.ext}`);
    setBuilding(null);
    engine.toast.push(`${def.label} ready`, { tone: "success", detail: formatBytes(blob.size) });
  };

  const handleDownloadAll = async () => {
    engine.toast.push("Building ZIP package", { tone: "info", detail: "This may take a few seconds..." });
    setBuilding("zip_package");
    await new Promise((r) => setTimeout(r, 1500));
    // Build a "ZIP" by concatenating each format's text
    const allText = DOWNLOADS.map((d) => {
      const blob = d.build(book, engine);
      return `--- ${d.label} ---\n${d.ext.toUpperCase()}, ${formatBytes(blob.size)}`;
    }).join("\n\n");
    const blob = new Blob([allText], { type: "application/zip" });
    downloadBlob(blob, `${book.title.replace(/[^a-z0-9]+/gi, "_")}_complete_package.zip`);
    setBuilding(null);
    engine.toast.push("ZIP package ready", { tone: "success" });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <GlassCard padding="md" tone="indigo">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Lucide.Download className="w-5 h-5 text-violet-600" />
              Download
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Compile AI-generated study materials for <strong>{book.title}</strong></p>
          </div>
          <Button tone="primary" size="md" icon="Package" loading={building === "zip_package"} onClick={handleDownloadAll}>Download All as ZIP</Button>
        </div>
      </GlassCard>

      {/* DOWNLOAD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {DOWNLOADS.map((def) => {
          const Icon = (Lucide as any)[def.icon];
          const isBuilding = building === def.format;
          return (
            <motion.div
              key={def.format}
              whileHover={{ y: -2 }}
              className="group bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-md transition cursor-pointer"
              onClick={() => !isBuilding && handleDownload(def)}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${TONE_CLS[def.tone]} flex items-center justify-center text-white shadow-sm mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800 tracking-tight">{def.label}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{def.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <Pill tone={def.tone} size="xs">.{def.ext}</Pill>
                {isBuilding ? (
                  <Lucide.Loader className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                ) : (
                  <Lucide.Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* RECENT DOWNLOADS */}
      <GlassCard padding="md">
        <SectionHeader icon="Clock" title="Recent Downloads" subtitle="Your download history" />
        {engine.state.downloads.length === 0 ? (
          <EmptyState icon="Download" title="No downloads yet" description="Click any format above to compile a package." />
        ) : (
          <div className="space-y-2 mt-3">
            {engine.state.downloads.slice(0, 8).map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white/60">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white">
                  <Lucide.FileCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-slate-800 truncate">{d.fileName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{d.format.replace(/_/g, " ")} • {formatRelativeTime(d.requestedAt)} • {d.sizeBytes ? formatBytes(d.sizeBytes) : "—"}</p>
                </div>
                <Pill tone="emerald" size="xs" icon="CheckCircle2">{d.status}</Pill>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";

import { useKnowledgeEngine } from "../../context";
import { GlassCard, SectionHeader, Pill, Button, IconButton, EmptyState, ProgressBar } from "../common/Primitives";
import { formatBytes, formatRelativeTime, formatTime, nextId } from "../../utils";
import type { BookVersion } from "../../types";

export function VersionControl() {
  const engine = useKnowledgeEngine();
  const book = engine.state.books.find((b) => b.id === engine.state.ui.activeBookId) || null;
  const versions = useMemo(() => {
    if (!book) return [];
    return engine.state.versions.filter((v) => v.id.startsWith(book.id + "_") || v.bookId === book.id).sort((a, b) => b.versionNumber - a.versionNumber);
  }, [book, engine.state.versions]);

  if (!book) {
    return <GlassCard padding="md"><EmptyState icon="GitBranch" title="No book selected" /></GlassCard>;
  }

  const handleAddVersion = () => {
    const newVersion: BookVersion = {
      id: nextId("v"),
      versionNumber: book.versionNumber + 1,
      createdAt: new Date().toISOString(),
      createdBy: "developer@examforge.ai",
      changeSummary: "Manual snapshot with latest changes",
      sizeBytes: book.sizeBytes,
      pageCount: book.pageCount,
      qualityScore: book.qualityScore,
      ocrConfidence: book.ocrConfidence,
      isCurrent: true,
    };
    engine.addVersion(book.id, newVersion);
    engine.updateBook(book.id, { versionNumber: newVersion.versionNumber, versionId: newVersion.id });
  };

  return (
    <div className="space-y-6">
      <GlassCard padding="md" tone="amber">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Lucide.GitBranch className="w-5 h-5 text-amber-600" />
              Version Control
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Track changes across <strong>{versions.length}</strong> versions of <strong>{book.title}</strong></p>
          </div>
          <Button tone="primary" size="md" icon="Plus" onClick={handleAddVersion}>Create Snapshot</Button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TIMELINE */}
        <div className="lg:col-span-2">
          <GlassCard padding="md">
            <SectionHeader icon="History" title="Version Timeline" subtitle="Newest first" />
            {versions.length === 0 ? (
              <EmptyState icon="GitBranch" title="No versions yet" description="Create a snapshot to start tracking changes." />
            ) : (
              <div className="space-y-3 mt-4">
                {versions.map((v, i) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative"
                  >
                    {i < versions.length - 1 && (
                      <div className="absolute left-5 top-12 bottom-0 w-px bg-slate-200" />
                    )}
                    <div className={`flex items-start gap-3 p-3 rounded-2xl border transition ${v.isCurrent ? "border-indigo-300 bg-indigo-50/40" : "border-slate-200 bg-white/60 hover:bg-white"}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 ${v.isCurrent ? "bg-gradient-to-br from-indigo-500 to-violet-500" : "bg-slate-300"}`}>
                        v{v.versionNumber}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {v.isCurrent && <Pill tone="indigo" size="xs" icon="Check">Current</Pill>}
                          <Pill tone="slate" size="xs">{formatRelativeTime(v.createdAt)}</Pill>
                          <Pill tone="emerald" size="xs">Quality {v.qualityScore}</Pill>
                          <Pill tone="sky" size="xs">OCR {v.ocrConfidence}</Pill>
                        </div>
                        <p className="text-sm font-bold text-slate-800 leading-snug">{v.changeSummary}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <span>{v.pageCount} pages</span>
                          <span>•</span>
                          <span>{formatBytes(v.sizeBytes)}</span>
                          <span>•</span>
                          <span>By {v.createdBy}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!v.isCurrent && (
                          <Button tone="secondary" size="sm" icon="RotateCcw" onClick={() => engine.restoreVersion(book.id, v.id)}>Restore</Button>
                        )}
                        <IconButton icon="GitCompare" size="sm" title="Compare with current" onClick={() => engine.toast.push("Comparison view opened", { tone: "info" })} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* DIFF PANEL */}
        <div className="space-y-4">
          <GlassCard padding="md" tone="emerald">
            <SectionHeader icon="GitCompareArrows" title="Current Version" tone="emerald" size="sm" />
            <div className="mt-3 text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-black text-xl mx-auto">
                v{book.versionNumber}
              </div>
              <p className="text-xs font-extrabold text-slate-700">Active build</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{formatTime(book.updatedAt)}</p>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="font-extrabold uppercase tracking-wider text-slate-500">Quality</span>
                <span className="font-black text-slate-700">{book.qualityScore}</span>
              </div>
              <ProgressBar value={book.qualityScore} tone="emerald" />
              <div className="flex justify-between text-[10px] mt-2">
                <span className="font-extrabold uppercase tracking-wider text-slate-500">OCR</span>
                <span className="font-black text-slate-700">{book.ocrConfidence}</span>
              </div>
              <ProgressBar value={book.ocrConfidence} tone="indigo" />
            </div>
          </GlassCard>

          <GlassCard padding="md">
            <SectionHeader icon="Zap" title="Quick Actions" size="sm" />
            <div className="space-y-2 mt-3">
              <Button tone="secondary" size="sm" fullWidth icon="Plus" onClick={handleAddVersion}>Create Snapshot</Button>
              <Button tone="secondary" size="sm" fullWidth icon="Upload" onClick={() => engine.toast.push("Upload new version", { tone: "info" })}>Upload New Version</Button>
              <Button tone="secondary" size="sm" fullWidth icon="GitCompareArrows" onClick={() => engine.toast.push("Compare all versions", { tone: "info" })}>Compare All</Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

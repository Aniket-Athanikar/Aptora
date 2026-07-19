"use client";


import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

import { useKnowledgeEngine } from "../../context";
import { GlassCard, SectionHeader, Pill, Button, ProgressBar, ProgressRing, EmptyState, IconButton } from "../common/Primitives";
import { formatRelativeTime, formatBytes } from "../../utils";
import type { ProcessingJob, PipelineStage } from "../../types";

export function PipelineScreen() {
  const engine = useKnowledgeEngine();

  const activeJob = useMemo(() => {
    return engine.state.jobs.find((j) => j.status === "processing" || j.status === "queued") || engine.state.jobs[0] || null;
  }, [engine.state.jobs]);

  if (!activeJob) {
    return (
      <GlassCard padding="md">
        <EmptyState icon="Cpu" title="No active pipeline" description="Upload a book from the Upload Center to see the OCR + AI processing in action." />
      </GlassCard>
    );
  }

  const book = engine.state.books.find((b) => b.id === activeJob.bookId);
  const completedStages = activeJob.stages.filter((s) => s.status === "complete").length;
  const totalStages = activeJob.stages.length;
  const currentStage = activeJob.stages.find((s) => s.status === "active");

  return (
    <div className="space-y-6">
      {/* HEADER STRIP */}
      <GlassCard padding="md" tone="indigo">
        <div className="flex items-center gap-4 flex-wrap">
          <motion.div
            animate={{ rotate: activeJob.status === "processing" ? 360 : 0 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shrink-0"
          >
            <Lucide.Cpu className="w-7 h-7" />
          </motion.div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-black text-slate-800 tracking-tight truncate">{book?.title || activeJob.fileName}</h3>
              <Pill tone="indigo" icon="Activity">
                {activeJob.status === "processing" ? "Processing" : activeJob.status === "queued" ? "Queued" : activeJob.status === "ready" ? "Complete" : "Failed"}
              </Pill>
              <Pill tone="slate">{activeJob.ocrEngine.toUpperCase()}</Pill>
              <Pill tone="slate">{activeJob.aiModel.toUpperCase()}</Pill>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed truncate">{formatBytes(activeJob.sizeBytes)} • ~{activeJob.pageEstimate} pages • {completedStages}/{totalStages} stages complete</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeJob.status === "processing" && <Button tone="danger" size="sm" icon="Square" onClick={() => engine.cancelPipeline(activeJob.id)}>Cancel</Button>}
            {activeJob.status === "failed" && <Button tone="amber" size="sm" icon="RotateCw" onClick={() => engine.retryPipeline(activeJob.id)}>Retry #{activeJob.retryCount + 1}</Button>}
            {activeJob.status === "ready" && <Button tone="success" size="sm" icon="BookOpen" onClick={() => { engine.setActiveBook(activeJob.bookId); engine.setTab("knowledge"); }}>Open in Library</Button>}
          </div>
        </div>

        {/* Big progress */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-indigo-100/80">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Overall Progress</span>
              <span className="text-sm font-black text-indigo-600">{activeJob.overallProgress}%</span>
            </div>
            <ProgressBar value={activeJob.overallProgress} tone="indigo" size="md" />
            <p className="text-[10px] text-slate-500 font-bold">Stage {completedStages + (currentStage ? 0.5 : 0)} of {totalStages} — {currentStage ? currentStage.label : activeJob.status === "ready" ? "Pipeline complete" : "Initializing"}</p>
          </div>
          <div className="flex items-center gap-3 bg-white/60 rounded-2xl p-3 border border-indigo-100">
            <Lucide.Clock className="w-5 h-5 text-indigo-500" />
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Started</p>
              <p className="text-xs font-black text-slate-800">{formatRelativeTime(activeJob.startedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/60 rounded-2xl p-3 border border-indigo-100">
            <Lucide.Hourglass className="w-5 h-5 text-violet-500" />
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">ETA</p>
              <p className="text-xs font-black text-slate-800">{activeJob.status === "ready" ? "Complete" : "~" + Math.max(1, Math.round((totalStages - completedStages) * 2)) + "s left"}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* MAIN: STAGES + CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STAGES */}
        <div className="lg:col-span-2">
          <GlassCard padding="md">
            <SectionHeader icon="ListChecks" title="Pipeline Stages" subtitle={`${totalStages} AI-powered stages`} right={<Pill tone="indigo">{completedStages}/{totalStages}</Pill>} />
            <div className="mt-4 space-y-2 max-h-[520px] overflow-y-auto pr-2">
              {activeJob.stages.map((stage, idx) => (
                <StageRow key={stage.key} stage={stage} index={idx} />
              ))}
            </div>
          </GlassCard>
        </div>

        {/* CONSOLE */}
        <div className="space-y-4">
          <GlassCard padding="md">
            <SectionHeader icon="Terminal" title="Live Console" subtitle={`${activeJob.logs.length} events`} right={
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Live</span>
              </div>
            } />
            <div className="mt-3 bg-slate-900 rounded-2xl p-3 max-h-[400px] overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-300 space-y-0.5">
              {activeJob.logs.slice(-100).map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-slate-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString().slice(0, 8)}</span>
                  <span className={`shrink-0 ${log.level === "success" ? "text-emerald-400" : log.level === "error" ? "text-rose-400" : log.level === "warn" ? "text-amber-400" : "text-sky-400"}`}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span className="text-slate-300 break-all">{log.message}</span>
                </div>
              ))}
              {activeJob.status === "processing" && (
                <div className="flex items-center gap-1 text-slate-500 mt-1 animate-pulse">
                  <span>&gt;_</span>
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Quality Score panel */}
          <GlassCard padding="md">
            <SectionHeader icon="Gauge" title="Quality Metrics" />
            <div className="mt-4 flex flex-col items-center">
              <ProgressRing
                value={activeJob.qualityScore.overall || Math.round((activeJob.overallProgress * 0.95))}
                size={120}
                strokeWidth={10}
                tone="emerald"
                label={`${activeJob.qualityScore.overall || Math.round(activeJob.overallProgress * 0.95)}%`}
                sublabel="Quality"
              />
              <div className="w-full space-y-2 mt-4">
                {[
                  { label: "OCR Confidence", val: activeJob.qualityScore.ocrConfidence || Math.round(activeJob.overallProgress * 0.96), icon: "ScanText" },
                  { label: "Resolution", val: activeJob.qualityScore.resolution || 96, icon: "Maximize2" },
                  { label: "Sharpness", val: activeJob.qualityScore.sharpness, icon: "Wand2" },
                ].map((m) => {
                  const Icon = (Lucide as any)[m.icon];
                  return (
                    <div key={m.label} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1"><Icon className="w-3 h-3" /> {m.label}</span>
                        <span className="font-extrabold text-slate-700">{m.val}%</span>
                      </div>
                      <ProgressBar value={m.val} tone="emerald" />
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function StageRow({ stage, index }: { stage: PipelineStage; index: number }) {
  const Icon = (Lucide as any)[stage.icon] || Lucide.Circle;
  const statusConfig = {
    pending: { bg: "bg-slate-50", ring: "ring-slate-200", icon: "text-slate-400", bar: "bg-slate-200", label: "Pending" },
    active: { bg: "bg-indigo-50", ring: "ring-indigo-300", icon: "text-indigo-600", bar: "bg-gradient-to-r from-indigo-500 to-violet-500", label: "Active" },
    complete: { bg: "bg-emerald-50", ring: "ring-emerald-200", icon: "text-emerald-600", bar: "bg-emerald-500", label: "Complete" },
    failed: { bg: "bg-rose-50", ring: "ring-rose-200", icon: "text-rose-600", bar: "bg-rose-500", label: "Failed" },
  };
  const cfg = statusConfig[stage.status];
  const duration = stage.startedAt && stage.completedAt ? stage.completedAt - stage.startedAt : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`relative p-3 rounded-2xl border ${cfg.bg} ${cfg.ring} ring-1 transition`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${stage.status === "active" ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white" : "bg-white border border-slate-200"} flex items-center justify-center shrink-0`}>
          {stage.status === "active" ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Lucide.Loader className="w-4 h-4" />
            </motion.div>
          ) : stage.status === "complete" ? (
            <Lucide.Check className={`w-4 h-4 ${cfg.icon}`} />
          ) : stage.status === "failed" ? (
            <Lucide.X className={`w-4 h-4 ${cfg.icon}`} />
          ) : (
            <Icon className={`w-4 h-4 ${cfg.icon}`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Stage {index + 1}</span>
            <h4 className="font-black text-xs text-slate-800">{stage.label}</h4>
            <Pill tone={stage.status === "complete" ? "emerald" : stage.status === "active" ? "indigo" : stage.status === "failed" ? "rose" : "slate"} size="xs">
              {cfg.label}
            </Pill>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{stage.description}</p>
        </div>
        {duration !== null && stage.status === "complete" && (
          <div className="text-right shrink-0">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{(duration / 1000).toFixed(1)}s</p>
          </div>
        )}
      </div>
      {stage.status === "active" && (
        <div className="mt-2 overflow-hidden rounded-full h-1">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: "40%" }}
          />
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// PIPELINE QUEUE — shows all jobs (running, queued, completed, failed)
// ---------------------------------------------------------------------------

export function PipelineQueue() {
  const engine = useKnowledgeEngine();
  const jobs = engine.state.jobs;

  if (jobs.length === 0) {
    return null;
  }

  return (
    <GlassCard padding="md">
      <SectionHeader icon="Activity" title="Recent Jobs" subtitle={`${jobs.length} processing events`} />
      <div className="space-y-2 mt-4 max-h-80 overflow-y-auto">
        {jobs.slice(0, 10).map((job) => {
          const book = engine.state.books.find((b) => b.id === job.bookId);
          const tone = job.status === "processing" ? "indigo" : job.status === "ready" ? "emerald" : job.status === "failed" ? "rose" : "slate";
          return (
            <div key={job.id} className="p-3 rounded-2xl border border-slate-200 bg-white/60 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-${tone}-100 flex items-center justify-center`}>
                <Lucide.FileText className={`w-4 h-4 text-${tone}-600`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-800 truncate">{book?.title || job.fileName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatBytes(job.sizeBytes)} • {job.ocrEngine.toUpperCase()} • {job.aiModel.toUpperCase()}</p>
              </div>
              <Pill tone={tone as any} icon={job.status === "processing" ? "Loader" : job.status === "ready" ? "CheckCircle2" : job.status === "failed" ? "XCircle" : "Clock"}>
                {job.status}
              </Pill>
              <div className="w-24">
                <ProgressBar value={job.overallProgress} tone={tone as any} />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

"use client";


import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

import { useKnowledgeEngine } from "../../context";
import { GlassCard, SectionHeader, Pill, Button, ProgressBar, ProgressRing, EmptyState } from "../common/Primitives";
import { formatBytes, nextId, pickCoverColor } from "../../utils";
import type { ImageEnhancements, QualityScore } from "../../types";

interface QualityFile {
  id: string;
  name: string;
  ext: string;
  sizeBytes: number;
  previewUrl: string;
  coverColor: string;
}

interface QualityEngineProps {
  files: QualityFile[];
  onProcessComplete?: (enhancements: ImageEnhancements, quality: QualityScore) => void;
}

const DEFAULT_ENHANCEMENTS: ImageEnhancements = {
  brightness: 100,
  contrast: 100,
  sharpness: 100,
  noise: 0,
  saturation: 100,
  rotation: 0,
  skew: 0,
  blur: 1,
  qeledBoost: 50,
};

const STAGES = [
  { key: "deskew", label: "Deskew", icon: "RotateCw", description: "Straighten pages" },
  { key: "denoise", label: "Denoise", icon: "Sparkles", description: "Remove scan noise" },
  { key: "brightness", label: "Brightness", icon: "Sun", description: "Normalize lighting" },
  { key: "contrast", label: "Contrast", icon: "Contrast", description: "Amplify text vs background" },
  { key: "sharpen", label: "Sharpen", icon: "Wand2", description: "Edge sharpening" },
  { key: "qeled", label: "QELED Boost", icon: "Atom", description: "Quantum-Enhanced Detail" },
];

const SAMPLE_PREVIEW = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=80";
const SAMPLE_PREVIEW_2 = "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200&q=80";
const SAMPLE_PREVIEW_3 = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80";

export function QualityEngine({ files, onProcessComplete }: QualityEngineProps) {
  const engine = useKnowledgeEngine();
  const [selectedId, setSelectedId] = useState<string | null>(files[0]?.id || null);
  const [enh, setEnh] = useState<ImageEnhancements>(DEFAULT_ENHANCEMENTS);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const current = useMemo(() => files.find((f) => f.id === selectedId) || files[0] || null, [files, selectedId]);

  // ------ computed quality score ------
  const computedQuality: QualityScore = useMemo(() => {
    const brightnessScore = 100 - Math.abs(100 - enh.brightness) * 0.4;
    const contrastScore = 100 - Math.abs(100 - enh.contrast) * 0.3;
    const noiseScore = Math.max(0, 100 - enh.noise * 3);
    const skewScore = Math.max(0, 100 - Math.abs(enh.skew) * 4);
    const blurScore = Math.max(0, 100 - (enh.blur - 1) * 12);
    const sharpnessScore = enh.sharpness;
    const overall = Math.round((brightnessScore + contrastScore + noiseScore + skewScore + blurScore + sharpnessScore) / 6);
    return {
      overall,
      resolution: 96,
      ocrConfidence: Math.min(99, Math.round(overall * 0.95 + 2)),
      contrast: Math.round(contrastScore),
      sharpness: Math.round(sharpnessScore),
      noise: Math.round(noiseScore),
      skew: Math.round(skewScore),
    };
  }, [enh]);

  // ------ recommendations ------
  const recommendations = useMemo(() => {
    const list: { id: string; label: string; action: () => void; icon: keyof typeof Lucide }[] = [];
    if (Math.abs(enh.skew) > 0.5) {
      list.push({
        id: "deskew",
        label: `Auto-Deskew by ${(-enh.skew).toFixed(1)}°`,
        icon: "RotateCw",
        action: () => setEnh((e) => ({ ...e, skew: 0 })),
      });
    }
    if (enh.brightness < 90) {
      list.push({ id: "bright", label: "Boost brightness to 100%", icon: "Sun", action: () => setEnh((e) => ({ ...e, brightness: 100 })) });
    }
    if (enh.contrast < 90) {
      list.push({ id: "contrast", label: "Amplify contrast to 100%", icon: "Contrast", action: () => setEnh((e) => ({ ...e, contrast: 100 })) });
    }
    if (enh.noise > 5) {
      list.push({ id: "denoise", label: "Apply adaptive denoise (set 0)", icon: "Sparkles", action: () => setEnh((e) => ({ ...e, noise: 0 })) });
    }
    if (enh.blur > 1.5) {
      list.push({ id: "sharpen", label: "Sharpen edges (set blur to 1)", icon: "Wand2", action: () => setEnh((e) => ({ ...e, blur: 1 })) });
    }
    if (enh.qeledBoost < 30) {
      list.push({ id: "qeled", label: "Enable QELED boost (set 50)", icon: "Atom", action: () => setEnh((e) => ({ ...e, qeledBoost: 50 })) });
    }
    if (list.length === 0) {
      list.push({ id: "perfect", label: "Image is OCR-ready", icon: "CheckCheck", action: () => { } });
    }
    return list;
  }, [enh]);

  // ------ CSS filter string for "after" image ------
  const afterFilter = useMemo(() => {
    const brightness = enh.brightness / 100;
    const contrast = enh.contrast / 100;
    const saturation = enh.saturation / 100;
    const blur = Math.max(0, enh.blur - 1);
    return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px)`;
  }, [enh]);

  // ------ rotation reset ------
  useEffect(() => {
    setRotation(0);
  }, [selectedId]);

  // ------ split drag ------
  useEffect(() => {
    if (!isDraggingSplit) return;
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSplitPosition(pct);
    };
    const handleUp = () => setIsDraggingSplit(false);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [isDraggingSplit]);

  if (!current) {
    return (
      <GlassCard padding="md">
        <EmptyState icon="Sliders" title="No files selected" description="Add files in the Upload Center first, then return here to optimize OCR quality." />
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: PREVIEW + COMPARISON */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard padding="md">
            <SectionHeader
              icon="ScanLine"
              title="Before / After Comparison"
              subtitle="Drag the slider to compare original vs enhanced"
              right={
                <div className="flex items-center gap-2">
                  <Button tone="ghost" size="sm" icon="ZoomIn" onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}>Zoom</Button>
                  <span className="text-xs font-extrabold text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
                  <Button tone="ghost" size="sm" icon="ZoomOut" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} />
                  <Button tone="ghost" size="sm" icon="RotateCw" onClick={() => setRotation((r) => (r + 90) % 360)}>Rotate</Button>
                </div>
              }
            />

            <div
              ref={containerRef}
              className="relative mt-4 aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 select-none cursor-ew-resize"
              onMouseDown={() => setIsDraggingSplit(true)}
            >
              {/* BEFORE (full layer) */}
              <div className="absolute inset-0">
                <img
                  src={current.previewUrl}
                  alt="Before"
                  className="w-full h-full object-cover"
                  style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, filter: `brightness(0.85) contrast(0.9) saturate(0.85)`, transition: "transform 0.3s" }}
                  draggable={false}
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-white">Before</div>
              </div>

              {/* AFTER (clipped by split) */}
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - splitPosition}% 0 0)` }}>
                <img
                  src={current.previewUrl}
                  alt="After"
                  className="w-full h-full object-cover"
                  style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, filter: afterFilter, transition: "transform 0.3s" }}
                  draggable={false}
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-indigo-500/90 backdrop-blur rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-white">After</div>
              </div>

              {/* SPLIT HANDLE */}
              <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none" style={{ left: `${splitPosition}%` }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <Lucide.ChevronsLeftRight className="w-5 h-5 text-indigo-600" />
                </div>
              </div>

              {/* Footer indicators */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
                <div className="px-2.5 py-1 bg-black/60 backdrop-blur rounded-lg text-white">Original</div>
                <div className="px-2.5 py-1 bg-indigo-500/90 backdrop-blur rounded-lg text-white">{Math.round(splitPosition)}% comparison</div>
                <div className="px-2.5 py-1 bg-black/60 backdrop-blur rounded-lg text-white">Enhanced</div>
              </div>
            </div>

            {/* Pipeline Stages visual */}
            <div className="mt-5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Enhancement Pipeline</p>
              <div className="grid grid-cols-6 gap-2">
                {STAGES.map((stage, i) => {
                  const Icon = (Lucide as any)[stage.icon];
                  return (
                    <div key={stage.key} className="flex flex-col items-center text-center space-y-1">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0.6 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-sm"
                      >
                        <Icon className="w-4 h-4" />
                      </motion.div>
                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-700 leading-tight">{stage.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* Enhancement Sliders */}
          <GlassCard padding="md">
            <SectionHeader icon="SlidersHorizontal" title="Enhancement Controls" subtitle="Live preview updates as you adjust" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-5">
              {([
                { key: "brightness", label: "Brightness", min: 50, max: 150, step: 1, unit: "%", icon: "Sun" },
                { key: "contrast", label: "Contrast", min: 50, max: 150, step: 1, unit: "%", icon: "Contrast" },
                { key: "saturation", label: "Saturation", min: 0, max: 200, step: 1, unit: "%", icon: "Palette" },
                { key: "sharpness", label: "Sharpness", min: 0, max: 200, step: 1, unit: "%", icon: "Wand2" },
                { key: "noise", label: "Noise Filter", min: 0, max: 30, step: 1, unit: "px", icon: "Sparkles" },
                { key: "blur", label: "Blur", min: 0, max: 4, step: 0.1, unit: "", icon: "Droplets" },
                { key: "skew", label: "Deskew", min: -15, max: 15, step: 0.5, unit: "°", icon: "RotateCw" },
                { key: "qeledBoost", label: "QELED Boost", min: 0, max: 100, step: 1, unit: "%", icon: "Atom" },
              ] as const).map((s) => {
                const Icon = (Lucide as any)[s.icon];
                const value = (enh as any)[s.key];
                return (
                  <div key={s.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">{s.label}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-indigo-600">
                        {value}{s.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={value}
                      onChange={(e) => setEnh((prev) => ({ ...prev, [s.key]: parseFloat(e.target.value) }))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
              <Button tone="ghost" size="sm" icon="RotateCcw" onClick={() => setEnh(DEFAULT_ENHANCEMENTS)}>Reset to Default</Button>
              <Button tone="secondary" size="sm" icon="Wand2" onClick={() => {
                recommendations.filter((r) => r.action !== undefined).forEach((r) => r.action());
              }}>Auto-Optimize</Button>
              <div className="flex-1" />
              <Button tone="primary" size="md" icon="Zap" onClick={() => {
                engine.toast.push("Enhancements applied", { tone: "success", detail: "Image is ready for OCR processing." });
                onProcessComplete?.(enh, computedQuality);
              }}>Send to OCR Pipeline</Button>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT: SCORES + RECOMMENDATIONS + FILE PICKER */}
        <div className="space-y-4">
          {/* FILE PICKER */}
          {files.length > 1 && (
            <GlassCard padding="sm">
              <SectionHeader icon="Files" title="Files" subtitle={`${files.length} in queue`} size="sm" />
              <div className="space-y-1.5 mt-3 max-h-48 overflow-y-auto">
                {files.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedId(f.id)}
                    className={`w-full p-2 rounded-xl border text-left transition flex items-center gap-2 ${current.id === f.id ? "border-indigo-300 bg-indigo-50/40" : "border-slate-200 hover:bg-slate-50"
                      }`}
                  >
                    <div className={`w-8 h-10 rounded-md bg-gradient-to-br ${f.coverColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-extrabold text-slate-800 truncate">{f.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold">{formatBytes(f.sizeBytes)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

          {/* QUALITY SCORES */}
          <GlassCard padding="md">
            <SectionHeader icon="Gauge" title="Quality Score" subtitle="Computed live from enhancement values" />
            <div className="flex flex-col items-center mt-4">
              <ProgressRing value={computedQuality.overall} size={140} strokeWidth={12} tone="indigo" label={`${computedQuality.overall}`} sublabel="Overall" />
              <div className="w-full grid grid-cols-2 gap-2 mt-5">
                {[
                  { label: "Resolution", val: computedQuality.resolution, icon: "Maximize2", tone: "emerald" as const },
                  { label: "OCR Conf.", val: computedQuality.ocrConfidence, icon: "ScanText", tone: "indigo" as const },
                  { label: "Contrast", val: computedQuality.contrast, icon: "Contrast", tone: "amber" as const },
                  { label: "Sharpness", val: computedQuality.sharpness, icon: "Wand2", tone: "indigo" as const },
                  { label: "Noise (low)", val: computedQuality.noise, icon: "Sparkles", tone: "emerald" as const },
                  { label: "Deskew", val: computedQuality.skew, icon: "RotateCw", tone: "amber" as const },
                ].map((s) => {
                  const Icon = (Lucide as any)[s.icon];
                  const toneCls = s.tone === "indigo" ? "text-indigo-600 bg-indigo-50" : s.tone === "emerald" ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50";
                  return (
                    <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-md ${toneCls} flex items-center justify-center`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">{s.label}</p>
                      </div>
                      <p className="text-base font-black text-slate-800 mt-1">{s.val}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* RECOMMENDATIONS */}
          <GlassCard padding="md" tone="indigo">
            <SectionHeader icon="Sparkles" title="AI Recommendations" subtitle="Tap to apply" tone="indigo" size="sm" />
            <div className="space-y-2 mt-3">
              {recommendations.map((r) => {
                const Icon = (Lucide as any)[r.icon];
                return (
                  <button
                    key={r.id}
                    onClick={r.action}
                    className="w-full p-2.5 rounded-xl border border-indigo-100 bg-white/60 hover:bg-white hover:border-indigo-200 text-left flex items-center gap-2.5 transition group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-700 flex-1 leading-snug">{r.label}</p>
                    <Lucide.ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

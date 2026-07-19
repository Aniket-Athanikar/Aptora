"use client";


import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

import { useKnowledgeEngine } from "../../context";
import { GlassCard, SectionHeader, Pill, Button, IconButton, ProgressBar, Input, Select, Modal, EmptyState } from "../common/Primitives";
import { ALLOWED_EXTS, MAX_FILE_SIZE, formatBytes, hashString, nextId, validateFile } from "../../utils";
import type { ValidationIssue, BookMetadata } from "../../types";
import { pickCoverColor } from "../../utils";

interface UploadItem {
  id: string;
  file: File | null; // null = simulated
  name: string;
  ext: string;
  sizeBytes: number;
  pageEstimate: number;
  status: "queued" | "uploading" | "validating" | "ready" | "failed" | "duplicate";
  uploadProgress: number; // 0-100
  validation: ValidationIssue[];
  thumbnail?: string; // data url
  selectedExam: string;
  selectedFolder: string;
  metadata: Partial<BookMetadata>;
  duplicateOf?: string;
  preview?: string; // image preview url
}

interface UploadCenterProps {
  onUploaded?: (bookId: string) => void;
}

export function UploadCenter({ onUploaded }: UploadCenterProps) {
  const engine = useKnowledgeEngine();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraCountdown, setCameraCountdown] = useState<number | null>(null);
  const [cameraPreview, setCameraPreview] = useState<string | null>(null);
  const [showMetadataModal, setShowMetadataModal] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "queued" | "ready" | "failed">("all");

  // ------- Drag handlers -------
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // ------- Add files -------
  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;

    const newItems: UploadItem[] = list.map((file) => {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const validation = validateFile({ name: file.name, size: file.size, type: file.type });
      const hash = hashString(`${file.name}_${file.size}`);

      // Duplicate detection: check name + size
      const dupBook = engine.state.books.find((b) => b.originalFileName === file.name || b.sizeBytes === file.size);
      const isDup = Boolean(dupBook);

      return {
        id: nextId("upl"),
        file,
        name: file.name,
        ext,
        sizeBytes: file.size,
        pageEstimate: Math.max(1, Math.round((file.size / (1024 * 1024)) * 12)),
        status: isDup ? "duplicate" : validation.some((v) => v.severity === "critical" || v.severity === "error") ? "failed" : "queued",
        uploadProgress: 0,
        validation,
        selectedExam: engine.state.ui.selectedExam,
        selectedFolder: "Syllabus",
        duplicateOf: dupBook?.id,
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " "),
          author: "OCR Extracted Author",
          publisher: "Syllabus Telemetry Press",
          edition: "1st Edition",
          publicationYear: new Date().getFullYear().toString(),
          language: "English",
          difficulty: "intermediate",
          tags: ["#ai-import"],
          coverColor: pickCoverColor(file.name + hash),
        },
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      };
    });

    setItems((prev) => [...newItems, ...prev]);
    if (newItems[0]) {
      setSelectedItem(newItems[0].id);
    }
    engine.toast.push(`${newItems.length} file${newItems.length > 1 ? "s" : ""} added to queue`, { tone: "info" });
  }, [engine]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  // ------- Remove / Retry / Clear -------
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedItem === id) setSelectedItem(null);
  }, [selectedItem]);

  const retryItem = useCallback((id: string) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, status: "queued" as const, uploadProgress: 0, validation: [] } : it));
    engine.toast.push("Upload re-queued", { tone: "info" });
  }, [engine]);

  const clearAll = useCallback(() => {
    setItems([]);
    setSelectedItem(null);
  }, []);

  // ------- Simulate upload progress -------
  useEffect(() => {
    if (!items.length) return;
    const uploading = items.find((it) => it.status === "queued" || it.status === "uploading");
    if (!uploading) return;

    const id = uploading.id;
    const interval = setInterval(() => {
      setItems((prev) => {
        const next = prev.map((it) => {
          if (it.id !== id) return it;
          const newProgress = Math.min(100, it.uploadProgress + Math.random() * 8 + 4);
          if (newProgress >= 100) {
            return { ...it, uploadProgress: 100, status: "ready" as const };
          }
          return { ...it, uploadProgress: newProgress, status: it.status === "queued" ? "uploading" as const : it.status };
        });
        return next;
      });
    }, 320);

    return () => clearInterval(interval);
  }, [items]);

  // ------- Camera simulation -------
  const startCamera = useCallback(() => {
    setCameraOpen(true);
    setCameraCountdown(3);
  }, []);

  useEffect(() => {
    if (cameraCountdown === null) return;
    if (cameraCountdown === 0) {
      setCameraCountdown(null);
      setCameraPreview("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80");
      setCameraOpen(false);
      return;
    }
    const t = setTimeout(() => setCameraCountdown((c) => (c ? c - 1 : 0)), 1000);
    return () => clearTimeout(t);
  }, [cameraCountdown]);

  const acceptCamera = useCallback(() => {
    if (!cameraPreview) return;
    const mockFile = new File([""], `Camera_Snapshot_${Date.now()}.jpg`, { type: "image/jpeg" });
    addFiles([mockFile]);
    setCameraPreview(null);
  }, [cameraPreview, addFiles]);

  // ------- Clipboard -------
  const triggerClipboard = useCallback(async () => {
    try {
      engine.log("upload", "Clipboard Trigger", "Attempted to read clipboard image asset.");
      engine.toast.push("Clipboard feature requires permission", { tone: "info", detail: "Demo: simulating a clipboard paste" });
      const mockFile = new File([""], `Clipboard_Note_${Date.now()}.png`, { type: "image/png" });
      addFiles([mockFile]);
    } catch {
      engine.toast.push("Clipboard read failed", { tone: "error" });
    }
  }, [engine, addFiles]);

  // ------- Submit ready items -------
  const submitToEngine = useCallback((itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.status !== "ready") return;

    const fileObj = item.file || { name: item.name, size: item.sizeBytes, type: "", ext: item.ext };
    const { book } = engine.createBookFromFile(
      { name: fileObj.name, size: fileObj.size, type: (fileObj as any).type, ext: item.ext },
      { examName: item.selectedExam, autoStart: true }
    );

    // Apply captured metadata
    engine.updateBook(book.id, {
      title: item.metadata.title || book.title,
      author: item.metadata.author || book.author,
      publisher: item.metadata.publisher || book.publisher,
      edition: item.metadata.edition || book.edition,
      publicationYear: item.metadata.publicationYear || book.publicationYear,
      language: item.metadata.language || book.language,
      difficulty: item.metadata.difficulty || book.difficulty,
      tags: item.metadata.tags || book.tags,
      folder: item.selectedFolder,
      coverColor: item.metadata.coverColor || book.coverColor,
      examName: item.selectedExam,
    });

    setItems((prev) => prev.filter((it) => it.id !== itemId));
    if (selectedItem === itemId) setSelectedItem(null);
    engine.toast.push("Book added to library", { tone: "success", detail: item.metadata.title });
    onUploaded?.(book.id);
    engine.setTab("pipeline");
  }, [items, engine, selectedItem, onUploaded]);

  const submitAllReady = useCallback(() => {
    const ready = items.filter((it) => it.status === "ready");
    ready.forEach((it) => submitToEngine(it.id));
  }, [items, submitToEngine]);

  // ------- Selected item details -------
  const selected = useMemo(() => items.find((it) => it.id === selectedItem) || null, [items, selectedItem]);
  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "queued") return items.filter((it) => it.status === "queued" || it.status === "uploading" || it.status === "validating");
    if (filter === "ready") return items.filter((it) => it.status === "ready");
    if (filter === "failed") return items.filter((it) => it.status === "failed" || it.status === "duplicate");
    return items;
  }, [items, filter]);

  const stats = useMemo(() => ({
    total: items.length,
    queued: items.filter((it) => it.status === "queued" || it.status === "uploading").length,
    ready: items.filter((it) => it.status === "ready").length,
    failed: items.filter((it) => it.status === "failed" || it.status === "duplicate").length,
    sizeBytes: items.reduce((s, it) => s + it.sizeBytes, 0),
  }), [items]);

  return (
    <div className="space-y-6">
      {/* HEADER + STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-500 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">In Queue</p>
          <p className="text-3xl font-black mt-1">{stats.queued}</p>
          <p className="text-[10px] font-bold opacity-80 mt-1">files pending</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Ready to Process</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{stats.ready}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">awaiting submission</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Failed / Duplicates</p>
          <p className="text-3xl font-black text-rose-600 mt-1">{stats.failed}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">need attention</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Size</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{formatBytes(stats.sizeBytes)}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">of 10 GB limit</p>
        </div>
      </div>

      {/* MAIN GRID: dropzone (left) + selected item details (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* DROPZONE */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative overflow-hidden cursor-pointer
              border-2 border-dashed rounded-3xl p-10
              transition-all duration-300
              ${isDragging
                ? "border-indigo-500 bg-indigo-50/30 scale-[0.99]"
                : "border-slate-300 bg-white/60 hover:border-slate-400 hover:bg-white/80"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff,.tif,.bmp,.docx,.txt,.md,.epub,.zip"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
            <input
              ref={folderInputRef}
              type="file"
              multiple
              className="hidden"
              // @ts-ignore
              webkitdirectory=""
              directory=""
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent" />
            </div>

            <div className="relative flex flex-col items-center text-center space-y-4">
              <motion.div
                animate={{ y: isDragging ? -6 : 0, scale: isDragging ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg"
              >
                <Lucide.UploadCloud className="w-10 h-10 text-white" />
              </motion.div>

              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  {isDragging ? "Drop to upload" : "Drag & drop study materials"}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  PDFs, images, scanned books, ZIPs, DOCX, EPUB, TXT — up to 10 GB. Auto-detects duplicates and validates before processing.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center pt-2">
                <Button tone="primary" icon="UploadCloud" size="sm">Browse Files</Button>
                <Button tone="secondary" icon="FolderUp" size="sm" onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }}>Folder</Button>
                <Button tone="secondary" icon="Copy" size="sm" onClick={(e) => { e.stopPropagation(); triggerClipboard(); }}>Clipboard</Button>
                <Button tone="secondary" icon="Camera" size="sm" onClick={(e) => { e.stopPropagation(); startCamera(); }}>Camera</Button>
              </div>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2">
                Supports: PDF · DOCX · ZIP · PNG · JPG · WEBP · TIFF · EPUB
              </p>
            </div>
          </div>

          {/* QUEUE */}
          <GlassCard padding="md">
            <SectionHeader
              icon="ListOrdered"
              title="Upload Queue"
              subtitle={`${items.length} file${items.length !== 1 ? "s" : ""} in pipeline`}
              right={
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1">
                    {(["all", "queued", "ready", "failed"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition ${filter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  {items.length > 0 && (
                    <Button tone="ghost" size="sm" icon="Trash2" onClick={clearAll}>Clear</Button>
                  )}
                </div>
              }
            />

            {filteredItems.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  icon="UploadCloud"
                  title={items.length === 0 ? "No files in queue" : "No items match this filter"}
                  description={items.length === 0 ? "Drop files into the area above or use the action buttons." : "Try a different filter or clear all to start over."}
                />
              </div>
            ) : (
              <div className="space-y-2 mt-4">
                {filteredItems.map((it) => {
                  const isSelected = selectedItem === it.id;
                  return (
                    <motion.div
                      key={it.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={() => setSelectedItem(it.id)}
                      className={`
                        group p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3
                        ${isSelected
                          ? "border-indigo-300 bg-indigo-50/40 shadow-sm"
                          : "border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300"
                        }
                      `}
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        {it.preview ? (
                          <img src={it.preview} alt={it.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${it.metadata.coverColor || "from-slate-400 to-slate-600"} flex items-center justify-center`}>
                            <Lucide.FileText className="w-5 h-5 text-white/80" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-extrabold text-xs text-slate-800 truncate">{it.name}</h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {it.status === "queued" && <Pill tone="slate" icon="Clock">Queued</Pill>}
                            {it.status === "uploading" && <Pill tone="sky" icon="Loader">Uploading</Pill>}
                            {it.status === "validating" && <Pill tone="violet" icon="Shield">Validating</Pill>}
                            {it.status === "ready" && <Pill tone="emerald" icon="CheckCircle2">Ready</Pill>}
                            {it.status === "failed" && <Pill tone="rose" icon="XCircle">Failed</Pill>}
                            {it.status === "duplicate" && <Pill tone="amber" icon="Copy">Duplicate</Pill>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                          <span className="uppercase">{it.ext}</span>
                          <span>•</span>
                          <span>{formatBytes(it.sizeBytes)}</span>
                          <span>•</span>
                          <span>~{it.pageEstimate} pages</span>
                          <span>•</span>
                          <span>{it.selectedExam}</span>
                        </div>

                        {(it.status === "uploading" || it.status === "queued") && (
                          <div className="space-y-0.5">
                            <ProgressBar value={it.uploadProgress} tone="indigo" />
                            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{Math.round(it.uploadProgress)}% uploaded</p>
                          </div>
                        )}

                        {it.validation.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {it.validation.slice(0, 3).map((v, i) => (
                              <Pill key={i} tone={v.severity === "error" || v.severity === "critical" ? "rose" : v.severity === "warning" ? "amber" : "sky"}>
                                {v.code.replace(/_/g, " ")}
                              </Pill>
                            ))}
                            {it.validation.length > 3 && <Pill tone="slate">+{it.validation.length - 3} more</Pill>}
                          </div>
                        )}

                        {it.status === "duplicate" && it.duplicateOf && (
                          <p className="text-[10px] text-amber-700 font-bold">Duplicate of {engine.state.books.find((b) => b.id === it.duplicateOf)?.title}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                        {it.status === "ready" && (
                          <IconButton icon="Send" tone="emerald" onClick={(e) => { e?.stopPropagation(); submitToEngine(it.id); }} title="Submit to Engine" />
                        )}
                        {it.status === "failed" && <IconButton icon="RotateCw" tone="amber" onClick={(e) => { e?.stopPropagation(); retryItem(it.id); }} title="Retry" />}
                        <IconButton icon="Edit3" onClick={(e) => { e?.stopPropagation(); setShowMetadataModal(it.id); }} title="Edit Metadata" />
                        <IconButton icon="Trash2" tone="danger" onClick={(e) => { e?.stopPropagation(); removeItem(it.id); }} title="Remove" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* RIGHT PANEL — Selected item preview & metadata */}
        <div className="space-y-6">
          <GlassCard padding="md">
            <SectionHeader icon="FileScan" title="Item Details" subtitle={selected ? selected.name : "Select an item"} />
            {selected ? (
              <div className="space-y-4 mt-4">
                {/* Preview */}
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  {selected.preview ? (
                    <img src={selected.preview} alt={selected.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${selected.metadata.coverColor || "from-slate-400 to-slate-600"} flex flex-col items-center justify-center text-white p-4`}>
                      <Lucide.BookOpen className="w-12 h-12 opacity-80 mb-2" />
                      <p className="text-xs font-extrabold text-center leading-tight">{selected.metadata.title}</p>
                      <p className="text-[10px] opacity-80 mt-1">PDF Preview Placeholder</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <Input
                    label="Title"
                    value={selected.metadata.title || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setItems((prev) => prev.map((it) => it.id === selected.id ? { ...it, metadata: { ...it.metadata, title: v } } : it));
                    }}
                  />
                  <Input
                    label="Author"
                    value={selected.metadata.author || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setItems((prev) => prev.map((it) => it.id === selected.id ? { ...it, metadata: { ...it.metadata, author: v } } : it));
                    }}
                  />
                  <Select
                    label="Target Exam"
                    value={selected.selectedExam}
                    onChange={(e) => {
                      const v = e.target.value;
                      setItems((prev) => prev.map((it) => it.id === selected.id ? { ...it, selectedExam: v } : it));
                    }}
                    options={[
                      { value: "GATE", label: "GATE" },
                      { value: "UPSC", label: "UPSC CSE" },
                      { value: "NEET", label: "NEET UG" },
                      { value: "JEE Advanced", label: "JEE Advanced" },
                      { value: "CAT", label: "CAT" },
                      { value: "SSC CGL", label: "SSC CGL" },
                      { value: "IBPS PO", label: "IBPS PO" },
                      { value: "NDA", label: "NDA" },
                      { value: "UGC NET", label: "UGC NET" },
                    ]}
                  />
                  <Select
                    label="Folder"
                    value={selected.selectedFolder}
                    onChange={(e) => {
                      const v = e.target.value;
                      setItems((prev) => prev.map((it) => it.id === selected.id ? { ...it, selectedFolder: v } : it));
                    }}
                    options={engine.state.folders.filter((f) => f !== "All Books").map((f) => ({ value: f, label: f }))}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  {selected.status === "ready" ? (
                    <Button tone="primary" icon="Send" fullWidth onClick={() => submitToEngine(selected.id)}>Submit to Engine</Button>
                  ) : (
                    <Button tone="secondary" fullWidth disabled>
                      {selected.status === "duplicate" ? "Duplicate — Resolve" : selected.status === "failed" ? "Resolve Errors First" : `Status: ${selected.status}`}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10">
                <EmptyState icon="MousePointer2" title="Select a queued file" description="Click on any item in the queue to preview and edit metadata here." />
              </div>
            )}
          </GlassCard>

          {/* Quick tips */}
          <GlassCard padding="md" tone="indigo">
            <SectionHeader icon="Sparkles" title="Pro Tips" subtitle="Optimize for best results" tone="indigo" size="sm" />
            <ul className="text-xs text-slate-600 space-y-2 mt-3">
              <li className="flex gap-2"><Lucide.Check className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" /> <span>Use <strong>300 DPI</strong> scans for printed text — minimum 200 DPI for handwritten.</span></li>
              <li className="flex gap-2"><Lucide.Check className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" /> <span>Split very large books by chapter to keep processing fast.</span></li>
              <li className="flex gap-2"><Lucide.Check className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" /> <span>Add tags & exam target to unlock syllabus-aware AI generation.</span></li>
              <li className="flex gap-2"><Lucide.Check className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" /> <span>Edit metadata before submitting — it propagates to all generated assets.</span></li>
            </ul>
          </GlassCard>
        </div>
      </div>

      {/* CAMERA COUNTDOWN OVERLAY */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-4">
              <h3 className="font-black text-slate-800 tracking-tight">Camera Capture</h3>
              <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center text-white relative overflow-hidden">
                {cameraCountdown !== null ? (
                  <motion.div key={cameraCountdown} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl font-black">
                    {cameraCountdown}
                  </motion.div>
                ) : (
                  <p>Initializing camera…</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button tone="secondary" fullWidth onClick={() => { setCameraOpen(false); setCameraCountdown(null); }}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}

        {cameraPreview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-4">
              <h3 className="font-black text-slate-800 tracking-tight">Preview</h3>
              <img src={cameraPreview} alt="Camera preview" className="rounded-2xl max-h-[300px] w-full object-cover" />
              <div className="flex gap-2">
                <Button tone="secondary" fullWidth onClick={() => { setCameraPreview(null); startCamera(); }}>Retake</Button>
                <Button tone="primary" fullWidth icon="Check" onClick={acceptCamera}>Add to Queue</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

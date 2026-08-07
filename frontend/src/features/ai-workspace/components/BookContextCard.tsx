"use client";

import React, { useState } from "react";
import { BookMetadata } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Languages,
  ShieldCheck,
  Gauge,
  Layers,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Search,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle2,
  Bookmark
} from "lucide-react";
import { useToast } from "@/lib/ToastContext";
import { useWorkspace } from "../workspaceContext";

interface BookContextCardProps {
  book: BookMetadata;
}

export function BookContextCard({ book }: BookContextCardProps) {
  const { toast } = useToast();
  const { triggerQuickAction } = useWorkspace();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [activeCoverColor, setActiveCoverColor] = useState<string>(book.coverColor || "from-purple-600 to-indigo-650");
  const [chapterSearch, setChapterSearch] = useState("");
  const [showAllChapters, setShowAllChapters] = useState(false);

  const handleZoomIn = () => setZoom((z) => Math.min(2, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, z - 0.15));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const isCompleted = book.ocrStatus === "completed";

  const colorThemes = [
    { label: "Purple", gradient: "from-purple-600 to-indigo-650" },
    { label: "Indigo", gradient: "from-blue-600 to-indigo-700" },
    { label: "Emerald", gradient: "from-emerald-600 to-teal-700" },
    { label: "Amber", gradient: "from-amber-500 to-orange-600" },
    { label: "Rose", gradient: "from-rose-500 to-pink-600" },
  ];

  const filteredChapters = (book.chapters || []).filter((ch) =>
    ch.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  return (
    <div className="bg-white border border-purple-100/70 rounded-3xl p-6 shadow-sm relative overflow-hidden space-y-6">
      {/* Background Realistic Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-100/30 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-6 relative z-10">
        {/* Book Cover / Document Viewport Container */}
        <div className="w-full lg:w-52 shrink-0 flex flex-col items-center">
          <div className="w-full aspect-[3/4] bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden relative shadow-lg flex items-center justify-center p-3">
            {/* 3D Realistic Book Cover Simulation */}
            <motion.div
              animate={{ scale: zoom, rotate: rotation }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className={`w-full h-full rounded-xl bg-gradient-to-br ${activeCoverColor} p-4 text-white flex flex-col justify-between shadow-xl select-none relative overflow-hidden border border-white/10`}
            >
              {/* Cover shine accent */}
              <div className="absolute -top-12 -left-12 w-28 h-28 bg-white/15 rounded-full blur-md" />

              <div className="flex justify-between items-start relative z-10">
                <span className="text-[9px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  PDF DOC
                </span>
                <BookOpen className="w-4 h-4 opacity-90" />
              </div>

              <div className="my-auto relative z-10">
                <p className="text-[9px] font-bold uppercase tracking-wider text-purple-200 opacity-80">
                  EXAMFORGE RAG STUDY
                </p>
                <h5 className="text-xs font-black line-clamp-3 leading-snug mt-1 text-white drop-shadow-xs">
                  {book.name}
                </h5>
              </div>

              <div className="flex justify-between items-center text-[9px] font-black opacity-90 relative z-10 border-t border-white/15 pt-2">
                <span>{book.pages} PAGES</span>
                <span className="uppercase">{book.language}</span>
              </div>
            </motion.div>

            {/* Bottom floating zoom stats */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700/80 px-2.5 py-0.5 rounded-full text-[9px] text-slate-300 font-bold select-none shadow-md backdrop-blur-xs">
              Zoom: {Math.round(zoom * 100)}% | {rotation}°
            </div>
          </div>

          {/* Controls Bar: Zoom In, Zoom Out, Rotate, Theme Pickers */}
          <div className="flex flex-col items-center gap-2 mt-3.5 w-full">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRotate}
                title="Rotate Viewport"
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cover Color Picker Dots */}
            <div className="flex items-center gap-1.5 pt-1">
              {colorThemes.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCoverColor(t.gradient)}
                  className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${t.gradient} transition-transform cursor-pointer ${
                    activeCoverColor === t.gradient ? "ring-2 ring-purple-600 scale-110" : "hover:scale-105 opacity-80"
                  }`}
                  title={`Change cover to ${t.label}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Book Context Metadata Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-800 line-clamp-1">{book.name}</h3>
                  <span className="text-[9px] font-black text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full uppercase">
                    Qdrant Synced
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  High-yield study resource context & OCR vector metadata
                </p>
              </div>

              <span
                className={`text-[10px] font-black px-3 py-1 rounded-full border shadow-2xs shrink-0 ${
                  isCompleted
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}
              >
                OCR: {book.ocrStatus.toUpperCase()}
              </span>
            </div>

            {/* Grid Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-4">
              <div className="p-3.5 bg-slate-50/70 border border-slate-150 rounded-2xl shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Languages className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-[10px] font-black uppercase">LANGUAGE</span>
                </div>
                <p className="text-xs font-black text-slate-800">{book.language}</p>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-150 rounded-2xl shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase">CONCEPTS</span>
                </div>
                <p className="text-xs font-black text-slate-800">
                  {isCompleted ? `${book.conceptCount} Extracted` : "Analyzing..."}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-150 rounded-2xl shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-pink-500" />
                  <span className="text-[10px] font-black uppercase">EST. STUDY TIME</span>
                </div>
                <p className="text-xs font-black text-slate-800">{book.readingTime}</p>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-150 rounded-2xl shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase">CONFIDENCE</span>
                </div>
                <p className="text-xs font-black text-emerald-600">
                  {isCompleted ? `${book.confidence}% Accuracy` : "Pending"}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-150 rounded-2xl shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-black uppercase">TOTAL PAGES</span>
                </div>
                <p className="text-xs font-black text-slate-800">{book.pages} Pages</p>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-150 rounded-2xl shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Cpu className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[10px] font-black uppercase">AI STATUS</span>
                </div>
                <p className="text-xs font-black text-purple-700 truncate">{book.aiStatus}</p>
              </div>
            </div>
          </div>

          {/* Chapters Accordion Drawer & Search */}
          {book.chapters && book.chapters.length > 0 && (
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  Extracted Chapters ({book.chapters.length})
                </h5>

                <div className="relative max-w-[180px]">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={chapterSearch}
                    onChange={(e) => setChapterSearch(e.target.value)}
                    placeholder="Search chapters..."
                    className="w-full text-[10px] pl-7 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(showAllChapters ? filteredChapters : filteredChapters.slice(0, 4)).map((ch, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      toast(`Selected chapter: ${ch}. Generating summary...`, "info");
                      triggerQuickAction("summarize");
                    }}
                    className="text-[10px] font-bold text-slate-700 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 hover:border-purple-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3 text-purple-500" />
                    <span>{ch}</span>
                  </button>
                ))}

                {filteredChapters.length > 4 && (
                  <button
                    onClick={() => setShowAllChapters(!showAllChapters)}
                    className="text-[10px] font-black text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{showAllChapters ? "Show Less" : `+${filteredChapters.length - 4} More`}</span>
                    {showAllChapters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

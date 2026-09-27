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
  Sparkles,
  CheckCircle2,
  FileText,
  Bookmark
} from "lucide-react";

interface BookContextCardProps {
  book: BookMetadata;
}

export function BookContextCard({ book }: BookContextCardProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(2, Number((z + 0.1).toFixed(1))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const isCompleted = book.ocrStatus === "completed";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-purple-200/60 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 p-5 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-300/80">
      {/* Soft Background Accent Glows */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-purple-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-7 items-start">
        {/* Left Column: Book Cover Viewport */}
        <div className="w-full lg:w-52 shrink-0 flex flex-col items-center">
          <div className="relative w-full aspect-[3/4] bg-slate-900/5 border border-purple-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-3">
            {/* Soft backdrop grid effect */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#6b21a8_1px,transparent_1px)] [background-size:12px_12px]" />

            <motion.div
              animate={{ scale: zoom, rotate: rotation }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className={`w-36 h-48 rounded-xl bg-gradient-to-br ${
                book.coverColor || "from-purple-600 via-indigo-600 to-purple-800"
              } p-4 text-white flex flex-col justify-between shadow-lg ring-1 ring-white/20 select-none relative overflow-hidden group`}
            >
              {/* Metallic Spine Effect */}
              <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-white/20 backdrop-blur-xs border-r border-white/10" />

              <div className="flex justify-between items-start pl-1">
                <span className="text-[9px] font-black tracking-widest uppercase bg-white/20 text-white px-2 py-0.5 rounded-md backdrop-blur-md shadow-2xs">
                  PDF
                </span>
                <Sparkles className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
              </div>

              <div className="mb-1 pl-1">
                <p className="text-[8px] font-black text-purple-200 uppercase tracking-widest">
                  Aptora RESOURCE
                </p>
                <h5 className="text-xs font-black line-clamp-3 leading-snug mt-1 text-white drop-shadow-xs">
                  {book.name}
                </h5>
              </div>

              <div className="flex justify-between items-center text-[9px] font-black text-purple-100 pl-1 border-t border-white/15 pt-2">
                <span>{book.pages} PAGES</span>
                <span>{book.language.toUpperCase()}</span>
              </div>
            </motion.div>

            {/* Bottom floating HUD indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-950/80 border border-purple-300/30 px-3 py-1 rounded-full text-[9px] text-purple-100 font-extrabold select-none shadow-md backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Zoom: {Math.round(zoom * 100)}% · Rot: {rotation}°
            </div>
          </div>

          {/* Interactive OCR Controls */}
          <div className="flex gap-2 mt-3 justify-center w-full">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="flex-1 p-2 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 transition-all cursor-pointer shadow-xs flex items-center justify-center"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="flex-1 p-2 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 transition-all cursor-pointer shadow-xs flex items-center justify-center"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRotate}
              title="Rotate Page"
              className="flex-1 p-2 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 transition-all cursor-pointer shadow-xs flex items-center justify-center"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Book Details & Metrics */}
        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-5">
          <div>
            {/* Header Title & Status */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-purple-700 bg-purple-100/70 border border-purple-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <Bookmark className="w-3 h-3" /> Indexed Book Context
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 line-clamp-1">{book.name}</h3>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3.5 py-1 rounded-full border shadow-xs ${
                  isCompleted
                    ? "bg-emerald-50/90 border-emerald-200 text-emerald-700"
                    : "bg-amber-50/90 border-amber-200 text-amber-700 animate-pulse"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                OCR: {book.ocrStatus.toUpperCase()}
              </span>
            </div>

            {/* Grid Metrics List with Soft Background Colors */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              <div className="p-3.5 bg-white/80 border border-purple-100/80 rounded-2xl shadow-2xs hover:bg-purple-50/40 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Languages className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-450">LANGUAGE</span>
                </div>
                <p className="text-xs font-black text-slate-900">{book.language}</p>
              </div>

              <div className="p-3.5 bg-white/80 border border-indigo-100/80 rounded-2xl shadow-2xs hover:bg-indigo-50/40 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-450">CONCEPTS</span>
                </div>
                <p className="text-xs font-black text-slate-900">
                  {isCompleted ? `${book.conceptCount} Extracted` : "Analyzing..."}
                </p>
              </div>

              <div className="p-3.5 bg-white/80 border border-blue-100/80 rounded-2xl shadow-2xs hover:bg-blue-50/40 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-450">EST. TIME</span>
                </div>
                <p className="text-xs font-black text-slate-900">{book.readingTime}</p>
              </div>

              <div className="p-3.5 bg-white/80 border border-emerald-100/80 rounded-2xl shadow-2xs hover:bg-emerald-50/40 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-450">ACCURACY</span>
                </div>
                <p className="text-xs font-black text-emerald-700">
                  {isCompleted ? `${book.confidence}%` : "Processing"}
                </p>
              </div>

              <div className="p-3.5 bg-white/80 border border-pink-100/80 rounded-2xl shadow-2xs hover:bg-pink-50/40 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-pink-600" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-450">PAGES</span>
                </div>
                <p className="text-xs font-black text-slate-900">{book.pages} Pages</p>
              </div>

              <div className="p-3.5 bg-white/80 border border-purple-100/80 rounded-2xl shadow-2xs hover:bg-purple-50/40 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-450">AI STATUS</span>
                </div>
                <p className="text-xs font-black text-purple-700 truncate">{book.aiStatus}</p>
              </div>
            </div>
          </div>

          {/* Chapters listing with active selection highlight */}
          {book.chapters.length > 0 && (
            <div className="border-t border-purple-100/80 pt-4">
              <div className="flex items-center justify-between mb-2.5">
                <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600" /> Extracted Chapters ({book.chapters.length})
                </h5>
                {selectedChapter && (
                  <button
                    onClick={() => setSelectedChapter(null)}
                    className="text-[10px] font-bold text-purple-600 hover:underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {book.chapters.map((ch, i) => {
                  const isSelected = selectedChapter === ch;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedChapter(isSelected ? null : ch)}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                        isSelected
                          ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200"
                          : "bg-white/90 text-slate-700 border-purple-200/70 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-900"
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
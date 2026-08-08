"use client";

import React, { useState } from "react";
import { BookMetadata } from "../types";
import { motion } from "framer-motion";
import { BookOpen, Languages, ShieldCheck, Gauge, Layers, Clock, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface BookContextCardProps {
  book: BookMetadata;
}

export function BookContextCard({ book }: BookContextCardProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((z) => Math.min(2, z + 0.1));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, z - 0.1));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const isCompleted = book.ocrStatus === "completed";

  return (
    <div className="bg-white border border-purple-100/60 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Book Cover / PDF Viewport simulation with Zoom and Rotation */}
        <div className="w-full lg:w-48 shrink-0 flex flex-col items-center">
          <div className="w-full aspect-[3/4] bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden relative shadow-inner flex items-center justify-center">
            {/* Simulated Page Content with visual zoom and rotation controls */}
            <motion.div
              animate={{ scale: zoom, rotate: rotation }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className={`w-36 h-48 rounded-xl bg-gradient-to-br ${book.coverColor || "from-purple-500 to-indigo-600"} p-4 text-white flex flex-col justify-between shadow-md select-none`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black tracking-widest uppercase bg-white/20 px-1.5 py-0.5 rounded">
                  PDF
                </span>
                <BookOpen className="w-4 h-4 opacity-80" />
              </div>
              <div className="mb-4">
                <p className="text-[10px] font-medium opacity-70">EXAMFORGE STUDY</p>
                <h5 className="text-xs font-black line-clamp-3 leading-snug mt-1">
                  {book.name}
                </h5>
              </div>
              <div className="flex justify-between items-center text-[9px] font-bold opacity-80">
                <span>{book.pages} PAGES</span>
                <span>{book.language.toUpperCase()}</span>
              </div>
            </motion.div>

            {/* Bottom floating page indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white border border-slate-200/60 px-3 py-1 rounded-full text-[9px] text-slate-800 font-bold select-none shadow-sm">
              Zoom: {Math.round(zoom * 100)}% | Rot: {rotation}°
            </div>
          </div>

          {/* OCR Zoom & Rotate controls */}
          <div className="flex gap-2.5 mt-3 justify-center">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-600 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-600 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRotate}
              title="Rotate Page"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-600 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Book metadata content details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-800 line-clamp-1">{book.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Study Resource Context</p>
              </div>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${isCompleted
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                    : "bg-purple-50 border-purple-100 text-purple-600"
                  }`}
              >
                OCR: {book.ocrStatus.toUpperCase()}
              </span>
            </div>

            {/* Grid metrics list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4.5 mt-5">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Languages className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">LANGUAGE</span>
                </div>
                <p className="text-xs font-black text-slate-800">{book.language}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">CONCEPTS</span>
                </div>
                <p className="text-xs font-black text-slate-800">
                  {isCompleted ? `${book.conceptCount} Extracted` : "Analyzing..."}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">EST. STUDY TIME</span>
                </div>
                <p className="text-xs font-black text-slate-800">{book.readingTime}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">CONFIDENCE</span>
                </div>
                <p className="text-xs font-black text-emerald-600">
                  {isCompleted ? `${book.confidence}% Accuracy` : "Pending"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Gauge className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">PAGES COUNT</span>
                </div>
                <p className="text-xs font-black text-slate-800">{book.pages} Pages</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">AI STATUS</span>
                </div>
                <p className="text-xs font-black text-purple-700 truncate">{book.aiStatus}</p>
              </div>
            </div>
          </div>

          {/* Chapters listing */}
          {book.chapters.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4.5">
              <h5 className="text-xs font-black text-gray-700 mb-2.5">Extracted Chapters</h5>
              <div className="flex flex-wrap gap-2">
                {book.chapters.map((ch, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-150 px-3 py-1 rounded-xl"
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

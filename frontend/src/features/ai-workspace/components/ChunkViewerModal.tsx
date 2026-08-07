"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Volume2,
  VolumeX,
  Database,
  Sparkles,
  ListFilter
} from "lucide-react";
import { useToast } from "@/lib/ToastContext";

interface Chunk {
  index: number;
  content: string;
  page_number?: number;
  chapter?: string;
  score?: number;
}

interface ChunkViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  chunks: Chunk[];
  totalPages?: number;
}

export function ChunkViewerModal({
  isOpen,
  onClose,
  documentTitle,
  chunks,
  totalPages = 120,
}: ChunkViewerModalProps) {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [selectedChunkIndex, setSelectedChunkIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chunks" | "reader">("reader");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const filteredChunks = chunks.filter(
    (c) =>
      c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.chapter && c.chapter.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeChunk = filteredChunks[selectedChunkIndex] || chunks[0] || {
    index: 1,
    content: "No chunk content available.",
    page_number: 1,
    chapter: "Introduction",
    score: 0.95,
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast("Copied vector chunk to clipboard.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast("Text-to-speech is not supported in this browser.", "info");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeChunk.content);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-950/70 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className={`w-full bg-white border border-purple-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 transition-all ${
            isFullscreen ? "h-full max-w-full rounded-none" : "max-w-6xl h-[90vh] lg:h-[85vh]"
          }`}
        >
          {/* Reader Top Header Bar */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-white border-b border-purple-100 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-650 text-white flex items-center justify-center shadow-md shadow-purple-100 shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-slate-800 truncate">{documentTitle}</h3>
                <p className="text-[10px] text-purple-700 font-black flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                    <Database className="w-3 h-3 text-purple-600" /> Vector Chunks ({chunks.length})
                  </span>
                  <span className="hidden sm:inline">· {totalPages} Pages</span>
                </p>
              </div>
            </div>

            {/* Viewport Control Tools */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-2xl text-xs font-bold text-slate-700">
                <button
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                  className="hover:text-purple-600 transition-colors cursor-pointer p-0.5"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="min-w-[44px] text-center font-black">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
                  className="hover:text-purple-600 transition-colors cursor-pointer p-0.5"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="hover:text-purple-600 transition-colors cursor-pointer p-0.5 ml-1 border-l border-slate-200 pl-1.5"
                  title="Rotate Page"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Close PDF Reader"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile View Navigation Toggle Bar (Screen < lg) */}
          <div className="flex lg:hidden bg-slate-50 p-1 border-b border-purple-100 shrink-0 select-none">
            <button
              onClick={() => setMobileTab("reader")}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mobileTab === "reader" ? "bg-white text-purple-700 shadow-xs border border-purple-200" : "text-slate-500"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document Reader</span>
            </button>

            <button
              onClick={() => setMobileTab("chunks")}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mobileTab === "chunks" ? "bg-white text-purple-700 shadow-xs border border-purple-200" : "text-slate-500"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Chunks List ({filteredChunks.length})</span>
            </button>
          </div>

          {/* Reader Body Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-purple-100 relative overflow-hidden">
            {/* Left Column: Chunks Sidebar Inspector */}
            <div
              className={`flex flex-col bg-purple-50/40 p-4 space-y-3 min-h-0 ${
                mobileTab === "chunks" ? "block" : "hidden lg:flex"
              }`}
            >
              {/* Chunk Search Bar */}
              <div className="relative shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedChunkIndex(0);
                  }}
                  placeholder="Search vector chunks..."
                  className="w-full pl-9 pr-3.5 py-2 bg-white border border-purple-100 rounded-xl text-xs text-slate-800 font-semibold outline-none focus:border-purple-400 transition-all shadow-2xs"
                />
              </div>

              {/* Chunks Navigation List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredChunks.map((c, idx) => {
                  const isSelected = idx === selectedChunkIndex;
                  return (
                    <div
                      key={c.index}
                      onClick={() => {
                        setSelectedChunkIndex(idx);
                        setMobileTab("reader");
                      }}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white border-purple-400 ring-2 ring-purple-100 text-purple-900 shadow-md shadow-purple-50"
                          : "bg-white/80 border-slate-200/80 text-slate-700 hover:bg-white hover:border-purple-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                          Chunk #{c.index + 1}
                        </span>
                        {c.score && (
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {Math.round(c.score * 100)}% match
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold line-clamp-2 leading-relaxed text-slate-700">
                        {c.content}
                      </p>
                      {c.page_number && (
                        <p className="text-[9px] text-slate-400 font-bold mt-1">
                          Page {c.page_number} {c.chapter ? `· ${c.chapter}` : ""}
                        </p>
                      )}
                    </div>
                  );
                })}

                {filteredChunks.length === 0 && (
                  <div className="py-12 text-center text-xs font-bold text-slate-400">
                    No matching vector chunks found.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: High-Fidelity PDF Document Page Reader */}
            <div
              className={`flex flex-col bg-slate-50/60 p-4 sm:p-6 min-h-0 overflow-y-auto relative items-center justify-start ${
                mobileTab === "reader" ? "flex" : "hidden lg:flex"
              }`}
            >
              {/* Paper Reader Container */}
              <motion.div
                animate={{ scale: zoom, rotate: rotation }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
                className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-xl space-y-5 relative border border-slate-200/80 my-auto"
              >
                {/* PDF Page Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="font-black text-purple-900 uppercase tracking-wide text-[11px]">
                      ExamForge Viewport
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-bold text-slate-500 text-[10px] sm:text-[11px]">
                    <span>Page {activeChunk.page_number || selectedChunkIndex + 1} of {totalPages}</span>
                    <button
                      onClick={() => handleCopy(activeChunk.content)}
                      className="hover:text-purple-600 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copy Chunk Text"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      onClick={toggleSpeak}
                      className={`hover:text-purple-600 transition-colors flex items-center gap-1 cursor-pointer ${
                        isSpeaking ? "text-purple-600 animate-pulse font-black" : ""
                      }`}
                      title="Read aloud"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isSpeaking ? "Stop" : "Listen"}</span>
                    </button>
                  </div>
                </div>

                {/* Chapter Banner */}
                {activeChunk.chapter && (
                  <div className="bg-purple-50 border border-purple-100 p-2.5 rounded-xl text-xs font-black text-purple-800 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">Chapter: {activeChunk.chapter}</span>
                  </div>
                )}

                {/* Main Text Content */}
                <div className="text-xs sm:text-sm font-serif leading-relaxed text-slate-800 whitespace-pre-wrap selection:bg-purple-100">
                  {activeChunk.content}
                </div>

                {/* Footer Metadata */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-sans font-bold">
                  <span>Chunk #{activeChunk.index + 1} · Vector DB Verified</span>
                  <span>Page {activeChunk.page_number || selectedChunkIndex + 1}</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Reader Footer Controls Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-t border-purple-100 shrink-0 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <button
                disabled={selectedChunkIndex <= 0}
                onClick={() => setSelectedChunkIndex((i) => Math.max(0, i - 1))}
                className="px-3 py-1.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 disabled:opacity-40 text-slate-700 hover:text-purple-700 font-black rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                disabled={selectedChunkIndex >= filteredChunks.length - 1}
                onClick={() => setSelectedChunkIndex((i) => Math.min(filteredChunks.length - 1, i + 1))}
                className="px-3 py-1.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 disabled:opacity-40 text-slate-700 hover:text-purple-700 font-black rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <span className="font-black text-slate-700 text-[11px]">
              Chunk {selectedChunkIndex + 1} of {filteredChunks.length}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

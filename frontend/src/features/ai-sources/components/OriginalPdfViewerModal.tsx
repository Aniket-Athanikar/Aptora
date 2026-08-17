import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Download,
  ExternalLink,
  Sparkles,
  Search,
  BookOpen,
  Loader2,
  Maximize2,
  Copy,
  Check,
  Eye,
  Layers,
  Trash2,
} from "lucide-react";
import { LibraryBookItem, backendService } from "@/services/backend.service";
import { useRouter } from "next/navigation";

interface OriginalPdfViewerModalProps {
  book: LibraryBookItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSelect?: (book: LibraryBookItem) => void;
  onDelete?: (bookId: number) => void;
}

export function OriginalPdfViewerModal({
  book,
  isOpen,
  onClose,
  onToggleSelect,
  onDelete,
}: OriginalPdfViewerModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"pdf" | "chunks">("pdf");
  const [chunks, setChunks] = useState<Array<{ index: number; content: string }>>([]);
  const [chunkLoading, setChunkLoading] = useState(false);
  const [chunkSearch, setChunkSearch] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (book && isOpen) {
      setChunkLoading(true);
      backendService.documents
        .preview(book.id)
        .then((res) => {
          setChunks(res.chunks || []);
        })
        .catch((err) => {
          console.error("Failed to load PDF text chunks:", err);
          setChunks([]);
        })
        .finally(() => setChunkLoading(false));
    }
  }, [book, isOpen]);

  if (!isOpen || !book || !mounted) return null;

  const pdfUrl = backendService.documents.getPdfUrl(book.id);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const filteredChunks = chunks.filter((c) =>
    c.content.toLowerCase().includes(chunkSearch.trim().toLowerCase())
  );

  const handleCopyChunk = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = book.original_filename || `${book.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Direct download failed:", err);
    }
  };

  const modalContent = (
    <AnimatePresence>
      <div
        className={`fixed inset-0 z-[999999] flex items-center justify-center transition-all duration-300 ${
          isFullScreen ? "p-0" : "p-3 sm:p-5 lg:p-8"
        }`}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`relative w-full bg-white shadow-2xl flex flex-col overflow-hidden z-10 transition-all duration-300 ${
            isFullScreen
              ? "h-full w-full max-w-none rounded-none"
              : "w-full max-w-5xl h-[88vh] rounded-3xl border border-slate-200"
          }`}
        >
          {/* Top Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 border-b border-slate-150 bg-gradient-to-r from-emerald-50/40 via-amber-50/30 to-purple-50/20">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center border border-emerald-500 shadow-sm shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-slate-900 truncate tracking-tight">
                    {book.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-emerald-100/90 text-emerald-800 border border-emerald-200">
                    PDF Document
                  </span>
                  {book.subject && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {book.subject}
                    </span>
                  )}
                  {book.is_selected && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                      Active in AI Study
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{book.original_filename}</span>
                  {(book.total_pages ?? 0) > 0 && (
                    <>
                      <span>•</span>
                      <span>{book.total_pages} Pages</span>
                    </>
                  )}
                  {book.file_size > 0 && (
                    <>
                      <span>•</span>
                      <span className="font-mono">{formatFileSize(book.file_size)}</span>
                    </>
                  )}
                  {chunks.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">{chunks.length} Extracted Chunks</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tab Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-black">
                <button
                  onClick={() => setActiveTab("pdf")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeTab === "pdf"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Original PDF</span>
                </button>

                <button
                  onClick={() => setActiveTab("chunks")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeTab === "chunks"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Text Chunks ({chunks.length})</span>
                </button>
              </div>

              {/* Fullscreen View Toggle */}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="h-10 px-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-black text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title={isFullScreen ? "Exit Fullscreen" : "Fullscreen View"}
              >
                <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">{isFullScreen ? "Exit Fullscreen" : "Fullscreen"}</span>
              </button>

              {/* Direct Download File Button */}
              <button
                onClick={handleDownloadPdf}
                className="h-10 px-3.5 rounded-2xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 font-black text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Directly download original PDF file to your system"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>

              {/* Open in AI Study Chat */}
              <button
                onClick={() => router.push(`/dashboard/ai?sourceId=${book.id}`)}
                className="h-10 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs transition-all duration-300 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in AI Study</span>
              </button>

              {/* Permanent Delete Button */}
              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(book.id);
                    onClose();
                  }}
                  className="h-10 px-3.5 rounded-2xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 font-black text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Permanently Delete Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}

              {/* Close Modal */}
              <button
                onClick={onClose}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Viewer Body */}
          <div className="flex-1 bg-slate-100 overflow-hidden relative flex flex-col">
            {activeTab === "pdf" ? (
              <div className="w-full h-full flex flex-col">
                {/* Secondary Viewer Bar */}
                <div className="px-4 py-2 bg-slate-200/80 border-b border-slate-300 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Viewing Original PDF: {book.title}</span>
                  </div>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-extrabold hover:underline"
                  >
                    <span>Open PDF in New Window</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <iframe
                  src={`${pdfUrl}#toolbar=1&navpanes=1&view=FitH`}
                  className="w-full h-full border-0 bg-white"
                  title={book.title}
                />
              </div>
            ) : (
              <div className="w-full h-full p-4 sm:p-6 overflow-y-auto flex flex-col space-y-4">
                {/* Chunk Search Bar */}
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={chunkSearch}
                    onChange={(e) => setChunkSearch(e.target.value)}
                    placeholder="Search extracted text chunks..."
                    className="w-full h-10 pl-10 pr-4 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                  {chunkSearch && (
                    <button
                      onClick={() => setChunkSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Chunks List */}
                {chunkLoading ? (
                  <div className="py-20 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-500">Loading document text chunks...</p>
                  </div>
                ) : filteredChunks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredChunks.map((chunk) => (
                      <div
                        key={chunk.index}
                        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-xs hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            Chunk #{chunk.index + 1}
                          </span>
                          <button
                            onClick={() => handleCopyChunk(chunk.content, chunk.index)}
                            className="flex items-center gap-1 text-[11px] font-extrabold text-slate-500 hover:text-emerald-700 cursor-pointer"
                          >
                            {copiedIndex === chunk.index ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto pr-1">
                          {chunk.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 text-xs font-bold">
                    No matching text chunks found.
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

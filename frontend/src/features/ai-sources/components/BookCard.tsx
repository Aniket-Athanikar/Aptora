"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, Loader2, Sparkles, AlertCircle, FileText, ExternalLink, X } from "lucide-react";
import { LibraryBookItem } from "@/services/backend.service";

interface BookCardProps {
  book: LibraryBookItem;
  onToggleSelect: (book: LibraryBookItem) => void;
  onOpenDetails: (book: LibraryBookItem) => void;
  onViewPdf?: (book: LibraryBookItem) => void;
  isPending?: boolean;
}

export function BookCard({
  book,
  onToggleSelect,
  onOpenDetails,
  onViewPdf,
  isPending = false,
}: BookCardProps) {
  const router = useRouter();
  const isCompleted = book.status.toUpperCase() === "COMPLETED" || book.ai_ready;
  const isProcessing = book.status.toUpperCase() === "PROCESSING" || book.status.toUpperCase() === "UPLOADING";
  const isFailed = book.status.toUpperCase() === "FAILED";

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div
      onClick={() => onOpenDetails(book)}
      className={`group relative flex flex-col justify-between rounded-3xl border p-5 transition-all duration-300 cursor-pointer bg-white ${
        book.is_selected
          ? "border-emerald-300/80 bg-gradient-to-b from-emerald-50/40 to-white shadow-md shadow-emerald-500/5 ring-1 ring-emerald-300/40"
          : "border-slate-150 hover:border-indigo-200/80 hover:shadow-lg hover:shadow-indigo-500/5"
      }`}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
              book.is_selected
                ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                : "bg-indigo-50/70 text-[#6D4AFF] border-indigo-100/60 group-hover:scale-105 group-hover:bg-[#6D4AFF] group-hover:text-white"
            }`}
          >
            <BookOpen className="w-5.5 h-5.5" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {onViewPdf && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewPdf(book);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-colors"
                title="View original PDF document"
              >
                <FileText className="w-3 h-3 text-emerald-600" />
                <span>View PDF</span>
              </button>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI Ready
              </span>
            )}
            {isProcessing && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60">
                <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                Processing
              </span>
            )}
            {isFailed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/60">
                <AlertCircle className="w-3 h-3 text-rose-500" />
                Failed
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-black text-slate-900 line-clamp-2 tracking-tight group-hover:text-emerald-700 transition-colors leading-snug">
          {book.title}
        </h3>

        {/* Subtitle / Subject & Exam badge */}
        <p className="text-xs font-extrabold text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
          {book.exam && <span className="text-emerald-700 font-black">{book.exam}</span>}
          {book.exam && book.subject && <span>•</span>}
          {book.subject && <span>{book.subject}</span>}
        </p>

        {/* Info stats */}
        <div className="mt-4 pt-3.5 border-t border-slate-100/80 flex items-center justify-between text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <span>{book.total_pages ? `${book.total_pages} pages` : "Official Book"}</span>
            {book.chunks_count > 0 && (
              <>
                <span>•</span>
                <span>{book.chunks_count} blocks</span>
              </>
            )}
          </div>
          {book.file_size > 0 && <span className="text-[11px] text-slate-400 font-mono">{formatFileSize(book.file_size)}</span>}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mt-5" onClick={(e) => e.stopPropagation()}>
        {book.is_selected ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/dashboard/ai?sourceId=${book.id}`)}
              className="flex-1 h-10 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer active:scale-98"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in AI Study</span>
            </button>
            <button
              onClick={() => onToggleSelect(book)}
              disabled={isPending}
              className="h-10 px-3 rounded-2xl bg-amber-100/80 hover:bg-rose-600 text-amber-900 hover:text-white font-black text-xs transition-all duration-300 flex items-center justify-center border border-amber-200 hover:border-rose-600 cursor-pointer"
              title="Remove from AI Study"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <button
            onClick={() => onToggleSelect(book)}
            disabled={!isCompleted || isPending}
            className={`w-full h-10 px-4 rounded-2xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              isCompleted
                ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm hover:shadow-md active:scale-98"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60"
            }`}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : isCompleted ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span className="tracking-wide">Add to AI Study</span>
              </>
            ) : isProcessing ? (
              <span>Processing Book...</span>
            ) : (
              <span>Not Ready</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

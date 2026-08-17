"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Check, Sparkles, FileText, Calendar, Layers, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { LibraryBookItem } from "@/services/backend.service";
import { useRouter } from "next/navigation";

interface BookDrawerProps {
  book: LibraryBookItem | null;
  onClose: () => void;
  onToggleSelect: (book: LibraryBookItem) => void;
  onViewPdf?: (book: LibraryBookItem) => void;
  onDelete?: (bookId: number) => void;
  isPending?: boolean;
}

export function BookDrawer({
  book,
  onClose,
  onToggleSelect,
  onViewPdf,
  onDelete,
  isPending = false,
}: BookDrawerProps) {
  const router = useRouter();

  if (!book) return null;

  const isCompleted = book.status.toUpperCase() === "COMPLETED" || book.ai_ready;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* Slide-over Content */}
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="relative w-full max-w-md h-full bg-white border-l border-slate-200 flex flex-col p-6 sm:p-7 shadow-2xl z-10 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-150">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6D4AFF] flex items-center justify-center border border-indigo-100">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                Resource Details
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Book Hero */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● AI Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                  ● {book.status}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {book.title}
            </h2>

            {book.description && (
              <p className="mt-3 text-sm text-slate-600 font-medium leading-relaxed">
                {book.description}
              </p>
            )}
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-3.5 mt-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span className="text-[11px] font-black uppercase tracking-wider">Pages</span>
              </div>
              <p className="text-lg font-black text-slate-800">
                {book.total_pages || "N/A"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Layers className="w-4 h-4 text-purple-500" />
                <span className="text-[11px] font-black uppercase tracking-wider">Knowledge Blocks</span>
              </div>
              <p className="text-lg font-black text-slate-800">
                {book.chunks_count || 0}
              </p>
            </div>
          </div>

          {/* Details List */}
          <div className="mt-6 space-y-3.5 text-xs font-semibold text-slate-600">
            {book.subject && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Subject</span>
                <span className="font-black text-slate-800">{book.subject}</span>
              </div>
            )}

            {book.exam && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Target Exam</span>
                <span className="font-black text-indigo-600">{book.exam}</span>
              </div>
            )}

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Original File</span>
              <span className="font-mono text-slate-700 truncate max-w-[200px]" title={book.original_filename}>
                {book.original_filename}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Added Date</span>
              <span className="font-bold text-slate-700">
                {new Date(book.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-6 border-t border-slate-150 space-y-3">
            {book.is_selected ? (
              <button
                onClick={() => onToggleSelect(book)}
                disabled={isPending}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-rose-600 hover:to-red-600 text-white font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4.5 h-4.5" />
                    <span>✓ In AI Study (Click to Remove)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => onToggleSelect(book)}
                disabled={!isCompleted || isPending}
                className={`w-full h-12 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  isCompleted
                    ? "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black shadow-md active:scale-98"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                }`}
              >
                {isPending ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-950" />
                    <span>Add to AI Study</span>
                  </>
                )}
              </button>
            )}

            {onViewPdf && (
              <button
                onClick={() => onViewPdf(book)}
                className="w-full h-12 rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>View Original PDF</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(book.id)}
                className="w-full h-12 rounded-2xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </button>
            )}

            <button
              onClick={() => router.push(`/dashboard/ai?sourceId=${book.id}`)}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-98"
            >
              <span>Open in AI Study</span>
              <ExternalLink className="w-4 h-4 text-white" />
            </button>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
}

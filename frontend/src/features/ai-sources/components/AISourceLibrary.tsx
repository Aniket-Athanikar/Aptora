"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Sparkles,
  Filter,
  X,
  ExternalLink,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { backendService, LibraryBookItem, AiStudySourceItem } from "@/services/backend.service";
import { BookCard } from "./BookCard";
import { BookDrawer } from "./BookDrawer";
import { OriginalPdfViewerModal } from "./OriginalPdfViewerModal";

export function AISourceLibrary() {
  const router = useRouter();

  const [books, setBooks] = useState<LibraryBookItem[]>([]);
  const [selectedSources, setSelectedSources] = useState<AiStudySourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [onlySelectedFilter, setOnlySelectedFilter] = useState(false);
  const [pendingResourceId, setPendingResourceId] = useState<number | null>(null);

  // Selected book for Drawer & PDF Viewer Modal
  const [activeDrawerBook, setActiveDrawerBook] = useState<LibraryBookItem | null>(null);
  const [pdfViewerBook, setPdfViewerBook] = useState<LibraryBookItem | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksRes, sourcesRes] = await Promise.all([
        backendService.sources.getBooks({ limit: 100 }),
        backendService.sources.getSelectedSources(),
      ]);

      setBooks(booksRes.items || []);
      setSelectedSources(sourcesRes || []);
    } catch (err: any) {
      console.error("Failed to load library data:", err);
      setError(err?.message || "Failed to load AI Source Library books. Please check backend service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived subjects and exams list for filters
  const availableSubjects = useMemo(() => {
    const map = new Map<number, string>();
    books.forEach((b) => {
      if (b.subject_id && b.subject) {
        map.set(b.subject_id, b.subject);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [books]);

  const availableExams = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.exam) set.add(b.exam);
    });
    return Array.from(set);
  }, [books]);

  // Handle source toggle (Add/Remove) with Optimistic UI & Rollback
  const handleToggleSelect = async (book: LibraryBookItem) => {
    if (pendingResourceId) return; // Prevent double clicks
    setPendingResourceId(book.id);

    const isCurrentlySelected = book.is_selected;

    // 1. Optimistic UI update
    setBooks((prev) =>
      prev.map((b) => (b.id === book.id ? { ...b, is_selected: !isCurrentlySelected } : b))
    );

    if (activeDrawerBook && activeDrawerBook.id === book.id) {
      setActiveDrawerBook((prev) => (prev ? { ...prev, is_selected: !isCurrentlySelected } : null));
    }

    try {
      if (isCurrentlySelected) {
        // Remove source
        await backendService.sources.removeSource(book.id);
        setSelectedSources((prev) => prev.filter((s) => s.resource_id !== book.id));
      } else {
        // Select source
        const newSource = await backendService.sources.selectSource(book.id);
        setSelectedSources((prev) => [newSource, ...prev.filter((s) => s.resource_id !== book.id)]);
      }
    } catch (err: any) {
      console.error("Source toggle failed, rolling back:", err);
      // Rollback optimistic update
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, is_selected: isCurrentlySelected } : b))
      );
      if (activeDrawerBook && activeDrawerBook.id === book.id) {
        setActiveDrawerBook((prev) => (prev ? { ...prev, is_selected: isCurrentlySelected } : null));
      }
      alert(err?.message || "Couldn't update this source. Please try again.");
    } finally {
      setPendingResourceId(null);
    }
  };

  // Filtered books list
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesTitle = b.title.toLowerCase().includes(term);
        const matchesSubject = (b.subject || "").toLowerCase().includes(term);
        const matchesExam = (b.exam || "").toLowerCase().includes(term);
        const matchesFile = b.original_filename.toLowerCase().includes(term);
        if (!matchesTitle && !matchesSubject && !matchesExam && !matchesFile) return false;
      }

      // Subject filter
      if (selectedSubjectId && b.subject_id !== selectedSubjectId) return false;

      // Exam filter
      if (selectedExam && b.exam !== selectedExam) return false;

      // Selected only filter
      if (onlySelectedFilter && !b.is_selected) return false;

      return true;
    });
  }, [books, searchTerm, selectedSubjectId, selectedExam, onlySelectedFilter]);

  const selectedBooksList = useMemo(() => {
    return books.filter((b) => b.is_selected);
  }, [books]);

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-16 px-1 sm:px-2">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-purple-500/15 p-6 sm:p-8 text-slate-900 border border-amber-200/60 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300/60 text-[11px] font-black uppercase tracking-widest shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              AI Source Scope
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              AI Source Library
            </h1>
            <p className="text-sm sm:text-base text-slate-700 font-medium max-w-xl">
              Choose the official and exam books AI Study should use. Selected resources ground your AI responses.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/ai")}
            className="self-start md:self-center h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-emerald-600/25 active:scale-98 cursor-pointer shrink-0"
          >
            <span>Open AI Study</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Active Sources Panel */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 font-black text-xs">
              {selectedBooksList.length}
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Active AI Study Sources
              </h2>
              <p className="text-xs text-slate-400 font-semibold">
                {selectedBooksList.length === 0
                  ? "No sources selected yet. Select books below to restrict AI Study retrieval."
                  : `${selectedBooksList.length} book${selectedBooksList.length > 1 ? "s" : ""} active in your AI Study scope.`}
              </p>
            </div>
          </div>
        </div>

        {selectedBooksList.length > 0 && (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {selectedBooksList.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50/80 border border-amber-200 text-slate-800 text-xs font-black shrink-0 transition-all hover:bg-amber-100/70"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span className="max-w-[180px] truncate">{b.title}</span>
                <button
                  onClick={() => handleToggleSelect(b)}
                  disabled={pendingResourceId === b.id}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                  title="Remove from AI Study"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search books, subjects, exam..."
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-slate-200 text-xs font-extrabold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Selected filter toggle */}
            <button
              onClick={() => setOnlySelectedFilter((v) => !v)}
              className={`h-12 px-4 rounded-2xl border text-xs font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
                onlySelectedFilter
                  ? "bg-amber-500 text-white border-amber-400 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Selected ({selectedBooksList.length})</span>
            </button>

            {/* Exam selector if available */}
            {availableExams.length > 0 && (
              <select
                value={selectedExam || ""}
                onChange={(e) => setSelectedExam(e.target.value || null)}
                className="h-12 px-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-extrabold text-slate-700 focus:outline-none focus:border-[#6D4AFF] cursor-pointer shadow-xs"
              >
                <option value="">All Exams</option>
                {availableExams.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            )}

            {/* Refresh button */}
            <button
              onClick={fetchData}
              disabled={loading}
              className="h-12 w-12 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-[#6D4AFF] hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
              title="Refresh library"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Subject Filter Chips */}
        {availableSubjects.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedSubjectId(null)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border ${
                selectedSubjectId === null
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              All Subjects
            </button>
            {availableSubjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id === selectedSubjectId ? null : sub.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border ${
                  selectedSubjectId === sub.id
                    ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white border-amber-400 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-[11px] uppercase tracking-wider hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Grid / Cards section */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-64 rounded-3xl bg-slate-100/70 border border-slate-200/60 p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-200" />
                <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
                <div className="h-3 bg-slate-200 rounded-lg w-1/2" />
              </div>
              <div className="h-10 bg-slate-200 rounded-2xl w-full" />
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#6D4AFF] flex items-center justify-center mx-auto border border-indigo-100">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-800">No books found</h3>
          <p className="text-xs font-semibold text-slate-400 max-w-md mx-auto">
            {searchTerm || selectedSubjectId || selectedExam || onlySelectedFilter
              ? "Try adjusting your search terms or filters to find your books."
              : "Your AI Source Library is currently empty. Upload official resources to get started."}
          </p>
          {(searchTerm || selectedSubjectId || selectedExam || onlySelectedFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedSubjectId(null);
                setSelectedExam(null);
                setOnlySelectedFilter(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-black transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onToggleSelect={handleToggleSelect}
              onOpenDetails={setActiveDrawerBook}
              onViewPdf={setPdfViewerBook}
              isPending={pendingResourceId === book.id}
            />
          ))}
        </div>
      )}

      {/* Drawer */}
      <BookDrawer
        book={activeDrawerBook}
        onClose={() => setActiveDrawerBook(null)}
        onToggleSelect={handleToggleSelect}
        onViewPdf={setPdfViewerBook}
        isPending={activeDrawerBook ? pendingResourceId === activeDrawerBook.id : false}
      />

      {/* Original PDF Viewer Modal */}
      <OriginalPdfViewerModal
        book={pdfViewerBook}
        isOpen={Boolean(pdfViewerBook)}
        onClose={() => setPdfViewerBook(null)}
        onToggleSelect={handleToggleSelect}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Trash2,
  Search,
  RefreshCw,
  Eye,
  FolderOpen,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  AlertCircle,
  Download
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard";
import { backendService, Resource } from "@/services/backend.service";
import { useToast } from "@/lib/ToastContext";
import { renderMarkdown } from "@/features/ai-workspace/components/ChatMessage";


export default function AiNotesPage() {
  const { toast } = useToast();

  // States
  const [notes, setNotes] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter & Sort & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Preview Modal
  const [previewNote, setPreviewNote] = useState<Resource | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyCode = useCallback(
    (code: string, idx: number) => {
      navigator.clipboard.writeText(code);
      setCopiedIdx(idx);
      toast("Copied code to clipboard", "info");
      setTimeout(() => setCopiedIdx(null), 1800);
    },
    [toast]
  );

  const downloadAsPdf = useCallback(async (resourceId: number, title: string) => {
    try {
      toast("Generating PDF...", "info");
      const token = localStorage.getItem("access_token");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}/documents/${resourceId}/download-pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "PDF generation failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Aptora_Note_${title.replace(/\s+/g, "_").slice(0, 50)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast("PDF downloaded successfully!", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to download PDF.", "error");
    }
  }, [toast]);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get the active workspace
      const currentWorkspace = await backendService.workspace.current();
      if (!currentWorkspace) {
        throw new Error("No active workspace found.");
      }

      // Fetch documents grouped by subject
      const docs = await backendService.workspace.documents(currentWorkspace.id);

      // Collect all notes from all subjects
      const collectedNotes = docs.flatMap((sub) => sub.notes || []);
      setNotes(collectedNotes);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load AI study notes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleDelete = async (noteId: number) => {
    if (!confirm("Are you sure you want to delete this study note?")) return;
    try {
      await backendService.documents.remove(noteId);
      toast("Study note successfully removed.", "success");
      loadNotes();
    } catch (err: any) {
      toast(err.message || "Failed to delete note.", "error");
    }
  };

  const handleOpenPreview = async (note: Resource) => {
    setPreviewNote(note);
    setLoadingPreview(true);
    setPreviewContent("");
    try {
      const res = await backendService.documents.preview(note.id);
      const text = res.chunks
        .map((c) => c.content)
        .join("\n\n");
      setPreviewContent(text || "No content found in this note.");
    } catch (err: any) {
      console.error(err);
      toast("Could not load note content.", "error");
      setPreviewNote(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (n.title.toLowerCase().includes(q) || (n.description && n.description.toLowerCase().includes(q)));
  });

  // Sort notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortBy === "largest") {
      return (b.file_size || 0) - (a.file_size || 0);
    } else {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Paginate notes
  const paginatedNotes = sortedNotes.slice((page - 1) * limit, page * limit);

  return (
    <DashboardLayout activeTab="ai-notes">
      <div className="max-w-6xl mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-emerald-600" />
              AI Study Notes
            </h1>
            <p className="text-xs text-slate-500 font-bold mt-1">
              Read and review study notes generated from your AI conversations and study sessions
            </p>
          </div>
        </div>

        {/* SEARCH, FILTERS & SORT */}
        <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-3xs">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="flex w-full md:w-auto items-center gap-2">
            <span className="text-xs text-slate-400 font-black shrink-0">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-40 px-3 py-2 text-xs font-black bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="largest">Largest Size</option>
            </select>
          </div>

          <button
            onClick={loadNotes}
            disabled={loading}
            className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl text-slate-600 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-slate-50 border border-slate-150 rounded-2xl h-36" />
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-sm font-black text-rose-900">Failed to load notes</h3>
            <p className="text-xs text-rose-700 font-bold">{error}</p>
            <button
              onClick={loadNotes}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-xs font-black text-white rounded-xl transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && notes.length === 0 && (
          <div className="p-12 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/30 space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-3xs">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800">No study notes found</h3>
              <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
                Save an active AI conversation session using the "Save as AI Note" option to build your notes repository.
              </p>
            </div>
          </div>
        )}

        {/* NOTES GRID */}
        {!loading && !error && notes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedNotes.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-3xs hover:border-emerald-200 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-xs text-slate-800 truncate" title={item.title}>
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          Study Note
                        </p>
                      </div>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-[11px] text-slate-500 font-medium mt-3.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-3.5 space-y-1 text-[10px] text-slate-450 font-bold flex flex-wrap gap-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <div className="text-slate-400">
                      Size: <span className="text-slate-650 font-extrabold">{(item.file_size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3 gap-2">
                  <button
                    onClick={() => handleOpenPreview(item)}
                    className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[10px] font-black text-emerald-700 border border-emerald-200 rounded-lg cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Read Note
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-rose-50 text-slate-405 hover:text-rose-600 rounded-lg border border-transparent hover:border-rose-200 transition cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && !error && notes.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-[10px] text-slate-500 font-bold">
              Showing page {page}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={sortedNotes.length <= page * limit}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* PREVIEW NOTE MODAL */}
      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-800 truncate max-w-md">{previewNote.title}</h3>
              </div>
              <button
                onClick={() => setPreviewNote(null)}
                className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 prose prose-slate max-w-none text-xs leading-relaxed text-slate-800">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                  <span className="text-[10px] text-slate-405 font-black uppercase">Loading note content...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {renderMarkdown(previewContent, copiedIdx, copyCode)}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
              <button
                onClick={() => {
                  if (previewNote) {
                    downloadAsPdf(previewNote.id, previewNote.title);
                  }
                }}
                disabled={!previewContent}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-emerald-600/10 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => setPreviewNote(null)}
                className="px-4 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-100 text-xs font-black text-slate-700 rounded-xl transition cursor-pointer bg-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Download, 
  Trash2, 
  Search, 
  RefreshCw, 
  FileText, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  FolderOpen,
  ArrowUpDown,
  Eye
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard";
import { backendService, ChatExport } from "@/services/backend.service";
import { useToast } from "@/lib/ToastContext";

export default function DownloadsPage() {
  const { toast } = useToast();
  
  // States
  const [exports, setExports] = useState<ChatExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter & Sort & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadExports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await backendService.ai.listExports({
        q: debouncedQuery || undefined,
        sort_by: sortBy,
        limit,
        offset: (page - 1) * limit
      });
      setExports(res);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load downloads library.");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, sortBy, page]);

  useEffect(() => {
    loadExports();
  }, [loadExports]);

  const handleDelete = async (exportId: string) => {
    if (!confirm("Are you sure you want to delete this PDF export? The original chat will not be deleted.")) return;
    try {
      await backendService.ai.deleteExport(exportId);
      toast("PDF file and metadata successfully cleared.", "success");
      loadExports();
    } catch (err: any) {
      toast(err.message || "Failed to delete export.", "error");
    }
  };

  const handleDownload = async (exportItem: ChatExport) => {
    try {
      const url = backendService.ai.getExportDownloadUrl(exportItem.id);
      const token = localStorage.getItem("access_token");
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.status === 404) {
        toast("The generated PDF file is missing on disk. Re-queueing export...", "error");
        // Re-generate automatically
        await backendService.ai.exportConversation(exportItem.conversation_id);
        toast("Regeneration queued. Check back in a few seconds.", "info");
        loadExports();
        return;
      }
      if (!response.ok) throw new Error("Secure download failed.");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = exportItem.file_name || `ExamForge_Export_${exportItem.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      toast(err.message || "Could not download document.", "error");
    }
  };

  const handlePreview = (exportItem: ChatExport) => {
    const url = backendService.ai.getExportDownloadUrl(exportItem.id);
    const token = localStorage.getItem("access_token");
    
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        if (res.status === 404) {
          toast("PDF file missing. Please regenerate.", "error");
          return null;
        }
        if (!res.ok) throw new Error();
        return res.blob();
      })
      .then(blob => {
        if (!blob) return;
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      })
      .catch(() => {
        toast("Could not load preview.", "error");
      });
  };

  const handleRegenerate = async (exportItem: ChatExport) => {
    try {
      toast("Creating a new export task...", "info");
      await backendService.ai.exportConversation(exportItem.conversation_id);
      toast("PDF generation is running in the background.", "success");
      loadExports();
    } catch (err: any) {
      toast(err.message || "Failed to restart export.", "error");
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "Processing...";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <DashboardLayout activeTab="downloads">
      <div className="max-w-6xl mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
              <Download className="w-6 h-6 text-purple-600" />
              Downloads Library
            </h1>
            <p className="text-xs text-slate-500 font-bold mt-1">
              Access and manage your generated study guides and conversation PDFs
            </p>
          </div>
        </div>

        {/* SEARCH, FILTERS & SORT */}
        <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-3xs">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search downloads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div className="flex w-full md:w-auto items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-40 px-3 py-2 text-xs font-black bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="largest">Largest Size</option>
            </select>
          </div>

          <button
            onClick={loadExports}
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
            <h3 className="text-sm font-black text-rose-900">Failed to load library</h3>
            <p className="text-xs text-rose-700 font-bold">{error}</p>
            <button
              onClick={loadExports}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-xs font-black text-white rounded-xl transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && exports.length === 0 && (
          <div className="p-12 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/30 space-y-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto border border-purple-100 shadow-3xs">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800">No downloads found</h3>
              <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
                You haven't generated any study PDF exports yet, or no exports match your filters.
              </p>
            </div>
          </div>
        )}

        {/* EXPORTS LIST */}
        {!loading && !error && exports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exports.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-3xs hover:border-purple-200 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-xs text-slate-800 truncate" title={item.file_name || "Conversation PDF"}>
                          {item.file_name || "Study Guide PDF"}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          AI Chat PDF
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : item.status === "failed"
                          ? "bg-rose-50 text-rose-700 border border-rose-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-1.5 text-[10px] text-slate-500 font-bold">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="text-slate-400">
                      Size: <span className="text-slate-600 font-extrabold">{formatSize(item.file_size)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3 gap-2">
                  <div className="flex gap-1.5">
                    {item.status === "completed" ? (
                      <>
                        <button
                          onClick={() => handlePreview(item)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-slate-700 border border-slate-200 rounded-lg cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          Preview
                        </button>
                        <button
                          onClick={() => handleDownload(item)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[10px] font-black text-purple-700 border border-purple-200 rounded-lg cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </>
                    ) : item.status === "failed" ? (
                      <button
                        onClick={() => handleRegenerate(item)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[10px] font-black text-rose-700 border border-rose-200 rounded-lg cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 animate-pulse" />
                        Re-try Export
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating...
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-transparent hover:border-rose-200 transition cursor-pointer"
                    title="Delete Export"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && !error && exports.length > 0 && (
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
                disabled={exports.length < limit}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

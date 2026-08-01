"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  BookOpen,
  FileCheck,
  Layers,
  Sparkles,
  MoreVertical,
  Bot,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  HardDrive,
  File,
} from "lucide-react";
import { backendService, Resource } from "@/services/backend.service";
import { useWorkspace } from "@/features/ai-workspace/workspaceContext";
import { useToast } from "@/lib/ToastContext";

export interface ResourceCardProps {
  resource: Resource | any;
  subjectName?: string;
  onOpen?: (resource: any) => void;
  onStudy?: (resource: any) => void;
  onDelete?: (resourceId: string | number) => void;
  onUpdate?: () => void;
}

export function ResourceCard({
  resource,
  subjectName,
  onOpen,
  onStudy,
  onDelete,
  onUpdate,
}: ResourceCardProps) {
  const { startChatWithResource, refreshResources } = useWorkspace();
  const { toast } = useToast();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(resource.title || "");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);

  const resourceType = (resource.resource_type || resource.type || "book").toLowerCase();
  const rawStatus = (resource.status || resource.vectorStatus || "READY").toUpperCase();

  // Helper for Status Badge
  const getStatusBadge = () => {
    switch (rawStatus) {
      case "UPLOADED":
      case "UPLOADING":
        return {
          label: "Uploading",
          color: "bg-blue-50 text-blue-600 border-blue-200",
          icon: Loader2,
          animate: true,
        };
      case "PROCESSING":
      case "OCR":
      case "CHUNKING":
        return {
          label: "Processing",
          color: "bg-amber-50 text-amber-600 border-amber-200",
          icon: Loader2,
          animate: true,
        };
      case "EMBEDDING":
        return {
          label: "Embedding",
          color: "bg-purple-50 text-purple-600 border-purple-200",
          icon: RefreshCw,
          animate: true,
        };
      case "COMPLETED":
      case "READY":
      case "INDEXED":
        return {
          label: "Ready",
          color: "bg-emerald-50 text-emerald-600 border-emerald-200",
          icon: CheckCircle2,
          animate: false,
        };
      case "FAILED":
      default:
        return {
          label: "Failed",
          color: "bg-rose-50 text-rose-600 border-rose-200",
          icon: AlertCircle,
          animate: false,
        };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  // File Icon Provider
  const getFileIcon = () => {
    switch (resourceType) {
      case "book":
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      case "notes":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "pyq":
        return <FileCheck className="w-5 h-5 text-rose-600" />;
      case "syllabus":
        return <Layers className="w-5 h-5 text-emerald-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-600" />;
    }
  };

  // Format File Size
  const formatFileSize = (bytes?: number | string) => {
    if (!bytes) return "Unknown size";
    if (typeof bytes === "string") return bytes;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle Rename
  const handleRenameSubmit = async () => {
    if (!newTitle.trim() || newTitle === resource.title) {
      setIsRenaming(false);
      return;
    }

    try {
      const numericId = typeof resource.id === "number" ? resource.id : parseInt(String(resource.id).replace(/\D/g, ""), 10);
      if (numericId) {
        await backendService.documents.rename(numericId, newTitle.trim());
      }
      toast("Resource renamed successfully", "success");
      setIsRenaming(false);
      if (onUpdate) onUpdate();
      if (refreshResources) refreshResources();
    } catch (err: any) {
      toast("Failed to rename resource", "error");
    }
  };

  // Handle Reprocess
  const handleReprocess = async () => {
    setIsMenuOpen(false);
    setIsReprocessing(true);
    try {
      const numericId = typeof resource.id === "number" ? resource.id : parseInt(String(resource.id).replace(/\D/g, ""), 10);
      if (numericId) {
        await backendService.documents.reprocess(numericId);
      }
      toast("Reprocessing started in background", "info");
      if (onUpdate) onUpdate();
      if (refreshResources) refreshResources();
    } catch {
      toast("Failed to trigger reprocess", "error");
    } finally {
      setIsReprocessing(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    setIsMenuOpen(false);
    if (!window.confirm(`Are you sure you want to delete "${resource.title}"?`)) return;

    setIsDeleting(true);
    try {
      const numericId = typeof resource.id === "number" ? resource.id : parseInt(String(resource.id).replace(/\D/g, ""), 10);
      if (numericId) {
        await backendService.documents.remove(numericId);
      }
      toast("Resource deleted successfully", "success");
      if (onDelete) onDelete(resource.id);
      if (refreshResources) refreshResources();
    } catch {
      toast("Failed to delete resource", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Launch Study Session
  const handleStudy = () => {
    setIsMenuOpen(false);
    if (onStudy) {
      onStudy(resource);
    } else {
      startChatWithResource(String(resource.id));
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`relative group bg-white border border-slate-200/80 hover:border-purple-300 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between ${
        isDeleting ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {getFileIcon()}
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100/60 mb-1">
                {resourceType}
              </span>
              <span className="block text-[11px] font-bold text-slate-400">
                {subjectName || resource.subject || "General"}
              </span>
            </div>
          </div>

          {/* Status Badge & Actions dropdown */}
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}
            >
              <StatusIcon className={`w-3 h-3 ${statusBadge.animate ? "animate-spin" : ""}`} />
              <span>{statusBadge.label}</span>
            </span>

            {/* Menu Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Actions Dropdown Popup */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    className="absolute right-0 top-8 z-30 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 text-xs font-bold text-slate-700"
                  >
                    <button
                      onClick={handleStudy}
                      className="w-full px-3.5 py-2 text-left hover:bg-purple-50 hover:text-[#6D4AFF] flex items-center gap-2 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5 text-[#6D4AFF]" />
                      <span>Study with AI</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (onOpen) onOpen(resource);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Open Material</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsRenaming(true);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Rename</span>
                    </button>

                    <button
                      onClick={handleReprocess}
                      disabled={isReprocessing}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isReprocessing ? "animate-spin" : ""}`} />
                      <span>Reprocess AI</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={handleDelete}
                      className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Resource Title or Inline Rename */}
        {isRenaming ? (
          <div className="my-2 space-y-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-bold border border-[#6D4AFF] rounded-xl outline-none"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleRenameSubmit}
                className="px-2.5 py-1 text-[10px] font-black bg-[#6D4AFF] text-white rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => setIsRenaming(false)}
                className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <h4
            onClick={() => onOpen && onOpen(resource)}
            className="text-sm font-black text-slate-900 leading-snug hover:text-[#6D4AFF] transition-colors cursor-pointer line-clamp-2 mb-3"
          >
            {resource.title}
          </h4>
        )}
      </div>

      {/* Footer Info Row */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-slate-400" />
            {formatFileSize(resource.file_size || resource.size)}
          </span>
          {(resource.total_pages || resource.pages) && (
            <span className="flex items-center gap-1">
              <File className="w-3 h-3 text-slate-400" />
              {resource.total_pages || resource.pages} pages
            </span>
          )}
        </div>

        {/* Study Button */}
        <button
          type="button"
          onClick={handleStudy}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 text-[#6D4AFF] font-black hover:bg-[#6D4AFF] hover:text-white transition-all shadow-xs"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Study</span>
        </button>
      </div>
    </motion.div>
  );
}

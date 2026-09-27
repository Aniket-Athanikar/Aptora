"use client";

import React, { useState, useEffect } from "react";
import { X, Check, FileText, Download, Loader2, Sparkles, AlertCircle, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { backendService, ChatExport } from "@/services/backend.service";
import { useToast } from "@/lib/ToastContext";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationTitle: string;
  messageCount: number;
  onExportSuccess?: () => void;
}

const STEPS = [
  "Preparing conversation",
  "Formatting content",
  "Generating pages",
  "Finalizing PDF"
];

export function ExportModal({
  isOpen,
  onClose,
  conversationId,
  conversationTitle,
  messageCount,
  onExportSuccess
}: ExportModalProps) {
  const { toast } = useToast();
  const [stage, setStage] = useState<"setup" | "generating" | "success" | "error">("setup");
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [includeUser, setIncludeUser] = useState(true);
  const [includeAi, setIncludeAi] = useState(true);
  const [includeCode, setIncludeCode] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [includeSources, setIncludeSources] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(false);
  const [exportRecord, setExportRecord] = useState<ChatExport | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setStage("setup");
      setCurrentStepIdx(0);
      setExportRecord(null);
      setErrorMessage("");
    }
  }, [isOpen]);

  // Simulate progress step changes during backend generation
  useEffect(() => {
    if (stage !== "generating") return;
    const interval = setInterval(() => {
      setCurrentStepIdx((idx) => {
        if (idx < STEPS.length - 1) {
          return idx + 1;
        }
        return idx;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [stage]);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setStage("generating");
    setCurrentStepIdx(0);
    setErrorMessage("");
    try {
      // Post request to backend to queue the export task
      const res = await backendService.ai.exportConversation(conversationId);
      const exportId = res.id;

      // Poll backend status
      const maxAttempts = 50;
      let attempts = 0;

      const poll = async () => {
        if (attempts >= maxAttempts) {
          throw new Error("Export timed out. Please try again.");
        }
        attempts++;

        try {
          const statusRes = await backendService.ai.getExportStatus(exportId);
          if (statusRes.status === "completed") {
            setExportRecord(statusRes);
            setStage("success");
            toast("Your study guide has been prepared.", "success");
            if (onExportSuccess) onExportSuccess();
          } else if (statusRes.status === "failed") {
            throw new Error(statusRes.error_message || "Generation failed.");
          } else {
            setTimeout(poll, 1200);
          }
        } catch (err: any) {
          console.error(err);
          setErrorMessage(err.message || "An unexpected error occurred.");
          setStage("error");
        }
      };

      setTimeout(poll, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setStage("error");
    }
  };

  const handleDownload = async () => {
    if (!exportRecord) return;
    try {
      const url = backendService.ai.getExportDownloadUrl(exportRecord.id);
      const token = localStorage.getItem("access_token");
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error("Failed to download PDF.");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = exportRecord.file_name || `Aptora_Export_${conversationTitle.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      toast(err.message || "Failed to download file.", "error");
    }
  };

  const handlePreview = () => {
    if (!exportRecord) return;
    const url = backendService.ai.getExportDownloadUrl(exportRecord.id);
    const token = localStorage.getItem("access_token");
    
    // Open in a new tab using the authenticated streaming flow if possible, 
    // or fetch and open blob url
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.blob();
      })
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      })
      .catch(() => {
        toast("Could not load preview.", "error");
      });
  };

  const formattedSize = exportRecord?.file_size
    ? (exportRecord.file_size / (1024 * 1024)).toFixed(1) + " MB"
    : "Unknown Size";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Close Button */}
        {stage !== "generating" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* SETUP SCREEN */}
        {stage === "setup" && (
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-base font-black text-slate-900">Export conversation</h3>
              <p className="text-[11px] text-slate-500 font-extrabold mt-1 truncate">
                {conversationTitle}
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                {messageCount} messages · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>

            {/* Format Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format</label>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-purple-600 bg-purple-50/50 rounded-2xl text-purple-800 text-xs font-black cursor-pointer">
                  <FileText className="w-4 h-4 text-purple-600" />
                  PDF Document
                </button>
              </div>
            </div>

            {/* Inclusions Checklist */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Include in PDF</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer select-none p-1">
                  <input type="checkbox" checked={includeUser} onChange={(e) => setIncludeUser(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                  User messages
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none p-1">
                  <input type="checkbox" checked={includeAi} onChange={(e) => setIncludeAi(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                  AI responses
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none p-1">
                  <input type="checkbox" checked={includeCode} onChange={(e) => setIncludeCode(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                  Code blocks
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none p-1">
                  <input type="checkbox" checked={includeTables} onChange={(e) => setIncludeTables(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                  Tables
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none p-1">
                  <input type="checkbox" checked={includeSources} onChange={(e) => setIncludeSources(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                  Sources / references
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none p-1">
                  <input type="checkbox" checked={includeTimestamps} onChange={(e) => setIncludeTimestamps(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                  Timestamps
                </label>
              </div>
            </div>

            {/* Styling Mode */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Design</label>
              <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-black text-purple-900">Aptora Premium Guide</span>
                </div>
                <span className="text-[9px] font-black uppercase bg-purple-600 text-white px-2 py-0.5 rounded-full">Academic</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-slate-200 hover:border-slate-300 text-xs font-black text-slate-700 hover:text-slate-900 rounded-2xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStartExport}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-xs font-black text-white rounded-2xl shadow-md transition cursor-pointer"
              >
                Generate PDF
              </button>
            </div>
          </div>
        )}

        {/* GENERATING SCREEN */}
        {stage === "generating" && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative flex items-center justify-center w-16 h-16 bg-purple-50 rounded-full border border-purple-100">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-600/10 to-indigo-600/10 rounded-full blur-xs opacity-50" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900">Compiling Export Package</h4>
              <p className="text-[11px] text-slate-500 font-extrabold">Do not close this window or refresh the page.</p>
            </div>

            {/* Steps Timeline Indicator */}
            <div className="w-full max-w-xs space-y-3.5 pt-4 text-left">
              {STEPS.map((step, idx) => {
                const isActive = idx === currentStepIdx;
                const isCompleted = idx < currentStepIdx;
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-black transition-all ${
                        isCompleted
                          ? "bg-purple-600 border-purple-600 text-white"
                          : isActive
                          ? "border-purple-600 text-purple-700 animate-pulse bg-purple-50"
                          : "border-slate-200 text-slate-400 bg-slate-50"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-black transition-all ${
                        isCompleted
                          ? "text-slate-800"
                          : isActive
                          ? "text-purple-700 font-black animate-pulse"
                          : "text-slate-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUCCESS SCREEN */}
        {stage === "success" && (
          <div className="p-6 space-y-5">
            <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center shadow-xs">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900">✓ PDF Ready</h4>
              <p className="text-[11px] text-slate-500 font-bold max-w-xs truncate leading-relaxed">
                {exportRecord?.file_name}
              </p>
              <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {formattedSize}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handlePreview}
                className="flex-1 py-3 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-xs font-black text-slate-700 hover:text-slate-900 rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                Preview
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-xs font-black text-white rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-white" />
                Download PDF
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="w-full py-2.5 text-center text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest cursor-pointer"
            >
              Close Window
            </button>
          </div>
        )}

        {/* ERROR SCREEN */}
        {stage === "error" && (
          <div className="p-6 space-y-5">
            <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 border border-rose-200 rounded-full flex items-center justify-center shadow-xs">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Export Failed</h4>
              <p className="text-xs text-rose-700 font-bold px-4 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-slate-200 hover:border-slate-300 text-xs font-black text-slate-700 hover:text-slate-900 rounded-2xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStartExport}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-xs font-black text-white rounded-2xl shadow-md transition cursor-pointer"
              >
                Retry Generation
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

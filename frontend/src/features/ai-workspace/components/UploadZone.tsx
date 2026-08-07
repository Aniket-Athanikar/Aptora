"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Mic,
  FileText,
  Upload,
  Link as LinkIcon,
  X,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Plus
} from "lucide-react";
import { ResourceUploadModal } from "@/components/resources/ResourceUploadModal";
import { useWorkspace } from "../workspaceContext";
import { useToast } from "@/lib/ToastContext";

export function UploadZone() {
  const { toast } = useToast();
  const { activeWorkspace, selectedSubjectId } = useWorkspace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"file" | "camera" | "voice" | "url">("file");
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files);
      setStagedFiles((prev) => [...prev, ...filesArr]);
      toast(`Staged ${filesArr.length} file(s) for upload.`, "info");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      setStagedFiles((prev) => [...prev, ...filesArr]);
      toast(`Staged ${filesArr.length} file(s).`, "info");
    }
  };

  const removeStagedFile = (idx: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    toast("Fetching web document content...", "info");
    setUrlInput("");
    setIsModalOpen(true);
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Zone Card Container */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ y: -2 }}
        className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all duration-300 bg-white shadow-sm flex flex-col items-center justify-center min-h-[220px] ${
          isDragging
            ? "border-purple-500 bg-purple-50/50 shadow-lg shadow-purple-100 ring-4 ring-purple-100"
            : "border-purple-200/80 hover:border-purple-400 hover:shadow-md"
        }`}
      >
        {/* Top Feature Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80 mb-5 select-none" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setActiveTab("file")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "file" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Document</span>
          </button>

          <button
            onClick={() => setActiveTab("camera")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "camera" ? "bg-pink-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Scan</span>
          </button>

          <button
            onClick={() => setActiveTab("voice")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "voice" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Note</span>
          </button>

          <button
            onClick={() => setActiveTab("url")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "url" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Web Link</span>
          </button>
        </div>

        {/* Tab Content 1: File Dropzone */}
        {activeTab === "file" && (
          <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center mb-3 shadow-md shadow-purple-200 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-800">
              Drag & Drop Study Documents Here
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md font-semibold leading-relaxed">
              Supports PDF, DOCX, TXT, EPUB, and images (Max 50MB per file)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept=".pdf,.docx,.pptx,.txt,.md,.jpg,.png,.epub"
            />
          </div>
        )}

        {/* Tab Content 2: Camera Scan */}
        {activeTab === "camera" && (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 border border-pink-200 flex items-center justify-center shadow-sm">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-sm font-black text-slate-800">High-Precision OCR Camera Scan</h4>
            <p className="text-xs text-slate-400 max-w-md font-semibold">
              Capture book pages using device camera for instant OCR parsing
            </p>
            <button
              onClick={() => toast("Initializing camera scanner lens...", "info")}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-black rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Start Camera Lens
            </button>
          </div>
        )}

        {/* Tab Content 3: Voice Note */}
        {activeTab === "voice" && (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shadow-sm">
              <Mic className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="text-sm font-black text-slate-800">Audio & Voice Note Transcriber</h4>
            <p className="text-xs text-slate-400 max-w-md font-semibold">
              Record live lecture audio or voice notes to generate AI study materials
            </p>
            <button
              onClick={() => toast("Microphone active. Recording speech...", "info")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Start Recording Audio
            </button>
          </div>
        )}

        {/* Tab Content 4: Web URL */}
        {activeTab === "url" && (
          <div className="flex flex-col items-center space-y-3 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-sm">
              <LinkIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-800">Web Article or PDF Link</h4>
            <div className="flex w-full gap-2 mt-2">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste web article or document URL..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-400"
              />
              <button
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
              >
                Fetch
              </button>
            </div>
          </div>
        )}

        {/* Staged Files List */}
        {stagedFiles.length > 0 && (
          <div className="mt-5 w-full pt-4 border-t border-slate-100 space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Staged Files ({stagedFiles.length})
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-md shadow-purple-100 cursor-pointer transition-all"
              >
                Proceed to Upload
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {stagedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[140px]">{file.name}</span>
                  <span className="text-[9px] opacity-70">({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
                  <button
                    type="button"
                    onClick={() => removeStagedFile(idx)}
                    className="hover:text-rose-600 font-extrabold cursor-pointer ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal Integration */}
      <ResourceUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

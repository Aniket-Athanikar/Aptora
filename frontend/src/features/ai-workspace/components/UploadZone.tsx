"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Mic, FileText, Upload, Sparkles } from "lucide-react";
import { ResourceUploadModal } from "@/components/resources/ResourceUploadModal";
import { useToast } from "@/lib/ToastContext";

export function UploadZone() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => setIsModalOpen(true)}
        className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[195px] shadow-md backdrop-blur-xs ${isDragging
            ? "border-purple-600 bg-purple-100/80 ring-4 ring-purple-200"
            : "border-purple-300 bg-gradient-to-br from-white via-purple-50/50 to-indigo-50/30 hover:border-purple-500 hover:bg-purple-50/70"
          }`}
      >
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 border border-purple-400 flex items-center justify-center text-white mb-3.5 shadow-lg shadow-purple-200">
          <Upload className="w-6 h-6" />
        </div>

        <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
          Upload Study Book, PDF or PYQ Notes <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
        </h4>
        <p className="text-xs text-slate-600 mt-1 max-w-sm font-extrabold leading-relaxed">
          Drag and drop study files here, or click to browse. Supports PDF, DOCX, TXT, and Images up to 25MB.
        </p>

        {/* Input shortcut tabs */}
        <div className="flex flex-wrap gap-2.5 mt-5 justify-center" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-purple-200 text-xs font-black text-purple-950 hover:bg-purple-100/80 hover:border-purple-400 transition-all shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            Upload PDF / Book
          </button>

          <button
            onClick={() => toast("Initializing High-Fidelity OCR Camera scanner...", "info")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-purple-200 text-xs font-black text-pink-950 hover:bg-pink-100/80 hover:border-pink-300 transition-all shadow-2xs cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-pink-600" />
            Camera Scan
          </button>

          <button
            onClick={() => toast("Initializing Speech-to-Text Voice Query...", "info")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-purple-200 text-xs font-black text-indigo-950 hover:bg-indigo-100/80 hover:border-indigo-300 transition-all shadow-2xs cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-indigo-600" />
            Voice Note
          </button>
        </div>
      </motion.div>

      <ResourceUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
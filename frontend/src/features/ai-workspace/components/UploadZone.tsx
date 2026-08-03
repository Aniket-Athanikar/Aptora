"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Mic, FileText, Upload } from "lucide-react";
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
        whileHover={{ y: -2 }}
        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] bg-slate-50/50 hover:bg-white ${
          isDragging
            ? "border-purple-500 bg-purple-50/40"
            : "border-purple-100 hover:border-purple-300"
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6D4AFF] mb-4 shadow-sm">
          <Upload className="w-5 h-5" />
        </div>

        <h4 className="text-sm font-black text-slate-800">
          Upload Book, PDF or Document
        </h4>
        <p className="text-xs text-slate-400 mt-1.5 max-w-sm font-semibold">
          Drag and drop study files here, or click to browse. Supports PDF, DOCX, and TXT.
        </p>

        {/* Input shortcut tabs */}
        <div className="flex flex-wrap gap-2.5 mt-5 justify-center" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-150 text-[10px] font-bold text-slate-600 hover:border-purple-300 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-purple-500" />
            Upload PDF / Document
          </button>
          
          <button
            onClick={() => toast("Simulating High-Fidelity OCR Camera scanner initialization...", "info")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-150 text-[10px] font-bold text-slate-600 hover:border-purple-300 transition-colors shadow-sm cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-pink-500" />
            Camera Scan
          </button>

          <button
            onClick={() => toast("Simulating Speech-to-Text active tutoring recording...", "info")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-150 text-[10px] font-bold text-slate-600 hover:border-purple-300 transition-colors shadow-sm cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-indigo-500" />
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


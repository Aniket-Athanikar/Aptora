"use client";

import React, { useRef, useState } from "react";
import { useWorkspace } from "../workspaceContext";
import { motion } from "framer-motion";
import { FileUp, Eye, Mic, Camera, FileText, Upload, Plus } from "lucide-react";

export function UploadZone() {
  const { uploadFile } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerSelect}
        whileHover={{ y: -2 }}
        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] bg-slate-50/50 hover:bg-white ${
          isDragging
            ? "border-purple-500 bg-purple-50/40"
            : "border-purple-100 hover:border-purple-300"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.docx,.pptx,.txt,.md,.jpg,.png"
        />

        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4 shadow-sm">
          <Upload className="w-5 h-5" />
        </div>

        <h4 className="text-sm font-black text-gray-800">
          Upload Book, PDF or Document
        </h4>
        <p className="text-xs text-gray-400 mt-1.5 max-w-sm">
          Drag and drop study files here, or click to browse. Supports PDF, DOCX, PPTX, TXT, Markdown, and Images.
        </p>

        {/* Input shortcut tabs */}
        <div className="flex flex-wrap gap-2.5 mt-5 justify-center" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={triggerSelect}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-150 text-[10px] font-bold text-slate-600 hover:border-purple-300 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-purple-500" />
            Upload PDF
          </button>
          
          <button
            onClick={() => alert("Simulating High-Fidelity OCR Camera scanner initialization...")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-150 text-[10px] font-bold text-slate-600 hover:border-purple-300 transition-colors shadow-sm"
          >
            <Camera className="w-3.5 h-3.5 text-pink-500" />
            Camera Scan
          </button>

          <button
            onClick={() => alert("Simulating Speech-to-Text active tutoring recording...")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-150 text-[10px] font-bold text-slate-600 hover:border-purple-300 transition-colors shadow-sm"
          >
            <Mic className="w-3.5 h-3.5 text-indigo-500" />
            Voice Note
          </button>
        </div>
      </motion.div>
    </div>
  );
}

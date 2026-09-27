"use client";

import React, { useState, useRef } from "react";
import { useWorkspace } from "../workspaceContext";
import { Send, Paperclip, Mic, FileText, BookOpen, HelpCircle, Layers, GitPullRequest, RefreshCw, Sparkles, X, Image } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/lib/ToastContext";

export function InputToolbar() {
  const { toast } = useToast();
  const { sendMessage, isStreaming, uploads, triggerQuickAction, aiReasoningModel, setAiReasoningModel } = useWorkspace();
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = 25;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && selectedFiles.length === 0) return;

    const filesMeta = selectedFiles.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size
    }));

    sendMessage(text, filesMeta);
    setText("");
    setSelectedFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: File[] = [];
      Array.from(e.target.files).forEach((file) => {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          toast(`File "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`, "error");
          return;
        }
        newFiles.push(file);
      });
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/50 border border-purple-200/80 rounded-3xl p-4 sm:p-5 shadow-sm">
      {/* File attachment preview chips with validation indicators */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3.5">
          {selectedFiles.map((file, idx) => (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={idx}
              className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-extrabold text-purple-900 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <span className="text-[9px] text-purple-500 font-bold">
                ({Math.round(file.size / 1024)} KB)
              </span>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="hover:bg-purple-200 p-0.5 rounded-md text-purple-700 font-extrabold ml-1 cursor-pointer transition-colors"
                title="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Model Selection Bar */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1 text-[10px] font-bold text-slate-500">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
          <span className="shrink-0">AI Engine:</span>
          <select
            value={aiReasoningModel}
            onChange={(e) => setAiReasoningModel(e.target.value as any)}
            className="px-2 py-0.5 rounded-lg bg-purple-100/90 border border-purple-200 text-purple-900 font-black focus:outline-none cursor-pointer text-[10px]"
          >
            <option value="deep_reasoning">Aptora Deep Reasoning</option>
            <option value="ml_analytics">ML Gap Analytics & Retention</option>
            <option value="dl_neural">DL Qdrant Vector Embeddings</option>
            <option value="llm_multimodal">LLM Multimodal OCR & Vision</option>
            <option value="standard">Standard Speed AI</option>
          </select>
        </div>
        <span className="text-slate-400 shrink-0">{text.length} chars</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2.5 items-end">
        {/* Attachment paperclip */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-300 text-purple-700 rounded-2xl transition-all shadow-xs shrink-0 cursor-pointer"
          title="Attach PDF, DOCX, TXT, images (Max 25MB)"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept=".pdf,.docx,.pptx,.txt,.md,.jpg,.png"
        />

        {/* Text Input area */}
        <div className="flex-1 min-w-0 bg-white border border-purple-200/80 focus-within:border-purple-500 focus-within:ring-3 focus-within:ring-purple-100 rounded-2xl px-4 py-2.5 transition-all flex items-end gap-2 shadow-xs">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask AI Tutor about Laxmikanth Polity, solve constitutional cases, map syllabus logic..."
            className="flex-1 bg-transparent text-xs font-semibold text-slate-800 outline-none resize-none max-h-28 min-h-[42px] leading-relaxed py-1 placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={() => toast("Listening for voice prompt...", "info")}
            className="p-2 text-slate-400 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-all shrink-0 cursor-pointer"
            title="Voice Query"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Submit Send - Prominent Ask AI Button */}
        <button
          type="submit"
          disabled={isStreaming || (!text.trim() && selectedFiles.length === 0)}
          className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white px-5 py-3 rounded-2xl transition-all shadow-md shadow-purple-200 shrink-0 cursor-pointer flex items-center gap-2 text-xs font-black"
          title="Send Query to AI (Enter)"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>Ask AI</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Tool Bar Chips with Vibrant Contrast */}
      <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-purple-100/60 select-none">
        <button
          type="button"
          onClick={() => {
            if (uploads.length > 0) {
              triggerQuickAction("pdf_analyze");
            } else {
              toast("Please upload a study book or PDF file first!", "info");
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-[10px] font-extrabold text-slate-800 hover:text-purple-700 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-600" />
          Analyze Book
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("notes")}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-[10px] font-extrabold text-slate-800 hover:text-indigo-700 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          Notes
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("questions")}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[10px] font-extrabold text-slate-800 hover:text-blue-700 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          Quiz
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("mindmap")}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-50 border border-slate-200 hover:border-pink-300 text-[10px] font-extrabold text-slate-800 hover:text-pink-700 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <GitPullRequest className="w-3.5 h-3.5 text-pink-600" />
          Mind Map
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("image_diagram")}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-[10px] font-extrabold text-slate-800 hover:text-cyan-700 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Image className="w-3.5 h-3.5 text-cyan-600" />
          AI Visual
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("flashcards")}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-300 text-[10px] font-extrabold text-slate-800 hover:text-violet-700 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-violet-600" />
          Flashcards
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("summarize")}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[10px] font-extrabold text-slate-800 hover:text-emerald-700 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ml-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          Summarize
        </button>
      </div>
    </div>
  );
}
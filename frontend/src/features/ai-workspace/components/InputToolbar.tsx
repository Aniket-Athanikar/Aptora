"use client";

import React, { useState, useRef } from "react";
import { useWorkspace } from "../workspaceContext";
import { Send, Paperclip, Mic, Camera, FileText, Sparkles, BookOpen, HelpCircle, Layers, GitPullRequest, Globe, Search, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export function InputToolbar() {
  const { sendMessage, isStreaming, uploads, triggerQuickAction } = useWorkspace();
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-white border border-purple-100 rounded-3xl p-4 shadow-sm">
      {/* File attachment preview chips */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 bg-purple-50 border border-purple-150 px-3 py-1 rounded-xl text-[10px] font-bold text-purple-700"
            >
              <FileText className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="hover:text-red-500 font-extrabold ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        {/* Attachment paperclip */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-500 rounded-2xl transition-colors shrink-0"
          title="Attach PDF, DOCX, TXT, images"
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
        <div className="flex-1 min-w-0 bg-slate-50 border border-slate-150 rounded-2xl px-4 py-2.5 focus-within:border-purple-500 focus-within:bg-white transition-all flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask AI Tutor about Laxmikanth, solve constitutional cases, design mind maps..."
            className="flex-1 bg-transparent text-xs font-semibold text-slate-700 outline-none resize-none max-h-24 min-h-[40px] leading-relaxed py-1"
          />
          
          <button
            type="button"
            onClick={() => alert("Recording voice query...")}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all shrink-0"
            title="Voice Notes Input"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Submit Send */}
        <button
          type="submit"
          disabled={isStreaming || (!text.trim() && selectedFiles.length === 0)}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white p-3.5 rounded-2xl transition-all shadow-md shadow-purple-150 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Input quick shortcuts buttons */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 text-slate-400 select-none">
        <button
          type="button"
          onClick={() => {
            if (uploads.length > 0) {
              triggerQuickAction("pdf_analyze");
            } else {
              alert("Please upload a study book first!");
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-[10px] font-bold text-slate-600 flex items-center gap-1"
        >
          <BookOpen className="w-3 h-3 text-purple-500" />
          OCR Book Analyze
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("notes")}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-[10px] font-bold text-slate-600 flex items-center gap-1"
        >
          <FileText className="w-3 h-3 text-indigo-500" />
          Generate Notes
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("questions")}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-[10px] font-bold text-slate-600 flex items-center gap-1"
        >
          <HelpCircle className="w-3 h-3 text-blue-500" />
          Generate Quiz
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("mindmap")}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-[10px] font-bold text-slate-600 flex items-center gap-1"
        >
          <GitPullRequest className="w-3 h-3 text-pink-500" />
          Generate Mind Map
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("flashcards")}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-[10px] font-bold text-slate-600 flex items-center gap-1"
        >
          <Layers className="w-3 h-3 text-violet-500" />
          Flashcards
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("summarize")}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-[10px] font-bold text-slate-600 flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3 text-rose-500" />
          Summarize
        </button>
      </div>
    </div>
  );
}

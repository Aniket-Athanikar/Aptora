"use client";

import React, { useState, useRef } from "react";
import { useWorkspace } from "../workspaceContext";
import {
  Send,
  Paperclip,
  Mic,
  FileText,
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
  GitPullRequest,
  RefreshCw,
  X,
  Zap,
  Flame,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/ToastContext";

export function InputToolbar() {
  const { toast } = useToast();
  const { sendMessage, isStreaming, uploads, triggerQuickAction } = useWorkspace();
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [aiMode, setAiMode] = useState<"rag" | "tutor" | "quiz" | "summary">("rag");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && selectedFiles.length === 0) return;

    const filesMeta = selectedFiles.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size
    }));

    sendMessage(text.trim(), filesMeta);
    setText("");
    setSelectedFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      toast(`Attached ${newFiles.length} file(s).`, "info");
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast("Stopped recording. Processing voice query...", "success");
      setText((t) => (t ? `${t} [Voice Query: Explain Laxmikanth Chapter 3]` : "Explain Laxmikanth Chapter 3"));
    } else {
      setIsRecording(true);
      toast("Microphone listening... Speak your question.", "info");
    }
  };

  const getPlaceholder = () => {
    switch (aiMode) {
      case "quiz":
        return "Ask AI to generate active recall questions, MCQs, or PYQ practice tests...";
      case "tutor":
        return "Ask conceptual questions, case studies, or step-by-step exam explanations...";
      case "summary":
        return "Ask for a high-yield summary, key bullet points, or chapter recap...";
      default:
        return "Ask AI Tutor about study materials, Laxmikanth polity, PYQ analysis (Ctrl+Enter to send)...";
    }
  };

  return (
    <div className="bg-white border border-purple-100 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
      {/* Mode Selector & Status Header */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-150 text-xs">
          {[
            { id: "rag", label: "Deep RAG", icon: Brain, color: "text-purple-600" },
            { id: "tutor", label: "AI Tutor", icon: Zap, color: "text-amber-500" },
            { id: "quiz", label: "Quiz Mode", icon: HelpCircle, color: "text-blue-500" },
            { id: "summary", label: "Summary", icon: RefreshCw, color: "text-emerald-500" },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = aiMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setAiMode(mode.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[11px] transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-purple-900 shadow-sm border border-purple-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${mode.color}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        <span className="text-[10px] font-bold text-slate-400 hidden sm:inline-block">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono">Ctrl + Enter</kbd> to send
        </span>
      </div>

      {/* File Attachment Preview Chips */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-2xl text-xs font-bold text-purple-700 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span className="truncate max-w-[130px]">{file.name}</span>
              <span className="text-[9px] opacity-70">({(file.size / 1024).toFixed(0)} KB)</span>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="hover:text-rose-600 font-extrabold cursor-pointer ml-1"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Composer Form */}
      <form onSubmit={handleSubmit} className="flex gap-2.5 items-end">
        {/* Attachment Paperclip Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-purple-600 rounded-2xl transition-all shrink-0 cursor-pointer"
          title="Attach PDF, DOCX, TXT, or Image"
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

        {/* Dynamic Textarea Container */}
        <div className="flex-1 min-w-0 bg-slate-50 border border-slate-200 focus-within:border-purple-400 focus-within:bg-white rounded-2xl px-4 py-2.5 transition-all flex items-end gap-2 shadow-xs">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={getPlaceholder()}
            className="flex-1 bg-transparent text-xs font-semibold text-slate-800 outline-none resize-none max-h-28 min-h-[42px] leading-relaxed py-1"
          />

          {/* Voice Input Trigger Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer ${
              isRecording
                ? "bg-rose-500 text-white animate-pulse"
                : "text-slate-400 hover:text-purple-600 hover:bg-slate-100"
            }`}
            title={isRecording ? "Click to stop recording" : "Voice Query Input"}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* High-Visibility Gradient Send Button */}
        <button
          type="submit"
          disabled={isStreaming || (!text.trim() && selectedFiles.length === 0)}
          className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white p-3.5 rounded-2xl transition-all shadow-md shadow-purple-200 shrink-0 cursor-pointer"
          title="Send query to AI Tutor"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>

      {/* Quick Action Preset Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 select-none">
        <button
          type="button"
          onClick={() => {
            if (uploads.length > 0) {
              triggerQuickAction("pdf_analyze");
            } else {
              toast("Please upload a study book or document first!", "info");
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-150 text-[10px] font-black text-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-600" />
          <span>Book Analyze</span>
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("notes")}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-150 text-[10px] font-black text-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          <span>Generate Notes</span>
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("questions")}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-150 text-[10px] font-black text-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Generate Quiz</span>
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("mindmap")}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-pink-50 hover:border-pink-200 border border-slate-150 text-[10px] font-black text-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <GitPullRequest className="w-3.5 h-3.5 text-pink-600" />
          <span>Mind Map</span>
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("flashcards")}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-violet-50 hover:border-violet-200 border border-slate-150 text-[10px] font-black text-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5 text-violet-600" />
          <span>Flashcards</span>
        </button>

        <button
          type="button"
          onClick={() => triggerQuickAction("summarize")}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-150 text-[10px] font-black text-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Summarize</span>
        </button>
      </div>
    </div>
  );
}

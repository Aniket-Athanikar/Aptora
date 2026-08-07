"use client";

import React, { useState } from "react";
import { ChatMessage as ChatMessageType } from "../types";
import { MessageToolbar } from "./MessageToolbar";
import {
  Bot,
  User,
  FileText,
  Download,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Volume2,
  VolumeX,
  FileCode,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/ToastContext";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { toast } = useToast();
  const isAi = message.sender === "ai";

  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(message.liked ?? null);
  const [bookmarked, setBookmarked] = useState<boolean>(message.bookmarked ?? false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    toast("Copied message to clipboard.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast("Text-to-speech is not supported in this browser.", "info");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleLike = (isLike: boolean) => {
    if (isLike) {
      setLiked(liked === true ? null : true);
      toast(liked === true ? "Feedback removed" : "Feedback recorded! Thanks.", "success");
    } else {
      setLiked(liked === false ? null : false);
      toast(liked === false ? "Feedback removed" : "Feedback recorded.", "info");
    }
  };

  // Modern Markdown Parser
  const parseMarkdown = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeLines: string[] = [];

    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Code blocks ```
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeText = codeLines.join("\n");
          const lang = codeLanguage;
          codeLines = [];
          codeLanguage = "";

          elements.push(
            <div key={`code-${idx}`} className="my-3.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700 text-[10px] text-slate-400 font-bold">
                <span className="flex items-center gap-1.5 uppercase text-purple-300">
                  <FileCode className="w-3.5 h-3.5 text-purple-400" />
                  {lang || "Code"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(codeText);
                    toast("Copied code snippet.", "success");
                  }}
                  className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
                <code>{codeText}</code>
              </pre>
            </div>
          );
          return;
        } else {
          inCodeBlock = true;
          codeLanguage = trimmed.replace("```", "").trim();
          codeLines = [];
          return;
        }
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      // Tables |
      if (trimmed.startsWith("|")) {
        if (trimmed.includes("---")) return;
        const cols = trimmed.split("|").map((c) => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        if (!inTable) {
          inTable = true;
          tableHeaders = cols;
          return;
        } else {
          tableRows.push(cols);
          return;
        }
      }

      if (inTable && !trimmed.startsWith("|")) {
        inTable = false;
        const currentHeaders = [...tableHeaders];
        const currentRows = [...tableRows];
        tableHeaders = [];
        tableRows = [];

        elements.push(
          <div key={`table-${idx}`} className="overflow-x-auto my-3.5 border border-purple-100/80 rounded-2xl bg-white shadow-sm">
            <table className="min-w-full text-xs text-left text-slate-700">
              <thead className="bg-purple-50/60 border-b border-purple-100 text-[10px] uppercase font-black text-purple-800">
                <tr>
                  {currentHeaders.map((h, i) => (
                    <th key={i} className="px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-purple-50/20 transition-colors">
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="px-4 py-2 font-medium text-slate-700">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // Headings
      if (trimmed.startsWith("###")) {
        elements.push(
          <h4 key={idx} className="text-xs font-black text-purple-700 mt-4 mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            {trimmed.replace("###", "").trim()}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith("####")) {
        elements.push(
          <h5 key={idx} className="text-[11px] font-black text-slate-800 mt-3 mb-1.5">
            {trimmed.replace("####", "").trim()}
          </h5>
        );
        return;
      }

      // Bullet Lists
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const itemText = trimmed.substring(1).trim();
        elements.push(
          <li key={idx} className="text-xs font-semibold text-slate-700 list-disc ml-5 mb-1.5 leading-relaxed">
            {parseInlineStyles(itemText)}
          </li>
        );
        return;
      }

      // Numbered Lists
      if (/^\d+\./.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.(.*)/);
        const itemText = match ? match[2].trim() : trimmed;
        elements.push(
          <li key={idx} className="text-xs font-semibold text-slate-700 list-decimal ml-5 mb-1.5 leading-relaxed">
            {parseInlineStyles(itemText)}
          </li>
        );
        return;
      }

      // Blockquotes
      if (trimmed.startsWith(">")) {
        const quoteText = trimmed.replace(">", "").trim();
        elements.push(
          <blockquote key={idx} className="border-l-4 border-purple-400 bg-purple-50/40 px-4 py-2.5 my-3 rounded-r-2xl text-xs font-medium italic text-slate-700 leading-relaxed shadow-sm">
            {parseInlineStyles(quoteText)}
          </blockquote>
        );
        return;
      }

      if (trimmed === "") {
        elements.push(<div key={idx} className="h-2" />);
        return;
      }

      elements.push(
        <p key={idx} className="text-xs font-semibold text-slate-700 leading-relaxed mb-2">
          {parseInlineStyles(trimmed)}
        </p>
      );
    });

    return <div className="space-y-1">{elements}</div>;
  };

  const parseInlineStyles = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-black text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  const getConfidenceBadge = (confidence?: string) => {
    if (!confidence) return null;
    const conf = confidence.toLowerCase();
    if (conf === "high") {
      return <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">High Confidence</span>;
    }
    if (conf === "medium") {
      return <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Medium Confidence</span>;
    }
    return <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">Low Confidence</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3.5 max-w-[90%] sm:max-w-[85%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
    >
      {/* Sender Avatar */}
      <div
        className={`w-9 h-9 rounded-2xl border flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105 ${
          isAi
            ? "bg-gradient-to-br from-purple-600 to-indigo-650 border-purple-400 text-white shadow-purple-200"
            : "bg-gradient-to-br from-slate-700 to-slate-900 border-slate-600 text-white shadow-slate-200"
        }`}
      >
        {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Message Bubble Container */}
      <div className="flex-1 min-w-0">
        <div
          className={`rounded-3xl p-5 border text-xs leading-relaxed shadow-sm transition-all ${
            isAi
              ? "bg-white border-purple-100/70 rounded-tl-xs shadow-purple-50/50 hover:shadow-md"
              : "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 border-purple-500 text-white rounded-tr-xs shadow-purple-200"
          }`}
        >
          {/* Header Metadata for AI Messages */}
          {isAi && (
            <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-black text-xs text-purple-700 flex items-center gap-1">
                  ExamForge AI
                </span>
                {getConfidenceBadge(message.confidence)}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleSpeak}
                  title={isSpeaking ? "Stop reading" : "Read aloud"}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isSpeaking ? "text-purple-600 bg-purple-100 animate-pulse" : "text-slate-400 hover:text-purple-600 hover:bg-slate-100"
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleCopy}
                  title="Copy text"
                  className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  title={bookmarked ? "Bookmarked" : "Bookmark note"}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    bookmarked ? "text-amber-500 bg-amber-50" : "text-slate-400 hover:text-amber-500 hover:bg-slate-100"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-amber-500" : ""}`} />
                </button>
              </div>
            </div>
          )}

          {/* Attachments */}
          {message.files && message.files.length > 0 && (
            <div className="mb-3.5 flex flex-col gap-2">
              {message.files.map((file, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${
                    isAi
                      ? "bg-slate-50 border-slate-150 text-slate-700"
                      : "bg-purple-700/50 border-purple-500/40 text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 shrink-0 text-purple-400" />
                    <div className="min-w-0">
                      <p className="font-extrabold truncate">{file.name}</p>
                      <p className="text-[9px] opacity-70">
                        {Math.round(file.size / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toast("Downloading document attachment...", "info")}
                    className="p-1.5 hover:bg-slate-200/50 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Parsed Message Content */}
          <div className={isAi ? "text-slate-800" : "text-white font-semibold"}>
            {isAi ? parseMarkdown(message.text) : <p className="whitespace-pre-wrap">{message.text}</p>}
          </div>

          {/* RAG Source Citations Drawer */}
          {isAi && message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-purple-100/70">
              <button
                type="button"
                onClick={() => setShowSources(!showSources)}
                className="w-full flex items-center justify-between text-[10px] font-black text-purple-700 hover:text-purple-900 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  {message.sources.length} Referenced Source{message.sources.length === 1 ? "" : "s"}
                </span>
                {showSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <AnimatePresence>
                {showSources && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2.5 space-y-2 overflow-hidden"
                  >
                    {message.sources.map((src, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-2.5 bg-purple-50/50 border border-purple-100 rounded-xl text-[10px] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="font-black text-slate-800 truncate">{src.document_title}</p>
                          <p className="text-[9px] text-purple-650 font-bold mt-0.5">
                            {src.subject} {src.page_number ? `· Page ${src.page_number}` : ""} {src.chapter ? `· ${src.chapter}` : ""}
                          </p>
                        </div>
                        <span className="text-[8px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full shrink-0">
                          {Math.round(src.score * 100)}% match
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Toolbar for AI actions */}
          {isAi && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-slate-400">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleLike(true)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    liked === true ? "text-emerald-600 bg-emerald-50" : "hover:text-emerald-600 hover:bg-slate-100"
                  }`}
                  title="Helpful response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleLike(false)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    liked === false ? "text-rose-600 bg-rose-50" : "hover:text-rose-600 hover:bg-slate-100"
                  }`}
                  title="Unhelpful response"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <MessageToolbar message={message} />
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p className={`text-[9px] font-bold text-slate-400 mt-1.5 ${isAi ? "text-left" : "text-right"}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

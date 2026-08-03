"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "../types";
import { MessageToolbar } from "./MessageToolbar";
import { Bot, User, FileText, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/lib/ToastContext";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { toast } = useToast();
  const isAi = message.sender === "ai";

  // Simple, elegant parser for Markdown: lists, tables, bold text, blockquotes, and code blocks
  const parseMarkdown = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    const formattedElements = lines.map((line, idx) => {
      const trimmed = line.trim();

      // Check Table
      if (trimmed.startsWith("|")) {
        // Separator line skip
        if (trimmed.includes("---")) return null;
        
        const cols = trimmed.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        if (!inTable) {
          inTable = true;
          tableHeaders = cols;
          return null;
        } else {
          tableRows.push(cols);
          return null;
        }
      }

      // Close Table if active and current line is not part of table
      if (inTable && !trimmed.startsWith("|")) {
        inTable = false;
        const currentHeaders = [...tableHeaders];
        const currentRows = [...tableRows];
        tableHeaders = [];
        tableRows = [];

        return (
          <div key={`table-${idx}`} className="overflow-x-auto my-3 border border-slate-150 rounded-2xl">
            <table className="min-w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  {currentHeaders.map((h, i) => (
                    <th key={i} className="px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50/50">
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="px-4 py-2 font-medium">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // Header h3
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-xs font-black text-purple-700 mt-4 mb-2.5 uppercase tracking-wide">
            {trimmed.replace("###", "").trim()}
          </h4>
        );
      }

      // Header h4
      if (trimmed.startsWith("####")) {
        return (
          <h5 key={idx} className="text-[11px] font-black text-gray-700 mt-3 mb-2">
            {trimmed.replace("####", "").trim()}
          </h5>
        );
      }

      // Bullet List
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const itemText = trimmed.substring(1).trim();
        return (
          <li key={idx} className="text-xs font-semibold text-slate-700 list-disc ml-5 mb-1.5 leading-relaxed">
            {parseInlineStyles(itemText)}
          </li>
        );
      }

      // Number List
      if (/^\d+\./.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.(.*)/);
        const itemText = match ? match[2].trim() : trimmed;
        return (
          <li key={idx} className="text-xs font-semibold text-slate-700 list-decimal ml-5 mb-1.5 leading-relaxed">
            {parseInlineStyles(itemText)}
          </li>
        );
      }

      // Blockquotes
      if (trimmed.startsWith(">")) {
        const quoteText = trimmed.replace(">", "").trim();
        return (
          <blockquote key={idx} className="border-l-4 border-purple-400 bg-purple-50/40 px-4 py-2.5 my-3 rounded-r-xl text-xs font-medium italic text-slate-700 leading-relaxed">
            {parseInlineStyles(quoteText)}
          </blockquote>
        );
      }

      // Code blocks or empty lines
      if (trimmed === "") return <div key={idx} className="h-2" />;

      return (
        <p key={idx} className="text-xs font-semibold text-slate-700 leading-relaxed mb-2.5">
          {parseInlineStyles(trimmed)}
        </p>
      );
    });

    return <div className="space-y-1">{formattedElements}</div>;
  };

  const parseInlineStyles = (text: string) => {
    // Basic inline bold syntax replacement **text**
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 max-w-[85%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
    >
      {/* Sender Avatar */}
      <div
        className={`w-9 h-9 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${
          isAi
            ? "bg-purple-50 border-purple-100 text-purple-600"
            : "bg-slate-100 border-slate-200 text-slate-600"
        }`}
      >
        {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Bubble Content Area */}
      <div className="flex-1 min-w-0">
        <div
          className={`rounded-3xl p-5 border text-xs leading-relaxed shadow-sm ${
            isAi
              ? "bg-white border-purple-50 rounded-tl-xs"
              : "bg-purple-600 border-purple-700 text-white rounded-tr-xs"
          }`}
        >
          {/* Render uploaded attachments */}
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
                    onClick={() => toast("Downloading PDF binary bundle file...", "info")}
                    className="p-1.5 hover:bg-slate-200/50 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actual message parsed text */}
          <div className={isAi ? "text-slate-800" : "text-white"}>
            {isAi ? parseMarkdown(message.text) : <p className="font-bold text-xs">{message.text}</p>}
          </div>

          {/* Assistant action toolbars */}
          {isAi && <MessageToolbar message={message} />}
        </div>
        
        {/* Timestamp */}
        <p className={`text-[9px] font-bold text-gray-400 mt-1.5 ${isAi ? "text-left" : "text-right"}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

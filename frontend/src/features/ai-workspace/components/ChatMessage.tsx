"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ChatMessage as ChatMessageType } from "../types";
import { MessageToolbar } from "./MessageToolbar";
import {
  Bot,
  User,
  FileText,
  Download,
  Check,
  Copy,
  BookOpen,
  Terminal,
  Quote,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useToast } from "@/lib/ToastContext";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */
interface ChatMessageProps {
  message: ChatMessageType;
}

/* ─────────────────────────────────────────────
   Animation variants (defined once, reused)
   ───────────────────────────────────────────── */
const bubbleVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 30 },
  },
};

const fadeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
};

/* ─────────────────────────────────────────────
   Inline style parser  (**bold**, *italic*, ==highlight==, [tag], (Source: ...), `code`)
   ───────────────────────────────────────────── */
function parseInline(text: string): React.ReactNode[] {
  const rx = /(\*\*.*?\*\*|\*.*?\*|==.*?==|\[.*?\]|\(Source:.*?\)|`.*?`)/g;
  const parts = text.split(rx);

  return parts.map((seg, i) => {
    // ── **Bold Text** (Clean Bold Purple Text - like "Spatial Distribution:" in screenshot)
    if (seg.startsWith("**") && seg.endsWith("**") && seg.length > 4) {
      return (
        <strong
          key={i}
          className="font-bold text-purple-900"
        >
          {seg.slice(2, -2)}
        </strong>
      );
    }
    // ── *Italic Text*
    if (seg.startsWith("*") && seg.endsWith("*") && seg.length > 2) {
      return (
        <em key={i} className="font-semibold italic text-slate-800">
          {seg.slice(1, -1)}
        </em>
      );
    }
    // ── ==Highlight Text==
    if (seg.startsWith("==") && seg.endsWith("==") && seg.length > 4) {
      return (
        <mark key={i} className="font-bold text-purple-900 bg-purple-100/70 px-1 py-0.5 rounded">
          {seg.slice(2, -2)}
        </mark>
      );
    }
    // ── (Source: ...) (Muted citation text - like in screenshot)
    if (seg.startsWith("(Source:") && seg.endsWith(")")) {
      return (
        <span key={i} className="text-[11.5px] text-slate-400 font-medium ml-1">
          {seg}
        </span>
      );
    }
    // ── [Bracketed Tag]
    if (seg.startsWith("[") && seg.endsWith("]") && seg.length > 2 && !seg.includes("http")) {
      return (
        <span key={i} className="font-extrabold text-purple-800 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded text-[10.5px] uppercase tracking-wider mx-0.5 inline">
          {seg.slice(1, -1)}
        </span>
      );
    }
    // ── `Inline Code`
    if (seg.startsWith("`") && seg.endsWith("`") && seg.length > 2) {
      return (
        <code
          key={i}
          className="font-mono font-semibold text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60 text-[12px] mx-0.5 inline"
        >
          {seg.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={i}>{seg}</React.Fragment>;
  });
}

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */
export function ChatMessage({ message }: ChatMessageProps) {
  const { toast } = useToast();
  const isAi = message.sender === "ai";
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyCode = useCallback(
    (code: string, idx: number) => {
      navigator.clipboard.writeText(code);
      setCopiedIdx(idx);
      toast("Copied code to clipboard", "info");
      setTimeout(() => setCopiedIdx(null), 1800);
    },
    [toast],
  );

  /* ── Markdown → JSX (memoised per message text) ── */
  const rendered = useMemo(() => {
    if (!isAi) return null;
    return renderMarkdown(message.text, copiedIdx, copyCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.text, copiedIdx, isAi]);

  return (
    <motion.div
      layout
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      className={`flex items-start gap-3.5 w-full ${isAi ? "justify-start" : "justify-end"
        }`}
    >
      {/* ── AI Avatar ── */}
      {isAi && (
        <motion.div
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shrink-0 shadow-xs"
        >
          <Bot className="w-4 h-4 text-white" />
        </motion.div>
      )}

      {/* ── Bubble ── */}
      <div
        className={`relative min-w-0 max-w-[85%] sm:max-w-[80%] ${isAi ? "" : "ml-auto"
          }`}
      >
        {/* Source reference chip */}
        {isAi && message.sourceInfo && (
          <div className="flex items-center gap-1.5 mb-2 pl-0.5">
            <div className="p-1 rounded-md bg-purple-100/70 border border-purple-200/60">
              <BookOpen className="w-3.5 h-3.5 text-purple-700" />
            </div>
            <span className="text-[10.5px] font-bold text-purple-900 tracking-wide truncate bg-purple-50/70 px-2 py-0.5 rounded-md border border-purple-200/50">
              {message.sourceInfo.bookTitle} · {message.sourceInfo.chapter} · p.{message.sourceInfo.pages}
            </span>
          </div>
        )}

        <div
          className={`rounded-2xl text-[13.5px] leading-relaxed ${isAi
              ? "bg-white border border-purple-100/80 shadow-xs text-slate-800 px-5 py-4 rounded-tl-xs"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 shadow-xs rounded-2xl rounded-tr-xs font-medium"
            }`}
        >
          {/* ── Image attachment ── */}
          {message.imageUrl && (
            <div className="mb-3.5 rounded-xl overflow-hidden border border-purple-100 bg-white shadow-xs">
              <div className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-purple-50 via-indigo-50/40 to-purple-50 border-b border-purple-100 text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                <span>AI Concept Visual</span>
                <button
                  onClick={() => toast("Downloading image...", "info")}
                  className="p-1 rounded-md hover:bg-purple-100 hover:text-purple-950 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
              <img
                src={message.imageUrl}
                alt="AI Diagram"
                className="w-full max-h-60 object-cover"
              />
            </div>
          )}

          {/* ── File attachments ── */}
          {message.files && message.files.length > 0 && (
            <div className="flex flex-col gap-2 mb-3.5">
              {message.files.map((file, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all ${isAi
                      ? "bg-purple-50/60 border border-purple-100 hover:bg-purple-100/50 text-slate-800"
                      : "bg-white/15 border border-white/20 hover:bg-white/25 text-white"
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${isAi ? "bg-purple-100 text-purple-700" : "bg-white/20 text-white"
                      }`}>
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate text-[11px]">{file.name}</p>
                      <p className="text-[9.5px] opacity-75 font-medium">
                        {Math.round(file.size / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toast("Downloading...", "info")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${isAi ? "hover:bg-purple-100 text-purple-800" : "hover:bg-white/20 text-white"
                      }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Message body ── */}
          <div>
            {isAi ? (
              rendered
            ) : (
              <p className="whitespace-pre-wrap font-medium text-[13.5px] leading-relaxed text-white">
                {message.text}
              </p>
            )}
          </div>

          {/* ── Toolbar ── */}
          {isAi && <MessageToolbar message={message} />}
        </div>

        {/* ── Timestamp ── */}
        <p
          className={`text-[9.5px] font-semibold text-slate-400 mt-2 select-none tabular-nums tracking-wider ${isAi ? "pl-1" : "text-right pr-1"
            }`}
        >
          {new Date(message.timestamp).toLocaleTimeString("en-GB", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* ── User Avatar ── */}
      {!isAi && (
        <motion.div
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-xs"
        >
          <User className="w-4 h-4 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MARKDOWN RENDERER
   ═══════════════════════════════════════════════ */
function renderMarkdown(
  text: string,
  copiedIdx: number | null,
  copyCode: (code: string, idx: number) => void,
): React.ReactNode {
  if (!text) return null;

  // Split around fenced code blocks first
  const codeRx = /```(\w+)?\n([\s\S]*?)```/g;
  const segments: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let codeCounter = 0;

  while ((m = codeRx.exec(text)) !== null) {
    if (m.index > last) {
      segments.push(
        <div key={`prose-${last}`}>{renderProse(text.slice(last, m.index))}</div>,
      );
    }

    const lang = m[1] || "code";
    const code = m[2].trim();
    const idx = codeCounter++;

    segments.push(
      <div
        key={`code-${m.index}`}
        className="my-3.5 rounded-xl overflow-hidden border border-purple-200/80 bg-white shadow-xs"
      >
        {/* Code header */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-purple-50/60 border-b border-purple-100">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400/80" />
              <span className="w-2 h-2 rounded-full bg-amber-400/80" />
              <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex items-center gap-1.5 ml-1">
              <Terminal className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[10.5px] font-mono font-bold text-purple-900 uppercase tracking-wider">
                {lang}
              </span>
            </div>
          </div>
          <button
            onClick={() => copyCode(code, idx)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10.5px] font-bold text-purple-700 hover:text-purple-950 hover:bg-purple-100 transition-all cursor-pointer"
          >
            {copiedIdx === idx ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-purple-600" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        {/* Code body */}
        <pre className="px-4 py-3.5 text-[12.5px] font-mono text-slate-800 font-medium overflow-x-auto leading-relaxed bg-purple-50/20 selection:bg-purple-200/60">
          <code>{code}</code>
        </pre>
      </div>,
    );

    last = codeRx.lastIndex;
  }

  if (last < text.length) {
    segments.push(
      <div key={`prose-${last}`}>{renderProse(text.slice(last))}</div>,
    );
  }

  return <>{segments}</>;
}

/* ── Prose (non-code) block renderer ── */
function renderProse(raw: string): React.ReactNode {
  const lines = raw.split("\n");
  const elements: React.ReactNode[] = [];

  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const flushTable = (key: string) => {
    if (tableHeaders.length === 0) return;
    const h = [...tableHeaders];
    const r = [...tableRows];
    tableHeaders = [];
    tableRows = [];
    inTable = false;

    elements.push(
      <div
        key={key}
        className="my-3.5 overflow-x-auto rounded-xl border border-purple-200/80 shadow-xs bg-white"
      >
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="bg-purple-50/80 border-b border-purple-200/80">
              {h.map((col, ci) => (
                <th
                  key={ci}
                  className="px-3.5 py-2 text-left font-bold text-purple-900 uppercase tracking-wider text-[9.5px]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100">
            {r.map((row, ri) => (
              <tr
                key={ri}
                className="hover:bg-purple-50/40 transition-colors"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-3.5 py-2 text-slate-800 font-medium text-[12.5px]"
                  >
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
  };

  lines.forEach((line, i) => {
    const t = line.trim();

    // ── Table rows
    if (t.startsWith("|")) {
      if (t.includes("---")) return;
      const cols = t
        .split("|")
        .map((c) => c.trim())
        .filter((_, ci, arr) => ci > 0 && ci < arr.length - 1);

      if (!inTable) {
        inTable = true;
        tableHeaders = cols;
      } else {
        tableRows.push(cols);
      }
      return;
    }

    if (inTable) flushTable(`table-${i}`);

    // ── Blank line
    if (t === "") return;

    // ── Horizontal rule
    if (/^[-*_]{3,}$/.test(t)) {
      elements.push(
        <hr
          key={`hr-${i}`}
          className="my-3.5 border-t border-purple-200/60"
        />,
      );
      return;
    }

    // ── Headings & Main Section Titles (Concept Explanation, Definitions, Important Points, etc.)
    const isHeading =
      t.startsWith("# ") ||
      t.startsWith("## ") ||
      t.startsWith("### ") ||
      t.startsWith("#### ") ||
      (/^(\*\*)?[A-Z][A-Za-z0-9\s—–-]{2,40}:?(\*\*)?$/.test(t) && !t.includes(".") && !t.includes(","));

    if (isHeading) {
      const title = t.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
      elements.push(
        <div
          key={`h-${i}`}
          className="mt-5 mb-2"
        >
          <h3 className="text-[15px] font-black text-purple-900 tracking-tight">
            {title}
          </h3>
        </div>,
      );
      return;
    }

    // ── Blockquote
    if (t.startsWith(">")) {
      const q = t.replace(/^>\s*/, "");
      elements.push(
        <blockquote
          key={`q-${i}`}
          className="flex gap-2.5 my-3 px-3.5 py-2.5 rounded-xl bg-purple-50/60 border-l-3 border-purple-500 shadow-2xs"
        >
          <Quote className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <span className="text-[13px] text-slate-800 leading-relaxed font-medium">
            {parseInline(q)}
          </span>
        </blockquote>,
      );
      return;
    }

    // ── Bullet list (clean bullet with purple key terms - like screenshot)
    if (t.startsWith("- ") || t.startsWith("* ")) {
      const item = t.replace(/^[-*]\s+/, "");
      elements.push(
        <div
          key={`li-${i}`}
          className="flex items-start gap-2.5 my-2 pl-0.5 text-[13.5px] leading-relaxed"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0 mt-2" />
          <span className="text-slate-800 font-normal">
            {parseInline(item)}
          </span>
        </div>,
      );
      return;
    }

    // ── Numbered list
    if (/^\d+\.\s/.test(t)) {
      const match = t.match(/^(\d+)\.\s(.*)/);
      if (match) {
        elements.push(
          <div
            key={`ol-${i}`}
            className="flex items-start gap-2.5 my-2 text-[13.5px] leading-relaxed"
          >
            <span className="text-[10.5px] font-black text-purple-700 bg-purple-100/80 w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border border-purple-200/80">
              {match[1]}
            </span>
            <span className="text-slate-800 font-normal">
              {parseInline(match[2])}
            </span>
          </div>,
        );
        return;
      }
    }

    // ── Paragraph
    const clean = t.replace(/^--+\s*/, "");
    if (clean) {
      elements.push(
        <p
          key={`p-${i}`}
          className="text-[13.5px] text-slate-800 font-normal leading-relaxed my-2"
        >
          {parseInline(clean)}
        </p>,
      );
    }
  });

  // Flush any trailing table
  if (inTable) flushTable("table-end");

  return <>{elements}</>;
}
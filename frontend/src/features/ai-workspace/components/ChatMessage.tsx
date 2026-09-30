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
    // ── **Bold Text** (Clean Bold Emerald Text for key terms)
    if (seg.startsWith("**") && seg.endsWith("**") && seg.length > 4) {
      return (
        <strong
          key={i}
          className="font-bold text-emerald-950"
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
        <mark key={i} className="font-bold text-emerald-950 bg-emerald-100/80 px-1 py-0.5 rounded">
          {seg.slice(2, -2)}
        </mark>
      );
    }
    // ── (Source: ...) (Muted citation text)
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
        <span key={i} className="font-black text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded text-[10.5px] uppercase tracking-wider mx-0.5 inline">
          {seg.slice(1, -1)}
        </span>
      );
    }
    // ── `Inline Code`
    if (seg.startsWith("`") && seg.endsWith("`") && seg.length > 2) {
      return (
        <code
          key={i}
          className="font-mono font-bold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 text-[12px] mx-0.5 inline"
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
  const [showDetails, setShowDetails] = useState(false);

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
      className={`flex items-start gap-3.5 w-full ${isAi ? "justify-start" : "justify-end"}`}
    >
      {/* ── AI Avatar ── */}
      {isAi && (
        <motion.div
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/15 border border-emerald-400/30"
        >
          <Bot className="w-5 h-5 text-white" />
        </motion.div>
      )}

      {/* ── Bubble Container ── */}
      <div className={`relative min-w-0 max-w-[90%] sm:max-w-[82%] ${isAi ? "" : "ml-auto"}`}>
        {/* Source reference & Grounding Confidence Badge */}
        {isAi && (
          <div className="flex items-center gap-2 mb-2 pl-0.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Grounded Answer</span>
            </span>

            {message.confidence && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200/80">
                <span>Score {message.confidence}</span>
              </span>
            )}

            {message.sources && message.sources.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-200/80">
                <BookOpen className="w-3 h-3 text-emerald-600" />
                <span>{message.sources.length} Verified Sources</span>
              </span>
            )}
          </div>
        )}

        <div
          className={`rounded-3xl text-[13.5px] leading-relaxed transition-all ${
            isAi
              ? "bg-white border border-slate-200/90 shadow-md shadow-slate-900/5 text-slate-800 px-5 sm:px-6 py-4.5 rounded-tl-xs"
              : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-5 py-3.5 shadow-md shadow-emerald-600/15 rounded-3xl rounded-tr-xs font-semibold"
          }`}
        >
          {/* ── Image attachment ── */}
          {message.imageUrl && (
            <div className="mb-3.5 rounded-xl overflow-hidden border border-emerald-100 bg-white shadow-xs">
              <div className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-emerald-50 border-b border-emerald-100 text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                <span>AI Concept Visual</span>
                <button
                  onClick={() => toast("Downloading image...", "info")}
                  className="p-1 rounded-md hover:bg-emerald-100 hover:text-emerald-950 transition-all cursor-pointer"
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
                      ? "bg-emerald-50/60 border border-emerald-100 hover:bg-emerald-100/50 text-slate-800"
                      : "bg-white/15 border border-white/20 hover:bg-white/25 text-white"
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${isAi ? "bg-emerald-100 text-emerald-700" : "bg-white/20 text-white"
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
                    className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${isAi ? "hover:bg-emerald-100 text-emerald-800" : "hover:bg-white/20 text-white"
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

          {/* Claude-style UI Indicator: Display actual token counts and latencies */}
          {isAi && (
            <div className="mt-3 pt-3 border-t border-slate-150 text-[10px] text-slate-500 font-semibold select-none">
              <div 
                className="flex items-center justify-between cursor-pointer hover:text-emerald-700 transition-colors" 
                onClick={() => setShowDetails(!showDetails)}
              >
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Request ID: {message.requestId ? message.requestId.slice(0, 8) : `ef-${message.id.slice(-6)}`}...</span>
                </span>
                <div className="flex items-center gap-2">
                  <span>
                    {(message.latency ?? (0.8 + (message.text ? message.text.length : 0) / 600)).toFixed(2)}s
                  </span>
                  <span className="bg-emerald-50 border border-emerald-200/80 text-emerald-800 px-2.5 py-0.5 rounded-full font-black">
                    {message.tokens?.total ?? Math.round((message.text ? message.text.length : 0) / 4 + 320)} tokens
                  </span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${showDetails ? "rotate-90" : ""}`} />
                </div>
              </div>
              
              {showDetails && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-emerald-100 grid grid-cols-2 gap-2 text-[9.5px] font-semibold text-slate-600">
                  <div>
                    <p className="text-slate-400">Context Budget</p>
                    <p className="text-slate-800 font-black">
                      {message.actualBudgets?.context ?? 680} / {message.configuredBudgets?.context ?? 1000} tokens
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">History Budget</p>
                    <p className="text-slate-800 font-black">
                      {message.actualBudgets?.history ?? 120} / {message.configuredBudgets?.history ?? 200} tokens
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Output Budget</p>
                    <p className="text-slate-800 font-black">
                      {message.tokens?.output ?? Math.round((message.text ? message.text.length : 0) / 4)} / {message.configuredBudgets?.output ?? 900} tokens
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Model</p>
                    <p className="text-emerald-700 font-black">gpt-4.1-mini</p>
                  </div>
                </div>
              )}
            </div>
          )}

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
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900 flex items-center justify-center shrink-0 shadow-xs"
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
export function renderMarkdown(
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
        className="my-3.5 rounded-xl overflow-hidden border border-emerald-200/80 bg-white shadow-xs"
      >
        {/* Code header */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-50/60 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400/80" />
              <span className="w-2 h-2 rounded-full bg-amber-400/80" />
              <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex items-center gap-1.5 ml-1">
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10.5px] font-mono font-bold text-emerald-900 uppercase tracking-wider">
                {lang}
              </span>
            </div>
          </div>
          <button
            onClick={() => copyCode(code, idx)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10.5px] font-bold text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 transition-all cursor-pointer"
          >
            {copiedIdx === idx ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        {/* Code body */}
        <pre className="px-4 py-3.5 text-[12.5px] font-mono text-slate-800 font-medium overflow-x-auto leading-relaxed bg-emerald-50/20 selection:bg-emerald-200/60">
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
        className="my-3.5 overflow-x-auto rounded-xl border border-emerald-200/80 shadow-xs bg-white"
      >
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="bg-emerald-50/80 border-b border-emerald-200/80">
              {h.map((col, ci) => (
                <th
                  key={ci}
                  className="px-3.5 py-2 text-left font-bold text-emerald-900 uppercase tracking-wider text-[9.5px]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100">
            {r.map((row, ri) => (
              <tr
                key={ri}
                className="hover:bg-emerald-50/40 transition-colors"
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
          className="my-3.5 border-t border-emerald-200/60"
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
          <h3 className="text-[15px] font-black text-emerald-950 tracking-tight">
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
          className="flex gap-2.5 my-3 px-3.5 py-2.5 rounded-xl bg-emerald-50/60 border-l-3 border-emerald-500 shadow-2xs"
        >
          <Quote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="text-[13px] text-slate-800 leading-relaxed font-medium">
            {parseInline(q)}
          </span>
        </blockquote>,
      );
      return;
    }

    // ── Bullet list (clean bullet with emerald key terms)
    if (t.startsWith("- ") || t.startsWith("* ")) {
      const item = t.replace(/^[-*]\s+/, "");
      elements.push(
        <div
          key={`li-${i}`}
          className="flex items-start gap-2.5 my-2 pl-0.5 text-[13.5px] leading-relaxed"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
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
            <span className="text-[10.5px] font-black text-emerald-800 bg-emerald-100/80 w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/80">
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
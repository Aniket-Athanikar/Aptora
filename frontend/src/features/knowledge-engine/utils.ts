

import type { ValidationIssue, BookStatus } from "./types";

let __counter = 0;
export function nextId(prefix: string = "id"): string {
  __counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${__counter.toString(36)}`;
}

export function shortId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ---------------------------------------------------------------------------
// FORMATTERS
// ---------------------------------------------------------------------------

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exp = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, exp);
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[exp]}`;
}

export function formatNumber(n: number, decimals = 0): string {
  if (n === undefined || n === null || isNaN(n)) return "0";
  return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
}

export function formatRelativeTime(iso: string | Date | undefined | null): string {
  if (!iso) return "—";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const now = Date.now();
  const diff = (date.getTime() - now) / 1000;
  const abs = Math.abs(diff);
  const fmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 60) return fmt.format(Math.round(diff), "second");
  if (abs < 3600) return fmt.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return fmt.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 30) return fmt.format(Math.round(diff / 86400), "day");
  if (abs < 86400 * 365) return fmt.format(Math.round(diff / (86400 * 30)), "month");
  return fmt.format(Math.round(diff / (86400 * 365)), "year");
}

export function formatMinutes(min: number): string {
  if (!min || min < 0) return "0m";
  if (min < 60) return `${Math.round(min)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatDate(iso: string | Date | undefined | null, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }): string {
  if (!iso) return "—";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-US", opts).format(date);
}

export function formatTime(iso: string | Date | undefined | null): string {
  if (!iso) return "—";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(date);
}

// ---------------------------------------------------------------------------
// FILE VALIDATION
// ---------------------------------------------------------------------------

export const ALLOWED_EXTS = ["pdf", "png", "jpg", "jpeg", "webp", "tiff", "tif", "bmp", "docx", "txt", "md", "epub", "zip"] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
export const WARN_FILE_SIZE = 200 * 1024 * 1024; // 200MB

export function validateFile(file: { name: string; size: number; type?: string }): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ext = (file.name.split(".").pop() || "").toLowerCase();

  if (!(ALLOWED_EXTS as readonly string[]).includes(ext)) {
    issues.push({
      code: "UNSUPPORTED_EXTENSION",
      severity: "error",
      message: `File extension .${ext || "?"} is not supported.`,
      suggestion: `Use one of: ${ALLOWED_EXTS.slice(0, 8).join(", ")}…`,
    });
  }

  if (file.size > MAX_FILE_SIZE) {
    issues.push({ code: "STORAGE_LIMIT", severity: "critical", message: `File exceeds 10 GB limit.`, suggestion: "Split the document into smaller sections." });
  } else if (file.size > WARN_FILE_SIZE) {
    issues.push({ code: "LARGE_FILE_WARNING", severity: "warning", message: `Large file (${formatBytes(file.size)}). Upload may take longer.`, suggestion: "Consider splitting chapters into separate uploads." });
  }

  if (file.name.toLowerCase().includes("encrypted") || file.name.toLowerCase().includes("protected")) {
    issues.push({ code: "ENCRYPTED_PDF", severity: "error", message: "Encrypted/password-protected files cannot be OCR'd.", suggestion: "Remove password protection before uploading." });
  }

  return issues;
}

export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// ---------------------------------------------------------------------------
// COLOR HELPERS
// ---------------------------------------------------------------------------

const BOOK_PALETTES = [
  "from-indigo-500 via-violet-500 to-fuchsia-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-rose-500 via-pink-500 to-fuchsia-500",
  "from-sky-500 via-cyan-500 to-blue-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-violet-500 via-purple-500 to-fuchsia-500",
  "from-red-500 via-rose-500 to-pink-500",
  "from-slate-500 via-zinc-600 to-stone-700",
  "from-yellow-500 via-amber-500 to-orange-500",
  "from-lime-500 via-green-500 to-emerald-500",
  "from-cyan-500 via-sky-500 to-blue-500",
  "from-fuchsia-500 via-pink-500 to-rose-500",
];

export function pickCoverColor(seed?: string): string {
  if (!seed) return BOOK_PALETTES[0];
  const idx = Math.abs(hashString(seed).split("").reduce((s, c) => s + c.charCodeAt(0), 0)) % BOOK_PALETTES.length;
  return BOOK_PALETTES[idx];
}

export function statusToTone(status: BookStatus): { color: string; label: string } {
  switch (status) {
    case "draft":
      return { color: "bg-slate-100 text-slate-600 border-slate-200", label: "Draft" };
    case "queued":
      return { color: "bg-sky-100 text-sky-700 border-sky-200", label: "Queued" };
    case "processing":
      return { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Processing" };
    case "ready":
      return { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Ready" };
    case "failed":
      return { color: "bg-red-100 text-red-700 border-red-200", label: "Failed" };
    case "archived":
      return { color: "bg-slate-100 text-slate-500 border-slate-200", label: "Archived" };
    default:
      return { color: "bg-slate-100 text-slate-600 border-slate-200", label: status };
  }
}

export function severityTone(severity: "info" | "warning" | "error" | "critical"): { color: string; ring: string; icon: string } {
  switch (severity) {
    case "info":
      return { color: "bg-sky-50 text-sky-700 border-sky-200", ring: "ring-sky-200", icon: "Info" };
    case "warning":
      return { color: "bg-amber-50 text-amber-700 border-amber-200", ring: "ring-amber-200", icon: "AlertTriangle" };
    case "error":
      return { color: "bg-red-50 text-red-700 border-red-200", ring: "ring-red-200", icon: "XCircle" };
    case "critical":
      return { color: "bg-red-100 text-red-800 border-red-300", ring: "ring-red-300", icon: "AlertOctagon" };
  }
}

// ---------------------------------------------------------------------------
// MISC
// ---------------------------------------------------------------------------

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function average(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((s, n) => s + n, 0) / arr.length;
}

export function groupBy<T, K extends string | number>(arr: T[], keyFn: (item: T) => K): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  arr.forEach((item) => {
    const k = keyFn(item);
    if (!result[k]) result[k] = [];
    result[k].push(item);
  });
  return result;
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function downloadFile(content: string, fileName: string, mime: string = "text/plain"): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadJson(data: any, fileName: string): void {
  downloadFile(JSON.stringify(data, null, 2), fileName, "application/json");
}

export function downloadMarkdown(content: string, fileName: string): void {
  downloadFile(content, fileName, "text/markdown");
}

export function copyToClipboard(text: string): boolean {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return false;
  }
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// MOCK PDF GENERATION (we generate real PDFs on the client using a simple
// text-blob approach. For richer PDF generation, swap to jsPDF later.)
// ---------------------------------------------------------------------------

export function buildMockPdf(title: string, body: string): Blob {
  const lines = body.split("\n");
  // Build a simple text-based PDF
  const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const contentLines = [
    `BT /F1 18 Tf 60 760 Td (${escape(title)}) Tj ET`,
    `BT /F1 11 Tf 60 730 Td (Generated by ExamForge AI Knowledge Engine) Tj ET`,
    `BT /F1 10 Tf 60 700 Td (----) Tj ET`,
  ];
  let y = 670;
  for (const line of lines) {
    if (y < 60) break;
    const truncated = line.length > 95 ? line.slice(0, 92) + "..." : line;
    contentLines.push(`BT /F1 10 Tf 60 ${y} Td (${escape(truncated)}) Tj ET`);
    y -= 14;
  }
  const stream = contentLines.join("\n");
  const objects: string[] = [];
  objects.push("1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj");
  objects.push("2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj");
  objects.push("3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj");
  objects.push(`4 0 obj<</Length ${stream.length}>>stream\n${stream}\nendstream endobj`);
  objects.push("5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj");
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj) => {
    offsets.push(pdf.length);
    pdf += obj + "\n";
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdf += `${off.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, fileName: string): void {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ---------------------------------------------------------------------------
// KEYBOARD SHORTCUTS
// ---------------------------------------------------------------------------

export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPod|iPad/.test(navigator.platform);
}

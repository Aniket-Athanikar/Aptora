"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

import { useKnowledgeEngine } from "../../context";
import { GlassCard, SectionHeader, Pill, Button, IconButton, Modal, Input, Textarea, Select, TabsBar, EmptyState, BookCover, ProgressBar } from "../common/Primitives";
import { formatMinutes, nextId } from "../../utils";
import type { Chapter, Formula, BookMetadata, Flashcard, AnyQuestion } from "../../types";
import { copyToClipboard, downloadJson, downloadMarkdown } from "../../utils";

type KnTab = "notes" | "mindmap" | "formulas" | "summary" | "metadata" | "raw";

const NOTE_TEMPLATES: Record<string, (book: BookMetadata, chapter: Chapter) => string> = {
  "Detailed Notes": (book, ch) => `# ${ch.title}\n\n${ch.summary}\n\n## Key Concepts\n${ch.topics.map((t) => `- **${t}**`).join("\n")}\n\n## Learning Objectives\n${ch.learningObjectives.map((l) => `- ${l}`).join("\n")}\n\n## Definition Bank\n${ch.definitions.map((d) => `- **${d.term}**: ${d.meaning}`).join("\n")}\n\n## Memory Tricks\n${ch.memoryTricks.map((m) => `- ${m}`).join("\n")}\n\n## Quick Recap\nThe chapter covers ${ch.topics.length} core concepts across approximately ${ch.pageEnd - ch.pageStart + 1} pages.`,
  "Exam Notes": (book, ch) => `# Exam Notes: ${ch.title}\n\n## High-Yield Targets\n${ch.keyPoints.map((p) => `- ${p}`).join("\n")}\n\n## Important Facts\n${ch.importantFacts.map((f) => `- ${f}`).join("\n")}\n\n## Weightage: ${ch.weightage}%\n\n## Quick Revision\n${ch.summary}`,
  "Cheat Sheet": (book, ch) => `# Cheat Sheet: ${ch.title}\n\n${ch.topics.map((t, i) => `${i + 1}. ${t} — key concept #${i + 1}`).join("\n")}\n\n## Must Remember\n${ch.memoryTricks[0] || "Mnemonic anchor: visualize the structure first."}`,
  "One-Page Notes": (book, ch) => `# ${ch.title} — One-Pager\n\n**Summary:** ${ch.summary}\n\n**Topics:** ${ch.topics.join(" · ")}\n\n**Weightage:** ${ch.weightage}% • **Pages:** ${ch.pageEnd - ch.pageStart + 1} • **Time:** ${ch.estimatedReadingMinutes}m\n\n**Core takeaways:**\n${ch.keyPoints.slice(0, 3).map((p) => `- ${p}`).join("\n")}`,
  "Revision Notes": (book, ch) => `# Revision: ${ch.title}\n\n## Quick Recap\n${ch.summary}\n\n## Key Terms to Define\n${ch.definitions.map((d) => `- ${d.term}`).join("\n")}\n\n## Quick-Fire Q\n${ch.learningObjectives.map((o) => `Q: ${o}?\nA: See "${ch.topics[0]}" section.`).join("\n\n")}`,
};

export function KnowledgeWorkspace() {
  const engine = useKnowledgeEngine();
  const book = engine.state.books.find((b) => b.id === engine.state.ui.activeBookId) || null;
  const chapters = book ? engine.state.chapters[book.id] || [] : [];
  const formulas = book ? engine.state.formulas[book.id] || [] : [];
  const mindmap = book ? engine.state.mindmaps[book.id] : null;

  const [tab, setTab] = useState<KnTab>("notes");
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [showRough, setShowRough] = useState(false);
  const [roughNotes, setRoughNotes] = useState(() => localStorage.getItem("ef_rough_notes") || "");
  const [editingNotes, setEditingNotes] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [chapterForm, setChapterForm] = useState({ title: "", topics: "", summary: "", notes: "" });
  const [formulaForm, setFormulaForm] = useState({ title: "", equation: "", description: "", tags: "" });

  const activeChapter = chapters[activeChapterIndex];

  // Persist rough notes
  useEffect(() => {
    localStorage.setItem("ef_rough_notes", roughNotes);
  }, [roughNotes]);

  if (!book) {
    return <GlassCard padding="md"><EmptyState icon="BookOpen" title="No book selected" description="Pick a book from the Library to start working with AI knowledge materials." /></GlassCard>;
  }

  // ------ Chapter CRUD ------
  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterForm.title.trim()) return;
    if (editingChapterId) {
      engine.updateChapter(book.id, editingChapterId, {
        title: chapterForm.title,
        topics: chapterForm.topics.split(",").map((t) => t.trim()).filter(Boolean),
        summary: chapterForm.summary,
        notes: chapterForm.notes,
      });
    } else {
      const newChapter: Chapter = {
        id: nextId("ch"),
        index: chapters.length + 1,
        title: chapterForm.title,
        summary: chapterForm.summary,
        topics: chapterForm.topics.split(",").map((t) => t.trim()).filter(Boolean),
        notes: chapterForm.notes || `# ${chapterForm.title}\n\nStart writing your notes here.`,
        learningObjectives: [],
        weightage: 5,
        pageStart: 1,
        pageEnd: 10,
        estimatedReadingMinutes: 30,
        difficulty: "intermediate",
        keyPoints: [],
        definitions: [],
        importantFacts: [],
        memoryTricks: [],
      };
      engine.addChapter(book.id, newChapter);
    }
    setShowChapterModal(false);
    setEditingChapterId(null);
    setChapterForm({ title: "", topics: "", summary: "", notes: "" });
  };

  const handleApplyTemplate = (templateKey: string) => {
    if (!activeChapter) return;
    const tpl = NOTE_TEMPLATES[templateKey];
    if (!tpl) return;
    const generated = tpl(book, activeChapter);
    engine.updateChapter(book.id, activeChapter.id, { notes: generated });
    engine.toast.push(`Applied template: ${templateKey}`, { tone: "success" });
  };

  // ------ Formula CRUD ------
  const handleSaveFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formulaForm.title.trim()) return;
    engine.addFormula(book.id, {
      id: nextId("f"),
      title: formulaForm.title,
      equation: formulaForm.equation,
      description: formulaForm.description,
      chapterId: activeChapter?.id || "",
      tags: formulaForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      difficulty: "intermediate",
    });
    setShowFormulaModal(false);
    setFormulaForm({ title: "", equation: "", description: "", tags: "" });
  };

  return (
    <div className="space-y-6">
      {/* BOOK HEADER */}
      <GlassCard padding="md" tone="indigo">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-20 shrink-0">
            <BookCover title={book.title} subtitle={book.examName} coverColor={book.coverColor} size="sm" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{book.title}</h2>
              <Pill tone="indigo">{book.examName}</Pill>
              <Pill tone="amber">{book.difficulty}</Pill>
              <Pill tone="emerald">{book.pageCount} pages</Pill>
              {book.premium === "premium" && <Pill tone="amber" icon="Crown">Premium</Pill>}
              {book.isFeatured && <Pill tone="violet" icon="Star">Featured</Pill>}
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">{book.description}</p>
            <div className="flex items-center gap-3 flex-wrap text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>By {book.author}</span>
              <span>•</span>
              <span>{book.publisher}</span>
              <span>•</span>
              <span>{book.edition}</span>
              <span>•</span>
              <span>{book.publicationYear}</span>
              <span>•</span>
              <span>OCR {book.ocrConfidence}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button tone="secondary" size="sm" icon="RefreshCw" onClick={() => {
              // Regenerate notes for all chapters
              chapters.forEach((ch) => {
                const tpl = NOTE_TEMPLATES["Detailed Notes"];
                engine.updateChapter(book.id, ch.id, { notes: tpl(book, ch) });
              });
              engine.toast.push("Notes regenerated", { tone: "success", detail: "All chapters refreshed with AI templates." });
            }}>Regenerate All</Button>
            <Button tone="primary" size="sm" icon="Download" onClick={() => engine.setTab("downloads")}>Download Pack</Button>
          </div>
        </div>
      </GlassCard>

      {/* TAB BAR */}
      <TabsBar<KnTab>
        variant="underline"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "notes", label: "Notes", icon: "FileText", count: chapters.length },
          { id: "mindmap", label: "Mind Map", icon: "GitBranch" },
          { id: "formulas", label: "Formulas", icon: "Sigma", count: formulas.length },
          { id: "summary", label: "Summary", icon: "BookText" },
          { id: "metadata", label: "Metadata", icon: "Tag" },
          { id: "raw", label: "Raw Data", icon: "Database" },
        ]}
      />

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {tab === "notes" && (
            <NotesTab
              book={book}
              chapters={chapters}
              activeChapterIndex={activeChapterIndex}
              setActiveChapterIndex={setActiveChapterIndex}
              showRough={showRough}
              setShowRough={setShowRough}
              roughNotes={roughNotes}
              setRoughNotes={setRoughNotes}
              editingNotes={editingNotes}
              setEditingNotes={setEditingNotes}
              onApplyTemplate={handleApplyTemplate}
              onAddChapter={() => {
                setEditingChapterId(null);
                setChapterForm({ title: "", topics: "", summary: "", notes: "" });
                setShowChapterModal(true);
              }}
              onEditChapter={(ch) => {
                setEditingChapterId(ch.id);
                setChapterForm({ title: ch.title, topics: ch.topics.join(", "), summary: ch.summary, notes: ch.notes });
                setShowChapterModal(true);
              }}
              onDeleteChapter={(id) => engine.deleteChapter(book.id, id)}
            />
          )}

          {tab === "mindmap" && (
            <MindMapTab mindmap={mindmap} book={book} chapters={chapters} />
          )}

          {tab === "formulas" && (
            <FormulasTab
              book={book}
              formulas={formulas}
              chapters={chapters}
              onAdd={() => {
                setFormulaForm({ title: "", equation: "", description: "", tags: "" });
                setShowFormulaModal(true);
              }}
              onDelete={(id) => engine.deleteFormula(book.id, id)}
            />
          )}

          {tab === "summary" && (
            <SummaryTab book={book} chapters={chapters} />
          )}

          {tab === "metadata" && (
            <MetadataTab book={book} onUpdate={(patch) => engine.updateBook(book.id, patch)} />
          )}

          {tab === "raw" && (
            <RawDataTab book={book} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* CHAPTER MODAL */}
      <Modal
        open={showChapterModal}
        onClose={() => setShowChapterModal(false)}
        title={editingChapterId ? "Edit Chapter" : "Add Chapter"}
        subtitle="Edit chapter outline and content"
        maxWidth="2xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button tone="secondary" onClick={() => setShowChapterModal(false)}>Cancel</Button>
            <Button tone="primary" onClick={handleSaveChapter} icon="Save">{editingChapterId ? "Save Changes" : "Add Chapter"}</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveChapter} className="space-y-3">
          <Input label="Chapter Title" value={chapterForm.title} onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })} placeholder="e.g. Chapter 4: Quantum Telemetry" required />
          <Input label="Topics (comma separated)" value={chapterForm.topics} onChange={(e) => setChapterForm({ ...chapterForm, topics: e.target.value })} placeholder="e.g. Calibration, Transduction, Matrices" />
          <Textarea label="Summary" rows={3} value={chapterForm.summary} onChange={(e) => setChapterForm({ ...chapterForm, summary: e.target.value })} placeholder="High-level summary of this chapter..." />
          <Textarea label="Notes (Markdown)" rows={8} value={chapterForm.notes} onChange={(e) => setChapterForm({ ...chapterForm, notes: e.target.value })} placeholder="# Chapter Title\n\nStart typing notes..." />
        </form>
      </Modal>

      {/* FORMULA MODAL */}
      <Modal
        open={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        title="Add Formula"
        subtitle="Capture equations, LaTeX, and reference notes"
        footer={
          <div className="flex justify-end gap-2">
            <Button tone="secondary" onClick={() => setShowFormulaModal(false)}>Cancel</Button>
            <Button tone="primary" onClick={handleSaveFormula} icon="Save">Save Formula</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveFormula} className="space-y-3">
          <Input label="Title" value={formulaForm.title} onChange={(e) => setFormulaForm({ ...formulaForm, title: e.target.value })} required />
          <Input label="Equation (LaTeX)" value={formulaForm.equation} onChange={(e) => setFormulaForm({ ...formulaForm, equation: e.target.value })} placeholder="e.g. E = mc^2" />
          <Textarea label="Description" rows={3} value={formulaForm.description} onChange={(e) => setFormulaForm({ ...formulaForm, description: e.target.value })} />
          <Input label="Tags (comma separated)" value={formulaForm.tags} onChange={(e) => setFormulaForm({ ...formulaForm, tags: e.target.value })} placeholder="e.g. core, mechanics" />
        </form>
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NOTES TAB
// ---------------------------------------------------------------------------

interface NotesTabProps {
  book: BookMetadata;
  chapters: Chapter[];
  activeChapterIndex: number;
  setActiveChapterIndex: (i: number) => void;
  showRough: boolean;
  setShowRough: (v: boolean) => void;
  roughNotes: string;
  setRoughNotes: (s: string) => void;
  editingNotes: boolean;
  setEditingNotes: (v: boolean) => void;
  onApplyTemplate: (templateKey: string) => void;
  onAddChapter: () => void;
  onEditChapter: (ch: Chapter) => void;
  onDeleteChapter: (id: string) => void;
}

function NotesTab({ book, chapters, activeChapterIndex, setActiveChapterIndex, showRough, setShowRough, roughNotes, setRoughNotes, editingNotes, setEditingNotes, onApplyTemplate, onAddChapter, onEditChapter, onDeleteChapter }: NotesTabProps) {
  const engine = useKnowledgeEngine();
  const activeChapter = chapters[activeChapterIndex];

  if (chapters.length === 0) {
    return <GlassCard padding="md"><EmptyState icon="BookOpen" title="No chapters yet" description="Add the first chapter outline to start generating AI notes." action={<Button tone="primary" icon="Plus" onClick={onAddChapter}>Add Chapter</Button>} /></GlassCard>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* CHAPTER LIST */}
      <div className="space-y-4">
        <GlassCard padding="md">
          <SectionHeader icon="ListOrdered" title="Chapters" subtitle={`${chapters.length} sections`} right={<IconButton icon="Plus" tone="indigo" onClick={onAddChapter} />} />
          <div className="mt-3 space-y-1 max-h-[480px] overflow-y-auto pr-1">
            {chapters.map((ch, idx) => (
              <div
                key={ch.id}
                onClick={() => setActiveChapterIndex(idx)}
                className={`group p-2.5 rounded-2xl border cursor-pointer transition ${activeChapterIndex === idx
                  ? "border-indigo-300 bg-indigo-50/40"
                  : "border-slate-200 bg-white/40 hover:bg-white"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md text-[9px] font-extrabold flex items-center justify-center shrink-0 ${activeChapterIndex === idx ? "bg-indigo-500 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                    {idx + 1}
                  </div>
                  <p className={`text-[11px] font-extrabold leading-tight line-clamp-2 flex-1 ${activeChapterIndex === idx ? "text-slate-800" : "text-slate-600"}`}>
                    {ch.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <span>{ch.topics.length} topics</span>
                  <span>•</span>
                  <span>{ch.weightage}%</span>
                  <span>•</span>
                  <span>{ch.estimatedReadingMinutes}m</span>
                </div>
                <div className="hidden group-hover:flex items-center gap-1 mt-2">
                  <IconButton icon="Edit2" size="xs" onClick={(e) => { e?.stopPropagation(); onEditChapter(ch); }} />
                  <IconButton icon="Trash2" size="xs" tone="danger" onClick={(e) => { e?.stopPropagation(); if (confirm("Delete this chapter?")) onDeleteChapter(ch.id); }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Chapter metadata */}
        {activeChapter && (
          <GlassCard padding="md" tone="amber">
            <SectionHeader icon="Sparkles" title="Quick Insights" subtitle={`Chapter ${activeChapterIndex + 1}`} size="sm" />
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-extrabold uppercase tracking-wider text-slate-500">Weightage</span>
                <span className="font-black text-amber-600">{activeChapter.weightage}%</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-extrabold uppercase tracking-wider text-slate-500">Pages</span>
                <span className="font-black text-slate-700">{activeChapter.pageStart}–{activeChapter.pageEnd}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-extrabold uppercase tracking-wider text-slate-500">Reading time</span>
                <span className="font-black text-slate-700">{formatMinutes(activeChapter.estimatedReadingMinutes)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-extrabold uppercase tracking-wider text-slate-500">Difficulty</span>
                <Pill tone="indigo">{activeChapter.difficulty}</Pill>
              </div>
            </div>
            {activeChapter.learningObjectives.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-100">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Learning Objectives</p>
                <ul className="space-y-1">
                  {activeChapter.learningObjectives.map((lo, i) => (
                    <li key={i} className="text-[10px] text-slate-600 font-medium flex items-start gap-1.5">
                      <Lucide.CheckCircle2 className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                      <span>{lo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </GlassCard>
        )}
      </div>

      {/* NOTES EDITOR */}
      <div className="lg:col-span-3 space-y-4">
        <GlassCard padding="md">
          <SectionHeader
            icon="FileText"
            title={activeChapter?.title || "Chapter Notes"}
            subtitle="AI-generated, fully editable"
            right={
              <div className="flex items-center gap-2">
                <Button tone="ghost" size="sm" icon={showRough ? "FileText" : "FileEdit"} onClick={() => setShowRough(!showRough)}>
                  {showRough ? "Hide" : "Show"} Rough
                </Button>
                <Button tone="primary" size="sm" icon="Wand2" onClick={() => {
                  const template = prompt("Apply template: 'Detailed Notes', 'Exam Notes', 'Cheat Sheet', 'One-Page Notes', 'Revision Notes'");
                  if (template) onApplyTemplate(template);
                }}>Apply Template</Button>
              </div>
            }
          />

          {/* TEMPLATE PILLS */}
          <div className="flex flex-wrap gap-1.5 mt-4 pb-3 border-b border-slate-100">
            {Object.keys(NOTE_TEMPLATES).map((key) => (
              <button
                key={key}
                onClick={() => onApplyTemplate(key)}
                className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition"
              >
                {key}
              </button>
            ))}
            <div className="flex-1" />
            <Button tone="ghost" size="sm" icon="Copy" onClick={() => { copyToClipboard(activeChapter?.notes || ""); engine.toast.push("Notes copied to clipboard", { tone: "success" }); }}>Copy</Button>
            <Button tone="ghost" size="sm" icon="Download" onClick={() => downloadMarkdown(activeChapter?.notes || "", `${activeChapter?.title || "notes"}.md`)}>Export</Button>
          </div>

          <div className={`grid grid-cols-1 ${showRough ? "md:grid-cols-2" : ""} gap-3 mt-3`}>
            <textarea
              value={activeChapter?.notes || ""}
              onChange={(e) => activeChapter && engine.updateChapter(book.id, activeChapter.id, { notes: e.target.value })}
              readOnly={!editingNotes}
              className="w-full min-h-[480px] p-4 bg-white border border-slate-200 rounded-2xl outline-none font-mono text-xs text-slate-700 leading-relaxed focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
            {showRough && (
              <textarea
                value={roughNotes}
                onChange={(e) => setRoughNotes(e.target.value)}
                placeholder="Scratchpad: paste raw content, scribble equations, write quick thoughts..."
                className="w-full min-h-[480px] p-4 bg-amber-50/30 border border-amber-200 rounded-2xl outline-none font-mono text-xs text-slate-700 leading-relaxed focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
              />
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MINDMAP TAB
// ---------------------------------------------------------------------------

function MindMapTab({ mindmap, book, chapters }: { mindmap: any; book: BookMetadata; chapters: Chapter[] }) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  if (!mindmap) {
    return <GlassCard padding="md"><EmptyState icon="GitBranch" title="No mind map available" /></GlassCard>;
  }

  const selectedNodeData = mindmap.nodes.find((n: any) => n.id === selectedNode);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <GlassCard padding="md" className="lg:col-span-2">
        <SectionHeader
          icon="GitBranch"
          title="Concept Mind Map"
          subtitle="Interactive visual map of all chapters and topics"
          right={
            <div className="flex items-center gap-2">
              <Button tone="ghost" size="sm" icon="ZoomIn" onClick={() => setZoom((z) => Math.min(2, z + 0.2))} />
              <span className="text-xs font-extrabold text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
              <Button tone="ghost" size="sm" icon="ZoomOut" onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))} />
              <Button tone="ghost" size="sm" icon="Maximize" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset</Button>
            </div>
          }
        />
        <div className="relative mt-4 aspect-[16/10] bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(99, 102, 241, 0.07) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="-400 -300 800 600"
            style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`, transition: "transform 0.3s" }}
          >
            <defs>
              <radialGradient id="mindmap-core" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </radialGradient>
            </defs>

            {/* Connection lines */}
            {mindmap.nodes.map((node: any) => {
              if (node.level === 0 || !node.parentId) return null;
              const parent = mindmap.nodes.find((n: any) => n.id === node.parentId);
              if (!parent) return null;
              const isHighlighted = selectedNode === node.id || selectedNode === parent.id;
              return (
                <line
                  key={`line-${node.id}`}
                  x1={parent.x}
                  y1={parent.y}
                  x2={node.x}
                  y2={node.y}
                  stroke={isHighlighted ? "#6366f1" : "#cbd5e1"}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeOpacity={isHighlighted ? 1 : 0.6}
                  className="transition-all"
                />
              );
            })}

            {/* Nodes */}
            {mindmap.nodes.map((node: any) => {
              const isCore = node.level === 0;
              const isSelected = selectedNode === node.id;
              const r = isCore ? 36 : node.level === 1 ? 26 : 18;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                  className="cursor-pointer"
                  style={{ transition: "transform 0.2s" }}
                >
                  <circle
                    r={r + 3}
                    fill={isSelected ? "#6366f1" : "transparent"}
                    opacity={isSelected ? 0.15 : 0}
                    className="transition-all"
                  />
                  <circle
                    r={r}
                    fill={isCore ? "url(#mindmap-core)" : node.color || "#94a3b8"}
                    stroke={isSelected ? "#fff" : "transparent"}
                    strokeWidth={isSelected ? 3 : 0}
                    className="transition-all"
                  />
                  <text
                    textAnchor="middle"
                    dy={isCore ? 5 : 4}
                    fill="white"
                    fontSize={isCore ? 11 : node.level === 1 ? 9 : 8}
                    fontWeight="800"
                    className="pointer-events-none uppercase tracking-wider"
                  >
                    {node.label.length > (isCore ? 8 : node.level === 1 ? 12 : 14) ? node.label.slice(0, isCore ? 8 : node.level === 1 ? 12 : 14) + "…" : node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Selection details */}
          {selectedNodeData && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-2xl p-3 border border-slate-200 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: selectedNodeData.color || "#6366f1" }}>
                  <Lucide.BookOpen className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Node</p>
                  <p className="text-sm font-black text-slate-800 truncate">{selectedNodeData.label}</p>
                  {selectedNodeData.description && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{selectedNodeData.description}</p>}
                </div>
                <IconButton icon="X" size="xs" onClick={() => setSelectedNode(null)} />
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>

      {/* Chapters list (legend) */}
      <GlassCard padding="md">
        <SectionHeader icon="Palette" title="Chapter Legend" subtitle={`${chapters.length} sections`} />
        <div className="mt-3 space-y-1.5">
          {chapters.map((ch, i) => {
            const node = mindmap.nodes.find((n: any) => n.label === ch.title);
            return (
              <div key={ch.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer" onClick={() => node && setSelectedNode(node.id)}>
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: node?.color || "#94a3b8" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold text-slate-800 truncate">{ch.title}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{ch.topics.length} topics · {ch.weightage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FORMULAS TAB
// ---------------------------------------------------------------------------

function FormulasTab({ book, formulas, chapters, onAdd, onDelete }: { book: BookMetadata; formulas: Formula[]; chapters: Chapter[]; onAdd: () => void; onDelete: (id: string) => void }) {
  return (
    <GlassCard padding="md">
      <SectionHeader icon="Sigma" title="Formula Sheet" subtitle={`${formulas.length} equations extracted by AI`} right={<Button tone="primary" size="sm" icon="Plus" onClick={onAdd}>Add Formula</Button>} />
      {formulas.length === 0 ? (
        <EmptyState icon="Sigma" title="No formulas captured" description="Formulas extracted by OCR + AI will appear here." action={<Button tone="primary" icon="Plus" onClick={onAdd}>Add Formula</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {formulas.map((f) => {
            const chapter = chapters.find((c) => c.id === f.chapterId);
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="group p-4 rounded-2xl border border-slate-200 bg-white/60 hover:bg-white hover:border-indigo-200 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-800 tracking-tight">{f.title}</h4>
                    {chapter && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{chapter.title}</p>}
                  </div>
                  <IconButton icon="Trash2" size="xs" tone="danger" onClick={() => onDelete(f.id)} />
                </div>
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 font-mono text-sm text-slate-800 overflow-x-auto">
                  {f.equation}
                </div>
                {f.description && <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{f.description}</p>}
                {f.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {f.tags.map((t) => <Pill key={t} tone="indigo">{t}</Pill>)}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// SUMMARY TAB
// ---------------------------------------------------------------------------

function SummaryTab({ book, chapters }: { book: BookMetadata; chapters: Chapter[] }) {
  const engine = useKnowledgeEngine();
  const fullSummary = useMemo(() => {
    return `# ${book.title}\n\n${book.description || "Auto-generated comprehensive summary."}\n\n## Chapters Overview\n${chapters.map((c, i) => `${i + 1}. **${c.title}** (${c.weightage}%) — ${c.summary}`).join("\n\n")}\n\n## Key Themes\n${chapters.flatMap((c) => c.keyPoints).slice(0, 10).map((p) => `- ${p}`).join("\n")}`;
  }, [book, chapters]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <GlassCard padding="md">
          <SectionHeader icon="BookText" title="Book Summary" subtitle="AI-generated overview" right={<Button tone="primary" size="sm" icon="Download" onClick={() => downloadMarkdown(fullSummary, `${book.title}-summary.md`)}>Export</Button>} />
          <div className="mt-4 prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
            {fullSummary}
          </div>
        </GlassCard>

        <GlassCard padding="md">
          <SectionHeader icon="Key" title="Key Takeaways" subtitle="Most important concepts" />
          <div className="mt-3 space-y-2">
            {chapters.flatMap((c) => c.keyPoints).slice(0, 8).map((kp, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {i + 1}
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">{kp}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <GlassCard padding="md">
          <SectionHeader icon="Target" title="Learning Objectives" />
          <div className="mt-3 space-y-1.5">
            {chapters.flatMap((c) => c.learningObjectives).slice(0, 8).map((lo, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-xl">
                <Lucide.ChevronRight className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-700 font-medium leading-snug">{lo}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard padding="md" tone="emerald">
          <SectionHeader icon="Brain" title="Memory Tricks" subtitle="Mnemonics to lock concepts" tone="emerald" size="sm" />
          <div className="mt-3 space-y-1.5">
            {chapters.flatMap((c) => c.memoryTricks).slice(0, 6).map((m, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-white/60">
                <Lucide.Sparkles className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-700 font-medium leading-snug">{m}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// METADATA TAB
// ---------------------------------------------------------------------------

function MetadataTab({ book, onUpdate }: { book: BookMetadata; onUpdate: (patch: Partial<BookMetadata>) => void }) {
  const [form, setForm] = useState({
    title: book.title,
    subtitle: book.subtitle || "",
    author: book.author,
    publisher: book.publisher,
    edition: book.edition,
    publicationYear: book.publicationYear,
    language: book.language,
    isbn: book.isbn || "",
    description: book.description || "",
    difficulty: book.difficulty,
    visibility: book.visibility,
    premium: book.premium,
    tags: book.tags.join(", "),
  });

  useEffect(() => {
    setForm({
      title: book.title, subtitle: book.subtitle || "", author: book.author, publisher: book.publisher,
      edition: book.edition, publicationYear: book.publicationYear, language: book.language,
      isbn: book.isbn || "", description: book.description || "", difficulty: book.difficulty,
      visibility: book.visibility, premium: book.premium, tags: book.tags.join(", "),
    });
  }, [book]);

  return (
    <GlassCard padding="md">
      <SectionHeader icon="Tag" title="Book Metadata" subtitle="Edit book details and visibility" right={<Button tone="primary" size="sm" icon="Save" onClick={() => {
        onUpdate({
          title: form.title, subtitle: form.subtitle, author: form.author, publisher: form.publisher,
          edition: form.edition, publicationYear: form.publicationYear, language: form.language,
          isbn: form.isbn, description: form.description, difficulty: form.difficulty,
          visibility: form.visibility, premium: form.premium, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        });
      }}>Save All</Button>} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <Input label="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        <Input label="Publisher" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
        <Input label="Edition" value={form.edition} onChange={(e) => setForm({ ...form, edition: e.target.value })} />
        <Input label="Publication Year" value={form.publicationYear} onChange={(e) => setForm({ ...form, publicationYear: e.target.value })} />
        <Input label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
        <Input label="ISBN" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
        <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })} options={[
          { value: "beginner", label: "Beginner" }, { value: "intermediate", label: "Intermediate" }, { value: "advanced", label: "Advanced" }, { value: "expert", label: "Expert" },
        ]} />
        <Select label="Visibility" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as any })} options={[
          { value: "public", label: "Public" }, { value: "private", label: "Private" }, { value: "unlisted", label: "Unlisted" },
        ]} />
        <Select label="Premium" value={form.premium} onChange={(e) => setForm({ ...form, premium: e.target.value as any })} options={[
          { value: "free", label: "Free" }, { value: "premium", label: "Premium" }, { value: "enterprise", label: "Enterprise" },
        ]} />
        <Input label="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      </div>
      <div className="mt-4">
        <Textarea label="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// RAW DATA TAB
// ---------------------------------------------------------------------------

function RawDataTab({ book }: { book: BookMetadata }) {
  const engine = useKnowledgeEngine();
  const data = useMemo(() => {
    return {
      book,
      chapters: engine.state.chapters[book.id] || [],
      formulas: engine.state.formulas[book.id] || [],
      flashcards: engine.state.flashcards[book.id] || [],
      questions: engine.state.questions[book.id] || [],
      analytics: engine.state.analytics[book.id] || null,
    };
  }, [book, engine.state]);

  return (
    <GlassCard padding="md">
      <SectionHeader icon="Database" title="Raw Data Export" subtitle="Inspect or export the full data model for this book" right={
        <div className="flex items-center gap-2">
          <Button tone="secondary" size="sm" icon="Copy" onClick={() => { copyToClipboard(JSON.stringify(data, null, 2)); engine.toast.push("Copied to clipboard", { tone: "success" }); }}>Copy</Button>
          <Button tone="primary" size="sm" icon="Download" onClick={() => downloadJson(data, `${book.title}.json`)}>Download JSON</Button>
        </div>
      } />
      <pre className="mt-4 max-h-[600px] overflow-auto p-4 bg-slate-900 text-slate-300 rounded-2xl text-[10px] leading-relaxed font-mono">
        {JSON.stringify(data, null, 2)}
      </pre>
    </GlassCard>
  );
}

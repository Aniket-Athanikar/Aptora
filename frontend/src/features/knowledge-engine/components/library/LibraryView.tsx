"use client";


import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

import { useKnowledgeEngine } from "../../context";
import { GlassCard, SectionHeader, Pill, Button, IconButton, Input, Select, BookCover, EmptyState, ProgressRing, Modal } from "../common/Primitives";
import { formatBytes, formatRelativeTime, formatMinutes, nextId } from "../../utils";
import { statusToTone } from "../../utils";
import type { BookMetadata, LibraryViewMode } from "../../types";

export function LibraryView() {
  const engine = useKnowledgeEngine();
  const f = engine.state.filters;
  const u = engine.state.ui;

  // ---- filtered & sorted books ----
  const filtered = useMemo(() => {
    const list = engine.state.books.filter((b) => {
      // Search
      if (f.search) {
        const q = f.search.toLowerCase();
        const matches =
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.description || "").toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.examName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Folder
      if (f.folder !== "All Books" && b.folder !== f.folder) return false;
      // Exam
      if (f.exam !== "all" && b.examName !== f.exam) return false;
      // Status
      if (f.status !== "all" && b.status !== f.status) return false;
      // Difficulty
      if (f.difficulty !== "all" && b.difficulty !== f.difficulty) return false;
      // Premium
      if (f.premium !== "all" && b.premium !== f.premium) return false;
      // Favorites
      if (f.favoritesOnly && !b.isFavorite) return false;
      // Pinned
      if (f.pinnedOnly && !b.isPinned) return false;
      return true;
    });

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (f.sortBy) {
        case "title": cmp = a.title.localeCompare(b.title); break;
        case "updated": cmp = (a.updatedAt || "").localeCompare(b.updatedAt || ""); break;
        case "created": cmp = (a.uploadedAt || "").localeCompare(b.uploadedAt || ""); break;
        case "score": cmp = b.qualityScore - a.qualityScore; break;
        case "pages": cmp = b.pageCount - a.pageCount; break;
        case "size": cmp = b.sizeBytes - a.sizeBytes; break;
      }
      return f.sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [engine.state.books, f]);

  // ---- pagination ----
  const [page, setPage] = useState(1);
  const perPage = 9;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  React.useEffect(() => {
    setPage(1);
  }, [f]);

  // ---- stats ----
  const stats = useMemo(() => ({
    total: engine.state.books.length,
    filtered: filtered.length,
    pages: engine.state.books.reduce((s, b) => s + b.pageCount, 0),
    storage: engine.state.books.reduce((s, b) => s + b.sizeBytes, 0),
    pinned: engine.state.books.filter((b) => b.isPinned).length,
    favorites: engine.state.books.filter((b) => b.isFavorite).length,
    processing: engine.state.books.filter((b) => b.status === "processing" || b.status === "queued").length,
  }), [engine.state.books, filtered]);

  // ---- add folder ----
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  return (
    <div className="space-y-6">
      {/* STATS HEADER */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total", val: stats.total, icon: "BookOpen", tone: "indigo" as const },
          { label: "Filtered", val: stats.filtered, icon: "Filter", tone: "sky" as const },
          { label: "Pinned", val: stats.pinned, icon: "Pin", tone: "violet" as const },
          { label: "Favorites", val: stats.favorites, icon: "Star", tone: "amber" as const },
          { label: "Processing", val: stats.processing, icon: "Loader", tone: "rose" as const },
          { label: "Total Pages", val: stats.pages.toLocaleString(), icon: "File", tone: "emerald" as const },
          { label: "Storage", val: formatBytes(stats.storage), icon: "HardDrive", tone: "indigo" as const },
        ].map((s) => {
          const Icon = (Lucide as any)[s.icon];
          const toneCls = {
            indigo: "from-indigo-500 to-violet-500",
            sky: "from-sky-500 to-cyan-500",
            violet: "from-violet-500 to-fuchsia-500",
            amber: "from-amber-500 to-orange-500",
            rose: "from-rose-500 to-pink-500",
            emerald: "from-emerald-500 to-teal-500",
          }[s.tone];
          return (
            <div key={s.label} className="bg-white/80 border border-slate-200/60 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${toneCls} text-white flex items-center justify-center`}>
                  <Icon className="w-2.5 h-2.5" />
                </div>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">{s.label}</p>
              </div>
              <p className="text-lg font-black text-slate-800 tracking-tight truncate">{s.val}</p>
            </div>
          );
        })}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* FOLDERS SIDEBAR */}
        <div className="space-y-4">
          <GlassCard padding="md">
            <SectionHeader icon="FolderOpen" title="Folders" subtitle="Organize your library" right={
              <IconButton icon="Plus" size="xs" onClick={() => setShowAddFolder(true)} title="Add Folder" />
            } size="sm" />
            <div className="space-y-1 mt-3">
              {engine.state.folders.map((folder) => {
                const count = engine.state.books.filter((b) => folder === "All Books" || b.folder === folder).length;
                const isActive = f.folder === folder;
                return (
                  <button
                    key={folder}
                    onClick={() => engine.setFilters({ folder })}
                    className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition ${isActive ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <Lucide.Folder className="w-3.5 h-3.5" />
                      <span className="font-extrabold">{folder}</span>
                    </span>
                    <span className={`text-[10px] font-extrabold ${isActive ? "text-white/80" : "text-slate-400"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* TAGS */}
          <GlassCard padding="md">
            <SectionHeader icon="Tag" title="Popular Tags" size="sm" />
            <div className="flex flex-wrap gap-1 mt-3">
              {engine.state.tags.slice(0, 12).map((tag) => (
                <button
                  key={tag}
                  onClick={() => engine.setFilters({ search: tag })}
                  className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* COMPARE MODE */}
          <GlassCard padding="md" tone={u.compareMode ? "indigo" : "default"}>
            <SectionHeader
              icon="GitCompare"
              title="Compare"
              subtitle="Side-by-side"
              size="sm"
              right={
                <button
                  onClick={engine.toggleCompareMode}
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg transition ${u.compareMode ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  {u.compareMode ? "On" : "Off"}
                </button>
              }
            />
            {u.compareMode && (
              <div className="mt-3 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select up to 2 books to compare</p>
                <div className="space-y-1">
                  {u.compareBookIds.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic">Click &quot;Compare&quot; on any book card</p>
                  )}
                  {u.compareBookIds.map((id) => {
                    const b = engine.state.books.find((x) => x.id === id);
                    return b ? (
                      <div key={id} className="flex items-center gap-2 p-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                        <div className="w-6 h-8 rounded bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
                        <p className="text-[10px] font-extrabold text-slate-700 flex-1 truncate">{b.title}</p>
                        <IconButton icon="X" size="xs" onClick={() => engine.toggleCompareBook(id)} />
                      </div>
                    ) : null;
                  })}
                </div>
                {u.compareBookIds.length === 2 && <CompareView ids={u.compareBookIds} />}
              </div>
            )}
          </GlassCard>
        </div>

        {/* BOOKS LIST */}
        <div className="lg:col-span-3 space-y-4">
          {/* TOOLBAR */}
          <GlassCard padding="sm">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Lucide.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={f.search}
                  onChange={(e) => engine.setFilters({ search: e.target.value })}
                  placeholder="Search books, authors, tags..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-400"
                />
              </div>
              <Select value={f.exam} onChange={(e) => engine.setFilters({ exam: e.target.value })} className="!w-32" options={[
                { value: "all", label: "All Exams" },
                { value: "GATE", label: "GATE" },
                { value: "UPSC", label: "UPSC" },
                { value: "NEET", label: "NEET" },
                { value: "JEE Advanced", label: "JEE" },
                { value: "CAT", label: "CAT" },
                { value: "SSC CGL", label: "SSC" },
              ]} />
              <Select value={f.difficulty} onChange={(e) => engine.setFilters({ difficulty: e.target.value as any })} className="!w-32" options={[
                { value: "all", label: "All Levels" },
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
                { value: "expert", label: "Expert" },
              ]} />
              <Select value={f.sortBy} onChange={(e) => engine.setSort(e.target.value as any)} className="!w-36" options={[
                { value: "updated", label: "Recently Updated" },
                { value: "created", label: "Recently Added" },
                { value: "title", label: "Title A-Z" },
                { value: "score", label: "Highest Quality" },
                { value: "pages", label: "Most Pages" },
                { value: "size", label: "Largest Size" },
              ]} />
              <button
                onClick={() => engine.setSort(f.sortBy, f.sortDir === "asc" ? "desc" : "asc")}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                title="Toggle sort direction"
              >
                {f.sortDir === "asc" ? <Lucide.ArrowUp className="w-3.5 h-3.5" /> : <Lucide.ArrowDown className="w-3.5 h-3.5" />}
              </button>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(["grid", "list", "table"] as const).map((v) => {
                  const Icon = v === "grid" ? Lucide.LayoutGrid : v === "list" ? Lucide.List : Lucide.Table;
                  return (
                    <button
                      key={v}
                      onClick={() => engine.setView(v)}
                      className={`p-1.5 rounded-lg transition ${f.view === v ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                      title={v}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
              <IconButton icon={f.favoritesOnly ? "Star" : "Star"} tone={f.favoritesOnly ? "amber" : "default"} onClick={() => engine.setFilters({ favoritesOnly: !f.favoritesOnly })} title="Favorites only" />
              <IconButton icon={f.pinnedOnly ? "Pin" : "Pin"} tone={f.pinnedOnly ? "indigo" : "default"} onClick={() => engine.setFilters({ pinnedOnly: !f.pinnedOnly })} title="Pinned only" />
              <Button tone={u.bulkMode ? "primary" : "secondary"} size="sm" icon="CheckSquare" onClick={engine.toggleBulkMode}>{u.bulkMode ? "Bulk On" : "Bulk"}</Button>
              {(f.search || f.exam !== "all" || f.difficulty !== "all" || f.folder !== "All Books" || f.favoritesOnly || f.pinnedOnly) && (
                <Button tone="ghost" size="sm" icon="X" onClick={engine.resetFilters}>Clear</Button>
              )}
            </div>
          </GlassCard>

          {/* BULK TOOLBAR */}
          <AnimatePresence>
            {u.bulkMode && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
              >
                <GlassCard padding="sm" tone="indigo">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                      {u.bulkSelectedIds.length} selected
                    </span>
                    <div className="flex-1" />
                    <Button tone="secondary" size="sm" icon="FolderInput" onClick={() => {
                      const folder = prompt("Move to folder:");
                      if (folder) engine.bulkMove(folder);
                    }}>Move</Button>
                    <Button tone="success" size="sm" icon="Upload" onClick={() => engine.bulkPublish(true)}>Publish</Button>
                    <Button tone="amber" size="sm" icon="Archive" onClick={() => engine.bulkArchive(true)}>Archive</Button>
                    <Button tone="secondary" size="sm" icon="Star" onClick={() => engine.bulkFeature(true)}>Feature</Button>
                    <Button tone="danger" size="sm" icon="Trash2" onClick={() => {
                      if (confirm(`Delete ${u.bulkSelectedIds.length} books?`)) engine.bulkDelete();
                    }}>Delete</Button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BOOK LIST */}
          {paginated.length === 0 ? (
            <GlassCard padding="md">
              <EmptyState icon="BookOpen" title="No books found" description="Try adjusting your filters or upload a new book." />
            </GlassCard>
          ) : f.view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginated.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isActive={u.activeBookId === book.id}
                  isBulkMode={u.bulkMode}
                  isSelected={u.bulkSelectedIds.includes(book.id)}
                  isComparing={u.compareBookIds.includes(book.id)}
                  onSelect={() => { engine.setActiveBook(book.id); engine.setTab("knowledge"); }}
                  onToggleBulk={() => {
                    if (u.bulkSelectedIds.includes(book.id)) {
                      engine.setBulkSelected(u.bulkSelectedIds.filter((id) => id !== book.id));
                    } else {
                      engine.setBulkSelected([...u.bulkSelectedIds, book.id]);
                    }
                  }}
                  onToggleCompare={() => engine.toggleCompareBook(book.id)}
                />
              ))}
            </div>
          ) : f.view === "list" ? (
            <div className="space-y-2">
              {paginated.map((book) => (
                <BookListItem
                  key={book.id}
                  book={book}
                  isActive={u.activeBookId === book.id}
                  isBulkMode={u.bulkMode}
                  isSelected={u.bulkSelectedIds.includes(book.id)}
                  onSelect={() => { engine.setActiveBook(book.id); engine.setTab("knowledge"); }}
                  onToggleBulk={() => {
                    if (u.bulkSelectedIds.includes(book.id)) {
                      engine.setBulkSelected(u.bulkSelectedIds.filter((id) => id !== book.id));
                    } else {
                      engine.setBulkSelected([...u.bulkSelectedIds, book.id]);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <BookTable books={paginated} activeId={u.activeBookId} onSelect={(id) => { engine.setActiveBook(id); engine.setTab("knowledge"); }} />
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <GlassCard padding="sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Page {page} of {totalPages} · {filtered.length} books
                </span>
                <div className="flex items-center gap-1.5">
                  <Button tone="secondary" size="sm" icon="ChevronLeft" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-extrabold ${p === page ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <Button tone="secondary" size="sm" iconRight="ChevronRight" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* ADD FOLDER MODAL */}
      <Modal open={showAddFolder} onClose={() => setShowAddFolder(false)} title="New Folder" maxWidth="sm" footer={
        <div className="flex justify-end gap-2">
          <Button tone="secondary" onClick={() => setShowAddFolder(false)}>Cancel</Button>
          <Button tone="primary" icon="Save" onClick={() => { engine.addFolder(newFolderName); setNewFolderName(""); setShowAddFolder(false); }}>Create</Button>
        </div>
      }>
        <Input label="Folder Name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="e.g. Practice Sets" />
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BOOK CARD (grid view)
// ---------------------------------------------------------------------------

function BookCard({ book, isActive, isBulkMode, isSelected, isComparing, onSelect, onToggleBulk, onToggleCompare }: { book: BookMetadata; isActive: boolean; isBulkMode: boolean; isSelected: boolean; isComparing: boolean; onSelect: () => void; onToggleBulk: () => void; onToggleCompare: () => void }) {
  const engine = useKnowledgeEngine();
  const status = statusToTone(book.status);
  const analytics = engine.state.analytics[book.id];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`group relative overflow-hidden bg-white/80 border rounded-3xl p-4 transition cursor-pointer ${isActive ? "border-indigo-400 shadow-md ring-2 ring-indigo-100" : "border-slate-200/80 hover:border-slate-300"
        }`}
      onClick={isBulkMode ? onToggleBulk : onSelect}
    >
      {/* Bulk checkbox */}
      {isBulkMode && (
        <div className="absolute top-3 left-3 z-10">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? "bg-indigo-500 border-indigo-500" : "bg-white border-slate-300"}`}>
            {isSelected && <Lucide.Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      )}

      {/* Top-right action cluster */}
      <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
        {book.isFeatured && <Pill tone="violet" size="xs" icon="Star">Featured</Pill>}
        {book.isTrending && <Pill tone="amber" size="xs" icon="TrendingUp">Trending</Pill>}
      </div>

      <BookCover title={book.title} subtitle={book.examName} coverColor={book.coverColor} size="sm" />

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Pill tone="indigo" size="xs">{book.examName}</Pill>
          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${status.color}`}>{status.label}</span>
        </div>
        <h4 className="font-extrabold text-sm text-slate-800 line-clamp-2 leading-snug">{book.title}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">By {book.author}</p>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Pages</p>
          <p className="text-xs font-black text-slate-800">{book.pageCount}</p>
        </div>
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">OCR</p>
          <p className="text-xs font-black text-emerald-600">{book.ocrConfidence}%</p>
        </div>
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Quality</p>
          <p className="text-xs font-black text-amber-600">{book.qualityScore}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); engine.pinBook(book.id, !book.isPinned); }}
            className={`p-1.5 rounded-lg transition ${book.isPinned ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:bg-slate-100"}`}
            title="Pin"
          >
            <Lucide.Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); engine.favoriteBook(book.id, !book.isFavorite); }}
            className={`p-1.5 rounded-lg transition ${book.isFavorite ? "text-amber-500 bg-amber-50" : "text-slate-400 hover:bg-slate-100"}`}
            title="Favorite"
          >
            <Lucide.Star className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">{formatRelativeTime(book.updatedAt)}</span>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// BOOK LIST ITEM (list view)
// ---------------------------------------------------------------------------

function BookListItem({ book, isActive, isBulkMode, isSelected, onSelect, onToggleBulk }: { book: BookMetadata; isActive: boolean; isBulkMode: boolean; isSelected: boolean; onSelect: () => void; onToggleBulk: () => void }) {
  const engine = useKnowledgeEngine();
  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={isBulkMode ? onToggleBulk : onSelect}
      className={`group bg-white/80 border rounded-2xl p-3 flex items-center gap-4 cursor-pointer transition ${isActive ? "border-indigo-400 shadow-sm" : "border-slate-200/80 hover:border-slate-300"
        }`}
    >
      {isBulkMode && (
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${isSelected ? "bg-indigo-500 border-indigo-500" : "bg-white border-slate-300"}`}>
          {isSelected && <Lucide.Check className="w-3 h-3 text-white" />}
        </div>
      )}
      <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
        <div className={`w-full h-full bg-gradient-to-br ${book.coverColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Pill tone="indigo" size="xs">{book.examName}</Pill>
          <Pill tone="slate" size="xs">{book.difficulty}</Pill>
          {book.isFeatured && <Pill tone="violet" size="xs" icon="Star">Featured</Pill>}
        </div>
        <h4 className="font-extrabold text-sm text-slate-800 truncate">{book.title}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">By {book.author} · {book.pageCount} pages · {formatBytes(book.sizeBytes)}</p>
      </div>
      <div className="hidden md:flex items-center gap-3 text-right shrink-0">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">OCR</p>
          <p className="text-xs font-black text-emerald-600">{book.ocrConfidence}%</p>
        </div>
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Quality</p>
          <p className="text-xs font-black text-amber-600">{book.qualityScore}</p>
        </div>
      </div>
      <Lucide.ChevronRight className="w-4 h-4 text-slate-400" />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// BOOK TABLE (table view)
// ---------------------------------------------------------------------------

function BookTable({ books, activeId, onSelect }: { books: BookMetadata[]; activeId: string | null; onSelect: (id: string) => void }) {
  const engine = useKnowledgeEngine();
  return (
    <GlassCard padding="none">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              {["Title", "Exam", "Pages", "OCR", "Quality", "Status", "Updated", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {books.map((b) => {
              const status = statusToTone(b.status);
              return (
                <tr
                  key={b.id}
                  onClick={() => onSelect(b.id)}
                  className={`group border-b border-slate-100 cursor-pointer transition ${activeId === b.id ? "bg-indigo-50/40" : "hover:bg-slate-50"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-8 rounded bg-gradient-to-br ${b.coverColor}`} />
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-slate-800 truncate">{b.title}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">By {b.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Pill tone="indigo" size="xs">{b.examName}</Pill></td>
                  <td className="px-4 py-3 text-xs font-extrabold text-slate-700">{b.pageCount}</td>
                  <td className="px-4 py-3 text-xs font-extrabold text-emerald-600">{b.ocrConfidence}%</td>
                  <td className="px-4 py-3 text-xs font-extrabold text-amber-600">{b.qualityScore}</td>
                  <td className="px-4 py-3"><span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${status.color}`}>{status.label}</span></td>
                  <td className="px-4 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">{formatRelativeTime(b.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <IconButton icon="Star" size="xs" tone={b.isFavorite ? "amber" : "default"} onClick={(e) => { e?.stopPropagation(); engine.favoriteBook(b.id, !b.isFavorite); }} />
                      <IconButton icon="Pin" size="xs" tone={b.isPinned ? "indigo" : "default"} onClick={(e) => { e?.stopPropagation(); engine.pinBook(b.id, !b.isPinned); }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// COMPARE VIEW
// ---------------------------------------------------------------------------

function CompareView({ ids }: { ids: string[] }) {
  const engine = useKnowledgeEngine();
  const [a, b] = ids.map((id) => engine.state.books.find((bk) => bk.id === id)).filter(Boolean) as BookMetadata[];

  if (!a || !b) return null;

  return (
    <div className="mt-3 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">Side-by-side comparison</p>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <p className="font-extrabold text-slate-800 truncate">{a.title}</p>
        </div>
        <div>
          <p className="font-extrabold text-slate-800 truncate">{b.title}</p>
        </div>
        {[
          { k: "Pages", va: a.pageCount, vb: b.pageCount },
          { k: "OCR", va: `${a.ocrConfidence}%`, vb: `${b.ocrConfidence}%` },
          { k: "Quality", va: a.qualityScore, vb: b.qualityScore },
          { k: "Size", va: formatBytes(a.sizeBytes), vb: formatBytes(b.sizeBytes) },
          { k: "Version", va: a.versionNumber, vb: b.versionNumber },
        ].map((row) => (
          <React.Fragment key={row.k}>
            <div className="p-1.5 rounded-lg bg-white/70 text-center text-slate-700 font-bold">{row.va}</div>
            <div className="p-1.5 rounded-lg bg-white/70 text-center text-slate-700 font-bold">{row.vb}</div>
          </React.Fragment>
        ))}
      </div>
      <Button tone="primary" size="sm" fullWidth icon="GitCompare" onClick={() => engine.toast.push("Comparison report generated", { tone: "success", detail: "Saved to downloads." })}>Generate Report</Button>
    </div>
  );
}

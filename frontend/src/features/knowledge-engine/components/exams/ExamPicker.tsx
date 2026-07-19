"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";

import { useKnowledgeEngine } from "../../context";
import { GlassCard, SectionHeader, Pill, Button, IconButton, Input, EmptyState } from "../common/Primitives";
import { EXAM_CATEGORIES, EXAMS_CATALOG } from "../../data";
import type { BookMetadata } from "../../types";

export function ExamPicker() {
  const engine = useKnowledgeEngine();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [favorites, setFavorites] = useState<string[]>(["gate", "upsc", "neet", "jee"]);

  const filtered = useMemo(() => {
    return EXAMS_CATALOG.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, category]);

  const selected = engine.state.ui.selectedExam;
  const currentExam = EXAMS_CATALOG.find((e) => e.name === selected);

  // Books tagged for this exam
  const examBooks = useMemo(() => engine.state.books.filter((b) => b.examName === selected), [engine.state.books, selected]);

  return (
    <div className="space-y-6">
      {/* HERO */}
      <GlassCard padding="lg" tone="indigo">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg mx-auto">
            <Lucide.Compass className="w-8 h-8" />
          </motion.div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Choose Target Examination</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Calibrate the entire AI Knowledge Engine to your target exam. AI will tune note generation, question types, weightage analysis, and PYQ frequency to match the syllabus
          </p>
        </div>
      </GlassCard>

      {/* SELECTED EXAM SHOWCASE */}
      {currentExam && (
        <GlassCard padding="md" tone="indigo">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
              {currentExam.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">{currentExam.name}</h3>
                <Pill tone="violet" size="xs" icon="Target">Active Target</Pill>
                {currentExam.trending && <Pill tone="amber" size="xs" icon="TrendingUp">Trending</Pill>}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentExam.description}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {currentExam.subjects.map((s) => <Pill key={s} tone="indigo" size="xs">{s}</Pill>)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button tone="primary" size="md" icon="Upload" onClick={() => engine.setTab("upload")}>Select Book for {currentExam.name}</Button>
              <Button tone="secondary" size="md" icon="BookOpen" onClick={() => engine.setTab("library")}>View Library ({examBooks.length})</Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* SEARCH + CATEGORIES */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Lucide.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams, streams, descriptions..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl">
            {EXAM_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition ${category === c.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* EXAM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((exam) => {
            const isActive = selected === exam.name;
            const isFav = favorites.includes(exam.id);
            return (
              <motion.div
                key={exam.id}
                whileHover={{ y: -2 }}
                onClick={() => engine.setSelectedExam(exam.name)}
                className={`relative overflow-hidden bg-white border-2 rounded-3xl p-4 cursor-pointer transition ${isActive ? "border-indigo-400 shadow-md ring-2 ring-indigo-100" : "border-slate-200 hover:border-slate-300"
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-black text-xs">
                    {exam.name.slice(0, 2).toUpperCase()}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFavorites((f) => f.includes(exam.id) ? f.filter((x) => x !== exam.id) : [...f, exam.id]);
                    }}
                    className={`p-1.5 rounded-lg transition ${isFav ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:bg-slate-100"}`}
                  >
                    <Lucide.Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
                <h4 className="mt-3 font-extrabold text-sm text-slate-800 tracking-tight">{exam.name}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{exam.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {exam.trending && <Pill tone="amber" size="xs" icon="TrendingUp">Trending</Pill>}
                  {exam.featured && <Pill tone="violet" size="xs" icon="Star">Featured</Pill>}
                  {isActive && <Pill tone="indigo" size="xs" icon="Check">Active</Pill>}
                </div>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-2">Code: {exam.code}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FAVORITES + LIBRARY SHORTCUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard padding="md" tone="amber">
          <SectionHeader icon="Star" title="Favorites" subtitle={`${favorites.length} pinned`} tone="amber" size="sm" />
          <div className="space-y-1.5 mt-3">
            {favorites.slice(0, 4).map((id) => {
              const exam = EXAMS_CATALOG.find((e) => e.id === id);
              if (!exam) return null;
              return (
                <button
                  key={id}
                  onClick={() => engine.setSelectedExam(exam.name)}
                  className={`w-full text-left p-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${selected === exam.name ? "bg-amber-100 text-amber-700" : "bg-white/60 text-slate-700 hover:bg-white"
                    }`}
                >
                  <Lucide.Star className="w-3 h-3 fill-current" />
                  {exam.name}
                </button>
              );
            })}
          </div>
        </GlassCard>
        <GlassCard padding="md" tone="emerald">
          <SectionHeader icon="BookOpen" title="Library Shortcuts" subtitle={`${examBooks.length} books for ${selected}`} tone="emerald" size="sm" />
          <div className="space-y-1.5 mt-3 max-h-40 overflow-y-auto">
            {examBooks.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">No books yet for this exam</p>
            ) : examBooks.slice(0, 4).map((b) => (
              <button
                key={b.id}
                onClick={() => { engine.setActiveBook(b.id); engine.setTab("knowledge"); }}
                className="w-full text-left p-2 rounded-xl text-xs font-extrabold flex items-center gap-2 bg-white/60 hover:bg-white text-slate-700 transition"
              >
                <div className={`w-6 h-8 rounded bg-gradient-to-br ${b.coverColor} shrink-0`} />
                <span className="truncate flex-1">{b.title}</span>
                <Pill tone="emerald" size="xs">{b.qualityScore}</Pill>
              </button>
            ))}
          </div>
        </GlassCard>
        <GlassCard padding="md" tone="indigo">
          <SectionHeader icon="Zap" title="Next Step" subtitle="Continue the flow" tone="indigo" size="sm" />
          <div className="space-y-2 mt-3">
            <Button tone="primary" size="sm" fullWidth iconRight="Upload" onClick={() => engine.setTab("upload")}>Upload Books</Button>
            <Button tone="secondary" size="sm" fullWidth iconRight="BookOpen" onClick={() => engine.setTab("library")}>Browse Library</Button>
            <Button tone="secondary" size="sm" fullWidth iconRight="BarChart3" onClick={() => engine.setTab("dashboard")}>Dashboard</Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

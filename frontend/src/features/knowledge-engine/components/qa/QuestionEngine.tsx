"use client";


import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

import { useKnowledgeEngine } from "../../context";
import { GlassCard, SectionHeader, Pill, Button, IconButton, Modal, Input, Textarea, Select, TabsBar, EmptyState, ProgressBar, ProgressRing } from "../common/Primitives";
import { nextId } from "../../utils";
import type { AnyQuestion, MCQQuestion, TrueFalseQuestion, FillBlankQuestion, ShortQuestion, LongQuestion, InterviewQuestion, CaseStudyQuestion, ScenarioQuestion, PYQQuestion, Flashcard, FlashcardLevel, QuestionType } from "../../types";

type QaSubTab = "mcq" | "truefalse" | "fillblank" | "short" | "long" | "pyq" | "case" | "scenario" | "interview" | "flashcards" | "quiz";
type Mode = "browse" | "take" | "review";

export function QuestionEngine() {
  const engine = useKnowledgeEngine();
  const book = engine.state.books.find((b) => b.id === engine.state.ui.activeBookId) || null;
  const questions = book ? engine.state.questions[book.id] || [] : [];
  const flashcards = book ? engine.state.flashcards[book.id] || [] : [];

  const [tab, setTab] = useState<QaSubTab>("mcq");
  const [mode, setMode] = useState<Mode>("browse");
  const [showAddModal, setShowAddModal] = useState<QuestionType | null>(null);

  const counts = useMemo(() => {
    return {
      mcq: questions.filter((q) => q.type === "mcq").length,
      truefalse: questions.filter((q) => q.type === "truefalse").length,
      fillblank: questions.filter((q) => q.type === "fillblank").length,
      short: questions.filter((q) => q.type === "short").length,
      long: questions.filter((q) => q.type === "long").length,
      pyq: questions.filter((q) => q.type === "pyq").length,
      case: questions.filter((q) => q.type === "case").length,
      scenario: questions.filter((q) => q.type === "scenario").length,
      interview: questions.filter((q) => q.type === "interview").length,
      flashcards: flashcards.length,
    };
  }, [questions, flashcards]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (tab === "quiz") return true;
      return q.type === tab;
    });
  }, [questions, tab]);

  if (!book) {
    return <GlassCard padding="md"><EmptyState icon="HelpCircle" title="No book selected" description="Pick a book from the Library to start practicing questions." /></GlassCard>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <GlassCard padding="md" tone="indigo">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Lucide.Brain className="w-5 h-5 text-indigo-600" />
              AI Question Engine
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Practice {questions.length} AI-generated questions + {flashcards.length} flashcards for <strong>{book.title}</strong></p>
          </div>
          <div className="flex items-center gap-2">
            {mode === "browse" ? (
              <Button tone="primary" size="md" icon="PlayCircle" onClick={() => { setMode("take"); setTab("quiz"); }}>Start Adaptive Quiz</Button>
            ) : (
              <Button tone="secondary" size="md" icon="Square" onClick={() => { setMode("browse"); setTab("mcq"); }}>Exit Quiz</Button>
            )}
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-indigo-100">
          {[
            { label: "MCQ", val: counts.mcq, icon: "ListChecks", tone: "indigo" as const },
            { label: "T/F", val: counts.truefalse, icon: "ToggleLeft", tone: "emerald" as const },
            { label: "Fill", val: counts.fillblank, icon: "TextCursor", tone: "amber" as const },
            { label: "Short", val: counts.short, icon: "MessageSquare", tone: "rose" as const },
            { label: "PYQ", val: counts.pyq, icon: "Trophy", tone: "violet" as const },
            { label: "Cards", val: counts.flashcards, icon: "Layers", tone: "sky" as const },
          ].map((s) => {
            const Icon = (Lucide as any)[s.icon];
            const toneCls = {
              indigo: "from-indigo-500 to-violet-500",
              emerald: "from-emerald-500 to-teal-500",
              amber: "from-amber-500 to-orange-500",
              rose: "from-rose-500 to-pink-500",
              violet: "from-violet-500 to-fuchsia-500",
              sky: "from-sky-500 to-cyan-500",
            }[s.tone];
            return (
              <div key={s.label} className="bg-white/70 rounded-2xl p-2.5 border border-indigo-100/50">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${toneCls} text-white flex items-center justify-center`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">{s.label}</span>
                </div>
                <p className="text-base font-black text-slate-800 mt-0.5">{s.val}</p>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* TABS */}
      <TabsBar<QaSubTab>
        variant="pills"
        active={tab}
        onChange={(t) => { setTab(t); setMode("browse"); }}
        tabs={[
          { id: "mcq", label: "MCQ", icon: "ListChecks", count: counts.mcq, tone: "indigo" },
          { id: "truefalse", label: "True/False", icon: "ToggleLeft", count: counts.truefalse, tone: "indigo" },
          { id: "fillblank", label: "Fill Blanks", icon: "TextCursor", count: counts.fillblank, tone: "indigo" },
          { id: "short", label: "Short", icon: "MessageSquare", count: counts.short, tone: "indigo" },
          { id: "long", label: "Long", icon: "AlignLeft", count: counts.long, tone: "indigo" },
          { id: "pyq", label: "PYQ", icon: "Trophy", count: counts.pyq, tone: "amber" },
          { id: "flashcards", label: "Flashcards", icon: "Layers", count: counts.flashcards, tone: "indigo" },
          { id: "quiz", label: "Adaptive", icon: "Zap", tone: "amber" },
        ]}
      />

      {/* CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div key={tab + mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {tab === "quiz" && mode === "take" ? (
            <QuizMode book={book} questions={questions} onExit={() => { setMode("browse"); setTab("mcq"); }} />
          ) : tab === "flashcards" ? (
            <FlashcardsView book={book} flashcards={flashcards} onAdd={() => setShowAddModal("flashcard" as any)} />
          ) : tab === "quiz" ? (
            <QuizDashboard book={book} questions={questions} onStart={() => setMode("take")} />
          ) : (
            <QuestionList
              book={book}
              questions={filteredQuestions}
              type={tab as QuestionType}
              onAdd={() => setShowAddModal(tab as QuestionType)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ADD MODAL */}
      <AddQuestionModal
        open={!!showAddModal}
        type={showAddModal}
        onClose={() => setShowAddModal(null)}
        onSave={(q) => {
          if (showAddModal === ("flashcard" as any)) {
            engine.addFlashcard(book.id, q as Flashcard);
          } else {
            engine.addQuestion(book.id, q as AnyQuestion);
          }
          setShowAddModal(null);
        }}
        bookId={book.id}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// QUESTION LIST
// ---------------------------------------------------------------------------

function QuestionList({ book, questions, type, onAdd }: { book: any; questions: AnyQuestion[]; type: QuestionType; onAdd: () => void }) {
  const engine = useKnowledgeEngine();
  const [filterChapter, setFilterChapter] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const chapters = engine.state.chapters[book.id] || [];

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (filterChapter !== "all" && q.chapterId !== filterChapter) return false;
      if (filterDifficulty !== "all" && q.difficulty !== filterDifficulty) return false;
      return true;
    });
  }, [questions, filterChapter, filterDifficulty]);

  if (filtered.length === 0) {
    return <GlassCard padding="md"><EmptyState icon="ListChecks" title="No questions" description={`No ${type} questions match your filters.`} action={<Button tone="primary" icon="Plus" onClick={onAdd}>Add Question</Button>} /></GlassCard>;
  }

  return (
    <div className="space-y-4">
      <GlassCard padding="sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterChapter} onChange={(e) => setFilterChapter(e.target.value)} options={[{ value: "all", label: "All Chapters" }, ...chapters.map((c: any) => ({ value: c.id, label: c.title }))]} className="!w-48" />
          <Select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} options={[
            { value: "all", label: "All Difficulty" },
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
            { value: "expert", label: "Expert" },
          ]} className="!w-44" />
          <div className="flex-1" />
          <Button tone="primary" size="sm" icon="Plus" onClick={onAdd}>Add {type.toUpperCase()}</Button>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {filtered.map((q, i) => (
          <QuestionCard key={q.id} question={q} index={i} chapters={chapters} onDelete={() => engine.deleteQuestion(book.id, q.id)} />
        ))}
      </div>
    </div>
  );
}

function QuestionCard({ question, index, chapters, onDelete }: { question: AnyQuestion; index: number; chapters: any[]; onDelete: () => void }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedMcq, setSelectedMcq] = useState<number | null>(null);
  const chapter = chapters.find((c) => c.id === question.chapterId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="group bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-sm transition"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Pill tone="indigo">{question.type.toUpperCase()}</Pill>
            {chapter && <Pill tone="slate">{chapter.title.slice(0, 30)}</Pill>}
            <Pill tone="violet">{question.difficulty}</Pill>
            <Pill tone="amber">{question.weightage} marks</Pill>
            {(question as any).pyqYear && <Pill tone="emerald" icon="Trophy">PYQ {(question as any).pyqYear}</Pill>}
            {(question as any).pyqSource && <Pill tone="emerald">{(question as any).pyqSource}</Pill>}
          </div>
          <p className="text-sm font-bold text-slate-800 leading-relaxed">{question.question}</p>

          {/* MCQ Options */}
          {question.type === "mcq" && (
            <div className="space-y-1.5">
              {(question as MCQQuestion).options.map((opt, i) => {
                const isCorrect = i === (question as MCQQuestion).answerIndex;
                const isSelected = selectedMcq === i;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedMcq(i)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center gap-2 ${showAnswer && isCorrect
                        ? "border-emerald-300 bg-emerald-50/50 text-emerald-900"
                        : isSelected
                          ? "border-indigo-300 bg-indigo-50/30 text-slate-800"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold ${showAnswer && isCorrect ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="flex-1">{opt}</span>
                    {showAnswer && isCorrect && <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* T/F */}
          {question.type === "truefalse" && (
            <div className="flex items-center gap-2">
              {[
                { val: true, label: "True", color: "emerald" as const },
                { val: false, label: "False", color: "rose" as const },
              ].map((opt) => (
                <div key={opt.label} className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold ${showAnswer && (question as TrueFalseQuestion).correctValue === opt.val
                    ? opt.color === "emerald" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-rose-300 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-white text-slate-500"
                  }`}>
                  {opt.label}
                </div>
              ))}
            </div>
          )}

          {/* Fill Blank */}
          {question.type === "fillblank" && (
            <div className="space-y-1.5">
              {(question as FillBlankQuestion).blanks.map((b, i) => (
                <div key={i} className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono">
                  <span className="text-slate-500">Answer {i + 1}: </span>
                  <span className="font-extrabold text-slate-800">{showAnswer ? b : "______"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Short answer */}
          {question.type === "short" && showAnswer && (
            <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Sample Answer</p>
              <p className="text-xs text-slate-700 leading-relaxed">{(question as ShortQuestion).answer}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {(question as ShortQuestion).expectedKeywords.map((k) => <Pill key={k} tone="emerald">#{k}</Pill>)}
              </div>
            </div>
          )}

          {/* Long answer */}
          {question.type === "long" && showAnswer && (
            <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Sample Answer ({(question as LongQuestion).marks} marks)</p>
              <p className="text-xs text-slate-700 leading-relaxed">{(question as LongQuestion).answer}</p>
              <div className="mt-1.5 space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Expected structure</p>
                {(question as LongQuestion).expectedStructure.map((s, i) => (
                  <p key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <Lucide.ChevronRight className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {s}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* PYQ */}
          {question.type === "pyq" && showAnswer && (
            <div className="p-3 rounded-xl bg-violet-50/40 border border-violet-100">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">Answer</p>
              <p className="text-xs text-slate-700 leading-relaxed mt-1">{(question as PYQQuestion).answer}</p>
            </div>
          )}

          {/* Case Study */}
          {question.type === "case" && showAnswer && (
            <div className="p-3 rounded-xl bg-sky-50/40 border border-sky-100 space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700">Case</p>
              <p className="text-xs text-slate-700 leading-relaxed">{(question as CaseStudyQuestion).caseStudy}</p>
            </div>
          )}

          {/* Scenario */}
          {question.type === "scenario" && showAnswer && (
            <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-100 space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Scenario</p>
              <p className="text-xs text-slate-700 leading-relaxed">{(question as ScenarioQuestion).scenario}</p>
            </div>
          )}

          {/* Interview */}
          {question.type === "interview" && showAnswer && (
            <div className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">Sample Answer</p>
              <p className="text-xs text-slate-700 leading-relaxed">{(question as InterviewQuestion).answer}</p>
              {(question as InterviewQuestion).followUps.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Follow-up questions</p>
                  {(question as InterviewQuestion).followUps.map((f, i) => (
                    <p key={i} className="text-[11px] text-slate-600">↳ {f}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Explanation */}
          {showAnswer && question.explanation && (
            <div className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-100">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-0.5">Explanation</p>
              <p className="text-xs text-slate-700 leading-relaxed">{question.explanation}</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button tone="ghost" size="sm" icon={showAnswer ? "EyeOff" : "Eye"} onClick={() => setShowAnswer(!showAnswer)}>{showAnswer ? "Hide" : "Show"} Answer</Button>
            <div className="flex-1" />
            <IconButton icon="Trash2" size="xs" tone="danger" onClick={onDelete} title="Delete" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// FLASHCARDS VIEW
// ---------------------------------------------------------------------------

function FlashcardsView({ book, flashcards, onAdd }: { book: any; flashcards: Flashcard[]; onAdd: () => void }) {
  const engine = useKnowledgeEngine();
  const [reviewMode, setReviewMode] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (flashcards.length === 0) {
    return <GlassCard padding="md"><EmptyState icon="Layers" title="No flashcards" description="Add your first flashcard to start active recall practice." action={<Button tone="primary" icon="Plus" onClick={onAdd}>Add Flashcard</Button>} /></GlassCard>;
  }

  if (reviewMode) {
    const card = flashcards[cardIndex];
    return (
      <GlassCard padding="lg" tone="indigo">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-between">
            <Pill tone="indigo">{cardIndex + 1} / {flashcards.length}</Pill>
            <Button tone="ghost" size="sm" icon="X" onClick={() => { setReviewMode(false); setCardIndex(0); setFlipped(false); }}>End Review</Button>
          </div>
          <motion.div
            key={card.id + (flipped ? "_back" : "_front")}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="aspect-[3/2] max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-lg flex flex-col items-center justify-center"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">{flipped ? "Answer" : "Question"}</p>
            <p className="text-lg font-black text-slate-800 text-center leading-tight">{flipped ? card.back : card.front}</p>
            {flipped && card.hint && <p className="text-[10px] text-slate-400 mt-3 italic">Hint: {card.hint}</p>}
          </motion.div>
          {flipped ? (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button tone="danger" size="md" icon="X" onClick={() => {
                engine.updateFlashcard(book.id, card.id, { level: "hard", reviewCount: card.reviewCount + 1, lastReviewedAt: new Date().toISOString() });
                setFlipped(false);
                setCardIndex((i) => (i + 1) % flashcards.length);
              }}>Hard</Button>
              <Button tone="amber" size="md" icon="Minus" onClick={() => {
                engine.updateFlashcard(book.id, card.id, { level: "good", reviewCount: card.reviewCount + 1, lastReviewedAt: new Date().toISOString() });
                setFlipped(false);
                setCardIndex((i) => (i + 1) % flashcards.length);
              }}>Good</Button>
              <Button tone="success" size="md" icon="Check" onClick={() => {
                engine.updateFlashcard(book.id, card.id, { level: "easy", reviewCount: card.reviewCount + 1, lastReviewedAt: new Date().toISOString() });
                setFlipped(false);
                setCardIndex((i) => (i + 1) % flashcards.length);
              }}>Easy</Button>
            </div>
          ) : (
            <Button tone="primary" size="lg" icon="RotateCw" onClick={() => setFlipped(true)}>Show Answer</Button>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard padding="md">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-800">Flashcards ({flashcards.length})</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active recall · Spaced repetition</p>
          </div>
          <div className="flex items-center gap-2">
            <Button tone="primary" size="sm" icon="PlayCircle" onClick={() => setReviewMode(true)}>Start Review</Button>
            <Button tone="secondary" size="sm" icon="Plus" onClick={onAdd}>Add Card</Button>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {flashcards.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="group bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-2">
              <Pill tone={c.level === "easy" ? "emerald" : c.level === "good" ? "indigo" : c.level === "hard" ? "rose" : "slate"}>
                {c.level}
              </Pill>
              <IconButton icon="Trash2" size="xs" tone="danger" onClick={() => engine.deleteFlashcard(book.id, c.id)} />
            </div>
            <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-3">{c.front}</p>
            <div className="my-2 border-t border-dashed border-slate-200" />
            <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-3">{c.back}</p>
            {c.topic && <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mt-2">#{c.topic}</p>}
            <p className="text-[9px] text-slate-400 mt-1">Reviewed {c.reviewCount} times</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QUIZ MODE
// ---------------------------------------------------------------------------

function QuizMode({ book, questions, onExit }: { book: any; questions: AnyQuestion[]; onExit: () => void }) {
  const engine = useKnowledgeEngine();
  const mcqs = useMemo(() => questions.filter((q) => q.type === "mcq") as MCQQuestion[], [questions]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 min

  useEffect(() => {
    if (showResults) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0) {
          setShowResults(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showResults]);

  if (mcqs.length === 0) {
    return <GlassCard padding="md"><EmptyState icon="Zap" title="No MCQs to quiz" description="Add MCQ questions first." action={<Button tone="primary" onClick={onExit}>Back to Questions</Button>} /></GlassCard>;
  }

  if (showResults) {
    const total = mcqs.length;
    const answered = Object.keys(answers).length;
    const correct = mcqs.filter((q) => answers[q.id] === q.answerIndex).length;
    const accuracy = Math.round((correct / Math.max(1, answered)) * 100);

    return (
      <GlassCard padding="lg" tone="indigo">
        <div className="text-center max-w-2xl mx-auto py-8 space-y-6">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg">
            <Lucide.Trophy className="w-12 h-12" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Quiz Complete!</h2>
            <p className="text-sm text-slate-500 mt-1">You answered {correct} out of {answered} correctly</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/70 rounded-2xl p-4 border border-indigo-100">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Score</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{accuracy}%</p>
            </div>
            <div className="bg-white/70 rounded-2xl p-4 border border-indigo-100">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Correct</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{correct}</p>
            </div>
            <div className="bg-white/70 rounded-2xl p-4 border border-indigo-100">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{total}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button tone="primary" icon="RotateCw" onClick={() => { setIndex(0); setAnswers({}); setShowResults(false); setTimeLeft(300); }}>Retake Quiz</Button>
            <Button tone="secondary" onClick={onExit}>Back to Questions</Button>
          </div>
        </div>
      </GlassCard>
    );
  }

  const current = mcqs[index];

  return (
    <GlassCard padding="lg" tone="indigo">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Pill tone="indigo">Question {index + 1} / {mcqs.length}</Pill>
          <Pill tone="rose" icon="Clock">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</Pill>
        </div>
        <ProgressBar value={((index + 1) / mcqs.length) * 100} tone="indigo" />

        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{current.question}</h3>
        </div>

        <div className="space-y-2">
          {current.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === current.answerIndex;
            const showResult = selected !== null;
            return (
              <button
                key={i}
                onClick={() => {
                  if (selected !== null) return;
                  setSelected(i);
                  setAnswers({ ...answers, [current.id]: i });
                }}
                className={`w-full p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${showResult && isCorrect
                    ? "border-emerald-300 bg-emerald-50/40"
                    : showResult && isSelected && !isCorrect
                      ? "border-rose-300 bg-rose-50/40"
                      : isSelected
                        ? "border-indigo-300 bg-indigo-50/30"
                        : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${showResult && isCorrect ? "bg-emerald-500 text-white" : showResult && isSelected && !isCorrect ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="flex-1 text-sm font-medium text-slate-800">{opt}</span>
                {showResult && isCorrect && <Lucide.CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {showResult && isSelected && !isCorrect && <Lucide.XCircle className="w-5 h-5 text-rose-600" />}
              </button>
            );
          })}
        </div>

        {selected !== null && current.explanation && (
          <div className="p-3 rounded-2xl bg-amber-50/40 border border-amber-100">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-1">Explanation</p>
            <p className="text-xs text-slate-700 leading-relaxed">{current.explanation}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button tone="ghost" size="sm" icon="ChevronLeft" disabled={index === 0} onClick={() => { setIndex(index - 1); setSelected(null); }}>Previous</Button>
          {selected !== null && index < mcqs.length - 1 && (
            <Button tone="primary" size="md" iconRight="ChevronRight" onClick={() => { setIndex(index + 1); setSelected(null); }}>Next</Button>
          )}
          {selected !== null && index === mcqs.length - 1 && (
            <Button tone="success" size="md" icon="CheckCheck" onClick={() => setShowResults(true)}>Submit</Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function QuizDashboard({ book, questions, onStart }: { book: any; questions: AnyQuestion[]; onStart: () => void }) {
  const mcqs = questions.filter((q) => q.type === "mcq").length;
  const pyqs = questions.filter((q) => q.type === "pyq").length;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <GlassCard padding="md" tone="indigo">
        <SectionHeader icon="Zap" title="Adaptive Quiz" subtitle="Mixed MCQs, timed, scored" tone="indigo" size="sm" />
        <p className="text-xs text-slate-500 mt-2">Picks {mcqs} MCQs, runs a 5-min timed quiz, then evaluates your answers and shows explanations.</p>
        <Button tone="primary" size="md" fullWidth icon="PlayCircle" className="mt-3" onClick={onStart} disabled={mcqs === 0}>Start Quiz</Button>
      </GlassCard>
      <GlassCard padding="md" tone="amber">
        <SectionHeader icon="Trophy" title="PYQ Drill" subtitle="Past-year questions" tone="amber" size="sm" />
        <p className="text-xs text-slate-500 mt-2">Practice {pyqs} past-year questions. Focus on highest-weightage items and source-wise trends.</p>
        <Button tone="amber" size="md" fullWidth icon="PlayCircle" className="mt-3" disabled={pyqs === 0}>Start PYQ</Button>
      </GlassCard>
      <GlassCard padding="md" tone="emerald">
        <SectionHeader icon="Target" title="Topic Drill" subtitle="Chapter & topic" tone="emerald" size="sm" />
        <p className="text-xs text-slate-500 mt-2">Drill by specific chapter or topic. Identifies weak areas and recommends revision.</p>
        <Button tone="success" size="md" fullWidth icon="PlayCircle" className="mt-3" disabled>Coming Soon</Button>
      </GlassCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ADD QUESTION MODAL
// ---------------------------------------------------------------------------

function AddQuestionModal({ open, type, onClose, onSave, bookId }: { open: boolean; type: QuestionType | null; onClose: () => void; onSave: (q: any) => void; bookId: string }) {
  const engine = useKnowledgeEngine();
  const chapters = engine.state.chapters[bookId] || [];

  function getInitialForm(t: QuestionType | null) {
    if (!t) return {};
    switch (t) {
      case "mcq": return { question: "", answerIndex: 0, explanation: "", weightage: 2, difficulty: "intermediate", topic: "", chapterId: "" };
      case "truefalse": return { question: "", correctValue: true, explanation: "", weightage: 1, difficulty: "beginner", topic: "", chapterId: "" };
      case "fillblank": return { question: "", blanks: [""], explanation: "", weightage: 1, difficulty: "beginner", topic: "", chapterId: "" };
      case "short": return { question: "", answer: "", expectedKeywords: "", sampleAnswerPoints: "", weightage: 3, difficulty: "intermediate", topic: "", chapterId: "" };
      case "long": return { question: "", answer: "", expectedStructure: "", marks: 10, weightage: 10, difficulty: "advanced", topic: "", chapterId: "" };
      case "pyq": return { question: "", answer: "", year: 2025, source: "GATE", explanation: "", weightage: 2, difficulty: "intermediate", topic: "", chapterId: "", marks: 1 };
      case "case": return { question: "", answer: "", caseStudy: "", subQuestions: "", weightage: 10, difficulty: "advanced", topic: "", chapterId: "" };
      case "scenario": return { question: "", answer: "", scenario: "", decisionPoints: "", weightage: 5, difficulty: "intermediate", topic: "", chapterId: "" };
      case "interview": return { question: "", answer: "", followUps: "", panelTips: "", weightage: 5, difficulty: "advanced", topic: "", chapterId: "" };
      default: return {};
    }
  }

  // Use a simple form based on type
  const [form, setForm] = useState<any>(() => getInitialForm(type));
  const [options, setOptions] = useState(["", "", "", ""]);

  useEffect(() => {
    if (open && type) {
      setForm(getInitialForm(type));
      setOptions(["", "", "", ""]);
    }
  }, [open, type]);

  if (!type) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = nextId("q");
    const createdAt = new Date().toISOString();
    let q: any = { id, type, createdAt, tags: [], chapterId: form.chapterId, topic: form.topic, difficulty: form.difficulty, weightage: form.weightage || 1, question: form.question, answer: form.answer || "" };

    if (type === "mcq") {
      q = { ...q, options: options.filter((o) => o.trim()), answerIndex: parseInt(form.answerIndex) };
    } else if (type === "truefalse") {
      q = { ...q, correctValue: form.correctValue };
    } else if (type === "fillblank") {
      q = { ...q, blanks: form.blanks };
    } else if (type === "short") {
      q = { ...q, expectedKeywords: form.expectedKeywords.split(",").map((s: string) => s.trim()).filter(Boolean), sampleAnswerPoints: form.sampleAnswerPoints.split("\n").map((s: string) => s.trim()).filter(Boolean) };
    } else if (type === "long") {
      q = { ...q, expectedStructure: form.expectedStructure.split("\n").map((s: string) => s.trim()).filter(Boolean), marks: parseInt(form.marks) || 10 };
    } else if (type === "pyq") {
      q = { ...q, year: parseInt(form.year), source: form.source, marks: parseInt(form.marks) || 1, frequency: 1, pyqYear: parseInt(form.year), pyqSource: form.source };
    } else if (type === "case") {
      q = { ...q, caseStudy: form.caseStudy, subQuestions: form.subQuestions.split("\n").filter(Boolean) };
    } else if (type === "scenario") {
      q = { ...q, scenario: form.scenario, decisionPoints: form.decisionPoints.split("\n").filter(Boolean) };
    } else if (type === "interview") {
      q = { ...q, followUps: form.followUps.split("\n").filter(Boolean), panelTips: form.panelTips.split("\n").filter(Boolean) };
    }

    onSave(q);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Add ${type.toUpperCase()} Question`}
      subtitle="Manually add a question to this book"
      maxWidth="2xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button tone="secondary" onClick={onClose}>Cancel</Button>
          <Button tone="primary" onClick={handleSubmit} icon="Save">Save Question</Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea label="Question" rows={3} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />

        {type === "mcq" && (
          <>
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Options (mark correct one)</label>
              {options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={parseInt(form.answerIndex) === i}
                    onChange={() => setForm({ ...form, answerIndex: i })}
                    className="accent-indigo-500"
                  />
                  <input
                    type="text"
                    value={o}
                    onChange={(e) => {
                      const next = [...options];
                      next[i] = e.target.value;
                      setOptions(next);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-400"
                  />
                </div>
              ))}
            </div>
            <Textarea label="Explanation" rows={2} value={form.explanation || ""} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
          </>
        )}

        {type === "truefalse" && (
          <Select label="Correct Answer" value={String(form.correctValue)} onChange={(e) => setForm({ ...form, correctValue: e.target.value === "true" })} options={[
            { value: "true", label: "True" }, { value: "false", label: "False" },
          ]} />
        )}

        {type === "fillblank" && (
          <Input label="Answers (pipe separated)" value={Array.isArray(form.blanks) ? form.blanks.join("|") : ""} onChange={(e) => setForm({ ...form, blanks: e.target.value.split("|") })} placeholder="answer1|answer2" />
        )}

        {(type === "short" || type === "long" || type === "pyq" || type === "case" || type === "scenario" || type === "interview") && (
          <Textarea label="Answer" rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
        )}

        {type === "short" && (
          <>
            <Input label="Expected Keywords (comma separated)" value={form.expectedKeywords} onChange={(e) => setForm({ ...form, expectedKeywords: e.target.value })} />
            <Textarea label="Sample Answer Points (one per line)" rows={3} value={form.sampleAnswerPoints} onChange={(e) => setForm({ ...form, sampleAnswerPoints: e.target.value })} />
          </>
        )}

        {type === "long" && (
          <>
            <Input label="Marks" type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} />
            <Textarea label="Expected Structure (one per line)" rows={4} value={form.expectedStructure} onChange={(e) => setForm({ ...form, expectedStructure: e.target.value })} />
          </>
        )}

        {type === "pyq" && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            <Input label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            <Input label="Marks" type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} />
          </div>
        )}

        {type === "case" && (
          <Textarea label="Case Study" rows={4} value={form.caseStudy} onChange={(e) => setForm({ ...form, caseStudy: e.target.value })} />
        )}

        {type === "scenario" && (
          <Textarea label="Scenario" rows={4} value={form.scenario} onChange={(e) => setForm({ ...form, scenario: e.target.value })} />
        )}

        {type === "interview" && (
          <>
            <Textarea label="Follow-up Questions (one per line)" rows={3} value={form.followUps} onChange={(e) => setForm({ ...form, followUps: e.target.value })} />
            <Textarea label="Panel Tips (one per line)" rows={3} value={form.panelTips} onChange={(e) => setForm({ ...form, panelTips: e.target.value })} />
          </>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Input label="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          <Input label="Weightage (marks)" type="number" value={form.weightage} onChange={(e) => setForm({ ...form, weightage: parseInt(e.target.value) || 1 })} />
          <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} options={[
            { value: "beginner", label: "Beginner" }, { value: "intermediate", label: "Intermediate" }, { value: "advanced", label: "Advanced" }, { value: "expert", label: "Expert" },
          ]} />
        </div>
        <Select label="Chapter" value={form.chapterId} onChange={(e) => setForm({ ...form, chapterId: e.target.value })} options={[
          { value: "", label: "Select chapter..." },
          ...chapters.map((c: any) => ({ value: c.id, label: c.title })),
        ]} />
      </form>
    </Modal>
  );
}

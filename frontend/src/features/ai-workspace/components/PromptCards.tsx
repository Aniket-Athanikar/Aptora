"use client";

import React from "react";
import { useWorkspace } from "../workspaceContext";
import {
  BookOpen, FileText, HelpCircle, FileCheck, Layers, GitPullRequest,
  Calendar, Scan, Settings2, Sparkles, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

interface ActionCard {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  badge: string;
}

const CARDS: ActionCard[] = [
  { id: "explain", label: "Explain Concept", desc: "Break down complex legal/polity theories", icon: BookOpen, color: "text-purple-600", bg: "from-purple-500/10 to-indigo-500/5", badge: "Concept" },
  { id: "notes", label: "Generate Notes", desc: "Construct structured study references", icon: FileText, color: "text-indigo-600", bg: "from-indigo-500/10 to-blue-500/5", badge: "High Yield" },
  { id: "questions", label: "Practice Questions", desc: "Formulate active recall MCQs & PYQs", icon: HelpCircle, color: "text-blue-600", bg: "from-blue-500/10 to-cyan-500/5", badge: "Exam PYQ" },
  { id: "summarize", label: "Summarize Chapter", desc: "Generate compact overview summaries", icon: FileCheck, color: "text-emerald-600", bg: "from-emerald-500/10 to-teal-500/5", badge: "Summary" },
  { id: "flashcards", label: "Generate Flashcards", desc: "Build Q&A decks for active recall", icon: Layers, color: "text-pink-600", bg: "from-pink-500/10 to-rose-500/5", badge: "Recall" },
  { id: "mindmap", label: "Concept Mind Map", desc: "Structure hierarchical concept mappings", icon: GitPullRequest, color: "text-violet-600", bg: "from-violet-500/10 to-purple-500/5", badge: "Diagram" },
  { id: "revision", label: "Revision Plan", desc: "Map syllabus timelines to test dates", icon: Calendar, color: "text-rose-600", bg: "from-rose-500/10 to-amber-500/5", badge: "Strategy" },
  { id: "pdf_analyze", label: "Analyze Document", desc: "Parse uploaded text for insights", icon: Scan, color: "text-amber-600", bg: "from-amber-500/10 to-yellow-500/5", badge: "RAG DB" },
  { id: "study_strategy", label: "Study Strategy", desc: "Design schedules around weak points", icon: Settings2, color: "text-teal-600", bg: "from-teal-500/10 to-emerald-500/5", badge: "Custom" }
];

export function PromptCards() {
  const { triggerQuickAction } = useWorkspace();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            key={card.id}
            onClick={() => triggerQuickAction(card.id)}
            className={`flex flex-col items-start text-left p-4.5 bg-white border border-purple-100/70 hover:border-purple-300 rounded-3xl hover:shadow-md transition-all group duration-300 cursor-pointer relative overflow-hidden`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${card.bg} border border-purple-100 text-slate-800 shadow-2xs group-hover:scale-105 transition-transform`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                {card.badge}
              </span>
            </div>

            <h5 className="text-xs font-black text-slate-800 leading-snug group-hover:text-purple-700 transition-colors flex items-center gap-1">
              {card.label}
              <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-600 shrink-0" />
            </h5>

            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">
              {card.desc}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}

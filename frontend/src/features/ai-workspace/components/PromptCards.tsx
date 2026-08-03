"use client";

import React from "react";
import { useWorkspace } from "../workspaceContext";
import { BookOpen, FileText, HelpCircle, FileCheck, Layers, GitPullRequest, Calendar, Scan, Settings2 } from "lucide-react";
import { motion } from "framer-motion";

interface ActionCard {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  borderHover: string;
}

const CARDS: ActionCard[] = [
  { id: "explain", label: "Explain Concept", desc: "Breakdown complex legal/polity theories", icon: BookOpen, color: "text-purple-600", bg: "from-purple-500/10 to-purple-500/5", borderHover: "hover:border-purple-300" },
  { id: "notes", label: "Generate Notes", desc: "Construct structured study references", icon: FileText, color: "text-indigo-600", bg: "from-indigo-500/10 to-indigo-500/5", borderHover: "hover:border-indigo-300" },
  { id: "questions", label: "Practice Questions", desc: "Formulate active recall MCQs", icon: HelpCircle, color: "text-blue-600", bg: "from-blue-500/10 to-blue-500/5", borderHover: "hover:border-blue-300" },
  { id: "summarize", label: "Summarize Chapter", desc: "Generate compact overview summaries", icon: FileCheck, color: "text-emerald-600", bg: "from-emerald-500/10 to-emerald-500/5", borderHover: "hover:border-emerald-300" },
  { id: "flashcards", label: "Generate Flashcards", desc: "Build Q&A decks for active recall", icon: Layers, color: "text-pink-600", bg: "from-pink-500/10 to-pink-500/5", borderHover: "hover:border-pink-300" },
  { id: "mindmap", label: "Mind Map", desc: "Structure hierarchical concept mappings", icon: GitPullRequest, color: "text-violet-600", bg: "from-violet-500/10 to-violet-500/5", borderHover: "hover:border-violet-300" },
  { id: "revision", label: "Revision Plan", desc: "Map syllabus timelines to test dates", icon: Calendar, color: "text-rose-600", bg: "from-rose-500/10 to-rose-500/5", borderHover: "hover:border-rose-300" },
  { id: "pdf_analyze", label: "Analyze PDF", desc: "Parse uploaded text for insights", icon: Scan, color: "text-amber-600", bg: "from-amber-500/10 to-amber-500/5", borderHover: "hover:border-amber-300" },
  { id: "study_strategy", label: "Study Strategy", desc: "Design schedules around weak points", icon: Settings2, color: "text-teal-600", bg: "from-teal-500/10 to-teal-500/5", borderHover: "hover:border-teal-300" }
];

export function PromptCards() {
  const { triggerQuickAction } = useWorkspace();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <motion.button
            whileHover={{ scale: 1.025, y: -2 }}
            whileTap={{ scale: 0.98 }}
            key={card.id}
            onClick={() => triggerQuickAction(card.id)}
            className={`flex flex-col items-start text-left p-5 bg-gradient-to-br ${card.bg} border border-slate-100/80 ${card.borderHover} rounded-3xl hover:shadow-md hover:shadow-purple-100/20 transition-all group duration-300 cursor-pointer`}
          >
            <div className="p-3.5 rounded-2xl bg-white border border-slate-150/80 text-slate-800 shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <h5 className="text-xs font-black text-slate-800 leading-snug">
              {card.label}
            </h5>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-semibold">
              {card.desc}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}

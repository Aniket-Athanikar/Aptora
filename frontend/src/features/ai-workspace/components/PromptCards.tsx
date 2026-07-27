"use client";

import React from "react";
import { useWorkspace } from "../workspaceContext";
import { BookOpen, FileText, HelpCircle, FileCheck, Layers, GitPullRequest, Calendar, Scan, Settings2 } from "lucide-react";

interface ActionCard {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

const CARDS: ActionCard[] = [
  { id: "explain", label: "Explain Concept", desc: "Breakdown complex legal/polity theories", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "notes", label: "Generate Notes", desc: "Construct structured study references", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "questions", label: "Practice Questions", desc: "Formulate active recall MCQs", icon: HelpCircle, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "summarize", label: "Summarize Chapter", desc: "Generate compact overview summaries", icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "flashcards", label: "Generate Flashcards", desc: "Build Q&A decks for active recall", icon: Layers, color: "text-pink-600", bg: "bg-pink-50" },
  { id: "mindmap", label: "Mind Map", desc: "Structure hierarchical concept mappings", icon: GitPullRequest, color: "text-violet-600", bg: "bg-violet-50" },
  { id: "revision", label: "Revision Plan", desc: "Map syllabus timelines to test dates", icon: Calendar, color: "text-rose-600", bg: "bg-rose-50" },
  { id: "pdf_analyze", label: "Analyze PDF", desc: "Parse uploaded text for high-yield insights", icon: Scan, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "study_strategy", label: "Study Strategy", desc: "Design schedules around weak points", icon: Settings2, color: "text-teal-600", bg: "bg-teal-50" }
];

export function PromptCards() {
  const { triggerQuickAction } = useWorkspace();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => triggerQuickAction(card.id)}
            className="flex flex-col items-scroll text-left p-5 bg-white border border-purple-100/60 rounded-3xl hover:border-purple-300 hover:shadow-md hover:shadow-purple-100/40 transition-all group duration-300"
          >
            <div className={`p-3 rounded-2xl ${card.bg} ${card.color} w-fit mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <h5 className="text-xs font-black text-gray-800 leading-snug">
              {card.label}
            </h5>
            <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed font-semibold">
              {card.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}

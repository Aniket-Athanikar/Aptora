"use client";

import React, { useState } from "react";
import { useWorkspace } from "../workspaceContext";
import { Sparkles, ArrowUpRight, Flame, BookOpen, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SuggestionItem {
  text: string;
  category: "all" | "pyq" | "notes" | "concept" | "recall";
  tag: string;
}

const SUGGESTIONS: SuggestionItem[] = [
  { text: "Explain Article 32 & Supreme Court Writs", category: "concept", tag: "Article 32" },
  { text: "Generate UPSC Prelims Notes for Polity Chapter 5", category: "notes", tag: "Chapter 5" },
  { text: "Create 5 Active Recall MCQs on Fundamental Rights", category: "recall", tag: "MCQ Deck" },
  { text: "Summarize Laxmikanth Chapter 4 Preamble", category: "notes", tag: "Summary" },
  { text: "Explain Kesavananda Bharati Basic Structure Doctrine", category: "concept", tag: "Landmark Case" },
  { text: "UPSC Prelims 10-Year PYQ Analysis for Polity", category: "pyq", tag: "10-Yr PYQ" },
  { text: "Create a 3-Day Active Revision Plan for Polity", category: "recall", tag: "Revision" },
  { text: "Find Weak Topics and Recommend Practice Questions", category: "pyq", tag: "Weak Topics" }
];

export function PromptSuggestions() {
  const { sendMessage } = useWorkspace();
  const [filter, setFilter] = useState<"all" | "pyq" | "notes" | "concept" | "recall">("all");

  const filtered = filter === "all" ? SUGGESTIONS : SUGGESTIONS.filter((s) => s.category === filter);

  return (
    <div className="w-full space-y-3">
      {/* Category Filter Pills */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-purple-700">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            AI Smart Study Prompts
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-black text-slate-500 select-none">
          {(["all", "concept", "notes", "pyq", "recall"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                filter === cat ? "bg-white text-purple-700 shadow-2xs font-extrabold" : "hover:text-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2">
        {filtered.map((item, idx) => (
          <motion.button
            whileHover={{ scale: 1.025, y: -1 }}
            whileTap={{ scale: 0.97 }}
            key={idx}
            onClick={() => sendMessage(item.text)}
            className="text-[10px] font-bold text-slate-700 bg-white border border-purple-100/80 px-3.5 py-2 rounded-2xl hover:border-purple-300 hover:bg-purple-50/40 hover:text-purple-900 transition-all shadow-2xs cursor-pointer flex items-center gap-2 group"
          >
            <span className="text-[8px] font-black uppercase text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
              {item.tag}
            </span>
            <span>{item.text}</span>
            <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

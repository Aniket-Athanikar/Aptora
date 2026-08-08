"use client";

import React from "react";
import { useWorkspace } from "../workspaceContext";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const SUGGESTIONS = [
  "Explain Article 32 Fundamental Remedies",
  "Generate High-Yield UPSC Polity Notes",
  "Create 5 Practice MCQs with Answer Keys",
  "Summarize Preamble & Basic Structure",
  "Explain Judicial Review & Landmark Cases",
  "Generate a 3-Day Revision Plan for Mains",
  "Extract Key Vector Insights from Book"
];

export function PromptSuggestions() {
  const { sendMessage } = useWorkspace();

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-600" />
        <span className="text-[10px] font-black text-purple-800 uppercase tracking-widest">
          Suggested Study Prompts
        </span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTIONS.map((suggestion, idx) => (
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            key={idx}
            onClick={() => sendMessage(suggestion)}
            className="text-[11px] font-extrabold text-slate-800 bg-white border border-purple-200/90 px-3.5 py-1.5 rounded-full hover:border-purple-400 hover:bg-purple-50/80 hover:text-purple-900 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <span>{suggestion}</span>
            <ArrowRight className="w-3 h-3 text-purple-600 opacity-60 group-hover:opacity-100" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
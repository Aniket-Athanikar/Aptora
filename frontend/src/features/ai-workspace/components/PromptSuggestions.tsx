"use client";

import React from "react";
import { useWorkspace } from "../workspaceContext";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const SUGGESTIONS = [
  "Explain Article 32 Constitution",
  "Generate UPSC Notes Chapter 5",
  "Create 5 Practice MCQs",
  "Summarize Chapter 4 Laxmikanth",
  "Explain basic structure doctrine",
  "Generate a 3-day Revision Plan",
  "Find Weak Topics in Polity tests"
];

export function PromptSuggestions() {
  const { sendMessage } = useWorkspace();

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-650" />
        <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">
          Smart Prompts Suggestions
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion, idx) => (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            key={idx}
            onClick={() => sendMessage(suggestion)}
            className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-full hover:border-purple-300 hover:bg-white hover:text-purple-750 transition-colors shadow-sm cursor-pointer"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

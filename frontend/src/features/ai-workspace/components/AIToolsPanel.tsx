"use client";

import React from "react";
import { useWorkspace } from "../workspaceContext";
import { Scan, FileText, Layers, GitPullRequest, HelpCircle, Calendar, RefreshCw, BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface QuickTool {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  borderColor: string;
}

const TOOLS: QuickTool[] = [
  { id: "pdf_analyze", label: "Analyze PDF", desc: "Extract key insights", icon: Scan, color: "text-purple-600", bg: "from-purple-500/10 to-purple-500/5", borderColor: "hover:border-purple-300" },
  { id: "notes", label: "Generate Notes", desc: "Summarize materials", icon: FileText, color: "text-indigo-600", bg: "from-indigo-500/10 to-indigo-500/5", borderColor: "hover:border-indigo-300" },
  { id: "flashcards", label: "Flashcards", desc: "Build recall deck", icon: Layers, color: "text-pink-600", bg: "from-pink-500/10 to-pink-500/5", borderColor: "hover:border-pink-300" },
  { id: "mindmap", label: "Mind Maps", desc: "Trace logic flows", icon: GitPullRequest, color: "text-violet-600", bg: "from-violet-500/10 to-violet-500/5", borderColor: "hover:border-violet-300" },
  { id: "questions", label: "Quiz Builder", desc: "Formulate practice MCQs", icon: HelpCircle, color: "text-blue-600", bg: "from-blue-500/10 to-blue-500/5", borderColor: "hover:border-blue-300" },
  { id: "revision", label: "Revision Plan", desc: "Map syllabus dates", icon: Calendar, color: "text-rose-600", bg: "from-rose-500/10 to-rose-500/5", borderColor: "hover:border-rose-300" },
  { id: "summarize", label: "Summarizer", desc: "Construct summaries", icon: RefreshCw, color: "text-emerald-600", bg: "from-emerald-500/10 to-emerald-500/5", borderColor: "hover:border-emerald-300" },
  { id: "explain", label: "Explain Topic", desc: "Simplify complex facts", icon: BookOpen, color: "text-amber-600", bg: "from-amber-500/10 to-amber-500/5", borderColor: "hover:border-amber-300" }
];

export function AIToolsPanel() {
  const { triggerQuickAction } = useWorkspace();

  return (
    <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-purple-50 border border-purple-100/60 text-purple-600">
          <Sparkles className="w-4 h-4" />
        </div>
        <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Quick AI Tools</h5>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              key={tool.id}
              onClick={() => triggerQuickAction(tool.id)}
              className={`flex flex-col items-start gap-2 p-3 bg-gradient-to-br ${tool.bg} border border-slate-100/80 ${tool.borderColor} rounded-2xl text-left transition-all cursor-pointer`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl bg-white border border-slate-150 ${tool.color} shrink-0 shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-800 leading-snug">
                    {tool.label}
                  </span>
                  <p className="text-[8px] text-slate-400 font-semibold mt-0.5 leading-none">
                    {tool.desc}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

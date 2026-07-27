"use client";

import React from "react";
import { useWorkspace } from "../workspaceContext";
import { Scan, FileText, Layers, GitPullRequest, HelpCircle, Calendar, RefreshCw, Bookmark, Sparkles, BookOpen } from "lucide-react";

interface QuickTool {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const TOOLS: QuickTool[] = [
  { id: "pdf_analyze", label: "Analyze PDF", icon: Scan, color: "text-purple-500" },
  { id: "notes", label: "Generate Notes", icon: FileText, color: "text-indigo-500" },
  { id: "flashcards", label: "Flashcards", icon: Layers, color: "text-pink-500" },
  { id: "mindmap", label: "Mind Maps", icon: GitPullRequest, color: "text-violet-500" },
  { id: "questions", label: "Question Generator", icon: HelpCircle, color: "text-blue-500" },
  { id: "revision", label: "Revision Planner", icon: Calendar, color: "text-rose-500" },
  { id: "summarize", label: "Summarizer", icon: RefreshCw, color: "text-emerald-500" },
  { id: "explain", label: "Explain Topic", icon: BookOpen, color: "text-amber-500" }
];

export function AIToolsPanel() {
  const { triggerQuickAction } = useWorkspace();

  return (
    <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3.5">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Quick AI Tools</h5>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => triggerQuickAction(tool.id)}
              className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-purple-50/30 border border-slate-100 hover:border-purple-200 rounded-2xl text-left transition-colors"
            >
              <div className={`p-1.5 rounded-xl bg-white border border-slate-150 ${tool.color} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 truncate leading-snug">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

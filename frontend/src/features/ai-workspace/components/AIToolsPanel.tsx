"use client";

import React, { useState } from "react";
import { useWorkspace } from "../workspaceContext";
import {
  Scan,
  FileText,
  Layers,
  GitPullRequest,
  HelpCircle,
  Calendar,
  RefreshCw,
  BookOpen,
  Sparkles,
  Zap,
  BarChart2,
  FileCode,
  Brain,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/lib/ToastContext";

interface QuickTool {
  id: string;
  label: string;
  desc: string;
  category: "all" | "study" | "generator" | "analytics";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  borderColor: string;
}

const TOOLS: QuickTool[] = [
  { id: "pdf_analyze", label: "Analyze PDF", desc: "Extract key insights & syllabus maps", category: "analytics", icon: Scan, color: "text-purple-600", bg: "from-purple-500/10 to-indigo-500/5", borderColor: "hover:border-purple-300" },
  { id: "notes", label: "Generate Notes", desc: "Summarize materials into structured notes", category: "study", icon: FileText, color: "text-indigo-600", bg: "from-indigo-500/10 to-blue-500/5", borderColor: "hover:border-indigo-300" },
  { id: "flashcards", label: "Flashcards", desc: "Build active recall study decks", category: "study", icon: Layers, color: "text-pink-600", bg: "from-pink-500/10 to-rose-500/5", borderColor: "hover:border-pink-300" },
  { id: "mindmap", label: "Mind Maps", desc: "Trace logical concept flows", category: "generator", icon: GitPullRequest, color: "text-violet-600", bg: "from-violet-500/10 to-purple-500/5", borderColor: "hover:border-violet-300" },
  { id: "questions", label: "Quiz Builder", desc: "Formulate practice MCQs & PYQs", category: "generator", icon: HelpCircle, color: "text-blue-600", bg: "from-blue-500/10 to-cyan-500/5", borderColor: "hover:border-blue-300" },
  { id: "revision", label: "Revision Schedule", desc: "Map spaced repetition dates", category: "analytics", icon: Calendar, color: "text-rose-600", bg: "from-rose-500/10 to-pink-500/5", borderColor: "hover:border-rose-300" },
  { id: "summarize", label: "Summarizer", desc: "Construct concise key summaries", category: "study", icon: RefreshCw, color: "text-emerald-600", bg: "from-emerald-500/10 to-teal-500/5", borderColor: "hover:border-emerald-300" },
  { id: "explain", label: "Explain Topic", desc: "Simplify complex facts simply", category: "generator", icon: BookOpen, color: "text-amber-600", bg: "from-amber-500/10 to-orange-500/5", borderColor: "hover:border-amber-300" }
];

export function AIToolsPanel() {
  const { toast } = useToast();
  const { triggerQuickAction } = useWorkspace();
  const [activeCategory, setActiveCategory] = useState<"all" | "study" | "generator" | "analytics">("all");

  const filteredTools = TOOLS.filter((t) => activeCategory === "all" || t.category === activeCategory);

  const handleToolClick = (tool: QuickTool) => {
    toast(`Triggering ${tool.label}...`, "info");
    triggerQuickAction(tool.id);
  };

  return (
    <div className="bg-white border border-purple-100/70 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar & Category Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              ExamForge AI Study Suite
            </h5>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Click any tool to run instant AI processing on active documents
            </p>
          </div>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-150 text-[10px] font-extrabold">
          {[
            { id: "all", label: "All Tools" },
            { id: "study", label: "Study Formats" },
            { id: "generator", label: "Generators" },
            { id: "analytics", label: "Analytics" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-white text-purple-900 shadow-xs border border-purple-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className={`flex items-start gap-3 p-3.5 bg-gradient-to-br ${tool.bg} border border-slate-150 ${tool.borderColor} rounded-2xl text-left transition-all shadow-xs hover:shadow-md cursor-pointer group`}
            >
              <div className={`p-2.5 rounded-xl bg-white border border-slate-150 ${tool.color} shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-800 leading-snug block truncate group-hover:text-purple-700 transition-colors">
                  {tool.label}
                </span>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug line-clamp-2">
                  {tool.desc}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

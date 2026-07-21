"use client";

import React, { useState } from "react";
import { WorkspaceProvider, useWorkspace } from "../workspaceContext";
import { ConversationSidebar } from "./ConversationSidebar";
import { AIChatStepFlow } from "./AIChatStepFlow";
import { ExamTreeInspector } from "./ExamTreeInspector";
import { CountdownCard } from "./CountdownCard";
import { StudyInsightCard } from "./StudyInsightCard";
import { KnowledgeGraphCard } from "./KnowledgeGraphCard";
import { AIToolsPanel } from "./AIToolsPanel";
import { UploadZone } from "./UploadZone";
import { Sparkles, Trophy, FolderTree, MessageSquare, Layers, ShieldCheck, Activity } from "lucide-react";

function WorkspaceInner() {
  const { activeWorkspace, flowStep, resetFlow } = useWorkspace();
  const [activeMainTab, setActiveMainTab] = useState<"flow" | "tree" | "uploads">("flow");

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 bg-slate-50/20 min-h-screen">
      {/* Top Header Navigation Tabs */}
      <div className="bg-white border border-purple-100/70 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-800 flex items-center gap-2">
              ExamForge AI Study System
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-full">
                {activeWorkspace?.examName || "UPSC CSE"}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Interactive Goal Workspaces, Subject & Resource Tree, & Chat Workflow
            </p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60 select-none">
          <button
            onClick={() => setActiveMainTab("flow")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${activeMainTab === "flow"
              ? "bg-white text-purple-700 shadow-sm border border-purple-100"
              : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            AI Chat
          </button>

          <button
            onClick={() => setActiveMainTab("tree")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${activeMainTab === "tree"
              ? "bg-white text-purple-700 shadow-sm border border-purple-100"
              : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            Goal Tree
          </button>

          <button
            onClick={() => setActiveMainTab("uploads")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${activeMainTab === "uploads"
              ? "bg-white text-purple-700 shadow-sm border border-purple-100"
              : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            PDF Upload
          </button>
        </div>
      </div>

      {/* Main Content Sections */}
      {activeMainTab === "flow" && (
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full xl:w-80 shrink-0">
            <ConversationSidebar />
          </div>

          {/* Center Interactive 5-Step AI Flow */}
          <div className="flex-1 min-w-0">
            <AIChatStepFlow />
          </div>

          {/* Right Insights */}
          <div className="w-full xl:w-80 shrink-0 space-y-6">
            <CountdownCard />
            <StudyInsightCard />
            <KnowledgeGraphCard />
            <AIToolsPanel />
          </div>
        </div>
      )}

      {activeMainTab === "tree" && (
        <div className="space-y-6">
          <ExamTreeInspector />
        </div>
      )}

      {activeMainTab === "uploads" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-2">Upload Material to AI Pipeline</h3>
            <p className="text-xs text-slate-400 mb-4">
              Files uploaded here undergo OCR, text cleaning, chunking, topic detection, embedding generation, and Qdrant storage.
            </p>
            <UploadZone />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIWorkspace() {
  return (
    <WorkspaceProvider>
      <WorkspaceInner />
    </WorkspaceProvider>
  );
}
export { AIWorkspace };

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkspaceProvider, useWorkspace } from "../workspaceContext";
import { ConversationSidebar } from "./ConversationSidebar";
import { AIChatStepFlow } from "./AIChatStepFlow";
import { ExamTreeInspector } from "./ExamTreeInspector";
import { CountdownCard } from "./CountdownCard";
import { StudyInsightCard } from "./StudyInsightCard";
import { KnowledgeGraphCard } from "./KnowledgeGraphCard";
import { AIToolsPanel } from "./AIToolsPanel";
import { UploadZone } from "./UploadZone";
import { 
  Sparkles, Trophy, FolderTree, MessageSquare, Layers, 
  ShieldCheck, Activity, Cpu, Database, Network, Zap 
} from "lucide-react";

function WorkspaceInner() {
  const { activeWorkspace, flowStep, resetFlow } = useWorkspace();
  const [activeMainTab, setActiveMainTab] = useState<"flow" | "tree" | "uploads">("flow");

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen relative text-slate-800">
      
      {/* Premium Ambient Background Glow elements */}
      <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Modern Creative Header Panel */}
      <div className="relative rounded-[32px] bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden text-white">
        
        {/* Glow presets */}
        <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6D4AFF] to-[#A855F7] text-white flex items-center justify-center shadow-[0_0_20px_rgba(109,74,255,0.4)] shrink-0 animate-pulse-subtle">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-black tracking-tight">AI Cognitive Co-Pilot</h1>
                <span className="text-[9px] font-black uppercase tracking-widest bg-[#6D4AFF]/20 text-[#A855F7] border border-[#6D4AFF]/30 px-2.5 py-0.5 rounded-full">
                  {activeWorkspace?.examName || "UPSC CSE"}
                </span>
                <span className="flex items-center gap-1.5 text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" /> Qdrant Latency: 12ms
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Advanced orchestration engine indexing syllabus structures, executing semantic embeddings, and generating personalized daily milestones.
              </p>
            </div>
          </div>

          {/* Tab Selection Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 select-none self-start lg:self-auto shadow-inner">
            {(["flow", "tree", "uploads"] as const).map((tab) => {
              const tabLabels = {
                flow: { label: "AI Copilot", icon: MessageSquare },
                tree: { label: "Syllabus Tree", icon: FolderTree },
                uploads: { label: "Knowledge Vault", icon: Layers }
              };
              const TabIcon = tabLabels[tab].icon;
              const isActive = activeMainTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveMainTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#6D4AFF] text-white shadow-[0_4px_14px_rgba(109,74,255,0.3)] border border-[#7C5DFF]/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tabLabels[tab].label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time System Statistics Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2.5">
            <Network className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Semantic Nodes</p>
              <p className="font-extrabold text-slate-200">14,842 Dimensions</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-[#6D4AFF]" />
            <div>
              <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Vector Database</p>
              <p className="font-extrabold text-slate-200">Qdrant Cloud Synced</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Inference Engine</p>
              <p className="font-extrabold text-slate-200">Gemini Pro Active</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Session Guard</p>
              <p className="font-extrabold text-slate-200">TLS Encryption Active</p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Workspace Transition Panels */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMainTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {activeMainTab === "flow" && (
              <div className="flex flex-col xl:flex-row gap-6">
                
                {/* Conversations Sidebar (Left Column) */}
                <div className="w-full xl:w-80 shrink-0">
                  <div className="sticky top-6">
                    <ConversationSidebar />
                  </div>
                </div>

                {/* AI Chat Window Workflow (Center Column) */}
                <div className="flex-1 min-w-0">
                  <AIChatStepFlow />
                </div>

                {/* Cognitive Widgets & Analytics (Right Column) */}
                <div className="w-full xl:w-80 shrink-0 space-y-6">
                  <CountdownCard />
                  <StudyInsightCard />
                  <KnowledgeGraphCard />
                  <AIToolsPanel />
                </div>

              </div>
            )}

            {activeMainTab === "tree" && (
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-[#6D4AFF]" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Syllabus Subject Inspector</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Explore structured syllabus blueprints, confidence rates, and active cognitive routes.</p>
                  </div>
                </div>
                <ExamTreeInspector />
              </div>
            )}

            {activeMainTab === "uploads" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white border border-slate-200/60 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#6D4AFF] shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Upload Material to AI Pipeline</h3>
                      <p className="text-xs text-slate-450 font-semibold leading-relaxed mt-0.5">
                        Files uploaded here undergo semantic analysis, OCR chunking, topic detection, and embedding generation into our secure vectors store.
                      </p>
                    </div>
                  </div>
                  <UploadZone />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

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

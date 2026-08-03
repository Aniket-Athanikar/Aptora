"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkspaceProvider, useWorkspace } from "../workspaceContext";
import { ConversationSidebar } from "./ConversationSidebar";
import { AIChatStepFlow } from "./AIChatStepFlow";
import { ExamTreeInspector } from "./ExamTreeInspector";
import { UploadZone } from "./UploadZone";
import { ResourceManagement } from "@/components/resources/ResourceManagement";
import { ResourceUploadButton } from "@/components/resources/ResourceUploadButton";
import {
  Sparkles, Trophy, FolderTree, MessageSquare, Layers,
  ShieldCheck, Activity, Cpu, Database, Network, Zap
} from "lucide-react";

function WorkspaceInner() {
  const { activeWorkspace, flowStep, resetFlow } = useWorkspace();
  const [activeMainTab, setActiveMainTab] = useState<"flow" | "tree" | "uploads">("flow");
  const [mobileView, setMobileView] = useState<"chat" | "history">("chat");

  return (
    <div className="space-y-6 w-full p-4 sm:p-6 lg:p-8 min-h-screen relative text-slate-800">

      {/* Premium Ambient Background Glow elements */}
      <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Modern Creative Header Panel */}
      <div className="relative rounded-[32px] bg-white border border-slate-200/85 p-6 sm:p-8 shadow-sm overflow-hidden text-slate-800">

        {/* Glow presets */}
        <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6D4AFF] to-[#A855F7] text-white flex items-center justify-center shadow-[0_0_20px_rgba(109,74,255,0.2)] shrink-0 animate-pulse-subtle">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-black tracking-tight text-slate-900">AI Cognitive</h1>
                <span className="text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 border border-purple-200 px-2.5 py-0.5 rounded-full">
                  {activeWorkspace?.examName || "UPSC CSE"}
                </span>
                {/* <span className="flex items-center gap-1.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" /> Qdrant Latency: 12ms
                </span> */}
              </div>
              <p className="text-xs text-slate-500 max-w-xl">
                Advanced orchestration engine indexing syllabus structures, executing semantic embeddings, and generating personalized daily milestones
              </p>
            </div>
          </div>

          {/* Tab Selection Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/60 select-none self-start lg:self-auto shadow-inner">
            {(["flow", "tree", "uploads"] as const).map((tab) => {
              const tabLabels = {
                flow: { label: "AI", icon: MessageSquare },
                tree: { label: "AI Tree", icon: FolderTree },
                uploads: { label: "Overview", icon: Layers }
              };
              const TabIcon = tabLabels[tab].icon;
              const isActive = activeMainTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveMainTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${isActive
                    ? "bg-[#6D4AFF] text-white shadow-[0_4px_14px_rgba(109,74,255,0.3)] border border-[#7C5DFF]/40"
                    : "text-slate-500 hover:text-slate-800"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2.5">
            <Network className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Semantic Nodes</p>
              <p className="font-extrabold text-slate-800">14,842 Dimensions</p>
            </div>
          </div>
          {/* <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-[#6D4AFF]" />
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Vector Database</p>
              <p className="font-extrabold text-slate-800">Qdrant Cloud Synced</p>
            </div>
          </div> */}
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Inference ExamForge</p>
              <p className="font-extrabold text-slate-800">ExamForge-AI Active</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Session Guard</p>
              <p className="font-extrabold text-slate-800">TLS Encryption Active</p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Workspace Transition Panels */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMainTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {activeMainTab === "flow" && (
              <div className="flex flex-col xl:flex-row gap-6">
                
                {/* Mobile View Tab Switcher Toggle Row */}
                <div className="flex xl:hidden bg-slate-100 p-1 rounded-2xl w-fit self-start mb-1.5 shadow-inner border border-slate-200/40">
                  <button
                    onClick={() => setMobileView("chat")}
                    className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      mobileView === "chat"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Study Assistant
                  </button>
                  <button
                    onClick={() => setMobileView("history")}
                    className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      mobileView === "history"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    History ({flowStep === 5 ? "RAG Session" : "Chats"})
                  </button>
                </div>

                {/* Conversations Sidebar (Left Column) */}
                <div className={`w-full xl:w-80 shrink-0 ${mobileView === "history" ? "block" : "hidden xl:block"}`}>
                  <div className="sticky top-6">
                    <ConversationSidebar />
                  </div>
                </div>

                {/* AI Chat Home (Right Column) */}
                <div className={`flex-grow min-w-0 ${mobileView === "chat" ? "block" : "hidden xl:block"}`}>
                  <AIChatStepFlow />
                </div>

              </div>
            )}

            {activeMainTab === "tree" && (
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-[#6D4AFF]" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Syllabus Subject View</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Explore structured syllabus blueprints, confidence rates, and active cognitive routes</p>
                  </div>
                </div>
                <ExamTreeInspector />
              </div>
            )}

            {activeMainTab === "uploads" && (
              <div className="max-w-6xl mx-auto space-y-6">
                <ResourceManagement />
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

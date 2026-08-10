"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkspaceProvider } from "../workspaceContext";
import { AIChatStepFlow } from "./AIChatStepFlow";
import { ExamTreeInspector } from "./ExamTreeInspector";
import { ResourceManagement } from "@/components/resources/ResourceManagement";
import { FolderTree, MessageSquare, Layers, Sparkles } from "lucide-react";

function WorkspaceInner() {
  const [activeMainTab, setActiveMainTab] = useState<"flow" | "tree" | "uploads">("flow");

  return (
    <div className="space-y-6 w-full p-4 sm:p-6 lg:p-8 min-h-screen relative text-slate-800 bg-slate-50/40">

      {/* Workspace Navigation Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 select-none shadow-sm">
          {(["flow", "tree"] as const).map((tab) => {
            const tabLabels = {
              flow: { label: "AI Assistant", icon: MessageSquare },
              tree: { label: "AI Tree", icon: FolderTree }
            };
            const TabIcon = tabLabels[tab].icon;
            const isActive = activeMainTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveMainTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200 border border-emerald-500"
                  : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60"
                  }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tabLabels[tab].label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-black text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-2xl border border-emerald-200 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>ExamForge-AI Active</span>
        </div>
      </div>

      {/* Main Content Workspace Transition Panels */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMainTab}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {activeMainTab === "flow" && <AIChatStepFlow />}

            {activeMainTab === "tree" && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3.5 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Syllabus Subject & Vector Tree View</h3>
                    <p className="text-[10px] text-slate-500 font-extrabold mt-0.5">Explore structured syllabus blueprints, confidence rates, and active cognitive routes</p>
                  </div>
                </div>
                <ExamTreeInspector />
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
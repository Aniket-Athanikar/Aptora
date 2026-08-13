"use client";

import React, { useEffect } from "react";
import { GoalEngineProvider } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard";
import { ChatAssistant } from "@/features/ai-coach/components/ChatAssistant";
import { useAICoachStore } from "@/features/ai-coach/store/aiCoachStore";
import { ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";

function CoachChatContent() {
  const { loadCoachData, chatHistory, sendChatMessage } = useAICoachStore();

  useEffect(() => {
    loadCoachData();
    const handleSync = () => {
      loadCoachData();
    };
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
    };
  }, [loadCoachData]);

  return (
    <DashboardLayout activeTab="coach">
      <div className="space-y-5 max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/coach"
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5 text-xs font-black shadow-3xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-emerald-600" /> Back to Coach Dashboard
          </Link>

          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3" /> Live Context Synced
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Personal AI Mentor Chat
          </h1>
          <p className="text-xs text-slate-500 font-semibold">
            Context-aware AI mentor calibrated to your syllabus goals and daily focus targets.
          </p>
        </div>

        {/* Chat assistant container */}
        <ChatAssistant
          chatHistory={chatHistory}
          onSendMessage={sendChatMessage}
        />
      </div>
    </DashboardLayout>
  );
}

export default function CoachChatPage() {
  return (
    <GoalEngineProvider>
      <CoachChatContent />
    </GoalEngineProvider>
  );
}

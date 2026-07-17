"use client";

import React, { useEffect } from "react";
import { GoalEngineProvider, useGoalEngine } from "@/contexts/goal-engine.context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ChatAssistant } from "@/features/ai-coach/components/ChatAssistant";
import { useAICoachStore } from "@/features/ai-coach/store/aiCoachStore";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

function CoachChatContent() {
  const { loadCoachData, chatHistory, sendChatMessage } = useAICoachStore();

  useEffect(() => {
    loadCoachData();
  }, [loadCoachData]);

  return (
    <DashboardLayout activeTab="coach">
      <div className="space-y-5">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/coach"
            className="p-1.5 hover:bg-white border border-transparent hover:border-gray-150 rounded-xl text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Coach Dashboard
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900">Personal AI Mentor Chat</h1>
          <p className="text-xs text-gray-500 font-semibold">Simulated chat powered by user context memories.</p>
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

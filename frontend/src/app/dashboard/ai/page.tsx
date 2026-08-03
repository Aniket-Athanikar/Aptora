"use client";

import React from "react";
import dynamic from "next/dynamic";
const AIWorkspace = dynamic(
  () => import("@/features/ai-workspace/components/AIWorkspace").then((m) => m.AIWorkspace),
  { ssr: false }
);
import { DashboardLayout } from "@/components/dashboard";
import { GoalEngineProvider } from "@/contexts/goal-engine.context";

function AIDashboardContent() {
  return (
    <DashboardLayout activeTab="ai" noPadding={true}>
      <AIWorkspace />
    </DashboardLayout>
  );
}

export default function AIDashboardPage() {
  return (
    <GoalEngineProvider>
      <AIDashboardContent />
    </GoalEngineProvider>
  );
}

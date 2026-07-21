"use client";

import React from "react";
import { AIWorkspace } from "@/features/ai-workspace/components/AIWorkspace";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { GoalEngineProvider } from "@/contexts/goal-engine.context";

function AIDashboardContent() {
  return (
    <DashboardLayout activeTab="ai">
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

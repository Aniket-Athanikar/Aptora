"use client";

import React from "react";
import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/dashboard";
import { GoalEngineProvider } from "@/contexts/goal-engine.context";

const AISourceLibrary = dynamic(
  () => import("@/features/ai-sources/components/AISourceLibrary").then((m) => m.AISourceLibrary),
  { ssr: false }
);

function AISourcesContent() {
  return (
    <DashboardLayout activeTab="ai-sources" noPadding={false}>
      <AISourceLibrary />
    </DashboardLayout>
  );
}

export default function AISourcesPage() {
  return (
    <GoalEngineProvider>
      <AISourcesContent />
    </GoalEngineProvider>
  );
}

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";
import { DashboardProvider, useDashboard } from "@/components/dashboard/DashboardContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { OnboardingWizard } from "@/components/dashboard/OnboardingWizard";
import { WorkspaceTab } from "@/components/dashboard/tabs/WorkspaceTab";
import { AnalyticsTab } from "@/components/dashboard/tabs/AnalyticsTab";
import { CalendarTab } from "@/components/dashboard/tabs/CalendarTab";
import { TutorTab } from "@/components/dashboard/tabs/TutorTab";
import { RevisionTab } from "@/components/dashboard/tabs/RevisionTab";
import { MockTestsTab } from "@/components/dashboard/tabs/MockTestsTab";
import { SettingsTab } from "@/components/dashboard/tabs/SettingsTab";
import { NotesTab } from "@/components/dashboard/tabs/NotesTab";
import { BookmarkedTab } from "@/components/dashboard/tabs/BookmarkedTab";

// Inner shell executing under the DashboardProvider context
const DashboardShell: React.FC = () => {
  const {
    authLoading,
    isOnboardingCompleted,
    activeTab
  } = useDashboard();

  // Authentication Loading view
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFF] flex flex-col justify-center items-center font-sans gap-5">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-t-4 border-indigo-600 animate-spin" />
          <Brain className="w-7 h-7 text-indigo-600 animate-pulse" />
        </div>
        <div className="space-y-1 text-center">
          <h4 className="font-extrabold text-neutral-800 text-sm">Synchronizing Secure Session</h4>
          <span className="block text-[10px] text-neutral-400 font-semibold">Calibrating workspace databases...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-neutral-800 flex font-sans overflow-hidden w-full">
      {/* Main Sidebar is always rendered */}
      <Sidebar />

      {/* Core Panel Content Wrapper */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          {!isOnboardingCompleted ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full overflow-y-auto"
            >
              <OnboardingWizard />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full flex flex-col overflow-hidden"
            >
              {/* Main top navigation */}
              <Header />

              {/* Content view routing */}
              <main className="flex-grow overflow-y-auto p-6 md:p-10 bg-[#FAFBFF]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full"
                  >
                    {activeTab === "home" && <WorkspaceTab />}
                    {activeTab === "analytics" && <AnalyticsTab />}
                    {activeTab === "planner" && <CalendarTab />}
                    {activeTab === "tutor" && <TutorTab />}
                    {activeTab === "revision" && <RevisionTab />}
                    {activeTab === "mocktests" && <MockTestsTab />}
                    {activeTab === "settings" && <SettingsTab />}
                    {activeTab === "notes-pdfs" && <NotesTab />}
                    {activeTab === "bookmarked" && <BookmarkedTab />}
                  </motion.div>
                </AnimatePresence>
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardShell />
    </DashboardProvider>
  );
}

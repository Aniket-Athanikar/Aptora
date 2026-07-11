"use client";

import React from "react";
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  GraduationCap, 
  Trophy, 
  FileText, 
  Brain, 
  TrendingUp, 
  Calendar, 
  Star, 
  Settings, 
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "./DashboardContext";

export const Sidebar: React.FC = () => {
  const {
    isOnboardingCompleted,
    isSidebarExpanded,
    toggleSidebar,
    activeTab,
    setActiveTab,
    handleResetOnboarding,
    router,
    logout
  } = useDashboard();

  return (
    <aside className={cn(
      "bg-white border-r border-[#E9ECF8] flex flex-col justify-between py-6 shrink-0 relative z-20 transition-all duration-300 select-none",
      isSidebarExpanded ? "w-64 px-6" : "w-20 px-3 items-center"
    )}>
      <div className="flex flex-col gap-8 w-full">
        {/* Logo and Collapse Toggle */}
        <div className={cn("flex items-center justify-between w-full", isSidebarExpanded ? "px-2" : "flex-col gap-4")}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/10 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            {isSidebarExpanded && (
              <span className="font-extrabold tracking-wider text-neutral-900 uppercase text-sm">
                EXAM FORGE<span className="text-indigo-600"> AI</span>
              </span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg border border-[#E9ECF8] hover:bg-indigo-50 hover:text-indigo-600 text-neutral-400 transition-colors cursor-pointer bg-transparent"
          >
            {isSidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Router Navigation */}
        <nav className="flex flex-col gap-1 w-full overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
          {[
            { id: "welcome", label: "Welcome", icon: Compass },
            { id: "personalized-setup", label: "Personalized Setup", icon: Sparkles },
            { id: "home", label: "Dashboard", icon: Compass },
            { id: "revision", label: "My Learning", icon: GraduationCap },
            { id: "mocktests", label: "Mock Tests", icon: Trophy },
            { id: "notes-pdfs", label: "Notes & PDFs", icon: FileText },
            { id: "tutor", label: "AI Tutor (Chat)", icon: Brain },
            { id: "analytics", label: "Progress", icon: TrendingUp },
            { id: "planner", label: "Calendar", icon: Calendar },
            { id: "bookmarked", label: "Bookmarked", icon: Star },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isSetupTab = tab.id === "personalized-setup";
            const active = isSetupTab ? !isOnboardingCompleted : (activeTab === tab.id && isOnboardingCompleted);
            const disabled = !isOnboardingCompleted && !isSetupTab;

            return (
              <div key={tab.id} className="relative group w-full">
                <button
                  disabled={disabled}
                  onClick={() => {
                    if (isSetupTab) {
                      handleResetOnboarding();
                    } else if (tab.id === "welcome") {
                      router.push("/");
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 cursor-pointer border-0 text-left hover:scale-[1.03]",
                    active 
                      ? "bg-indigo-50 text-indigo-600 font-extrabold ring-1 ring-indigo-100 shadow-sm" 
                      : "text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 font-medium",
                    disabled && "opacity-40 pointer-events-none"
                  )}
                >
                  <IconComp className="w-5 h-5 flex-shrink-0" />
                  {isSidebarExpanded && <span className="text-sm font-semibold">{tab.label}</span>}
                </button>
                {!isSidebarExpanded && (
                  <span className="absolute left-24 top-3 px-2 py-1 text-xs font-bold text-white bg-neutral-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                    {tab.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

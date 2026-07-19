"use client";

import React, { useMemo } from "react";
import { KnowledgeEngineProvider, useKnowledgeEngine } from "./context";
import { EngineDashboard } from "./components/dashboard/EngineDashboard";
import { ExamPicker } from "./components/exams/ExamPicker";
import { UploadCenter } from "./components/upload/UploadCenter";
import { QualityEngine } from "./components/quality/QualityEngine";
import { PipelineScreen } from "./components/pipeline/PipelineScreen";
import { LibraryView } from "./components/library/LibraryView";
import { KnowledgeWorkspace } from "./components/knowledge/KnowledgeEngine";
import { QuestionEngine } from "./components/qa/QuestionEngine";
import { AnalyticsDashboard } from "./components/analytics/AnalyticsDashboard";
import { DownloadCenter } from "./components/downloads/DownloadCenter";
import { VersionControl } from "./components/versions/VersionControl";
import * as Lucide from "lucide-react";
import type { KnowledgeTabId } from "./types";

const NAV_ITEMS: { id: KnowledgeTabId; label: string; icon: keyof typeof Lucide }[] = [
  { id: "dashboard", label: "Overview", icon: "LayoutDashboard" },
  { id: "exams", label: "Exams", icon: "GraduationCap" },
  { id: "upload", label: "Select Center", icon: "UploadCloud" },
  { id: "quality", label: "Image Quality", icon: "SlidersHorizontal" },
  { id: "pipeline", label: "OCR Pipeline", icon: "Cpu" },
  { id: "library", label: "Library", icon: "BookOpen" },
  { id: "knowledge", label: "Workspace", icon: "FileText" },
  { id: "qa", label: "Question Engine", icon: "HelpCircle" },
  { id: "analytics", label: "Analytics", icon: "BarChart3" },
  { id: "downloads", label: "Downloads", icon: "Download" },
  { id: "versions", label: "Versions", icon: "GitBranch" },
];

function KnowledgeEngineContent() {
  const engine = useKnowledgeEngine();
  const activeTab = engine.state.ui.activeTab;

  const qualityFiles = useMemo(() => {
    return engine.state.books.map((b) => ({
      id: b.id,
      name: b.title,
      ext: b.fileExt || "pdf",
      sizeBytes: b.sizeBytes,
      previewUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=80",
      coverColor: b.coverColor || "from-indigo-500 via-violet-500 to-fuchsia-500",
    }));
  }, [engine.state.books]);

  const handleQualityProcessComplete = () => {
    engine.setTab("pipeline");
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case "dashboard":
        return <EngineDashboard />;
      case "exams":
        return <ExamPicker />;
      case "upload":
        return <UploadCenter onUploaded={() => engine.setTab("quality")} />;
      case "quality":
        return <QualityEngine files={qualityFiles} onProcessComplete={handleQualityProcessComplete} />;
      case "pipeline":
        return <PipelineScreen />;
      case "library":
        return <LibraryView />;
      case "knowledge":
        return <KnowledgeWorkspace />;
      case "qa":
        return <QuestionEngine />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "downloads":
        return <DownloadCenter />;
      case "versions":
        return <VersionControl />;
      default:
        return <EngineDashboard />;
    }
  };

  return (
    <div className="flex flex-col space-y-6 min-h-screen pb-12">
      {/* Top sticky navigation bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = Lucide[item.icon] as React.ComponentType<{ className?: string }>;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => engine.setTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen area */}
      <div className="transition-all duration-300">
        {renderActiveScreen()}
      </div>
    </div>
  );
}

export function KnowledgeEngine() {
  return (
    <KnowledgeEngineProvider>
      <KnowledgeEngineContent />
    </KnowledgeEngineProvider>
  );
}

export default KnowledgeEngine;

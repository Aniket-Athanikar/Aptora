"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Layers,
  BookOpen,
  FileText,
  FileCheck,
  Sparkles,
  Grid,
  List,
  FolderTree,
  Plus,
  HelpCircle,
  Database,
  RefreshCw,
} from "lucide-react";
import { useWorkspace } from "@/features/ai-workspace/workspaceContext";
import { ResourceCard } from "./ResourceCard";
import { ResourceUploadButton } from "./ResourceUploadButton";

export function ResourceManagement() {
  const { workspaces, activeWorkspaceId, activeWorkspace } = useWorkspace();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const currentWorkspace = activeWorkspace || workspaces[0];
  const allSubjects = currentWorkspace?.subjects || [];
  const allResources = currentWorkspace?.resources || [];

  // Filtered Resources calculation
  const filteredResources = useMemo(() => {
    return allResources.filter((res: any) => {
      // 1. Search Query
      const matchesSearch =
        !searchQuery.trim() ||
        (res.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (res.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Subject Filter
      const matchesSubject =
        selectedSubjectFilter === "all" ||
        res.subjectId === selectedSubjectFilter ||
        String(res.subject_id) === selectedSubjectFilter;

      // 3. Type Filter
      const resType = (res.resource_type || res.type || "").toLowerCase();
      const matchesType =
        selectedTypeFilter === "all" ||
        resType === selectedTypeFilter.toLowerCase();

      // 4. Status Filter
      const resStatus = (res.status || res.vectorStatus || "READY").toUpperCase();
      let matchesStatus = true;
      if (selectedStatusFilter === "ready") {
        matchesStatus = resStatus === "READY" || resStatus === "COMPLETED" || resStatus === "INDEXED";
      } else if (selectedStatusFilter === "processing") {
        matchesStatus =
          resStatus === "PROCESSING" ||
          resStatus === "UPLOADING" ||
          resStatus === "OCR" ||
          resStatus === "EMBEDDING";
      } else if (selectedStatusFilter === "failed") {
        matchesStatus = resStatus === "FAILED";
      }

      return matchesSearch && matchesSubject && matchesType && matchesStatus;
    });
  }, [allResources, searchQuery, selectedSubjectFilter, selectedTypeFilter, selectedStatusFilter]);

  // Group resources by subject for detailed hierarchy view
  const subjectGroups = useMemo(() => {
    return allSubjects.map((sub) => {
      const subResources = filteredResources.filter(
        (r: any) => r.subjectId === sub.id || String(r.subject_id) === sub.id
      );

      const books = subResources.filter(
        (r: any) => (r.resource_type || r.type || "").toLowerCase() === "book"
      );
      const notes = subResources.filter(
        (r: any) => (r.resource_type || r.type || "").toLowerCase() === "note" || (r.resource_type || r.type || "").toLowerCase() === "notes"
      );
      const pyqs = subResources.filter(
        (r: any) => (r.resource_type || r.type || "").toLowerCase() === "pyq"
      );
      const syllabus = subResources.filter(
        (r: any) => (r.resource_type || r.type || "").toLowerCase() === "syllabus"
      );

      return {
        subject: sub,
        totalCount: subResources.length,
        books,
        notes,
        pyqs,
        syllabus,
        all: subResources,
      };
    });
  }, [allSubjects, filteredResources]);

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5.5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search resources by title, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-xs font-bold rounded-2xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-slate-900"
            />
          </div>

          {/* Action Upload Button */}
          <ResourceUploadButton variant="primary" size="md" />
        </div>

        {/* Filters Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-150">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 mr-1">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              <span>Filters:</span>
            </div>

            {/* Subject Filter Dropdown */}
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="px-3.5 py-2 text-xs font-extrabold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all cursor-pointer"
            >
              <option value="all">All Subjects ({allSubjects.length})</option>
              {allSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>

            {/* Resource Type Filter */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-3.5 py-2 text-xs font-extrabold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all cursor-pointer"
            >
              <option value="all">All Resource Types</option>
              <option value="book">Books</option>
              <option value="notes">Notes</option>
              <option value="pyq">PYQs</option>
              <option value="syllabus">Syllabus</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3.5 py-2 text-xs font-extrabold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="ready">Ready (Indexed)</option>
              <option value="processing">Processing / Embedding</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-emerald-700 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-emerald-950"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-emerald-700 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-emerald-950"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Hierarchy List & Grid View */}
      {filteredResources.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <FolderTree className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              No Study Resources Found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              There are no uploaded study materials matching your current filters in this workspace. Upload your first book, notes, or PYQs!
            </p>
          </div>
          <div className="pt-2">
            <ResourceUploadButton variant="primary" size="md" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {subjectGroups
            .filter((group) => group.totalCount > 0)
            .map((group) => (
              <div
                key={group.subject.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5"
              >
                {/* Subject Section Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${group.subject.color || "from-purple-500 to-indigo-600"} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        {group.subject.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {group.totalCount} item{group.totalCount !== 1 ? "s" : ""} indexed
                      </p>
                    </div>
                  </div>

                  <ResourceUploadButton
                    subjectId={group.subject.id}
                    variant="outline"
                    size="sm"
                    label="Upload to Subject"
                  />
                </div>

                {/* Sub-categories (Books, Notes, PYQs, Syllabus) */}
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "space-y-3"
                  }
                >
                  {group.all.map((res: any) => (
                    <ResourceCard
                      key={res.id}
                      resource={res}
                      subjectName={group.subject.name}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

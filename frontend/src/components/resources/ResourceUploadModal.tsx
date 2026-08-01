"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  FileCheck,
  HelpCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "@/features/ai-workspace/workspaceContext";
import { backendService, Resource } from "@/services/backend.service";
import { useToast } from "@/lib/ToastContext";

const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export interface ResourceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkspaceId?: string;
  defaultSubjectId?: string;
  defaultResourceType?: string;
  onSuccess?: (newResource?: Resource) => void;
}

export function ResourceUploadModal({
  isOpen,
  onClose,
  defaultWorkspaceId,
  defaultSubjectId,
  defaultResourceType = "book",
  onSuccess,
}: ResourceUploadModalProps) {
  const { workspaces, activeWorkspaceId, refreshResources } = useWorkspace();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [resourceType, setResourceType] = useState<string>(defaultResourceType);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Dynamic Subjects state
  const [availableSubjects, setAvailableSubjects] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(false);

  // Upload & Progress State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<
    "idle" | "uploading" | "processing" | "embedding" | "completed" | "failed"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Sync workspace and subject defaults
  useEffect(() => {
    if (isOpen) {
      const localWorkspaceId = defaultWorkspaceId || activeWorkspaceId || workspaces[0]?.id || "";
      setSelectedWorkspaceId(localWorkspaceId);
      setResourceType(defaultResourceType || "book");
      setErrorMessage(null);
      setCurrentStep("idle");
      setUploadProgress(0);
      setStatusMessage("");
      setSelectedFile(null);
      setTitle("");
      setDescription("");

      // The backend owns the workspace ID. Local workspace IDs may be mock/UI IDs.
      backendService.workspace.current()
        .then((workspace) => setSelectedWorkspaceId(String(workspace.id)))
        .catch(() => setErrorMessage("Create your workspace before uploading resources."));
    }
  }, [isOpen, defaultWorkspaceId, activeWorkspaceId, workspaces, defaultResourceType]);

  // Load subjects whenever selected workspace changes
  useEffect(() => {
    if (!selectedWorkspaceId) return;

    // Check in local workspace context first
    const targetWs = workspaces.find((w) => w.id === selectedWorkspaceId);
    if (targetWs && targetWs.subjects && targetWs.subjects.length > 0) {
      const formatted = targetWs.subjects.map((s) => ({
        id: s.id,
        name: s.name,
      }));
      setAvailableSubjects(formatted);
      if (!selectedSubjectId || !formatted.some((s) => s.id === selectedSubjectId)) {
        const defaultSubj = defaultSubjectId && formatted.some((s) => s.id === defaultSubjectId)
          ? defaultSubjectId
          : formatted[0].id;
        setSelectedSubjectId(defaultSubj);
      }
    }

    // Also fetch dynamically from backend if workspaceId is numeric or to sync
    const numWsId = Number(selectedWorkspaceId);
    if (!Number.isInteger(numWsId) || numWsId <= 0) {
      setAvailableSubjects([]);
      setSelectedSubjectId("");
      return;
    }
    setIsLoadingSubjects(true);
    backendService.workspace
      .subjects(numWsId)
      .then((subjects) => {
        if (subjects && subjects.length > 0) {
          const fetched = subjects.map((s) => ({
            id: String(s.id),
            name: s.name,
          }));
          setAvailableSubjects(fetched);
          if (!selectedSubjectId || !fetched.some((s) => s.id === selectedSubjectId)) {
            const defaultSubj = defaultSubjectId && fetched.some((s) => s.id === defaultSubjectId)
              ? defaultSubjectId
              : fetched[0].id;
            setSelectedSubjectId(defaultSubj);
          }
        }
      })
      .catch(() => {
        /* Keep context fallback */
      })
      .finally(() => setIsLoadingSubjects(false));
  }, [selectedWorkspaceId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isUploading) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isUploading, onClose]);

  // Handle File Validation
  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const extension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      setErrorMessage(
        `Unsupported file type (${extension}). Please upload PDF, DOCX, or TXT.`
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max limit is 50MB.`
      );
      return false;
    }

    setSelectedFile(file);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Poll processing status
  const pollStatus = async (resourceId: number) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 * 1.5s = 45s timeout

    const checkStatus = async (): Promise<boolean> => {
      attempts++;
      try {
        const res = await backendService.documents.status(resourceId);
        const status = (res.status || "").toUpperCase();

        if (status === "COMPLETED" || status === "READY") {
          setCurrentStep("completed");
          setStatusMessage("Document processing completed & vector indexed!");
          setUploadProgress(100);
          return true;
        } else if (status === "FAILED") {
          setCurrentStep("failed");
          setErrorMessage("Backend AI document processing failed.");
          return true;
        } else if (status === "EMBEDDING" || status === "CHUNKING") {
          setCurrentStep("embedding");
          setStatusMessage("Generating vector embeddings in Qdrant...");
          setUploadProgress(85);
        } else if (status === "PROCESSING" || status === "OCR") {
          setCurrentStep("processing");
          setStatusMessage("Performing OCR and structural analysis...");
          setUploadProgress(60);
        }
      } catch {
        /* Ignore transient polling errors */
      }

      if (attempts >= maxAttempts) {
        setCurrentStep("completed");
        setStatusMessage("Uploaded successfully (processing continues in background).");
        return true;
      }
      return false;
    };

    while (attempts < maxAttempts) {
      const isDone = await checkStatus();
      if (isDone) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
  };

  // Submit Upload
  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }
    if (!selectedWorkspaceId) {
      setErrorMessage("Please select a target workspace.");
      return;
    }
    if (!selectedSubjectId) {
      setErrorMessage("Please select a target subject.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setCurrentStep("uploading");
    setUploadProgress(5);
    setStatusMessage("Uploading document...");

    const numericWsId = Number(selectedWorkspaceId);
    const numericSubjId = Number(selectedSubjectId);
    if (!Number.isInteger(numericWsId) || numericWsId <= 0 || !Number.isInteger(numericSubjId) || numericSubjId <= 0) {
      setErrorMessage("Select a valid workspace and backend subject before uploading.");
      setIsUploading(false);
      setCurrentStep("failed");
      return;
    }

    try {
      const result = await backendService.documents.upload(
        numericWsId,
        numericSubjId,
        resourceType.toLowerCase(),
        selectedFile,
        title || selectedFile.name,
        description,
        (percent) => {
          setUploadProgress(Math.min(percent, 90));
          if (percent >= 100) {
            setCurrentStep("processing");
            setStatusMessage("File uploaded! Initiating AI processing pipeline...");
          }
        }
      );

      // Poll status if backend document ID is returned
      if (result && result.id) {
        await pollStatus(result.id);
      } else {
        setCurrentStep("completed");
        setStatusMessage("Resource uploaded successfully!");
      }

      toast("Resource uploaded successfully!", "success");

      // Trigger automatic context refresh without page reload
      if (refreshResources) {
        await refreshResources();
      }

      if (onSuccess) {
        onSuccess(result);
      }

      // Close modal after brief delay to show completion state
      setTimeout(() => {
        setIsUploading(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsUploading(false);
      setCurrentStep("failed");
      const msg = err?.message || err?.detail || "Failed to upload resource. Please try again.";
      setErrorMessage(msg);
      toast(msg, "error");
    }
  };

  if (!isOpen) return null;

  const modal = (
    <AnimatePresence>
      <div onMouseDown={() => !isUploading && onClose()} className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-md sm:p-6" role="presentation">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onMouseDown={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="resource-upload-title"
          className="relative flex max-h-[90vh] w-[95vw] max-w-[900px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl sm:w-[90vw] lg:w-[min(90vw,900px)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#6D4AFF]/10 text-[#6D4AFF] flex items-center justify-center font-bold">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 id="resource-upload-title" className="text-base font-black text-slate-900 tracking-tight">
                  Upload Study Resource
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Index books, notes, PYQs, and syllabus into ExamForge AI
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isUploading}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Selectors Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Workspace Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Target Exam Workspace <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedWorkspaceId}
                  onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                  disabled={isUploading}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6D4AFF] outline-none transition-all disabled:opacity-60"
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.examName || ws.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Subject <span className="text-rose-500">*</span></span>
                  {isLoadingSubjects && (
                    <span className="text-[10px] text-purple-600 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                    </span>
                  )}
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  disabled={isUploading || isLoadingSubjects}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6D4AFF] outline-none transition-all disabled:opacity-60"
                >
                  {availableSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resource Type Selector Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Resource Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: "book", label: "Book", icon: BookOpen },
                  { id: "notes", label: "Notes", icon: FileText },
                  { id: "pyq", label: "PYQ", icon: FileCheck },
                  { id: "syllabus", label: "Syllabus", icon: Layers },
                  { id: "reference", label: "Reference", icon: Sparkles },
                ].map((type) => {
                  const Icon = type.icon;
                  const isActive = resourceType === type.id;
                  return (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setResourceType(type.id)}
                      disabled={isUploading}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all ${
                        isActive
                          ? "bg-[#6D4AFF] text-white border-[#6D4AFF] shadow-md shadow-purple-500/20"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-white"
                      } disabled:opacity-60`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Resource Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indian Polity by M. Laxmikanth (7th Edition)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6D4AFF] outline-none transition-all disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief notes or summary regarding this study material..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isUploading}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6D4AFF] outline-none transition-all resize-none disabled:opacity-60"
                />
              </div>
            </div>

            {/* Drag & Drop File Upload Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Upload File <span className="text-rose-500">*</span>
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                  isDragging
                    ? "border-[#6D4AFF] bg-purple-50/50"
                    : selectedFile
                    ? "border-emerald-300 bg-emerald-50/20"
                    : "border-slate-200 bg-slate-50/60 hover:border-purple-300 hover:bg-white"
                } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-800 truncate max-w-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for upload
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D4AFF] flex items-center justify-center mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-slate-800">
                      Drag & drop file here, or <span className="text-[#6D4AFF] underline">Browse</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                      Supported formats: PDF, DOCX, DOC, TXT (Max 50MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Upload Progress Bar & State */}
            {isUploading && (
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#6D4AFF]" />
                    <span>{statusMessage}</span>
                  </div>
                  <span className="text-[#6D4AFF] font-black">{uploadProgress}%</span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-[#6D4AFF] to-purple-500 h-full rounded-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 text-xs font-extrabold text-slate-600 hover:text-slate-900 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUploadSubmit}
              disabled={isUploading || !selectedFile}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-xl bg-[#6D4AFF] text-white hover:bg-[#5b3ce0] transition-all shadow-md shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Resource</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
  return createPortal(modal, document.body);
}

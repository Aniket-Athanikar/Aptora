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

    const defaultDiverseSubjects = [
      { id: "subj-history", name: "History & Culture" },
      { id: "subj-geography", name: "Geography & Ecology" },
      { id: "subj-polity", name: "Polity & Governance" },
      { id: "subj-economy", name: "Economy & Growth" },
      { id: "subj-science", name: "Science & Technology" },
    ];

    // Check in local workspace context first
    const targetWs = workspaces.find((w) => w.id === selectedWorkspaceId);
    if (targetWs && targetWs.subjects && targetWs.subjects.length > 0) {
      const formatted = targetWs.subjects.map((s) => ({
        id: s.id,
        name: s.name,
      }));
      const combined = formatted.length > 1 ? formatted : [...formatted, ...defaultDiverseSubjects];
      setAvailableSubjects(combined);
      if (!selectedSubjectId || !combined.some((s) => s.id === selectedSubjectId)) {
        const defaultSubj = defaultSubjectId && combined.some((s) => s.id === defaultSubjectId)
          ? defaultSubjectId
          : combined[0].id;
        setSelectedSubjectId(defaultSubj);
      }
    }

    // Also fetch dynamically from backend if workspaceId is numeric or to sync
    const numWsId = Number(selectedWorkspaceId);
    if (!Number.isInteger(numWsId) || numWsId <= 0) {
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
          const combined = fetched.length > 1 ? fetched : [...fetched, ...defaultDiverseSubjects];
          setAvailableSubjects(combined);
          if (!selectedSubjectId || !combined.some((s) => s.id === selectedSubjectId)) {
            const defaultSubj = defaultSubjectId && combined.some((s) => s.id === defaultSubjectId)
              ? defaultSubjectId
              : combined[0].id;
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
      <div onMouseDown={() => !isUploading && onClose()} className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-md sm:p-6" role="presentation">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onMouseDown={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="resource-upload-title"
          className="relative flex max-h-[92vh] w-[95vw] max-w-[850px] flex-col overflow-hidden rounded-[32px] border border-slate-200/90 bg-white shadow-2xl shadow-emerald-950/5 sm:w-[90vw] lg:w-[min(90vw,850px)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-slate-150 bg-gradient-to-r from-emerald-50/40 via-amber-50/10 to-white">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-650 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-200/60">
                <Upload className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 id="resource-upload-title" className="text-lg font-black text-slate-900 tracking-tight">
                  Upload Study Resource
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Index books, notes, PYQs, and syllabus into Aptora
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isUploading}
              className="p-2.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-7 space-y-6 overflow-y-auto flex-1 bg-gradient-to-b from-white via-emerald-50/5 to-white">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 shadow-2xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Subject Selector */}
            <div className="space-y-2 max-w-md">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center justify-between">
                <span>Subject <span className="text-rose-500">*</span></span>
                {isLoadingSubjects && (
                  <span className="text-[10px] text-emerald-750 font-bold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-600" /> Loading...
                  </span>
                )}
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                disabled={isUploading || isLoadingSubjects}
                className="w-full px-4 py-3 text-xs font-extrabold rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all disabled:opacity-60 cursor-pointer text-slate-900"
              >
                {availableSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Drag & Drop File Upload Box */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                Upload File <span className="text-rose-500">*</span>
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${isDragging
                    ? "border-emerald-600 bg-emerald-100/60 scale-[1.01]"
                    : selectedFile
                      ? "border-emerald-400 bg-emerald-50/30"
                      : "border-slate-250 bg-gradient-to-br from-slate-50/40 via-white to-emerald-50/10 hover:border-emerald-300 hover:bg-emerald-50/60"
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
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-900 truncate max-w-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10.5px] text-slate-500 font-bold mt-0.5">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for upload
                      </p>
                    </div>
                  </div>
                ) : (
                  <>                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-650 text-white shadow-md shadow-emerald-200/50 flex items-center justify-center mb-3 border border-emerald-450">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-slate-900">
                      Drag & drop file here, or <span className="text-emerald-600 underline font-black">Browse</span>
                    </p>
                    <p className="text-[10.5px] text-slate-500 font-bold mt-1.5">
                      Supported formats: PDF, DOCX, DOC, TXT (Max 50MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Upload Progress Bar & State */}
            {isUploading && (
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>{statusMessage}</span>
                  </div>
                  <span className="text-emerald-700 font-black">{uploadProgress}%</span>
                </div>

                <div className="w-full bg-emerald-100 h-2.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3.5 px-7 py-4.5 border-t border-slate-150 bg-slate-50/85">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-5 py-2.5 text-xs font-extrabold text-slate-650 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUploadSubmit}
              disabled={isUploading || !selectedFile}
              className="flex items-center gap-2 px-6 py-3 text-xs font-black rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-200/50 border border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

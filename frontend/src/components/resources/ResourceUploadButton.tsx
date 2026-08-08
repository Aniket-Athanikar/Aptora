"use client";

import React, { useState } from "react";
import { Upload, Plus } from "lucide-react";
import { ResourceUploadModal } from "./ResourceUploadModal";

export interface ResourceUploadButtonProps {
  workspaceId?: string;
  subjectId?: string;
  resourceType?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  label?: string;
  iconOnly?: boolean;
  className?: string;
  onSuccess?: () => void;
}

export function ResourceUploadButton({
  workspaceId,
  subjectId,
  resourceType,
  variant = "primary",
  size = "md",
  label = "Upload Resource",
  iconOnly = false,
  className = "",
  onSuccess,
}: ResourceUploadButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-slate-900 text-white hover:bg-slate-800 border border-slate-800 shadow-2xs font-extrabold";
      case "outline":
        return "bg-white text-purple-950 hover:bg-purple-50/80 border border-purple-200/90 hover:border-purple-400 font-extrabold shadow-2xs";
      case "ghost":
        return "bg-transparent text-purple-900 hover:bg-purple-100/60 font-bold";
      case "gradient":
        return "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-200 font-black";
      case "primary":
      default:
        return "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200 font-black";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return iconOnly ? "p-2 rounded-xl text-xs" : "px-3.5 py-1.5 rounded-xl text-xs font-black gap-1.5";
      case "lg":
        return iconOnly ? "p-3.5 rounded-2xl text-base" : "px-6 py-3.5 rounded-2xl text-sm font-black gap-2.5";
      case "md":
      default:
        return iconOnly ? "p-2.5 rounded-xl text-sm" : "px-4 py-2.5 rounded-2xl text-xs font-black gap-2";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center justify-center transition-all cursor-pointer select-none ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      >
        <Upload className={size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4"} />
        {!iconOnly && <span>{label}</span>}
      </button>

      <ResourceUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultWorkspaceId={workspaceId}
        defaultSubjectId={subjectId}
        defaultResourceType={resourceType}
        onSuccess={() => {
          if (onSuccess) onSuccess();
        }}
      />
    </>
  );
}

"use client";

import React, { useState } from "react";
import { useWorkspace } from "../workspaceContext";
import { ChatMessage } from "../types";
import { Copy, Bookmark, FileText, Layers, GitPullRequest, HelpCircle, Languages, Share2, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { useToast } from "@/lib/ToastContext";

interface MessageToolbarProps {
  message: ChatMessage;
}

export function MessageToolbar({ message }: MessageToolbarProps) {
  const { toast } = useToast();
  const { toggleMessageBookmark, toggleMessageLike, triggerQuickAction } = useWorkspace();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-slate-400 select-none">
      {/* Copy */}
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
        title="Copy response text"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>

      {/* Save to Notes */}
      <button
        onClick={() => {
          toast("Creating study notes from response...", "info");
          triggerQuickAction("notes");
        }}
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer text-indigo-600"
        title="Save block as study notes"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Save Notes</span>
      </button>

      {/* Flashcards */}
      <button
        onClick={() => {
          toast("Generating flashcards study set...", "info");
          triggerQuickAction("flashcards");
        }}
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer text-violet-600"
        title="Extract Flashcards"
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Flashcards</span>
      </button>

      {/* Mind Map */}
      <button
        onClick={() => {
          toast("Constructing interactive Mind Map...", "info");
          triggerQuickAction("mindmap");
        }}
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer text-pink-600"
        title="Convert to Concept Map"
      >
        <GitPullRequest className="w-3.5 h-3.5" />
        <span>Mind Map</span>
      </button>

      {/* Quiz */}
      <button
        onClick={() => {
          toast("Compiling practice quiz questions...", "info");
          triggerQuickAction("questions");
        }}
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer text-blue-600"
        title="Create quiz practice questions"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        <span>Create Quiz</span>
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
      >
        {shared ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600">Copied</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </>
        )}
      </button>
    </div>
  );
}

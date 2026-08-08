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
    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 text-slate-400 select-none">
      {/* Thumbs like/dislike */}
      <button
        onClick={() => toggleMessageLike(message.id, "like")}
        className={`p-2.5 rounded-xl hover:bg-slate-50 transition-colors ${
          message.liked ? "text-purple-600 bg-purple-50" : ""
        }`}
        title="Like response"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => toggleMessageLike(message.id, "dislike")}
        className={`p-2.5 rounded-xl hover:bg-slate-50 transition-colors ${
          message.disliked ? "text-red-500 bg-red-50" : ""
        }`}
        title="Dislike response"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-slate-100 mx-1" />

      {/* Copy */}
      <button
        onClick={handleCopy}
        className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-[10px] font-bold"
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

      {/* Bookmark */}
      <button
        onClick={() => toggleMessageBookmark(message.id)}
        className={`p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-[10px] font-bold ${
          message.bookmarked ? "text-amber-500 bg-amber-50" : ""
        }`}
        title="Bookmark answer"
      >
        <Bookmark className="w-3.5 h-3.5 fill-current" />
        <span>{message.bookmarked ? "Bookmarked" : "Bookmark"}</span>
      </button>

      {/* Convert to Study Formats */}
      <button
        onClick={() => {
          toast("Creating notes from this response block in ExamForge Study Engine...", "info");
          triggerQuickAction("notes");
        }}
        className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-[10px] font-bold cursor-pointer"
        title="Save block as study notes"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Save to Notes</span>
      </button>

      <button
        onClick={() => {
          toast("Generating active recall flashcards study set from this response...", "info");
          triggerQuickAction("flashcards");
        }}
        className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-[10px] font-bold cursor-pointer"
        title="Extract Flashcards"
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Flashcards</span>
      </button>

      <button
        onClick={() => {
          toast("Constructing interactive Mind Map conceptual nodes...", "info");
          triggerQuickAction("mindmap");
        }}
        className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-[10px] font-bold cursor-pointer"
        title="Convert to Concept Map"
      >
        <GitPullRequest className="w-3.5 h-3.5" />
        <span>Mind Map</span>
      </button>

      <button
        onClick={() => {
          toast("Compiling 5 practice questions from response parameters...", "info");
          triggerQuickAction("questions");
        }}
        className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-[10px] font-bold cursor-pointer"
        title="Create quiz practice questions"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        <span>Create Quiz</span>
      </button>

      {/* Share / Translate */}
      <div className="w-[1px] h-4 bg-slate-100 mx-1" />

      <button
        onClick={() => toast("Simulating translation to Hindi, Spanish, Sanskrit...", "info")}
        className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-[10px] font-bold cursor-pointer"
      >
        <Languages className="w-3.5 h-3.5" />
        <span>Translate</span>
      </button>

      <button
        onClick={handleShare}
        className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-[10px] font-bold"
      >
        {shared ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600">Link Copied</span>
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

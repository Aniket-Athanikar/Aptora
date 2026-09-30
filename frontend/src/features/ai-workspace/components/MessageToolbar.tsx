"use client";

import React, { useState } from "react";
import { useWorkspace } from "../workspaceContext";
import { ChatMessage } from "../types";
import { Copy, Bookmark, FileText, Layers, GitPullRequest, HelpCircle, Share2, ThumbsUp, ThumbsDown, Check, RefreshCw } from "lucide-react";
import { useToast } from "@/lib/ToastContext";

interface MessageToolbarProps {
  message: ChatMessage;
}

export function MessageToolbar({ message }: MessageToolbarProps) {
  const { toast } = useToast();
  const { toggleMessageBookmark, toggleMessageLike, triggerQuickAction, sendMessage } = useWorkspace();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    toast("Response copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    setShared(true);
    toast("Shareable link copied!", "success");
    setTimeout(() => setShared(false), 2000);
  };

  const handleRegenerate = () => {
    toast("Re-generating AI response with enhanced depth...", "info");
    sendMessage("Please elaborate on the previous point with more detailed examples.", []);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-purple-200/70 select-none">
      {/* Thumbs Feedback */}
      <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-300/80 shadow-2xs">
        <button
          onClick={() => {
            toggleMessageLike(message.id, "like");
            toast("Feedback saved: Liked", "success");
          }}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${message.liked
              ? "text-purple-900 bg-purple-200 font-black shadow-2xs"
              : "text-slate-600 hover:text-purple-800 hover:bg-white"
            }`}
          title="Helpful response"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            toggleMessageLike(message.id, "dislike");
            toast("Feedback saved: Needs improvement", "info");
          }}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${message.disliked
              ? "text-rose-700 bg-rose-200 font-black shadow-2xs"
              : "text-slate-600 hover:text-rose-700 hover:bg-white"
            }`}
          title="Not helpful"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Copy Pill */}
      <button
        onClick={handleCopy}
        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 border border-slate-300/80 hover:border-purple-400 text-slate-800 hover:text-purple-900 transition-all flex items-center gap-1.5 text-[10.5px] font-bold shadow-2xs cursor-pointer"
        title="Copy response text"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-black">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span>Copy</span>
          </>
        )}
      </button>

      {/* Bookmark Pill */}
      <button
        onClick={() => {
          toggleMessageBookmark(message.id);
          toast(message.bookmarked ? "Bookmark removed" : "Saved to Bookmarks!", "success");
        }}
        className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-[10.5px] font-bold shadow-2xs cursor-pointer ${message.bookmarked
            ? "bg-amber-100/90 border-amber-400 text-amber-950 font-black"
            : "bg-white border-slate-300/80 hover:border-amber-400 text-slate-800 hover:text-amber-900 hover:bg-amber-50/50"
          }`}
        title="Bookmark answer"
      >
        <Bookmark className={`w-3.5 h-3.5 ${message.bookmarked ? "fill-amber-500 text-amber-600" : "text-amber-600"}`} />
        <span>{message.bookmarked ? "Bookmarked" : "Bookmark"}</span>
      </button>

      {/* Re-generate */}
      <button
        onClick={handleRegenerate}
        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 border border-slate-300/80 hover:border-purple-400 text-slate-800 hover:text-purple-900 transition-all flex items-center gap-1.5 text-[10.5px] font-bold shadow-2xs cursor-pointer"
        title="Re-generate response"
      >
        <RefreshCw className="w-3.5 h-3.5 text-purple-700" />
        <span>Retry</span>
      </button>

      {/* Convert to Study Formats */}
      <button
        onClick={() => {
          toast("Converting response block to study notes...", "success");
          triggerQuickAction("notes");
        }}
        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-300/80 hover:border-indigo-400 text-slate-800 hover:text-indigo-900 transition-all flex items-center gap-1.5 text-[10.5px] font-bold shadow-2xs cursor-pointer"
        title="Save block as study notes"
      >
        <FileText className="w-3.5 h-3.5 text-indigo-600" />
        <span>Save Notes</span>
      </button>

      <button
        onClick={() => {
          toast("Extracting active recall flashcards...", "success");
          triggerQuickAction("flashcards");
        }}
        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-pink-50 border border-slate-300/80 hover:border-pink-400 text-slate-800 hover:text-pink-900 transition-all flex items-center gap-1.5 text-[10.5px] font-bold shadow-2xs cursor-pointer"
        title="Extract Flashcards"
      >
        <Layers className="w-3.5 h-3.5 text-pink-600" />
        <span>Flashcards</span>
      </button>

      <button
        onClick={() => {
          toast("Generating interactive Mind Map...", "success");
          triggerQuickAction("mindmap");
        }}
        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-violet-50 border border-slate-300/80 hover:border-violet-400 text-slate-800 hover:text-violet-900 transition-all flex items-center gap-1.5 text-[10.5px] font-bold shadow-2xs cursor-pointer"
        title="Convert to Mind Map"
      >
        <GitPullRequest className="w-3.5 h-3.5 text-violet-600" />
        <span>Mind Map</span>
      </button>

      <button
        onClick={() => {
          toast("Compiling practice quiz questions...", "success");
          triggerQuickAction("questions");
        }}
        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-300/80 hover:border-emerald-400 text-slate-800 hover:text-emerald-900 transition-all flex items-center gap-1.5 text-[10.5px] font-bold shadow-2xs cursor-pointer"
        title="Create quiz"
      >
        <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>Quiz</span>
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-300/80 hover:border-emerald-400 text-slate-800 hover:text-emerald-900 transition-all flex items-center gap-1.5 text-[10.5px] font-bold shadow-2xs cursor-pointer ml-auto"
      >
        {shared ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-bold">Link Copied</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Share</span>
          </>
        )}
      </button>
    </div>
  );
}
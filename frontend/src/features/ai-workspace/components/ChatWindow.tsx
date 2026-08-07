"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { useWorkspace } from "../workspaceContext";
import { ChatMessage } from "./ChatMessage";
import { InputToolbar } from "./InputToolbar";
import { PromptSuggestions } from "./PromptSuggestions";
import { ThinkingAnimation } from "./ThinkingAnimation";
import {
  Sparkles,
  Bot,
  Trash2,
  Download,
  Search,
  Pin,
  Edit2,
  Check,
  X,
  ArrowDown,
  BookOpen,
  MessageSquare,
  BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/ToastContext";

export function ChatWindow() {
  const { toast } = useToast();
  const {
    activeConversation,
    isStreaming,
    thinkingStage,
    deleteConversation,
    renameConversation,
    togglePinConversation,
  } = useWorkspace();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  useEffect(() => {
    if (activeConversation) {
      setEditTitle(activeConversation.title);
    }
  }, [activeConversation?.id]);

  useEffect(() => {
    if (!showScrollBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages, isStreaming, thinkingStage]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBottom(false);
  };

  const handleSaveRename = () => {
    if (!activeConversation || !editTitle.trim()) return;
    renameConversation(activeConversation.id, editTitle.trim());
    setIsEditingTitle(false);
    toast("Study session renamed.", "success");
  };

  const exportMarkdown = () => {
    if (!activeConversation || !activeConversation.messages || activeConversation.messages.length === 0) {
      toast("No messages to export.", "info");
      return;
    }
    const md = activeConversation.messages
      .map((m) => `### ${m.sender === "user" ? "User Prompt" : "ExamForge AI Response"}\n\n${m.text}\n`)
      .join("\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeConversation.title.replace(/[^a-z0-9]/gi, "_")}.md`;
    a.click();
    toast("Conversation exported to Markdown file.", "success");
  };

  // Filter messages by search query
  const filteredMessages = useMemo(() => {
    if (!activeConversation?.messages) return [];
    if (!searchQuery.trim()) return activeConversation.messages;
    const q = searchQuery.toLowerCase();
    return activeConversation.messages.filter((m) => m.text.toLowerCase().includes(q));
  }, [activeConversation?.messages, searchQuery]);

  const totalWords = useMemo(() => {
    if (!activeConversation?.messages) return 0;
    return activeConversation.messages.reduce(
      (acc, m) => acc + (m.text ? m.text.split(/\s+/).length : 0),
      0
    );
  }, [activeConversation?.messages]);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/40 border border-purple-100 rounded-3xl min-h-[500px]">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-650 p-5 rounded-3xl text-white mb-4 shadow-lg shadow-purple-200 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-800">No Active Study Session</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-sm font-semibold leading-relaxed">
          Select a study session from the sidebar or pick a subject & resource from the step flow to begin.
        </p>
      </div>
    );
  }

  const hasMessages = activeConversation.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-white border border-purple-100/60 rounded-3xl overflow-hidden shadow-sm relative">
      {/* Header Bar */}
      <div className="bg-slate-50/80 border-b border-purple-100/60 px-5 py-3.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="bg-purple-100 text-purple-700 p-2.5 rounded-2xl border border-purple-200 shrink-0">
            <Bot className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5 max-w-md">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-xs font-black text-slate-800 bg-white border border-purple-300 rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-purple-100 flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveRename();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                />
                <button
                  onClick={handleSaveRename}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                  title="Save Title"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h4
                  onClick={() => setIsEditingTitle(true)}
                  className="text-sm font-black text-slate-800 truncate cursor-pointer hover:text-purple-700 transition-colors"
                  title="Click to rename"
                >
                  {activeConversation.title}
                </h4>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                  title="Rename Title"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 text-[10px] text-purple-650 font-black mt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ExamForge Active
              </span>
              <span>· {activeConversation.messages.length} messages</span>
              <span>· {totalWords} words</span>
            </div>
          </div>
        </div>

        {/* Top Header Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${showSearch ? "bg-purple-100 text-purple-700" : "text-slate-400 hover:text-purple-600 hover:bg-slate-100"
              }`}
            title="Search conversation"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => togglePinConversation(activeConversation.id)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${activeConversation.pinned ? "bg-purple-100 text-purple-700" : "text-slate-400 hover:text-purple-600 hover:bg-slate-100"
              }`}
            title={activeConversation.pinned ? "Unpin session" : "Pin session"}
          >
            <Pin className="w-4 h-4" />
          </button>

          <button
            onClick={exportMarkdown}
            disabled={!hasMessages}
            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-slate-100 disabled:opacity-40 rounded-xl transition-colors cursor-pointer"
            title="Export Markdown file"
          >
            <Download className="w-4 h-4" />
          </button>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-xl text-[10px] shrink-0">
              <span className="font-bold text-rose-700">Delete?</span>
              <button
                onClick={() => {
                  deleteConversation(activeConversation.id);
                  setShowDeleteConfirm(false);
                }}
                className="font-black text-rose-600 hover:text-rose-800 cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete Session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Filter Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-50/70 border-b border-purple-100 px-5 py-2.5 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-3.5 h-3.5 text-purple-600" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter messages in this session..."
                className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 font-semibold outline-none"
                autoFocus
              />
            </div>
            {searchQuery && (
              <span className="text-[10px] font-black text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                {filteredMessages.length} match{filteredMessages.length === 1 ? "" : "es"}
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSearch(false);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/30 scroll-smooth"
      >
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center text-center py-14 max-w-lg mx-auto space-y-3">
            <div className="bg-purple-50 text-purple-600 p-4 rounded-3xl border border-purple-100 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              ExamForge AI Ready
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Ask anything, request conceptual summaries, convert notes, or extract active recall quizzes to start studying.
            </p>
            <div className="mt-6 w-full border-t border-purple-100/60 pt-6">
              <PromptSuggestions />
            </div>
          </div>
        )}

        {hasMessages && filteredMessages.length > 0 && (
          <div className="space-y-6">
            {filteredMessages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        )}

        {hasMessages && filteredMessages.length === 0 && searchQuery && (
          <div className="py-16 text-center text-xs font-bold text-slate-400">
            No messages match "{searchQuery}".
          </div>
        )}

        {/* Live dynamic thinking pipeline animation */}
        {isStreaming && thinkingStage && <ThinkingAnimation stage={thinkingStage} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Jump to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-8 p-3 bg-purple-600 text-white rounded-full shadow-lg shadow-purple-300 hover:bg-purple-700 transition-all cursor-pointer z-10 flex items-center justify-center animate-bounce"
          title="Jump to latest message"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Input controls footer */}
      <div className="border-t border-purple-100/50 p-4 bg-white">
        <InputToolbar />
      </div>
    </div>
  );
}

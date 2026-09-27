"use client";

import React, { useRef, useEffect, useState } from "react";
import { useWorkspace } from "../workspaceContext";
import { ChatMessage } from "./ChatMessage";
import { InputToolbar } from "./InputToolbar";
import { PromptSuggestions } from "./PromptSuggestions";
import { ThinkingAnimation } from "./ThinkingAnimation";
import { Sparkles, Bot, Trash2, ArrowDown, ShieldCheck, Download, Loader2, MoreVertical, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { backendService } from "@/services/backend.service";
import { useToast } from "@/lib/ToastContext";
import { ExportModal } from "./ExportModal";

export function ChatWindow() {
  const { activeConversation, isStreaming, thinkingStage, deleteConversation } = useWorkspace();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const { toast } = useToast();

  const handleSaveAsNote = async () => {
    if (!activeConversation) return;
    setSavingNote(true);
    setIsMenuOpen(false);
    toast("Extracting key concepts to create study notes...", "info");
    try {
      await backendService.ai.saveAsNote(activeConversation.id);
      toast("Successfully converted conversation to a structured study note.", "success");
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "Failed to save conversation as note.", "error");
    } finally {
      setSavingNote(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isStreaming, thinkingStage]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/20 border border-purple-200/80 rounded-3xl min-h-[420px] shadow-sm">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="bg-gradient-to-br from-purple-600 to-indigo-600 border border-purple-300 p-5 rounded-3xl text-white mb-5 shadow-lg shadow-purple-200"
        >
          <Sparkles className="w-9 h-9" />
        </motion.div>
        <h3 className="text-lg font-black text-slate-800 tracking-tight">No Active Study Session</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-md font-semibold leading-relaxed">
          Select an existing chat session from the study history or click <span className="font-extrabold text-purple-700">&ldquo;New Chat&rdquo;</span> to launch an AI context-guided study workspace.
        </p>
      </div>
    );
  }

  const hasMessages = activeConversation.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-white border border-purple-200/80 rounded-3xl overflow-hidden shadow-sm relative">
      {/* Active Conversation Header */}
      <div className="bg-gradient-to-r from-slate-50 via-purple-50/30 to-slate-50 border-b border-purple-100 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-2.5 rounded-2xl border border-purple-400 shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 truncate max-w-[200px] sm:max-w-md">
              {activeConversation.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-purple-700 font-black flex items-center gap-1.5 bg-purple-100/80 px-2 py-0.5 rounded-full border border-purple-200">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                Active Context
              </span>
              <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Grounded AI
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Dropdown Menu for Save note & Export PDF */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-400 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-all cursor-pointer border border-transparent hover:border-purple-200 flex items-center gap-1"
              title="Conversation Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-50 text-xs font-black text-slate-700"
                >
                  <button
                    onClick={handleSaveAsNote}
                    disabled={savingNote}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingNote ? (
                      <Loader2 className="w-3.5 h-3.5 text-slate-405 animate-spin" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    Save as AI Note
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsExportModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Export PDF
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-xs shrink-0 shadow-xs">
              <span className="font-bold text-rose-800">Delete session?</span>
              <button
                onClick={() => {
                  deleteConversation(activeConversation.id);
                  setShowDeleteConfirm(false);
                }}
                className="font-black text-rose-700 hover:text-rose-900 px-1.5 py-0.5 bg-rose-100 rounded-md cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="font-bold text-slate-600 hover:text-slate-800 px-1 py-0.5 cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all cursor-pointer border border-transparent hover:border-rose-200"
              title="Delete Session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gradient-to-b from-slate-50/40 via-white to-purple-50/10"
      >
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center text-center py-10 max-w-lg mx-auto">
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 p-4 rounded-3xl border border-purple-200 mb-4 shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
              Aptora Assistant Ready
            </h4>
            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-semibold">
              Ask any question, request conceptual summaries, convert notes into active recall quizzes, or start asking from uploaded PDFs.
            </p>
            <div className="mt-8 w-full border-t border-purple-100 pt-6">
              <PromptSuggestions />
            </div>
          </div>
        )}

        {hasMessages && (
          <div className="space-y-6">
            {activeConversation.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        )}

        {/* Live dynamic thinking pipeline animation */}
        {isStreaming && thinkingStage && <ThinkingAnimation stage={thinkingStage} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Indicator */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-8 bg-purple-600 text-white p-2.5 rounded-full shadow-lg hover:bg-purple-700 transition-all z-20 flex items-center justify-center cursor-pointer border border-purple-400"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input controls footer */}
      <div className="border-t border-purple-100 p-3.5 sm:p-4 bg-white">
        <InputToolbar />
      </div>

      {/* Export Conversation Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        conversationId={activeConversation.id}
        conversationTitle={activeConversation.title}
        messageCount={activeConversation.messages.length}
      />
    </div>
  );
}

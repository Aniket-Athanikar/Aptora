"use client";

import React, { useRef, useEffect, useState } from "react";
import { useWorkspace } from "../workspaceContext";
import { ChatMessage } from "./ChatMessage";
import { InputToolbar } from "./InputToolbar";
import { PromptSuggestions } from "./PromptSuggestions";
import { ThinkingAnimation } from "./ThinkingAnimation";
import { Sparkles, Bot, Trash2 } from "lucide-react";

export function ChatWindow() {
  const { activeConversation, isStreaming, thinkingStage, deleteConversation } = useWorkspace();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, isStreaming, thinkingStage]);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/20 border border-purple-50 rounded-3xl min-h-[400px]">
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-3xl text-purple-600 mb-4 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-base font-black text-gray-800">No Active Study Session</h3>
        <p className="text-xs text-gray-400 mt-2 max-w-sm">
          Select an existing session from the history sidebar or upload a book to start a context-guided study workspace.
        </p>
      </div>
    );
  }

  const hasMessages = activeConversation.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-white border border-purple-100/60 rounded-3xl overflow-hidden shadow-sm">
      {/* Active Conversation Header */}
      <div className="bg-slate-50 border-b border-purple-100/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 text-purple-700 p-2 rounded-xl border border-purple-200">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-gray-800 truncate max-w-[200px] sm:max-w-md">
              {activeConversation.title}
            </h4>
            <p className="text-[9px] text-purple-600 font-extrabold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
              Active Study Context
            </p>
          </div>
        </div>

        {showDeleteConfirm ? (
          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-xl text-[10px] shrink-0">
            <span className="font-semibold text-rose-700">Delete session?</span>
            <button onClick={() => { deleteConversation(activeConversation.id); setShowDeleteConfirm(false); }} className="font-bold text-rose-600 hover:text-rose-800">Yes</button>
            <button onClick={() => setShowDeleteConfirm(false)} className="font-bold text-slate-500 hover:text-slate-700">No</button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Delete Session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center text-center py-12 max-w-lg mx-auto">
            <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl border border-purple-100 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
              ExamForge AI Active
            </h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Ask anything, request conceptual summaries, convert notes, or extract active recall quizzes to start studying.
            </p>
            <div className="mt-8 w-full border-t border-purple-50 pt-6">
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

      {/* Input controls footer */}
      <div className="border-t border-purple-100/50 p-4 bg-white">
        <InputToolbar />
      </div>
    </div>
  );
}

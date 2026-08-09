"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send, Bot, Trash2, Shield, MoreVertical,
  Sparkles, CheckCheck, Edit3, X, Check, RefreshCw
} from "lucide-react";
import { ChatMessage, useAICoachStore } from "../store/aiCoachStore";

interface ChatAssistantProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => void;
}

const quickPrompts = [
  "How should I structure my Economy study block today?",
  "I am feeling distracted. Help me refocus.",
  "What is the best way to revise weak topics?",
  "Give me a 15-minute active recall exercise."
];

export function ChatAssistant({ chatHistory, onSendMessage }: ChatAssistantProps) {
  const { deleteChatMessage, editChatMessage, clearChatHistory } = useAICoachStore();
  const [inputText, setInputText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleQuickPromptClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setEditingText(msg.text);
  };

  const saveEdit = (msgId: string) => {
    if (editingText.trim()) {
      editChatMessage(msgId, editingText.trim());
    }
    setEditingMsgId(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const formatMessageTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-sm relative z-10">

      {/* ExamForge Modern Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-3.5 flex items-center justify-between shadow-xs relative z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-[#6D4AFF]/20 border border-[#6D4AFF]/40 flex items-center justify-center text-[#6D4AFF]">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-white tracking-wide">ExamForge AI Mentor</h3>
              <span className="bg-[#6D4AFF]/30 text-indigo-300 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-500/30">
                GPT-4o
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Context-aware study assistant</p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center gap-3 text-slate-300">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-slate-800 rounded-xl"
              title="Chat Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-40 text-slate-700 text-xs font-bold">
                  <button
                    onClick={() => {
                      clearChatHistory();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-1.5 text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear History
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="bg-slate-50/70 border-b border-slate-100 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#6D4AFF]" /> Ideas:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPromptClick(prompt)}
            className="text-[10px] font-bold text-slate-600 bg-white hover:bg-indigo-50 hover:text-[#6D4AFF] border border-slate-200/80 px-3 py-1 rounded-full whitespace-nowrap transition-all shadow-3xs cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col bg-slate-50/30">
        <div className="mx-auto bg-indigo-50/60 text-[#6D4AFF] text-[9px] font-black uppercase tracking-wider py-1 px-3.5 rounded-full border border-indigo-100 shadow-3xs flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" /> Context Synced with Syllabus Goals
        </div>

        {chatHistory.map((msg) => {
          const isUser = msg.sender === "user";
          const isEditing = editingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col group max-w-[80%] ${
                isUser ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl relative shadow-3xs transition-all ${
                  isUser
                    ? "bg-[#6D4AFF] text-white rounded-tr-none"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-200/80"
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="bg-white/20 text-white text-xs font-medium px-2 py-1 rounded border border-white/30 outline-none w-full"
                    />
                    <button
                      onClick={() => saveEdit(msg.id)}
                      className="p-1 bg-white/20 hover:bg-white/30 text-white rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingMsgId(null)}
                      className="p-1 bg-white/20 hover:bg-white/30 text-white rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-medium leading-relaxed pr-10">{msg.text}</p>
                    <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-black/5">
                      <span className={`text-[8px] font-extrabold ${isUser ? "text-indigo-200" : "text-slate-400"}`}>
                        {formatMessageTime(msg.timestamp)} {msg.isEdited && "(edited)"}
                      </span>

                      {/* Inline CRUD Actions on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={() => startEdit(msg)}
                          className={`p-0.5 rounded hover:bg-black/10 transition-colors ${isUser ? "text-indigo-200" : "text-slate-400"}`}
                          title="Edit Message"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteChatMessage(msg.id)}
                          className={`p-0.5 rounded hover:bg-black/10 transition-colors ${isUser ? "text-indigo-200 hover:text-rose-300" : "text-slate-400 hover:text-rose-500"}`}
                          title="Delete Message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Bottom Input Bar */}
      <form
        onSubmit={handleSend}
        className="bg-white border-t border-slate-200/80 px-4 py-3 flex gap-3 items-center relative z-20"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#6D4AFF] focus:bg-white text-xs font-semibold outline-none transition-all placeholder:text-slate-400 text-slate-800"
          placeholder="Ask your ExamForge AI Mentor..."
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-4 py-2.5 bg-[#6D4AFF] hover:bg-[#5A36EE] disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center gap-1.5 rounded-xl transition-all font-bold text-xs shadow-md shadow-indigo-100 shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 text-white" /> Send
        </button>
      </form>

    </div>
  );
}

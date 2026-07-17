import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, CornerDownLeft } from "lucide-react";
import { ChatMessage } from "../store/aiCoachStore";

interface ChatAssistantProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export function ChatAssistant({ chatHistory, onSendMessage }: ChatAssistantProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden flex flex-col h-[520px] shadow-sm">
      {/* Header */}
      <div className="bg-slate-50 border-b border-gray-100 px-5 py-4.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-gray-800">AI Coach Mentor</h3>
            <p className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Simulated Coach Memory Active
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
        {chatHistory.map((msg) => {
          const isCoach = msg.sender === "coach";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${
                isCoach ? "mr-auto" : "ml-auto flex-row-reverse"
              }`}
            >
              {/* Avatar frame */}
              <div
                className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                  isCoach
                    ? "bg-indigo-50 border-indigo-100 text-indigo-600"
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                {isCoach ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-2xl p-3.5 text-xs font-medium leading-relaxed ${
                  isCoach
                    ? "bg-white border border-gray-150 text-gray-800 rounded-tl-xs shadow-xs"
                    : "bg-indigo-600 text-white rounded-tr-xs"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="border-t border-gray-100 p-4 flex gap-2.5 items-center bg-white"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-white text-xs outline-none transition-all"
          placeholder="Ask about focus issues, study block targets, revision tricks..."
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3 rounded-2xl transition-all shadow-md shadow-indigo-150"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

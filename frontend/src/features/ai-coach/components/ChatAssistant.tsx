"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, User, Trash2, Shield, MoreVertical, 
  Phone, Video, CheckCheck, Smile, Paperclip, Mic, ArrowLeft 
} from "lucide-react";
import { ChatMessage } from "../store/aiCoachStore";

interface ChatAssistantProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export function ChatAssistant({ chatHistory, onSendMessage }: ChatAssistantProps) {
  const [inputText, setInputText] = useState("");
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [messageMenuId, setMessageMenuId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  // Delete message CRUD action (Local storage sync via window events or store)
  const handleDeleteMessage = (msgId: string) => {
    const storedHistory = localStorage.getItem("examforge_chat_history");
    if (storedHistory) {
      const parsed = JSON.parse(storedHistory) as ChatMessage[];
      const updated = parsed.filter((m) => m.id !== msgId);
      localStorage.setItem("examforge_chat_history", JSON.stringify(updated));
      // Trigger a window event to reload the store history state
      window.dispatchEvent(new Event("storage"));
    }
    setMessageMenuId(null);
  };

  const handleClearChat = () => {
    const initialMsg: ChatMessage = {
      id: "msg_init",
      sender: "coach",
      text: "Hello! Let's start fresh. Ask me about your study plan or daily targets.",
      timestamp: new Date().toISOString()
    };
    localStorage.setItem("examforge_chat_history", JSON.stringify([initialMsg]));
    window.dispatchEvent(new Event("storage"));
    setMenuOpen(false);
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
    <div className="bg-[#efeae2] border border-slate-200 rounded-3xl overflow-hidden flex flex-col h-[580px] shadow-lg relative z-10">
      
      {/* WhatsApp Chat Head Header */}
      <div className="bg-[#0b141a] text-white px-5 py-3 flex items-center justify-between shadow-md relative z-20">
        <div className="flex items-center gap-3">
          {/* Bot avatar with online marker */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#128c7e]/20 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Bot className="w-5 h-5 text-teal-400" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25d366] rounded-full border-2 border-[#0b141a]" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-wide text-slate-100">AI Study Mentor</h3>
            <p className="text-[9px] text-[#25d366] font-extrabold tracking-wider uppercase">Online</p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-4 text-slate-300">
          <button type="button" className="hover:text-white transition-colors cursor-pointer" title="Start Call">
            <Phone className="w-4 h-4" />
          </button>
          <button type="button" className="hover:text-white transition-colors cursor-pointer" title="Start Video">
            <Video className="w-4 h-4" />
          </button>
          <div className="relative">
            <button 
              type="button" 
              onClick={() => setMenuOpen(!menuOpen)}
              className="hover:text-white transition-colors cursor-pointer p-1 rounded-lg"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-32 bg-[#233138] border border-slate-700 rounded-xl shadow-xl py-1 z-40 text-slate-200 text-xs font-semibold">
                  <button
                    onClick={handleClearChat}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700/50 flex items-center gap-1.5 text-rose-450 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Chat
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col relative"
        style={{
          backgroundImage: "radial-gradient(#128c7e 0.5px, transparent 0.5px), radial-gradient(#128c7e 0.5px, #efeae2 0.5px)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
          opacity: 0.95
        }}
      >
        
        {/* Encryption alert badge */}
        <div className="mx-auto bg-[#ffeecd] text-[#51585c] text-[9px] font-black uppercase tracking-wider py-1 px-3 rounded-lg border border-yellow-200 shadow-3xs flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-yellow-600" /> End-to-End Encrypted
        </div>

        {chatHistory.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col group max-w-[75%] ${
                isUser ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                onClick={() => setMessageMenuId(messageMenuId === msg.id ? null : msg.id)}
                className={`p-2.5 rounded-2xl relative shadow-3xs cursor-pointer select-none transition-all group-hover:shadow-sm ${
                  isUser
                    ? "bg-[#d9fdd3] text-[#111b21] rounded-tr-none border border-[#c6ebbe]"
                    : "bg-white text-[#111b21] rounded-tl-none border border-slate-200"
                }`}
              >
                {/* Text */}
                <p className="text-[11px] font-medium leading-relaxed pr-10">{msg.text}</p>
                
                {/* Meta details (Time + ticks) */}
                <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 select-none">
                  <span className="text-[8px] text-[#667781] font-bold">
                    {formatMessageTime(msg.timestamp)}
                  </span>
                  {isUser && (
                    <CheckCheck className="w-3 h-3 text-[#53bdeb] shrink-0" />
                  )}
                </div>
              </div>

              {/* Individual Message Actions (Delete CRUD popup) */}
              {messageMenuId === msg.id && (
                <div className="mt-1 flex gap-2">
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase hover:bg-rose-650 tracking-wider shadow"
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" /> Delete Message
                  </button>
                  <button
                    onClick={() => setMessageMenuId(null)}
                    className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black text-slate-500 hover:bg-slate-200 uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              )}

            </div>
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp Style Bottom Input Message Bar */}
      <form
        onSubmit={handleSend}
        className="bg-[#f0f2f5] px-4 py-3 flex gap-2.5 items-center relative z-20 shadow-inner"
      >
        <button type="button" className="text-slate-500 hover:text-slate-700 cursor-pointer">
          <Smile className="w-5 h-5" />
        </button>
        <button type="button" className="text-slate-500 hover:text-slate-700 cursor-pointer">
          <Paperclip className="w-5 h-5" />
        </button>
        
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 px-4 py-2.5 bg-white border border-transparent rounded-xl focus:border-slate-300 text-xs font-semibold outline-none transition-all placeholder:text-slate-400 text-slate-800"
          placeholder="Type a message"
        />

        {inputText.trim() ? (
          <button
            type="submit"
            className="w-9 h-9 bg-[#128c7e] hover:bg-[#075e54] text-white flex items-center justify-center rounded-full transition-all shrink-0 cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4 ml-0.5 text-white" />
          </button>
        ) : (
          <button
            type="button"
            className="w-9 h-9 bg-slate-300 text-slate-500 flex items-center justify-center rounded-full shrink-0 cursor-not-allowed"
          >
            <Mic className="w-4.5 h-4.5" />
          </button>
        )}
      </form>

    </div>
  );
}

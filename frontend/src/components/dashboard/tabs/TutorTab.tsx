"use client";

import React, { useRef, useEffect } from "react";
import { Brain, Send, Bot, Sparkles, History, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "../DashboardContext";

export const TutorTab: React.FC = () => {
  const {
    chatMessages,
    chatInput,
    setChatInput,
    isAiTyping,
    sendChatMessage,
    wizardData
  } = useDashboard();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start select-none h-full">
      {/* Primary Column (Left 2 Columns) - Chat Interface */}
      <div className="xl:col-span-2 h-[calc(100vh-140px)] flex flex-col">
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] shadow-sm flex flex-col flex-grow overflow-hidden">
          {/* Chat header */}
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Brain className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-neutral-900 text-sm leading-snug">ExamForge AI Study Coach</h3>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5 animate-pulse">● Active Online Session</span>
              </div>
            </div>
            <div className="p-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Syllabus Calibrated</span>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-grow p-6 overflow-y-auto space-y-4 min-h-0 bg-[#FAFBFF]">
            {chatMessages.map((msg, idx) => {
              const isAi = msg.sender === "ai";
              return (
                <div key={idx} className={cn("flex items-start gap-3 max-w-[80%]", isAi ? "mr-auto" : "ml-auto flex-row-reverse")}>
                  <div className={cn(
                    "p-2 rounded-xl shrink-0 text-white",
                    isAi ? "bg-indigo-600" : "bg-neutral-800"
                  )}>
                    {isAi ? <Bot className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-[20px] text-xs font-semibold leading-relaxed border shadow-sm",
                    isAi 
                      ? "bg-white text-neutral-800 border-neutral-100 rounded-tl-none" 
                      : "bg-neutral-900 text-white border-neutral-800 rounded-tr-none"
                  )}>
                    {msg.text ? (
                      <p className="whitespace-pre-line">{msg.text}</p>
                    ) : (
                      <div className="flex gap-1.5 py-1">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-75" />
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-150" />
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-225" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isAiTyping && (
              <div className="flex items-start gap-3 max-w-[80%] mr-auto">
                <div className="p-2 rounded-xl shrink-0 bg-indigo-600 text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-[20px] bg-white border border-neutral-100 rounded-tl-none shadow-sm flex items-center justify-center">
                  <div className="flex gap-1 py-1">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input panel footer */}
          <div className="p-4 border-t border-neutral-100 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendChatMessage();
              }}
              className="flex gap-3.5 bg-neutral-50 border border-neutral-200 rounded-xl p-1.5 focus-within:border-indigo-500 focus-within:bg-white transition-all"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about equations, history movements, formulas, or how to study..."
                className="flex-grow bg-transparent border-0 text-xs font-semibold px-3 py-2.5 focus:outline-none text-neutral-800"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl cursor-pointer transition-colors shadow-sm shadow-indigo-600/10 border-0 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Auxiliary Column (Right Column) */}
      <div className="xl:col-span-1 space-y-8">
        
        {/* Suggested Topics */}
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-extrabold text-neutral-900">Suggested Topics</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-[10px] text-neutral-500 font-semibold mb-2">Based on your weak areas:</p>
            {wizardData.subjects.length > 0 ? (
              wizardData.subjects.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => setChatInput(`Can you explain the core concepts of ${sub}?`)}
                  className="w-full text-left p-3 bg-[#FAFBFF] border border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl transition-colors cursor-pointer text-xs font-extrabold text-neutral-800"
                >
                  Explain concepts of {sub}
                </button>
              ))
            ) : (
              <>
                <button
                  onClick={() => setChatInput(`How do I improve my time management during exams?`)}
                  className="w-full text-left p-3 bg-[#FAFBFF] border border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl transition-colors cursor-pointer text-xs font-extrabold text-neutral-800"
                >
                  Time Management Strategies
                </button>
                <button
                  onClick={() => setChatInput(`Give me a practice question for Quantitative Aptitude.`)}
                  className="w-full text-left p-3 bg-[#FAFBFF] border border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl transition-colors cursor-pointer text-xs font-extrabold text-neutral-800"
                >
                  Quant Practice Question
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recent Queries History */}
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-extrabold text-neutral-900">Recent Queries</span>
            </div>
          </div>
          
          <div className="space-y-4 text-xs font-semibold text-neutral-600">
            {[
              "What is the formula for compound interest?",
              "Explain the difference between mitosis and meiosis.",
              "Summarize the French Revolution."
            ].map((query, idx) => (
              <div key={idx} className="flex gap-2 items-start cursor-pointer hover:text-indigo-600 transition-colors">
                <History className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-50" />
                <span className="line-clamp-2">{query}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

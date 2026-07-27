"use client";

import React, { useState } from "react";
import { useWorkspace } from "../workspaceContext";
import {
  Sparkles,
  ArrowLeft,
  Search,
  BookOpen,
  FileText,
  FileCheck,
  HelpCircle,
  ChevronRight,
  Bot,
  Send,
  Eye,
  RotateCcw,
  CheckCircle2,
  Book,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Layers,
  Sparkle,
  HelpCircle as HelpIcon,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/ToastContext";

export function AIChatStepFlow() {
  const { toast } = useToast();
  const {
    activeWorkspace,
    flowStep,
    setFlowStep,
    selectedSubjectId,
    selectSubject,
    selectedResourceType,
    selectResourceType,
    selectedResourceId,
    selectResource,
    startChatWithResource,
    sendMessage,
    activeConversation,
    isStreaming,
    triggerQuickAction
  } = useWorkspace();

  const [subjectSearch, setSubjectSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active Subject details
  const activeSubject = activeWorkspace?.subjects.find((s) => s.id === selectedSubjectId);
  const activeResource = activeWorkspace?.resources.find((r) => r.id === selectedResourceId);

  // Filtered Subjects
  const filteredSubjects = (activeWorkspace?.subjects || []).filter((s) =>
    s.name.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  // Filtered Resources
  const filteredResources = (activeWorkspace?.resources || []).filter(
    (r) =>
      r.subjectId === selectedSubjectId &&
      (!selectedResourceType || r.type === selectedResourceType) &&
      r.title.toLowerCase().includes(resourceSearch.toLowerCase())
  );

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput("");
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm">
      {/* STEP 1: SHOW ALL SUBJECTS */}
      {flowStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Step Header */}
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[11px] font-black uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5" />
              <span>Step 1 of 5 • AI Study Assistant</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Select a subject to start learning with AI
            </h2>
            <p className="text-xs text-slate-500">
              Pick any subject from <span className="font-bold text-purple-600">{activeWorkspace?.title}</span> to inspect study resources, generate notes, or launch RAG chat.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={subjectSearch}
              onChange={(e) => setSubjectSearch(e.target.value)}
              placeholder="Search subjects..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 shadow-sm transition-all"
            />
          </div>

          {/* Grid of Subjects */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredSubjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => selectSubject(subject.id)}
                className="group relative flex flex-col items-center justify-center p-5 bg-white border border-slate-100 rounded-2xl hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 text-center cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subject.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-3`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-black text-slate-800 group-hover:text-purple-600 transition-colors">
                  {subject.name}
                </h3>
                <span className="text-[10px] font-extrabold text-slate-400 mt-1">
                  {subject.resourceCount} Resources
                </span>
                {subject.subCategory && (
                  <span className="mt-2 text-[9px] font-black uppercase tracking-wider text-purple-500 bg-purple-50 px-2 py-0.5 rounded-md">
                    {subject.subCategory}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="text-center pt-2">
            <span className="text-[11px] font-bold text-slate-400 italic">
              💡 Tip: You can ask questions, generate notes, summarize topics and more with AI.
            </span>
          </div>
        </motion.div>
      )}

      {/* STEP 2: SELECT SUBJECT -> SHOW RESOURCE TYPES */}
      {flowStep === 2 && activeSubject && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          {/* Top Back Nav */}
          <button
            onClick={() => setFlowStep(1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Subjects
          </button>

          {/* Subject Header Banner */}
          <div className="flex flex-col items-center text-center p-6 bg-white border border-purple-100 rounded-3xl shadow-sm space-y-3">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeSubject.color} text-white flex items-center justify-center shadow-lg`}>
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">{activeSubject.name}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore study materials in different formats for {activeSubject.name}
              </p>
            </div>
          </div>

          {/* 4 Resource Type Cards (Books, PDFs, Notes, PYQs) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { type: "Book" as const, label: "Books", count: "28 Resources", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
              { type: "PDF" as const, label: "PDFs", count: "36 Resources", icon: FileText, color: "text-rose-600", bg: "bg-rose-50" },
              { type: "Note" as const, label: "Notes", count: "42 Resources", icon: FileCheck, color: "text-amber-600", bg: "bg-amber-50" },
              { type: "PYQ" as const, label: "PYQs", count: "21 Resources", icon: HelpCircle, color: "text-blue-600", bg: "bg-blue-50" },
            ].map(({ type, label, count, icon: Icon, color, bg }) => (
              <button
                key={type}
                onClick={() => selectResourceType(type)}
                className="group p-5 bg-white border border-slate-200 hover:border-purple-300 rounded-2xl shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-800 group-hover:text-purple-600 transition-colors">{label}</h4>
                <span className="text-[10px] text-slate-400 font-extrabold mt-0.5">{count}</span>
              </button>
            ))}
          </div>

          {/* Prompt Suggestion Card */}
          <div className="p-6 bg-white border border-purple-100 rounded-3xl space-y-4 shadow-sm">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">What can I help you with?</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
              {[
                `Explain a topic from ${activeSubject.name}`,
                "Summarize a book or PDF",
                "Generate notes on a topic",
                "Solve PYQs with explanations",
                "Compare two topics",
                "Any other doubt?"
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    selectResourceType("Book");
                    startChatWithResource("res-laxmikanth");
                  }}
                  className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-xl text-left border border-slate-100 hover:border-purple-200 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>{q}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Ask me anything about ${activeSubject.name}...`}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-purple-400 focus:bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    selectResourceType("Book");
                    startChatWithResource("res-laxmikanth");
                  }
                }}
              />
              <button
                onClick={() => {
                  selectResourceType("Book");
                  startChatWithResource("res-laxmikanth");
                }}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 3: SELECT RESOURCE TYPE -> SHOW RESOURCES LIST */}
      {flowStep === 3 && activeSubject && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setFlowStep(2)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to {activeSubject.name} Overview
            </button>
            <div className="text-xs font-extrabold text-slate-400">
              {activeSubject.name} / <span className="text-purple-600">{selectedResourceType}s</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-700">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{activeSubject.name} - {selectedResourceType}s</h2>
              <p className="text-xs text-slate-400">Choose a {selectedResourceType?.toLowerCase()} to continue</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={resourceSearch}
              onChange={(e) => setResourceSearch(e.target.value)}
              placeholder={`Search ${selectedResourceType?.toLowerCase()}s...`}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-400 shadow-sm"
            />
          </div>

          {/* Resources List */}
          <div className="space-y-3">
            {filteredResources.map((res) => (
              <button
                key={res.id}
                onClick={() => selectResource(res.id)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-purple-50/40 border border-slate-200 hover:border-purple-300 rounded-2xl shadow-sm transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-12 rounded-xl bg-gradient-to-br ${res.coverColor || "from-purple-500 to-indigo-600"} text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                    {res.type}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-800 group-hover:text-purple-600 transition-colors truncate">
                      {res.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Uploaded on {res.uploadDate} • {res.pages} Pages • {res.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                    {res.pages} Pages
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}

            {filteredResources.length === 0 && (
              <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400">No resources found matching search in {selectedResourceType}.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* STEP 4: SELECT PARTICULAR RESOURCE -> PREVIEW & ASK */}
      {flowStep === 4 && activeResource && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-5xl mx-auto"
        >
          {/* Top Breadcrumb */}
          <button
            onClick={() => setFlowStep(3)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {selectedResourceType}s
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Book Details & Outline */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-center">
                <div className={`w-32 h-44 mx-auto rounded-2xl bg-gradient-to-br ${activeResource.coverColor || "from-purple-600 to-indigo-700"} text-white flex flex-col items-center justify-center p-4 shadow-xl`}>
                  <BookOpen className="w-10 h-10 mb-2" />
                  <span className="text-xs font-black text-center leading-tight">{activeResource.title}</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">{activeResource.title}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">
                    {activeResource.pages} Pages • {activeResource.type} • {activeResource.size}
                  </p>
                  <p className="text-[10px] text-slate-400">Uploaded on {activeResource.uploadDate}</p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => startChatWithResource(activeResource.id)}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Start Chat with this {activeResource.type}
                  </button>
                  <button
                    onClick={() => toast("Document preview modal opened!", "info")}
                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    View Full Preview
                  </button>
                </div>
              </div>

              {/* Book Outline */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Book Outline</h4>
                <div className="space-y-1.5 text-xs">
                  {activeResource.chapters.map((ch, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 hover:bg-purple-50 rounded-xl text-slate-700 font-semibold cursor-pointer transition-colors flex items-center justify-between">
                      <span>{ch}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Embedded Document Preview */}
            <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-6 text-white min-h-[500px] flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-extrabold text-slate-400">
                  Preview (Page 1 / {activeResource.pages})
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <button className="p-1 hover:text-white">-</button>
                  <span>125%</span>
                  <button className="p-1 hover:text-white">+</button>
                </div>
              </div>

              <div className="my-auto space-y-4 max-w-md mx-auto text-slate-200">
                <h1 className="text-2xl font-black text-center text-white">The Constitution</h1>
                <div className="space-y-2 text-xs leading-relaxed">
                  <h3 className="font-bold text-purple-400">1.1 Salient Features</h3>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                    <li>The Constitution of India is the lengthiest written constitution in the world.</li>
                    <li>It is a blend of rigid and flexible constitution.</li>
                    <li>Parliamentary form of Government.</li>
                    <li>Fundamental Rights and Directive Principles of State Policy.</li>
                    <li>Independent Judiciary.</li>
                    <li>Single Citizenship.</li>
                    <li>Secular State.</li>
                    <li>Universal Adult Franchise.</li>
                    <li>Emergency Provisions.</li>
                  </ul>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-4 border-t border-slate-800">
                OCR Status: 100% Parsed & Stored in Vector Database
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 5: AI INTERFACE -> ASK & GET ANSWERS (RAG CHAT) */}
      {flowStep === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 max-w-6xl mx-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-white border border-purple-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFlowStep(4)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  {activeResource ? activeResource.title : "Indian Polity by M. Laxmikanth"}
                </h3>
                <span className="text-[10px] font-extrabold text-purple-600">Active RAG Document Context</span>
              </div>
            </div>
            <button
              onClick={() => setFlowStep(3)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Change Resource
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Main RAG Chat Container */}
            <div className="lg:col-span-8 bg-white border border-purple-100 rounded-3xl p-5 shadow-sm flex flex-col h-[560px]">
              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {activeConversation?.messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                    {msg.sender === "user" ? (
                      <div className="bg-purple-600 text-white px-4 py-3 rounded-2xl rounded-tr-none text-xs font-semibold max-w-md shadow-sm">
                        {msg.text}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl rounded-tl-none text-xs text-slate-800 max-w-xl space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-extrabold text-purple-600">
                          <Bot className="w-4 h-4" />
                          <span>AI Study Answer</span>
                        </div>
                        <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 text-[10px] font-bold text-slate-500">
                          <button className="flex items-center gap-1 hover:text-purple-600">
                            <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                          </button>
                          <button className="flex items-center gap-1 hover:text-purple-600">
                            <ThumbsDown className="w-3.5 h-3.5" /> Not Helpful
                          </button>
                          <button
                            onClick={() => handleCopyText(msg.text, msg.id)}
                            className="flex items-center gap-1 hover:text-purple-600 ml-auto"
                          >
                            <Copy className="w-3.5 h-3.5" /> {copiedId === msg.id ? "Copied!" : "Copy"}
                          </button>
                          <button className="flex items-center gap-1 hover:text-purple-600">
                            <RotateCcw className="w-3.5 h-3.5" /> Regenerate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isStreaming && (
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 p-3 rounded-xl w-fit animate-pulse">
                    <Sparkles className="w-4 h-4" />
                    <span>Searching Qdrant Vector Store & Generating Response...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything about this book..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-purple-400"
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                />
                <button
                  onClick={handleSendChat}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Quick Actions & Source Info Column */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-purple-100 rounded-3xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Quick Actions</h4>
                <div className="space-y-2 text-xs font-semibold">
                  {[
                    { label: "Summarize this chapter", action: "summarize" },
                    { label: "Generate notes", action: "notes" },
                    { label: "Create flashcards", action: "flashcards" },
                    { label: "Show important PYQs", action: "questions" },
                    { label: "Explain in simple terms", action: "explain" }
                  ].map(({ label, action }, idx) => (
                    <button
                      key={idx}
                      onClick={() => triggerQuickAction(action)}
                      className="w-full flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-xl text-left border border-slate-100 hover:border-purple-200 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Info Card */}
              <div className="bg-white border border-purple-100 rounded-3xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Source Info</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><span className="font-bold">Book:</span> {activeResource ? activeResource.title : "Indian Polity by M. Laxmikanth"}</p>
                  <p><span className="font-bold">Chapter:</span> The Constitution</p>
                  <p><span className="font-bold">Pages:</span> 1 - 15</p>
                </div>
                <button
                  onClick={() => setFlowStep(4)}
                  className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition-all cursor-pointer text-center block mt-2"
                >
                  View in Book
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

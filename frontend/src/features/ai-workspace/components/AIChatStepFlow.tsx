"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { backendService, type Resource } from "@/services/backend.service";
import { ResourceUploadButton } from "@/components/resources/ResourceUploadButton";

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
  const activeSubject = activeWorkspace?.subjects.find((s) => s.id === selectedSubjectId)!;
  const activeResource = activeWorkspace?.resources.find((r) => r.id === selectedResourceId)!;

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

  return <AiStudyHome />;

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

function AiStudyHome() {
  const { activeWorkspace, activeWorkspaceId, flowStep, setFlowStep, selectedSubjectId, selectedResourceType, selectedResourceId, selectSubject, selectResourceType, selectResource, refreshResources } = useWorkspace();
  const [subjectSearch, setSubjectSearch] = useState("");
  const subjects = (activeWorkspace?.subjects ?? []).filter((subject) =>
    subject.name.toLowerCase().includes(subjectSearch.trim().toLowerCase())
  );
  const selectedSubject = activeWorkspace?.subjects.find((subject) => subject.id === selectedSubjectId);

  if (flowStep === 2 && selectedSubject) {
    const subjectResources = activeWorkspace?.resources.filter((resource) => resource.subjectId === selectedSubject.id) ?? [];
    const resourceTypes = [
      { label: "Books", type: "Book", icon: BookOpen, tone: "text-purple-600 bg-purple-50" },
      { label: "Notes", type: "Note", icon: FileCheck, tone: "text-amber-600 bg-amber-50" },
      { label: "PYQs", type: "PYQ", icon: HelpCircle, tone: "text-blue-600 bg-blue-50" },
      { label: "Syllabus", type: "Syllabus", icon: Layers, tone: "text-emerald-600 bg-emerald-50" },
    ] as const;

    return (
      <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
          <button onClick={() => setFlowStep(1)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Subjects
          </button>
          <div className="flex flex-col items-center text-center p-6 bg-white border border-purple-100 rounded-3xl shadow-sm space-y-3">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedSubject.color} text-white flex items-center justify-center shadow-lg`}><BookOpen className="w-8 h-8" /></div>
            <div><h2 className="text-2xl font-black text-slate-800">{selectedSubject.name}</h2><p className="text-xs text-slate-400 mt-1">Explore study material in different formats</p></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {resourceTypes.map(({ label, type, icon: Icon, tone }) => {
              const count = subjectResources.filter((resource) => resource.type === type).length;
              return <div key={type} className="p-5 bg-white border border-slate-200 hover:border-purple-300 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition-all">
                <div className={`w-12 h-12 rounded-xl ${tone} flex items-center justify-center mb-3`}><Icon className="w-6 h-6" /></div>
                <button onClick={() => selectResourceType(type)} className="text-sm font-black text-slate-800 hover:text-purple-600">{label}</button><span className="text-[10px] text-slate-400 font-extrabold mt-0.5">{count} Resources</span>
                <div className="mt-3"><ResourceUploadButton workspaceId={activeWorkspaceId} subjectId={selectedSubject.id} resourceType={backendResourceType[type]} variant="outline" size="sm" label="Upload" onSuccess={() => void refreshResources()} /></div>
              </div>;
            })}
          </div>
          <div className="flex justify-end"><button onClick={() => setFlowStep(5)} className="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-200">Next <ChevronRight className="inline w-4 h-4" /></button></div>
        </motion.div>
      </div>
    );
  }

  if (flowStep === 3 && selectedSubject && selectedResourceType) {
    return <ResourceListStage subjectId={selectedSubject.id} subjectName={selectedSubject.name} resourceType={selectedResourceType} onBack={() => setFlowStep(2)} onSelect={selectResource} />;
  }

  if (flowStep === 4 && selectedResourceId) {
    return <ResourcePreviewStage resourceId={selectedResourceId} onBack={() => setFlowStep(3)} />;
  }

  if (flowStep === 5 && selectedSubject) {
    return <KnowledgeStudyWorkspace resourceId={selectedResourceId || ""} subjectName={selectedSubject.name} resourceType={selectedResourceType || "Book"} onBack={() => setFlowStep(selectedResourceId ? 4 : 2)} />;
  }

  return (
    <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-[11px] font-black uppercase tracking-wider"><Bot className="w-3.5 h-3.5" /><span>AI Study Assistant</span></div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI Study Assistant</h2>
          <p className="text-xs text-slate-500">Select a subject to start learning with AI.</p>
        </div>
        <div className="max-w-md mx-auto relative"><Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" /><input value={subjectSearch} onChange={(event) => setSubjectSearch(event.target.value)} placeholder="Search subjects" className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 shadow-sm transition-all" /></div>
        {subjects.length ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">{subjects.map((subject) => <button key={subject.id} onClick={() => selectSubject(subject.id)} className="group relative flex flex-col items-center justify-center p-5 bg-white border border-slate-100 rounded-2xl hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 text-center cursor-pointer"><div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subject.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-3`}><BookOpen className="w-6 h-6" /></div><h3 className="text-xs font-black text-slate-800 group-hover:text-purple-600">{subject.name}</h3><span className="text-[10px] font-extrabold text-slate-400 mt-1">{subject.resourceCount} Resources</span></button>)}</div> : <div className="text-center py-14 bg-white border border-dashed border-slate-200 rounded-2xl"><p className="text-xs text-slate-400">No subjects available.</p><button onClick={() => window.location.reload()} className="mt-3 text-xs font-bold text-purple-600 hover:text-purple-700">Retry</button></div>}
      </motion.div>
    </div>
  );
}

type ResourceTypeFilter = "Book" | "PDF" | "Note" | "PYQ" | "Syllabus";
const backendResourceType: Record<ResourceTypeFilter, string> = { Book: "book", PDF: "pdf", Note: "notes", PYQ: "pyq", Syllabus: "syllabus" };

function ResourceListStage({ subjectId, subjectName, resourceType, onBack, onSelect }: { subjectId: string; subjectName: string; resourceType: ResourceTypeFilter; onBack: () => void; onSelect: (id: string) => void }) {
  const { activeWorkspaceId } = useWorkspace();
  const [query, setQuery] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const load = async () => {
    const workspaceId = Number(activeWorkspaceId);
    if (!Number.isInteger(workspaceId) || workspaceId <= 0) return;
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ subject_id: subjectId, resource_type: backendResourceType[resourceType], keyword: query, limit: "100" });
      setResources((await backendService.workspace.search(workspaceId, params)).items);
    } catch (caught) { setResources([]); setError(caught instanceof Error ? caught.message : "Unable to load resources."); }
    finally { setLoading(false); }
  };
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 250); return () => window.clearTimeout(timer); }, [activeWorkspaceId, subjectId, resourceType, query]);
  return <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm space-y-5">
    <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600"><ArrowLeft className="w-4 h-4" /> Back to Resource Types</button>
    <div className="flex items-center justify-between gap-3"><div><h2 className="text-2xl font-black text-slate-800">{subjectName} · {resourceType}s</h2><p className="text-xs text-slate-400 mt-1">Resources from your workspace library</p></div><button disabled={!selectedId} onClick={() => selectedId && onSelect(selectedId)} className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white disabled:bg-slate-300">Next <ChevronRight className="inline w-4 h-4" /></button></div>
    <div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources" className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-400" /></div>
    {loading ? <div className="py-16 text-center text-xs text-slate-400">Loading resources…</div> : error ? <div className="py-16 text-center text-xs text-rose-500">{error}<button onClick={() => void load()} className="block mx-auto mt-3 text-purple-600 font-bold">Retry</button></div> : resources.length ? <div className="space-y-3">{resources.map((resource) => <button key={resource.id} onClick={() => setSelectedId(String(resource.id))} className={`w-full text-left flex items-center justify-between gap-3 p-4 bg-white hover:bg-purple-50/40 border rounded-2xl shadow-sm transition-all ${selectedId === String(resource.id) ? "border-purple-500 ring-2 ring-purple-100" : "border-slate-200 hover:border-purple-300"}`}><div className="min-w-0"><h3 className="text-xs font-black text-slate-800 truncate">{resource.title}</h3><p className="text-[10px] text-slate-400 mt-1">{resource.resource_type} · {new Date(resource.created_at).toLocaleDateString()} {resource.total_pages ? `· ${resource.total_pages} pages` : ""}</p></div><span className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{resource.status}</span></button>)}</div> : <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl"><p className="text-xs text-slate-400">No resources uploaded yet.</p></div>}
  </div>;
}

function ResourcePreviewStage({ resourceId, onBack }: { resourceId: string; onBack: () => void }) {
  const [resource, setResource] = useState<Resource | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = async () => { setLoading(true); setError(null); try { setResource(await backendService.documents.get(Number(resourceId))); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load resource."); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [resourceId]);
  return <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm space-y-5"><button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600"><ArrowLeft className="w-4 h-4" /> Back to Resources</button>{loading ? <div className="py-16 text-center text-xs text-slate-400">Loading resource…</div> : error || !resource ? <div className="py-16 text-center text-xs text-rose-500">{error || "Nothing found."}<button onClick={() => void load()} className="block mx-auto mt-3 text-purple-600 font-bold">Retry</button></div> : <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5"><aside className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"><h2 className="text-lg font-black text-slate-800">{resource.title}</h2><p className="text-xs text-slate-500">{resource.resource_type}</p><p className="text-xs text-slate-500">{resource.total_pages ? `${resource.total_pages} pages` : "Page count unavailable"}</p><p className="text-xs text-slate-500">Uploaded {new Date(resource.created_at).toLocaleDateString()}</p><span className="inline-block text-[9px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{resource.status}</span></aside><section className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">Preview unavailable.</section></div>}</div>;
}

type KnowledgeMessage = { role: "user" | "assistant"; content: string; confidence?: string; sources?: Array<{ resource_id?: number; document_title: string; subject: string; chapter?: string; page_number?: number; score: number }> };

const AI_THINKING_STAGES = ["Searching Books", "Searching Notes", "Searching PYQs", "Searching Syllabus", "Retrieving Embeddings", "Ranking Results", "Building Context", "Thinking", "Generating Response"];
const PROMPT_SUGGESTIONS = ["Explain this topic", "Generate revision notes", "Generate flashcards", "Generate UPSC MCQs", "Predict exam questions", "Teach like a beginner", "Explain with examples", "Memory tricks"];

function AiThinkingPipeline({ active }: { active: boolean }) {
  if (!active) return null;
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mr-auto max-w-[90%] rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50/60 p-4 shadow-sm">
    <div className="flex items-center gap-2"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }} className="h-6 w-6 rounded-lg bg-purple-600 text-white flex items-center justify-center"><Sparkles className="w-3.5 h-3.5" /></motion.div><div><p className="text-xs font-black text-slate-800">ExamForge is working</p><p className="text-[10px] text-slate-500">Live request in progress</p></div></div>
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">{AI_THINKING_STAGES.map((stage) => <motion.div key={stage} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0.25 }} className="flex items-center gap-2 text-[10px] font-semibold text-purple-700"><motion.span animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.1, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-purple-500" />{stage}</motion.div>)}</div>
  </motion.div>;
}

function StudyAnswer({ content }: { content: string }) {
  const sections = content.split(/^##\s+/m).filter(Boolean);
  if (sections.length < 2) return <p className="whitespace-pre-wrap">{content}</p>;
  return <div className="space-y-3">{sections.map((section, index) => {
    const [heading, ...body] = section.split("\n");
    return <section key={`${heading}-${index}`} className="rounded-xl border border-purple-100 bg-white p-3"><h4 className="text-[10px] font-black uppercase tracking-wide text-purple-700">{heading}</h4><p className="mt-1 whitespace-pre-wrap leading-relaxed">{body.join("\n").trim()}</p></section>;
  })}</div>;
}

function KnowledgeStudyWorkspace({ resourceId, subjectName, resourceType, onBack }: { resourceId: string; subjectName: string; resourceType: ResourceTypeFilter; onBack: () => void }) {
  const { activeWorkspace, activeWorkspaceId, selectedSubjectId, activeConversationId, setActiveConversationId, beginNewStudySession } = useWorkspace();
  const [sessionId, setSessionId] = useState(activeConversationId);
  const [messages, setMessages] = useState<KnowledgeMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<"subject" | "resource" | "selected">(resourceId ? "resource" : "subject");
  const [selectedResources, setSelectedResources] = useState<string[]>(resourceId ? [resourceId] : []);
  const [sessionStartedAt] = useState(() => Date.now());
  const [sessionDuration, setSessionDuration] = useState("0m");
  const inputRef = useRef<HTMLInputElement>(null);
  const workspaceId = Number(activeWorkspaceId);
  const hasWorkspace = Number.isInteger(workspaceId) && workspaceId > 0;
  const hasSubject = Boolean(selectedSubjectId);
  const subjectResources = activeWorkspace?.resources.filter((resource) => resource.subjectId === selectedSubjectId) ?? [];
  const resourcesIncluded = scope === "subject" ? subjectResources.length : scope === "resource" ? 1 : selectedResources.length;
  const lastQuestion = [...messages].reverse().find((message) => message.role === "user")?.content;
  useEffect(() => {
    const updateDuration = () => setSessionDuration(`${Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 60000))}m`);
    updateDuration();
    const interval = window.setInterval(updateDuration, 60_000);
    return () => window.clearInterval(interval);
  }, [sessionStartedAt]);
  const loadHistory = async () => {
    if (!sessionId) return;
    try { const conversation = await backendService.ai.conversation(sessionId); setMessages(conversation.messages.map((message) => ({ role: message.role, content: message.content, confidence: message.confidence || undefined, sources: message.sources || undefined }))); } catch { setMessages([]); }
  };
  useEffect(() => { void loadHistory(); }, [sessionId]);
  useEffect(() => {
    if (sessionId) return;
    const workspaceId = Number(activeWorkspaceId);
    if (!Number.isInteger(workspaceId) || workspaceId <= 0) return;
    backendService.ai.createConversation({ workspace_id: workspaceId, subject_id: selectedSubjectId ? Number(selectedSubjectId) : undefined })
      .then((conversation) => { setSessionId(conversation.session_id); setActiveConversationId(conversation.session_id); })
      .catch(() => setError("Unable to start a study session."));
  }, [activeWorkspaceId, selectedSubjectId, sessionId, setActiveConversationId]);
  const ask = async (prompt = question) => {
    if (!prompt.trim() || !hasWorkspace || !hasSubject) return;
    setLoading(true); setError(null); setQuestion("");
    try {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const conversation = await backendService.ai.createConversation({ workspace_id: workspaceId, subject_id: Number(selectedSubjectId) });
        activeSessionId = conversation.session_id;
        setSessionId(activeSessionId);
        setActiveConversationId(activeSessionId);
      }
      setMessages((current) => [...current, { role: "user", content: prompt }]);
      const response = await backendService.ai.knowledge({ session_id: activeSessionId, workspace_id: workspaceId, subject_id: Number(selectedSubjectId), question: prompt });
      setMessages((current) => [...current, { role: "assistant", content: response.answer, confidence: response.confidence, sources: response.sources }]);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to contact AI service."); }
    finally { setLoading(false); }
  };
  const composerDisabled = loading || !question.trim() || !hasWorkspace || !hasSubject;
  const composerReason = loading ? "A response is already being generated." : !hasWorkspace ? "No backend workspace is available." : !hasSubject ? "Select a subject before asking AI." : !question.trim() ? "Enter a question to enable Ask AI." : "Ready to send.";
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.log("[AI Chat composer]", { workspace: hasWorkspace, subject: hasSubject, document: Boolean(resourceId), scope, session: Boolean(sessionId), input: Boolean(question.trim()), loading, authenticated: "validated by the backend request", disabled: composerDisabled, reason: composerReason });
  }, [composerDisabled, composerReason, hasSubject, hasWorkspace, loading, question, resourceId, scope, sessionId]);
  const startNewStudySession = () => {
    if (messages.length > 0 && !window.confirm("Start New Study Session?\n\nYour current conversation will be closed. Your uploaded resources remain available.")) return;
    setMessages([]);
    setQuestion("");
    setError(null);
    // Changing the flow unmounts this workspace, discarding its local
    // sessionId without calling a backend endpoint.
    beginNewStudySession();
  };
  const clearConversation = async () => {
    await backendService.ai.clearHistory(sessionId);
    setMessages([]);
    setQuestion("");
    setError(null);
    setSessionId(crypto.randomUUID());
  };
  return <div className="w-full bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-purple-100/60 min-h-[650px] shadow-sm flex flex-col gap-4">
    <div className="flex flex-wrap items-start justify-between gap-3 bg-white border border-purple-100 rounded-2xl p-4"><div><button onClick={onBack} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-purple-600"><ArrowLeft className="w-4 h-4" /> Back to Preview</button><h2 className="text-lg font-black text-slate-800 mt-2">AI Study Workspace</h2><p className="text-xs text-slate-500 mt-1">{subjectName} · {resourceType} · Document #{resourceId}</p><p className="text-[10px] text-slate-400 mt-1">Workspace #{activeWorkspaceId} · Subject #{selectedSubjectId}</p></div><div className="flex gap-2"><button onClick={startNewStudySession} className="px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-50 text-purple-700">New Chat</button><button onClick={() => void clearConversation()} className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-600">Clear History</button></div></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[10px] font-black uppercase tracking-wide text-slate-400">AI Context</p><p className="text-xs font-bold text-slate-700">{scope === "subject" ? "Entire Subject" : scope === "resource" ? "Current Resource" : "Selected Resources"} · {resourcesIncluded} resource{resourcesIncluded === 1 ? "" : "s"} included</p><p className="text-[10px] text-slate-400">Workspace {activeWorkspace?.title || activeWorkspaceId} · {subjectName} · {resourceType}</p></div><select value={scope} onChange={(event) => setScope(event.target.value as typeof scope)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"><option value="subject">Entire Subject</option><option value="resource">Current Resource</option><option value="selected">Selected Resources</option></select></div>{scope === "selected" && <div className="mt-3 flex flex-wrap gap-2">{subjectResources.map((resource) => <label key={resource.id} className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[10px] text-slate-600"><input type="checkbox" checked={selectedResources.includes(resource.id)} onChange={() => setSelectedResources((current) => current.includes(resource.id) ? current.filter((id) => id !== resource.id) : [...current, resource.id])} />{resource.title}</label>)}</div>}</div>
    {messages.length === 0 && <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-purple-100 bg-white p-4"><p className="text-xs font-black text-slate-800">How would you like to study?</p><p className="mt-1 text-[10px] text-slate-500">Choose a prompt to edit before sending.</p><div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">{PROMPT_SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" onClick={() => { setQuestion(suggestion); inputRef.current?.focus(); }} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-[10px] font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-200">{suggestion}</button>)}</div></motion.section>}
    {sessionId && <section className="rounded-2xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-black uppercase tracking-wide text-slate-400">AI Study Memory</p><dl className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[10px]"><div><dt className="text-slate-400">Current Subject</dt><dd className="mt-0.5 font-bold text-slate-700 truncate">{subjectName}</dd></div><div><dt className="text-slate-400">Current Resource</dt><dd className="mt-0.5 font-bold text-slate-700 truncate">{resourceType}</dd></div><div><dt className="text-slate-400">Knowledge Scope</dt><dd className="mt-0.5 font-bold text-slate-700">{scope === "subject" ? "Subject" : scope === "resource" ? "Resource" : "Selected"}</dd></div><div><dt className="text-slate-400">Included</dt><dd className="mt-0.5 font-bold text-slate-700">{resourcesIncluded} resources</dd></div><div><dt className="text-slate-400">Last Question</dt><dd className="mt-0.5 font-bold text-slate-700 truncate">{lastQuestion || "—"}</dd></div><div><dt className="text-slate-400">Session Duration</dt><dd className="mt-0.5 font-bold text-slate-700">{sessionDuration}</dd></div></dl></section>}
    <div className="flex-1 min-h-[360px] space-y-3 overflow-y-auto rounded-2xl bg-white border border-slate-200 p-4 scroll-smooth">{messages.length === 0 ? <p className="text-center text-xs text-slate-400 py-12">Start with a suggestion or ask your own question.</p> : messages.map((message, index) => <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-[85%] rounded-2xl bg-purple-600 text-white p-3 text-xs whitespace-pre-wrap" : "mr-auto max-w-[90%] rounded-2xl bg-slate-50 text-slate-700 p-3 text-xs border border-slate-100 shadow-sm"}>{message.role === "assistant" ? <StudyAnswer content={message.content} /> : <p>{message.content}</p>}{message.confidence && <p className="mt-2 text-[10px] font-bold text-purple-600">Confidence: {message.confidence}</p>}{message.sources?.length ? <details className="mt-3 text-[10px]"><summary className="cursor-pointer font-bold">Sources ({message.sources.length})</summary>{message.sources.map((source, sourceIndex) => <p key={`${source.resource_id}-${sourceIndex}`} className="mt-1">{source.document_title} · {source.subject}{source.chapter ? ` · ${source.chapter}` : ""}{source.page_number ? ` · p. ${source.page_number}` : ""} · score {source.score.toFixed(2)}</p>)}</details> : null}</motion.div>)}<AiThinkingPipeline active={loading} /></div>
    {error && <div className="text-xs text-rose-600 text-center">Unable to contact AI service. <button onClick={() => void ask(messages.filter((message) => message.role === "user").at(-1)?.content || "")} className="font-bold underline">Retry</button></div>}
    <form onSubmit={(event) => { event.preventDefault(); void ask(); }} className="flex gap-2"><input ref={inputRef} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setQuestion(""); if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); void ask(); } }} disabled={loading || !hasWorkspace || !hasSubject} placeholder="Ask about this study material…" className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs shadow-sm transition focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100" /><button disabled={composerDisabled} title={composerReason} className="px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-2xl text-xs font-bold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-purple-200">Ask AI</button></form>
  </div>;
}

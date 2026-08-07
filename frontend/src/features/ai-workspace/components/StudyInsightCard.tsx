"use client";

import React, { useState } from "react";
import { useWorkspace } from "../workspaceContext";
import {
  Award, Flame, Clock, BarChart3, Compass, FileText,
  Copy, Check, Volume2, VolumeX, Bookmark, Sparkles,
  Layers, Code2, ChevronRight, Share2, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/ToastContext";

export function StudyInsightCard() {
  const { studyGoal, activeWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"doc" | "topics" | "flashcards">("doc");
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const sampleInsightText = `Article 32 (Heart and Soul of Constitution): Direct right to approach Supreme Court for Fundamental Rights enforcement.

Constitutional Writs Hierarchy:
1. Habeas Corpus: 'To have the body of' (Unlawful Detention).
2. Mandamus: 'We Command' (Public Official Duty Performance).
3. Prohibition: Issued by Higher Court to Lower Court to stop overstepping jurisdiction.
4. Certiorari: 'To be certified' (Quashing illegal lower court orders).
5. Quo-Warranto: 'By what authority?' (Preventing illegal public office usurpation).`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleInsightText);
    setCopied(true);
    toast("Copied study insight to clipboard.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast("Text-to-speech not supported.", "info");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sampleInsightText);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Welcome & Streaks Bar */}
      <div className="bg-gradient-to-br from-purple-500/10 via-[#6D4AFF]/10 to-indigo-500/10 border border-purple-100/60 rounded-3xl p-5 shadow-sm text-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-[9px] font-black tracking-widest bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-md uppercase border border-purple-200/50">
              {activeWorkspace?.examName || "UPSC CSE"} Active Study
            </span>
            <h4 className="text-sm font-black text-slate-900 mt-2">Scholar AI Insight Viewport</h4>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Structured active recall blueprint & color-coded document breakdown
            </p>
          </div>
          <Award className="w-7 h-7 text-purple-600 opacity-90 shrink-0" />
        </div>

        {/* Goal & Streak grid */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-purple-100/60 relative z-10 text-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-white border border-purple-100 p-2 rounded-xl shadow-xs">
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Streak</p>
              <p className="text-xs font-black text-slate-800">{studyGoal.streak} Days</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white border border-purple-100 p-2 rounded-xl shadow-xs">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Study Time</p>
              <p className="text-xs font-black text-slate-800">{studyGoal.studyTimeMinutes} mins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/60 select-none">
        <button
          onClick={() => setActiveTab("doc")}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "doc" ? "bg-white text-purple-700 shadow-xs border border-purple-200" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Document View</span>
        </button>

        <button
          onClick={() => setActiveTab("topics")}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "topics" ? "bg-white text-purple-700 shadow-xs border border-purple-200" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Weak Topics</span>
        </button>

        <button
          onClick={() => setActiveTab("flashcards")}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "flashcards" ? "bg-white text-purple-700 shadow-xs border border-purple-200" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Flashcards</span>
        </button>
      </div>

      {/* Main Centered Document Viewport */}
      <AnimatePresence mode="wait">
        {activeTab === "doc" && (
          <motion.div
            key="doc"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Real-World Centered Document Paper Container */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-5 relative">
              {/* Document Header Controls */}
              <div className="flex items-center justify-between border-b border-slate-150 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="font-black text-slate-800 uppercase text-[11px] tracking-wide">
                    Polity High-Yield Study File
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-500">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
                    title="Copy Document Text"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={toggleSpeak}
                    className={`p-1.5 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer ${
                      isSpeaking ? "text-purple-600 animate-pulse font-black" : ""
                    }`}
                    title="Read Aloud"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setBookmarked(!bookmarked);
                      toast(bookmarked ? "Removed bookmark." : "Saved to bookmarks.", "info");
                    }}
                    className={`p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer ${
                      bookmarked ? "text-amber-500 fill-amber-500" : ""
                    }`}
                    title="Bookmark File"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Color-Coded Syntax Snippet Block */}
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-[11px] space-y-2 relative border border-slate-800 overflow-x-auto shadow-inner">
                <div className="flex items-center justify-between text-[9px] text-slate-400 font-sans border-b border-slate-800 pb-2 mb-2 font-bold">
                  <span className="flex items-center gap-1.5 text-purple-400">
                    <Code2 className="w-3 h-3" /> ARTICLE_32_PROVISIONS.py
                  </span>
                  <span>PRELIMS_HIGH_YIELD</span>
                </div>
                <p><span className="text-purple-400 font-bold">article_32</span> = {"{"}</p>
                <p className="pl-4"><span className="text-emerald-400">&quot;title&quot;</span>: <span className="text-amber-300">&quot;Right to Constitutional Remedies&quot;</span>,</p>
                <p className="pl-4"><span className="text-emerald-400">&quot;alias&quot;</span>: <span className="text-amber-300">&quot;Heart and Soul of Constitution (Dr. Ambedkar)&quot;</span>,</p>
                <p className="pl-4"><span className="text-emerald-400">&quot;supreme_court_jurisdiction&quot;</span>: <span className="text-sky-300">True</span>,</p>
                <p className="pl-4"><span className="text-emerald-400">&quot;writs_count&quot;</span>: <span className="text-rose-400">5</span></p>
                <p>{"}"}</p>
              </div>

              {/* Highlighted Bullet Points with Color Pills */}
              <div className="space-y-3">
                <h6 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  5 Constitutional Writs Breakdown
                </h6>

                <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-start gap-2.5">
                    <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                      Habeas Corpus
                    </span>
                    <p className="leading-relaxed">
                      Literally means <strong>&ldquo;To have the body of&rdquo;</strong>. Issued to produce a detained person before the court. Applicable against both public and private authorities.
                    </p>
                  </li>

                  <li className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start gap-2.5">
                    <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                      Mandamus
                    </span>
                    <p className="leading-relaxed">
                      Literally means <strong>&ldquo;We Command&rdquo;</strong>. Directs a public official to perform a duty they have failed or refused to perform. Cannot be issued against private individuals or the Governor.
                    </p>
                  </li>

                  <li className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-start gap-2.5">
                    <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                      Certiorari
                    </span>
                    <p className="leading-relaxed">
                      Literally means <strong>&ldquo;To be certified&rdquo;</strong>. Issued by a higher court to quash an order passed by a lower tribunal or judicial body exceeding jurisdiction.
                    </p>
                  </li>
                </ul>
              </div>

              {/* Embedded Visual Diagram Card */}
              <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white rounded-2xl p-4 space-y-3 shadow-md border border-purple-900/40">
                <div className="flex items-center justify-between text-[10px] font-bold text-purple-300">
                  <span className="uppercase tracking-widest font-black">Visual Concept Hierarchy</span>
                  <span className="bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">Interactive Diagram</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                  <div className="p-2 bg-purple-900/60 border border-purple-700/50 rounded-xl">
                    <p className="text-purple-300">Article 32</p>
                    <p className="text-slate-300 text-[9px] font-normal">Supreme Court</p>
                  </div>
                  <div className="flex items-center justify-center text-purple-400 font-extrabold text-xs">
                    →
                  </div>
                  <div className="p-2 bg-indigo-900/60 border border-indigo-700/50 rounded-xl">
                    <p className="text-indigo-300">Article 226</p>
                    <p className="text-slate-300 text-[9px] font-normal">High Court</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Weak Topics Tab */}
        {activeTab === "topics" && (
          <motion.div
            key="topics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-purple-100 rounded-3xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Weak Topics Mastery Tracker</h5>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center font-bold text-slate-700 mb-1">
                  <span>Constitutional Writs</span>
                  <span className="text-rose-600 font-black">42% Mastery</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "42%" }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center font-bold text-slate-700 mb-1">
                  <span>Fundamental Rights Exceptions</span>
                  <span className="text-amber-600 font-black">58% Mastery</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "58%" }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center font-bold text-slate-700 mb-1">
                  <span>Directive Principles (DPSP)</span>
                  <span className="text-emerald-600 font-black">85% Mastery</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Flashcards Preview Tab */}
        {activeTab === "flashcards" && (
          <motion.div
            key="flashcards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-purple-100 rounded-3xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Active Recall Flashcards</h5>
              </div>
              <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                Card 1 of 5
              </span>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-150 rounded-2xl text-center space-y-3">
              <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest bg-white px-2.5 py-1 rounded-full border border-purple-100 shadow-2xs">
                Question
              </span>
              <p className="text-xs font-black text-slate-800 leading-relaxed">
                Which Supreme Court case introduced the &apos;Basic Structure Doctrine&apos; limiting Parliament&apos;s amending power?
              </p>
              <button
                onClick={() => toast("Answer: Kesavananda Bharati v. State of Kerala (1973)", "info")}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm shadow-purple-100"
              >
                Reveal Answer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

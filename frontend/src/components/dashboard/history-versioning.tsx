"use client";

import React, { useState } from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { HistorySnapshot } from "@/types/goal.types";
import { History, RotateCcw, Trash2, ArrowRightLeft, Calendar, Sparkles, ShieldCheck, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function HistoryVersioning() {
  const { history, restoreVersion, deleteVersion, activeGoal } = useGoalEngine();
  const [compareVersion1, setCompareVersion1] = useState<number | "current">("current");
  const [compareVersion2, setCompareVersion2] = useState<number | null>(null);

  if (history.length === 0) {
    return (
      <div className="p-8 text-center premium-card premium-card-hover rounded-3xl space-y-3.5">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-extrabold text-slate-800 text-sm">No Version Snapshots logged</h4>
          <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1 leading-normal">
            Calibrate adjustments inside the success wizard to automatically log blueprint revisions.
          </p>
        </div>
      </div>
    );
  }

  // Find goal data matching version selected
  const getGoalData = (ver: number | "current") => {
    if (ver === "current") return activeGoal;
    return history.find((h) => h.version === ver)?.goalData || null;
  };

  const g1 = getGoalData(compareVersion1);
  const g2 = compareVersion2 ? getGoalData(compareVersion2) : null;

  return (
    <div className="p-6 premium-card premium-card-hover rounded-3xl space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider">
            <History className="w-4 h-4 text-indigo-650" /> Success Engine versioning
          </h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
            Audit study blueprints & roll back configurations.
          </p>
        </div>
        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-3 py-1 rounded-full uppercase tracking-wider">
          {history.length} snapshots available
        </span>
      </div>

      {/* Snapshot Logs List */}
      <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
        {history.map((snapshot) => (
          <motion.div
            key={snapshot.version}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4.5 rounded-2xl bg-slate-50/60 border border-slate-150/70 hover:border-slate-200 transition-all flex items-center justify-between gap-3 text-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-indigo-700 bg-indigo-50/80 border border-indigo-100/50 px-2.5 py-0.5 rounded-xl text-[9px] uppercase tracking-wider">
                  Version #{snapshot.version}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(snapshot.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-700 font-semibold mt-2.5">{snapshot.changeDescription}</p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  if (compareVersion1 === "current") {
                    setCompareVersion2(snapshot.version);
                  } else {
                    setCompareVersion2(compareVersion1);
                    setCompareVersion1(snapshot.version);
                  }
                }}
                className="p-2 hover:bg-white text-slate-500 hover:text-indigo-650 rounded-xl border border-transparent hover:border-slate-200 cursor-pointer transition-all shadow-xs"
                title="Select to Compare"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => restoreVersion(snapshot.version)}
                className="p-2 hover:bg-white text-slate-500 hover:text-emerald-600 rounded-xl border border-transparent hover:border-slate-200 cursor-pointer transition-all shadow-xs"
                title="Restore Snapshot"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteVersion(snapshot.version)}
                className="p-2 hover:bg-white text-slate-400 hover:text-red-600 rounded-xl cursor-pointer hover:border-slate-200 transition-all"
                title="Delete Snapshot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparisons Workspace (Side-by-side) */}
      <AnimatePresence>
        {g1 && g2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-indigo-50/40 border border-indigo-100/50 p-4.5 rounded-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-indigo-100/40 pb-2">
              <h5 className="font-black text-indigo-900 text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Side-by-side Configuration Compare
              </h5>
              <button
                onClick={() => {
                  setCompareVersion1("current");
                  setCompareVersion2(null);
                }}
                className="text-[9px] text-gray-400 font-black uppercase tracking-widest hover:text-indigo-650 cursor-pointer"
              >
                Clear comparison
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div className="bg-white p-3.5 rounded-xl border border-indigo-100/60 shadow-xs relative">
                <div className="absolute top-2 right-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider">
                  {compareVersion1 === "current" ? "Active" : `V #${compareVersion1}`}
                </div>
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black block mb-2.5">Target Spec A</span>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Exam</span><span className="font-extrabold">{g1.targetExam}</span></div>
                  <div className="flex justify-between"><span>Prep Hours</span><span className="font-extrabold text-indigo-600">{g1.timeline.dailyStudyHours} Hrs/day</span></div>
                  <div className="flex justify-between"><span>Predictor</span><span className="font-extrabold text-indigo-600">{g1.timeline.successPrediction}%</span></div>
                  <div className="flex justify-between"><span>Burnout Risk</span><span className="font-extrabold text-red-500">{g1.timeline.burnoutRisk}</span></div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-indigo-100/60 shadow-xs relative">
                <div className="absolute top-2 right-2 bg-amber-50 border border-amber-100 text-amber-600 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider">
                  V #{compareVersion2}
                </div>
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black block mb-2.5">Target Spec B</span>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Exam</span><span className="font-extrabold">{g2.targetExam}</span></div>
                  <div className="flex justify-between"><span>Prep Hours</span><span className="font-extrabold text-indigo-600">{g2.timeline.dailyStudyHours} Hrs/day</span></div>
                  <div className="flex justify-between"><span>Predictor</span><span className="font-extrabold text-indigo-600">{g2.timeline.successPrediction}%</span></div>
                  <div className="flex justify-between"><span>Burnout Risk</span><span className="font-extrabold text-red-500">{g2.timeline.burnoutRisk}</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

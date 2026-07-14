"use client";

import React, { useState } from "react";
import { useGoalEngine } from "@/contexts/goal-engine.context";
import { HistorySnapshot } from "@/types/goal.types";
import { History, RotateCcw, Trash2, ArrowRightLeft, Calendar } from "lucide-react";

export function HistoryVersioning() {
  const { history, restoreVersion, deleteVersion, activeGoal } = useGoalEngine();
  const [compareVersion1, setCompareVersion1] = useState<number | "current">("current");
  const [compareVersion2, setCompareVersion2] = useState<number | null>(null);

  if (history.length === 0) {
    return (
      <div className="glass-panel p-6 text-center space-y-2">
        <History className="w-8 h-8 text-gray-300 mx-auto" />
        <h4 className="font-bold text-gray-800 text-sm">No Version Snapshots yet</h4>
        <p className="text-xs text-gray-400">Save goal adjustments to log architectural iterations.</p>
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
    <div className="glass-panel p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
            <History className="w-4.5 h-4.5 text-indigo-600" /> Success Engine versioning
          </h3>
          <p className="text-xs text-gray-400">Audit blueprints & roll back configurations.</p>
        </div>
      </div>

      {/* Snapshot Logs List */}
      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
        {history.map((snapshot) => (
          <div
            key={snapshot.version}
            className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 text-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[10px]">
                  Version #{snapshot.version}
                </span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(snapshot.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 font-medium mt-1.5">{snapshot.changeDescription}</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (compareVersion1 === "current") {
                    setCompareVersion2(snapshot.version);
                  } else {
                    setCompareVersion2(compareVersion1);
                    setCompareVersion1(snapshot.version);
                  }
                }}
                className="p-1.5 hover:bg-white text-gray-500 hover:text-indigo-600 rounded-lg border border-transparent hover:border-gray-200"
                title="Select to Compare"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => restoreVersion(snapshot.version)}
                className="p-1.5 hover:bg-white text-gray-500 hover:text-emerald-600 rounded-lg border border-transparent hover:border-gray-200"
                title="Restore Version"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deleteVersion(snapshot.version)}
                className="p-1.5 hover:bg-white text-gray-400 hover:text-red-600 rounded-lg"
                title="Delete Snapshot"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparisons Workspace */}
      {g1 && g2 && (
        <div className="bg-indigo-50/40 border border-indigo-50 p-4 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
            <h5 className="font-extrabold text-indigo-900 text-xs flex items-center gap-1">
              <ArrowRightLeft className="w-3.5 h-3.5" /> side-by-side comparison
            </h5>
            <button
              onClick={() => {
                setCompareVersion1("current");
                setCompareVersion2(null);
              }}
              className="text-[10px] text-gray-400 font-bold hover:text-gray-600"
            >
              Clear Comparison
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <p className="font-bold text-gray-500 uppercase tracking-wider text-[9px] mb-1">
                Version #{compareVersion1 === "current" ? "Current" : compareVersion1}
              </p>
              <div className="bg-white p-2.5 rounded-xl space-y-1.5 shadow-sm border border-indigo-100/50">
                <p><strong>Exam:</strong> {g1.targetExam}</p>
                <p><strong>Daily Hours:</strong> {g1.timeline.dailyStudyHours} Hrs</p>
                <p><strong>Prediction:</strong> {g1.timeline.successPrediction}%</p>
                <p><strong>Burnout Risk:</strong> {g1.timeline.burnoutRisk}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-gray-500 uppercase tracking-wider text-[9px] mb-1">
                Version #{compareVersion2}
              </p>
              <div className="bg-white p-2.5 rounded-xl space-y-1.5 shadow-sm border border-indigo-100/50">
                <p><strong>Exam:</strong> {g2.targetExam}</p>
                <p><strong>Daily Hours:</strong> {g2.timeline.dailyStudyHours} Hrs</p>
                <p><strong>Prediction:</strong> {g2.timeline.successPrediction}%</p>
                <p><strong>Burnout Risk:</strong> {g2.timeline.burnoutRisk}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

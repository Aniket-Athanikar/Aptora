"use client";

import React from "react";
import { Trophy, Clock, ChevronRight, X, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "../DashboardContext";

export const MockTestsTab: React.FC = () => {
  const {
    activeMockTest,
    mockCurrentQuestion,
    setMockCurrentQuestion,
    mockAnswers,
    mockTimer,
    mockResults,
    mockTestsList,
    startMockTest,
    selectMockAnswer,
    submitMockTest,
    cancelMockTest
  } = useDashboard();

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60).toString().padStart(2, "0");
    const secs = (sec % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="space-y-8 select-none">
      {/* Active test mode */}
      {activeMockTest ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Main Question Area (Left 2 Columns) */}
          <div className="xl:col-span-2 bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-10 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-5">
              <div className="flex items-center gap-2">
                <Trophy className="w-5.5 h-5.5 text-indigo-600 animate-bounce" />
                <h3 className="font-extrabold text-neutral-900 text-sm leading-snug">{activeMockTest.title}</h3>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4 pt-2">
              <span className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                Question {mockCurrentQuestion + 1} of {activeMockTest.questionsCount}
              </span>
              <p className="text-sm font-extrabold text-neutral-800 leading-relaxed md:text-base">
                {activeMockTest.questions[mockCurrentQuestion].q}
              </p>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {activeMockTest.questions[mockCurrentQuestion].options.map((opt, oIdx) => {
                const selected = mockAnswers[mockCurrentQuestion] === opt;
                return (
                  <button
                    key={oIdx}
                    onClick={() => selectMockAnswer(mockCurrentQuestion, opt)}
                    className={cn(
                      "p-4 rounded-xl border text-left cursor-pointer transition-all hover:bg-neutral-50/50 flex items-center gap-3.5",
                      selected 
                        ? "border-indigo-500 bg-indigo-50/20 font-bold" 
                        : "border-neutral-200 bg-white"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0",
                      selected ? "bg-indigo-600 border-indigo-600 text-white" : "border-neutral-300 text-neutral-500"
                    )}>
                      {String.fromCharCode(65 + oIdx)}
                    </div>
                    <span className="text-xs text-neutral-700">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Navigation Row */}
            <div className="flex justify-between items-center pt-5 border-t border-neutral-100">
              <button
                disabled={mockCurrentQuestion === 0}
                onClick={() => setMockCurrentQuestion((c) => c - 1)}
                className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl cursor-pointer text-xs font-bold text-neutral-700 disabled:opacity-40 bg-white"
              >
                Previous
              </button>

              {mockCurrentQuestion < activeMockTest.questionsCount - 1 ? (
                <button
                  onClick={() => setMockCurrentQuestion((c) => c + 1)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer text-xs font-bold transition-all border-0 shadow-md shadow-indigo-600/10"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={submitMockTest}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer text-xs font-bold transition-all border-0 shadow-md shadow-emerald-600/10"
                >
                  Submit Exam
                </button>
              )}
            </div>
          </div>

          {/* Test Overview Panel (Right Column) */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                <span className="text-xs font-extrabold text-neutral-900">Time Remaining</span>
                <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded flex items-center gap-1.5 border border-indigo-100">
                  <Clock className="w-4 h-4" />
                  {formatTimer(mockTimer)}
                </span>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={cancelMockTest}
                  className="px-4 py-2 w-full text-center border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl cursor-pointer bg-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Cancel Exam
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <LayoutGrid className="w-4 h-4 text-neutral-500" />
                <span className="text-xs font-extrabold text-neutral-900">Question Palette</span>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: activeMockTest.questionsCount }).map((_, idx) => {
                  const isCurrent = idx === mockCurrentQuestion;
                  const isAnswered = mockAnswers[idx] !== undefined;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setMockCurrentQuestion(idx)}
                      className={cn(
                        "w-full aspect-square rounded-lg text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors border",
                        isCurrent
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : isAnswered
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-500">
                  <div className="w-3 h-3 bg-emerald-50 border border-emerald-200 rounded" /> Answered
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-500">
                  <div className="w-3 h-3 bg-white border border-neutral-200 rounded" /> Unanswered
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-500">
                  <div className="w-3 h-3 bg-indigo-600 border border-indigo-600 rounded" /> Current
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-[#E9ECF8] pb-4">
            <h2 className="text-2xl font-black text-neutral-900">Practice Mock Tests</h2>
            <p className="text-xs text-neutral-400 font-medium mt-1">Select from available diagnostic mock tests to test your syllabus metrics.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            {/* List of tests (Left 2 Columns) */}
            <div className="xl:col-span-2 space-y-4">
              {mockTestsList.map((test) => (
                <div key={test.id} className="bg-white border border-[#E9ECF8] rounded-[24px] p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:scale-[1.01] transition-transform">
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <Trophy className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-extrabold text-sm text-neutral-800">{test.title}</h4>
                    </div>
                    <div className="flex gap-4 text-[10px] font-bold text-neutral-400">
                      <span>{test.questionsCount} Questions</span>
                      <span>{test.timeLimit} Minutes limit</span>
                    </div>
                  </div>
                  <button
                    onClick={() => startMockTest(test)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm shadow-indigo-600/10 border-0 cursor-pointer flex items-center gap-1 self-stretch md:self-auto text-center justify-center"
                  >
                    <span>Start Test</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Historic Score Card (Right Column) */}
            <div className="xl:col-span-1 bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
              <span className="text-xs font-extrabold text-neutral-900 border-b border-neutral-100 pb-3 block">Previous Scores Log</span>
              
              <div className="space-y-3.5">
                {mockResults.length > 0 ? (
                  mockResults.map((res, idx) => (
                    <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 font-bold text-xs space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-800 truncate pr-2 max-w-[130px] block">{res.testName}</span>
                        <span className="text-indigo-600 font-extrabold text-[11px] shrink-0">{res.score}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-neutral-400 font-semibold pt-1 border-t border-neutral-100/50">
                        <span>Status: Completed</span>
                        <span>{res.date}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] text-neutral-400 font-semibold block">No test scores recorded yet.</span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

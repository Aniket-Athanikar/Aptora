"use client";

import React from "react";
import { FileText, Download, Star, Filter, FolderArchive } from "lucide-react";
import { useDashboard } from "../DashboardContext";

export const NotesTab: React.FC = () => {
  const { toast } = useDashboard();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start select-none">
      {/* Primary Column (Left 2 Columns) */}
      <div className="xl:col-span-2 space-y-8">
        <div className="border-b border-[#E9ECF8] pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-neutral-900">Study Notes & PDF Library</h2>
            <p className="text-xs text-neutral-400 font-medium mt-1">Download official exam outlines, formula cheat sheets, and study guide summaries compiled by AI.</p>
          </div>
          <button className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl cursor-pointer text-xs font-bold text-neutral-700 bg-white flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Quantitative Aptitude Formula Booklet", desc: "Comprehensive quick revision sheet containing basic geometry, algebra, and banking formulas.", size: "4.2 MB", type: "PDF Document" },
            { title: "SSC CGL English Vocabulary Digest", desc: "High-yield vocabulary, idioms, phrases, and grammar shortcut regulations.", size: "2.8 MB", type: "PDF Document" },
            { title: "Indian Polity & Constitution Summary", desc: "Detailed summary of constitution articles, emergency rules, and amendment logs.", size: "5.1 MB", type: "PDF Document" },
            { title: "General Awareness History Cheat Sheet", desc: "Timeline of ancient, medieval, and modern Indian historical movements.", size: "3.5 MB", type: "PDF Document" },
            { title: "AI Practice Mock Question Compilation", desc: "100 high-yield questions automatically compiled by ExamForge AI.", size: "1.9 MB", type: "PDF Document" },
          ].map((doc, idx) => (
            <div key={idx} className="bg-white border border-[#E9ECF8] rounded-[22px] p-5 shadow-sm space-y-4 hover:scale-[1.02] transition-transform flex flex-col justify-between">
              <div className="space-y-2">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-neutral-800 leading-snug">{doc.title}</h4>
                <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed">{doc.desc}</p>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 pt-3 border-t border-neutral-100">
                <span>{doc.size} | {doc.type}</span>
                <button
                  onClick={() => toast(`Downloading ${doc.title}...`, "success")}
                  className="text-indigo-600 hover:text-indigo-800 bg-transparent border-0 cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auxiliary Column (Right 1 Column) */}
      <div className="xl:col-span-1 space-y-8 pt-0 xl:pt-[4.5rem]">
        {/* Important Folders */}
        <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <span className="text-xs font-extrabold text-neutral-900">Collections</span>
          </div>
          
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 bg-[#FAFBFF] border border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl transition-colors cursor-pointer text-left">
              <Star className="w-4 h-4 text-amber-500" />
              <div className="space-y-0.5">
                <span className="block text-xs font-extrabold text-neutral-800">Starred Notes</span>
                <span className="block text-[9px] font-semibold text-neutral-400">3 Items</span>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-[#FAFBFF] border border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl transition-colors cursor-pointer text-left">
              <FolderArchive className="w-4 h-4 text-indigo-500" />
              <div className="space-y-0.5">
                <span className="block text-xs font-extrabold text-neutral-800">Past Year Papers</span>
                <span className="block text-[9px] font-semibold text-neutral-400">12 Items</span>
              </div>
            </button>
          </div>
        </div>

        {/* Upload Widget Placeholder */}
        <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-[24px] p-8 text-center space-y-3 cursor-pointer hover:bg-neutral-100 transition-colors">
          <div className="mx-auto w-10 h-10 bg-white rounded-full flex items-center justify-center border border-neutral-200 shadow-sm mb-4">
            <Download className="w-5 h-5 text-neutral-500 rotate-180" />
          </div>
          <span className="block text-xs font-extrabold text-neutral-800">Upload your own notes</span>
          <span className="block text-[10px] text-neutral-400 font-semibold px-4">Supported formats: PDF, DOCX, TXT up to 10MB</span>
        </div>
      </div>
    </div>
  );
};

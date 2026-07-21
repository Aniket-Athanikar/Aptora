"use client";

import React, { useState } from "react";
import { useWorkspace } from "../workspaceContext";
import { ConversationCard } from "./ConversationCard";
import { Plus, Search, MessageSquare, Pin, BookOpen, Layers, Library } from "lucide-react";

export function ConversationSidebar() {
  const {
    conversations,
    createNewChat,
    searchQuery,
    setSearchQuery,
    uploads
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<"all" | "pinned" | "books">("all");

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === "pinned") return c.pinned;
    if (activeTab === "books") return !!c.bookId;
    return !c.archived;
  });

  const pinnedConvs = filteredConversations.filter((c) => c.pinned);
  const bookConvs = filteredConversations.filter((c) => c.bookId);
  const normalConvs = filteredConversations.filter((c) => !c.pinned && !c.bookId);

  return (
    <div className="w-full md:w-80 shrink-0 bg-white border border-purple-100/60 rounded-3xl p-5 flex flex-col h-[calc(100vh-140px)] md:h-[680px] shadow-sm">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-3 mb-4.5">
        <h3 className="text-sm font-black text-gray-800 tracking-tight">Study Sessions</h3>
        <button
          onClick={() => createNewChat()}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition-all shadow-md shadow-purple-150"
        >
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </button>
      </div>

      {/* Search Input bar */}
      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversation..."
          className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-2xl outline-none focus:border-purple-300 focus:bg-white transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 border-b border-slate-100 pb-3 mb-3 select-none">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${
            activeTab === "all" ? "bg-purple-50 text-purple-700 font-extrabold" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("pinned")}
          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${
            activeTab === "pinned" ? "bg-purple-50 text-purple-700 font-extrabold" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Pinned
        </button>
        <button
          onClick={() => setActiveTab("books")}
          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${
            activeTab === "books" ? "bg-purple-50 text-purple-700 font-extrabold" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Books
        </button>
      </div>

      {/* Scrollable list grouped by session types */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        {/* Pinned Group */}
        {pinnedConvs.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-500 uppercase tracking-widest mb-2 pl-1.5">
              <Pin className="w-3 h-3" />
              <span>Pinned Chats</span>
            </div>
            <div className="space-y-1.5">
              {pinnedConvs.map((conv) => (
                <ConversationCard key={conv.id} conversation={conv} />
              ))}
            </div>
          </div>
        )}

        {/* Book Chats Group */}
        {bookConvs.length > 0 && activeTab !== "pinned" && (
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-500 uppercase tracking-widest mb-2 pl-1.5">
              <BookOpen className="w-3 h-3" />
              <span>Book Conversations</span>
            </div>
            <div className="space-y-1.5">
              {bookConvs.map((conv) => (
                <ConversationCard key={conv.id} conversation={conv} />
              ))}
            </div>
          </div>
        )}

        {/* Normal Recent Chats */}
        {normalConvs.length > 0 && activeTab === "all" && (
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-500 uppercase tracking-widest mb-2 pl-1.5">
              <MessageSquare className="w-3 h-3" />
              <span>Today's Sessions</span>
            </div>
            <div className="space-y-1.5">
              {normalConvs.map((conv) => (
                <ConversationCard key={conv.id} conversation={conv} />
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Library Book List */}
        {uploads.length > 0 && activeTab === "all" && (
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-500 uppercase tracking-widest mb-2 pl-1.5">
              <Library className="w-3 h-3" />
              <span>Recent Uploads</span>
            </div>
            <div className="space-y-2">
              {uploads.map((b) => (
                <div
                  key={b.id}
                  onClick={() => createNewChat(`Study: ${b.name}`, b.id)}
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-purple-50/30 border border-slate-100 hover:border-purple-200 rounded-2xl cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-8 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[8px] font-black shrink-0">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{b.name}</p>
                      <p className="text-[8px] text-slate-400 font-semibold">{b.pages} pages</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                    {b.ocrStatus === "completed" ? "ready" : "syncing"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredConversations.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xs text-gray-400">No sessions match search parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

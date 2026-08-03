"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Pin, Plus, Search, Trash2, Pencil, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { backendService, type KnowledgeConversation } from "@/services/backend.service";
import { useWorkspace } from "../workspaceContext";

function period(date: string | null | undefined) {
  if (!date) return "This Week";
  const age = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  return age <= 0 ? "Today" : age === 1 ? "Yesterday" : "This Week";
}

function clock(date: string | null | undefined) {
  if (!date) return "";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(date));
}

export function ConversationSidebar() {
  const { activeWorkspaceId, beginNewStudySession, activeConversationId, setActiveConversationId } = useWorkspace();
  const [conversations, setConversations] = useState<KnowledgeConversation[]>([]);
  const [query, setQuery] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Inline editing/deleting states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setConversations(await backendService.ai.conversations());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    const workspaceId = Number(activeWorkspaceId);
    if (!Number.isInteger(workspaceId) || workspaceId <= 0) return;
    const conversation = await backendService.ai.createConversation({ workspace_id: workspaceId });
    setConversations((current) => [conversation, ...current]);
    beginNewStudySession();
    setActiveConversationId(conversation.session_id);
  };

  const startRename = (conversation: KnowledgeConversation) => {
    setEditingId(conversation.session_id);
    setEditingTitle(conversation.title);
    setMenuFor(null);
  };

  const saveRename = async (conversation: KnowledgeConversation) => {
    const title = editingTitle.trim();
    if (!title) {
      setEditingId(null);
      return;
    }
    const updated = await backendService.ai.renameConversation(conversation.session_id, title);
    setConversations((items) => items.map((item) => item.session_id === updated.session_id ? updated : item));
    setEditingId(null);
  };

  const remove = async (conversation: KnowledgeConversation) => {
    await backendService.ai.deleteConversation(conversation.session_id);
    setConversations((items) => items.filter((item) => item.session_id !== conversation.session_id));
    if (activeConversationId === conversation.session_id) setActiveConversationId("");
    setDeletingId(null);
  };

  const pin = async (conversation: KnowledgeConversation) => {
    const updated = await backendService.ai.toggleConversationPin(conversation.session_id);
    setConversations((items) => items.map((item) => item.session_id === updated.session_id ? updated : item));
    setMenuFor(null);
  };

  const visible = useMemo(() =>
    conversations.filter((item) =>
      `${item.title} ${item.last_message ?? ""}`.toLowerCase().includes(query.toLowerCase())
    ),
    [conversations, query]
  );

  const groups = ["Pinned", "Today", "Yesterday", "This Week"]
    .map((label) => ({
      label,
      items: visible.filter((item) =>
        label === "Pinned" ? item.pinned : !item.pinned && period(item.last_message_at || item.created_at) === label
      )
    }))
    .filter((group) => group.items.length);

  return (
    <aside className="w-full md:w-80 shrink-0 bg-gradient-to-b from-white to-slate-50/50 border border-purple-100/60 rounded-3xl p-5 flex flex-col h-[calc(100vh-140px)] md:h-[680px] shadow-sm relative overflow-hidden">
      {/* Header with separated action icon button */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
          Study Chats
        </h3>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => void create()}
          className="group flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black pl-2 pr-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-sm shadow-purple-100"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:rotate-90 transition-transform duration-300">
            <Plus className="w-3 h-3 text-white" />
          </div>
          <span>New Chat</span>
        </motion.button>
      </div>

      {/* Search Input */}
      <div className="relative mb-5">
        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chats..."
          className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-50 rounded-2xl outline-none shadow-sm transition-all font-semibold"
        />
      </div>

      {/* Conversation Groups List */}
      <div data-lenis-prevent className="flex-1 overflow-y-auto space-y-5 pr-1.5 scroll-smooth">
        {loading ? (
          <p className="text-center text-xs text-slate-400 py-10">Loading conversations…</p>
        ) : groups.length ? (
          groups.map((group) => (
            <section key={group.label} className="space-y-2">
              <h4 className="px-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                {group.label}
              </h4>
              <div className="space-y-1.5">
                {group.items.map((conversation) => {
                  const isActive = activeConversationId === conversation.session_id;
                  return (
                    <div
                      key={conversation.session_id}
                      onClick={() => setActiveConversationId(conversation.session_id)}
                      className={`group relative rounded-2xl p-3.5 cursor-pointer border transition-all duration-200 ${
                        isActive
                          ? "bg-purple-50/80 border-purple-200/60 text-purple-900 shadow-sm shadow-purple-50/30"
                          : "bg-white border-slate-100 hover:border-purple-200/40 hover:bg-slate-50/40"
                      }`}
                    >
                      {deletingId === conversation.session_id ? (
                        <div className="flex items-center justify-between w-full bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-100 text-[10px]" onClick={(e) => e.stopPropagation()}>
                          <span className="font-bold text-rose-700">Delete chat?</span>
                          <div className="flex gap-3 shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); void remove(conversation); }}
                              className="font-black text-rose-650 hover:text-rose-800 cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                              className="font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 items-start">
                          {/* Animated Icon Wrapper */}
                          <div className={`p-2 rounded-xl transition-all duration-200 shrink-0 ${
                            isActive ? "bg-purple-100 text-purple-700" : "bg-slate-50 text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-500"
                          }`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            {editingId === conversation.session_id ? (
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") void saveRename(conversation);
                                  else if (e.key === "Escape") setEditingId(null);
                                }}
                                onBlur={() => void saveRename(conversation)}
                                autoFocus
                                className="w-full text-xs px-2 py-1 border border-purple-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 bg-white"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <p className="truncate text-xs font-black text-slate-800">
                                    {conversation.title}
                                  </p>
                                  {conversation.pinned && (
                                    <Pin className="w-3 h-3 shrink-0 text-purple-600 fill-purple-600/20" />
                                  )}
                                </div>
                                <p className="truncate mt-1 text-[10px] text-slate-450 font-bold leading-normal">
                                  {conversation.last_message || "No messages yet."}
                                </p>
                              </>
                            )}
                          </div>

                          <time className="text-[9px] font-bold text-slate-400 shrink-0 mt-0.5">
                            {clock(conversation.last_message_at || conversation.created_at)}
                          </time>
                        </div>
                      )}

                      {deletingId !== conversation.session_id && editingId !== conversation.session_id && (
                        <button
                          aria-label="Conversation actions"
                          onClick={(event) => {
                            event.stopPropagation();
                            setMenuFor(menuFor === conversation.session_id ? null : conversation.session_id);
                          }}
                          className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-450 hover:text-slate-700 bg-white border border-slate-100 hover:border-slate-200 rounded-lg shadow-sm transition-all cursor-pointer"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </button>
                      )}

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {menuFor === conversation.session_id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                            className="absolute right-2.5 bottom-9 z-20 w-32 bg-white border border-slate-150 rounded-2xl p-1 shadow-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => startRename(conversation)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 hover:text-purple-600 rounded-xl text-left cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Rename</span>
                            </button>
                            <button
                              onClick={() => void pin(conversation)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 hover:text-purple-600 rounded-xl text-left cursor-pointer"
                            >
                              <Pin className="w-3.5 h-3.5" />
                              <span>{conversation.pinned ? "Unpin" : "Pin"}</span>
                            </button>
                            <button
                              onClick={() => setDeletingId(conversation.session_id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black text-rose-600 hover:bg-rose-50 rounded-xl text-left cursor-pointer border-t border-slate-50 mt-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        ) : (
          <p className="text-center text-xs text-slate-400 py-10">No conversations yet.</p>
        )}
      </div>
    </aside>
  );
}

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

export function ConversationSidebar({ className = "" }: { className?: string }) {
  const { activeWorkspaceId, beginNewStudySession, activeConversationId, setActiveConversationId } = useWorkspace();
  const [conversations, setConversations] = useState<KnowledgeConversation[]>([]);
  const [query, setQuery] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Inline editing/deleting states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const compact = Boolean(className);

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
    <aside className={compact ? `w-full min-w-0 bg-white border-r border-purple-100 p-4 flex flex-col h-full min-h-0 relative overflow-hidden ${className}` : "w-full md:w-80 shrink-0 bg-gradient-to-b from-white via-purple-50/10 to-white border border-purple-200/80 rounded-[28px] p-5 flex flex-col h-[calc(100vh-140px)] md:h-[680px] shadow-sm relative overflow-hidden"}>
      {/* Header with separated action icon button */}
      <div className={`flex items-center justify-between gap-3 ${compact ? "mb-4" : "mb-5"}`}>
        <h3 className={compact ? "text-[11px] font-black text-slate-800 uppercase tracking-widest" : "text-xs font-black text-slate-800 uppercase tracking-widest"}>
          {compact ? "Chat history" : "Study Chats"}
        </h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => void create()}
          className={`group flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white text-[11px] font-black transition-all cursor-pointer shadow-md shadow-purple-200 ${compact ? "px-3 py-2 rounded-2xl" : "px-3.5 py-1.5 rounded-2xl"}`}
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:rotate-90 transition-transform duration-300">
            <Plus className="w-3.5 h-3.5 text-white" />
          </div>
          <span>New Chat</span>
        </motion.button>
      </div>

      {/* Search Input */}
      <div className={`relative ${compact ? "mb-4" : "mb-5"}`}>
        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chats..."
          className={`w-full text-xs pl-10 pr-3.5 py-2.5 border border-purple-200/80 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-extrabold text-slate-900 ${compact ? "bg-purple-50/30 rounded-2xl" : "bg-white rounded-2xl shadow-2xs"}`}
        />
      </div>

      {/* Conversation Groups List */}
      <div data-lenis-prevent className={`flex-1 overflow-y-auto space-y-5 scroll-smooth ${compact ? "pr-1" : "pr-1.5"}`}>
        {loading ? (
          <p className="text-center text-xs text-slate-400 py-10 font-bold">Loading conversations…</p>
        ) : groups.length ? (
          groups.map((group) => (
            <section key={group.label} className="space-y-2">
              <h4 className="px-2.5 text-[9.5px] font-black uppercase tracking-widest text-slate-400">
                {group.label}
              </h4>
              <div className="space-y-2">
                {group.items.map((conversation) => {
                  const isActive = activeConversationId === conversation.session_id;
                  return (
                    <div
                      key={conversation.session_id}
                      onClick={() => setActiveConversationId(conversation.session_id)}
                      className={`group relative cursor-pointer border transition-all duration-200 ${compact ? "rounded-2xl px-3.5 py-3" : "rounded-2xl p-3.5"} ${isActive
                        ? compact ? "bg-white border-purple-500 ring-2 ring-purple-100/90 text-purple-950 shadow-md shadow-purple-200/40" : "bg-white border-purple-500 ring-2 ring-purple-100/90 text-purple-950 shadow-md shadow-purple-200/40"
                        : compact ? "bg-white/80 border-purple-100 text-slate-800 hover:border-purple-300 hover:bg-purple-50/50" : "bg-white border-purple-100/80 hover:border-purple-300 hover:bg-purple-50/40 text-slate-800"
                        }`}
                    >
                      {isActive && (
                        <span className="w-1.5 h-6 rounded-full bg-purple-600 absolute left-1 top-1/2 -translate-y-1/2" />
                      )}

                      {deletingId === conversation.session_id ? (
                        <div className="flex items-center justify-between w-full bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200 text-[10px]" onClick={(e) => e.stopPropagation()}>
                          <span className="font-bold text-rose-800">Delete chat?</span>
                          <div className="flex gap-3 shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); void remove(conversation); }}
                              className="font-black text-rose-700 hover:text-rose-900 cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                              className="font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 items-start">
                          {/* Animated Icon Wrapper */}
                          <div className={`p-2 rounded-xl transition-all duration-200 shrink-0 ${isActive ? "bg-purple-100/90 text-purple-950 border border-purple-200/80" : "bg-purple-50/60 text-purple-600 group-hover:bg-purple-100/80 group-hover:text-purple-700"
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
                                className="w-full text-xs px-2.5 py-1 border border-purple-500 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 bg-white font-extrabold text-slate-900"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <p className="truncate text-xs font-black text-slate-900">
                                    {conversation.title}
                                  </p>
                                  {conversation.pinned && (
                                    <Pin className="w-3 h-3 shrink-0 text-purple-600 fill-purple-600/20" />
                                  )}
                                </div>
                                <p className="truncate mt-1 text-[10px] text-slate-500 font-bold leading-normal">
                                  {conversation.last_message || "No messages yet."}
                                </p>
                              </>
                            )}
                          </div>

                          <time className="text-[9.5px] font-bold text-slate-400 shrink-0 mt-0.5">
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
                          className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-purple-900 bg-white border border-purple-200/80 hover:border-purple-300 rounded-xl shadow-2xs transition-all cursor-pointer"
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
                            className="absolute right-2.5 bottom-9 z-20 w-32 bg-white border border-purple-200 rounded-2xl p-1 shadow-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => startRename(conversation)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-800 hover:bg-purple-50 hover:text-purple-900 rounded-xl text-left cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-purple-600" />
                              <span>Rename</span>
                            </button>
                            <button
                              onClick={() => void pin(conversation)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-800 hover:bg-purple-50 hover:text-purple-900 rounded-xl text-left cursor-pointer"
                            >
                              <Pin className="w-3.5 h-3.5 text-purple-600" />
                              <span>{conversation.pinned ? "Unpin" : "Pin"}</span>
                            </button>
                            <button
                              onClick={() => setDeletingId(conversation.session_id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black text-rose-600 hover:bg-rose-50 rounded-xl text-left cursor-pointer border-t border-purple-100 mt-1"
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
          <p className="text-center text-xs text-slate-400 py-10 font-bold">No conversations yet.</p>
        )}
      </div>
    </aside>
  );
}
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { MoreVertical, Pin, Plus, Search, Trash2, Pencil, MessageSquare, AlertCircle, RefreshCw, FileText, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { backendService, type KnowledgeConversation } from "@/services/backend.service";
import { useWorkspace } from "../workspaceContext";
import { useToast } from "@/lib/ToastContext";
import { useOnClickOutside } from "@/hooks/common";
import { ExportModal } from "./ExportModal";

function period(date: string | null | undefined) {
  if (!date) return "Older";
  const now = new Date();
  const msgDate = new Date(date);
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  if (msgDate >= today) return "Today";
  if (msgDate >= yesterday) return "Yesterday";
  if (msgDate >= sevenDaysAgo) return "Previous 7 Days";
  return "Older";
}

function clock(date: string | null | undefined) {
  if (!date) return "";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(date));
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse py-2">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-start gap-3 p-3 border border-slate-100/80 rounded-2xl bg-white/40">
          <div className="w-8 h-8 rounded-xl bg-slate-200/80 shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-3 bg-slate-200/80 rounded w-3/4" />
            <div className="h-2 bg-slate-200/60 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConversationSidebar({ className = "" }: { className?: string }) {
  const { activeWorkspaceId, beginNewStudySession, activeConversationId, setActiveConversationId } = useWorkspace();
  const { toast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<KnowledgeConversation[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Inline editing/deleting states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exportConversation, setExportConversation] = useState<KnowledgeConversation | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const compact = Boolean(className);

  useOnClickOutside(menuRef, () => setMenuFor(null));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuFor(null);
        setDeletingId(null);
      }
    };
    if (menuFor || deletingId) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuFor, deletingId]);

  // 300ms Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  const load = async (reset = false) => {
    const nextOffset = reset ? 0 : offset;
    if (reset) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const limit = 15;
      const data = await backendService.ai.conversations({
        q: debouncedQuery,
        limit,
        offset: nextOffset
      });

      setConversations((current) => {
        const base = reset ? [] : current;
        const merged = [...base];
        data.forEach((item) => {
          if (!merged.some((existing) => existing.session_id === item.session_id)) {
            merged.push(item);
          }
        });
        return merged;
      });

      setOffset(nextOffset + data.length);
      setHasMore(data.length === limit);
    } catch (err: any) {
      setError(err?.message || "Failed to load chat history.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    void load(true);
  }, [debouncedQuery, activeWorkspaceId]);

  const create = async () => {
    const workspaceId = Number(activeWorkspaceId);
    if (!Number.isInteger(workspaceId) || workspaceId <= 0) return;
    try {
      const conversation = await backendService.ai.createConversation({ workspace_id: workspaceId });
      setConversations((current) => [conversation, ...current]);
      beginNewStudySession();
      setActiveConversationId(conversation.session_id);
    } catch (err: any) {
      setError("Failed to create a new session.");
    }
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

    if (title.length > 255) {
      toast("Title must be 255 characters or less.", "error");
      setEditingId(null);
      return;
    }

    const previousConversations = [...conversations];

    // Optimistic UI update
    setConversations((items) =>
      items.map((item) =>
        item.session_id === conversation.session_id ? { ...item, title } : item
      )
    );
    setEditingId(null);

    try {
      const updated = await backendService.ai.renameConversation(conversation.session_id, title);
      setConversations((items) =>
        items.map((item) => (item.session_id === updated.session_id ? updated : item))
      );
      toast("Conversation renamed successfully.", "success");
    } catch (err) {
      console.error("Failed to rename conversation:", err);
      toast("Could not rename conversation. Rolling back...", "error");
      setConversations(previousConversations);
    }
  };

  const remove = async (conversation: KnowledgeConversation) => {
    const previousConversations = [...conversations];
    const wasActive = activeConversationId === conversation.session_id;

    // Optimistic UI update
    setConversations((items) => items.filter((item) => item.session_id !== conversation.session_id));
    if (wasActive) {
      setActiveConversationId("");
    }

    try {
      await backendService.ai.deleteConversation(conversation.session_id);
      toast("Conversation deleted successfully.", "success");
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      toast("Could not delete conversation. Rolling back...", "error");
      setConversations(previousConversations);
      if (wasActive) {
        setActiveConversationId(conversation.session_id);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const pin = async (conversation: KnowledgeConversation) => {
    const previousConversations = [...conversations];
    const newPinned = !conversation.pinned;

    // Optimistic UI update
    setConversations((items) =>
      items.map((item) =>
        item.session_id === conversation.session_id ? { ...item, pinned: newPinned } : item
      )
    );
    setMenuFor(null);

    try {
      const updated = await backendService.ai.toggleConversationPin(conversation.session_id);
      setConversations((items) =>
        items.map((item) => (item.session_id === updated.session_id ? updated : item))
      );
      toast(`Conversation ${newPinned ? "pinned" : "unpinned"} successfully.`, "success");
    } catch (err) {
      console.error("Failed to pin conversation:", err);
      toast(`Could not ${newPinned ? "pin" : "unpin"} conversation. Rolling back...`, "error");
      setConversations(previousConversations);
    }
  };

  const downloadPdf = (conversation: KnowledgeConversation) => {
    setExportConversation(conversation);
    setMenuFor(null);
  };

  const saveAsAiNote = async (conversation: KnowledgeConversation) => {
    setMenuFor(null);
    setSavingNoteId(conversation.session_id);
    toast("Extracting key concepts to create study notes...", "info");
    try {
      await backendService.ai.saveAsNote(conversation.session_id);
      toast("Successfully converted conversation to a structured study note.", "success");
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "Failed to save conversation as note.", "error");
    } finally {
      setSavingNoteId(null);
    }
  };

  const groups = useMemo(() => {
    return ["Pinned", "Today", "Yesterday", "Previous 7 Days", "Older"]
      .map((label) => ({
        label,
        items: conversations.filter((item) =>
          label === "Pinned" ? item.pinned : !item.pinned && period(item.last_message_at || item.created_at) === label
        )
      }))
      .filter((group) => group.items.length);
  }, [conversations]);

  return (
    <aside className={compact ? `w-full min-w-0 bg-white border-r border-slate-100 p-4 flex flex-col h-full min-h-0 relative overflow-hidden ${className}` : "w-full md:w-80 shrink-0 bg-gradient-to-b from-white via-slate-50/10 to-white border border-slate-200/80 rounded-[28px] p-5 flex flex-col h-[calc(100vh-140px)] md:h-[680px] shadow-sm relative overflow-hidden"}>
      {/* Header */}
      <div className={`flex items-center justify-between gap-3 ${compact ? "mb-4" : "mb-5"}`}>
        <h3 className={compact ? "text-[11px] font-black text-slate-800 uppercase tracking-widest" : "text-xs font-black text-slate-800 uppercase tracking-widest"}>
          {compact ? "Chat history" : "Study Chats"}
        </h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => void create()}
          className={`group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[11px] font-black transition-all cursor-pointer shadow-md shadow-emerald-600/10 ${compact ? "px-3 py-2 rounded-2xl" : "px-3.5 py-1.5 rounded-2xl"}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </motion.button>
      </div>

      {/* Search Input */}
      <div className={`relative ${compact ? "mb-4" : "mb-5"}`}>
        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title or text..."
          className={`w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-extrabold text-slate-900 ${compact ? "bg-slate-50/50 rounded-2xl" : "bg-white rounded-2xl shadow-2xs"}`}
        />
      </div>

      {/* Main List Box */}
      <div data-lenis-prevent className={`flex-1 overflow-y-auto space-y-5 scroll-smooth ${compact ? "pr-1" : "pr-1.5"}`}>
        {error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-xs text-slate-500 font-bold">{error}</p>
            <button
              onClick={() => void load(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-black rounded-xl cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        ) : loading ? (
          <LoadingSkeleton />
        ) : groups.length ? (
          <div className="space-y-5">
            {groups.map((group) => (
              <section key={group.label} className="space-y-2">
                <h4 className="px-2.5 text-[9.5px] font-black uppercase tracking-widest text-slate-450">
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
                          ? "bg-gradient-to-b from-emerald-50/30 to-white border-emerald-500 ring-2 ring-emerald-100/80 text-slate-900 shadow-sm"
                          : "bg-white border-slate-100 text-slate-800 hover:border-emerald-300 hover:bg-slate-50/50"
                          }`}
                      >
                        {isActive && (
                          <span className="w-1.5 h-6 rounded-full bg-emerald-600 absolute left-1 top-1/2 -translate-y-1/2" />
                        )}

                        <div className="flex gap-3 items-start">
                          <div className={`p-2 rounded-xl transition-all duration-200 shrink-0 ${isActive ? "bg-emerald-600 text-white border border-emerald-500 shadow-sm" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
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
                                className="w-full text-xs px-2.5 py-1 border border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-100 bg-white font-extrabold text-slate-900"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <p className="truncate text-xs font-black text-slate-900">
                                    {conversation.title}
                                  </p>
                                  {conversation.pinned && (
                                    <Pin className="w-3 h-3 shrink-0 text-amber-500 fill-amber-500/20" />
                                  )}
                                </div>
                                <p className="truncate mt-1 text-[10px] text-slate-500 font-bold leading-normal">
                                  {conversation.message_count ? `${conversation.message_count} messages` : conversation.last_message || "No messages yet."}
                                </p>
                              </>
                            )}
                          </div>

                          <time className="text-[9.5px] font-bold text-slate-450 shrink-0 mt-0.5">
                            {clock(conversation.last_message_at || conversation.created_at)}
                          </time>
                        </div>

                        {editingId !== conversation.session_id && (
                          <button
                            aria-label="Conversation actions"
                            onClick={(event) => {
                              event.stopPropagation();
                              setMenuFor(menuFor === conversation.session_id ? null : conversation.session_id);
                            }}
                            className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl shadow-2xs transition-all cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Action Dropdown Menu */}
                        <AnimatePresence>
                          {menuFor === conversation.session_id && (
                            <motion.div
                              ref={menuRef}
                              initial={{ opacity: 0, scale: 0.95, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 5 }}
                              className="absolute right-2.5 bottom-9 z-20 w-36 bg-white border border-slate-200 rounded-2xl p-1 shadow-lg overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => startRename(conversation)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-800 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-left cursor-pointer transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Rename</span>
                              </button>
                              <button
                                onClick={() => downloadPdf(conversation)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-800 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-left cursor-pointer transition-colors"
                              >
                                <Download className="w-3.5 h-3.5 text-blue-650" />
                                <span>Download PDF</span>
                              </button>
                              <button
                                onClick={() => saveAsAiNote(conversation)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-800 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-left cursor-pointer transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5 text-amber-600" />
                                <span>Save as AI Note</span>
                              </button>
                              <button
                                onClick={() => void pin(conversation)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-800 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-left cursor-pointer transition-colors"
                              >
                                <Pin className="w-3.5 h-3.5 text-emerald-655" />
                                <span>{conversation.pinned ? "Unpin" : "Pin"}</span>
                              </button>
                              <button
                                onClick={() => { setDeletingId(conversation.session_id); setMenuFor(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black text-rose-600 hover:bg-rose-50 rounded-xl text-left cursor-pointer border-t border-slate-100 mt-1 transition-colors"
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
            ))}

            {/* Load More Pagination */}
            {hasMore && (
              <div className="pt-2 text-center">
                <button
                  disabled={loadingMore}
                  onClick={() => void load(false)}
                  className="px-4 py-2 border border-slate-200 hover:border-emerald-300 active:bg-slate-50 text-[10.5px] font-black text-slate-700 hover:text-slate-900 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? "Loading more..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-xs text-slate-450 py-10 font-bold">No conversations yet.</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (() => {
          const convToDelete = conversations.find(c => c.session_id === deletingId);
          if (!convToDelete) return null;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setDeletingId(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900">Delete Conversation</h4>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                      Are you sure you want to delete <span className="font-extrabold text-slate-800">&ldquo;{convToDelete.title}&rdquo;</span>? This action cannot be undone.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setDeletingId(null)}
                    className="px-3.5 py-2 border border-slate-200 hover:border-slate-350 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl transition-all cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void remove(convToDelete)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-xs font-black text-white rounded-xl shadow-md shadow-rose-600/10 transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Export Conversation Modal */}
      <ExportModal
        isOpen={Boolean(exportConversation)}
        onClose={() => setExportConversation(null)}
        conversationId={exportConversation?.session_id || ""}
        conversationTitle={exportConversation?.title || ""}
        messageCount={exportConversation?.message_count || 0}
      />
    </aside>
  );
}
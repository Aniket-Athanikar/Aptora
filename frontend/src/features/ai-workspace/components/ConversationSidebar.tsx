"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Pin, Plus, Search, Trash2, Pencil, MessageSquare } from "lucide-react";
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

  const load = async () => {
    setLoading(true);
    try { setConversations(await backendService.ai.conversations()); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const create = async () => {
    const workspaceId = Number(activeWorkspaceId);
    if (!Number.isInteger(workspaceId) || workspaceId <= 0) return;
    const conversation = await backendService.ai.createConversation({ workspace_id: workspaceId });
    setConversations((current) => [conversation, ...current]);
    beginNewStudySession();
    setActiveConversationId(conversation.session_id);
  };
  const rename = async (conversation: KnowledgeConversation) => {
    const title = window.prompt("Rename conversation", conversation.title)?.trim();
    if (!title) return;
    const updated = await backendService.ai.renameConversation(conversation.session_id, title);
    setConversations((items) => items.map((item) => item.session_id === updated.session_id ? updated : item)); setMenuFor(null);
  };
  const remove = async (conversation: KnowledgeConversation) => {
    if (!window.confirm(`Delete “${conversation.title}”?`)) return;
    await backendService.ai.deleteConversation(conversation.session_id);
    setConversations((items) => items.filter((item) => item.session_id !== conversation.session_id));
    if (activeConversationId === conversation.session_id) setActiveConversationId("");
  };
  const pin = async (conversation: KnowledgeConversation) => {
    const updated = await backendService.ai.toggleConversationPin(conversation.session_id);
    setConversations((items) => items.map((item) => item.session_id === updated.session_id ? updated : item)); setMenuFor(null);
  };
  const visible = useMemo(() => conversations.filter((item) => `${item.title} ${item.last_message ?? ""}`.toLowerCase().includes(query.toLowerCase())), [conversations, query]);
  const groups = ["Pinned", "Today", "Yesterday", "This Week"].map((label) => ({ label, items: visible.filter((item) => label === "Pinned" ? item.pinned : !item.pinned && period(item.last_message_at || item.created_at) === label) })).filter((group) => group.items.length);

  return <aside className="w-full md:w-80 shrink-0 bg-white border border-purple-100/60 rounded-3xl p-4 flex flex-col h-[calc(100vh-140px)] md:h-[680px] shadow-sm">
    <div className="flex items-center justify-between gap-3 mb-4"><h3 className="text-sm font-black text-slate-800">Study Chats</h3><button onClick={() => void create()} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-full"><Plus className="w-3.5 h-3.5" />New Chat</button></div>
    <label className="relative mb-4"><Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search chats" className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-150 rounded-xl outline-none focus:border-purple-300"/></label>
    <div className="flex-1 overflow-y-auto space-y-5 pr-1">{loading ? <p className="text-center text-xs text-slate-400 py-10">Loading conversations…</p> : groups.length ? groups.map((group) => <section key={group.label}><h4 className="px-2 mb-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{group.label}</h4>{group.items.map((conversation) => <div key={conversation.session_id} className={`group relative rounded-xl px-3 py-2.5 cursor-pointer ${activeConversationId === conversation.session_id ? "bg-purple-100 text-purple-900" : "hover:bg-slate-50"}`} onClick={() => setActiveConversationId(conversation.session_id)}><div className="flex gap-2"><MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-purple-500"/><div className="min-w-0 flex-1"><div className="flex items-center gap-1"><p className="truncate text-[11px] font-bold">{conversation.title}</p>{conversation.pinned && <Pin className="w-3 h-3 shrink-0 text-purple-500"/>}</div><p className="truncate mt-0.5 text-[9px] text-slate-500">{conversation.last_message || "No messages yet."}</p></div><time className="text-[8px] text-slate-400 shrink-0">{clock(conversation.last_message_at || conversation.created_at)}</time></div><button aria-label="Conversation actions" onClick={(event) => { event.stopPropagation(); setMenuFor(menuFor === conversation.session_id ? null : conversation.session_id); }} className="absolute right-2 bottom-1.5 opacity-0 group-hover:opacity-100 p-1 text-slate-400"><MoreHorizontal className="w-3.5 h-3.5"/></button>{menuFor === conversation.session_id && <div className="absolute right-1 bottom-7 z-10 w-32 bg-white border border-slate-200 rounded-lg p-1 shadow-lg"><button onClick={() => void rename(conversation)} className="menu-item"><Pencil/>Rename</button><button onClick={() => void pin(conversation)} className="menu-item"><Pin/>{conversation.pinned ? "Unpin" : "Pin"}</button><button onClick={() => void remove(conversation)} className="menu-item text-rose-600"><Trash2/>Delete</button></div>}</div>)}</section>) : <p className="text-center text-xs text-slate-400 py-10">No conversations yet.</p>}</div>
  </aside>;
}

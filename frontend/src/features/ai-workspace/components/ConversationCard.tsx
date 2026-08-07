"use client";

import React, { useState } from "react";
import { Conversation } from "../types";
import { useWorkspace } from "../workspaceContext";
import {
  Pin,
  Star,
  Archive,
  Edit2,
  Trash2,
  Check,
  X,
  MessageSquare,
  BookOpen,
  Download,
  Tag,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/ToastContext";

interface ConversationCardProps {
  conversation: Conversation;
}

const COLORS = [
  { name: "purple", class: "bg-purple-500", border: "border-purple-200", text: "text-purple-700" },
  { name: "blue", class: "bg-blue-500", border: "border-blue-200", text: "text-blue-700" },
  { name: "pink", class: "bg-pink-500", border: "border-pink-200", text: "text-pink-700" },
  { name: "emerald", class: "bg-emerald-500", border: "border-emerald-200", text: "text-emerald-700" },
  { name: "amber", class: "bg-amber-500", border: "border-amber-200", text: "text-amber-700" },
];

function formatTime(isoStr?: string) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const { toast } = useToast();
  const {
    activeConversationId,
    setActiveConversationId,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    toggleFavoriteConversation,
    toggleArchiveConversation,
    setConversationColor,
  } = useWorkspace();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isActive = activeConversationId === conversation.id;
  const activeColor = COLORS.find((c) => c.name === conversation.color);

  const handleSaveRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameConversation(conversation.id, editTitle.trim());
      setIsEditing(false);
      toast("Session renamed.", "success");
    }
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(conversation.id);
    setShowDeleteConfirm(false);
    toast("Study session deleted.", "info");
  };

  const exportMarkdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!conversation.messages || conversation.messages.length === 0) {
      toast("No message history to export.", "info");
      return;
    }
    const md = conversation.messages
      .map((m) => `### ${m.sender === "user" ? "User Prompt" : "ExamForge AI Response"}\n\n${m.text}\n`)
      .join("\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conversation.title.replace(/[^a-z0-9]/gi, "_")}.md`;
    a.click();
    toast("Session exported to Markdown file.", "success");
  };

  return (
    <motion.div
      layout
      onClick={() => setActiveConversationId(conversation.id)}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => {
        setShowOptions(false);
        setShowDeleteConfirm(false);
      }}
      className={`group w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
        isActive
          ? `bg-white ${activeColor?.border || "border-purple-300"} shadow-md shadow-purple-100/40 ring-2 ring-purple-100/60`
          : "bg-white/60 hover:bg-white border-slate-200/80 hover:border-purple-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3 justify-between">
        {/* Icon & Title */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="mt-0.5 shrink-0">
            {conversation.color ? (
              <div className={`w-4 h-4 rounded-full ${activeColor?.class || "bg-purple-500"} shadow-sm border border-white`} />
            ) : conversation.bookId ? (
              <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
            ) : (
              <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs font-bold px-2.5 py-1 bg-white border border-purple-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-100"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveRename(e as any);
                    if (e.key === "Escape") handleCancelRename(e as any);
                  }}
                />
                <button
                  onClick={handleSaveRename}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                  title="Save"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelRename}
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <h4 className="text-xs font-black text-slate-800 truncate leading-snug group-hover:text-purple-700 transition-colors">
                  {conversation.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400 font-extrabold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-350" />
                    {formatTime(conversation.lastMessageAt)}
                  </span>
                  {conversation.messages && conversation.messages.length > 0 && (
                    <span>· {conversation.messages.length} msg{conversation.messages.length === 1 ? "" : "s"}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {conversation.pinned && !isEditing && (
          <Pin className="w-3.5 h-3.5 text-purple-600 fill-current shrink-0 ml-1.5" />
        )}
      </div>

      {/* Delete Confirmation Overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-2.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between text-[10px]"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-bold text-rose-700">Delete this session?</span>
            <div className="flex gap-1.5">
              <button
                onClick={handleDelete}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-black transition-colors cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Popover Toolbar on Hover/Active */}
      {(showOptions || isActive) && !isEditing && !showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-slate-400"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Color tag selector */}
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setConversationColor(conversation.id, c.name)}
                className={`w-3.5 h-3.5 rounded-full hover:scale-125 transition-transform cursor-pointer ${c.class} ${
                  conversation.color === c.name ? "ring-2 ring-purple-600 ring-offset-1" : ""
                }`}
                title={`Tag ${c.name}`}
              />
            ))}
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => togglePinConversation(conversation.id)}
              className={`p-1 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer ${
                conversation.pinned ? "text-purple-600 bg-purple-50" : ""
              }`}
              title={conversation.pinned ? "Unpin session" : "Pin session"}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleFavoriteConversation(conversation.id)}
              className={`p-1 hover:text-amber-500 hover:bg-slate-100 rounded-lg transition-all cursor-pointer ${
                conversation.favorite ? "text-amber-500 fill-amber-500" : ""
              }`}
              title="Favorite"
            >
              <Star className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleArchiveConversation(conversation.id)}
              className={`p-1 hover:text-blue-500 hover:bg-slate-100 rounded-lg transition-all cursor-pointer ${
                conversation.archived ? "text-blue-500 bg-blue-50" : ""
              }`}
              title="Archive"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={exportMarkdown}
              className="p-1 hover:text-purple-650 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              title="Export Markdown"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:text-indigo-650 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              title="Rename"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

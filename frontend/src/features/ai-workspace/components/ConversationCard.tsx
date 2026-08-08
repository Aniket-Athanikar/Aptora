"use client";

import React, { useState } from "react";
import { Conversation } from "../types";
import { useWorkspace } from "../workspaceContext";
import { Pin, Star, Archive, Edit2, Trash2, Check, X, MessageSquare, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConversationCardProps {
  conversation: Conversation;
}

const COLORS = [
  { name: "purple", class: "bg-purple-500", border: "border-purple-200", text: "text-purple-700" },
  { name: "blue", class: "bg-blue-500", border: "border-blue-200", text: "text-blue-700" },
  { name: "pink", class: "bg-pink-500", border: "border-pink-200", text: "text-pink-700" },
  { name: "emerald", class: "bg-emerald-500", border: "border-emerald-200", text: "text-emerald-700" },
  { name: "amber", class: "bg-amber-500", border: "border-amber-200", text: "text-amber-700" }
];

export function ConversationCard({ conversation }: ConversationCardProps) {
  const {
    activeConversationId,
    setActiveConversationId,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    toggleFavoriteConversation,
    toggleArchiveConversation,
    setConversationColor
  } = useWorkspace();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isActive = activeConversationId === conversation.id;
  const activeColor = COLORS.find(c => c.name === conversation.color);

  const handleSaveRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameConversation(conversation.id, editTitle.trim());
      setIsEditing(false);
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
      className={`group w-full text-left p-4 rounded-2xl border transition-all cursor-pointer relative ${
        isActive
          ? `bg-white ${activeColor?.border || "border-purple-200"} shadow-md shadow-purple-100/30 text-slate-800 font-bold`
          : "bg-transparent border-transparent hover:bg-slate-50 text-slate-700"
      }`}
    >
      <div className="flex items-start gap-3 justify-between">
        {/* Left side: Icon/Color & Title */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="mt-0.5 shrink-0">
            {conversation.color ? (
              <div className={`w-4 h-4 rounded-full ${activeColor?.class || "bg-purple-500"} shadow-sm border border-white`} />
            ) : conversation.bookId ? (
              <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
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
                  className="w-full text-xs font-semibold px-2 py-1 bg-white border border-purple-250 rounded-xl outline-none focus:ring-1 focus:ring-purple-200"
                  autoFocus
                />
                <button
                  onClick={handleSaveRename}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelRename}
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-xs font-bold truncate leading-snug">
                {conversation.title}
              </p>
            )}
          </div>
        </div>

        {conversation.pinned && !isEditing && (
          <Pin className="w-3.5 h-3.5 text-purple-600 fill-current shrink-0 ml-1.5" />
        )}
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-2 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between text-[10px]"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-bold text-rose-700">Delete this session?</span>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition-colors cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-bold transition-colors cursor-pointer"
              >
                No
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action panel popover on hover */}
      {(showOptions || isActive) && !isEditing && !showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-slate-400"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Color palette pickers */}
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setConversationColor(conversation.id, c.name)}
                className={`w-3.5 h-3.5 rounded-full hover:scale-125 transition-transform cursor-pointer ${c.class} ${
                  conversation.color === c.name ? "ring-2 ring-purple-600 ring-offset-1" : ""
                }`}
                title={`Highlight ${c.name}`}
              />
            ))}
          </div>

          {/* Quick buttons */}
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

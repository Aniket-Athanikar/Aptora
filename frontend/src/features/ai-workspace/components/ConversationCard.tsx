"use client";

import React, { useState } from "react";
import { Conversation } from "../types";
import { useWorkspace } from "../workspaceContext";
import { Pin, Star, Archive, Edit2, Trash2, Check, X, MessageSquare, BookOpen } from "lucide-react";

interface ConversationCardProps {
  conversation: Conversation;
}

const COLORS = [
  { name: "purple", class: "bg-purple-500" },
  { name: "blue", class: "bg-blue-500" },
  { name: "pink", class: "bg-pink-500" },
  { name: "emerald", class: "bg-emerald-500" },
  { name: "amber", class: "bg-amber-500" }
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

  const isActive = activeConversationId === conversation.id;

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

  return (
    <div
      onClick={() => setActiveConversationId(conversation.id)}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
      className={`group w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
        isActive
          ? "bg-purple-50/50 border-purple-200 text-purple-950 font-bold"
          : "bg-transparent border-transparent hover:bg-slate-50/70 text-slate-700"
      }`}
    >
      <div className="flex items-start gap-3 justify-between">
        {/* Left side: Icon or Custom Color Circle + Title */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Active Highlight Color or generic Message Icon */}
          <div className="mt-0.5 shrink-0">
            {conversation.color ? (
              <div className={`w-3.5 h-3.5 rounded-full ${COLORS.find(c => c.name === conversation.color)?.class || "bg-purple-500"}`} />
            ) : conversation.bookId ? (
              <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            ) : (
              <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </div>

          {/* Title Text or input field */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs font-semibold px-2 py-1 bg-white border border-purple-200 rounded-lg outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveRename}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={handleCancelRename}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <p className="text-xs font-bold truncate leading-snug">
                {conversation.title}
              </p>
            )}
          </div>
        </div>

        {/* Pin indicator status */}
        {conversation.pinned && !isEditing && (
          <Pin className="w-3 h-3 text-purple-500 fill-current shrink-0 ml-1.5" />
        )}
      </div>

      {/* Action panel popup on hover */}
      {(showOptions || isActive) && !isEditing && (
        <div
          className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/60 text-slate-400"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Color palette pickers */}
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setConversationColor(conversation.id, c.name)}
                className={`w-3 h-3 rounded-full hover:scale-125 transition-transform ${c.class} ${
                  conversation.color === c.name ? "ring-2 ring-purple-600 ring-offset-1" : ""
                }`}
                title={`Highlight ${c.name}`}
              />
            ))}
          </div>

          {/* Quick buttons Pin, Star, Archive, Rename, Delete */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => togglePinConversation(conversation.id)}
              className={`p-1 hover:text-purple-600 rounded transition-colors ${
                conversation.pinned ? "text-purple-600" : ""
              }`}
              title={conversation.pinned ? "Unpin session" : "Pin session"}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleFavoriteConversation(conversation.id)}
              className={`p-1 hover:text-amber-500 rounded transition-colors ${
                conversation.favorite ? "text-amber-500 fill-amber-500" : ""
              }`}
              title="Favorite"
            >
              <Star className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleArchiveConversation(conversation.id)}
              className={`p-1 hover:text-blue-500 rounded transition-colors ${
                conversation.archived ? "text-blue-500" : ""
              }`}
              title="Archive"
            >
              <Archive className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:text-indigo-600 rounded transition-colors"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => deleteConversation(conversation.id)}
              className="p-1 hover:text-red-500 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface RecommendationCardProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function RecommendationCard({ title, description, actionText, onAction }: RecommendationCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50/50 to-violet-50/50 border border-indigo-100/50 rounded-3xl p-5 shadow-xs flex items-start gap-4">
      <div className="bg-indigo-100/70 p-2.5 rounded-2xl text-indigo-600 shrink-0">
        <Sparkles className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-black text-gray-800 tracking-tight leading-snug">{title}</h4>
        <p className="text-[10px] text-gray-500 font-semibold mt-1 leading-relaxed">{description}</p>
        {actionText && (
          <button
            onClick={onAction}
            className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-3 transition-colors"
          >
            {actionText}
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

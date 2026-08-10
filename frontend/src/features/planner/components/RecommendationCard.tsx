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
    <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/20 border border-emerald-100/50 rounded-3xl p-5 shadow-xs flex items-start gap-4">
      <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-2xl shrink-0 border border-emerald-200">
        <Sparkles className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-black text-slate-800 tracking-tight leading-snug">{title}</h4>
        <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">{description}</p>
        {actionText && (
          <button
            onClick={onAction}
            className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mt-3 transition-colors cursor-pointer"
          >
            {actionText}
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

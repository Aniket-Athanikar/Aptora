"use client";

import React from "react";
import { Bookmark, Star, FileText } from "lucide-react";

export const BookmarkedTab: React.FC = () => {
  return (
    <div className="space-y-8 select-none">
      <div className="border-b border-[#E9ECF8] pb-4">
        <h2 className="text-2xl font-black text-neutral-900">Saved & Bookmarked Cards</h2>
        <p className="text-xs text-neutral-400 font-medium mt-1">Review your bookmarked concepts, flashcards, and weak questions to reinforce memory recall.</p>
      </div>

      <div className="space-y-4">
        {[
          { q: "What is the formula for the volume of a Sphere?", a: "Volume = (4/3) * π * r³", tags: ["Quantitative Formulas", "Math"] },
          { q: "What article of the Constitution guarantees the Right to Equality?", a: "Articles 14 to 18", tags: ["General Awareness", "Polity"] },
          { q: "What does 'Spill the beans' mean?", a: "To reveal a secret or confidential information prematurely.", tags: ["English Idioms", "Verbal"] },
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-[#E9ECF8] rounded-[20px] p-5 shadow-sm space-y-3.5 relative overflow-hidden">
            <div className="absolute right-4 top-4 text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded text-[9px] font-bold">
                  {tag}
                </span>
              ))}
            </div>
            <div className="space-y-1.5 pt-1">
              <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">Concept Question:</span>
              <p className="font-extrabold text-xs text-neutral-800 leading-snug">{item.q}</p>
            </div>
            <div className="space-y-1 pt-2.5 border-t border-neutral-100">
              <span className="block text-[10px] font-black text-[#6D4AFF] uppercase tracking-wider">AI Answer Explanation:</span>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

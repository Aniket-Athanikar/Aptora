"use client";

import React from "react";
import { Layers, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "../DashboardContext";

export const RevisionTab: React.FC = () => {
  const {
    selectedDeckId,
    setSelectedDeckId,
    currentCardIndex,
    setCurrentCardIndex,
    isCardFlipped,
    setIsCardFlipped,
    decksData,
    toast,
    triggerXpAward
  } = useDashboard();

  const activeDeck = decksData[selectedDeckId] || decksData.deck1;
  const currentCard = activeDeck.cards[currentCardIndex] || activeDeck.cards[0];

  return (
    <div className="space-y-8 select-none">
      <div className="border-b border-[#E9ECF8] pb-4">
        <h2 className="text-2xl font-black text-neutral-900">Spaced Revision & Flashcards</h2>
        <p className="text-xs text-neutral-400 font-medium mt-1">Review key concepts regularly to improve long-term memory retention.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Interactive Card right column (Now Left 2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-neutral-900 text-base">{activeDeck.title}</h3>
              </div>
              <span className="text-[10px] font-bold text-neutral-400">
                Card {currentCardIndex + 1} of {activeDeck.cards.length}
              </span>
            </div>

            {/* Flashcard Body */}
            <div 
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="h-64 rounded-3xl border border-neutral-200 flex flex-col justify-center items-center text-center p-8 bg-neutral-50/50 hover:bg-neutral-50 transition-colors shadow-inner relative cursor-pointer group"
            >
              <div className="absolute right-4 top-4 text-neutral-400 hover:text-amber-500 transition-colors cursor-pointer" title="Bookmark card">
                <Star className="w-5 h-5" />
              </div>

              <div className="space-y-3 max-w-md">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">
                  {isCardFlipped ? "Answer Side Explanation" : "Question/Concept Face"}
                </span>
                <p className="text-sm font-extrabold text-neutral-800 leading-relaxed md:text-base">
                  {isCardFlipped ? currentCard.a : currentCard.q}
                </p>
              </div>

              <span className="absolute bottom-5 text-[9px] font-black text-neutral-400 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                Click/Tap Flashcard to Flip
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
              <button
                disabled={currentCardIndex === 0}
                onClick={() => {
                  setCurrentCardIndex((p) => p - 1);
                  setIsCardFlipped(false);
                }}
                className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl cursor-pointer text-xs font-bold text-neutral-700 disabled:opacity-40 bg-white"
              >
                <ChevronLeft className="w-4.5 h-4.5 inline mr-1" /> Previous Card
              </button>

              <button
                onClick={() => {
                  if (currentCardIndex < activeDeck.cards.length - 1) {
                    setCurrentCardIndex((p) => p + 1);
                    setIsCardFlipped(false);
                  } else {
                    toast("Deck completed! Logged +10 XP reward.", "success");
                    triggerXpAward(10, `Completed Flashcard Revision: ${activeDeck.title}`);
                    setCurrentCardIndex(0);
                    setIsCardFlipped(false);
                  }
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer text-xs font-bold transition-all border-0 shadow-md shadow-indigo-600/10"
              >
                {currentCardIndex === activeDeck.cards.length - 1 ? "Complete Revision & Reset" : "Next Card"} <ChevronRight className="w-4.5 h-4.5 inline ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Decks Left column (Now Right 1 column) */}
        <div className="xl:col-span-1 bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-4">
          <span className="text-xs font-extrabold text-neutral-900 border-b border-neutral-100 pb-3 block">Flashcard Decks</span>
          <div className="space-y-2.5">
            {Object.entries(decksData).map(([key, deck]) => {
              const active = selectedDeckId === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedDeckId(key);
                    setCurrentCardIndex(0);
                    setIsCardFlipped(false);
                  }}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02]",
                    active 
                      ? "border-indigo-500 bg-indigo-50/30 font-bold" 
                      : "border-neutral-200 bg-white hover:bg-neutral-50"
                  )}
                >
                  <div className="space-y-1">
                    <span className="block font-bold text-xs text-neutral-800">{deck.title}</span>
                    <span className="block text-[10px] text-neutral-400 font-semibold">{deck.cards.length} Cards</span>
                  </div>
                  <Layers className={cn("w-4 h-4", active ? "text-indigo-600" : "text-neutral-400")} />
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

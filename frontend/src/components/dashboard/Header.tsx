"use client";

import React from "react";
import { Search, Flame, Brain, Award, Bell, ArrowLeft } from "lucide-react";
import { useDashboard } from "./DashboardContext";

export const Header: React.FC = () => {
  const {
    user,
    userProfile,
    searchQuery,
    setSearchQuery,
    router
  } = useDashboard();

  return (
    <header className="h-20 bg-white border-b border-[#E9ECF8] px-8 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-6 flex-grow max-w-xl">


        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules, decks, AI chat or test parameters..."
            className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4.5">
        <div className="group relative flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/40 px-3.5 py-1.5 rounded-full font-extrabold text-xs">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>{userProfile?.streak || 4} Days</span>
        </div>

        <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200/40 px-3.5 py-1.5 rounded-full font-extrabold text-xs">
          <Brain className="w-4 h-4 text-indigo-600" />
          <span>{userProfile?.xp || 320} XP</span>
        </div>

        <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200/40 px-3.5 py-1.5 rounded-full font-extrabold text-xs">
          <Award className="w-4 h-4 text-yellow-600" />
          <span>{userProfile?.coins || 120} Coins</span>
        </div>

        <button className="p-2.5 rounded-full border border-[#E9ECF8] hover:bg-neutral-50 text-neutral-500 relative cursor-pointer bg-transparent">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-2 border-l border-neutral-200 pl-4">
          <div className="w-9 h-9 rounded-full overflow-hidden relative bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-600/10 cursor-pointer">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.[0]?.toUpperCase() || "S"
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

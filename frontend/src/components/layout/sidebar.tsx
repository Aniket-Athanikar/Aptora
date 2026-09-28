"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  LayoutDashboard,
  Compass,
  ListTodo,
  Star,
  TrendingUp,
  Trophy,
  Bot,
  Bell,
  Calendar,
  User,
  LogOut,
  Camera,
  X,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useAuth, useProfile } from "@/contexts";
import { getAvatarUrl } from "@/lib/avatar";
import { NAV_ITEMS, QUOTES, COACH_TEMPLATES } from "./sidebar-constants";
import { navigate } from "./sidebar-helpers";

interface SidebarProps {
  activeTab: string;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  openProfileModal?: () => void;
}

export function Sidebar({
  activeTab,
  mobileOpen,
  setMobileOpen,
  openProfileModal: customOpenProfileModal,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const openProfileModal = () => {
    if (customOpenProfileModal) {
      customOpenProfileModal();
    } else {
      router.push("/profile");
    }
  };
  const pathname = usePathname();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const sidebarWidth = isCollapsed ? "w-[80px]" : "w-[240px]";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen z-30 transition-all duration-500 ease-in-out
                    bg-[#FAF9F6] border-r border-slate-200/90 shadow-xl relative
                    ${sidebarWidth} ${isCollapsed ? "px-3.5 py-7" : "px-6 py-8"}`}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-9 w-8 h-8 rounded-full bg-white border border-slate-200
                     flex items-center justify-center text-slate-500 hover:text-[#084c38]
                     shadow-md hover:scale-110 transition-all duration-300 z-50 cursor-pointer"
          aria-label="Toggle sidebar collapse"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Ambient Colorful Background Glows */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#084c38]/10 via-[#10b981]/5 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 right-0 h-40 bg-gradient-to-t from-[#084c38]/10 via-emerald-100/20 to-transparent blur-3xl pointer-events-none" />

        {/* Brand/Logo Area */}
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} mb-8 relative px-1`}>
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-[#084c38] blur-xs opacity-20 group-hover:opacity-60 transition-all duration-300" />
              <div className="relative w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/favicon.ico"
                  alt="Aptora"
                  className="w-7 h-7 object-contain"
                />
              </div>
            </div>

            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="leading-tight flex-1"
              >
                <h1 className="font-black text-xl tracking-tight font-display text-slate-900">
                  <span className="bg-gradient-to-r from-[#084c38] via-[#059669] to-[#063b2b] bg-clip-text text-transparent">
                    Aptora
                  </span>
                </h1>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#084c38]">
                  STUDY KATTA
                </p>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 -mr-2.5 custom-scrollbar select-none no-scrollbar">
          {NAV_ITEMS.map(({ key, label, icon: Icon, gradient, textClass, bgLight, glow }) => {
            const active = activeTab === key;
            return (
              <React.Fragment key={key}>
                <button
                  onClick={() => navigate(router, key)}
                  onMouseEnter={() => setHoveredItem(key)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={isCollapsed ? label : undefined}
                  className={`group relative flex w-full items-center rounded-xl text-[13px] font-bold
                              transition-all duration-200 cursor-pointer overflow-hidden border
                              ${isCollapsed ? "justify-center h-11" : "gap-3.5 h-11 px-3.5"}
                              ${active
                      ? "text-[#084c38] bg-[#ecfdf5] border-[#d1fae5] shadow-xs font-extrabold"
                      : "text-slate-600 hover:text-slate-900 border-transparent hover:bg-white hover:border-slate-200/80"
                    }`}
                >
                  {/* Left Active border indicator */}
                  {active && (
                    <motion.span
                      layoutId="activeBorder"
                      className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-[#084c38]"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}

                  {/* Icon wrapper */}
                  <div
                    className={`relative p-1.5 rounded-lg transition-all duration-200 border
                             ${active ? "bg-white border-[#d1fae5] shadow-2xs text-[#084c38]" : "bg-transparent border-transparent group-hover:bg-slate-100/80"}`}
                  >
                    <Icon
                      className={`w-[17px] h-[17px] shrink-0 transition-transform duration-200 group-hover:scale-105 
                                ${active ? "text-[#084c38]" : "text-slate-400 group-hover:text-slate-700"}`}
                    />
                  </div>

                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="truncate tracking-wide"
                    >
                      {label}
                    </motion.span>
                  )}
                </button>
              </React.Fragment>
            );
          })}

          <div className="h-[1px] bg-slate-200/80 my-3 mx-2" />

          {/* Profile Item */}
          <Link
            href="/profile"
            title={isCollapsed ? "Profile" : undefined}
            onMouseEnter={() => setHoveredItem("profile")}
            onMouseLeave={() => setHoveredItem(null)}
            className={`group relative flex items-center rounded-xl text-[13px] font-bold
                        transition-all duration-200 cursor-pointer overflow-hidden border
                        ${isCollapsed ? "justify-center h-11" : "gap-3.5 h-11 px-3.5"}
                        ${pathname?.startsWith("/profile")
                ? "text-[#084c38] bg-[#ecfdf5] border-[#d1fae5] shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900 border-transparent hover:bg-white hover:border-slate-200/80"
              }`}
          >
            {pathname?.startsWith("/profile") && (
              <motion.span
                layoutId="activeBorder"
                className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-[#084c38]"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <div className={`p-1.5 rounded-lg transition-all duration-200 border ${pathname?.startsWith("/profile") ? "bg-white border-[#d1fae5] text-[#084c38]" : "bg-transparent border-transparent group-hover:bg-slate-100/80"}`}>
              <User className={`w-[17px] h-[17px] shrink-0 ${pathname?.startsWith("/profile") ? "text-[#084c38]" : "text-slate-400 group-hover:text-slate-700"}`} />
            </div>
            {!isCollapsed && <span className="tracking-wide">Profile</span>}
          </Link>
        </nav>

        {/* Daily Coach Quote Card */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 pt-3 border-t border-slate-200/70"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#d1fae5] bg-[#ecfdf5]/80 p-3.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#084c38]">
                <Sparkles className="w-3.5 h-3.5 text-[#084c38]" />
                <span>Daily Coach</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-700 leading-relaxed italic min-h-[40px]">
                &ldquo;{QUOTES[quoteIdx]}&rdquo;
              </p>
              <div className="mt-2.5 flex justify-center gap-1">
                {QUOTES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setQuoteIdx(i)}
                    className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${i === quoteIdx ? "w-4 bg-[#084c38]" : "w-1 bg-slate-300 hover:bg-slate-400"
                      }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* User profile footer */}
        <div className="mt-3 pt-3 border-t border-slate-200/80">
          <div className={`flex items-center gap-3 ${isCollapsed ? "flex-col justify-center" : ""}`}>
            <button
              onClick={openProfileModal}
              title="Edit profile"
              className="relative shrink-0 group cursor-pointer"
            >
              {profile?.avatar_url ? (
                <img
                  src={getAvatarUrl(profile.avatar_url)}
                  alt="avatar"
                  className="relative w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="relative w-10 h-10 rounded-full bg-[#084c38] text-white flex items-center justify-center font-bold text-xs uppercase border-2 border-white shadow-xs transition-transform duration-200 group-hover:scale-105">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="w-3.5 h-3.5 text-white" />
              </span>
            </button>

            {!isCollapsed ? (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-bold text-slate-900 truncate hover:text-[#084c38] transition cursor-pointer" onClick={openProfileModal}>
                    {profile?.name || user?.name || "Account User"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate font-medium">
                    {profile?.email || user?.email || ""}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer mt-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Sidebar content */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-[280px] h-full bg-[#FAF9F6] border-r border-slate-200 flex flex-col p-6 shadow-2xl z-10"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                    <img
                      src="/favicon.ico"
                      alt="Aptora"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <h1 className="font-black text-xl tracking-tight text-slate-900 font-display">
                    <span className="bg-gradient-to-r from-[#084c38] via-[#059669] to-[#063b2b] bg-clip-text text-transparent">
                      Aptora
                    </span>
                  </h1>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 select-none no-scrollbar">
                {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                  const active = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        navigate(router, key);
                        setMobileOpen(false);
                      }}
                      className={`flex items-center gap-3.5 w-full h-11 px-3.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer border relative overflow-hidden
                                  ${active
                          ? "text-[#084c38] bg-[#ecfdf5] border-[#d1fae5] shadow-xs font-extrabold"
                          : "text-slate-600 hover:bg-white border-transparent hover:border-slate-200"}`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors border ${active ? "bg-white border-[#d1fae5] text-[#084c38]" : "bg-transparent border-transparent"}`}>
                        <Icon className={`w-[17px] h-[17px] ${active ? "text-[#084c38]" : "text-slate-400"}`} />
                      </div>
                      <span className="tracking-wide text-left">{label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  {profile?.avatar_url ? (
                    <img
                      src={getAvatarUrl(profile.avatar_url)}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#084c38] text-white flex items-center justify-center font-bold text-xs uppercase border border-slate-200 shadow-xs">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {profile?.name || user?.name || "Account User"}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate font-medium">
                      {profile?.email || user?.email || ""}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold border border-rose-200 transition-colors cursor-pointer shadow-xs"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
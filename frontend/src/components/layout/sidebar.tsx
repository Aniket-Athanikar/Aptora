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
  const { logout } = useAuth();
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
                    bg-slate-50/95 border-r border-slate-200/80 shadow-2xl relative
                    ${sidebarWidth} ${isCollapsed ? "px-3.5 py-7" : "px-6 py-8"}`}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-9 w-8 h-8 rounded-full bg-white border border-slate-200
                     flex items-center justify-center text-slate-500 hover:text-emerald-600
                     shadow-md hover:scale-115 transition-all duration-300 z-50 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Ambient Colorful Background Glows */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-400/15 via-emerald-400/10 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 right-0 h-40 bg-gradient-to-t from-purple-400/10 via-amber-300/10 to-transparent blur-3xl pointer-events-none" />

        {/* Brand/Logo Area */}
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3.5"} mb-9 relative px-1`}>
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 blur-md opacity-40 group-hover:opacity-85 transition-all duration-500 animate-pulse-subtle" />
            <div className="relative w-11 h-11 rounded-2xl bg-white border border-slate-150 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <img
                src="/favicon.ico"
                alt="ExamForge"
                className="w-8 h-8 object-contain"
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
              <h1 className="font-black text-lg tracking-tight text-slate-900 flex items-center gap-0.5">
                <span>Exam</span>
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 bg-clip-text text-transparent">Forge-AI</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-700">
                STUDY KATTA
              </p>
            </motion.div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-2 overflow-y-auto pr-1 -mr-2.5 custom-scrollbar select-none no-scrollbar">
          {NAV_ITEMS.map(({ key, label, icon: Icon, gradient, textClass, bgLight, glow }) => {
            const active = activeTab === key;
            const isHovered = hoveredItem === key;
            return (
              <button
                key={key}
                onClick={() => navigate(router, key)}
                onMouseEnter={() => setHoveredItem(key)}
                onMouseLeave={() => setHoveredItem(null)}
                title={isCollapsed ? label : undefined}
                className={`group relative flex w-full items-center rounded-2xl text-[13px] font-black
                            transition-all duration-300 cursor-pointer overflow-hidden border
                            ${isCollapsed ? "justify-center h-12.5" : "gap-4 h-12 px-4.5"}
                            ${active
                    ? `${textClass} ${bgLight} border-slate-100 shadow-md`
                    : "text-slate-500 hover:text-slate-900 border-transparent hover:bg-slate-50/80 hover:border-slate-150"
                  }`}
                style={{
                  boxShadow: active ? `0 8px 24px -6px ${glow}` : undefined
                }}
              >
                {/* Active back pill slider */}
                {active && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-white/25 -z-10 rounded-2xl overflow-hidden"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 2.2,
                        ease: "linear",
                      }}
                    />
                  </motion.div>
                )}

                {/* Left Active border indicator */}
                {active && (
                  <motion.span
                    layoutId="activeBorder"
                    className={`absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-full bg-gradient-to-b ${gradient}`}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}

                {/* Icon wrapper */}
                <div
                  className={`relative p-2 rounded-xl transition-all duration-300 border
                             ${active ? "bg-white border-slate-100 shadow-sm scale-105" : "bg-transparent border-transparent group-hover:bg-white group-hover:border-slate-200/50 group-hover:shadow-sm"}`}
                >
                  <Icon
                    className={`w-[17px] h-[17px] shrink-0 transition-transform duration-300 group-hover:scale-110 
                                ${active ? textClass : "text-slate-400 group-hover:text-slate-755 group-hover:text-slate-700"}`}
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
            );
          })}

          <div className="h-[1px] bg-slate-200/60 my-4 mx-2" />

          {/* Profile Item */}
          <Link
            href="/profile"
            title={isCollapsed ? "Profile" : undefined}
            onMouseEnter={() => setHoveredItem("profile")}
            onMouseLeave={() => setHoveredItem(null)}
            className={`group relative flex items-center rounded-2xl text-[13px] font-black
                        transition-all duration-300 cursor-pointer overflow-hidden border
                        ${isCollapsed ? "justify-center h-12.5" : "gap-4 h-12 px-4.5"}
                        ${pathname?.startsWith("/profile")
                ? "text-emerald-700 bg-emerald-50 border-slate-100 shadow-md"
                : "text-slate-500 hover:text-slate-900 border-transparent hover:bg-slate-50/80 hover:border-slate-150"
              }`}
            style={{
              boxShadow: pathname?.startsWith("/profile") ? "0 8px 24px -6px rgba(16, 185, 129, 0.45)" : undefined
            }}
          >
            {pathname?.startsWith("/profile") && (
              <motion.span
                layoutId="activeBorder"
                className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-full bg-gradient-to-b from-emerald-500 to-teal-500"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <div className={`p-2 rounded-xl transition-all duration-300 border ${pathname?.startsWith("/profile") || hoveredItem === "profile" ? "bg-white border-slate-100 shadow-sm scale-105" : "bg-transparent border-transparent group-hover:bg-white group-hover:border-slate-200/50 group-hover:shadow-sm"}`}>
              <User className={`w-[17px] h-[17px] shrink-0 ${pathname?.startsWith("/profile") ? "text-emerald-750" : "text-slate-400 group-hover:text-slate-700"}`} />
            </div>
            {!isCollapsed && <span className="tracking-wide">Profile</span>}
          </Link>
        </nav>

        {/* Coach / Dynamic Quote Card */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-slate-100"
          >
            {(() => {
              const tmpl = COACH_TEMPLATES[quoteIdx % COACH_TEMPLATES.length];
              return (
                <div className={`relative overflow-hidden rounded-3xl border ${tmpl.border} bg-gradient-to-br ${tmpl.gradient} p-4 shadow-3xs transition-all duration-500`}>
                  <div className={`absolute top-0 right-0 w-24 h-24 ${tmpl.glow} rounded-full blur-xl pointer-events-none transition-all duration-500`} />
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse bg-current ${tmpl.accent}`} />
                    <Sparkles className={`w-3.5 h-3.5 animate-pulse ${tmpl.accent}`} />
                    <span className={tmpl.accent}>Daily Coach</span>
                  </div>
                  <p className={`mt-3.5 min-h-[46px] text-[12px] font-extrabold ${tmpl.text} leading-relaxed italic transition-colors duration-500`}>
                    &ldquo;{QUOTES[quoteIdx]}&rdquo;
                  </p>
                  <div className="mt-3.5 flex justify-center gap-1.5">
                    {QUOTES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setQuoteIdx(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === quoteIdx ? `w-5 bg-gradient-to-r ${NAV_ITEMS[1].gradient}` : "w-1.5 bg-slate-300 hover:bg-slate-400"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* User profile footer */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className={`flex items-center gap-3.5 ${isCollapsed ? "flex-col justify-center" : ""}`}>
            <button
              onClick={openProfileModal}
              title="Edit profile"
              className="relative shrink-0 group cursor-pointer"
            >
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-[#6D4AFF] to-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm scale-95 group-hover:scale-100" />
              {profile?.avatar_url ? (
                <img
                  src={getAvatarUrl(profile.avatar_url)}
                  alt="avatar"
                  className="relative w-11 h-11 rounded-full object-cover border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-[#6D4AFF] to-purple-500 text-white flex items-center justify-center font-black text-sm uppercase border border-white shadow-md transition-transform duration-300 group-hover:scale-105">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="w-4 h-4 text-white" />
              </span>
            </button>

            {!isCollapsed ? (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[13px] font-black text-slate-800 truncate hover:text-[#6D4AFF] transition cursor-pointer" onClick={openProfileModal}>
                    {profile?.name || "Student User"}
                  </p>
                  <p className="text-[10.5px] text-slate-400 truncate">
                    {profile?.email || "student@examforge.ai"}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-300 cursor-pointer"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </>
            ) : (
              <button
                onClick={logout}
                title="Sign out"
                className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 transition-all duration-300 cursor-pointer mt-1"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Collapsible) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Sidebar content */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-[310px] h-full bg-slate-50/95 border-r border-slate-200 flex flex-col p-6 shadow-2xl z-10"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-9">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-md">
                    <img
                      src="/favicon.ico"
                      alt="ExamForge"
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                  <h1 className="font-black text-lg tracking-tight text-slate-900">
                    Exam<span className="bg-gradient-to-r from-[#6D4AFF] to-purple-500 bg-clip-text text-transparent">Forge-AI</span>
                  </h1>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-150 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 space-y-2 overflow-y-auto pr-1 select-none no-scrollbar">
                {NAV_ITEMS.map(({ key, label, icon: Icon, gradient, textClass, bgLight }) => {
                  const active = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        navigate(router, key);
                        setMobileOpen(false);
                      }}
                      className={`flex items-center gap-4 w-full h-12 px-4.5 rounded-2xl text-[13px] font-black transition-all cursor-pointer border relative overflow-hidden
                                  ${active
                          ? `${textClass} ${bgLight} border-slate-100 shadow-md`
                          : "text-slate-500 hover:bg-slate-50 border-transparent hover:border-slate-150"}`}
                    >
                      {active && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent pointer-events-none -z-10"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 2.2,
                            ease: "linear",
                          }}
                        />
                      )}
                      <div className={`p-2 rounded-xl transition-all border ${active ? "bg-white border-slate-100 shadow-sm" : "bg-transparent border-transparent"}`}>
                        <Icon className={`w-[17px] h-[17px] ${active ? textClass : "text-slate-400"}`} />
                      </div>
                      <span className="tracking-wide text-left">{label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="mt-6 pt-5 border-t border-slate-150 flex flex-col gap-4.5">
                <div className="flex items-center gap-3.5">
                  {profile?.avatar_url ? (
                    <img
                      src={getAvatarUrl(profile.avatar_url)}
                      alt="avatar"
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6D4AFF] to-purple-500 text-white flex items-center justify-center font-black text-sm uppercase border border-slate-200 shadow-sm">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-black text-slate-800 truncate">
                      {profile?.name || "Student User"}
                    </p>
                    <p className="text-[10.5px] text-slate-400 truncate">
                      {profile?.email || "student@examforge.ai"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-2.5 w-full h-12 rounded-2xl text-rose-500 hover:bg-rose-50 text-[13px] font-black border border-rose-100 hover:border-rose-200 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <LogOut className="w-4.5 h-4.5" /> Sign Out
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, LogOut, LogIn, User, ChevronDown, Compass, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import GlowButton from "@/components/ui/GlowButton";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/contexts";
import { getAvatarUrl } from "@/lib/avatar";
import Image from "next/image";
import DeleteAccountModal from "@/components/modals/DeleteAccountModal";

const getFallbackAvatarUrl = (name: string) => {
  const seed = encodeURIComponent(name || "User");
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
};

const formatDisplayName = (name: string) => {
  if (!name) return "";
  let clean = name.replace(/[0-9]/g, ""); // Remove numbers
  clean = clean.replace(/recruitology/gi, ""); // Remove recruitology
  clean = clean.replace(/gmail/gi, ""); // Remove gmail
  clean = clean.trim();
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean || name;
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { profile } = useProfile();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(pathname || "/");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayAvatar = getAvatarUrl(profile?.avatar_url);
  const displayName = profile?.name || user?.name || "";

  const navLinks = [
    { name: "Home", href: "/", emoji: "🏠" },
    { name: "Features", href: "/features", emoji: "✨" },
    { name: "Exams", href: "/exams", emoji: "📝" },
    { name: "Pricing", href: "/pricing", emoji: "💰" },
    { name: "Blog", href: "/blog", emoji: "📰" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <header
      className={cn(
        "absolute top-0 left-0 right-0 z-[999] w-full transition-all duration-500 border-b pointer-events-auto",
        scrolled
          ? "bg-[var(--surface)]/80 backdrop-blur-xl border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)] py-3"
          : "bg-[var(--surface)]/30 backdrop-blur-md border-white/20 shadow-none py-5"
      )}
    >
      {/* 3D perspective wireframe pattern simulating Three.js grid floor */}
      <div
        className="absolute inset-x-0 top-0 h-28 overflow-hidden opacity-25 pointer-events-none z-0"
        style={{ perspective: "150px" }}
      >
        <div
          className="w-full h-[200%] origin-top"
          style={{
            transform: "rotateX(65deg)",
            backgroundImage: "linear-gradient(rgba(15, 165, 115, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)",
            backgroundSize: "16px 16px"
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[var(--surface)] to-transparent" />
      </div>
      <div className="absolute top-0 left-[35%] w-[30%] h-full bg-gradient-to-r from-emerald-500/5 to-amber-500/5 blur-[50px] pointer-events-none z-0" />

      <div className="w-full px-4 sm:px-8 md:px-12 flex items-center justify-between relative z-10">

        {/* Logo */}
        <Link
          href="/"
          onClick={() => setActiveLink("/")}
          className="flex items-center gap-2 sm:gap-3 font-black text-lg sm:text-2xl tracking-tight text-neutral-900 group transition-all duration-300 hover:scale-105"
        >
          <div className="relative shrink-0" style={{ perspective: 1000 }}>
            <motion.div
              whileHover={{ rotateY: 180, scale: 1.05 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="relative w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-150 shadow-md flex items-center justify-center bg-white"
            >
              <Image
                src="/favicon.ico"
                alt="ExamForge AI Vision Logo"
                width={56}
                height={56}
                className="w-full h-full rounded-full object-cover"
                priority
              />
            </motion.div>
          </div>
          <span className="font-black tracking-tight text-neutral-950 text-lg sm:text-2xl md:text-3xl mt-0.5 sm:mt-1 flex items-center gap-1">
            ExamForge-<span className="bg-gradient-to-r from-emerald-600 via-teal-650 to-emerald-800 bg-clip-text text-transparent">AI</span>📚
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-4 mt-1">
          {navLinks.map((link) => (
            <motion.div
              key={link.name}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href={link.href}
                onClick={() => setActiveLink(link.href)}
                className={cn(
                  "relative text-xs font-black tracking-wider transition-all px-3 py-1.5 rounded-xl border flex items-center gap-1.5",
                  activeLink === link.href
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-xs"
                    : "bg-white/40 border-slate-200/60 text-neutral-605 hover:text-neutral-900 hover:bg-white/80 hover:border-slate-300"
                )}
              >
                <span>{link.emoji}</span>
                <span>{link.name}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-4 mt-1">
          {mounted && isAuthenticated && user ? (
            /* ── Logged-in User Menu ── */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200/80 bg-white/50 hover:bg-white/80 transition-all cursor-pointer"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center bg-neutral-100">
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xs uppercase shadow-sm">
                      {displayName ? displayName.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                </div>
                <span className="text-sm font-bold text-neutral-800 max-w-[120px] truncate">
                  {formatDisplayName(user.name)}
                </span>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 text-neutral-400 transition-transform duration-200",
                  userMenuOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden z-50 p-2 space-y-1"
                  >
                    <div className="p-3 border-b border-slate-100 mb-1.5">
                      <p className="text-xs font-black text-slate-900 truncate">{formatDisplayName(user.name)}</p>
                      <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{user.email}</p>
                    </div>

                    <button
                      onClick={() => { setUserMenuOpen(false); router.push("/profile"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" /> My Profile
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); router.push("/dashboard"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                    >
                      <Compass className="w-3.5 h-3.5 text-slate-400" /> My Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-650 hover:bg-red-50/50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" /> Logout
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); setDeleteModalOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-2 text-left"
                    >
                      <Trash2 className="w-3 h-3 text-red-450" /> Delete Account
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Guest Actions ── */
            <>
              <Link
                href="/login"
                className="text-xs font-black text-slate-705 hover:text-emerald-700 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                Login
              </Link>
              <Link href="/login">
                <GlowButton
                  variant="gradient"
                  className="text-xs px-6 py-2.5 font-black shadow-md from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20 hover:shadow-emerald-500/40"
                  magnetic={false}
                >
                  Get Started
                </GlowButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-neutral-750 hover:text-emerald-600 transition-colors mt-1"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Drawer - Premium White Glassmorphic Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 p-6 shadow-xl flex flex-col gap-5 animate-in fade-in slide-in-from-top-4 duration-300 max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  setActiveLink(link.href);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "relative text-sm font-black transition-all px-4 py-2.5 rounded-xl border flex items-center gap-2.5",
                  activeLink === link.href
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-xs"
                    : "bg-white border-slate-200/80 text-neutral-600 hover:bg-slate-50 hover:text-neutral-900"
                )}
              >
                <span className="text-base">{link.emoji}</span>
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          <hr className="border-slate-100" />

          {mounted && isAuthenticated && user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl shadow-xs">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-250 flex items-center justify-center bg-slate-100 shrink-0">
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xs uppercase shadow-sm">
                      {displayName ? displayName.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate">{formatDisplayName(user.name)}</p>
                  <p className="text-xs text-slate-400 font-semibold truncate">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 font-bold text-xs text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                >
                  👤 My Profile
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 font-bold text-xs text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                >
                  🧭 My Dashboard
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2.5 font-bold text-xs text-red-650 border border-red-100 rounded-xl hover:bg-red-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  🚪 Logout
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); setDeleteModalOpen(true); }}
                  className="w-full text-center py-2.5 font-bold text-red-500 border border-red-100/50 rounded-xl hover:bg-red-50/30 transition-all cursor-pointer text-[10px] flex items-center justify-center gap-1.5"
                >
                  ⚠️ Delete Account
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 font-black text-slate-800 border border-slate-250 bg-white rounded-xl hover:bg-emerald-50/60 hover:text-emerald-700 hover:border-emerald-200 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <LogIn className="w-4 h-4 text-emerald-600" />
                Login
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 font-black bg-gradient-to-r from-emerald-600 to-teal-655 text-white rounded-xl shadow-md transition-all block"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Glowing Bottom Border of the capsule */}
      <div className="absolute bottom-0 left-0 w-full h-[4.5px] bg-gradient-to-r from-transparent via-emerald-500 via-amber-400 via-teal-500 to-transparent bg-[length:200%_auto] shadow-[0_0_20px_4px_rgba(16,185,129,0.7)] z-50 pointer-events-none" />

      {/* Delete Account Modal */}
      <DeleteAccountModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </header>
  );
}

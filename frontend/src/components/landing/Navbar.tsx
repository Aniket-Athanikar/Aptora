"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, LogOut, User, ChevronDown, Compass, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import GlowButton from "../ui/GlowButton";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import DeleteAccountModal from "@/components/DeleteAccountModal";

const getAvatarUrl = (name: string) => {
  const femaleNames = ["mrunal", "priya", "sneha", "neha", "reddy", "sharma", "puja", "pooja", "anita", "sunita", "rekha", "kiran", "chaudhari"];
  const cleanName = name.toLowerCase().trim();
  const isFemale = femaleNames.some(fName => cleanName.includes(fName));
  return isFemale
    ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
    : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, login, logout } = useAuth();
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

  // Sync profile details (such as avatar_url) from DB to Navbar
  useEffect(() => {
    if (isAuthenticated && user?.email && !user.avatar) {
      const syncProfile = async () => {
        try {
          const res = await fetch(`${API_URL}/api/profile?email=${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.profile) {
              login({
                name: data.profile.name || user.name,
                email: user.email,
                avatar: data.profile.avatar_url || ""
              });
            }
          }
        } catch (err) {
          console.error("Error syncing profile to navbar:", err);
        }
      };
      syncProfile();
    }
  }, [isAuthenticated, user?.email, user?.avatar, login, user?.name]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync active link with current pathname
  useEffect(() => {
    setActiveLink(pathname || "/");
  }, [pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    // ...(isAuthenticated ? [{ name: "Dashboard", href: "/dashboard" }] : []),
    { name: "Features", href: "/features" },
    { name: "Exams", href: "/exams" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[999] w-full transition-all duration-500 border-b pointer-events-auto",
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] py-3"
          : "bg-white/30 backdrop-blur-md border-neutral-200/20 shadow-none py-5"
      )}
    >
      <div className="layout-container max-w-[1320px] px-6 mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          onClick={() => setActiveLink("/")}
          className="flex items-center gap-3 font-black text-2xl tracking-tight text-neutral-900 group transition-all duration-300 hover:scale-105"
        >
          <Image
            src="/favicon.ico"
            alt="ExamForge AI Logo"
            width={56}
            height={56}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full animate-spin-slow glow-avatar object-cover border-2 border-[#ECECEC]"
            priority
          />
          <span className="font-black tracking-tight text-neutral-950 uppercase text-2xl md:text-3xl mt-1">
            EXAM FORGE<span className="text-[#6D4AFF]"> AI</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 mt-1">
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
                  "relative text-sm font-black uppercase tracking-wider transition-colors py-2 block",
                  activeLink === link.href
                    ? "text-[#6D4AFF]"
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                {link.name}
                {activeLink === link.href && (
                  <motion.div
                    layoutId="active-nav-stick"
                    className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#6D4AFF] rounded-full shadow-[0_2px_10px_1px_rgba(109,74,255,0.5)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-4 mt-1">
          {mounted && isAuthenticated && user ? (
            /* â”€â”€ Logged-in User Menu â”€â”€ */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[#ECECEC] bg-white/50 hover:bg-white/80 transition-all cursor-pointer"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#ECECEC] flex items-center justify-center bg-neutral-100">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={getAvatarUrl(user.name)}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
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
                    className="absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl border border-[#ECECEC] rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-[#ECECEC]">
                      <p className="text-sm font-black text-neutral-900 truncate">{formatDisplayName(user.name)}</p>
                      <p className="text-xs font-medium text-neutral-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push("/profile"); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-neutral-400" /> MY PROFILE
                      </button>
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push("/dashboard"); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                      >
                        <Compass className="w-4 h-4 text-neutral-400" /> MY DASHBOARD
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> LOGOUT
                      </button>
                      <button
                        onClick={() => { setUserMenuOpen(false); setDeleteModalOpen(true); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-t border-neutral-100 mt-1 pt-3"
                      >
                        <Trash2 className="w-4 h-4" /> DELETE ACCOUNT
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* â”€â”€ Guest Actions â”€â”€ */
            <>
              <Link href="/login" className="text-sm font-bold text-neutral-600 hover:text-[#6D4AFF] cursor-pointer transition-colors px-4 py-2">
                LOGIN
              </Link>
              <Link href="/login">
                <GlowButton variant="gradient" className="text-xs px-6 py-3 font-bold" magnetic={false}>
                  GET STARTED
                </GlowButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-neutral-300 hover:text-[#6D4AFF] transition-colors mt-1"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#060410]/95 backdrop-blur-xl border-b border-neutral-900 p-6 shadow-2xl flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
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
                  "relative text-base font-bold transition-all px-4 py-3 rounded-xl",
                  activeLink === link.href
                    ? "bg-[#6D4AFF]/5 text-[#6D4AFF]"
                    : "text-neutral-300 hover:bg-neutral-900/50 hover:text-white"
                )}
              >
                {link.name}
                {activeLink === link.href && (
                  <motion.div
                    layoutId="mobile-active-nav-stick"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-1/2 bg-[#6D4AFF] rounded-r-full shadow-[2px_0_10px_1px_rgba(109,74,255,0.5)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <hr className="border-neutral-900" />

          {mounted && isAuthenticated && user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-neutral-800 flex items-center justify-center bg-neutral-900">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={getAvatarUrl(user.name)}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{formatDisplayName(user.name)}</p>
                  <p className="text-xs text-neutral-400">{user.email}</p>
                </div>
              </div>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3.5 font-bold text-neutral-300 border border-neutral-800 rounded-xl hover:bg-neutral-900/60 hover:border-neutral-700 transition-all block"
              >
                View Profile
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full text-center py-3.5 font-bold text-red-400 border border-red-950/50 rounded-xl hover:bg-red-950/20 transition-all cursor-pointer"
              >
                Logout
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); setDeleteModalOpen(true); }}
                className="w-full text-center py-3.5 font-bold text-red-400 border border-red-950/50 rounded-xl hover:bg-red-950/20 transition-all cursor-pointer text-sm"
              >
                Delete Account
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3.5 font-bold text-neutral-300 border border-neutral-800 rounded-xl hover:bg-neutral-900/60 hover:border-neutral-700 transition-all block"
              >
                Login
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3.5 font-bold bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white rounded-xl shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all block"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Glowing Bottom Border of the capsule */}
      <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-transparent via-[#6D4AFF] via-[#A855F7] via-[#4F46E5] to-transparent bg-[length:200%_auto] animate-glow-flow shadow-[0_0_12px_2px_rgba(109,74,255,0.7)] z-50 pointer-events-none" />

      {/* Delete Account Modal */}
      <DeleteAccountModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </header>
  );
}

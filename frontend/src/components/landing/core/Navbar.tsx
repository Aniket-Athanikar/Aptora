"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, LogOut, User, ChevronDown, Compass, Trash2, Sparkles, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import DeleteAccountModal from "@/components/modals/DeleteAccountModal";
import { AptoraLogo } from "@/components/ui/AptoraLogo";

const getAvatarUrl = (name?: string) => {
  if (!name) return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120";
  const femaleNames = ["mrunal", "priya", "sneha", "neha", "reddy", "sharma", "puja", "pooja", "anita", "sunita", "rekha", "kiran", "chaudhari"];
  const cleanName = name.toLowerCase().trim();
  const isFemale = femaleNames.some((fName) => cleanName.includes(fName));
  return isFemale
    ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
    : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120";
};

const formatDisplayName = (name?: string) => {
  if (!name) return "";
  let clean = name.replace(/[0-9]/g, ""); // Remove numbers
  clean = clean.replace(/recruitology/gi, "");
  clean = clean.replace(/gmail/gi, "");
  clean = clean.trim();
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean || name;
};

import { resolveApiUrl } from "@/lib/api-url";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync profile details from DB to Navbar
  useEffect(() => {
    if (isAuthenticated && user?.email && !user.avatar) {
      const syncProfile = async () => {
        try {
          const res = await fetch(resolveApiUrl(`/profile?email=${encodeURIComponent(user.email)}`));
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
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-close menus on page navigation / pathname change
  useEffect(() => {
    setActiveLink(pathname || "/");
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close menus when clicking outside or pressing Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Exams", href: "/exams" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
  ];

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    router.push("/");
  };

  const userAvatarUrl = user?.avatar || getAvatarUrl(user?.name);
  const userDisplayName = formatDisplayName(user?.name);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b",
        scrolled
          ? "bg-white/90 backdrop-blur-md border-slate-200/80 shadow-xs py-3.5"
          : "bg-transparent border-transparent py-5"
      )}
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Aptora Brand Emblem */}
        <AptoraLogo size="md" />

        {/* Center: Nav Links */}
        <nav
          className="hidden lg:flex items-center gap-2 bg-slate-100/60 p-1.5 rounded-full border border-slate-200/60 backdrop-blur-xs"
          suppressHydrationWarning
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  setActiveLink(link.href);
                  setUserMenuOpen(false);
                }}
                className={cn(
                  "text-xs font-bold transition-all px-4 py-2 rounded-full relative z-10",
                  isActive
                    ? "text-[#084c38]"
                    : "text-slate-600 hover:text-slate-900"
                )}
                suppressHydrationWarning
              >
                {link.name}
                {isActive && (
                  <span
                    className="absolute inset-0 bg-white rounded-full shadow-xs border border-slate-200/60 -z-10 transition-all duration-200"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: User Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {mounted && isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-emerald-300 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-emerald-200 flex items-center justify-center bg-slate-100 shrink-0">
                  <img
                    src={userAvatarUrl}
                    alt={userDisplayName || "User Profile"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate font-display">
                  {userDisplayName}
                </span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                    userMenuOpen && "rotate-180 text-[#084c38]"
                  )}
                />
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white/95 border border-slate-200/90 rounded-2xl shadow-xl p-2.5 z-50 space-y-1 backdrop-blur-md"
                  >
                    {/* User profile card in dropdown */}
                    <div className="p-3 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 rounded-xl border border-emerald-100 mb-1.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-300 shrink-0 shadow-2xs">
                        <img
                          src={userAvatarUrl}
                          alt={userDisplayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate flex-1">
                        <p className="text-xs font-extrabold text-slate-900 truncate font-display">{userDisplayName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push("/profile");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#ecfdf5] hover:text-[#084c38] transition-all text-left cursor-pointer group"
                    >
                      <User className="w-4 h-4 text-slate-400 group-hover:text-[#084c38] transition-colors" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push("/dashboard");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#ecfdf5] hover:text-[#084c38] transition-all text-left cursor-pointer group"
                    >
                      <Compass className="w-4 h-4 text-slate-400 group-hover:text-[#084c38] transition-colors" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Logout</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setDeleteModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all border-t border-slate-100 mt-1.5 pt-2.5 text-left cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      <span>Delete Account</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-extrabold text-white bg-gradient-to-r from-[#084c38] to-[#059669] hover:from-[#063b2b] hover:to-[#047857] px-6 py-2.5 rounded-full shadow-md shadow-[#084c38]/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-[#084c38] hover:bg-slate-100 transition-colors cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-6 shadow-xl space-y-4"
          >
            <nav className="flex flex-col gap-2" suppressHydrationWarning>
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => {
                      setActiveLink(link.href);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "text-sm font-bold transition-all px-4 py-2.5 rounded-xl",
                      isActive
                        ? "bg-[#ecfdf5] text-[#084c38]"
                        : "text-slate-800 hover:bg-slate-50"
                    )}
                    suppressHydrationWarning
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              {mounted && isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                    <img
                      src={userAvatarUrl}
                      alt={userDisplayName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate font-display">{userDisplayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs"
                  >
                    Preparation Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2.5 font-bold text-rose-600 border border-rose-200 bg-rose-50 rounded-xl transition-all text-xs cursor-pointer"
                  >
                    Logout
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setDeleteModalOpen(true);
                    }}
                    className="w-full text-center py-2.5 font-bold text-rose-500 border border-rose-200 rounded-xl transition-all text-xs cursor-pointer"
                  >
                    Delete Account
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 font-bold border border-slate-300 rounded-full text-slate-800 text-xs"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 font-bold bg-[#084c38] text-white rounded-full text-xs shadow-xs"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteAccountModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </header>
  );
}
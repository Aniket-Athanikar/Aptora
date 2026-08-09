'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button, Avatar } from '@/components/ui';
import { useAuth, useProfile } from '@/contexts';
import { Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const marketingNav = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
];

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { profile } = useProfile();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-[var(--surface)]/70 backdrop-blur-2xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.03)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Brand/Logo */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105">
              <img
                src="/favicon.ico"
                alt="ExamForge"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              Exam<span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Forge-AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {marketingNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative text-[13px] font-bold transition-all duration-300 py-1.5',
                    active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  <span>{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId="headerActiveUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden md:flex text-slate-500 hover:text-slate-950 hover:bg-slate-100/60 rounded-xl transition-all duration-300">
            <Search className="h-4.5 w-4.5" />
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-xs font-extrabold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100/60 transition-all duration-300">
                  Dashboard
                </Button>
              </Link>
              <Link href="/profile" className="relative group shrink-0 transition-transform duration-300 hover:scale-105">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-60 blur-xs" />
                <Avatar src={profile?.avatar_url} fallback={profile?.name || profile?.email} size="sm" className="relative border-2 border-white shadow-sm" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs font-extrabold text-slate-500 hover:text-slate-900 rounded-xl transition-all duration-300">
                  Login
                </Button>
              </Link>
              <Link href="/checkout">
                <Button size="sm" className="relative overflow-hidden group text-xs font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white rounded-xl shadow-md hover:shadow-indigo-200/50 hover:shadow-lg transition-all duration-300 border-none px-4 py-2 hover:scale-[1.02]">
                  <span className="relative flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                    Get Started
                  </span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

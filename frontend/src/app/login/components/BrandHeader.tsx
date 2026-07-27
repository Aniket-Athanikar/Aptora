"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BrandHeader() {
  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Image
          src="/favicon.ico"
          alt="Logo"
          width={36}
          height={36}
          className="rounded-full animate-spin-slow glow-avatar object-cover border border-[var(--border)]"
          priority
        />
        <span className="font-black text-xl tracking-tight text-slate-900">
          ExamForge-<span className="bg-gradient-to-r from-[#6D4AFF] to-purple-600 bg-clip-text text-transparent">AI</span>
        </span>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 px-3.5 py-1.5 rounded-xl border border-gray-150 hover:bg-slate-55 transition-all cursor-pointer shadow-2xs hover:scale-[1.02]"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Home
      </Link>
    </div>
  );
}
export default BrandHeader;

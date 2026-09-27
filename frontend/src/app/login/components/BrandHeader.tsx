"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AptoraLogo } from "@/components/ui/AptoraLogo";

export function BrandHeader() {
  return (
    <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
      <AptoraLogo size="md" />
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#084c38] hover:border-[#084c38]/30 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>
    </div>
  );
}
export default BrandHeader;


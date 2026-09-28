"use client";

import React from "react";
import { AptoraLogo } from "@/components/ui/AptoraLogo";

export function BrandHeader() {
  return (
    <div className="w-full flex items-center justify-center pb-3 border-b border-slate-100">
      <AptoraLogo size="md" />
    </div>
  );
}

export default BrandHeader;

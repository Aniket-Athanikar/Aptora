"use client";

import React from "react";
import { cn } from "@/lib/utils";
import MagneticButton from "../animations/MagneticButton";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gradient" | "outline";
  magnetic?: boolean;
}

export default function GlowButton({
  children,
  className,
  variant = "gradient",
  magnetic = true,
  ...props
}: GlowButtonProps) {
  const content = (
    <button
      className={cn(
        "relative inline-flex items-center justify-center font-semibold text-sm px-6 py-3 rounded-xl cursor-pointer transition-all duration-200 select-none",
        variant === "gradient"
          ? "bg-[#084c38] text-white shadow-sm hover:bg-[#063b2b] border-none"
          : "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-2xs",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );

  return magnetic ? <MagneticButton>{content}</MagneticButton> : content;
}


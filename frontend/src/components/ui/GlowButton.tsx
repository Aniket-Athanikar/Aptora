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
        "relative inline-flex items-center justify-center font-semibold text-sm px-6 py-3 rounded-full cursor-pointer transition-all duration-300 select-none",
        variant === "gradient"
          ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_4px_20px_-2px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_0_rgba(16,185,129,0.5)] hover:scale-[1.02] border-none"
          : "bg-white text-neutral-900 border border-[#ECECEC] hover:border-neutral-300 hover:bg-neutral-50/50 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );

  return magnetic ? <MagneticButton>{content}</MagneticButton> : content;
}

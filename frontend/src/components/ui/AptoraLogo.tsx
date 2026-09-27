"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AptoraLogoProps {
  variant?: "default" | "light" | "dark" | "iconOnly";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}

export function AptoraLogo({
  variant = "default",
  size = "md",
  className,
  href = "/",
}: AptoraLogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const isLight = variant === "light";

  const LogoContent = (
    <div className={cn("inline-flex items-center gap-2.5 group select-none", className)}>
      {/* Aptora Signature Geometric Green Mark */}
      <div className={cn("relative flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105", iconSizes[size])}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M16 3L4 27H11.5L16 17.5L20.5 27H28L16 3Z"
            fill={isLight ? "#ffffff" : "#084c38"}
          />
          <path
            d="M16 11L12.5 19H19.5L16 11Z"
            fill={isLight ? "#084c38" : "#ffffff"}
          />
        </svg>
      </div>

      {variant !== "iconOnly" && (
        <span
          className={cn(
            "font-black tracking-tight font-display transition-colors",
            textSizes[size],
            isLight ? "text-white" : "text-[#0f172a]"
          )}
        >
          Aptora
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Aptora Homepage">
        {LogoContent}
      </Link>
    );
  }

  return LogoContent;
}

export default AptoraLogo;

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export default function GlassCard({ children, className, hoverEffect = true, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-panel p-6 bg-white/75 border-neutral-200/60 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.04)]",
        hoverEffect && "glass-panel-hover transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export default function GlassCard({ children, className, hoverEffect = true, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs",
        hoverEffect && "hover:shadow-md hover:border-slate-300 transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}


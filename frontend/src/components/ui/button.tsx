"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] hover:scale-[1.01] cursor-pointer";

    const variants = {
      default: "bg-gradient-to-r from-emerald-500 via-amber-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white font-extrabold shadow-md shadow-amber-500/10 active:scale-98",
      destructive: "bg-gradient-to-r from-rose-500 to-red-600 text-white font-extrabold shadow-sm hover:from-rose-600 hover:to-red-700",
      outline: "border border-amber-300/80 bg-white/90 text-amber-900 font-extrabold shadow-xs hover:bg-amber-50 hover:border-amber-400",
      secondary: "bg-amber-100/80 text-amber-950 font-extrabold border border-amber-200/80 hover:bg-amber-200/80",
      ghost: "hover:bg-emerald-50 hover:text-emerald-900 font-bold",
      link: "text-[#6D4AFF] underline-offset-4 hover:underline font-extrabold"
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9"
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  gradientTitle?: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export default function SectionHeading({
  badge,
  title,
  gradientTitle,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col mb-12 md:mb-16",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {badge && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-600 uppercase bg-emerald-50 border border-emerald-100 rounded-full mb-4">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#111827] leading-tight">
        {title}{" "}
        {gradientTitle && (
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent block sm:inline">
            {gradientTitle}
          </span>
        )}
      </h2>
      {description && (
        <p className="mt-4 text-base md:text-lg text-neutral-500 max-w-2xl font-medium leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

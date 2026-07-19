"use client";


import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

// ---------------------------------------------------------------------------
// GLASS CARD
// ---------------------------------------------------------------------------

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
  onClick?: () => void;
  tone?: "default" | "indigo" | "amber" | "rose" | "emerald" | "slate";
}

const PADDING: Record<NonNullable<GlassCardProps["padding"]>, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

const TONE_BG: Record<NonNullable<GlassCardProps["tone"]>, string> = {
  default: "bg-white/70 border-white/60",
  indigo: "bg-indigo-50/40 border-indigo-100/80",
  amber: "bg-amber-50/40 border-amber-100/80",
  rose: "bg-rose-50/40 border-rose-100/80",
  emerald: "bg-emerald-50/40 border-emerald-100/80",
  slate: "bg-slate-50/40 border-slate-100/80",
};

export function GlassCard({ children, className = "", padding = "md", hover = false, as = "div", onClick, tone = "default" }: GlassCardProps) {
  const Comp: any = as;
  return (
    <Comp
      onClick={onClick}
      className={`
        relative overflow-hidden
        backdrop-blur-xl
        rounded-3xl
        border
        shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-10px_rgba(90,54,238,0.05)]
        ${TONE_BG[tone]}
        ${PADDING[padding]}
        ${hover ? "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(15,23,42,0.05),0_20px_40px_-15px_rgba(90,54,238,0.12)] cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </Comp>
  );
}

// ---------------------------------------------------------------------------
// SECTION HEADER
// ---------------------------------------------------------------------------

interface SectionHeaderProps {
  icon?: keyof typeof Lucide;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  tone?: "indigo" | "amber" | "rose" | "emerald" | "violet" | "slate";
  size?: "sm" | "md" | "lg";
}

const TONE_TEXT: Record<NonNullable<SectionHeaderProps["tone"]>, string> = {
  indigo: "from-indigo-500 to-violet-500",
  amber: "from-amber-500 to-orange-500",
  rose: "from-rose-500 to-pink-500",
  emerald: "from-emerald-500 to-teal-500",
  violet: "from-violet-500 to-fuchsia-500",
  slate: "from-slate-500 to-zinc-500",
};

export function SectionHeader({ icon, title, subtitle, right, tone = "indigo", size = "md" }: SectionHeaderProps) {
  const Icon = icon ? (Lucide[icon] as any) : null;
  const sizeClasses = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200/60 pb-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${TONE_TEXT[tone]} flex items-center justify-center text-white shadow-sm shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className={`font-black text-slate-800 tracking-tight ${sizeClasses}`}>{title}</h3>
          {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PROGRESS RING
// ---------------------------------------------------------------------------

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  tone?: "indigo" | "amber" | "emerald" | "rose";
}

const RING_TONE: Record<NonNullable<ProgressRingProps["tone"]>, { from: string; to: string; text: string }> = {
  indigo: { from: "#6366f1", to: "#a855f7", text: "text-indigo-600" },
  amber: { from: "#f59e0b", to: "#ec4899", text: "text-amber-600" },
  emerald: { from: "#10b981", to: "#14b8a6", text: "text-emerald-600" },
  rose: { from: "#f43f5e", to: "#ec4899", text: "text-rose-600" },
};

export function ProgressRing({ value, size = 80, strokeWidth = 8, label, sublabel, tone = "indigo" }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const colors = RING_TONE[tone];
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`grad-ring-${tone}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#grad-ring-${tone})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dash }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-black ${colors.text} text-base leading-none`}>{label ?? `${Math.round(value)}%`}</span>
        {sublabel && <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PILL / BADGE
// ---------------------------------------------------------------------------

interface PillProps {
  children: React.ReactNode;
  tone?: "default" | "indigo" | "amber" | "rose" | "emerald" | "slate" | "sky" | "violet" | "fuchsia";
  size?: "xs" | "sm";
  icon?: keyof typeof Lucide;
  className?: string;
}

const PILL_TONES: Record<NonNullable<PillProps["tone"]>, string> = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  slate: "bg-slate-50 text-slate-600 border-slate-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  fuchsia: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
};

export function Pill({ children, tone = "default", size = "xs", icon, className = "" }: PillProps) {
  const Icon = icon ? (Lucide[icon] as any) : null;
  return (
    <span className={`inline-flex items-center gap-1 border rounded-full font-extrabold uppercase tracking-wider ${PILL_TONES[tone]} ${size === "xs" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"} ${className}`}>
      {Icon && <Icon className={size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3"} />}
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// STAT CARD
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Lucide;
  trend?: number;
  tone?: "indigo" | "amber" | "emerald" | "rose" | "sky" | "violet";
  delta?: string;
}

const STAT_TONES: Record<NonNullable<StatCardProps["tone"]>, { ring: string; icon: string; bg: string; text: string }> = {
  indigo: { ring: "ring-indigo-100", icon: "text-indigo-600", bg: "bg-indigo-50", text: "text-indigo-600" },
  amber: { ring: "ring-amber-100", icon: "text-amber-600", bg: "bg-amber-50", text: "text-amber-600" },
  emerald: { ring: "ring-emerald-100", icon: "text-emerald-600", bg: "bg-emerald-50", text: "text-emerald-600" },
  rose: { ring: "ring-rose-100", icon: "text-rose-600", bg: "bg-rose-50", text: "text-rose-600" },
  sky: { ring: "ring-sky-100", icon: "text-sky-600", bg: "bg-sky-50", text: "text-sky-600" },
  violet: { ring: "ring-violet-100", icon: "text-violet-600", bg: "bg-violet-50", text: "text-violet-600" },
};

export function StatCard({ label, value, icon, trend, tone = "indigo", delta }: StatCardProps) {
  const Icon = icon ? (Lucide[icon] as any) : null;
  const t = STAT_TONES[tone];
  return (
    <GlassCard padding="md" hover className="group">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {Icon && <Icon className={`w-3.5 h-3.5 ${t.icon}`} />}
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">{label}</p>
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
          {(trend !== undefined || delta) && (
            <div className="flex items-center gap-1 text-[10px] font-bold">
              {trend !== undefined && (
                <span className={trend >= 0 ? "text-emerald-600" : "text-rose-600"}>
                  {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
                </span>
              )}
              {delta && <span className="text-slate-400">{delta}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-2xl ${t.bg} flex items-center justify-center group-hover:scale-110 transition`}>
            <Icon className={`w-5 h-5 ${t.icon}`} />
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// ICON BUTTON
// ---------------------------------------------------------------------------

interface IconButtonProps {
  icon: keyof typeof Lucide;
  onClick?: (e?: React.MouseEvent) => void;
  label?: string;
  tone?: "default" | "indigo" | "danger" | "ghost" | "amber" | "emerald";
  size?: "xs" | "sm" | "md";
  active?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
}

const ICON_BTN_TONES: Record<NonNullable<IconButtonProps["tone"]>, string> = {
  default: "bg-white border-slate-200 text-slate-500 hover:bg-slate-50",
  indigo: "bg-indigo-500 border-indigo-500 text-white hover:bg-indigo-600",
  danger: "bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200",
  ghost: "bg-transparent border-transparent text-slate-400 hover:bg-slate-100",
  amber: "bg-amber-500 border-amber-500 text-white hover:bg-amber-600",
  emerald: "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600",
};

const ICON_BTN_SIZES: Record<NonNullable<IconButtonProps["size"]>, string> = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
};

export function IconButton({ icon, onClick, label, tone = "default", size = "sm", active, disabled, className = "", title }: IconButtonProps) {
  const Icon = (Lucide[icon] as any) || Lucide.Circle;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      aria-label={label}
      className={`
        ${ICON_BTN_SIZES[size]} ${ICON_BTN_TONES[tone]}
        rounded-xl border flex items-center justify-center transition
        ${active ? "ring-2 ring-offset-1 ring-indigo-200" : ""}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// TABS BAR
// ---------------------------------------------------------------------------

interface TabsBarProps<T extends string> {
  tabs: { id: T; label: string; icon?: keyof typeof Lucide; count?: number; tone?: "indigo" | "amber" }[];
  active: T;
  onChange: (id: T) => void;
  variant?: "pills" | "underline" | "segmented";
  size?: "sm" | "md";
}

export function TabsBar<T extends string>({ tabs, active, onChange, variant = "pills", size = "sm" }: TabsBarProps<T>) {
  if (variant === "underline") {
    return (
      <div className="flex items-center gap-1 border-b border-slate-200/60 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon ? (Lucide[t.icon] as any) : null;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`relative flex items-center gap-1.5 px-3 py-2.5 ${size === "sm" ? "text-[11px]" : "text-xs"} font-extrabold uppercase tracking-wider transition whitespace-nowrap ${isActive ? "text-slate-800" : "text-slate-400 hover:text-slate-600"
                }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {t.label}
              {t.count !== undefined && (
                <span className={`px-1.5 rounded-md text-[9px] ${isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>{t.count}</span>
              )}
              {isActive && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "segmented") {
    return (
      <div className="inline-flex p-1 rounded-2xl bg-slate-100/80 border border-slate-200/50 gap-1">
        {tabs.map((t) => {
          const Icon = t.icon ? (Lucide[t.icon] as any) : null;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${size === "sm" ? "text-[10px]" : "text-xs"} font-extrabold uppercase tracking-wider transition ${isActive ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {isActive && <motion.div layoutId="segmented-active" className="absolute inset-0 bg-white shadow-sm rounded-xl" />}
              <span className="relative flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {t.label}
                {t.count !== undefined && <span className={`px-1.5 rounded-md text-[9px] ${isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"}`}>{t.count}</span>}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {tabs.map((t) => {
        const Icon = t.icon ? (Lucide[t.icon] as any) : null;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl ${size === "sm" ? "text-[10px]" : "text-xs"} font-black uppercase tracking-wider transition cursor-pointer ${isActive
                ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-sm"
                : "bg-white/60 border border-slate-200/60 text-slate-500 hover:bg-white hover:text-slate-700"
              }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {t.label}
            {t.count !== undefined && (
              <span className={`px-1.5 rounded-md text-[9px] ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BAR (horizontal progress)
// ---------------------------------------------------------------------------

export function ProgressBar({ value, tone = "indigo", size = "sm" }: { value: number; tone?: "indigo" | "amber" | "emerald" | "rose"; size?: "sm" | "md" }) {
  const colors: Record<typeof tone, string> = {
    indigo: "from-indigo-500 to-violet-500",
    amber: "from-amber-500 to-orange-500",
    emerald: "from-emerald-500 to-teal-500",
    rose: "from-rose-500 to-pink-500",
  } as any;
  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${size === "sm" ? "h-1.5" : "h-2.5"}`}>
      <motion.div
        className={`h-full bg-gradient-to-r ${colors[tone]}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// EMPTY STATE
// ---------------------------------------------------------------------------

interface EmptyStateProps {
  icon?: keyof typeof Lucide;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "Inbox", title, description, action }: EmptyStateProps) {
  const Icon = (Lucide[icon] as any) || Lucide.Inbox;
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">{title}</h4>
      {description && <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MODAL (shared)
// ---------------------------------------------------------------------------

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  footer?: React.ReactNode;
}

const MODAL_WIDTH: Record<NonNullable<ModalProps["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
};

export function Modal({ open, onClose, title, subtitle, children, maxWidth = "lg", footer }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${MODAL_WIDTH[maxWidth]} bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col`}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-800 tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <Lucide.X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
            {footer && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// INPUT (shared)
// ---------------------------------------------------------------------------

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: keyof typeof Lucide;
  label?: string;
  error?: string;
  helper?: string;
}

export function Input({ icon, label, error, helper, className = "", ...props }: InputProps) {
  const Icon = icon ? (Lucide[icon] as any) : null;
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />}
        <input
          {...props}
          className={`w-full ${Icon ? "pl-9" : "pl-3.5"} pr-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition ${error ? "border-rose-300" : ""} ${className}`}
        />
      </div>
      {error && <p className="text-[10px] font-bold text-rose-600">{error}</p>}
      {helper && !error && <p className="text-[10px] font-medium text-slate-400">{helper}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SELECT (shared)
// ---------------------------------------------------------------------------

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = "", ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</label>}
      <div className="relative">
        <select
          {...props}
          className={`w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition pr-9 cursor-pointer ${className}`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Lucide.ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TEXTAREA
// ---------------------------------------------------------------------------

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</label>}
      <textarea
        {...props}
        className={`w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition resize-none ${error ? "border-rose-300" : ""} ${className}`}
      />
      {error && <p className="text-[10px] font-bold text-rose-600">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BUTTON (shared)
// ---------------------------------------------------------------------------

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "primary" | "secondary" | "ghost" | "danger" | "success" | "amber";
  size?: "sm" | "md" | "lg";
  icon?: keyof typeof Lucide;
  iconRight?: keyof typeof Lucide;
  loading?: boolean;
  fullWidth?: boolean;
}

const BTN_TONES: Record<NonNullable<ButtonProps["tone"]>, string> = {
  primary: "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-sm hover:from-slate-900 hover:to-black",
  secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  danger: "bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600 shadow-sm",
  success: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm",
  amber: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm",
};

const BTN_SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-[10px]",
  md: "px-4 py-2.5 text-xs",
  lg: "px-5 py-3 text-sm",
};

export function Button({ tone = "primary", size = "md", icon, iconRight, loading, fullWidth, className = "", children, disabled, ...props }: ButtonProps) {
  const LeftIcon = icon ? (Lucide[icon] as any) : null;
  const RightIcon = iconRight ? (Lucide[iconRight] as any) : null;
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 font-extrabold uppercase tracking-wider rounded-2xl transition active:scale-95 ${BTN_TONES[tone]} ${BTN_SIZES[size]} ${fullWidth ? "w-full" : ""} ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {loading ? <Lucide.Loader className="w-3.5 h-3.5 animate-spin" /> : LeftIcon && <LeftIcon className="w-3.5 h-3.5" />}
      {children}
      {RightIcon && <RightIcon className="w-3.5 h-3.5" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// SWITCH (toggle)
// ---------------------------------------------------------------------------

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 cursor-pointer"
      type="button"
    >
      <span
        className={`relative w-9 h-5 rounded-full transition ${checked ? "bg-gradient-to-r from-indigo-500 to-violet-500" : "bg-slate-300"}`}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 16 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </span>
      {label && <span className="text-xs font-bold text-slate-700">{label}</span>}
    </button>
  );
}

// ---------------------------------------------------------------------------
// SKELETON
// ---------------------------------------------------------------------------

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-gradient-to-r from-slate-100 via-slate-200/50 to-slate-100 bg-[length:200%_100%] animate-[shine_1.6s_ease-in-out_infinite] rounded-xl ${className}`} />;
}

// ---------------------------------------------------------------------------
// AVATAR
// ---------------------------------------------------------------------------

export function Avatar({ name, src, size = 32, tone = "indigo" }: { name?: string; src?: string; size?: number; tone?: "indigo" | "amber" | "emerald" | "rose" | "violet" | "slate" }) {
  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const tones: Record<typeof tone, string> = {
    indigo: "from-indigo-500 to-violet-500",
    amber: "from-amber-500 to-orange-500",
    emerald: "from-emerald-500 to-teal-500",
    rose: "from-rose-500 to-pink-500",
    violet: "from-violet-500 to-fuchsia-500",
    slate: "from-slate-500 to-zinc-500",
  } as any;
  if (src) {
    return <img src={src} alt={name} className="rounded-full object-cover border-2 border-white" style={{ width: size, height: size }} />;
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-extrabold bg-gradient-to-br ${tones[tone]} border-2 border-white shadow-sm`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AVATAR BOOK COVER (3D-style)
// ---------------------------------------------------------------------------

export function BookCover({ title, subtitle, coverColor = "from-indigo-500 via-violet-500 to-fuchsia-500", size = "md" }: { title: string; subtitle?: string; coverColor?: string; size?: "sm" | "md" | "lg" }) {
  const heights: Record<typeof size, string> = { sm: "h-32", md: "h-44", lg: "h-56" } as any;
  const titleSize: Record<typeof size, string> = { sm: "text-xs", md: "text-sm", lg: "text-base" } as any;
  return (
    <div className={`relative w-full ${heights[size]} rounded-2xl overflow-hidden bg-gradient-to-br ${coverColor} flex flex-col justify-end p-3 shadow-md`}>
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="none">
          <defs>
            <pattern id={`pat-${title.slice(0, 4)}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="white" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill={`url(#pat-${title.slice(0, 4)})`} />
        </svg>
      </div>
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -right-12 -bottom-12 w-40 h-40 rounded-full bg-black/10 blur-2xl" />
      <div className="relative z-10">
        <p className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-white/80">ExamForge</p>
        <h4 className={`font-black text-white tracking-tight leading-tight mt-0.5 line-clamp-2 ${titleSize[size]}`}>{title}</h4>
        {subtitle && <p className="text-[9px] font-bold text-white/70 line-clamp-1 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

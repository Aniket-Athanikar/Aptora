import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  label: string;
  focusClass?: string;
  activeClass?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  label,
  focusClass = "focus:border-indigo-500 focus:ring-indigo-500/10",
  activeClass = "bg-indigo-50/60 text-indigo-600"
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex flex-col gap-1.5 w-full text-left">
      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full bg-white border border-slate-200/80 text-slate-800 text-xs rounded-xl px-4 py-3 outline-none transition-all font-semibold flex items-center justify-between cursor-pointer focus:ring-4 ${focusClass}`}
      >
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-1.5 w-full bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-xl p-2.5 z-50 space-y-1 max-h-[160px] overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full p-2 px-3 text-xs font-bold rounded-xl text-left hover:bg-slate-50 transition-colors cursor-pointer ${value === opt ? activeClass : "text-slate-600"
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
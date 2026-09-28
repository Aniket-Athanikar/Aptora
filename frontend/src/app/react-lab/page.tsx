import Link from "next/link";
import React from "react";
import { Cpu, Layers, Zap, ArrowRight, Code2, Sparkles, FolderTree } from "lucide-react";

export default function ReactLabOverview() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in py-2">
      {/* Intro Hero Box */}
      <div className="relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-8 sm:p-10">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#084c38] to-emerald-700 text-white flex items-center justify-center shadow-md shadow-[#084c38]/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-50 text-[#084c38] text-[11px] font-extrabold uppercase tracking-widest rounded-full border border-emerald-200">
              Interactive Lab
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display mt-0.5">
              React Enterprise Architecture
            </h2>
          </div>
        </div>
        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed font-medium">
          Welcome to the Aptora React Lab. This playground demonstrates building high-performance, enterprise-grade React applications that scale to millions of rows, support highly maintainable structures, and use modern state, rendering, and validation tools.
        </p>
      </div>

      {/* Grid of Key Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Virtual DOM card */}
        <div className="relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-6 flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">Virtual DOM & Reconciliation</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              React creates a lightweight in-memory representation of the real DOM. When state changes, React diffs the old virtual tree with the new one and batches minimal real DOM updates.
            </p>
          </div>
          <Link
            href="/react-lab/virtual-dom"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#084c38] hover:text-[#063b2b] group-hover:translate-x-1 transition-transform"
          >
            Try Interactive Visualizer <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* High Performance 1M List */}
        <div className="relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-6 flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500" />
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">Millions of Data Rows</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              Rendering millions of list items natively will crash the browser. We solve this using DOM Virtualization (Windowing), rendering only what is inside the viewport buffer.
            </p>
          </div>
          <Link
            href="/react-lab/virtual-list"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#084c38] hover:text-[#063b2b] group-hover:translate-x-1 transition-transform"
          >
            Scroll 1,000,000 Rows <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* State Management vs Context */}
        <div className="relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-6 flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-500" />
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">State & Context API</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              React Context API is great for low-frequency updates (e.g. themes), but triggers global tree re-renders for high-frequency state. Learn subscription-based state management patterns.
            </p>
          </div>
          <Link
            href="/react-lab/state-demo"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#084c38] hover:text-[#063b2b] group-hover:translate-x-1 transition-transform"
          >
            Compare Re-renders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Folder Structure & Setup section */}
      <div className="relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-8 sm:p-10">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400" />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#084c38] flex items-center justify-center border border-emerald-200">
            <FolderTree className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-display">Enterprise Folder Structure</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <p className="text-slate-600 text-xs font-medium leading-relaxed mb-4">
              An enterprise application scales not just in runtime performance, but in developer velocity. We structure the project using a highly-scalable, feature-based and layout-based directory architecture:
            </p>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-mono text-xs text-emerald-400 flex flex-col gap-2 shadow-inner">
              <div>├── <span className="text-white font-bold">src/app</span> <span className="text-slate-500"># Next.js App Router Pages & Layouts</span></div>
              <div>├── <span className="text-white font-bold">src/components</span></div>
              <div>│   ├── <span className="text-white font-bold">common</span> <span className="text-slate-500"># Reusable atomic UI (Buttons, Cards, Modals)</span></div>
              <div>│   └── <span className="text-white font-bold">features</span> <span className="text-slate-500"># Feature-specific, non-reusable layout sections</span></div>
              <div>├── <span className="text-white font-bold">src/contexts</span> <span className="text-slate-500"># React Contexts for low-frequency theme/auth data</span></div>
              <div>├── <span className="text-white font-bold">src/hooks</span> <span className="text-slate-500"># Custom hooks for encapsulation & business logic</span></div>
              <div>├── <span className="text-white font-bold">src/store</span> <span className="text-slate-500"># High-frequency subscription state managers</span></div>
              <div>└── <span className="text-white font-bold">src/types</span> <span className="text-slate-500"># Centralized TypeScript definitions & schemas</span></div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div>
              <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-3">Key Architectural Pillars:</h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#084c38] mt-1.5 shrink-0" />
                  <span><strong className="text-slate-900 font-bold">Strict TypeScript Models:</strong> Every API payload, state shape, and component prop is fully typed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#084c38] mt-1.5 shrink-0" />
                  <span><strong className="text-slate-900 font-bold">Environment Decoupling:</strong> Use `.env.local` for local secrets and Next.js public environment variables (`NEXT_PUBLIC_`) for client configs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#084c38] mt-1.5 shrink-0" />
                  <span><strong className="text-slate-900 font-bold">Declarative Forms:</strong> Standardized on `react-hook-form` paired with `zod` for parsing and client-side schemas.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                href="/react-lab/forms"
                className="inline-flex items-center gap-2 bg-[#084c38] hover:bg-[#063b2b] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-[#084c38]/20 border-none"
              >
                <Code2 className="w-4 h-4" /> Explore Enterprise Forms <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


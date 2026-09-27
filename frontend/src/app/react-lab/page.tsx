import Link from "next/link";
import React from "react";

export default function ReactLabOverview() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Intro Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-8 border border-emerald-500/25 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <h2 className="text-3xl font-bold text-white mb-2">React Enterprise Architecture</h2>
        <p className="text-slate-300 max-w-3xl leading-relaxed">
          Welcome to the Aptora React Lab. This playground demonstrates building high-performance, enterprise-grade React applications that scale to millions of rows, support highly maintainable structures, and use modern state, rendering, and validation tools.
        </p>
      </div>

      {/* Grid of Key Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Virtual DOM card */}
        <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="text-3xl mb-3">🌳</div>
            <h3 className="text-lg font-bold text-white mb-2">Virtual DOM & Reconciliation</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              React creates a lightweight in-memory representation of the real DOM. When state changes, React diffs the old virtual tree with the new one and batches minimal real DOM updates.
            </p>
          </div>
          <Link href="/react-lab/virtual-dom" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            Try Interactive Visualizer →
          </Link>
        </div>

        {/* High Performance 1M List */}
        <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-lg font-bold text-white mb-2">Millions of Data Rows</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Rendering millions of list items natively will crash the browser. We solve this using **DOM Virtualization (Windowing)**, rendering only what is inside the viewport buffer.
            </p>
          </div>
          <Link href="/react-lab/virtual-list" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            Scroll 1,000,000 Rows →
          </Link>
        </div>

        {/* State Management vs Context */}
        <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-white mb-2">State & Context API</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              React Context API is great for low-frequency updates (e.g. themes), but triggers global tree re-renders for high-frequency state. Learn subscription-based state management patterns.
            </p>
          </div>
          <Link href="/react-lab/state-demo" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            Compare Re-renders →
          </Link>
        </div>
      </div>

      {/* Folder Structure & Setup section */}
      <div className="bg-slate-950/60 border border-slate-800 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-6">📁 Enterprise Folder Structure</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              An enterprise application scales not just in runtime performance, but in developer velocity. We structure the project using a highly-scalable, feature-based and layout-based directory architecture:
            </p>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono text-xs text-emerald-300 flex flex-col gap-2">
              <div>├── <span className="text-white">src/app</span> <span className="text-slate-500"># Next.js App Router Pages & Layouts</span></div>
              <div>├── <span className="text-white">src/components</span></div>
              <div>│   ├── <span className="text-white">common</span> <span className="text-slate-500"># Reusable atomic UI (Buttons, Cards, Modals)</span></div>
              <div>│   └── <span className="text-white">features</span> <span className="text-slate-500"># Feature-specific, non-reusable layout sections</span></div>
              <div>├── <span className="text-white">src/contexts</span> <span className="text-slate-500"># React Contexts for low-frequency theme/auth data</span></div>
              <div>├── <span className="text-white">src/hooks</span> <span className="text-slate-500"># Custom hooks for encapsulation & business logic</span></div>
              <div>├── <span className="text-white">src/store</span> <span className="text-slate-500"># High-frequency subscription state managers</span></div>
              <div>└── <span className="text-white">src/types</span> <span className="text-slate-500"># Centralized TypeScript definitions & schemas</span></div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-semibold text-sm">Key Architectural Pillars:</h4>
            <ul className="list-disc pl-5 text-sm text-slate-400 space-y-2">
              <li><strong className="text-emerald-400">Strict TypeScript Models:</strong> Every API payload, state shape, and component prop is fully typed.</li>
              <li><strong className="text-emerald-400">Environment Decoupling:</strong> Use `.env.local` for local secrets and Next.js public environment variables (`NEXT_PUBLIC_`) for client configs.</li>
              <li><strong className="text-emerald-400">Declarative Forms:</strong> Standardized on `react-hook-form` paired with `zod` for parsing and client-side schemas.</li>
            </ul>
            <div className="mt-4">
              <Link href="/react-lab/forms" className="inline-block bg-emerald-600 text-white font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 border-none">
                Explore Enterprise Forms →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

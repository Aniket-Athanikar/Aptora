import Link from "next/link";
import React from "react";

export default function ReactLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/25">
              ⚛️
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                ExamForge <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">React Lab</span>
              </h1>
              <p className="text-xs text-slate-400">Enterprise High-Performance Architecture Showcase</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <Link href="/react-lab" className="px-4 py-2 rounded-lg text-sm font-medium hover:text-white text-slate-300 transition-all hover:bg-slate-800">
              Overview
            </Link>
            <Link href="/react-lab/virtual-dom" className="px-4 py-2 rounded-lg text-sm font-medium hover:text-white text-slate-300 transition-all hover:bg-slate-800">
              Virtual DOM
            </Link>
            <Link href="/react-lab/virtual-list" className="px-4 py-2 rounded-lg text-sm font-medium hover:text-white text-slate-300 transition-all hover:bg-slate-800">
              1M List
            </Link>
            <Link href="/react-lab/state-demo" className="px-4 py-2 rounded-lg text-sm font-medium hover:text-white text-slate-300 transition-all hover:bg-slate-800">
              State / Context
            </Link>
            <Link href="/react-lab/forms" className="px-4 py-2 rounded-lg text-sm font-medium hover:text-white text-slate-300 transition-all hover:bg-slate-800">
              Forms
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Sandbox Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950/40 text-center text-xs text-slate-500">
        <p>© 2026 ExamForge React Lab. Built for extreme scalability and optimized client-side interactions.</p>
      </footer>
    </div>
  );
}

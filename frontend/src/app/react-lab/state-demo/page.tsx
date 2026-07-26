"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

// ==========================================
// 1. CONTEXT API SETUP
// ==========================================
interface ContextState {
  countA: number;
  countB: number;
  incrementA: () => void;
  incrementB: () => void;
}

const DemoContext = createContext<ContextState | null>(null);

function DemoContextProvider({ children }: { children: React.ReactNode }) {
  const [countA, setCountA] = useState(0);
  const [countB, setCountB] = useState(0);

  const incrementA = () => setCountA((c) => c + 1);
  const incrementB = () => setCountB((c) => c + 1);

  return (
    <DemoContext.Provider value={{ countA, countB, incrementA, incrementB }}>
      {children}
    </DemoContext.Provider>
  );
}

// ==========================================
// 2. SUBSCRIPTION STORE SETUP (Zustand style)
// ==========================================
class SimpleStore {
  private listeners = new Set<() => void>();
  private state = { countA: 0, countB: 0 };

  getState = () => this.state;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  incrementA = () => {
    this.state = { ...this.state, countA: this.state.countA + 1 };
    this.notify();
  };

  incrementB = () => {
    this.state = { ...this.state, countB: this.state.countB + 1 };
    this.notify();
  };

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

const storeInstance = new SimpleStore();

// Custom subscription hook
function useStoreSelector<T>(selector: (state: typeof storeInstance extends { getState: () => infer S } ? S : never) => T): T {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsubscribe = storeInstance.subscribe(() => {
      forceUpdate((c) => c + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return selector(storeInstance.getState());
}

// ==========================================
// RENDER COUNTER HELPER HOOK
// ==========================================
function useRenderCounter() {
  const count = useRef(0);
  count.current++;
  return count.current;
}

// ==========================================
// SUB-COMPONENTS FOR CONTEXT DEMO
// ==========================================
function ContextConsumerA() {
  const ctx = useContext(DemoContext);
  const renderCount = useRenderCounter();
  if (!ctx) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-indigo-400">Context Consumer A</span>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
          Renders: {renderCount}
        </span>
      </div>
      <div className="text-2xl font-bold text-white">Value A: {ctx.countA}</div>
      <button
        onClick={ctx.incrementA}
        className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
      >
        Increment A
      </button>
    </div>
  );
}

function ContextConsumerB() {
  const ctx = useContext(DemoContext);
  const renderCount = useRenderCounter();
  if (!ctx) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-emerald-400">Context Consumer B</span>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
          Renders: {renderCount}
        </span>
      </div>
      <div className="text-2xl font-bold text-white">Value B: {ctx.countB}</div>
      <button
        onClick={ctx.incrementB}
        className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
      >
        Increment B
      </button>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS FOR SUBSCRIPTION DEMO
// ==========================================
function SubscribedConsumerA() {
  const countA = useStoreSelector((s) => s.countA);
  const renderCount = useRenderCounter();

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-indigo-400">Subscribed Consumer A</span>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
          Renders: {renderCount}
        </span>
      </div>
      <div className="text-2xl font-bold text-white">Value A: {countA}</div>
      <button
        onClick={storeInstance.incrementA}
        className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
      >
        Increment A
      </button>
    </div>
  );
}

function SubscribedConsumerB() {
  const countB = useStoreSelector((s) => s.countB);
  const renderCount = useRenderCounter();

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-emerald-400">Subscribed Consumer B</span>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
          Renders: {renderCount}
        </span>
      </div>
      <div className="text-2xl font-bold text-white">Value B: {countB}</div>
      <button
        onClick={storeInstance.incrementB}
        className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
      >
        Increment B
      </button>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function StateDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white">Context API vs. Subscription Stores</h2>
        <p className="text-slate-400 text-sm">
          Enterprise scaling requires avoiding unnecessary virtual re-renders. See the difference below in re-render counts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Context API Demo */}
        <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white">Option A: React Context API</h3>
          <p className="text-xs text-slate-400">
            Updating *any* state in Context forces *all* consumer components to re-render, even if they only read the unchanged field.
          </p>

          <DemoContextProvider>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <ContextConsumerA />
              <ContextConsumerB />
            </div>
          </DemoContextProvider>

          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs p-3 rounded-lg mt-2">
            💡 Notice: Clicking &quot;Increment A&quot; increments the Renders count of <strong>both</strong> consumer components.
          </div>
        </div>

        {/* Subscription Store Demo */}
        <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white">Option B: Subscription Store (e.g. Zustand)</h3>
          <p className="text-xs text-slate-400">
            Components select slices of state. The store only notifies/re-renders components whose selected values actually change.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <SubscribedConsumerA />
            <SubscribedConsumerB />
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-lg mt-2">
            💡 Notice: Clicking &quot;Increment A&quot; triggers updates <strong>only</strong> for Subscribed Consumer A.
          </div>
        </div>
      </div>
    </div>
  );
}

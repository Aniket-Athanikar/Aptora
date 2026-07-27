"use client";

import React, { useState } from "react";

interface Node {
  id: string;
  type: string;
  label: string;
  color: string;
}

export default function VirtualDomVisualizer() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: "1", type: "Header", label: "Dashboard Header", color: "border-indigo-500" },
    { id: "2", type: "Sidebar", label: "Navigation Items", color: "border-emerald-500" },
    { id: "3", type: "MainContent", label: "Data Grid (100 Rows)", color: "border-amber-500" },
  ]);

  const [logs, setLogs] = useState<string[]>([
    "Initial tree created in memory (Virtual DOM).",
    "Real DOM elements mounted.",
  ]);

  const [highlightedNodes, setHighlightedNodes] = useState<Record<string, boolean>>({});

  const updateNodeLabel = (id: string, newLabel: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          return { ...n, label: newLabel };
        }
        return n;
      })
    );

    // Track Virtual DOM difference
    setLogs((prev) => [
      ...prev,
      `State updated. Virtual DOM reconstructed for Node #${id}.`,
      `Diffing: Node #${id} label changed -> "${newLabel}".`,
      `Reconciliation: Batched update applied to real DOM element #${id} ONLY. No other elements repainted.`,
    ]);

    // Flash highlight on DOM update
    setHighlightedNodes((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setHighlightedNodes((prev) => ({ ...prev, [id]: false }));
    }, 1000);
  };

  const addNode = () => {
    const newId = (nodes.length + 1).toString();
    const newNode: Node = {
      id: newId,
      type: "Card",
      label: `New Widget ${newId}`,
      color: "border-pink-500",
    };
    setNodes((prev) => [...prev, newNode]);

    setLogs((prev) => [
      ...prev,
      `New node added to state tree.`,
      `Diffing: Detected additional child in container.`,
      `Reconciliation: Appending single child element to parent list.`,
    ]);

    setHighlightedNodes((prev) => ({ ...prev, [newId]: true }));
    setTimeout(() => {
      setHighlightedNodes((prev) => ({ ...prev, [newId]: false }));
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white">Virtual DOM & Reconciliation Simulator</h2>
        <p className="text-slate-400 text-sm">
          Interact with the tree state below to visualize how React minimizes browser repaints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Controls & Simulated Virtual Tree */}
        <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">1. Virtual DOM (State Tree)</h3>
            <button
              onClick={addNode}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              + Add Component
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`bg-slate-900/60 p-4 rounded-xl border-l-4 ${node.color} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                <div>
                  <span className="text-xs font-mono text-slate-500">[{node.type}]</span>
                  <div className="text-sm font-semibold text-white">{node.label}</div>
                </div>
                <input
                  type="text"
                  value={node.label}
                  onChange={(e) => updateNodeLabel(node.id, e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 max-w-[200px]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Real DOM Paint Simulator */}
        <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-white">2. Real DOM Paint Simulation</h3>

          <div className="bg-slate-950 rounded-xl p-6 border border-slate-900 min-h-[220px] flex flex-col gap-4 relative">
            <div className="absolute top-2 right-3 text-[10px] text-slate-600 font-mono">browser rendering layer</div>
            
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`p-3 rounded-lg border border-slate-800 bg-slate-900/40 transition-all duration-300 ${
                  highlightedNodes[node.id] ? "bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/50 scale-[1.01]" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${highlightedNodes[node.id] ? "bg-indigo-400 animate-ping" : "bg-slate-600"}`} />
                  <span className="text-xs font-semibold text-slate-300 font-mono">
                    &lt;div id=&quot;{node.id}&quot;&gt;
                  </span>
                </div>
                <div className="pl-6 text-sm text-white py-1">{node.label}</div>
                <span className="text-xs text-slate-500 font-mono">&lt;/div&gt;</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logs and Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-950/40 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
          <h3 className="text-base font-semibold text-white">Reconciliation Reconciliation Log</h3>
          <div className="bg-slate-900/50 p-4 rounded-xl font-mono text-xs text-indigo-400 h-48 overflow-y-auto flex flex-col gap-1.5 border border-slate-800">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-slate-600">[{idx + 1}]</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Did You Know?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard browser DOM manipulation is slow because it causes <strong>reflows</strong> (calculating layout positions) and <strong>repaints</strong> (drawing layout pixels) on every tiny mutation. React compiles virtual state trees, matches differences, and executes batch mutations in one paint cycle, yielding huge speed benefits.
            </p>
          </div>
          <div className="text-[11px] text-slate-500 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 font-mono">
            Complexity: O(n) heuristic diffing algorithm based on keyed elements.
          </div>
        </div>
      </div>
    </div>
  );
}

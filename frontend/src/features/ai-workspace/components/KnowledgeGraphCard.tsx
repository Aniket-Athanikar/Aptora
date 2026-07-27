"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, HelpCircle, FileText, ArrowRight, Library, Layers } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: "book" | "chapter" | "topic" | "concept" | "question" | "notes";
  details: string;
}

const GRAPH_NODES: GraphNode[] = [
  { id: "node-1", label: "Indian Polity", type: "book", details: "Core resource book for constitutional studies." },
  { id: "node-2", label: "Chapter 5: Fundamental Rights", type: "chapter", details: "Articles 12-35. Part III of the Constitution." },
  { id: "node-3", label: "Article 32 remedies", type: "topic", details: "Right to Constitutional Remedies & Supreme Court Writ powers." },
  { id: "node-4", label: "Writ of Mandamus", type: "concept", details: "A command issued to public officials or bodies to perform duties." },
  { id: "node-5", label: "Practice Quiz: 10 MCQ", type: "question", details: "Active recall test focusing on Article 32 writ exceptions." },
  { id: "node-6", label: "Constitutional Writs CheatSheet", type: "notes", details: "Quick summary of all 5 writs for revision." }
];

export function KnowledgeGraphCard() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(GRAPH_NODES[2]);

  return (
    <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4.5">
        <div className="bg-purple-50 text-purple-600 p-1.5 rounded-lg border border-purple-100">
          <Network className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Concept Knowledge Graph</h4>
          <p className="text-[10px] text-gray-400">Trace interconnections of study items</p>
        </div>
      </div>

      {/* Mini Interactive SVG Graph layout with Framer Motion hover/click nodes */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 min-h-[220px] relative flex flex-col justify-between overflow-hidden">
        {/* Nodes and Flow Connectors visual layout */}
        <div className="flex flex-col gap-3 relative z-10">
          {GRAPH_NODES.map((node, index) => {
            const isSelected = selectedNode?.id === node.id;
            
            return (
              <div key={node.id} className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setSelectedNode(node)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left border transition-all ${
                    isSelected
                      ? "bg-purple-600 border-purple-700 text-white shadow-md shadow-purple-150"
                      : "bg-white border-slate-200 text-slate-700 hover:border-purple-250"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    node.type === "book" ? "bg-red-400" :
                    node.type === "chapter" ? "bg-amber-400" :
                    node.type === "topic" ? "bg-purple-400" :
                    node.type === "concept" ? "bg-blue-400" :
                    node.type === "question" ? "bg-emerald-400" : "bg-pink-400"
                  }`} />
                  <span className="text-[10px] font-black tracking-tight">{node.label}</span>
                  <span className="text-[8px] opacity-60 uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-slate-100/10 border border-slate-200/10">
                    {node.type}
                  </span>
                </motion.button>

                {index < GRAPH_NODES.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Node Drawer */}
        <AnimatePresence mode="wait">
          {selectedNode && (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 bg-white/80 border border-purple-100 rounded-xl p-3.5 backdrop-blur-md relative z-10"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded">
                  {selectedNode.type}
                </span>
                <h5 className="text-[11px] font-bold text-gray-800">{selectedNode.label}</h5>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">{selectedNode.details}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      </div>
    </div>
  );
}

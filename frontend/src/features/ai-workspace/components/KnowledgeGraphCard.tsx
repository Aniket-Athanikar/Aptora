"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, ArrowRight } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: "book" | "chapter" | "topic" | "concept" | "question" | "notes";
  details: string;
  x: number;
  y: number;
}

const GRAPH_NODES: GraphNode[] = [
  { id: "node-1", label: "Indian Polity", type: "book", details: "Core resource book for constitutional studies.", x: 10, y: 15 },
  { id: "node-2", label: "Chapter 5: Rights", type: "chapter", details: "Articles 12-35. Part III of the Constitution.", x: 30, y: 55 },
  { id: "node-3", label: "Article 32 remedies", type: "topic", details: "Right to Constitutional Remedies & Writ powers.", x: 50, y: 25 },
  { id: "node-4", label: "Writ of Mandamus", type: "concept", details: "A command issued to public officials or bodies.", x: 70, y: 65 },
  { id: "node-5", label: "MCQ Practice Quiz", type: "question", details: "Active recall test focusing on Article 32 writs.", x: 90, y: 35 }
];

export function KnowledgeGraphCard() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(GRAPH_NODES[2]);

  return (
    <div className="bg-white border border-purple-100/60 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-purple-50 text-purple-600 p-2 rounded-xl border border-purple-100/60">
          <Network className="w-5 h-5 animate-pulse-subtle" />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider leading-none">Concept Knowledge Graph</h4>
          <p className="text-[10px] text-slate-400 mt-1">Trace interactive connection links between syllabus concepts</p>
        </div>
      </div>

      <div className="bg-slate-50/60 border border-slate-100 rounded-3xl p-5 min-h-[250px] relative flex flex-col justify-between overflow-hidden">

        {/* Custom Interactive SVG Graph Map */}
        <div className="relative h-28 w-full select-none">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#933de9ff" />
                <stop offset="100%" stopColor="#272758ff" />
              </linearGradient>
            </defs>
            {/* Draw connecting lines between sequential nodes */}
            {GRAPH_NODES.map((node, idx) => {
              if (idx === GRAPH_NODES.length - 1) return null;
              const nextNode = GRAPH_NODES[idx + 1];
              return (
                <motion.line
                  key={`line-${idx}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${nextNode.x}%`}
                  y2={`${nextNode.y}%`}
                  stroke="url(#lineGrad)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -20 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              );
            })}
          </svg>

          {/* Node Button Elements positioned on coordinate percentages */}
          {GRAPH_NODES.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const nodeColors =
              node.type === "book" ? "bg-red-500" :
                node.type === "chapter" ? "bg-amber-500" :
                  node.type === "topic" ? "bg-purple-500" :
                    node.type === "concept" ? "bg-blue-500" :
                      node.type === "question" ? "bg-emerald-500" : "bg-pink-500";

            return (
              <motion.button
                key={node.id}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onClick={() => setSelectedNode(node)}
                whileHover={{ scale: 1.25 }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${isSelected ? "bg-purple-600 border-white shadow-lg ring-4 ring-purple-100" : `${nodeColors} border-white shadow-sm hover:shadow`
                  }`}
                title={node.label}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </motion.button>
            );
          })}
        </div>

        {/* Selected Node Details Area */}
        <AnimatePresence mode="wait">
          {selectedNode && (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 bg-white border border-purple-100/60 rounded-2xl p-4 shadow-sm relative z-10"
            >
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[8px] font-black uppercase tracking-wider text-purple-650 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">
                  {selectedNode.type}
                </span>
                <h5 className="text-[11px] font-black text-slate-800">{selectedNode.label}</h5>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{selectedNode.details}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      </div>
    </div>
  );
}

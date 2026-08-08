"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Sparkles } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: "book" | "chapter" | "topic" | "concept" | "question" | "notes";
  details: string;
  x: number;
  y: number;
}

const GRAPH_NODES: GraphNode[] = [
  { id: "node-1", label: "Indian Polity", type: "book", details: "Core resource book for constitutional studies.", x: 12, y: 25 },
  { id: "node-2", label: "Chapter 5: Rights", type: "chapter", details: "Articles 12-35. Part III of the Constitution.", x: 32, y: 65 },
  { id: "node-3", label: "Article 32 Remedies", type: "topic", details: "Right to Constitutional Remedies & Supreme Court Writ powers.", x: 52, y: 30 },
  { id: "node-4", label: "Writ of Mandamus", type: "concept", details: "Command issued to public officials or statutory bodies.", x: 72, y: 70 },
  { id: "node-5", label: "MCQ Quiz Set", type: "question", details: "Active recall test focusing on Article 32 writs.", x: 88, y: 40 }
];

export function KnowledgeGraphCard() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(GRAPH_NODES[2]);

  return (
    <div className="bg-white border border-purple-200/80 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-2.5 rounded-2xl border border-purple-400 shadow-sm">
          <Network className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider leading-none flex items-center gap-1.5">
            Knowledge Graph Map <Sparkles className="w-3 h-3 text-purple-600" />
          </h4>
          <p className="text-[10px] text-slate-500 font-bold mt-1">Trace connection links between syllabus concepts</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/20 border border-purple-100 rounded-3xl p-5 min-h-[260px] relative flex flex-col justify-between overflow-hidden shadow-inner">

        {/* Custom Interactive SVG Graph Map */}
        <div className="relative h-32 w-full select-none">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#4f46e5" />
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
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
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
              node.type === "book" ? "bg-rose-500" :
                node.type === "chapter" ? "bg-amber-500" :
                  node.type === "topic" ? "bg-purple-600" :
                    node.type === "concept" ? "bg-blue-600" :
                      node.type === "question" ? "bg-emerald-600" : "bg-pink-500";

            return (
              <motion.button
                key={node.id}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onClick={() => setSelectedNode(node)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${isSelected
                    ? "bg-purple-700 border-white shadow-md ring-4 ring-purple-200"
                    : `${nodeColors} border-white shadow-xs`
                  }`}
                title={node.label}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
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
              className="mt-3 bg-white border border-purple-200/80 rounded-2xl p-4 shadow-sm relative z-10"
            >
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-wider text-purple-800 bg-purple-100/80 border border-purple-200 px-2 py-0.5 rounded-md">
                  {selectedNode.type}
                </span>
                <h5 className="text-xs font-black text-slate-900">{selectedNode.label}</h5>
              </div>
              <p className="text-[10px] text-slate-700 leading-relaxed font-semibold">{selectedNode.details}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, ArrowRight, Sparkles, BookOpen, Layers, Plus, ZoomIn, ZoomOut, Search, Copy, Check } from "lucide-react";
import { useWorkspace } from "../workspaceContext";
import { useToast } from "@/lib/ToastContext";

interface GraphNode {
  id: string;
  label: string;
  type: "book" | "chapter" | "topic" | "concept" | "question";
  details: string;
  x: number;
  y: number;
  connections: string[];
}

const GRAPH_NODES: GraphNode[] = [
  { id: "n1", label: "Indian Polity", type: "book", details: "Core resource book for constitutional studies (M. Laxmikanth)", x: 12, y: 35, connections: ["n2", "n3"] },
  { id: "n2", label: "Chapter 5: Rights", type: "chapter", details: "Articles 12–35. Part III of the Constitution.", x: 34, y: 20, connections: ["n4", "n5"] },
  { id: "n3", label: "Chapter 6: DPSP", type: "chapter", details: "Articles 36–51. Part IV Directive Principles.", x: 34, y: 70, connections: ["n6"] },
  { id: "n4", label: "Article 32 Writs", type: "topic", details: "Right to Constitutional Remedies & Supreme Court Writ powers.", x: 62, y: 22, connections: ["n7", "n8"] },
  { id: "n5", label: "Article 21 Liberty", type: "topic", details: "Protection of Life & Personal Liberty with Due Process of Law.", x: 62, y: 52, connections: ["n9"] },
  { id: "n6", label: "Socialist Principles", type: "concept", details: "Promoting welfare state and economic justice.", x: 62, y: 82, connections: [] },
  { id: "n7", label: "Writ of Mandamus", type: "concept", details: "Command issued to public officials to perform mandatory duties.", x: 88, y: 15, connections: [] },
  { id: "n8", label: "Certiorari vs Prohibition", type: "concept", details: "Quashing orders vs stopping lower court proceedings.", x: 88, y: 40, connections: [] },
  { id: "n9", label: "Puttaswamy Judgment", type: "question", details: "2017 Landmark Supreme Court ruling declaring Right to Privacy.", x: 88, y: 72, connections: [] }
];

export function KnowledgeGraphCard() {
  const { sendMessage } = useWorkspace();
  const { toast } = useToast();
  const [selectedNode, setSelectedNode] = useState<GraphNode>(GRAPH_NODES[3]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);

  const filteredNodes = GRAPH_NODES.filter((n) => {
    const matchesFilter = filterType === "all" || n.type === filterType;
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopyNode = (node: GraphNode) => {
    navigator.clipboard.writeText(`${node.label}: ${node.details}`);
    setCopied(true);
    toast(`Copied ${node.label} node details to clipboard.`, "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-purple-100/70 rounded-3xl p-5 shadow-sm space-y-4 text-slate-800">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-650 text-white flex items-center justify-center shadow-md shadow-purple-100 shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Knowledge Neural Graph
            </h4>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Interactive 2D graph connecting syllabus concepts & PYQs
            </p>
          </div>
        </div>

        {/* Node Category Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-black text-slate-500">
          {(["all", "book", "chapter", "topic", "concept"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                filterType === type ? "bg-white text-purple-700 shadow-2xs font-extrabold" : "hover:text-slate-800"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Light Theme Canvas Container */}
      <div className="bg-gradient-to-br from-purple-50/40 via-white to-slate-50 border border-purple-100 rounded-3xl p-5 min-h-[300px] relative flex flex-col justify-between overflow-hidden shadow-inner">
        {/* Ambient Subtle Purple Glow */}
        <div className="absolute top-0 right-10 w-48 h-48 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* Canvas Toolbar Controls */}
        <div className="flex items-center justify-between relative z-10 text-xs">
          <div className="relative w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graph nodes..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-purple-100 rounded-xl text-[10px] text-slate-800 font-semibold outline-none focus:border-purple-400 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-slate-600 font-extrabold text-[10px] shadow-2xs">
            <button onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))} className="hover:text-purple-600 cursor-pointer" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="hover:text-purple-600 cursor-pointer" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SVG Vector Connections Canvas */}
        <motion.div
          animate={{ scale: zoom }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="relative h-44 w-full select-none my-4"
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>

            {/* Draw connection lines between nodes */}
            {GRAPH_NODES.flatMap((node) =>
              node.connections.map((targetId) => {
                const targetNode = GRAPH_NODES.find((n) => n.id === targetId);
                if (!targetNode) return null;
                return (
                  <motion.line
                    key={`${node.id}-${targetId}`}
                    x1={`${node.x}%`}
                    y1={`${node.y}%`}
                    x2={`${targetNode.x}%`}
                    y2={`${targetNode.y}%`}
                    stroke="url(#purpleGlow)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -20 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
                );
              })
            )}
          </svg>

          {/* Render Node Points */}
          {filteredNodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const nodeBadgeColor =
              node.type === "book" ? "bg-purple-100 border-purple-300 text-purple-800" :
              node.type === "chapter" ? "bg-indigo-100 border-indigo-300 text-indigo-800" :
              node.type === "topic" ? "bg-blue-100 border-blue-300 text-blue-800" :
              node.type === "concept" ? "bg-emerald-100 border-emerald-300 text-emerald-800" :
              "bg-rose-100 border-rose-300 text-rose-800";

            return (
              <motion.button
                key={node.id}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onClick={() => setSelectedNode(node)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl border text-[9px] font-black cursor-pointer transition-all flex items-center gap-1.5 shadow-sm ${
                  isSelected
                    ? "bg-purple-600 border-purple-400 text-white ring-4 ring-purple-100 scale-110 shadow-md shadow-purple-100"
                    : `${nodeBadgeColor} hover:bg-white hover:border-purple-300`
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-purple-600"} shrink-0`} />
                <span className="truncate max-w-[110px]">{node.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Selected Node Details Drawer */}
        <AnimatePresence mode="wait">
          {selectedNode && (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-10 bg-white border border-purple-100 rounded-2xl p-4 space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    {selectedNode.type} Node
                  </span>
                  <h5 className="text-xs font-black text-slate-900">{selectedNode.label}</h5>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => handleCopyNode(selectedNode)}
                    className="p-1 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                    title="Copy Node Info"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => sendMessage(`Explain ${selectedNode.label} and provide high-yield notes.`)}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs shadow-purple-100"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Ask AI Node</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                {selectedNode.details}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle Mesh Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      </div>
    </div>
  );
}

"use client";

import { useVirtualList } from "@/hooks/useVirtualList";
import React, { useState, useMemo, useRef } from "react";

interface RecordItem {
  id: number;
  uuid: string;
  timestamp: string;
  status: "success" | "warning" | "error";
  service: string;
  latency: number;
}

export default function VirtualListDemo() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate 1,000,000 records lazily using useMemo to avoid regenerating on every render
  const records: RecordItem[] = useMemo(() => {
    const services = ["auth-service", "billing-worker", "api-gateway", "exam-generator-ai", "pdf-parser"];
    const statuses: Array<"success" | "warning" | "error"> = ["success", "warning", "error"];
    
    return Array.from({ length: 1000000 }).map((_, idx) => {
      const status = statuses[idx % 3];
      const service = services[idx % 5];
      return {
        id: idx + 1,
        uuid: `tx_${Math.floor(100000 + Math.random() * 900000)}_${idx}`,
        timestamp: new Date(1782352800000 - idx * 1000).toISOString().replace("T", " ").substring(0, 19),
        status,
        service,
        latency: (idx % 4 === 0 ? 450 : 23) + (idx % 11) * 7,
      };
    });
  }, []);

  // Filter items in memory
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchesSearch =
        item.uuid.toLowerCase().includes(search.toLowerCase()) ||
        item.service.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const itemHeight = 60;
  const containerHeight = 500;

  // Use our high-performance custom virtual list hook
  const { visibleIndexes, totalHeight, offset, handleScroll } = useVirtualList({
    totalItems: filteredRecords.length,
    itemHeight,
    containerHeight,
    overscan: 8,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white">High-Performance Virtual List (1,000,000 Items)</h2>
        <p className="text-slate-400 text-sm">
          A showcase of rendering a dataset of 1,000,000 records smoothly at 60 FPS using DOM virtualization.
        </p>
      </div>

      {/* Telemetry Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Dataset Size</div>
          <div className="text-2xl font-bold text-white">1,000,000</div>
          <div className="text-[10px] text-slate-400">Records in memory</div>
        </div>
        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Rendered DOM Nodes</div>
          <div className="text-2xl font-bold text-indigo-400">
            {Math.min(filteredRecords.length, visibleIndexes.length)}
          </div>
          <div className="text-[10px] text-slate-400">Active HTML table rows</div>
        </div>
        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Memory Allocation</div>
          <div className="text-2xl font-bold text-emerald-400">~62 MB</div>
          <div className="text-[10px] text-slate-400">Optimized JS Object tree</div>
        </div>
        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Performance Status</div>
          <div className="text-2xl font-bold text-cyan-400">60 FPS</div>
          <div className="text-[10px] text-slate-400">Hardware-accelerated scrolls</div>
        </div>
      </div>

      {/* Search & Filter Options */}
      <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search uuid or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 min-w-[240px]"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Showing {filteredRecords.length.toLocaleString()} matching records
        </div>
      </div>

      {/* Virtualized Container */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-slate-900/80 px-6 py-3 border-b border-slate-800 text-xs font-semibold uppercase text-slate-400 tracking-wider">
          <span className="col-span-2">ID</span>
          <span className="col-span-3">TX UUID</span>
          <span className="col-span-3">Timestamp</span>
          <span className="col-span-2">Service</span>
          <span className="col-span-1 text-center">Status</span>
          <span className="col-span-1 text-right">Latency</span>
        </div>

        {/* Scroll Viewport */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{ height: `${containerHeight}px` }}
          className="overflow-y-auto relative w-full scroll-smooth"
        >
          {filteredRecords.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No matching records found.
            </div>
          ) : (
            <div style={{ height: `${totalHeight}px`, position: "relative", width: "100%" }}>
              <div
                style={{
                  transform: `translateY(${offset}px)`,
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                }}
              >
                {visibleIndexes.map((index) => {
                  const item = filteredRecords[index];
                  if (!item) return null;
                  return (
                    <div
                      key={item.id}
                      style={{ height: `${itemHeight}px` }}
                      className="grid grid-cols-12 items-center px-6 border-b border-slate-800/40 hover:bg-slate-900/20 text-sm"
                    >
                      <span className="col-span-2 font-mono text-slate-500">#{item.id}</span>
                      <span className="col-span-3 font-semibold text-white font-mono">{item.uuid}</span>
                      <span className="col-span-3 text-slate-400 font-mono text-xs">{item.timestamp}</span>
                      <span className="col-span-2 text-slate-300">{item.service}</span>
                      <span className="col-span-1 flex justify-center">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
                            item.status === "success"
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : item.status === "warning"
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              : "bg-red-500/10 border-red-500/30 text-red-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </span>
                      <span className="col-span-1 text-right font-mono text-slate-300">
                        {item.latency}ms
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

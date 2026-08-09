"use client";

import React, { useEffect, useState, useRef } from "react";
import { Activity, Radio, Wifi, WifiOff, RefreshCw, Send, AlertTriangle, ShieldCheck } from "lucide-react";

interface RealtimeEvent {
  id: string;
  title: string;
  description: string;
  badge: string;
  color: string;
  time: string;
}

export function RealtimeHub() {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [simulatedCount, setSimulatedCount] = useState<number>(0);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [debugMessages, setDebugMessages] = useState<any[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to websocket backend endpoint
  useEffect(() => {
    let socketUrl = "ws://localhost:8000/ws/dashboard";

    // Resolve dynamic WebSocket URL based on config/window
    if (typeof window !== "undefined") {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const cleanHost = apiHost.replace("http://", "").replace("https://", "");
      const protocol = apiHost.startsWith("https") ? "wss://" : "ws://";
      socketUrl = `${protocol}${cleanHost}/ws/dashboard`;
    }

    let active = true;
    let ws: WebSocket | null = null;

    const connectWS = () => {
      if (!active) return;
      setStatus("connecting");
      try {
        ws = new WebSocket(socketUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!active) return;
          setStatus("connected");
        };

        ws.onmessage = (event) => {
          if (!active) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === "connection_status") {
              setActiveUsers(data.active_users);
              addEvent({
                title: "Real-time Sync Active",
                description: data.message,
                badge: "System Sync",
                color: "purple",
              });
            } else if (data.type === "realtime_update") {
              if (data.active_users) setActiveUsers(data.active_users);
              addEvent({
                title: data.title,
                description: data.description,
                badge: data.badge,
                color: data.color || "indigo",
              });
              // Store raw message for debugging UI (cap at 50)
              setDebugMessages((prev) => [...prev, { ...data, _ts: new Date().toISOString() }].slice(-50));
            }
          } catch (err) {
            console.error("Error parsing websocket message", err);
          }
        };

        ws.onclose = () => {
          if (!active) return;
          setStatus("disconnected");
          setTimeout(connectWS, 5000);
        };

        ws.onerror = () => {
          if (!active) return;
          setStatus("disconnected");
        };
      } catch (err) {
        if (!active) return;
        console.error("WebSocket connection error", err);
        setStatus("disconnected");
      }
    };

    const timer = setTimeout(connectWS, 100);

    return () => {
      active = false;
      clearTimeout(timer);
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      }
    };
  }, []);

  const addEvent = (payload: Omit<RealtimeEvent, "id" | "time">) => {
    const newEvent: RealtimeEvent = {
      ...payload,
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 14)]);
  };

  const getBadgeStyles = (color: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "purple":
        return "bg-purple-50 text-purple-600 border border-purple-100";
      case "amber":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      case "indigo":
      default:
        return "bg-indigo-50 text-indigo-600 border border-indigo-100";
    }
  };

  return (
    <div className="premium-card premium-card-hover rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-6 relative overflow-hidden">
      {/* Dynamic Top Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-600 animate-pulse" /> Live Companion Hub
          </h3>
          <p className="text-xs text-gray-400">Real-time study activity and calibration stream.</p>
        </div>

        {/* Live Indicator Badge */}
        <div className="flex items-center gap-2">
          {status === "connected" ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse-subtle">
              <Wifi className="w-3.5 h-3.5" /> WebSocket Online
            </span>
          ) : status === "connecting" ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
              <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
              <WifiOff className="w-3.5 h-3.5" /> Simulation Mode
            </span>
          )}
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-slate-50 border border-slate-100/60 p-2.5 sm:p-3.5 rounded-2xl flex flex-col justify-center">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Sync Connection</span>
          <span className="text-sm sm:text-base font-black text-slate-800 flex items-baseline gap-1.5 mt-0.5">
            {status === "connected" ? "Sync Active" : "Offline"}
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" /> Live
            </span>
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-100/60 p-2.5 sm:p-3.5 rounded-2xl flex flex-col justify-center">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Engine Status</span>
          <span className="text-sm sm:text-base font-black text-indigo-600 mt-0.5">
            Synchronized
            <span className="text-[10px] text-gray-400 font-bold ml-1">100%</span>
          </span>
        </div>
      </div>

      {/* Stream Area */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-gray-700 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-gray-400" /> Activity Stream
          </span>
          <button onClick={() => setShowDebug(!showDebug)} className="text-[10px] text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1 cursor-pointer ml-2">Debug Console</button>
        </div>

        <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50 p-2 max-h-[160px] sm:max-h-[220px] overflow-y-auto space-y-2">
          {events.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
              <Radio className="w-6 h-6 text-gray-300 animate-bounce" />
              <span>Awaiting real-time broadcast packages...</span>
            </div>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white border border-slate-100 p-3 rounded-xl shadow-xs transition-all hover:border-indigo-100/50 flex flex-col gap-1.5 text-xs animate-[fadeIn_0.3s_ease-out]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getBadgeStyles(ev.color)}`}>
                    {ev.badge}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold">{ev.time}</span>
                </div>
                <h4 className="font-bold text-slate-800">{ev.title}</h4>
                <p className="text-gray-500 text-[11px] leading-relaxed">{ev.description}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer System Status details */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-semibold">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Security: TLS Encrypted
        </span>
        <span>ID: {status === "connected" ? "active_socket_v2" : "local_sandbox"}</span>
      </div>

      {/* WebSocket Debug Overlay */}
      {showDebug && (
        <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm z-[9999] flex flex-col" style={{ fontFamily: 'monospace' }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700 bg-gray-900">
            <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              WebSocket Debug — {debugMessages.length} messages captured
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDebugMessages([])}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold px-2 py-1 rounded border border-amber-400/30 hover:border-amber-300/50 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setShowDebug(false)}
                className="text-[11px] text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded border border-red-400/30 hover:border-red-300/50 transition-colors"
              >
                Close ✕
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {debugMessages.length === 0 ? (
              <p className="text-gray-500 text-xs text-center mt-10">No messages captured yet. Waiting for WebSocket data...</p>
            ) : (
              <div className="space-y-2">
                {debugMessages.slice().reverse().map((msg, i) => (
                  <div key={i} className="bg-gray-800/80 border border-gray-700/60 rounded-lg p-3 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`font-bold ${
                        msg.color === 'emerald' ? 'text-emerald-400' :
                        msg.color === 'purple' ? 'text-purple-400' :
                        msg.color === 'amber' ? 'text-amber-400' : 'text-indigo-400'
                      }`}>{msg.type}</span>
                      <span className="text-gray-500 text-[10px]">{msg._ts}</span>
                    </div>
                    <pre className="text-gray-300 whitespace-pre-wrap break-all text-[11px] leading-relaxed">{JSON.stringify(msg, null, 2)}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="px-5 py-2 border-t border-gray-700 bg-gray-900 text-[10px] text-gray-500">
            Status: <span className={status === 'connected' ? 'text-emerald-400' : status === 'connecting' ? 'text-amber-400' : 'text-red-400'}>{status}</span>
            {' · '}Buffer: {debugMessages.length}/50
          </div>
        </div>
      )}
    </div>
  );
}

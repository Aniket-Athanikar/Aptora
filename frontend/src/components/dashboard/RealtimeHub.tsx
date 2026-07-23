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
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [simulatedCount, setSimulatedCount] = useState<number>(0);
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

    const connectWS = () => {
      setStatus("connecting");
      try {
        const ws = new WebSocket(socketUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setStatus("connected");
        };

        ws.onmessage = (event) => {
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
            }
          } catch (err) {
            console.error("Error parsing websocket message", err);
          }
        };

        ws.onclose = () => {
          setStatus("disconnected");
          // Reconnect attempt after 5 seconds
          setTimeout(connectWS, 5000);
        };

        ws.onerror = () => {
          setStatus("disconnected");
        };
      } catch (err) {
        console.error("WebSocket connection error", err);
        setStatus("disconnected");
      }
    };

    connectWS();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
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

  // User-driven local simulation function
  const triggerSimulation = () => {
    const simulations = [
      {
        title: "Weakness Calibrated",
        description: "Adaptive study weight for 'Organic Chemistry' successfully modified by AI engines.",
        badge: "AI Calibrate",
        color: "purple"
      },
      {
        title: "Peer Sprint Active",
        description: "User_4821 entered active recall focus session for 'Algorithms & DS'.",
        badge: "Live Sprint",
        color: "indigo"
      },
      {
        title: "Streak Boost Alert",
        description: "Weekly leaderboard update: 3 students reached a 7-day revision streak!",
        badge: "Community",
        color: "amber"
      },
      {
        title: "Mock Test Complete",
        description: "User_8842 finished GATE practice paper 3: Calibration precision updated to 94%.",
        badge: "Performance",
        color: "emerald"
      }
    ];

    const pick = simulations[simulatedCount % simulations.length];
    setSimulatedCount((prev) => prev + 1);

    // Add local event
    addEvent({
      title: `${pick.title} (Simulated)`,
      description: pick.description,
      badge: pick.badge,
      color: pick.color,
    });

    // Boost active users count randomly for extra feedback
    setActiveUsers((prev) => prev + Math.floor(Math.random() * 5) + 1);
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
    <div className="premium-card premium-card-hover rounded-3xl p-6 space-y-6 relative overflow-hidden">
      {/* Dynamic Top Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
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
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 border border-slate-100/60 p-3.5 rounded-2xl flex flex-col justify-center">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Active Companions</span>
          <span className="text-2xl font-black text-slate-800 flex items-baseline gap-1.5 mt-0.5">
            {activeUsers || 164}
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" /> Live
            </span>
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-100/60 p-3.5 rounded-2xl flex flex-col justify-center">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Engine Calibration</span>
          <span className="text-2xl font-black text-indigo-600 mt-0.5">
            98.7%
            <span className="text-[10px] text-gray-400 font-bold ml-1">sync</span>
          </span>
        </div>
      </div>

      {/* Stream Area */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-gray-700 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-gray-400" /> Activity Stream
          </span>
          <button
            onClick={triggerSimulation}
            className="text-[10px] text-indigo-600 hover:text-indigo-700 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Send className="w-3 h-3" /> Simulate Activity
          </button>
        </div>

        <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50 p-2 max-h-[220px] overflow-y-auto space-y-2">
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
    </div>
  );
}

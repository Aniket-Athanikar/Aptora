import React from "react";
import CountUp from "react-countup";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export function StatCard({ title, value, suffix = "", icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-150 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${bgColor}`} />

      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-gray-900 flex items-baseline">
            <CountUp end={value} duration={1.8} separator="," />
            <span className="text-xs font-bold text-gray-500 ml-1">{suffix}</span>
          </h3>
        </div>
        <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${bgColor} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

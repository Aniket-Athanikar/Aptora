import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Achievement } from "../achievementEngine";

interface UnlockModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function UnlockModal({ achievement, onClose }: UnlockModalProps) {
  useEffect(() => {
    if (achievement) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav");
      audio.volume = 0.15;
      audio.play().catch(() => {});
    }
  }, [achievement]);

  const IconComponent = achievement ? ((LucideIcons as any)[achievement.icon] || LucideIcons.Award) : null;

  const particles = React.useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      angle: Math.random() * Math.PI * 2,
      velocity: Math.random() * 220 + 80,
      scale: Math.random() * 0.7 + 0.3,
      rotation: Math.random() * 720 - 360,
      color: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6", "#F43F5E"][i % 6],
      shape: Math.random() > 0.55 ? "circle" : "square",
    }));
  }, [achievement]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        {/* Framer Motion Confetti Burst particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
          {particles.map((p) => {
            const destX = Math.cos(p.angle) * p.velocity;
            const destY = Math.sin(p.angle) * p.velocity + 80;
            return (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                animate={{
                  x: destX,
                  y: destY,
                  scale: p.scale,
                  opacity: [1, 1, 0],
                  rotate: p.rotation,
                }}
                transition={{
                  duration: 1.8,
                  ease: "easeOut",
                }}
                className={`absolute w-3.5 h-3.5 pointer-events-none ${
                  p.shape === "circle" ? "rounded-full" : "rounded-xs"
                }`}
                style={{
                  backgroundColor: p.color,
                }}
              />
            );
          })}
        </div>

        <motion.div
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 280 }}
          className="bg-white border border-gray-100 max-w-sm w-full rounded-3xl p-6 text-center relative shadow-2xl overflow-hidden"
        >
          {/* Confetti Glow Background */}
          <div className="absolute -top-16 -left-16 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 text-gray-400 hover:text-gray-600 rounded-xl transition-colors"
          >
            <LucideIcons.X className="w-4.5 h-4.5" />
          </button>

          <div className="space-y-5 pt-3">
            <div className="relative inline-block">
              {/* Spinning/Pulsing Glow */}
              <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl scale-125 animate-pulse" />
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-4xl shadow-lg relative z-10 mx-auto">
                {IconComponent && <IconComponent className="w-10 h-10" />}
              </div>
              <LucideIcons.Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
              <LucideIcons.Trophy className="w-5 h-5 text-indigo-600 absolute -bottom-1 -left-1 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] bg-amber-100 border border-amber-200 text-amber-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                🎉 Achievement Unlocked!
              </span>
              <h3 className="text-xl font-black text-gray-900 pt-1">
                {achievement.title}
              </h3>
              <p className="text-xs text-gray-500 max-w-[240px] mx-auto leading-normal">
                {achievement.description}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-center">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Motivational Message</p>
              <p className="text-xs font-bold text-slate-700 mt-1 italic leading-relaxed">
                {"\"Outstanding consistency! Your dedicated target focus is paying off. Keep pushing forward!\""}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black transition-all hover:scale-[1.02] shadow-md shadow-indigo-150"
            >
              Collect Reward & Proceed
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "../ui/AnimatedCounter";

export default function Stats() {
  const stats = [
    { value: 10000, suffix: "+", label: "Active Students" },
    { value: 1, suffix: "M+", label: "Questions Practiced" },
    { value: 50000, suffix: "+", label: "Books Uploaded" },
    { value: 95, suffix: "%", label: "Success Rate" },
    { value: 10, suffix: "+", label: "Exams Covered" },
  ];

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white">
      {/* Glow Rings background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full border border-white" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/50" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/30" />
      </div>

      <div className="layout-container max-w-[1320px] relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center text-center">
          {stats.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.6 }}
              className="flex flex-col gap-2"
            >
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                <AnimatedCounter
                  end={item.value}
                  suffix={item.suffix}
                />
              </h3>
              <p className="text-xs sm:text-sm font-semibold tracking-wider text-purple-100 uppercase">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

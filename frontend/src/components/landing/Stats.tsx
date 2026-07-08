"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "../ui/AnimatedCounter";
import Image from "next/image";

export default function Stats() {
  const stats = [
    { value: 10000, suffix: "+", label: "Active Students" },
    { value: 1, suffix: "M+", label: "Questions" },
    { value: 50000, suffix: "+", label: "Books" },
    { value: 95, suffix: "%", label: "Success" },
    { value: 10, suffix: "+", label: "Exams" },
  ];

  return (
    <section className="py-10 px-4">
      {/* Container Box */}
      <div className="layout-container max-w-[1000px] mx-auto bg-gradient-to-br from-[#6D4AFF] to-[#8B5CF6] rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-2xl border border-white/10">
        
        {/* Background Image texture */}
        <div className="absolute inset-0 z-0 opacity-25">
          <Image
            src="/stats-bg.png"
            alt="Stats Background texture"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Background Student Illustration - Using a reliable placeholder to prevent 404 */}
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none hidden md:block z-0">
           <Image 
             src="/student-study.png" 
             alt="Student studying" 
             width={256}
             height={170}
             className="w-64 h-auto object-contain"
           />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 relative z-10">
          {stats.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col gap-1 text-center"
            >
              <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                <AnimatedCounter end={item.value} suffix={item.suffix} />
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-purple-200 uppercase tracking-widest">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import GlassCard from "../ui/GlassCard";
import SectionHeading from "../ui/SectionHeading";
import GlowButton from "../ui/GlowButton";

// High-Performance 3D Tilt Wrapper
function PricingTiltCard({ children, className, isPopular }: { children: React.ReactNode; className?: string; isPopular?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150, mass: 0.6 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative w-full cursor-pointer group ${className} ${isPopular ? "z-20" : "z-10"}`}
    >
      {children}
    </motion.div>
  );
}

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const plans = [
    {
      name: "Basic",
      description: "Perfect for getting started with your exam preparation.",
      price: { monthly: 299, yearly: 249 },
      yearlyTotal: 2999,
      features: [
        "10 Book Selected",
        "AI Notes",
        "10,000 Questions",
        "Daily Practice",
        "Basic Analytics",
      ],
      popular: false,
    },
    {
      name: "Premium",
      description: "Most popular choice for serious aspirants.",
      price: { monthly: 599, yearly: 499 },
      yearlyTotal: 5999,
      features: [
        "Everything in Basic",
        "Unlimited Book Selected",
        "Advanced Analytics",
        "Priority Support",
        "Mock Tests (Unlimited)",
        "Personalized Mentoring",
      ],
      popular: true,
    },
    {
      name: "Elite",
      description: "The ultimate edge for top-rank aspirants.",
      price: { monthly: 999, yearly: 833 },
      yearlyTotal: 9999,
      features: [
        "Everything in Premium",
        "Advanced Analytics",
        "Dedicated AI Mentor",
        "Custom Study Plans",
        "1-on-1 Live Mentoring",
        "Priority Support",
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-20 bg-transparent relative border-t border-[#ECECEC] overflow-hidden perspective-[2000px]">

      {/* Ambient Floating Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-30 select-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-gradient-to-br from-[#6D4AFF]/5 to-transparent rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[15%] w-[500px] h-[500px] bg-gradient-to-tl from-[#A855F7]/5 to-transparent rounded-full blur-[120px]"
        />
      </div>

      {/* Reduced max-width to 1150px for a medium, tighter layout */}
      <div className="layout-container max-w-[1150px] px-4 mx-auto relative z-10">

        {/* Heading */}
        <SectionHeading
          badge="Pricing"
          title="Simple, Transparent"
          gradientTitle="Pricing"
          description="Choose the exact plan you need to crush your upcoming exams."
        />

        {/* Medium Sized Toggle Switch */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 mb-12 mt-6"
        >
          <span className={`text-sm font-bold transition-colors duration-300 ${billingCycle === "monthly" ? "text-neutral-900" : "text-neutral-400"}`}>
            Monthly
          </span>

          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-7 rounded-full bg-white border border-[#ECECEC] shadow-inner p-1 transition-all duration-500 hover:border-[#6D4AFF]/40 focus:outline-none"
          >
            {/* The Toggle Knob */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-5 h-5 rounded-full bg-gradient-to-b from-[#8B5CF6] to-[#6D4AFF] shadow-md shadow-[#6D4AFF]/30"
              style={{
                marginLeft: billingCycle === "yearly" ? "26px" : "0px",
              }}
            />
          </button>

          <span className={`text-sm font-bold transition-colors duration-300 flex items-center gap-2 ${billingCycle === "yearly" ? "text-neutral-900" : "text-neutral-400"}`}>
            Yearly
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: billingCycle === "yearly" ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.3 }}
              className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shadow-sm"
            >
              SAVE 30%
            </motion.span>
          </span>
        </motion.div>

        {/* Centered Cards Grid (md:grid-cols-3 max-w-[1000px] mx-auto for 3 cards balanced and centered) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch relative max-w-[1000px] mx-auto mt-6">

          {/* Premium Plan Glow blur accent in the center background */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-gradient-to-b from-[#6D4AFF]/10 to-[#A855F7]/5 blur-[80px] pointer-events-none rounded-full" />

          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.21, 1.02, 0.43, 1.01] }}
              className="flex w-full"
            >
              <PricingTiltCard isPopular={plan.popular} className="w-full flex h-full">

                <GlassCard
                  className={`relative flex flex-col justify-between p-5 lg:p-6 w-full h-full rounded-3xl transition-all duration-500 bg-white/70 backdrop-blur-2xl ${plan.popular
                    ? "border-[#6D4AFF]/40 ring-4 ring-[#6D4AFF]/10 shadow-[0_25px_50px_-12px_rgba(109,74,255,0.2)] bg-gradient-to-b from-white to-[#6D4AFF]/[0.02] transform lg:-translate-y-3"
                    : "border-[#ECECEC] hover:shadow-lg hover:border-neutral-300 shadow-sm"
                    }`}
                >

                  {/* Popular Ribbon */}
                  {plan.popular && (
                    <div
                      style={{ transform: "translateZ(30px)" }}
                      className="absolute -top-3.5 left-0 right-0 flex justify-center pointer-events-none"
                    >
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-[9px] font-black tracking-widest text-white uppercase bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] rounded-full shadow-md shadow-[#6D4AFF]/30 ring-2 ring-white">
                        <Sparkles className="w-2.5 h-2.5" /> Popular
                      </span>
                    </div>
                  )}

                  <div style={{ transform: "translateZ(15px)" }}>
                    <h3 className={`font-black text-lg tracking-tight ${plan.popular ? "text-[#6D4AFF]" : "text-neutral-900"}`}>
                      {plan.name}
                    </h3>
                    <p className="text-neutral-500 text-[11px] font-semibold mt-1">{plan.description}</p>

                    <div style={{ transform: "translateZ(35px)" }} className="my-6">
                      <div className="flex items-baseline gap-1 text-neutral-900">
                        <span className="text-base font-bold text-neutral-400">₹</span>
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={billingCycle}
                            initial={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                            transition={{ duration: 0.4, type: "spring", bounce: 0 }}
                            className="text-3xl xl:text-4xl font-black tracking-tighter tabular-nums"
                          >
                            {plan.price[billingCycle]}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-1">
                          /mo
                        </span>
                      </div>
                      <div className="h-4 mt-0.5">
                        <AnimatePresence>
                          {billingCycle === "yearly" && plan.price.yearly > 0 && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="text-[9px] font-bold text-emerald-600"
                            >
                              Billed ₹{plan.yearlyTotal} yearly
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <ul className="flex flex-col gap-3 mb-6">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-[11px] text-neutral-600 font-bold leading-snug">
                          <div className={`mt-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? "bg-[#6D4AFF]/10 text-[#6D4AFF]" : "bg-emerald-50 text-emerald-500"}`}>
                            <Check className="w-2 h-2" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ transform: "translateZ(25px)" }} className="mt-auto pt-2">
                    <Link href={`/login?plan=${plan.name.toLowerCase()}`}>
                      <GlowButton
                        variant={plan.popular ? "gradient" : "outline"}
                        className={`w-full text-[11px] font-black py-3 rounded-xl shadow-sm transition-all duration-300 ${plan.popular ? "shadow-[#6D4AFF]/20 hover:shadow-[#6D4AFF]/40 hover:scale-[1.02]" : "hover:bg-neutral-50"}`}
                        magnetic={false}
                      >
                        {plan.name === "Basic" ? "Get Started" : `Choose ${plan.name}`}
                      </GlowButton>
                    </Link>
                  </div>
                </GlassCard>
              </PricingTiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Check, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { useAuth } from "@/lib/auth-context";

// High-Performance 3D Tilt Wrapper
function PricingTiltCard({ children, className, isPopular }: { children: React.ReactNode; className?: string; isPopular?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150, mass: 0.6 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-8, 8]);

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
      className={`relative w-full group ${className} ${isPopular ? "z-20" : "z-10"}`}
    >
      {children}
    </motion.div>
  );
}

export default function PricingPage() {
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const plans = [
    {
      name: "Basic",
      description: "Perfect for getting started with your exam preparation.",
      price: { monthly: 299, yearly: 249 },
      yearlyTotal: 2999,
      features: [
        "10 Book Selected",
        "AI Notes Generator",
        "10,000 Questions Bank",
        "Daily Practice Tests",
        "Basic Analytics",
      ],
      popular: false,
      ctaText: "Get Started",
    },
    {
      name: "Premium",
      description: "Most popular choice for serious aspirants.",
      price: { monthly: 599, yearly: 499 },
      yearlyTotal: 5999,
      features: [
        "Everything in Basic",
        "Unlimited Book Selected",
        "Advanced Analytics & Insights",
        "Priority Support",
        "Unlimited Mock Tests",
        "Personalized Mentoring",
      ],
      popular: true,
      ctaText: "Choose Premium",
    },
    {
      name: "Elite",
      description: "The ultimate edge for top-rank aspirants.",
      price: { monthly: 999, yearly: 833 },
      yearlyTotal: 9999,
      features: [
        "Everything in Premium",
        "Dedicated AI Mentor",
        "Custom Study Plans",
        "1-on-1 Live Mentoring",
        "Priority Support & Exports",
      ],
      popular: false,
      ctaText: "Choose Elite",
    },
  ];

  return (
    <PageLayout
      title="Simple, Transparent Pricing"
      description="Choose the plan that's right for you"
      breadcrumb={[{ label: "Pricing", href: "/pricing" }]}
    >
      <div className="max-w-6xl px-4 sm:px-6 mx-auto relative z-10 py-4">

        {/* Toggle Switch */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={`text-sm font-bold transition-colors ${billingCycle === "monthly" ? "text-slate-900" : "text-slate-400"}`}>
            Monthly
          </span>

          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-7 rounded-full bg-white border border-slate-200 shadow-inner p-1 transition-all duration-300 hover:border-[#084c38] focus:outline-none cursor-pointer"
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-5 h-5 rounded-full bg-[#084c38] shadow-sm"
              style={{
                marginLeft: billingCycle === "yearly" ? "26px" : "0px",
              }}
            />
          </button>

          <span className={`text-sm font-bold transition-colors flex items-center gap-2 ${billingCycle === "yearly" ? "text-slate-900" : "text-slate-400"}`}>
            Yearly
            <span className="text-[9px] font-extrabold text-[#084c38] bg-[#ecfdf5] border border-[#d1fae5] px-2 py-0.5 rounded-full shadow-2xs">
              SAVE 30%
            </span>
          </span>
        </motion.div>

        {/* Grid of Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative max-w-6xl mx-auto">
          {plans.map((plan, idx) => {
            const checkoutUrl = isAuthenticated
              ? `/checkout?plan=${plan.name.toLowerCase()}&cycle=${billingCycle}`
              : `/login?redirect=/checkout?plan=${plan.name.toLowerCase()}%26cycle=${billingCycle}`;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className="flex w-full"
              >
                <PricingTiltCard isPopular={plan.popular} className="w-full flex h-full">
                  <div
                    className={`p-8 rounded-3xl bg-white w-full h-full flex flex-col justify-between transition-all ${
                      plan.popular
                        ? "border-2 border-[#084c38] ring-4 ring-[#084c38]/10 shadow-xl relative transform lg:-translate-y-2"
                        : "border border-slate-200 shadow-xs hover:border-slate-300"
                    }`}
                  >
                    <div>
                      {plan.popular && (
                        <div
                          style={{ transform: "translateZ(25px)" }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#084c38] text-white text-[10px] font-extrabold uppercase tracking-wider mb-4 shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Most Popular</span>
                        </div>
                      )}

                      <div style={{ transform: "translateZ(15px)" }}>
                        <h3 className={`text-2xl font-bold font-display mb-1 ${plan.popular ? "text-[#084c38]" : "text-slate-900"}`}>
                          {plan.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mb-6">
                          {plan.description}
                        </p>

                        <div className="flex items-baseline gap-1 mb-2 border-b border-slate-100 pb-6">
                          <span className="text-base font-bold text-slate-400">₹</span>
                          <AnimatePresence mode="popLayout">
                            <motion.span
                              key={billingCycle}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.3 }}
                              className="text-4xl font-extrabold text-slate-900 font-display tracking-tight"
                            >
                              {plan.price[billingCycle]}
                            </motion.span>
                          </AnimatePresence>
                          <span className="text-xs font-semibold text-slate-500">
                            / month
                          </span>
                        </div>

                        <div className="h-5 mb-4">
                          {billingCycle === "yearly" && (
                            <p className="text-[11px] font-bold text-[#084c38]">
                              Billed ₹{plan.yearlyTotal} yearly
                            </p>
                          )}
                        </div>

                        <ul className="space-y-3 mb-8">
                          {plan.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-3 text-xs text-slate-700 font-semibold">
                              <div className="w-4 h-4 rounded-full bg-[#ecfdf5] border border-[#d1fae5] text-[#084c38] flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div style={{ transform: "translateZ(20px)" }} className="mt-auto">
                      <Link
                        href={checkoutUrl}
                        className={`w-full py-3.5 rounded-xl text-xs font-bold text-center transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                          plan.popular
                            ? "bg-[#084c38] hover:bg-[#063b2b] text-white shadow-emerald-900/10"
                            : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200"
                        }`}
                      >
                        <span>{plan.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </PricingTiltCard>
              </motion.div>
            );
          })}
        </div>

        {/* 30-Day Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3.5 bg-white border border-slate-200 rounded-full px-8 py-4 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#084c38]" />
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">
                30-Day Money Back Guarantee
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </PageLayout>
  );
}


"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const plans = [
    {
      name: "Basic",
      description: "Perfect for getting started with your exam preparation.",
      price: { monthly: 299, yearly: 249 },
      yearlyTotal: 2999,
      features: [
        "10 Books Access",
        "AI Notes Generator",
        "10,000+ Question Bank",
        "Daily Practice Quizzes",
        "Basic Performance Analytics",
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
        "Unlimited Books Access",
        "Advanced Analytics & Insights",
        "Priority AI Support",
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
        "Custom Study Roadmaps",
        "1-on-1 Live Mentoring",
        "Priority Support & Exports",
      ],
      popular: false,
      ctaText: "Choose Elite",
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 bg-[#FAF9F6] border-y border-slate-200/90 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#084c38] text-xs font-black uppercase tracking-widest mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>TRANSPARENT PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
            Choose the way you want to prepare
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            Simple, predictable plans designed to support every stage of your examination journey
          </p>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-xs sm:text-sm font-bold transition-colors ${billingCycle === "monthly" ? "text-slate-900" : "text-slate-400"}`}>
              Monthly
            </span>

            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative w-14 h-8 rounded-full bg-slate-200/80 border border-slate-300 p-1 transition-all duration-300 hover:border-[#084c38] focus:outline-none cursor-pointer shrink-0"
              aria-label="Toggle Billing Cycle"
            >
              <motion.div
                animate={{ x: billingCycle === "yearly" ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-6 h-6 rounded-full bg-[#084c38] shadow-md"
              />
            </button>

            <span className={`text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 ${billingCycle === "yearly" ? "text-slate-900" : "text-slate-400"}`}>
              Yearly
              <span className="text-[10px] font-black text-[#084c38] bg-emerald-100/80 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                SAVE 30%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan, idx) => {
            const checkoutUrl = isAuthenticated
              ? `/checkout?plan=${plan.name.toLowerCase()}&cycle=${billingCycle}`
              : `/login?redirect=/checkout?plan=${plan.name.toLowerCase()}%26cycle=${billingCycle}`;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`p-7 lg:p-8 rounded-3xl bg-white flex flex-col justify-between h-full transition-all duration-300 ${plan.popular
                    ? "border-2 border-[#084c38] ring-4 ring-[#084c38]/10 shadow-2xl relative transform md:-translate-y-2 z-10 glow-emerald"
                    : "border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300"
                  }`}
              >
                <div>
                  {plan.popular ? (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#084c38] to-[#059669] text-white text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm">
                      <Sparkles className="w-3 h-3 text-emerald-300" />
                      <span>Most Popular</span>
                    </div>
                  ) : (
                    <div className="h-7 mb-2" />
                  )}

                  <h3 className={`text-2xl font-black font-display mb-1.5 ${plan.popular ? "text-[#084c38]" : "text-slate-900"}`}>
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal mb-6 min-h-[32px] leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6 border-b border-slate-100 pb-6">
                    <span className="text-base font-bold text-slate-400">₹</span>
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={billingCycle}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.25 }}
                        className="text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight"
                      >
                        {plan.price[billingCycle]}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-xs font-bold text-slate-500">
                      / month
                    </span>
                  </div>

                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold leading-snug">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-200 text-[#084c38] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 mt-auto">
                  <Link
                    href={checkoutUrl}
                    className={`w-full py-4 rounded-2xl text-xs font-black text-center transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer ${plan.popular
                        ? "bg-gradient-to-r from-[#084c38] to-[#059669] hover:from-[#063b2b] hover:to-[#047857] text-white shadow-lg shadow-[#084c38]/25 hover:shadow-xl"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                      }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-8 text-xs text-slate-600 font-semibold">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            30-Day Money-Back Guarantee
          </span>
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            Instant Account Activation
          </span>
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            Secure 256-Bit SSL Checkout
          </span>
        </div>

      </div>
    </section>
  );
}

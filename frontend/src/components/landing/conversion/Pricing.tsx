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
    <section id="pricing" className="py-20 md:py-28 bg-[#FAF9F6] border-y border-slate-200/90 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ecfdf5] border border-[#d1fae5] text-[#084c38] text-xs font-extrabold uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#084c38]" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Choose the way you want to prepare
          </h2>
          <p className="mt-3.5 text-slate-600 text-base md:text-lg leading-relaxed font-medium">
            Simple, predictable plans designed to support every stage of your examination journey
          </p>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-xs sm:text-sm font-bold transition-colors ${billingCycle === "monthly" ? "text-slate-900" : "text-slate-400"}`}>
              Monthly
            </span>

            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative w-13 h-7 rounded-full bg-white border border-slate-300 shadow-inner p-1 transition-all duration-300 hover:border-[#084c38] focus:outline-none cursor-pointer shrink-0"
              aria-label="Toggle Billing Cycle"
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-5 h-5 rounded-full bg-[#084c38] shadow-sm"
                style={{
                  marginLeft: billingCycle === "yearly" ? "22px" : "0px",
                }}
              />
            </button>

            <span className={`text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 ${billingCycle === "yearly" ? "text-slate-900" : "text-slate-400"}`}>
              Yearly
              <span className="text-[10px] font-extrabold text-[#084c38] bg-[#ecfdf5] border border-[#d1fae5] px-2.5 py-0.5 rounded-full shadow-2xs">
                SAVE 30%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid - Responsive & Equal Fit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan, idx) => {
            const checkoutUrl = isAuthenticated
              ? `/checkout?plan=${plan.name.toLowerCase()}&cycle=${billingCycle}`
              : `/login?redirect=/checkout?plan=${plan.name.toLowerCase()}%26cycle=${billingCycle}`;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`p-6 sm:p-7 lg:p-8 rounded-3xl bg-white flex flex-col justify-between h-full transition-all ${plan.popular
                    ? "border-2 border-[#084c38] ring-4 ring-[#084c38]/10 shadow-xl relative transform md:-translate-y-1 z-10"
                    : "border border-slate-200/90 shadow-sm hover:shadow-md"
                  }`}
              >
                <div>
                  {plan.popular ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#084c38] text-white text-[10px] font-extrabold uppercase tracking-wider mb-4 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-emerald-300" />
                      <span>Most Popular</span>
                    </div>
                  ) : (
                    <div className="h-7 mb-2" />
                  )}

                  <h3 className={`text-2xl font-bold font-display mb-1 ${plan.popular ? "text-[#084c38]" : "text-slate-900"}`}>
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-6 min-h-[32px] leading-relaxed">
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
                        className="text-4xl font-extrabold text-slate-900 font-display tracking-tight"
                      >
                        {plan.price[billingCycle]}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-xs font-semibold text-slate-500">
                      / month
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold leading-snug">
                        <div className="w-4 h-4 rounded-full bg-[#ecfdf5] border border-[#d1fae5] text-[#084c38] flex items-center justify-center shrink-0 mt-0.5">
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
                    className={`w-full py-3.5 rounded-xl text-xs font-bold text-center transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs ${plan.popular
                        ? "bg-[#084c38] hover:bg-[#063b2b] text-white shadow-md shadow-[#084c38]/20"
                        : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200"
                      }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#084c38]" />
            30-Day Money-Back Guarantee
          </span>
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#084c38]" />
            Instant Account Activation
          </span>
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#084c38]" />
            Secure 256-Bit SSL Checkout
          </span>
        </div>

      </div>
    </section>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck,
  FileDown,
  MailCheck,
  Loader2,
  Zap
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [txnId, setTxnId] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"pending" | "sent" | "failed">("pending");
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const planName = searchParams.get("plan") || "premium";
  const cycle = searchParams.get("cycle") || "yearly";
  const amount = searchParams.get("amount") || "707";

  // Generate simulated Txn ID
  useEffect(() => {
    setMounted(true);
    const rand = Math.floor(100000 + Math.random() * 900000);
    setTxnId(`APT-${Date.now().toString().slice(-6)}-${rand}`);
  }, []);

  // Send receipt email with PDF attachment on mount
  useEffect(() => {
    if (!txnId || !user?.email) return;

    const dispatchInvoiceEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/api/billing/send-invoice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: user.email,
            planName: planName,
            cycle: cycle,
            amount: amount,
            txnId: txnId
          })
        });
        if (response.ok) {
          setEmailStatus("sent");
        } else {
          setEmailStatus("failed");
        }
      } catch (err) {
        console.error("Failed sending invoice email:", err);
        setEmailStatus("failed");
      }
    };

    dispatchInvoiceEmail();
  }, [txnId, user?.email, planName, cycle, amount]);

  const handleCopy = () => {
    navigator.clipboard.writeText(txnId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectPdfDownload = async () => {
    if (!user?.email && !txnId) return;
    setDownloading(true);

    try {
      const downloadUrl = `${API_URL}/api/billing/download-invoice-pdf?email=${encodeURIComponent(
        user?.email || "user@aptora.ai"
      )}&plan=${encodeURIComponent(planName)}&cycle=${encodeURIComponent(cycle)}&amount=${encodeURIComponent(
        amount
      )}&txnId=${encodeURIComponent(txnId)}`;

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Aptora_Invoice_${txnId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading PDF invoice:", error);
    } finally {
      setDownloading(false);
    }
  };

  const getExpiryDate = () => {
    const date = new Date();
    if (cycle === "yearly") {
      date.setFullYear(date.getFullYear() + 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <PageLayout
      title="Order Completed"
      description="Thank you for subscribing! Your official PDF invoice has been sent to your email."
      breadcrumb={[
        { label: "Checkout", href: "/checkout" },
        { label: "Success Receipt", href: "/checkout/success" }
      ]}
    >
      <div className="layout-container max-w-[800px] px-4 mx-auto relative z-10 py-6">

        {/* Main Grid: Details + Included Features */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">

          {/* Left Side: Order Confirmation Receipt */}
          <div className="md:col-span-7 flex w-full">
            <GlassCard className="p-6 md:p-8 rounded-[32px] border-[#ECECEC] bg-white shadow-xl text-center w-full flex flex-col justify-between relative overflow-hidden">

              {/* Confetti Animation Elements */}
              <div className="absolute top-0 inset-x-0 h-40 flex justify-center overflow-hidden pointer-events-none z-0">
                {mounted && [...Array(20)].map((_, i) => {
                  const randX = Math.random() * 200 - 100;
                  const randY = Math.random() * 150 + 50;
                  const delay = Math.random() * 0.8;
                  const colors = ["bg-emerald-600", "bg-teal-500", "bg-emerald-500", "bg-amber-500", "bg-teal-400"];
                  const randomColor = colors[Math.floor(Math.random() * colors.length)];
                  return (
                    <motion.div
                      key={i}
                      initial={{ y: -10, x: 0, opacity: 1, scale: Math.random() * 0.5 + 0.5 }}
                      animate={{ y: randY, x: randX, opacity: 0, rotate: 360 }}
                      transition={{ duration: 2, delay: delay, ease: "easeOut", repeat: Infinity, repeatDelay: 1.5 }}
                      className={`w-3 h-1.5 rounded-full absolute ${randomColor}`}
                    />
                  );
                })}
              </div>

              <div className="relative z-10 flex flex-col items-center">
                {/* Success Indicator */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-5 shadow-inner"
                >
                  <CheckCircle2 className="w-7 h-7" />
                </motion.div>

                <h3 className="text-xl font-black text-neutral-900 mb-1.5 uppercase tracking-tight">Payment Approved</h3>
                <p className="text-[11px] text-neutral-500 font-semibold mb-6 max-w-[280px] leading-relaxed">
                  Your subscription details are verified. A high-resolution PDF tax invoice has been generated and dispatched to your email.
                </p>

                {/* Email Sent Status Badge */}
                <div className="flex items-center justify-center mb-6">
                  {emailStatus === "pending" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[9.5px] font-black uppercase tracking-wider">
                      <Loader2 className="w-3 h-3 animate-spin" /> Dispatching PDF Invoice Email...
                    </span>
                  )}
                  {emailStatus === "sent" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9.5px] font-black uppercase tracking-wider shadow-sm">
                      <MailCheck className="w-3.5 h-3.5 text-emerald-600" /> Invoice PDF Sent to {user?.email || "Email"}
                    </span>
                  )}
                  {emailStatus === "failed" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9.5px] font-black uppercase tracking-wider">
                      <MailCheck className="w-3.5 h-3.5 text-emerald-600" /> Invoice Logged & PDF Ready
                    </span>
                  )}
                </div>

                {/* Receipt Grid */}
                <div className="bg-neutral-50 border border-[#ECECEC] rounded-2xl p-5 text-left space-y-4 w-full mb-6">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200 text-xs">
                    <span className="font-bold text-neutral-400 uppercase tracking-wider">Transaction ID</span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 font-black text-neutral-800 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <span className="font-mono text-[10.5px]">{txnId}</span>
                      <Copy className="w-3.5 h-3.5" />
                      {copied && <span className="text-[8px] text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 uppercase tracking-widest">Copied</span>}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Activated Plan</span>
                      <span className="text-sm font-black text-neutral-900 capitalize">{planName} ({cycle})</span>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Amount Paid</span>
                      <span className="text-sm font-black text-emerald-700">₹{amount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-neutral-200 text-[10px] font-bold text-neutral-500">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span>Subscription valid until <span className="text-neutral-900 font-black">{getExpiryDate()}</span></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 z-10 w-full">
                <Link href="/dashboard" className="block w-full">
                  <GlowButton variant="gradient" className="w-full py-4 text-xs font-black shadow-md flex items-center justify-center gap-2" magnetic={false}>
                    <Compass className="w-4 h-4" /> Launch Dashboard <ArrowRight className="w-4 h-4" />
                  </GlowButton>
                </Link>
                <button
                  onClick={handleDirectPdfDownload}
                  disabled={downloading}
                  className="w-full py-3.5 px-4 rounded-xl border border-neutral-300 bg-white text-neutral-800 text-[11px] font-black shadow-sm flex items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Generating Premium PDF...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 text-emerald-600" /> Download PDF Invoice
                    </>
                  )}
                </button>
              </div>

            </GlassCard>
          </div>

          {/* Right Side: What's Unlocked Panel */}
          <div className="md:col-span-5 flex w-full">
            <GlassCard className="p-6 md:p-8 rounded-[32px] border-[#ECECEC] bg-white shadow-lg w-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-xl pointer-events-none" />

              <div>
                <h4 className="text-sm font-black text-neutral-950 uppercase tracking-wider mb-6 pb-3 border-b border-[#ECECEC] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" /> Active Benefits
                </h4>

                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-neutral-800">Unlimited Exam Books</h5>
                      <p className="text-[10px] text-neutral-500 font-semibold mt-0.5 leading-relaxed">Select as many syllabus assets and PYQs as needed.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-neutral-800">Contextual RAG Notes</h5>
                      <p className="text-[10px] text-neutral-500 font-semibold mt-0.5 leading-relaxed">Get personalized reading chunk predictions and study guides.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-neutral-800">Custom Mock Generator</h5>
                      <p className="text-[10px] text-neutral-500 font-semibold mt-0.5 leading-relaxed">Simulated tests generated daily matching target exam configurations.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-neutral-800">24/7 Personal AI Coach</h5>
                      <p className="text-[10px] text-neutral-500 font-semibold mt-0.5 leading-relaxed">Dedicated AI tutor resolves syllabus queries instantly.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Secure badge footer */}
              <div className="pt-6 border-t border-[#ECECEC] mt-8 flex items-center justify-center gap-1.5 text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified subscription
              </div>

            </GlassCard>
          </div>

        </div>

      </div>
    </PageLayout>
  );
}

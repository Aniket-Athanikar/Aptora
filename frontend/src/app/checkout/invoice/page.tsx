"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ShieldCheck, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AptoraLogo } from "@/components/ui/AptoraLogo";

export const dynamic = "force-dynamic";

function InvoiceContent() {
  const searchParams = useSearchParams();
  const [dateStr, setDateStr] = useState("");

  const planName = searchParams.get("plan") || "premium";
  const cycle = searchParams.get("cycle") || "yearly";
  const amount = searchParams.get("amount") || "707";
  const txnId = searchParams.get("txnId") || "APT-TXN-XXXXXX";
  const email = searchParams.get("email") || "user@Aptora.ai";

  // Calculate base values
  const totalVal = parseInt(amount) || 0;
  const gstVal = Math.round((totalVal * 0.18) / 1.18);
  const baseVal = totalVal - gstVal;

  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    // Auto-trigger browser print dialog after content renders
    const timer = setTimeout(() => {
      window.print();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 print:bg-white print:py-0 print:px-0">
      {/* Back button and Print Action bar - Hidden on print */}
      <div className="max-w-[700px] mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit to Dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase bg-[#084c38] text-white px-4 py-2.5 rounded-xl hover:bg-[#063b2b] transition-colors cursor-pointer shadow-xs border-none"
        >
          <Printer className="w-4 h-4" /> Trigger Print / Save PDF
        </button>
      </div>

      {/* Invoice Sheet */}
      <div className="relative max-w-[700px] mx-auto bg-white/95 backdrop-blur-md border-2 border-emerald-500/20 shadow-2xl rounded-3xl p-8 md:p-12 overflow-hidden print:border-none print:shadow-none print:rounded-none print:p-0">
        {/* Top Accent Gradient Bar - Hidden on print */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#084c38] via-emerald-500 to-teal-400 print:hidden" />

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between border-b-2 border-slate-100 pb-8 gap-4">
          <div>
            <AptoraLogo size="md" />
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-2">
              Smart learning ecosystems
            </p>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
              Invoice Receipt
            </h2>
            <p className="text-xs font-mono text-slate-500 mt-1">{txnId}</p>
          </div>
        </div>

        {/* Info Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 border-b border-slate-100 text-xs">
          <div>
            <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-2">
              Billed To:
            </h3>
            <p className="font-bold text-slate-900 text-sm">{email}</p>
            <p className="font-semibold text-slate-400 mt-1">
              Plan Status: Premium Unlocked
            </p>
          </div>
          <div className="md:text-right">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-2">
              Invoice Metadata:
            </h3>
            <p className="font-semibold text-slate-500">
              Date Billed: <span className="font-bold text-slate-900">{dateStr}</span>
            </p>
            <p className="font-semibold text-slate-500 mt-1">
              Payment Method: Online Secured
            </p>
          </div>
        </div>

        {/* Pricing Table */}
        <table className="w-full text-left my-8">
          <thead>
            <tr>
              <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                Description
              </th>
              <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-5 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900 block capitalize">
                  Aptora {planName} Subscription
                </span>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1 block">
                  Billed {cycle} Cycle
                </span>
              </td>
              <td className="py-5 border-b border-slate-100 text-right font-bold text-slate-800 text-sm">
                ₹{baseVal}
              </td>
            </tr>
            <tr>
              <td className="py-4 border-b border-slate-100 text-xs font-semibold text-slate-400">
                Integrated GST (18%)
              </td>
              <td className="py-4 border-b border-slate-100 text-right font-bold text-slate-500 text-xs">
                ₹{gstVal}
              </td>
            </tr>
            <tr>
              <td className="py-5 text-sm font-bold text-[#084c38]">
                Total Amount Paid
              </td>
              <td className="py-5 text-right font-extrabold text-xl text-[#084c38]">
                ₹{totalVal}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-8 text-center text-[10px] font-medium text-slate-400 uppercase tracking-wider space-y-3">
          <p>
            This is a computer-generated invoice receipt and requires no physical signature.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[#084c38] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#084c38]" /> PCI-DSS Certified transaction
          </div>
          <p className="text-[10px] text-slate-400 font-medium lowercase">
            support & help desk: agentforge29@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePrintPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-medium text-slate-500">Loading invoice...</div>}>
      <InvoiceContent />
    </Suspense>
  );
}


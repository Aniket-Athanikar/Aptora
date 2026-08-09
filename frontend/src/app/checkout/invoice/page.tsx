"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function InvoicePrintPage() {
  const searchParams = useSearchParams();
  const [dateStr, setDateStr] = useState("");

  const planName = searchParams.get("plan") || "premium";
  const cycle = searchParams.get("cycle") || "yearly";
  const amount = searchParams.get("amount") || "707";
  const txnId = searchParams.get("txnId") || "EF-TXN-XXXXXX";
  const email = searchParams.get("email") || "user@examforge.ai";

  // Calculate base values
  const totalVal = parseInt(amount) || 0;
  const gstVal = Math.round(totalVal * 0.18 / 1.18);
  const baseVal = totalVal - gstVal;

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }));

    // Auto-trigger browser print dialog after content renders
    const timer = setTimeout(() => {
      window.print();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-4 print:bg-white print:py-0 print:px-0">

      {/* Back button and Print Action bar - Hidden on print */}
      <div className="max-w-[700px] mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-black uppercase text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit to Dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-xs font-black uppercase bg-[#6D4AFF] text-white px-4 py-2 rounded-xl hover:bg-[#8B5CF6] transition-colors cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4" /> Trigger Print / Save PDF
        </button>
      </div>

      {/* Invoice Sheet */}
      <div className="max-w-[700px] mx-auto bg-white border border-neutral-200 shadow-lg rounded-[24px] p-8 md:p-12 print:border-none print:shadow-none print:rounded-none print:p-0">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between border-b-2 border-neutral-100 pb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              Exam<span className="text-[#6D4AFF]">Forge-AI</span>
            </h1>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">Smart learning ecosystems</p>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-xl font-black text-neutral-900 uppercase tracking-wide">Invoice Receipt</h2>
            <p className="text-xs font-mono text-neutral-500 mt-1">{txnId}</p>
          </div>
        </div>

        {/* Info Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 border-b border-neutral-100 text-xs">
          <div>
            <h3 className="font-black text-neutral-400 uppercase tracking-widest mb-2.5">Billed To:</h3>
            <p className="font-extrabold text-neutral-900 text-sm">{email}</p>
            <p className="font-semibold text-neutral-400 mt-1">Plan Status: Premium Unlocked</p>
          </div>
          <div className="md:text-right">
            <h3 className="font-black text-neutral-400 uppercase tracking-widest mb-2.5">Invoice Metadata:</h3>
            <p className="font-semibold text-neutral-500">Date Billed: <span className="font-black text-neutral-900">{dateStr}</span></p>
            <p className="font-semibold text-neutral-500 mt-1">Payment Method: Online Secured</p>
          </div>
        </div>

        {/* Pricing Table */}
        <table className="w-full text-left my-8">
          <thead>
            <tr>
              <th className="pb-3 text-[10px] font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-200">Description</th>
              <th className="pb-3 text-[10px] font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-200 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-5 border-b border-neutral-100">
                <span className="text-sm font-black text-neutral-900 block capitalize">
                  ExamForge {planName} Subscription
                </span>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mt-1 block">
                  Billed {cycle} Cycle
                </span>
              </td>
              <td className="py-5 border-b border-neutral-100 text-right font-extrabold text-neutral-800 text-sm">
                ₹{baseVal}
              </td>
            </tr>
            <tr>
              <td className="py-4 border-b border-neutral-100 text-xs font-bold text-neutral-400">
                Integrated GST (18%)
              </td>
              <td className="py-4 border-b border-neutral-100 text-right font-extrabold text-neutral-500 text-xs">
                ₹{gstVal}
              </td>
            </tr>
            <tr>
              <td className="py-5 text-sm font-black text-[#6D4AFF]">Total Amount Paid</td>
              <td className="py-5 text-right font-black text-xl text-[#6D4AFF]">
                ₹{totalVal}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="border-t border-neutral-100 pt-8 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider space-y-4">
          <p>This is a computer-generated invoice receipt and requires no physical signature.</p>
          <div className="flex items-center justify-center gap-1.5 text-[#6D4AFF]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> PCI-DSS Certified transaction
          </div>
          <p className="text-[9px] text-neutral-300 font-semibold lowercase">support & help desk: agentforge29@gmail.com</p>
        </div>

      </div>
    </div>
  );
}

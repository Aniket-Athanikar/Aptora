"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ShieldCheck,
  Building,
  QrCode,
  Loader2,
  Lock,
  Smartphone,
  CheckCircle2,
  Key,
  ArrowRight,
  Info,
  Wallet,
  Check,
  Zap,
  RotateCcw
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";

const planRates: Record<string, { monthly: number; yearly: number }> = {
  basic: { monthly: 299, yearly: 249 },
  premium: { monthly: 599, yearly: 499 },
  elite: { monthly: 999, yearly: 833 }
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planName = searchParams.get("plan") || "premium";
  const cycle = searchParams.get("cycle") || "yearly";

  const rate = planRates[planName.toLowerCase()] || planRates.premium;
  const pricePerMonth = cycle === "yearly" ? rate.yearly : rate.monthly;
  const subtotal = cycle === "yearly" ? pricePerMonth * 12 : pricePerMonth;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  // Selected Gateway: razorpay (secured credit cards/UPI) or paytm (wallet/QR)
  const [gateway, setGateway] = useState<"razorpay" | "paytm">("razorpay");
  
  // Razorpay-specific methods: card, upi, netbanking
  const [razorpayMethod, setRazorpayMethod] = useState<"card" | "upi" | "netbanking">("card");
  
  // Card states
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardFlipped, setCardFlipped] = useState(false);

  // Razorpay UPI VPA Vitals
  const [vpaId, setVpaId] = useState("");

  // Paytm-specific methods: wallet, qr
  const [paytmMethod, setPaytmMethod] = useState<"wallet" | "qr">("wallet");
  const [paytmMobile, setPaytmMobile] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  
  // Netbanking bank
  const [selectedBank, setSelectedBank] = useState("");

  // Global processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStage, setProcessStage] = useState(0);

  const stages = gateway === "razorpay" 
    ? [
        "Initializing Razorpay Secure API handshake...",
        "Authorizing tokenized cards vault credentials...",
        "Initiating Multi-Factor 3D Secure redirect...",
        "Confirming ledger subscription status update..."
      ]
    : [
        "Linking Paytm secure wallet ledger API...",
        "Deducting tokenized wallet balance...",
        "Generating instant billing invoice credentials...",
        "Completing ExamForge subscription activation..."
      ];

  useEffect(() => {
    if (!isProcessing) return;
    if (processStage >= stages.length) {
      const timer = setTimeout(() => {
        router.push(`/checkout/success?plan=${planName}&cycle=${cycle}&amount=${total}`);
      }, 500);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setProcessStage(prev => prev + 1);
    }, 850);

    return () => clearTimeout(timer);
  }, [isProcessing, processStage]);

  // Handle card inputs formatting
  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    const formatted = clean.match(/.{1,4}/g)?.join(" ") || clean;
    setCardNumber(formatted.slice(0, 19));
  };

  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length <= 2) {
      setCardExpiry(clean);
    } else {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
    }
  };

  const handleOtpInput = (val: string, index: number) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) return;
    const nextOtp = [...otpCode];
    nextOtp[index] = clean.slice(-1);
    setOtpCode(nextOtp);

    // Focus next cell
    if (index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace") {
      const nextOtp = [...otpCode];
      nextOtp[index] = "";
      setOtpCode(nextOtp);
      if (index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      }
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gateway === "razorpay") {
      if (razorpayMethod === "card") {
        if (cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3) {
          alert("Please fill in valid Card Details.");
          return;
        }
      } else if (razorpayMethod === "upi" && !vpaId.includes("@")) {
        alert("Please enter a valid UPI ID.");
        return;
      } else if (razorpayMethod === "netbanking" && !selectedBank) {
        alert("Please select a target NetBanking bank.");
        return;
      }
      setIsProcessing(true);
      setProcessStage(0);
    } else {
      // Paytm Method
      if (paytmMethod === "wallet") {
        if (paytmMobile.length < 10) {
          alert("Please enter a valid 10-digit mobile number.");
          return;
        }
        if (!showOtpScreen) {
          setShowOtpScreen(true);
          return;
        }
        if (otpCode.join("").length < 6) {
          alert("Please enter the 6-digit OTP code.");
          return;
        }
      }
      setIsProcessing(true);
      setProcessStage(0);
    }
  };

  return (
    <PageLayout
      title="Secure Checkout"
      description="Unlock full access to AI learning engines, mock tests, and dashboards."
      breadcrumb={[
        { label: "Pricing", href: "/pricing" },
        { label: "Checkout", href: "/checkout" }
      ]}
    >
      <div className="layout-container max-w-[1180px] px-4 mx-auto relative z-10 py-8">
        
        {/* Global Loading overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#060410]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 text-center"
            >
              <GlassCard className="p-8 max-w-md w-full flex flex-col items-center gap-6 border-neutral-200 bg-white shadow-2xl">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-neutral-900 uppercase tracking-wider">Processing Checkout</h3>
                  <p className="text-xs text-neutral-500 font-semibold h-8 flex items-center justify-center px-4 leading-relaxed">
                    {stages[processStage] || "Finalizing..."}
                  </p>
                </div>
                <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((processStage + 1) / stages.length) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-1.5 justify-center uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  PCI-DSS SECURE LEDGER GATEWAY
                </span>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Gateways & Payment details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Gateway Selection Header */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setGateway("razorpay");
                  setShowOtpScreen(false);
                }}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                  gateway === "razorpay"
                    ? "bg-white border-emerald-600 ring-2 ring-emerald-500/10 shadow-md"
                    : "bg-white/50 border-neutral-200 text-neutral-500 hover:bg-white"
                }`}
              >
                {gateway === "razorpay" && (
                  <span className="absolute top-3 right-3 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px]">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">Razorpay</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Cards, UPI, NetBanking</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGateway("paytm");
                  setShowOtpScreen(false);
                }}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                  gateway === "paytm"
                    ? "bg-white border-emerald-600 ring-2 ring-emerald-500/10 shadow-md"
                    : "bg-white/50 border-neutral-200 text-neutral-500 hover:bg-white"
                }`}
              >
                {gateway === "paytm" && (
                  <span className="absolute top-3 right-3 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px]">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">Paytm</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">UPI Wallet, Instant QR</span>
              </button>
            </div>

            {/* Main Interactive Details Card */}
            <GlassCard className="p-6 md:p-8 border-neutral-200 bg-white shadow-lg rounded-[28px]">
              
              {/* RAZORPAY GATEWAY SPECIFICS */}
              {gateway === "razorpay" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#ECECEC] pb-4">
                    <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-600" /> Razorpay Instant Portal
                    </h3>
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-slate-200/50">
                      Razorpay Secured
                    </span>
                  </div>

                  {/* Sub-tabs: Card, UPI, NetBanking */}
                  <div className="flex gap-2">
                    {[
                      { id: "card", label: "Credit/Debit Card" },
                      { id: "upi", label: "UPI" },
                      { id: "netbanking", label: "NetBanking" }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setRazorpayMethod(sub.id as "card" | "upi" | "netbanking")}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                          razorpayMethod === sub.id
                            ? "bg-neutral-950 border-neutral-950 text-white"
                            : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100/50"
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    
                    {/* Method 1: Cards */}
                    {razorpayMethod === "card" && (
                      <div className="space-y-6">
                        {/* Live Credit Card Preview Mockup */}
                        <div className="perspective-1000 w-full max-w-[340px] mx-auto h-[190px] relative">
                          <motion.div
                            animate={{ rotateY: cardFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6 }}
                            className="w-full h-full relative preserve-3d shadow-xl rounded-[20px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 flex flex-col justify-between"
                          >
                            {/* Card Front */}
                            <div className="absolute inset-0 backface-hidden p-6 flex flex-col justify-between w-full h-full">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Secure Core</span>
                                <span className="text-lg font-black italic tracking-wide">VISA</span>
                              </div>
                              <div className="space-y-2 mt-4">
                                <span className="font-mono text-base tracking-widest block text-emerald-50">
                                  {cardNumber || "•••• •••• •••• ••••"}
                                </span>
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="font-black uppercase tracking-wider block truncate max-w-[150px]">
                                    {cardName || "CARDHOLDER NAME"}
                                  </span>
                                  <div className="text-right">
                                    <span className="block text-[8px] text-emerald-200 uppercase tracking-widest">Expiry</span>
                                    <span className="font-mono">{cardExpiry || "MM/YY"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Card Back (flipped) */}
                            <div className="absolute inset-0 backface-hidden p-6 flex flex-col justify-between w-full h-full rotate-y-180 bg-gradient-to-br from-teal-700 to-emerald-800">
                              <div className="bg-neutral-900 h-8 -mx-6 mt-1" />
                              <div className="flex items-center justify-between mt-4">
                                <div className="bg-white/10 h-7 flex-1 rounded px-2 flex items-center font-mono text-xs">
                                  •••• •••• ••••
                                </div>
                                <div className="text-right ml-4">
                                  <span className="block text-[8px] text-emerald-200 uppercase tracking-widest">CVV</span>
                                  <span className="font-mono bg-white text-neutral-800 px-2.5 py-0.5 rounded font-black">{cardCvv || "•••"}</span>
                                </div>
                              </div>
                              <span className="text-[8px] text-emerald-200 text-center leading-none mt-2">
                                Authorized Signature Card. Not Transferable.
                              </span>
                            </div>
                          </motion.div>
                        </div>

                        {/* Card Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Card Number</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => handleCardNumberChange(e.target.value)}
                              onFocus={() => setCardFlipped(false)}
                              placeholder="4111 2222 3333 4444"
                              required
                              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                            />
                          </div>

                          <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Cardholder Name</label>
                            <input
                              type="text"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              onFocus={() => setCardFlipped(false)}
                              placeholder="Name on card"
                              required
                              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Expiry Date</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => handleExpiryChange(e.target.value)}
                              onFocus={() => setCardFlipped(false)}
                              placeholder="MM/YY"
                              required
                              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors text-center"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">CVV Code</label>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                              onFocus={() => setCardFlipped(true)}
                              placeholder="•••"
                              required
                              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors text-center"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Method 2: UPI */}
                    {razorpayMethod === "upi" && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">UPI ID / Virtual Payment Address</label>
                          <input
                            type="text"
                            value={vpaId}
                            onChange={(e) => setVpaId(e.target.value)}
                            placeholder="username@okaxis"
                            required
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                          />
                          <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed">
                            A pull notification request will be pushed immediately to GPay, PhonePe, or Paytm App.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Method 3: NetBanking */}
                    {razorpayMethod === "netbanking" && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Choose Bank</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: "sbi", label: "SBI" },
                            { id: "hdfc", label: "HDFC" },
                            { id: "icici", label: "ICICI" },
                            { id: "axis", label: "Axis" }
                          ].map(bank => (
                            <button
                              key={bank.id}
                              type="button"
                              onClick={() => setSelectedBank(bank.id)}
                              className={`p-3.5 border rounded-xl text-xs font-bold text-left cursor-pointer transition-all ${
                                selectedBank === bank.id
                                  ? "border-emerald-600 bg-emerald-50 text-emerald-600"
                                  : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                              }`}
                            >
                              {bank.label} Bank
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Authorization Footer */}
                    <div className="pt-4 border-t border-[#ECECEC] flex items-center justify-between gap-4">
                      <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                        <Lock className="w-3.5 h-3.5 text-neutral-400" /> Secure Encryption
                      </span>
                      <GlowButton variant="gradient" className="px-8 py-3.5 text-xs font-black shadow-md flex items-center gap-2 border-none" type="submit" magnetic={false}>
                        Pay via Razorpay <ArrowRight className="w-4 h-4" />
                      </GlowButton>
                    </div>

                  </form>
                </div>
              )}

              {/* PAYTM GATEWAY SPECIFICS */}
              {gateway === "paytm" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#ECECEC] pb-4">
                    <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-600" /> Paytm Payments Core
                    </h3>
                    <span className="text-[9px] bg-sky-50 text-sky-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-sky-100">
                      Paytm Verified
                    </span>
                  </div>

                  {/* Sub-tabs: Wallet direct / QR scan */}
                  <div className="flex gap-2">
                    {[
                      { id: "wallet", label: "Link Wallet & Pay" },
                      { id: "qr", label: "Scan QR Code" }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setPaytmMethod(sub.id as "wallet" | "qr");
                          setShowOtpScreen(false);
                        }}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                          paytmMethod === sub.id
                            ? "bg-neutral-950 border-neutral-950 text-white"
                            : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100/50"
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    
                    {/* Method 1: Wallet Link */}
                    {paytmMethod === "wallet" && (
                      <div className="space-y-6">
                        {!showOtpScreen ? (
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Paytm Registered Mobile Number</label>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-4 flex items-center text-neutral-500 font-extrabold text-sm">+91</span>
                                <input
                                  type="text"
                                  value={paytmMobile}
                                  onChange={(e) => setPaytmMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                  placeholder="98765 43210"
                                  required
                                  className="w-full px-4 py-3 pl-14 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                                />
                              </div>
                              <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed">
                                Enter the number linked to your Paytm Wallet to trigger a 6-digit verification code.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-5 text-center">
                            <span className="inline-block bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-100">
                              Verification Code Sent
                            </span>
                            <h4 className="text-sm font-black text-neutral-800">Enter OTP sent to +91 {paytmMobile}</h4>
                            
                            <div className="flex justify-center gap-2">
                              {otpCode.map((digit, idx) => (
                                <input
                                  key={idx}
                                  id={`otp-${idx}`}
                                  type="text"
                                  value={digit}
                                  maxLength={1}
                                  onChange={(e) => handleOtpInput(e.target.value, idx)}
                                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                                  className="w-10 h-12 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-center font-black text-lg text-neutral-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setShowOtpScreen(false);
                                setOtpCode(["", "", "", "", "", ""]);
                              }}
                              className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider hover:underline flex items-center gap-1.5 justify-center mx-auto cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Back to edit number
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Method 2: QR Code Scan */}
                    {paytmMethod === "qr" && (
                      <div className="flex flex-col items-center justify-center p-6 bg-neutral-50 border border-[#ECECEC] rounded-2xl text-center space-y-4">
                        <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm relative overflow-hidden group">
                          {/* Simulated Scanning Beam */}
                          <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500 shadow-md shadow-emerald-500/50 animate-scan-beam" />
                          <QrCode className="w-32 h-32 text-neutral-800" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-neutral-800">Scan QR Code using Paytm or any UPI App</p>
                          <p className="text-[10px] text-neutral-400 font-semibold mt-1">Transaction completes automatically after scan approval</p>
                        </div>
                      </div>
                    )}

                    {/* Bottom Authorization Footer */}
                    <div className="pt-4 border-t border-[#ECECEC] flex items-center justify-between gap-4">
                      <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                        <Lock className="w-3.5 h-3.5 text-neutral-400" /> Secure Gateway
                      </span>
                      <GlowButton variant="gradient" className="px-8 py-3.5 text-xs font-black shadow-md flex items-center gap-2 border-none" type="submit" magnetic={false}>
                        {showOtpScreen || paytmMethod === "qr" ? "Authorize Paytm" : "Proceed with OTP"} <ArrowRight className="w-4 h-4" />
                      </GlowButton>
                    </div>

                  </form>
                </div>
              )}

            </GlassCard>
          </div>

          {/* Right panel: Order summary details */}
          <div className="lg:col-span-5">
            <GlassCard className="p-6 md:p-8 rounded-[28px] border-[#ECECEC] bg-white shadow-lg space-y-6">
              <h3 className="text-lg font-black text-neutral-900 pb-3 border-b border-[#ECECEC] uppercase tracking-tight">Order Details</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-black text-neutral-800 capitalize">
                      ExamForge {planName} plan
                    </span>
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                      Selected Cycle: {cycle}
                    </span>
                  </div>
                  <span className="text-xs font-black text-neutral-900">₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-xs text-neutral-500 font-bold">
                  <span>Integrated GST (18%)</span>
                  <span>₹{gst}</span>
                </div>

                <div className="pt-4 border-t border-[#ECECEC] flex justify-between items-center">
                  <span className="text-sm font-black text-neutral-950 uppercase tracking-wider">Total Billed</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">₹{total}</span>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-3">
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">PCI Compliance</span>
                <p className="text-[9px] text-neutral-500 font-semibold leading-relaxed">
                  ExamForge secures transactional data using 256-bit AES cryptographic protocols. Card and account credentials are not persisted in our database systems.
                </p>
              </div>
            </GlassCard>
          </div>

        </div>

      </div>
    </PageLayout>
  );
}

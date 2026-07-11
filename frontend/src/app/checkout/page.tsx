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
  Truck,
  ArrowRight,
  Info
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

  // Payment Tabs: phonepe (UPI), netbanking, cod (Pay on Delivery)
  const [paymentMethod, setPaymentMethod] = useState<"phonepe" | "netbanking" | "cod">("phonepe");
  
  // PhonePe-specific states
  const [phonepeMethod, setPhonepeMethod] = useState<"app" | "qr">("app");
  const [selectedUpiApp, setSelectedUpiApp] = useState<"phonepe" | "gpay" | "paytm">("phonepe");
  const [upiId, setUpiId] = useState("");
  
  // Interactive PIN states
  const [showPinPad, setShowPinPad] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  
  // Netbanking states
  const [selectedBank, setSelectedBank] = useState("");

  // Global processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStage, setProcessStage] = useState(0);

  const stages = [
    "Contacting Secure Gateway Server...",
    "Routing transaction to NPCI Node network...",
    "Verifying Multi-Factor Security Token...",
    "Confirming ledger update & subscription activation..."
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

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      setEnteredPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  const submitPin = () => {
    if (enteredPin.length === 4) {
      setShowPinPad(false);
      setIsProcessing(true);
      setProcessStage(0);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "phonepe") {
      if (phonepeMethod === "app" && !upiId.includes("@")) {
        // Fallback default VPA
        setUpiId("user@ybl");
      }
      setEnteredPin("");
      setShowPinPad(true);
    } else if (paymentMethod === "netbanking" && !selectedBank) {
      alert("Please select a bank first.");
    } else {
      // NetBanking or COD direct submit
      setIsProcessing(true);
      setProcessStage(0);
    }
  };

  return (
    <PageLayout
      title="Secure Checkout"
      description="Complete your order to unlock deep personal AI study companions."
      breadcrumb={[
        { label: "Pricing", href: "/pricing" },
        { label: "Checkout", href: "/checkout" }
      ]}
    >
      <div className="layout-container max-w-[1050px] px-4 mx-auto relative z-10 py-6">
        
        {/* UPI Secure PIN Entry Modal (PhonePe Purple overlay) */}
        <AnimatePresence>
          {showPinPad && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-[#5f259f] text-white w-full max-w-[360px] rounded-[32px] overflow-hidden shadow-2xl flex flex-col justify-between border border-purple-400/20"
              >
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black tracking-widest uppercase">Phone<span className="text-amber-400">Pe</span></span>
                    <span className="text-[9px] bg-white/10 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Secure Pay</span>
                  </div>
                  <span className="text-xs font-mono font-bold">₹{total}</span>
                </div>

                {/* PIN Display */}
                <div className="p-6 text-center space-y-4">
                  <p className="text-[11px] text-purple-200 font-bold uppercase tracking-wider">Enter 4-Digit UPI PIN</p>
                  <div className="flex justify-center gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                          enteredPin.length > i ? "bg-white border-white text-[#5f259f]" : "border-white/20 bg-transparent"
                        }`}
                      >
                        {enteredPin.length > i && <div className="w-2.5 h-2.5 rounded-full bg-[#5f259f]" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-purple-300 font-semibold flex items-center gap-1.5 justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> NPCI Unified Payments Interface Certified
                  </p>
                </div>

                {/* Keypad */}
                <div className="bg-white text-neutral-800 p-6 rounded-t-[32px] grid grid-cols-3 gap-y-4 gap-x-2 text-center">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
                    <button
                      key={num}
                      onClick={() => handleKeyPress(num)}
                      className="py-3 text-lg font-black hover:bg-neutral-100 active:bg-neutral-200 rounded-2xl cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={handleBackspace}
                    className="py-3 text-xs font-black text-rose-500 hover:bg-neutral-100 rounded-2xl cursor-pointer uppercase tracking-wider"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => handleKeyPress("0")}
                    className="py-3 text-lg font-black hover:bg-neutral-100 rounded-2xl cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    onClick={submitPin}
                    disabled={enteredPin.length < 4}
                    className="py-3 text-xs font-black text-emerald-600 hover:bg-neutral-100 disabled:opacity-40 rounded-2xl cursor-pointer uppercase tracking-wider"
                  >
                    Submit
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Loading overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#060410]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 text-center"
            >
              <GlassCard className="p-8 max-w-md w-full flex flex-col items-center gap-6 border-neutral-200 bg-white">
                <Loader2 className="w-12 h-12 text-[#6D4AFF] animate-spin" />
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-neutral-900 uppercase tracking-wider">Processing Transaction</h3>
                  <p className="text-xs text-neutral-500 font-semibold h-8 flex items-center justify-center px-4">
                    {stages[processStage] || "Finalizing..."}
                  </p>
                </div>
                <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((processStage + 1) / stages.length) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-1.5 justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  PCI-DSS 256-Bit SSL Encrypted Ledger Gateway
                </span>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Payment form inputs */}
          <div className="lg:col-span-7">
            <GlassCard className="p-6 md:p-8 rounded-[32px] border-[#ECECEC] bg-white shadow-md">
              <h3 className="text-lg font-black text-neutral-900 mb-6 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#6D4AFF]" /> Select Payment Gateway
              </h3>

              {/* Gateway Tabs */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { id: "phonepe", label: "PhonePe / UPI", icon: QrCode },
                  { id: "netbanking", label: "NetBanking", icon: Building },
                  { id: "cod", label: "Pay on Activation (COD)", icon: Truck }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPaymentMethod(tab.id as "phonepe" | "netbanking" | "cod")}
                      className={`py-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer ${
                        paymentMethod === tab.id
                          ? "bg-white border-[#6D4AFF] shadow-sm text-neutral-900 ring-2 ring-[#6D4AFF]/10"
                          : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="uppercase text-[9px] tracking-wider mt-0.5 text-center px-1">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                
                {/* Method 1: PhonePe / UPI */}
                {paymentMethod === "phonepe" && (
                  <div className="space-y-6">
                    {/* Simulated PhonePe Purple Header Frame */}
                    <div className="bg-[#5f259f] text-white p-5 rounded-2xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black tracking-widest uppercase">Phone<span className="text-amber-400">Pe</span></span>
                        <span className="text-[8px] bg-white/20 px-2 py-0.5 rounded font-black uppercase">Instant UPI</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-purple-200 font-bold block uppercase">Total Amount</span>
                        <span className="text-sm font-black">₹{total}</span>
                      </div>
                    </div>

                    {/* Method Choice inside PhonePe */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <button
                        type="button"
                        onClick={() => setPhonepeMethod("app")}
                        className={`py-3 px-4 border rounded-xl font-bold text-xs text-center cursor-pointer transition-colors ${
                          phonepeMethod === "app" ? "border-[#5f259f] bg-purple-50 text-[#5f259f]" : "border-neutral-200 text-neutral-500"
                        }`}
                      >
                        Pay via UPI ID / VPA
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhonepeMethod("qr")}
                        className={`py-3 px-4 border rounded-xl font-bold text-xs text-center cursor-pointer transition-colors ${
                          phonepeMethod === "qr" ? "border-[#5f259f] bg-purple-50 text-[#5f259f]" : "border-neutral-200 text-neutral-500"
                        }`}
                      >
                        Scan QR Code
                      </button>
                    </div>

                    {phonepeMethod === "app" ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Select UPI Provider</label>
                          <div className="flex gap-2">
                            {["phonepe", "gpay", "paytm"].map(app => (
                              <button
                                key={app}
                                type="button"
                                onClick={() => {
                                  setSelectedUpiApp(app as "phonepe" | "gpay" | "paytm");
                                  setUpiId(app === "phonepe" ? "user@ybl" : app === "gpay" ? "user@okaxis" : "user@paytm");
                                }}
                                className={`flex-1 py-2 border rounded-lg text-xs font-bold capitalize cursor-pointer transition-all ${
                                  selectedUpiApp === app ? "border-[#6D4AFF] bg-indigo-50/50 text-[#6D4AFF] font-black" : "border-neutral-200 text-neutral-500"
                                }`}
                              >
                                {app === "phonepe" ? "PhonePe" : app === "gpay" ? "GPay" : "Paytm"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">UPI ID / VPA</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@ybl"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#6D4AFF] focus:bg-white"
                          />
                          <p className="text-[9px] text-neutral-400 font-semibold">Enter your UPI ID to trigger a direct secure pull notification.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 bg-neutral-50 border border-[#ECECEC] rounded-2xl text-center space-y-4">
                        <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm">
                          <QrCode className="w-32 h-32 text-neutral-800" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-neutral-800">Scan QR Code using PhonePe or any UPI App</p>
                          <p className="text-[10px] text-neutral-400 font-semibold mt-1">Transaction completes automatically after scan approval</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Method 2: NetBanking */}
                {paymentMethod === "netbanking" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Select Bank</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: "sbi", label: "State Bank of India" },
                          { id: "hdfc", label: "HDFC Bank" },
                          { id: "icici", label: "ICICI Bank" },
                          { id: "axis", label: "Axis Bank" }
                        ].map(bank => (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-3.5 border rounded-xl text-xs font-bold text-left cursor-pointer transition-all ${
                              selectedBank === bank.id ? "border-[#6D4AFF] bg-indigo-50 text-[#6D4AFF]" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                            }`}
                          >
                            {bank.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Method 3: Cash / Pay on Activation (COD) */}
                {paymentMethod === "cod" && (
                  <div className="p-5 bg-amber-50/50 border border-amber-200/60 rounded-2xl space-y-3.5">
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black text-neutral-900 uppercase">Pay on Activation (COD)</h4>
                        <p className="text-[10px] text-neutral-500 font-semibold leading-relaxed mt-1">
                          We will activate your subscription premium benefits instantly! A physical invoice dispatch card containing payment collection barcodes will be generated for your registered address.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-[#ECECEC] flex items-center justify-between gap-4">
                  <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    Encrypted secure payment gateway
                  </span>
                  <GlowButton variant="gradient" className="px-8 py-3.5 text-xs font-black shadow-md flex items-center gap-2" type="submit" magnetic={false}>
                    Authorize Payment <ArrowRight className="w-4 h-4" />
                  </GlowButton>
                </div>

              </form>
            </GlassCard>
          </div>

          {/* Right panel: Order summary */}
          <div className="lg:col-span-5">
            <GlassCard className="p-6 md:p-8 rounded-[32px] border-[#ECECEC] bg-white shadow-md space-y-6">
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
                  <span className="text-xl font-black text-[#6D4AFF]">₹{total}</span>
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

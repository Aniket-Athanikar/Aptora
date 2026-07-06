// "use client";

// import { motion } from "framer-motion";
// import { 
//   BookOpen, 
//   FileCheck, 
//   Award, 
//   Flame, 
//   ArrowRight,
//   TrendingUp,
//   BarChart3
// } from "lucide-react";
// import GlassCard from "../ui/GlassCard";

// export default function HeroDashboard() {
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ delay: 0.4, duration: 0.8 }}
//       className="relative w-full max-w-[620px] mx-auto z-20 hover:shadow-2xl transition-shadow duration-500 rounded-3xl"
//       style={{ perspective: 1000 }}
//     >
//       {/* Background glow behind dashboard */}
//       <div className="absolute -inset-2 bg-gradient-to-r from-[#6D4AFF]/20 to-[#8B5CF6]/20 rounded-[28px] blur-2xl opacity-70 group-hover:opacity-100 transition duration-1000" />
      
//       <GlassCard className="relative p-6 md:p-8 bg-white/70 border border-white/80 rounded-3xl shadow-xl flex flex-col gap-6 overflow-hidden">
//         {/* Dashboard Header */}
//         <div className="flex items-center justify-between pb-4 border-b border-[#ECECEC]">
//           <div>
//             <span className="text-[10px] font-bold text-[#6D4AFF] tracking-wider uppercase">ExamForge Workspace</span>
//             <h3 className="text-xl font-bold text-neutral-900 mt-0.5">Welcome back, Rahul!</h3>
//             <p className="text-xs text-neutral-500 font-medium">Keep learning, keep growing.</p>
//           </div>
//           <div className="flex items-center gap-2 px-3 py-1.5 bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 rounded-full">
//             <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
//             <span className="text-xs font-bold text-neutral-800">12 Days Streak</span>
//           </div>
//         </div>

//         {/* 4 Stats Grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//           {[
//             { label: "Books Uploaded", value: "24", icon: BookOpen, color: "text-[#6D4AFF] bg-[#6D4AFF]/5" },
//             { label: "Questions Practiced", value: "1,248", icon: FileCheck, color: "text-emerald-500 bg-emerald-500/5" },
//             { label: "Mock Tests", value: "15", icon: Award, color: "text-[#4F46E5] bg-[#4F46E5]/5" },
//             { label: "Accuracy Rate", value: "82%", icon: TrendingUp, color: "text-[#A855F7] bg-[#A855F7]/5" },
//           ].map((item, idx) => (
//             <div key={idx} className="bg-white/60 border border-[#ECECEC] p-3 rounded-2xl flex flex-col gap-2">
//               <div className="flex items-center justify-between">
//                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{item.label}</span>
//                 <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${item.color}`}>
//                   <item.icon className="w-3.5 h-3.5" />
//                 </div>
//               </div>
//               <span className="text-lg font-black text-neutral-900 leading-none">{item.value}</span>
//             </div>
//           ))}
//         </div>

//         {/* Today's Goal Progress */}
//         <div className="bg-white/60 border border-[#ECECEC] p-4 rounded-2xl flex flex-col gap-3">
//           <div className="flex items-center justify-between text-xs">
//             <span className="font-bold text-neutral-800">Today&apos;s Practice Goal</span>
//             <span className="font-bold text-[#6D4AFF]">80 / 120 Questions</span>
//           </div>
//           <div className="w-full h-2.5 bg-[#ECECEC] rounded-full overflow-hidden">
//             <div className="h-full bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] rounded-full w-[66.6%]" />
//           </div>
//         </div>

//         {/* Action Widgets */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {/* Continue Learning */}
//           <div className="bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 p-4 rounded-2xl flex flex-col justify-between gap-4">
//             <div className="flex flex-col gap-1">
//               <span className="text-[10px] font-bold text-[#6D4AFF] tracking-wider uppercase">Active Study</span>
//               <h4 className="font-extrabold text-neutral-900 text-sm">Indian Polity</h4>
//               <p className="text-[11px] text-neutral-500 font-medium">Chapter 4: Fundamental Rights</p>
//             </div>
//             <div>
//               <div className="flex justify-between text-[10px] font-bold mb-1">
//                 <span>Progress</span>
//                 <span>45%</span>
//               </div>
//               <div className="w-full h-1.5 bg-[#6D4AFF]/10 rounded-full mb-3 overflow-hidden">
//                 <div className="h-full bg-[#6D4AFF] rounded-full w-[45%]" />
//               </div>
//               <button className="w-full py-2 bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/10 flex items-center justify-center gap-1">
//                 Resume Session <ArrowRight className="w-3 h-3" />
//               </button>
//             </div>
//           </div>

//           {/* AI Recommendation */}
//           <div className="bg-white/80 border border-[#ECECEC] p-4 rounded-2xl flex flex-col justify-between gap-4">
//             <div className="flex flex-col gap-1">
//               <div className="flex items-center gap-1">
//                 <span className="text-[10px] font-bold text-[#A855F7] tracking-wider uppercase">AI Recommendation</span>
//               </div>
//               <h4 className="font-extrabold text-neutral-900 text-sm">Target Weak Areas</h4>
//               <p className="text-[11px] text-neutral-600 font-medium leading-relaxed">
//                 Focus on Directive Principles of State Policy (DPSP) to boost score by <span className="text-emerald-600 font-bold">+12%</span>.
//               </p>
//             </div>
//             <button className="w-full py-2 border border-[#ECECEC] hover:border-neutral-300 bg-white text-neutral-800 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1 transition-colors">
//               Start Recommended Test <BarChart3 className="w-3.5 h-3.5 text-[#6D4AFF]" />
//             </button>
//           </div>
//         </div>
//       </GlassCard>
//     </motion.div>
//   );
// }

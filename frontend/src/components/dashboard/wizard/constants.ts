import * as LucideIcons from "lucide-react";

export const PRESET_EXAMS = [
  { name: "UPSC CSE", category: "Civil Services", color: "from-amber-500 to-orange-600", icon: "FileText", glow: "rgba(245, 158, 11, 0.1)" },
  { name: "State PSC", category: "Civil Services", color: "from-orange-500 to-red-600", icon: "Building", glow: "rgba(239, 68, 68, 0.1)" },
  { name: "JEE Advanced", category: "Engineering", color: "from-blue-500 to-indigo-600", icon: "Atom", glow: "rgba(79, 70, 229, 0.1)" },
  { name: "NEET UG", category: "Medical", color: "from-emerald-500 to-teal-600", icon: "Activity", glow: "rgba(16, 185, 129, 0.1)" },
  { name: "CAT", category: "Management", color: "from-pink-500 to-rose-600", icon: "TrendingUp", glow: "rgba(244, 63, 94, 0.1)" },
  { name: "GATE", category: "Engineering", color: "from-purple-500 to-violet-600", icon: "Settings", glow: "rgba(139, 92, 246, 0.1)" },
  { name: "SSC CGL", category: "Government", color: "from-cyan-500 to-blue-600", icon: "Briefcase", glow: "rgba(6, 182, 212, 0.1)" },
  { name: "Banking PO", category: "Government", color: "from-sky-500 to-indigo-600", icon: "Landmark", glow: "rgba(14, 165, 233, 0.1)" },
];

export const PRESET_SUBJECTS: Record<string, string[]> = {
  "UPSC CSE": ["Indian Polity", "History & Culture", "Geography", "Indian Economy", "Environment & Ecology", "Science & Tech", "CSAT & Logic"],
  "State PSC": ["State History", "Polity & Governance", "Geography", "Economy & Development", "General Mental Ability"],
  "JEE Advanced": ["Physics", "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Mathematics"],
  "NEET UG": ["Biology (Botany)", "Biology (Zoology)", "Physics", "Chemistry"],
  "CAT": ["Quantitative Aptitude", "Data Interpretation", "Logical Reasoning", "Verbal Ability & RC"],
  "GATE": ["Engineering Mathematics", "General Aptitude", "Core Technical Subject 1", "Core Technical Subject 2"],
  "SSC CGL": ["Quantitative Aptitude", "General Intelligence & Reasoning", "English Language", "General Awareness"],
  "Banking PO": ["Quantitative Aptitude", "Reasoning Ability", "English Language", "General Financial Awareness"],
  "default": ["General Knowledge", "Analytical Reasoning", "Quantitative Ability", "Verbal Ability"]
};

export const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe"
];

export const STEP_HEADERS = [
  { id: 1, label: "Target" },
  { id: 2, label: "Profile" },
  { id: 3, label: "Timeline" },
  { id: 4, label: "Lifestyle" },
  { id: 5, label: "Focus" },
  { id: 6, label: "Weakness" },
  { id: 7, label: "Projections" }
];

export const STEP_COLORS: Record<number, { glowLeft: string; glowRight: string; shadow: string; gradient: string; glowBtn: string }> = {
  1: { glowLeft: "bg-[#6D4AFF]/12", glowRight: "bg-[#0EA5E9]/12", shadow: "shadow-[0_24px_85px_rgba(109,74,255,0.18)]", gradient: "from-[#6D4AFF] to-[#0EA5E9]", glowBtn: "rgba(109,74,255,0.3)" },
  2: { glowLeft: "bg-[#10B981]/12", glowRight: "bg-[#14B8A6]/12", shadow: "shadow-[0_24px_85px_rgba(16,185,129,0.15)]", gradient: "from-[#10B981] to-[#14B8A6]", glowBtn: "rgba(16,185,129,0.3)" },
  3: { glowLeft: "bg-[#F59E0B]/12", glowRight: "bg-[#F97316]/12", shadow: "shadow-[0_24px_85px_rgba(245,158,11,0.15)]", gradient: "from-[#F59E0B] to-[#F97316]", glowBtn: "rgba(245,158,11,0.3)" },
  4: { glowLeft: "bg-[#F43F5E]/12", glowRight: "bg-[#D946EF]/12", shadow: "shadow-[0_24px_85px_rgba(244,63,94,0.15)]", gradient: "from-[#F43F5E] to-[#D946EF]", glowBtn: "rgba(244,63,94,0.3)" },
  5: { glowLeft: "bg-[#0EA5E9]/12", glowRight: "bg-[#06B6D4]/12", shadow: "shadow-[0_24px_85px_rgba(14,165,233,0.15)]", gradient: "from-[#0EA5E9] to-[#06B6D4]", glowBtn: "rgba(14,165,233,0.3)" },
  6: { glowLeft: "bg-[#EF4444]/12", glowRight: "bg-[#F43F5E]/12", shadow: "shadow-[0_24px_85px_rgba(239,68,68,0.15)]", gradient: "from-[#EF4444] to-[#F43F5E]", glowBtn: "rgba(239,68,68,0.3)" },
  7: { glowLeft: "bg-[#EAB308]/15", glowRight: "bg-[#F59E0B]/15", shadow: "shadow-[0_24px_85px_rgba(234,179,8,0.2)]", gradient: "from-[#EAB308] to-[#F59E0B]", glowBtn: "rgba(234,179,8,0.4)" }
};

export const getStepStyles = (currentStep: number) => {
  return {
    cardBg: currentStep === 1 ? "bg-indigo-50/20 border-indigo-200/30"
      : currentStep === 2 ? "bg-emerald-50/30 border-emerald-200/40"
        : currentStep === 3 ? "bg-amber-50/30 border-amber-200/40"
          : currentStep === 4 ? "bg-rose-50/30 border-rose-200/40"
            : currentStep === 5 ? "bg-sky-50/30 border-sky-200/40"
              : currentStep === 6 ? "bg-red-50/30 border-red-200/40"
                : "bg-yellow-50/30 border-yellow-250/40",

    badgeBg: currentStep === 1 ? "bg-indigo-100/60 text-indigo-850 border-indigo-200/30"
      : currentStep === 2 ? "bg-emerald-100/60 text-emerald-700 border-emerald-200/40"
        : currentStep === 3 ? "bg-amber-100/60 text-amber-700 border-amber-200/40"
          : currentStep === 4 ? "bg-rose-100/60 text-rose-700 border-rose-200/40"
            : currentStep === 5 ? "bg-sky-100/60 text-sky-700 border-sky-200/40"
              : currentStep === 6 ? "bg-red-100/60 text-red-700 border-red-200/40"
                : "bg-yellow-100/60 text-yellow-800 border-yellow-250/40",

    accentText: currentStep === 1 ? "text-indigo-600 font-bold"
      : currentStep === 2 ? "text-emerald-700"
        : currentStep === 3 ? "text-amber-700"
          : currentStep === 4 ? "text-rose-700"
            : currentStep === 5 ? "text-sky-700"
              : currentStep === 6 ? "text-red-700"
                : "text-yellow-700",

    focusBorder: currentStep === 1 ? "focus:border-indigo-500 focus:ring-indigo-500/10"
      : currentStep === 2 ? "focus:border-emerald-500 focus:ring-emerald-500/10"
        : currentStep === 3 ? "focus:border-amber-500 focus:ring-amber-500/10"
          : currentStep === 4 ? "focus:border-rose-500 focus:ring-rose-500/10"
            : currentStep === 5 ? "focus:border-sky-500 focus:ring-sky-500/10"
              : currentStep === 6 ? "focus:border-red-500 focus:ring-red-500/10"
                : "focus:border-yellow-500 focus:ring-yellow-500/10",

    btnBg: currentStep === 1 ? "bg-indigo-600 hover:bg-indigo-700 text-white"
      : currentStep === 2 ? "bg-emerald-600 hover:bg-emerald-700 text-white"
        : currentStep === 3 ? "bg-amber-600 hover:bg-amber-700 text-white"
          : currentStep === 4 ? "bg-rose-600 hover:bg-rose-700 text-white"
            : currentStep === 5 ? "bg-sky-600 hover:bg-sky-700 text-white"
              : currentStep === 6 ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:brightness-105",

    activeSelectionCard: currentStep === 1 ? "border-indigo-500 bg-indigo-50/40 text-indigo-950 shadow-[0_4px_20px_rgba(99,102,241,0.08)] scale-[1.01]"
      : currentStep === 2 ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-[0_4px_20px_rgba(16,185,129,0.08)] scale-[1.01]"
        : currentStep === 3 ? "border-amber-600 bg-amber-50/50 text-amber-900 shadow-[0_4px_20px_rgba(245,158,11,0.08)] scale-[1.01]"
          : currentStep === 4 ? "border-rose-600 bg-rose-50/50 text-rose-900 shadow-[0_4px_20px_rgba(244,63,94,0.08)] scale-[1.01]"
            : currentStep === 5 ? "border-sky-600 bg-sky-50/50 text-sky-900 shadow-[0_4px_20px_rgba(14,165,233,0.08)] scale-[1.01]"
              : currentStep === 6 ? "border-red-600 bg-red-50/50 text-red-900 shadow-[0_4px_20px_rgba(239,68,68,0.08)] scale-[1.01]"
                : "border-yellow-500 bg-yellow-50/50 text-yellow-900 shadow-[0_4px_20px_rgba(234,179,8,0.1)] scale-[1.01]",

    backBtnHover: currentStep === 1 ? "hover:text-indigo-600 hover:border-indigo-300"
      : currentStep === 2 ? "hover:text-emerald-700 hover:border-emerald-300"
        : currentStep === 3 ? "hover:text-amber-700 hover:border-amber-300"
          : currentStep === 4 ? "hover:text-rose-700 hover:border-rose-300"
            : currentStep === 5 ? "hover:text-sky-700 hover:border-sky-300"
              : currentStep === 6 ? "hover:text-red-700 hover:border-red-300"
                : "hover:text-yellow-700 hover:border-yellow-300"
  };
};
